/**
 * Universal In-Browser Image Converter Service
 * 
 * Offloads HEIC/HEIF decoding to a dedicated background Web Worker to keep the UI
 * completely responsive (60fps) and prevent main-thread freezing.
 * 
 * Features:
 * - Single-by-single sequential execution (concurrency = 1) to bound peak RAM.
 * - Automatic Worker recycling (after N conversions) to force the browser engine
 *   and OS to reclaim WebAssembly (libheif) linear memory.
 * - Micro LRU object URL cache (max 5 items) with automatic URL.revokeObjectURL().
 * - Graceful fallback to dynamic import for Node/Vitest environments.
 */

export interface ConversionProgress {
  current: number;
  total: number;
  filename: string;
}

export type ConversionProgressListener = (progress: ConversionProgress) => void;

interface PendingJob {
  id: string;
  blob: Blob;
  quality: number;
  resolve: (res: { blob: Blob; url: string }) => void;
  reject: (err: Error) => void;
}

class ImageConverterService {
  private queue: Promise<unknown> = Promise.resolve();
  private worker: Worker | null = null;
  private currentJob: PendingJob | null = null;
  private conversionsSinceRecycle = 0;
  private readonly MAX_CONVERSIONS_BEFORE_RECYCLE = 5;

  private convertedUrlCache: Map<string, string> = new Map();
  private convertedBlobCache: Map<string, Blob> = new Map();
  private readonly MAX_CACHE_SIZE = 5;
  private cacheKeysOrder: string[] = [];

  /**
   * Checks if a filename or blob represents a HEIC/HEIF asset.
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
    }
    if (filename) {
      const lower = filename.toLowerCase();
      return lower.endsWith('.heic') || lower.endsWith('.heif');
    }
    return false;
  }

  /**
   * Spawns or retrieves the dedicated Web Worker.
   */
  private getWorker(): Worker | null {
    if (typeof Worker === 'undefined') {
      return null;
    }

    if (!this.worker) {
      try {
        this.worker = new Worker(new URL('../workers/heic-worker.ts', import.meta.url), {
          type: 'module',
        });

        this.worker.onmessage = (e: MessageEvent) => {
          const { id, success, buffer, mimeType, error } = e.data;
          if (this.currentJob && this.currentJob.id === id) {
            const job = this.currentJob;
            this.currentJob = null;

            if (success && buffer) {
              const convertedBlob = new Blob([buffer], { type: mimeType || 'image/jpeg' });
              const objectUrl = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
                ? URL.createObjectURL(convertedBlob)
                : '';
              job.resolve({ blob: convertedBlob, url: objectUrl });
            } else {
              job.reject(new Error(error || 'Worker HEIC conversion failed.'));
            }
          }
        };

        this.worker.onerror = (err) => {
          console.error('[ImageConverterService] Worker error:', err);
          if (this.currentJob) {
            const job = this.currentJob;
            this.currentJob = null;
            job.reject(new Error('Web Worker encountered an unexpected error during conversion.'));
          }
          this.terminateWorker();
        };

        this.conversionsSinceRecycle = 0;
      } catch (err) {
        console.warn('[ImageConverterService] Could not instantiate Web Worker, falling back to main-thread conversion:', err);
        this.worker = null;
      }
    }

    return this.worker;
  }

  /**
   * Forcefully terminates and clears the Web Worker to release libheif WASM linear memory.
   */
  public terminateWorker(): void {
    if (this.worker) {
      try {
        this.worker.terminate();
      } catch {
        // ignore
      }
      this.worker = null;
    }
    this.conversionsSinceRecycle = 0;
    this.currentJob = null;
  }

  /**
   * Main-thread fallback conversion (for test environments or environments without Web Worker support).
   */
  private async convertMainThread(blob: Blob, quality = 0.9): Promise<{ blob: Blob; url: string }> {
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
  }

  /**
   * Sequentially converts a single HEIC Blob to a JPEG Blob in-browser.
   * Runs single-by-single in a background Web Worker with strict memory boundaries.
   */
  public async convertHeicToJpeg(
    blob: Blob,
    cacheKey?: string,
    quality = 0.9
  ): Promise<{ blob: Blob; url: string }> {
    // Check LRU cache first
    if (cacheKey && this.convertedUrlCache.has(cacheKey) && this.convertedBlobCache.has(cacheKey)) {
      return {
        blob: this.convertedBlobCache.get(cacheKey)!,
        url: this.convertedUrlCache.get(cacheKey)!,
      };
    }

    // Enqueue conversion sequentially (strictly 1 task in flight at any given time)
    return new Promise<{ blob: Blob; url: string }>((resolve, reject) => {
      this.queue = this.queue
        .then(async () => {
          try {
            const worker = this.getWorker();
            let result: { blob: Blob; url: string };

            if (worker) {
              const jobId = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
              result = await new Promise<{ blob: Blob; url: string }>((res, rej) => {
                this.currentJob = {
                  id: jobId,
                  blob,
                  quality,
                  resolve: res,
                  reject: rej,
                };
                worker.postMessage({ id: jobId, blob, quality });
              });

              this.conversionsSinceRecycle++;
              if (this.conversionsSinceRecycle >= this.MAX_CONVERSIONS_BEFORE_RECYCLE) {
                // Recycle worker to release WASM heap back to OS
                this.terminateWorker();
              }
            } else {
              result = await this.convertMainThread(blob, quality);
            }

            if (cacheKey && result.url) {
              this.storeInCache(cacheKey, result.blob, result.url);
            }

            resolve(result);
          } catch (err: unknown) {
            this.terminateWorker();
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

    // Evict oldest items if exceeding micro-cache size
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
   * Clears all converted blob URLs from memory and terminates active workers.
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
    this.terminateWorker();
  }
}

export const imageConverter = new ImageConverterService();
