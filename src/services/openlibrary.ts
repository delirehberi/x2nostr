/**
 * Polite, rate-limited Open Library metadata resolver with in-memory caching
 */

export interface OpenLibraryBookMetadata {
  workKey?: string;
  editionKey?: string;
  coverUrl?: string;
  firstPublishYear?: number;
  pageCount?: number;
}

interface CacheEntry {
  timestamp: number;
  data: OpenLibraryBookMetadata | null;
}

class OpenLibraryService {
  private cache: Map<string, CacheEntry> = new Map();
  private queue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;
  private minIntervalMs = 350; // Respect Open Library API guidelines
  private lastRequestTime = 0;

  constructor() {
    this.initStorageCache();
  }

  private initStorageCache(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = sessionStorage.getItem('x2nostr_ol_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === 'object') {
          Object.entries(parsed).forEach(([k, v]) => {
            this.cache.set(k, { timestamp: Date.now(), data: v as OpenLibraryBookMetadata });
          });
        }
      }
    } catch {
      // Ignore cache restore errors
    }
  }

  private persistStorageCache(): void {
    if (typeof window === 'undefined') return;
    try {
      const plain: Record<string, OpenLibraryBookMetadata | null> = {};
      this.cache.forEach((val, key) => {
        plain[key] = val.data;
      });
      sessionStorage.setItem('x2nostr_ol_cache', JSON.stringify(plain));
    } catch {
      // Storage quota exceeded or unavailable
    }
  }

  private sanitizeIsbn(isbn?: string): string {
    if (!isbn) return '';
    return isbn.replace(/[^0-9X]/gi, '').trim();
  }

  public async resolveBook(
    isbn13?: string,
    isbn10?: string,
    title?: string,
    author?: string
  ): Promise<OpenLibraryBookMetadata | null> {
    const cleanIsbn13 = this.sanitizeIsbn(isbn13);
    const cleanIsbn10 = this.sanitizeIsbn(isbn10);
    const primaryKey = cleanIsbn13 || cleanIsbn10 || (title ? `${title.toLowerCase()}_${(author || '').toLowerCase()}` : '');

    if (!primaryKey) return null;

    // Check memory cache
    const cached = this.cache.get(primaryKey);
    if (cached) {
      return cached.data;
    }

    return new Promise((resolve) => {
      this.enqueue(async () => {
        try {
          const result = await this.fetchMetadata(cleanIsbn13, cleanIsbn10, title, author);
          this.cache.set(primaryKey, { timestamp: Date.now(), data: result });
          if (cleanIsbn13 && primaryKey !== cleanIsbn13) this.cache.set(cleanIsbn13, { timestamp: Date.now(), data: result });
          if (cleanIsbn10 && primaryKey !== cleanIsbn10) this.cache.set(cleanIsbn10, { timestamp: Date.now(), data: result });
          this.persistStorageCache();
          resolve(result);
        } catch {
          resolve(null);
        }
      });
    });
  }

  private enqueue(task: () => Promise<void>): void {
    this.queue.push(task);
    if (!this.isProcessingQueue) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) {
      this.isProcessingQueue = false;
      return;
    }

    this.isProcessingQueue = true;
    const task = this.queue.shift();

    if (task) {
      const now = Date.now();
      const timeSinceLast = now - this.lastRequestTime;
      const waitTime = Math.max(0, this.minIntervalMs - timeSinceLast);

      if (waitTime > 0) {
        await new Promise((r) => setTimeout(r, waitTime));
      }

      this.lastRequestTime = Date.now();
      try {
        await task();
      } catch (err) {
        console.warn('Open Library queue task failed:', err);
      }
    }

    // Process next item
    setTimeout(() => this.processQueue(), 50);
  }

  private async fetchMetadata(
    isbn13?: string,
    isbn10?: string,
    title?: string,
    author?: string
  ): Promise<OpenLibraryBookMetadata | null> {
    const isbn = isbn13 || isbn10;
    
    // 1. Try ISBN lookup
    if (isbn) {
      try {
        const url = `https://openlibrary.org/search.json?isbn=${encodeURIComponent(isbn)}&fields=key,cover_i,edition_key,first_publish_year,number_of_pages_median&limit=1`;
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (res.ok) {
          const json = await res.json();
          if (json.docs && json.docs.length > 0) {
            const doc = json.docs[0];
            const coverId = doc.cover_i;
            const coverUrl = coverId 
              ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
              : `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;

            return {
              workKey: doc.key,
              editionKey: Array.isArray(doc.edition_key) ? doc.edition_key[0] : undefined,
              coverUrl,
              firstPublishYear: doc.first_publish_year,
              pageCount: doc.number_of_pages_median,
            };
          }
        }
      } catch {
        // Fallback to title/author
      }
    }

    // 2. Try Title + Author search
    if (title) {
      try {
        const queryParams = new URLSearchParams({
          title,
          fields: 'key,cover_i,edition_key,first_publish_year,number_of_pages_median',
          limit: '1',
        });
        if (author) {
          queryParams.set('author', author);
        }

        const url = `https://openlibrary.org/search.json?${queryParams.toString()}`;
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (res.ok) {
          const json = await res.json();
          if (json.docs && json.docs.length > 0) {
            const doc = json.docs[0];
            const coverId = doc.cover_i;
            const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : undefined;

            return {
              workKey: doc.key,
              editionKey: Array.isArray(doc.edition_key) ? doc.edition_key[0] : undefined,
              coverUrl,
              firstPublishYear: doc.first_publish_year,
              pageCount: doc.number_of_pages_median,
            };
          }
        }
      } catch {
        // Return null on failure
      }
    }

    // Fallback: If ISBN exists, provide direct cover URL fallback even if search API returned empty
    if (isbn) {
      return {
        coverUrl: `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`,
      };
    }

    return null;
  }
}

export const openLibraryService = new OpenLibraryService();
