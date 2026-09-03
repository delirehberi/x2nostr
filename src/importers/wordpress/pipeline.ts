import { ImportSession, MigrationLog, MigrationProgress, SignedNostrEvent, UnsignedNostrEvent, WordPressMigrationOptions, WordPressPostRecord } from '../../types';
import { parseWordPressXml } from './parser';
import { buildWordPressPostEvent } from './event-builder';
import { blossomService } from '../../services/blossom';
import { nostrService } from '../../services/nostr';
import { importSessionService } from '../../services/import-session';

type ProgressListener = (progress: MigrationProgress) => void;
type LogListener = (log: MigrationLog) => void;
type PostsChangeListener = (posts: WordPressPostRecord[]) => void;

class WordPressPipeline {
  private posts: WordPressPostRecord[] = [];
  private logs: MigrationLog[] = [];
  private isPaused = false;
  private isCancelled = false;
  private isRunning = false;

  private xmlFingerprint: string | null = null;
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
  private postsListeners: Set<PostsChangeListener> = new Set();

  public getPosts(): WordPressPostRecord[] {
    return [...this.posts];
  }

  public getLogs(): MigrationLog[] {
    return [...this.logs];
  }

  public getProgress(): MigrationProgress {
    return { ...this.progress };
  }

  public getFingerprint(): string | null {
    return this.xmlFingerprint;
  }

  public getSessionKey(): string | null {
    return this.activeSessionKey;
  }

  /**
   * Dry run helper: generates all unsigned Nostr Kind 30023 events for selected posts without signing/publishing.
   */
  public generateUnsignedEvents(options?: Partial<WordPressMigrationOptions>, customPubkey?: string): UnsignedNostrEvent[] {
    const pubkey = customPubkey || nostrService.getPubkey() || '0000000000000000000000000000000000000000000000000000000000000000';
    const includeDrafts = options?.includeDrafts ?? true;
    const selected = this.posts.filter((p) => p.selected && (includeDrafts || p.status === 'publish'));
    return selected.map((post) => buildWordPressPostEvent(post, pubkey));
  }

  /**
   * Generates a single unsigned Nostr event for a specific post.
   */
  public generateSinglePostEvent(postId: string, customPubkey?: string): UnsignedNostrEvent | null {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return null;
    const pubkey = customPubkey || nostrService.getPubkey() || '0000000000000000000000000000000000000000000000000000000000000000';
    return buildWordPressPostEvent(post, pubkey);
  }

  public async loadXml(file: File): Promise<WordPressPostRecord[]> {
    this.addLog('info', `Ingesting WordPress WXR XML file: ${file.name} (${Math.round(file.size / 1024)} KB)`);
    this.updateProgress({ phase: 'parsing', total: 0, processed: 0, succeeded: 0, failed: 0, skipped: 0, percentage: 0 });

    this.xmlFingerprint = null;
    this.activeSessionKey = null;

    try {
      const [parsed, fingerprint] = await Promise.all([
        parseWordPressXml(file),
        importSessionService.computeFingerprint(file),
      ]);

      this.posts = parsed;
      this.xmlFingerprint = fingerprint;

      this.addLog('success', `Successfully parsed ${parsed.length} posts from WordPress WXR export.`);
      this.updateProgress({ phase: 'idle', total: parsed.length, processed: 0, succeeded: 0, failed: 0, skipped: 0, percentage: 0 });
      this.notifyPostsListeners();

      return this.posts;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown WXR XML parse error';
      this.addLog('error', `Failed to parse WordPress XML: ${msg}`);
      this.updateProgress({ phase: 'error', percentage: 0 });
      throw err;
    }
  }

  public togglePostSelection(postId: string, selected?: boolean): void {
    const post = this.posts.find((p) => p.id === postId);
    if (post) {
      post.selected = selected !== undefined ? selected : !post.selected;
      this.notifyPostsListeners();
    }
  }

