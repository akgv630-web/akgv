/**
 * AKGV Infra City - Cloudflare R2 Object Storage Client Helper
 * Handles seamless uploads of Live Camera GPS evidence, profile avatars, and documents to Cloudflare R2.
 * Includes graceful offline / local sandbox fallback to Data URLs so features work in every environment.
 */

export interface R2UploadResult {
  success: boolean;
  url: string;
  key?: string;
  size?: number;
  type?: string;
  isFallback?: boolean;
  error?: string;
}

export interface R2UploadOptions {
  folder?: 'gps-evidence' | 'avatars' | 'payment-proofs' | 'plots' | 'documents' | string;
  fileName?: string;
}

/**
 * Converts a base64 Data URL to a binary Blob.
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(';base64,');
  const contentType = parts[0].split(':')[1] || 'image/jpeg';
  const raw = atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

/**
 * Converts a File or Blob into a base64 Data URL.
 */
export function fileToDataUrl(file: Blob | File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image, document, or live camera snapshot to Cloudflare R2.
 * Supports File, Blob, or base64 Data URL.
 */
export async function uploadToR2(
  input: File | Blob | string,
  options: R2UploadOptions = {}
): Promise<R2UploadResult> {
  const folder = options.folder || 'gps-evidence';

  try {
    // 1. If input is a Data URL string
    if (typeof input === 'string') {
      if (input.startsWith('data:')) {
        const res = await fetch('/api/r2/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dataUrl: input,
            folder,
            fileName: options.fileName,
          }),
        });

        const json = await res.json().catch(() => null);

        if (res.ok && json?.success) {
          return {
            success: true,
            url: json.url,
            key: json.key,
            size: json.size,
            type: json.type,
          };
        }

        // Graceful fallback to Data URL if R2 bucket is awaiting configuration in Cloudflare dashboard
        console.warn('[R2 Storage] Server notice:', json?.error || 'Awaiting R2 bucket binding.');
        return {
          success: false,
          url: input,
          isFallback: true,
          error: json?.error || 'Awaiting Cloudflare R2 bucket binding. Using high-resolution local storage fallback.',
        };
      }

      // If already a remote URL (http/https), return as is
      return {
        success: true,
        url: input,
      };
    }

    // 2. If input is a File or Blob
    const formData = new FormData();
    formData.append('file', input, options.fileName || (input instanceof File ? input.name : `capture-${Date.now()}.jpg`));
    formData.append('folder', folder);

    const res = await fetch('/api/r2/upload', {
      method: 'POST',
      body: formData,
    });

    const json = await res.json().catch(() => null);

    if (res.ok && json?.success) {
      return {
        success: true,
        url: json.url,
        key: json.key,
        size: json.size,
        type: json.type,
      };
    }

    // Fallback: convert file to Data URL so user never loses their uploaded photo
    const fallbackDataUrl = await fileToDataUrl(input);
    return {
      success: false,
      url: fallbackDataUrl,
      isFallback: true,
      error: json?.error || 'R2 bucket pending configuration. Stored as local image data.',
    };
  } catch (err: unknown) {
    console.warn('[R2 Storage] Network exception during upload:', err);

    let fallbackUrl = '';
    if (typeof input === 'string') {
      fallbackUrl = input;
    } else {
      try {
        fallbackUrl = await fileToDataUrl(input);
      } catch {
        fallbackUrl = '';
      }
    }

    return {
      success: false,
      url: fallbackUrl,
      isFallback: true,
      error: err instanceof Error ? err.message : 'Network error uploading to storage.',
    };
  }
}
