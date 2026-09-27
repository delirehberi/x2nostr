import {
  ImportSession,
  LinkedInArticleRecord,
  LinkedInMigrationOptions,
  MigrationLog,
  MigrationProgress,
  SignedNostrEvent,
  UnsignedNostrEvent,
} from '../../types';
import { parseLinkedInExport } from './parser';
import { buildLinkedInArticleEvent } from './event-builder';
import { blossomService } from '../../services/blossom';
import { nostrService } from '../../services/nostr';
import { importSessionService } from '../../services/import-session';

type ProgressListener = (progress: MigrationProgress) => void;
type LogListener = (log: MigrationLog) => void;
type ArticlesChangeListener = (articles: LinkedInArticleRecord[]) => void;

class LinkedInPipeline {
  private articles: LinkedInArticleRecord[] = [];
  private logs: MigrationLog[] = [];
  private isPaused = false;
  private isCancelled = false;
  private isRunning = false;

  private sourceFingerprint: string | null = null;
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
  private articlesListeners: Set<ArticlesChangeListener> = new Set();

  public getArticles(): LinkedInArticleRecord[] {
    return [...this.articles];
  }

  public getLogs(): MigrationLog[] {
    return [...this.logs];
  }

  public getProgress(): MigrationProgress {
    return { ...this.progress };
  }

  public getFingerprint(): string | null {
    return this.sourceFingerprint;
  }

  public getSessionKey(): string | null {
    return this.activeSessionKey;
  }

  /**
   * Dry run helper: generates all unsigned Nostr Kind 30023 events for selected articles without signing/publishing.
   */
  public generateUnsignedEvents(_options?: Partial<LinkedInMigrationOptions>, customPubkey?: string): UnsignedNostrEvent[] {
    const pubkey = customPubkey || nostrService.getPubkey() || '0000000000000000000000000000000000000000000000000000000000000000';
    const selected = this.articles.filter((a) => a.selected);
    return selected.map((article) => buildLinkedInArticleEvent(article, pubkey));
  }

  /**
   * Generates a single unsigned Nostr event for a specific article.
   */
  public generateSingleArticleEvent(articleId: string, customPubkey?: string): UnsignedNostrEvent | null {
    const article = this.articles.find((a) => a.id === articleId);
    if (!article) return null;
    const pubkey = customPubkey || nostrService.getPubkey() || '0000000000000000000000000000000000000000000000000000000000000000';
    return buildLinkedInArticleEvent(article, pubkey);
  }

  public async loadFile(file: File): Promise<LinkedInArticleRecord[]> {
    this.addLog('info', `Ingesting LinkedIn export file: ${file.name} (${Math.round(file.size / 1024)} KB)`);
    this.updateProgress({ phase: 'parsing', total: 0, processed: 0, succeeded: 0, failed: 0, skipped: 0, percentage: 0 });

    this.sourceFingerprint = null;
    this.activeSessionKey = null;

    try {
      const [parsed, fingerprint] = await Promise.all([
        parseLinkedInExport(file),
        importSessionService.computeFingerprint(file),
      ]);

      this.articles = parsed;
      this.sourceFingerprint = fingerprint;

      this.addLog('success', `Successfully parsed ${parsed.length} articles from LinkedIn export.`);
      this.updateProgress({ phase: 'idle', total: parsed.length, processed: 0, succeeded: 0, failed: 0, skipped: 0, percentage: 0 });
      this.notifyArticlesListeners();

      return this.articles;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown LinkedIn parse error';
      this.addLog('error', `Failed to parse LinkedIn export: ${msg}`);
      this.updateProgress({ phase: 'error', percentage: 0 });
      throw err;
    }
  }

  public toggleArticleSelection(articleId: string, selected?: boolean): void {
    const article = this.articles.find((a) => a.id === articleId);
    if (article) {
      article.selected = selected !== undefined ? selected : !article.selected;
      this.notifyArticlesListeners();
    }
  }

  public selectAll(selected = true): void {
    this.articles.forEach((a) => {
      a.selected = selected;
    });
    this.notifyArticlesListeners();
  }

