/**
 * Cloudflare Pages Function: /api/r2/upload
 * Purpose: Secure file and architectural asset upload handler for Cloudflare R2 storage.
 * If ASSETS_BUCKET binding is provisioned in wrangler.toml / Cloudflare dashboard, stores asset directly.
 * If binding is pending owner provisioning, returns a structured status code with exact instructions.
 */

interface R2BucketBinding {
  put(key: string, value: ReadableStream | ArrayBuffer | string, options?: any): Promise<any>;
  get(key: string): Promise<any>;
}

export async function onRequestPost(context: {
  request: Request;
  env: Record<string, any>;
}): Promise<Response> {
  const assetsBucket = context.env.ASSETS_BUCKET as R2BucketBinding | undefined;

  if (!assetsBucket) {
    return new Response(
      JSON.stringify({
        success: false,
        status: 'AWAITING_CONFIG',
        error:
          'Cloudflare R2 ASSETS_BUCKET binding is not configured. Please provision "akgv-infra-assets" bucket in Cloudflare dashboard and uncomment the binding in wrangler.toml.',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const formData = await context.request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided in multipart form data.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectKey = `${folder}/${timestamp}-${safeFileName}`;

    await assetsBucket.put(objectKey, await file.arrayBuffer(), {
      httpMetadata: {
        contentType: file.type || 'application/octet-stream',
      },
    });

    const publicUrl = `https://assets.akgv.pages.dev/${objectKey}`;

    return new Response(
      JSON.stringify({
        success: true,
        key: objectKey,
        url: publicUrl,
        size: file.size,
        type: file.type,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error uploading file to Cloudflare R2.';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
