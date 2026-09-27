/**
 * Downloads a media binary (image/video) client-side with timeout and CORS detection.
 */
export async function downloadMediaBinary(mediaUrl: string): Promise<Blob> {
  if (!mediaUrl || !mediaUrl.startsWith('http')) {
    throw new Error(`Invalid media URL: "${mediaUrl}"`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(mediaUrl, {
      mode: 'cors',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fetching media binary`);
    }

    return await response.blob();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to download Instagram media asset: ${message}`);
  } finally {
    clearTimeout(timeoutId);
  }
}
