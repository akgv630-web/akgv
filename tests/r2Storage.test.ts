import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { uploadToR2, dataUrlToBlob } from '@/lib/r2Storage';

describe('Cloudflare R2 Object Storage Suite', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('converts base64 Data URL to binary Blob with correct MIME type', () => {
    // 1x1 transparent PNG data URL
    const pngDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const blob = dataUrlToBlob(pngDataUrl);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/png');
    expect(blob.size).toBeGreaterThan(0);
  });

  it('successfully uploads base64 Data URL to /api/r2/upload and returns CDN url', async () => {
    const mockCdnUrl = 'https://assets.akgv.pages.dev/gps-evidence/123456-plot-A-04.jpg';
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        key: 'gps-evidence/123456-plot-A-04.jpg',
        url: mockCdnUrl,
        size: 1024,
        type: 'image/jpeg',
      }),
    });

    const testDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/';
    const result = await uploadToR2(testDataUrl, { folder: 'gps-evidence', fileName: 'plot-A-04.jpg' });

    expect(result.success).toBe(true);
    expect(result.url).toBe(mockCdnUrl);
    expect(result.key).toBe('gps-evidence/123456-plot-A-04.jpg');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/r2/upload',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('gracefully falls back to Data URL when R2 is in AWAITING_CONFIG status without throwing', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({
        success: false,
        status: 'AWAITING_CONFIG',
        error: 'Cloudflare R2 ASSETS_BUCKET binding is not configured.',
      }),
    });

    const testDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/';
    const result = await uploadToR2(testDataUrl, { folder: 'gps-evidence' });

    expect(result.success).toBe(false);
    expect(result.isFallback).toBe(true);
    expect(result.url).toBe(testDataUrl);
    expect(result.error).toContain('Cloudflare R2');
  });

  it('handles remote http/https URLs directly without re-uploading', async () => {
    const remoteUrl = 'https://example.com/already-uploaded.jpg';
    const result = await uploadToR2(remoteUrl);
    expect(result.success).toBe(true);
    expect(result.url).toBe(remoteUrl);
  });
});
