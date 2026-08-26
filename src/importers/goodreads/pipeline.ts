import { BookRecord, ImportSession, MigrationLog, MigrationOptions, MigrationProgress, ShelfCategory, SignedNostrEvent } from '../../types';
import { parseGoodreadsCsv } from './parser';
import { buildBookReviewEvent, buildBookstrShelfListEvent, buildShelfListEvent } from './event-builder';
import { openLibraryService } from '../../services/openlibrary';
import { nostrService } from '../../services/nostr';
import { importSessionService } from '../../services/import-session';

type ProgressListener = (progress: MigrationProgress) => void;
type LogListener = (log: MigrationLog) => void;
type BooksChangeListener = (books: BookRecord[]) => void;

class GoodreadsPipeline {
  private books: BookRecord[] = [];
  private logs: MigrationLog[] = [];
  private isPaused = false;
  private isCancelled = false;
  private isRunning = false;

  /**
   * SHA-256 fingerprint of the currently loaded CSV file.
   * Computed in loadCsv() and used to scope the resume session.
   */
  private csvFingerprint: string | null = null;

  /**
   * The localStorage key of the currently active ImportSession.
   * Set when startMigration creates or resumes a session.
   */
  private activeSessionKey: string | null = null;

  private progress: MigrationProgress = {
    total: 0,
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    phase: 'idle',
    percentage: 0,
  };

  private progressListeners: Set<ProgressListener> = new Set();
  private logListeners: Set<LogListener> = new Set();
  private booksListeners: Set<BooksChangeListener> = new Set();

  public getBooks(): BookRecord[] {
    return [...this.books];
  }

  public getLogs(): MigrationLog[] {
    return [...this.logs];
  }

  public getProgress(): MigrationProgress {
    return { ...this.progress };
  }

  public getFingerprint(): string | null {
    return this.csvFingerprint;
  }

  public getSessionKey(): string | null {
    return this.activeSessionKey;
  }

  public async loadCsv(file: File): Promise<BookRecord[]> {
    this.addLog('info', `Ingesting CSV file: ${file.name} (${Math.round(file.size / 1024)} KB)`);
    this.updateProgress({ phase: 'parsing', total: 0, processed: 0, succeeded: 0, failed: 0, skipped: 0, percentage: 0 });

    // Reset any previous session state when a new file is loaded
    this.csvFingerprint = null;
    this.activeSessionKey = null;

    try {
      // Compute fingerprint and parse in parallel — fingerprinting only reads
      // the first 512 bytes so it doesn't block or slow down the CSV parse.
      const [parsed, fingerprint] = await Promise.all([
        parseGoodreadsCsv(file),
        importSessionService.computeFingerprint(file),
      ]);

      this.books = parsed;
      this.csvFingerprint = fingerprint;

      this.addLog('success', `Successfully parsed ${parsed.length} books from Goodreads CSV.`);
      this.updateProgress({ phase: 'idle', total: parsed.length, processed: 0, succeeded: 0, failed: 0, skipped: 0, percentage: 0 });
      this.notifyBooksListeners();

      // Trigger polite background enrichment for initial batch
      this.startBackgroundEnrichment();

      return this.books;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown CSV parse error';
      this.addLog('error', `Failed to parse Goodreads CSV: ${msg}`);
      this.updateProgress({ phase: 'error', percentage: 0 });
      throw err;
    }
  }


  public toggleBookSelection(bookId: string, selected?: boolean): void {
    const book = this.books.find((b) => b.id === bookId);
    if (book) {
      book.selected = selected !== undefined ? selected : !book.selected;
      this.notifyBooksListeners();
    }
  }

  public selectAll(selected = true, filterShelf?: ShelfCategory | 'all' | 'unrated'): void {
    this.books.forEach((b) => {
      if (!filterShelf || filterShelf === 'all') {
        b.selected = selected;
      } else if (filterShelf === 'unrated') {
        if (b.myRating === 0) b.selected = selected;
      } else {
        if (b.exclusiveShelf === filterShelf) b.selected = selected;
      }
    });
    this.notifyBooksListeners();
  }