  public async startMigration(options: LinkedInMigrationOptions): Promise<void> {
    if (this.isRunning) {
      this.addLog('warning', 'Migration is already in progress.');
      return;
    }

    const pubkey = nostrService.getPubkey();
    if (!pubkey) {
      this.addLog('error', 'Nostr public key not found. Please connect your NIP-07 browser extension first.');
      return;
    }

    this.isRunning = true;
    this.isPaused = false;
    this.isCancelled = false;

    const selectedArticles = this.articles.filter((a) => a.selected);

    if (selectedArticles.length === 0) {
      this.addLog('warning', 'No articles selected for migration.');
      this.isRunning = false;
      return;
    }

    // 1. Session Ledger initialization
    const { resumeSession, ...coreOptions } = options;
    let session: ImportSession;

    if (resumeSession) {
      session = resumeSession;
      this.activeSessionKey = session.sessionKey;
      this.addLog('info', `Resuming previous LinkedIn import session (${session.completedBookIds.length} articles already published).`);
    } else {
      const fingerprint = this.sourceFingerprint ?? '';
      session = importSessionService.createSession(
        'linkedin',
        pubkey,
        fingerprint,
        selectedArticles.length,
        coreOptions
      );
      this.activeSessionKey = session.sessionKey;
    }

    const completedArticleIds = new Set(session.completedBookIds);
    const pendingArticles = selectedArticles.filter((a) => !completedArticleIds.has(a.id));
    const totalOperations = pendingArticles.length;

    let processed = session.completedBookIds.length;
    let succeeded = processed;
    let failed = 0;
    let skipped = 0;

    this.updateProgress({
      total: selectedArticles.length,
      processed,
      succeeded,
      failed,
      skipped,
      phase: 'resolving',
      percentage: selectedArticles.length === 0 ? 100 : Math.round((processed / selectedArticles.length) * 100),
    });

    this.addLog('info', `Starting migration for ${selectedArticles.length} articles (${totalOperations} NIP-23 Kind 30023 events to broadcast)...`);

    try {
      // Step 0: Deletion of previous events if requested
      if (options.deletePreviousArticlesBeforeImport) {
        this.addLog('info', 'Searching for previously published Kind 30023 long-form events on your write relays...');
        this.updateProgress({ phase: 'signing' });
        try {
          const previousEventIds = await nostrService.fetchUserEventIds(pubkey, [30023]);
          if (previousEventIds.length > 0) {
            this.addLog('info', `Found ${previousEventIds.length} previous Kind 30023 articles. Requesting NIP-09 deletion signature...`);
            const { successfulRelays } = await nostrService.deleteEvents(
              previousEventIds,
              'Replacing previous articles with updated LinkedIn import via x2nostr'
            );
            this.addLog('success', `Broadcast NIP-09 deletion for ${previousEventIds.length} events to ${successfulRelays.length} relays.`);
          }
        } catch (delErr: unknown) {
          const msg = delErr instanceof Error ? delErr.message : 'Deletion error';
          this.addLog('warning', `Could not broadcast NIP-09 deletion: ${msg}`);
        }
      }

      // Step 1: Blossom Image Upload Phase (Optional)
      if (options.uploadImagesToBlossom) {
        this.addLog('info', 'Uploading article images and featured covers to Blossom servers...');
        for (let i = 0; i < selectedArticles.length; i++) {
          if (this.isCancelled) return;
          while (this.isPaused) {
            await new Promise((r) => setTimeout(r, 300));
            if (this.isCancelled) return;
          }

          const article = selectedArticles[i];
          if (completedArticleIds.has(article.id)) continue;

          this.updateProgress({ currentTitle: `[Media Upload] ${article.title}` });
          article.blossomImageMap = article.blossomImageMap || {};

          // Upload cover image
          if (article.coverImageUrl && !article.blossomCoverUrl) {
            this.addLog('info', `Uploading header cover image for "${article.title}" to Blossom...`);
            try {
              article.blossomCoverUrl = await blossomService.uploadImageUrl(article.coverImageUrl, pubkey, options.blossomServers);
            } catch {
              this.addLog('warning', `Could not upload cover image for "${article.title}" (broken link/CORS). Retaining original URL.`);
              article.blossomCoverUrl = article.coverImageUrl;
            }
          }

          // Upload inline images
          for (const imgUrl of article.imageUrls) {
            if (!article.blossomImageMap[imgUrl]) {
              this.addLog('info', `Uploading inline image asset to Blossom: ${imgUrl}`);
              try {
                const blossomUrl = await blossomService.uploadImageUrl(imgUrl, pubkey, options.blossomServers);
                article.blossomImageMap[imgUrl] = blossomUrl;
              } catch {
                this.addLog('warning', `Could not upload inline image asset ${imgUrl} (broken link/CORS). Retaining original URL.`);
                article.blossomImageMap[imgUrl] = imgUrl;
              }
            }
          }
        }
      }

      // Step 2: Sign and Broadcast NIP-23 Events
      this.updateProgress({ phase: 'broadcasting' });

      for (const article of selectedArticles) {
        if (this.isCancelled) return;
        while (this.isPaused) {
          await new Promise((r) => setTimeout(r, 300));
          if (this.isCancelled) return;
        }

        if (completedArticleIds.has(article.id)) {
          skipped++;
          processed++;
          this.updateProgress({
            processed,
            succeeded,
            failed,
            skipped,
            percentage: Math.round((processed / selectedArticles.length) * 100),
          });
          continue;
        }

        this.updateProgress({ currentTitle: article.title });
        const unsignedEvent = buildLinkedInArticleEvent(article, pubkey);

        try {
          this.addLog('info', `Requesting signature for NIP-23 article: "${article.title}"...`);
          const signedEvent: SignedNostrEvent = await nostrService.signEvent(unsignedEvent);
          const { successfulRelays } = await nostrService.publishEvent(signedEvent);

          if (successfulRelays.length > 0) {
            succeeded++;
            importSessionService.markBookCompleted(session.sessionKey, article.id);
            completedArticleIds.add(article.id);
            this.addLog('success', `Published article "${article.title}" to ${successfulRelays.length} relays successfully.`);
          } else {
            failed++;
            this.addLog('warning', `Relays did not acknowledge event for article "${article.title}"`);
          }
        } catch (err: unknown) {
          failed++;
          const msg = err instanceof Error ? err.message : 'User rejected signing';
          this.addLog('error', `Could not publish article "${article.title}": ${msg}`);
        }

        processed++;
        this.updateProgress({
          processed,
          succeeded,
          failed,
          skipped,
          percentage: Math.round((processed / selectedArticles.length) * 100),
        });
      }

      this.isRunning = false;
      this.updateProgress({
        phase: 'completed',
        percentage: 100,
      });

      this.addLog('success', `LinkedIn migration finished! ${succeeded} articles published, ${failed} errors, ${skipped} skipped.`);
    } catch (criticalErr: unknown) {
      this.isRunning = false;
      const msg = criticalErr instanceof Error ? criticalErr.message : 'Critical migration failure';
      this.addLog('error', `Critical migration error: ${msg}`);
      this.updateProgress({ phase: 'error' });
    }
  }

