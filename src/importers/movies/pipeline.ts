import { ImportSession, MigrationLog, MigrationProgress, MovieFilterCategory, MovieMigrationOptions, MovieRecord, SignedNostrEvent, UnsignedNostrEvent } from '../../types';
import { parseMoviesCsv } from './parser';
import { buildMovieListEvent, buildMovieReviewEvent } from './event-builder';
import { nostrService } from '../../services/nostr';
import { importSessionService } from '../../services/import-session';

type ProgressListener = (progress: MigrationProgress) => void;
type LogListener = (log: MigrationLog) => void;
type MoviesChangeListener = (movies: MovieRecord[]) => void;

class MoviesPipeline {
  private movies: MovieRecord[] = [];
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
  private moviesListeners: Set<MoviesChangeListener> = new Set();

  public getMovies(): MovieRecord[] {
    return [...this.movies];
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

  /**
   * Dry run helper: generates all unsigned Nostr events (curated lists and reviews) for selected movies.
   */
  public generateUnsignedEvents(options?: Partial<MovieMigrationOptions>, customPubkey?: string): UnsignedNostrEvent[] {
    const pubkey = customPubkey || nostrService.getPubkey() || '0000000000000000000000000000000000000000000000000000000000000000';
    const selectedMovies = this.movies.filter((m) => m.selected);
    const events: UnsignedNostrEvent[] = [];

    const generateCuratedLists = options?.generateCuratedLists ?? true;
    const generateReviewEvents = options?.generateReviewEvents ?? true;

    if (generateCuratedLists && selectedMovies.length > 0) {
      events.push(buildMovieListEvent('movies:rated', selectedMovies, pubkey));
    }

    if (generateReviewEvents) {
      selectedMovies.forEach((movie) => {
        events.push(buildMovieReviewEvent(movie, pubkey));
      });
    }

    return events;
  }

  /**
   * Generates a single unsigned Nostr review event for a specific movie.
   */
  public generateSingleMovieEvent(movieId: string, customPubkey?: string): UnsignedNostrEvent | null {
    const movie = this.movies.find((m) => m.id === movieId);
    if (!movie) return null;
    const pubkey = customPubkey || nostrService.getPubkey() || '0000000000000000000000000000000000000000000000000000000000000000';
    return buildMovieReviewEvent(movie, pubkey);
  }

  public async loadCsv(file: File): Promise<MovieRecord[]> {
    this.addLog('info', `Ingesting CSV file: ${file.name} (${Math.round(file.size / 1024)} KB)`);
    this.updateProgress({ phase: 'parsing', total: 0, processed: 0, succeeded: 0, failed: 0, skipped: 0, percentage: 0 });

    this.csvFingerprint = null;
    this.activeSessionKey = null;

    try {
      const [parsed, fingerprint] = await Promise.all([
        parseMoviesCsv(file),
        importSessionService.computeFingerprint(file),
      ]);

      this.movies = parsed;
      this.csvFingerprint = fingerprint;

      this.addLog('success', `Successfully parsed ${parsed.length} movie & TV records from CSV.`);
      this.updateProgress({ phase: 'idle', total: parsed.length, processed: 0, succeeded: 0, failed: 0, skipped: 0, percentage: 0 });
      this.notifyMoviesListeners();

      return this.movies;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown CSV parse error';
      this.addLog('error', `Failed to parse CSV: ${msg}`);
      this.updateProgress({ phase: 'error', percentage: 0 });
      throw err;
    }
  }

  public toggleMovieSelection(movieId: string, selected?: boolean): void {
    const movie = this.movies.find((m) => m.id === movieId);
    if (movie) {
      movie.selected = selected !== undefined ? selected : !movie.selected;
      this.notifyMoviesListeners();
    }
  }

  public selectAll(selected = true, filter?: MovieFilterCategory): void {
    this.movies.forEach((m) => {
      if (!filter || filter === 'all') {
        m.selected = selected;
      } else if (filter === 'movie') {
        if (m.titleType === 'Movie' || m.titleType === 'Short') m.selected = selected;
      } else if (filter === 'tv') {
        if (m.titleType === 'TV Series' || m.titleType === 'TV Mini Series') m.selected = selected;
      } else if (filter === 'episode') {
        if (m.titleType === 'TV Episode') m.selected = selected;
      } else if (filter === 'high-rated') {
        if (m.myRating >= 8) m.selected = selected;
      } else if (filter === 'unrated') {
        if (m.myRating === 0) m.selected = selected;
      }
    });
    this.notifyMoviesListeners();
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

  public async startMigration(options: MovieMigrationOptions): Promise<void> {
    if (this.isRunning) return;

    const pubkey = nostrService.getPubkey();
    if (!pubkey) {
      this.addLog('error', 'Cannot start migration: Nostr account not connected.');
      throw new Error('Please connect your Nostr extension before migrating.');
    }

    const selectedMovies = this.movies.filter((m) => m.selected);
    if (selectedMovies.length === 0) {
      this.addLog('warning', 'No movies selected for migration.');
      throw new Error('Please select at least one movie or TV show to migrate.');
    }

    this.isRunning = true;
    this.isPaused = false;
    this.isCancelled = false;

    const { resumeSession, ...coreOptions } = options;

    let session: ImportSession;
    if (resumeSession) {
      session = resumeSession;
      this.activeSessionKey = session.sessionKey;
      this.addLog('info', `Resuming previous import session (${session.completedBookIds.length} titles already published).`);
    } else {
      const fingerprint = this.csvFingerprint ?? '';
      session = importSessionService.createSession(
        'movies',
        pubkey,
        fingerprint,
        selectedMovies.length,
        coreOptions as any
      );
      this.activeSessionKey = session.sessionKey;
    }

    const completedMovieIds = new Set(session.completedBookIds);
    const completedLists = new Set(session.shelvesCompleted);

    let totalOperations = 0;
    if (options.generateCuratedLists) {
      totalOperations += 1; // Main curated list event
    }
    if (options.generateReviewEvents) {
      totalOperations += selectedMovies.filter((m) => !completedMovieIds.has(m.id)).length;
    }

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
      phase: 'signing',
      percentage: totalOperations === 0 ? 100 : Math.round((processed / (totalOperations + processed)) * 100),
    });

    this.addLog('info', `Starting migration for ${selectedMovies.length} titles (${totalOperations} Nostr events to broadcast)...`);

    try {
      // ── Step 0: NIP-09 Deletion of Previous Reviews (Optional) ───────────────
      if (options.deletePreviousReviewsBeforeImport && options.generateReviewEvents) {
        this.addLog('info', 'Searching for previously published Kind 1985/31985 movie review events on write relays to delete...');
        try {
          const previousEventIds = await nostrService.fetchUserEventIds(pubkey, [1985, 31985]);
          if (previousEventIds.length > 0) {
            this.addLog('info', `Found ${previousEventIds.length} previous review events. Requesting NIP-09 (Kind 5) deletion signature...`);
            const { successfulRelays, failedRelays } = await nostrService.deleteEvents(
              previousEventIds,
              'Replacing previous movie reviews with updated migration via x2nostr'
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

      // ── Step 1: Generate & Broadcast Curated Cinema List (Kind 30003) ────────
      if (options.generateCuratedLists) {
        const listKey = 'movies:rated';
        if (completedLists.has(listKey)) {
          skipped++;
          processed++;
          this.addLog('info', 'Skipping curated movie list — already published in this session.');
        } else {
          this.addLog('info', `Building NIP-51 Curated List (Kind 30003) for ${selectedMovies.length} titles...`);
          const listEvent = buildMovieListEvent(listKey, selectedMovies, pubkey);

          try {
            this.addLog('info', 'Requesting signature for NIP-51 Movie & TV list (Kind 30003)...');
            const signedList = await nostrService.signEvent(listEvent);
            const listRes = await nostrService.publishEvent(signedList);

            if (listRes.successfulRelays.length > 0) {
              succeeded++;
              importSessionService.markShelfCompleted(session.sessionKey, listKey);
              completedLists.add(listKey);
              this.addLog('success', `Broadcast Curated Movie List to ${listRes.successfulRelays.length} relays.`);
            } else {
              failed++;
              this.addLog('error', 'Failed to broadcast Curated Movie List to relays.');
            }
          } catch (err: unknown) {
            failed++;
            const msg = err instanceof Error ? err.message : 'Signing rejected';
            this.addLog('error', `Failed to sign/publish movie list: ${msg}`);
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

      // ── Step 2: Generate & Broadcast Individual Review/Rating Events (Kind 31985) ──
      if (options.generateReviewEvents) {
        this.updateProgress({ phase: 'broadcasting' });

        for (const movie of selectedMovies) {
          if (this.isCancelled) return;
          while (this.isPaused) {
            await new Promise((r) => setTimeout(r, 300));
            if (this.isCancelled) return;
          }

          // Deduplication check — skip movies already published in this session
          if (completedMovieIds.has(movie.id)) {
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

          this.updateProgress({ currentTitle: movie.title });
          const unsignedEvent = buildMovieReviewEvent(movie, pubkey);

          try {
            const signedEvent: SignedNostrEvent = await nostrService.signEvent(unsignedEvent);
            const { successfulRelays } = await nostrService.publishEvent(signedEvent);

            if (successfulRelays.length > 0) {
              succeeded++;
              importSessionService.markBookCompleted(session.sessionKey, movie.id);
              completedMovieIds.add(movie.id);
              this.addLog('success', `Published rating for "${movie.title}" (${movie.myRating}/10) to ${successfulRelays.length} relays`);
            } else {
              failed++;
              this.addLog('warning', `Relays did not acknowledge event for "${movie.title}"`);
            }
          } catch (err: unknown) {
            failed++;
            const msg = err instanceof Error ? err.message : 'User rejected signing';
            this.addLog('error', `Could not publish rating for "${movie.title}": ${msg}`);
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
    this.logs.unshift(log);
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

  public onMoviesChange(listener: MoviesChangeListener): () => void {
    this.moviesListeners.add(listener);
    return () => {
      this.moviesListeners.delete(listener);
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

  private notifyMoviesListeners(): void {
    this.moviesListeners.forEach((l) => {
      try {
        l([...this.movies]);
      } catch (err) {
        console.error('Error in movies listener:', err);
      }
    });
  }
}

export const moviesPipeline = new MoviesPipeline();