  private async startBackgroundEnrichment(): Promise<void> {
    const total = this.books.length;
    if (total === 0) return;

    let enriched = this.books.filter((b) => b.metadataResolved).length;
    this.updateProgress({
      enrichment: { enriched, total },
    });

    const toEnrich = this.books.filter((b) => !b.metadataResolved);
    if (toEnrich.length === 0) return;

    this.addLog('info', `Starting Open Library metadata enrichment (${enriched}/${total} enriched)...`);

    for (let i = 0; i < toEnrich.length; i++) {
      if (this.isRunning) break;
      const book = toEnrich[i];

      try {
        const meta = await openLibraryService.resolveBook(book.isbn13, book.isbn, book.title, book.author);
        if (meta) {
          book.openLibraryWorkId = meta.workKey;
          book.openLibraryEditionId = meta.editionKey;
          book.coverUrl = meta.coverUrl;
        }
        book.metadataResolved = true;
      } catch {
        book.metadataResolved = true;
      }

      enriched++;
      this.updateProgress({
        enrichment: { enriched, total },
        currentTitle: book.title,
      });

      this.addLog('info', `[${enriched}/${total}] Enriched metadata for "${book.title}"`);
      this.notifyBooksListeners();
    }

    this.addLog('success', `Completed Open Library metadata enrichment (${enriched}/${total} resolved).`);
  }

  public pause(): void {
    if (this.isRunning) {
      this.isPaused = true;
      this.updateProgress({ phase: 'paused' });
      this.addLog('warning', 'Migration paused by user.');
    }
  }