  public pauseMigration(): void {
    if (this.isRunning && !this.isPaused) {
      this.isPaused = true;
      this.updateProgress({ phase: 'paused' });
      this.addLog('info', 'Migration paused.');
    }
  }

  public resumeMigration(): void {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false;
      this.updateProgress({ phase: 'signing' });
      this.addLog('info', 'Resuming migration...');
    }
  }

  public cancelMigration(): void {
    if (this.isRunning) {
      this.isCancelled = true;
      this.isPaused = false;
      this.isRunning = false;
      this.updateProgress({ phase: 'idle' });
      this.addLog('warning', 'Migration cancelled.');
    }
  }

  public reset(): void {
    this.articles = [];
    this.logs = [];
    this.isPaused = false;
    this.isCancelled = false;
    this.isRunning = false;
    this.sourceFingerprint = null;
    this.activeSessionKey = null;
    this.progress = {
      total: 0,
      processed: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      phase: 'idle',
      percentage: 0,
    };
    this.notifyArticlesListeners();
    this.notifyProgressListeners();
    this.notifyLogListeners();
  }

  public onProgress(listener: ProgressListener): () => void {
    this.progressListeners.add(listener);
    return () => this.progressListeners.delete(listener);
  }

  public onLog(listener: LogListener): () => void {
    this.logListeners.add(listener);
    return () => this.logListeners.delete(listener);
  }

  public onArticlesChange(listener: ArticlesChangeListener): () => void {
    this.articlesListeners.add(listener);
    return () => this.articlesListeners.delete(listener);
  }

  private updateProgress(patch: Partial<MigrationProgress>): void {
    this.progress = { ...this.progress, ...patch };
    this.notifyProgressListeners();
  }

  private addLog(level: MigrationLog['level'], message: string, details?: Record<string, unknown> | string): void {
    const log: MigrationLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date(),
      level,
      message,
      details,
    };
    this.logs.unshift(log);
    if (this.logs.length > 200) {
      this.logs.pop();
    }
    this.notifyLogListeners();
  }

  private notifyProgressListeners(): void {
    this.progressListeners.forEach((l) => l(this.getProgress()));
  }

  private notifyLogListeners(): void {
    if (this.logs.length > 0) {
      const latest = this.logs[0];
      this.logListeners.forEach((l) => l(latest));
    }
  }

  private notifyArticlesListeners(): void {
    this.articlesListeners.forEach((l) => l(this.getArticles()));
  }
}

export const linkedInPipeline = new LinkedInPipeline();
