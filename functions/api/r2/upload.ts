/**
 * Cloudflare Pages Function: /api/r2/upload
 * Purpose: Secure file and architectural asset upload & delivery handler for Cloudflare R2 storage.
 * Supports:
 *  - POST: Uploads files via multipart/form-data OR application/json (base64 Data URL)
 *  - GET: Directly serves uploaded images/assets by ?key=<objectKey>
 *  - OPTIONS: CORS preflight
 */

interface R2Object {
  body: ReadableStream;
  httpMetadata?: { contentType?: string };
  httpEtag?: string;
  etag?: string;
  writeHttpMetadata?(headers: Headers): void;
}

interface R2BucketBinding {
  put(key: string, value: ReadableStream | ArrayBuffer | ArrayBufferView | string, options?: any): Promise<any>;
  get(key: string): Promise<R2Object | null>;
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

/**
 * GET /api/r2/upload?key=<objectKey>
 * Directly streams object from R2 bucket so assets are instantly viewable even without a public custom domain.
 */
export async function onRequestGet(context: {
  request: Request;
  env: Record<string, any>;
}): Promise<Response> {
  const assetsBucket = (context.env.ASSETS_BUCKET || context.env.R2_BUCKET || context.env.BUCKET) as R2BucketBinding | undefined;
  const url = new URL(context.request.url);
  const key = url.searchParams.get('key');

  if (!assetsBucket) {
    return new Response(
      JSON.stringify({
        success: false,
        status: 'AWAITING_CONFIG',
        error:
          'Cloudflare R2 ASSETS_BUCKET binding is not configured. Please provision "akgv-infra-assets" bucket in Cloudflare dashboard and link the binding.',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  if (!key) {
    return new Response(
      JSON.stringify({ error: 'Missing required "key" query parameter.' }),
      { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  try {
    const object = await assetsBucket.get(key);
    if (!object) {
      return new Response(
        JSON.stringify({ error: `Object "${key}" was not found in storage.` }),
        { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const headers = new Headers();
    if (typeof object.writeHttpMetadata === 'function') {
      object.writeHttpMetadata(headers);
    } else if (object.httpMetadata?.contentType) {
      headers.set('Content-Type', object.httpMetadata.contentType);
    } else {
      headers.set('Content-Type', 'application/octet-stream');
    }

    headers.set('etag', object.httpEtag || object.etag || '');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(object.body, { headers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error retrieving file from Cloudflare R2.';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

/**
 * POST /api/r2/upload
 * Accepts multipart/form-data (File) OR application/json ({ dataUrl, folder, fileName }).
 */
export async function onRequestPost(context: {
  request: Request;
  env: Record<string, any>;
}): Promise<Response> {
  const assetsBucket = (context.env.ASSETS_BUCKET || context.env.R2_BUCKET || context.env.BUCKET) as R2BucketBinding | undefined;

  if (!assetsBucket) {
    return new Response(
      JSON.stringify({
        success: false,
        status: 'AWAITING_CONFIG',
        error:
          'Cloudflare R2 ASSETS_BUCKET binding is not configured. Please provision "akgv-infra-assets" bucket in Cloudflare dashboard and uncomment the binding in wrangler.toml.',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  try {
    const contentType = context.request.headers.get('content-type') || '';
    const requestOrigin = new URL(context.request.url).origin;
    const publicBase = context.env.R2_PUBLIC_URL || context.env.NEXT_PUBLIC_R2_PUBLIC_URL;

    let buffer: ArrayBuffer;
    let mimeType = 'application/octet-stream';
    let folder = 'uploads';
    let fileName = `file-${Date.now()}`;

    if (contentType.includes('application/json')) {
      const json = await context.request.json().catch(() => null) as {
        dataUrl?: string;
        folder?: string;
        fileName?: string;
      } | null;

      if (!json || !json.dataUrl) {
        return new Response(
          JSON.stringify({ error: 'Missing "dataUrl" parameter in JSON payload.' }),
          { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
      }

      folder = json.folder || 'live-camera';
      const match = json.dataUrl.match(/^data:([^;]+);base64,(.*)$/);
      if (!match) {
        return new Response(
          JSON.stringify({ error: 'Invalid base64 data URL format.' }),
          { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
      }

      mimeType = match[1];
      const base64Data = match[2];
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      buffer = bytes.buffer;

      let ext = 'jpg';
      if (mimeType.includes('png')) ext = 'png';
      else if (mimeType.includes('webp')) ext = 'webp';
      else if (mimeType.includes('pdf')) ext = 'pdf';

      fileName = json.fileName || `live-capture-${Date.now()}.${ext}`;
    } else {
      // multipart/form-data
      const formData = await context.request.formData();
      const file = formData.get('file') as File | null;
      folder = (formData.get('folder') as string) || 'uploads';

      if (!file) {
        return new Response(
          JSON.stringify({ error: 'No file provided in multipart form data.' }),
          { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
      }

      buffer = await file.arrayBuffer();
      mimeType = file.type || 'application/octet-stream';
      fileName = file.name || `upload-${Date.now()}`;
    }

    const timestamp = Date.now();
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectKey = `${folder}/${timestamp}-${safeFileName}`;

    await assetsBucket.put(objectKey, buffer, {
      httpMetadata: {
        contentType: mimeType,
      },
    });

    const publicUrl = publicBase
      ? `${publicBase.replace(/\/$/, '')}/${objectKey}`
      : `${requestOrigin}/api/r2/upload?key=${encodeURIComponent(objectKey)}`;

    return new Response(
      JSON.stringify({
        success: true,
        key: objectKey,
        url: publicUrl,
        size: buffer.byteLength,
        type: mimeType,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error uploading file to Cloudflare R2.';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