  public resume(): void {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false;
      this.updateProgress({ phase: 'broadcasting' });
      this.addLog('info', 'Migration resumed.');
    }
  }

  public cancel(): void {
    if (this.isRunning) {
      this.isCancelled = true;
      this.isRunning = false;
      this.isPaused = false;
      this.updateProgress({ phase: 'idle' });
      this.addLog('warning', 'Migration cancelled by user.');
    }
  }

  public async startMigration(options: MigrationOptions): Promise<void> {
    if (this.isRunning) return;

    const pubkey = nostrService.getPubkey();
    if (!pubkey) {
      this.addLog('error', 'Cannot start migration: Nostr account not connected.');
      throw new Error('Please connect your Nostr extension before migrating.');
    }

    const selectedBooks = this.books.filter((b) => b.selected);
    if (selectedBooks.length === 0) {
      this.addLog('warning', 'No books selected for migration.');
      throw new Error('Please select at least one book to migrate.');
    }

    this.isRunning = true;
    this.isPaused = false;
    this.isCancelled = false;

    // ── Session setup ──────────────────────────────────────────────────────────
    // Either continue an existing in-progress session or create a fresh one.
    // The session acts as the persistent deduplication ledger.
    const { resumeSession, ...coreOptions } = options;

    let session: ImportSession;
    if (resumeSession) {
      session = resumeSession;
      this.activeSessionKey = session.sessionKey;
      this.addLog('info', `Resuming previous import session (${session.completedBookIds.length} books already published, ${session.shelvesCompleted.length} shelf lists already published).`);
    } else {
      const fingerprint = this.csvFingerprint ?? '';
      session = importSessionService.createSession(
        'goodreads',
        pubkey,
        fingerprint,
        selectedBooks.length,
        coreOptions
      );
      this.activeSessionKey = session.sessionKey;
    }

    const completedBookIds = new Set(session.completedBookIds);
    const completedShelves = new Set(session.shelvesCompleted);

    // ── Operation counting ─────────────────────────────────────────────────────
    // Shelves: all non-empty shelves (Kind 30001 is replaceable — always count
    // them even when resuming, since we skip them cheaply via the set check).
    // Books: only the ones that were NOT already published.
    let totalOperations = 0;
    if (options.generateShelfLists) {
      const shelves = new Set(selectedBooks.map((b) => b.exclusiveShelf));
      totalOperations += shelves.size;
    }
    if (options.generateReviewEvents) {
      totalOperations += selectedBooks.filter((b) => !completedBookIds.has(b.id)).length;
    }

    // Seed processed/succeeded from the already-completed items so the progress
    // bar correctly reflects the resumed position.
    let processed = session.completedBookIds.length + session.shelvesCompleted.length;
    let succeeded = processed;
    let failed = 0;
    let skipped = 0;

    this.updateProgress({
      total: totalOperations + processed,
      processed,
      succeeded,
      failed,
      skipped,
      phase: 'resolving',
      percentage: totalOperations === 0 ? 100 : Math.round((processed / (totalOperations + processed)) * 100),
    });

    this.addLog('info', `Starting migration for ${selectedBooks.length} books (${totalOperations} Nostr events to broadcast)...`);

    try {
      // ── Step 0: NIP-09 Deletion of Previous Reviews (Optional) ───────────────
      if (options.deletePreviousReviewsBeforeImport && options.generateReviewEvents) {
        this.addLog('info', 'Searching for previously published Kind 1985/31985 review events on your write relays to delete...');
        this.updateProgress({ phase: 'signing' });
        try {
          const previousEventIds = await nostrService.fetchUserEventIds(pubkey, [1985, 31985]);
          if (previousEventIds.length > 0) {
            this.addLog('info', `Found ${previousEventIds.length} previous review events. Requesting NIP-09 (Kind 5) deletion signature...`);
            const { successfulRelays, failedRelays } = await nostrService.deleteEvents(
              previousEventIds,
              'Replacing previous reviews with updated Goodreads migration via x2nostr'
            );
            if (successfulRelays.length > 0) {
              this.addLog('success', `Broadcast NIP-09 deletion for ${previousEventIds.length} events to ${successfulRelays.length} relays.`);
            } else {
              this.addLog('warning', `Relays did not acknowledge deletion event: ${failedRelays.join(', ')}`);
            }
          } else {
            this.addLog('info', 'No previous Kind 1985/31985 events found on write relays to delete.');
          }
        } catch (delErr: unknown) {
          const msg = delErr instanceof Error ? delErr.message : 'Deletion error';
          this.addLog('warning', `Could not broadcast NIP-09 deletion: ${msg}`);
        }
      }

      // ── Step 1: Enrich unresolved metadata for selected books ────────────────
      const unResolvedCount = selectedBooks.filter((b) => !b.metadataResolved).length;
      let enrichedCount = selectedBooks.filter((b) => b.metadataResolved).length;
      const totalSelected = selectedBooks.length;

      this.updateProgress({
        enrichment: { enriched: enrichedCount, total: totalSelected },
      });

      if (unResolvedCount > 0) {
        this.addLog('info', `Enriching missing Open Library metadata (${enrichedCount}/${totalSelected} enriched)...`);
        for (let i = 0; i < selectedBooks.length; i++) {
          if (this.isCancelled) return;
          while (this.isPaused) {
            await new Promise((r) => setTimeout(r, 300));
            if (this.isCancelled) return;
          }

          const book = selectedBooks[i];
          if (!book.metadataResolved) {
            this.updateProgress({
              currentTitle: book.title,
            });
            try {
              const meta = await openLibraryService.resolveBook(book.isbn13, book.isbn, book.title, book.author);
              if (meta) {
                book.openLibraryWorkId = meta.workKey;
                book.openLibraryEditionId = meta.editionKey;
                if (meta.coverUrl) book.coverUrl = meta.coverUrl;
              }
              book.metadataResolved = true;
            } catch {
              book.metadataResolved = true;
            }
            enrichedCount++;
            this.updateProgress({
              enrichment: { enriched: enrichedCount, total: totalSelected },
            });
            this.addLog('info', `[${enrichedCount}/${totalSelected}] Enriched metadata for "${book.title}"`);
          }
        }
      }
      this.notifyBooksListeners();

      // ── Step 2: Generate & Broadcast Shelf Lists ────────────────────────────
      // 1. NIP-51 Bookmark Sets (Kind 30003) with content: "" for Coracle / NIP-51 clients
      // 2. Bookstr-native Shelf Lists (Kinds 10073, 10074, 10075) for Bookstr.xyz
      if (options.generateShelfLists) {
        this.updateProgress({ phase: 'signing' });
        const shelvesToProcess: ShelfCategory[] = ['read', 'currently-reading', 'to-read', 'custom'];

        for (const shelf of shelvesToProcess) {
          if (this.isCancelled) return;
          while (this.isPaused) {
            await new Promise((r) => setTimeout(r, 300));
            if (this.isCancelled) return;
          }

          const shelfBooks = selectedBooks.filter((b) => b.exclusiveShelf === shelf);
          if (shelfBooks.length === 0) continue;

          // Skip shelves already published in this session
          if (completedShelves.has(shelf)) {
            skipped++;
            processed++;
            this.addLog('info', `Skipping shelf "${shelf}" — already published in this session.`);
            this.updateProgress({
              processed,
              succeeded,
              failed,
              skipped,
              percentage: Math.round((processed / (totalOperations + session.completedBookIds.length + session.shelvesCompleted.length)) * 100),
            });
            continue;
          }

          this.addLog('info', `Building list events for shelf: "${shelf}" (${shelfBooks.length} books)...`);
          const nip51Event = buildShelfListEvent(shelf, shelfBooks, pubkey);
          const bookstrEvent = buildBookstrShelfListEvent(shelf, shelfBooks, pubkey);

          try {
            // 1. Sign and broadcast NIP-51 Kind 30003
            this.addLog('info', `Requesting signature for standard NIP-51 list (Kind 30003) for "${shelf}"...`);
            const signedNip51 = await nostrService.signEvent(nip51Event);
            const nip51Res = await nostrService.publishEvent(signedNip51);

            // 2. Sign and broadcast Bookstr Kind 10073/10074/10075
            this.addLog('info', `Requesting signature for Bookstr.xyz shelf list (Kind ${bookstrEvent.kind}) for "${shelf}"...`);
            const signedBookstr = await nostrService.signEvent(bookstrEvent);
            const bookstrRes = await nostrService.publishEvent(signedBookstr);

            const totalSuccessRelays = Math.max(nip51Res.successfulRelays.length, bookstrRes.successfulRelays.length);
            if (totalSuccessRelays > 0) {
              succeeded++;
              importSessionService.markShelfCompleted(session.sessionKey, shelf);
              completedShelves.add(shelf);
              this.addLog('success', `Broadcast "${shelf}" lists (NIP-51 & Bookstr) to relays successfully.`);
            } else {
              failed++;
              this.addLog('error', `Failed to broadcast "${shelf}" lists to relays.`);
            }
          } catch (err: unknown) {
            failed++;
            const msg = err instanceof Error ? err.message : 'Signing rejected';
            this.addLog('error', `Failed to sign/publish list for shelf "${shelf}": ${msg}`);
          }

          processed++;
          this.updateProgress({
            processed,
            succeeded,
            failed,
            skipped,
            percentage: Math.round((processed / (totalOperations + session.completedBookIds.length + session.shelvesCompleted.length)) * 100),
          });
        }
      }

      // ── Step 3: Generate & Broadcast Individual Review/Rating Events (Kind 31985)
      // Kind 31985 is a Parameterized Replaceable Event (keyed by "isbn:<isbn>").
      // It satisfies Bookstr.xyz ratings while carrying full NIP-32 labels for Nostr clients.
      // We skip books that are already completed in the current session.
      if (options.generateReviewEvents) {
        this.updateProgress({ phase: 'broadcasting' });

        for (const book of selectedBooks) {
          if (this.isCancelled) return;
          while (this.isPaused) {
            await new Promise((r) => setTimeout(r, 300));
            if (this.isCancelled) return;
          }

          // Deduplication check — skip books already published in this session
          if (completedBookIds.has(book.id)) {
            skipped++;
            processed++;
            this.updateProgress({
              processed,
              succeeded,
              failed,
              skipped,
              percentage: Math.round((processed / (totalOperations + session.completedBookIds.length + session.shelvesCompleted.length)) * 100),
            });
            continue;
          }

          this.updateProgress({ currentTitle: book.title });
          const unsignedEvent = buildBookReviewEvent(book, pubkey);

          try {
            const signedEvent: SignedNostrEvent = await nostrService.signEvent(unsignedEvent);
            const { successfulRelays } = await nostrService.publishEvent(signedEvent);

            if (successfulRelays.length > 0) {
              succeeded++;
              // Persist immediately — crash-safe: the book won't be re-published
              // on resume even if the browser closes right after this line.
              importSessionService.markBookCompleted(session.sessionKey, book.id);
              completedBookIds.add(book.id);
              this.addLog('success', `Published review/rating for "${book.title}" (${successfulRelays.length} relays)`);
            } else {
              failed++;
              this.addLog('warning', `Relays did not acknowledge event for "${book.title}"`);
            }
          } catch (err: unknown) {
            failed++;
            const msg = err instanceof Error ? err.message : 'User rejected signing';
            this.addLog('error', `Could not publish review for "${book.title}": ${msg}`);
          }

          processed++;
          this.updateProgress({
            processed,
            succeeded,
            failed,
            skipped,
            percentage: Math.round((processed / (totalOperations + session.completedBookIds.length + session.shelvesCompleted.length)) * 100),
          });
        }
      }

      this.isRunning = false;
      importSessionService.completeSession(session.sessionKey);
      this.activeSessionKey = null;
      this.updateProgress({ phase: 'completed', percentage: 100 });
      this.addLog('success', `Migration finished! ${succeeded} events published successfully, ${failed} failed, ${skipped} skipped (already imported).`);
    } catch (err: unknown) {
      this.isRunning = false;
      const msg = err instanceof Error ? err.message : 'Unexpected migration error';
      this.addLog('error', `Migration aborted: ${msg}`);
      this.updateProgress({ phase: 'error' });
      throw err;
    }
  }



  public addLog(level: MigrationLog['level'], message: string, details?: Record<string, unknown> | string): void {
    const log: MigrationLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date(),
      level,
      message,
      details,
    };
    this.logs.unshift(log); // newest first
    if (this.logs.length > 200) this.logs.pop();
    this.notifyLogListeners(log);
  }

  public clearLogs(): void {
    this.logs = [];
    this.logListeners.forEach((l) => {
      try {
        l({ id: 'clear', timestamp: new Date(), level: 'info', message: '' });
      } catch {
        // ignore
      }
    });
  }

  private updateProgress(patch: Partial<MigrationProgress>): void {
    this.progress = { ...this.progress, ...patch };
    this.notifyProgressListeners();
  }

  public onProgress(listener: ProgressListener): () => void {
    this.progressListeners.add(listener);
    return () => {
      this.progressListeners.delete(listener);
    };
  }

  public onLog(listener: LogListener): () => void {
    this.logListeners.add(listener);
    return () => {
      this.logListeners.delete(listener);
    };
  }

  public onBooksChange(listener: BooksChangeListener): () => void {
    this.booksListeners.add(listener);
    return () => {
      this.booksListeners.delete(listener);
    };
  }

  private notifyProgressListeners(): void {
    this.progressListeners.forEach((l) => {
      try {
        l({ ...this.progress });
      } catch (err) {
        console.error('Error in progress listener:', err);
      }
    });
  }

  private notifyLogListeners(log: MigrationLog): void {
    this.logListeners.forEach((l) => {
      try {
        l(log);
      } catch (err) {
        console.error('Error in log listener:', err);
      }
    });
  }

  private notifyBooksListeners(): void {
    this.booksListeners.forEach((l) => {
      try {
        l([...this.books]);
      } catch (err) {
        console.error('Error in books listener:', err);
      }
    });
  }
}

export const goodreadsPipeline = new GoodreadsPipeline();
