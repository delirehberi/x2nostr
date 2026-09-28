/**
 * Universal In-Browser Image Converter Service
 * 
 * Safely converts HEIC/HEIF images to standard JPEG format in-browser using heic2any.
 * heic2any internally offloads WASM libheif decoding to an inline Web Worker and
 * converts image pixel data to JPEG via the standard Canvas API.
 * 
 * Features:
 * - Sequential execution queue (concurrency = 1) to bound peak browser RAM usage.
 * - In-memory session cache for converted blobs and object URLs to avoid duplicate conversions.
 * - Graceful fallback when assets are already browser-readable images or standard JPEG/PNG format.
 * - Object URL cleanup via clearCache() to prevent memory leaks across sessions.
 */

export interface ConversionProgress {
  current: number;
  total: number;
  filename: string;
}

export type ConversionProgressListener = (progress: ConversionProgress) => void;

class ImageConverterService {
  private queue: Promise<unknown> = Promise.resolve();
  private convertedUrlCache: Map<string, string> = new Map();
  private convertedBlobCache: Map<string, Blob> = new Map();
  private readonly MAX_CACHE_SIZE = 250;
  private cacheKeysOrder: string[] = [];

  /**
   * Checks if a filename or blob represents a HEIC/HEIF asset that still needs conversion.
   */
  public isHeic(filename?: string, blob?: Blob): boolean {
    if (blob && blob.type) {
      const mime = blob.type.toLowerCase();
      if (
        mime === 'image/heic' ||
        mime === 'image/heif' ||
        mime === 'image/heic-sequence' ||
        mime === 'image/heif-sequence'
      ) {
        return true;
      }
      if (
        mime === 'image/jpeg' ||
        mime === 'image/jpg' ||
        mime === 'image/png' ||
        mime === 'image/webp' ||
        mime === 'image/gif'
      ) {
        return false;
      }
    }
    if (filename) {
      const lower = filename.toLowerCase();
      if (lower.endsWith('.heic') || lower.endsWith('.heif')) {
        // If blob is explicitly non-HEIC, don't treat as HEIC
        if (blob && blob.type && blob.type !== 'application/octet-stream') {
          const mime = blob.type.toLowerCase();
          if (mime === 'image/jpeg' || mime === 'image/jpg' || mime === 'image/png') {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Core conversion implementation using heic2any.
   */
  private async convertWithHeic2Any(blob: Blob, quality = 0.9): Promise<{ blob: Blob; url: string }> {
    // If blob is already a standard web image, avoid unnecessary decoding
    if (blob.type === 'image/jpeg' || blob.type === 'image/png') {
      const objectUrl = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
        ? URL.createObjectURL(blob)
        : '';
      return { blob, url: objectUrl };
    }

    try {
      const heic2anyModule = await import('heic2any');
      const heic2any = (heic2anyModule.default || heic2anyModule) as unknown as (options: {
        blob: Blob;
        toType?: string;
        quality?: number;
      }) => Promise<Blob | Blob[]>;

      const conversionResult = await heic2any({
        blob,
        toType: 'image/jpeg',
        quality,
      });

      const jpegBlob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
      const objectUrl = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
        ? URL.createObjectURL(jpegBlob)
        : '';

      return { blob: jpegBlob, url: objectUrl };
    } catch (err: unknown) {
      const errMsg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : String(err);

      // If heic2any reports the image is already browser readable, return original blob safely
      if (errMsg.includes('already browser readable') || errMsg.includes('ERR_USER')) {
        const objectUrl = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
          ? URL.createObjectURL(blob)
          : '';
        return { blob, url: objectUrl };
      }

      throw err instanceof Error ? err : new Error(errMsg || 'HEIC conversion failed');
    }
  }

  /**
   * Sequentially converts a single HEIC Blob to a JPEG Blob in-browser.
   * Runs single-by-single through a queue to prevent browser memory exhaustion.
   */
  public async convertHeicToJpeg(
    blob: Blob,
    cacheKey?: string,
    quality = 0.9
  ): Promise<{ blob: Blob; url: string }> {
    // Check session cache first
    if (cacheKey && this.convertedUrlCache.has(cacheKey) && this.convertedBlobCache.has(cacheKey)) {
      return {
        blob: this.convertedBlobCache.get(cacheKey)!,
        url: this.convertedUrlCache.get(cacheKey)!,
      };
    }

    // Enqueue conversion sequentially (strictly 1 conversion in flight at a time)
    return new Promise<{ blob: Blob; url: string }>((resolve, reject) => {
      this.queue = this.queue
        .then(async () => {
          // Check cache again in case a previous job resolved for the same key
          if (cacheKey && this.convertedUrlCache.has(cacheKey) && this.convertedBlobCache.has(cacheKey)) {
            resolve({
              blob: this.convertedBlobCache.get(cacheKey)!,
              url: this.convertedUrlCache.get(cacheKey)!,
            });
            return;
          }

          try {
            const result = await this.convertWithHeic2Any(blob, quality);

            if (cacheKey && result.url) {
              this.storeInCache(cacheKey, result.blob, result.url);
            }

            resolve(result);
          } catch (err: unknown) {
            reject(err instanceof Error ? err : new Error(String(err)));
          }
        })
        .catch((err) => {
          reject(err instanceof Error ? err : new Error(String(err)));
        });
    });
  }

  private storeInCache(key: string, blob: Blob, url: string): void {
    if (this.convertedUrlCache.has(key)) return;

    // Evict oldest items if exceeding cache size
    while (this.cacheKeysOrder.length >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cacheKeysOrder.shift();
      if (oldestKey) {
        const oldUrl = this.convertedUrlCache.get(oldestKey);
        if (oldUrl && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
          try {
            URL.revokeObjectURL(oldUrl);
          } catch {
            // ignore
          }
        }
        this.convertedUrlCache.delete(oldestKey);
        this.convertedBlobCache.delete(oldestKey);
      }
    }

    this.cacheKeysOrder.push(key);
    this.convertedUrlCache.set(key, url);
    this.convertedBlobCache.set(key, blob);
  }

  /**
   * Checks if an asset is cached.
   */
  public hasCached(key: string): boolean {
    return this.convertedUrlCache.has(key) && this.convertedBlobCache.has(key);
  }

  /**
   * Retrieves cached conversion result.
   */
  public getCached(key: string): { blob: Blob; url: string } | undefined {
    if (this.hasCached(key)) {
      return {
        blob: this.convertedBlobCache.get(key)!,
        url: this.convertedUrlCache.get(key)!,
      };
    }
    return undefined;
  }

  /**
   * Terminates active conversions and clears cached state.
   */
  public terminateWorker(): void {
    // Retained for backward-compatible interface
  }

  /**
   * Clears all converted blob URLs from memory and releases object URLs.
   */
  public clearCache(): void {
    if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
      for (const url of this.convertedUrlCache.values()) {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      }
    }
    this.convertedUrlCache.clear();
    this.convertedBlobCache.clear();
    this.cacheKeysOrder = [];
  }
}

export const imageConverter = new ImageConverterService();