  public selectAll(selected = true, filterStatus?: 'all' | 'publish' | 'draft'): void {
    this.posts.forEach((p) => {
      if (!filterStatus || filterStatus === 'all') {
        p.selected = selected;
      } else {
        if (p.status === filterStatus) p.selected = selected;
      }
    });
    this.notifyPostsListeners();
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

  public async startMigration(options: WordPressMigrationOptions): Promise<void> {
    if (this.isRunning) return;

    const pubkey = nostrService.getPubkey();
    if (!pubkey) {
      this.addLog('error', 'Cannot start migration: Nostr account not connected.');
      throw new Error('Please connect your Nostr extension before migrating.');
    }

    const selectedPosts = this.posts.filter((p) => p.selected);
    if (selectedPosts.length === 0) {
      this.addLog('warning', 'No blog posts selected for migration.');
      throw new Error('Please select at least one post to migrate.');
    }

    this.isRunning = true;
    this.isPaused = false;
    this.isCancelled = false;

    // Session setup
    const { resumeSession, ...coreOptions } = options;
    let session: ImportSession;
    if (resumeSession) {
      session = resumeSession;
      this.activeSessionKey = session.sessionKey;
      this.addLog('info', `Resuming previous WordPress import session (${session.completedBookIds.length} posts already published).`);
    } else {
      const fingerprint = this.xmlFingerprint ?? '';
      session = importSessionService.createSession(
        'wordpress',
        pubkey,
        fingerprint,
        selectedPosts.length,
        coreOptions
      );
      this.activeSessionKey = session.sessionKey;
    }

    const completedPostIds = new Set(session.completedBookIds);

    const pendingPosts = selectedPosts.filter((p) => !completedPostIds.has(p.id));
    const totalOperations = pendingPosts.length;

    let processed = session.completedBookIds.length;
    let succeeded = processed;
    let failed = 0;
    let skipped = 0;

    this.updateProgress({
      total: selectedPosts.length,
      processed,
      succeeded,
      failed,
      skipped,
      phase: 'resolving',
      percentage: selectedPosts.length === 0 ? 100 : Math.round((processed / selectedPosts.length) * 100),
    });

    this.addLog('info', `Starting migration for ${selectedPosts.length} posts (${totalOperations} NIP-23 Kind 30023 events to broadcast)...`);

    try {
      // Step 0: Deletion of previous events if requested
      if (options.deletePreviousPostsBeforeImport) {
        this.addLog('info', 'Searching for previously published Kind 30023 long-form events on your write relays...');
        this.updateProgress({ phase: 'signing' });
        try {
          const previousEventIds = await nostrService.fetchUserEventIds(pubkey, [30023]);
          if (previousEventIds.length > 0) {
            this.addLog('info', `Found ${previousEventIds.length} previous Kind 30023 articles. Requesting NIP-09 deletion signature...`);
            const { successfulRelays } = await nostrService.deleteEvents(
              previousEventIds,
              'Replacing previous articles with updated WordPress import via x2nostr'
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
        this.addLog('info', 'Uploading post images and featured covers to Blossom servers...');
        for (let i = 0; i < selectedPosts.length; i++) {
          if (this.isCancelled) return;
          while (this.isPaused) {
            await new Promise((r) => setTimeout(r, 300));
            if (this.isCancelled) return;
          }

          const post = selectedPosts[i];
          if (completedPostIds.has(post.id)) continue;

          this.updateProgress({ currentTitle: `[Media Upload] ${post.title}` });
          post.blossomImageMap = post.blossomImageMap || {};

          // Upload featured image cover (resilient to broken links)
          if (post.featuredImageUrl && !post.blossomCoverUrl) {
            this.addLog('info', `Uploading header cover image for "${post.title}" to Blossom...`);
            try {
              post.blossomCoverUrl = await blossomService.uploadImageUrl(post.featuredImageUrl, pubkey, options.blossomServers);
            } catch (imgErr) {
              this.addLog('warning', `Could not upload cover image for "${post.title}" (broken link/CORS). Retaining original URL.`);
              post.blossomCoverUrl = post.featuredImageUrl;
            }
          }

          // Upload inline images (resilient to broken links)
          for (const imgUrl of post.imageUrls) {
            if (!post.blossomImageMap[imgUrl]) {
              this.addLog('info', `Uploading inline image asset to Blossom: ${imgUrl}`);
              try {
                const blossomUrl = await blossomService.uploadImageUrl(imgUrl, pubkey, options.blossomServers);
                post.blossomImageMap[imgUrl] = blossomUrl;
              } catch (imgErr) {
                this.addLog('warning', `Could not upload inline image asset ${imgUrl} (broken link/CORS). Retaining original URL.`);
                post.blossomImageMap[imgUrl] = imgUrl;
              }
            }
          }
        }
      }

      // Step 2: Sign and Broadcast NIP-23 Events
      this.updateProgress({ phase: 'broadcasting' });

      for (const post of selectedPosts) {
        if (this.isCancelled) return;
        while (this.isPaused) {
          await new Promise((r) => setTimeout(r, 300));
          if (this.isCancelled) return;
        }

        if (completedPostIds.has(post.id)) {
          skipped++;
          processed++;
          this.updateProgress({
            processed,
            succeeded,
            failed,
            skipped,
            percentage: Math.round((processed / selectedPosts.length) * 100),
          });
          continue;
        }

        this.updateProgress({ currentTitle: post.title });
        const unsignedEvent = buildWordPressPostEvent(post, pubkey);

        try {
          this.addLog('info', `Requesting signature for NIP-23 post: "${post.title}"...`);
          const signedEvent: SignedNostrEvent = await nostrService.signEvent(unsignedEvent);
          const { successfulRelays } = await nostrService.publishEvent(signedEvent);

          if (successfulRelays.length > 0) {
            succeeded++;
            importSessionService.markBookCompleted(session.sessionKey, post.id);
            completedPostIds.add(post.id);
            this.addLog('success', `Published article "${post.title}" to ${successfulRelays.length} relays successfully.`);
          } else {
            failed++;
            this.addLog('warning', `Relays did not acknowledge event for article "${post.title}"`);
          }
        } catch (err: unknown) {
          failed++;
          const msg = err instanceof Error ? err.message : 'User rejected signing';
          this.addLog('error', `Could not publish article "${post.title}": ${msg}`);
        }

        processed++;
        this.updateProgress({
          processed,
          succeeded,
          failed,
          skipped,
          percentage: Math.round((processed / selectedPosts.length) * 100),
        });
      }

      this.isRunning = false;
      importSessionService.completeSession(session.sessionKey);
      this.activeSessionKey = null;
      this.updateProgress({ phase: 'completed', percentage: 100 });
      this.addLog('success', `WordPress migration completed! ${succeeded} articles published successfully, ${failed} failed, ${skipped} skipped.`);
    } catch (err: unknown) {
      this.isRunning = false;
      const msg = err instanceof Error ? err.message : 'Unexpected migration error';
      this.addLog('error', `WordPress migration aborted: ${msg}`);
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

  public onPostsChange(listener: PostsChangeListener): () => void {
    this.postsListeners.add(listener);
    return () => {
      this.postsListeners.delete(listener);
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

  private notifyPostsListeners(): void {
    this.postsListeners.forEach((l) => {
      try {
        l([...this.posts]);
      } catch (err) {
        console.error('Error in posts listener:', err);
      }
    });
  }
}

export const wordPressPipeline = new WordPressPipeline();
