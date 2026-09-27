import {
  IGMediaRecord,
  ImportSession,
  InstagramMigrationOptions,
  MigrationLog,
  MigrationProgress,
  SignedNostrEvent,
  UnsignedNostrEvent,
} from '../../types';
import { downloadMediaBinary } from './instagram-service';
import { calculateImageDimensions, parseInstagramArchiveJson } from './parser';
import { buildKind20PictureEvent, UploadedMediaItem } from './event-builder';
import { blossomService, DEFAULT_BLOSSOM_SERVERS } from '../../services/blossom';
import { nostrService } from '../../services/nostr';
import { importSessionService } from '../../services/import-session';

type ProgressListener = (progress: MigrationProgress) => void;
type LogListener = (log: MigrationLog) => void;
type PostsChangeListener = (posts: IGMediaRecord[]) => void;

class InstagramPipeline {
  private posts: IGMediaRecord[] = [];
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
  private postsListeners: Set<PostsChangeListener> = new Set();

  public getPosts(): IGMediaRecord[] {
    return [...this.posts];
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

  public setPosts(posts: IGMediaRecord[]): void {
    this.posts = [...posts];
    this.computeSourceFingerprint();
    this.notifyPostsChange();
  }

  public toggleSelection(id: string): void {
    const post = this.posts.find((p) => p.id === id);
    if (post) {
      post.selected = !post.selected;
      this.notifyPostsChange();
    }
  }

  public selectAll(selected: boolean): void {
    this.posts.forEach((p) => {
      p.selected = selected;
    });
    this.notifyPostsChange();
  }

  public subscribeProgress(listener: ProgressListener): () => void {
    this.progressListeners.add(listener);
    return () => this.progressListeners.delete(listener);
  }

  public subscribeLogs(listener: LogListener): () => void {
    this.logListeners.add(listener);
    return () => this.logListeners.delete(listener);
  }

  public subscribePosts(listener: PostsChangeListener): () => void {
    this.postsListeners.add(listener);
    return () => this.postsListeners.delete(listener);
  }

  private notifyProgress(): void {
    const p = { ...this.progress };
    this.progressListeners.forEach((l) => {
      try {
        l(p);
      } catch (err) {
        console.error('Error in progress listener:', err);
      }
    });
  }

  private notifyPostsChange(): void {
    const current = [...this.posts];
    this.postsListeners.forEach((l) => {
      try {
        l(current);
      } catch (err) {
        console.error('Error in posts listener:', err);
      }
    });
  }

  private addLog(level: 'info' | 'success' | 'warning' | 'error', message: string, details?: Record<string, unknown> | string): void {
    const log: MigrationLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date(),
      level,
      message,
      details,
    };
    this.logs.push(log);
    this.logListeners.forEach((l) => {
      try {
        l(log);
      } catch (err) {
        console.error('Error in log listener:', err);
      }
    });
  }

  /**
   * Computes stable session fingerprint scoped to post IDs and timestamps.
   */
  private computeSourceFingerprint(): void {
    if (this.posts.length === 0) {
      this.sourceFingerprint = null;
      return;
    }
    const sample = this.posts
      .slice(0, 50)
      .map((p) => `${p.id}:${p.timestampUnix}`)
      .join('|');

    let hash = 0;
    for (let i = 0; i < sample.length; i++) {
      const char = sample.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    this.sourceFingerprint = `ig_${Math.abs(hash).toString(16)}_${this.posts.length}`;
  }

  /**
   * Ingests an uploaded official Instagram data export (posts_1.json).
   */
  public loadArchiveJson(jsonString: string): IGMediaRecord[] {
    try {
      this.addLog('info', 'Parsing Instagram archive JSON...');
      const records = parseInstagramArchiveJson(jsonString);
      this.setPosts(records);
      this.addLog('success', `Loaded ${records.length} posts from Instagram export archive.`);
      return records;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.addLog('error', `Failed to parse Instagram archive JSON: ${msg}`);
      throw err;
    }
  }

  /**
   * Generates unsigned Kind 20 picture events for dry run inspection.
   */
  public async generateUnsignedEvents(
    _options?: Partial<InstagramMigrationOptions>,
    customPubkey?: string
  ): Promise<UnsignedNostrEvent[]> {
    const pubkey = customPubkey || nostrService.getPubkey() || '0000000000000000000000000000000000000000000000000000000000000000';
    const selected = this.posts.filter((p) => p.selected);
    const events: UnsignedNostrEvent[] = [];

    for (const post of selected) {
      const mockMediaItems: UploadedMediaItem[] = [];

      if (post.children && post.children.length > 0) {
        for (const child of post.children) {
          mockMediaItems.push({
            url: child.blossomUrl || child.media_url || 'https://blossom.primal.net/preview_child.jpg',
            sha256: child.sha256 || '0000000000000000000000000000000000000000000000000000000000000000',
            dim: child.dimensions ? `${child.dimensions.width}x${child.dimensions.height}` : '1080x1080',
            mime: child.media_type === 'VIDEO' ? 'video/mp4' : 'image/jpeg',
          });
        }
      } else {
        mockMediaItems.push({
          url: post.blossomUrls?.[0] || post.media_url || 'https://blossom.primal.net/preview.jpg',
          sha256: post.sha256Hashes?.[0] || '0000000000000000000000000000000000000000000000000000000000000000',
          dim: post.dimensions ? `${post.dimensions.width}x${post.dimensions.height}` : '1080x1080',
          mime: post.media_type === 'VIDEO' ? 'video/mp4' : 'image/jpeg',
        });
      }

      events.push(buildKind20PictureEvent(post, pubkey, mockMediaItems));
    }

    return events;
  }

  /**
   * Generates a single unsigned Kind 20 picture event for preview.
   */
  public async generateSinglePostEvent(
    postId: string,
    customPubkey?: string
  ): Promise<UnsignedNostrEvent | null> {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return null;

    const pubkey = customPubkey || nostrService.getPubkey() || '0000000000000000000000000000000000000000000000000000000000000000';
    const mockMediaItems: UploadedMediaItem[] = [];

    if (post.children && post.children.length > 0) {
      for (const child of post.children) {
        mockMediaItems.push({
          url: child.blossomUrl || child.media_url || 'https://blossom.primal.net/preview_child.jpg',
          sha256: child.sha256 || '0000000000000000000000000000000000000000000000000000000000000000',
          dim: child.dimensions ? `${child.dimensions.width}x${child.dimensions.height}` : '1080x1080',
          mime: child.media_type === 'VIDEO' ? 'video/mp4' : 'image/jpeg',
        });
      }
    } else {
      mockMediaItems.push({
        url: post.blossomUrls?.[0] || post.media_url || 'https://blossom.primal.net/preview.jpg',
        sha256: post.sha256Hashes?.[0] || '0000000000000000000000000000000000000000000000000000000000000000',
        dim: post.dimensions ? `${post.dimensions.width}x${post.dimensions.height}` : '1080x1080',
        mime: post.media_type === 'VIDEO' ? 'video/mp4' : 'image/jpeg',
      });
    }

    return buildKind20PictureEvent(post, pubkey, mockMediaItems);
  }

  /**
   * Starts the migration pipeline: downloads media, uploads to Blossom,
   * constructs strictly Kind 20 (NIP-68 Picture Posts), signs, and publishes.
   */
  public async startMigration(options: InstagramMigrationOptions): Promise<void> {
    if (this.isRunning) return;

    const pubkey = nostrService.getPubkey();
    if (!pubkey) {
      throw new Error('Nostr extension (NIP-07) not connected. Please connect your Nostr wallet first.');
    }

    const selectedPosts = this.posts.filter((p) => p.selected);
    if (selectedPosts.length === 0) {
      throw new Error('No Instagram posts selected for migration.');
    }

    this.isRunning = true;
    this.isPaused = false;
    this.isCancelled = false;

    // Session tracking setup
    const fingerprint = this.sourceFingerprint || `ig_${Date.now()}`;
    const resumeSession = options.resumeSession;
    const completedSet = new Set<string>(resumeSession?.completedBookIds || []);

    const session: ImportSession = resumeSession || {
      sessionKey: importSessionService.buildKey('instagram', pubkey, fingerprint),
      importerID: 'instagram',
      pubkeyPrefix: pubkey.substring(0, 8),
      csvFingerprint: fingerprint,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      options: options as unknown as Record<string, unknown>,
      completedBookIds: Array.from(completedSet),
      shelvesCompleted: [],
      totalBooks: selectedPosts.length,
      phase: 'in-progress',
    };
    this.activeSessionKey = session.sessionKey;
    importSessionService.saveSession(session);

    this.progress = {
      total: selectedPosts.length,
      processed: completedSet.size,
      succeeded: completedSet.size,
      failed: 0,
      skipped: 0,
      phase: 'broadcasting',
      percentage: Math.round((completedSet.size / selectedPosts.length) * 100),
    };
    this.notifyProgress();

    this.addLog('info', `Starting migration of ${selectedPosts.length} posts to Nostr (Kind 20 Picture Posts)...`);

    const blossomServers = options.blossomServers?.length > 0 ? options.blossomServers : DEFAULT_BLOSSOM_SERVERS;

    try {
      for (let i = 0; i < selectedPosts.length; i++) {
        if (this.isCancelled) {
          this.addLog('warning', 'Migration cancelled by user.');
          break;
        }

        while (this.isPaused) {
          this.progress.phase = 'paused';
          this.notifyProgress();
          await new Promise((r) => setTimeout(r, 300));
          if (this.isCancelled) break;
        }

        const post = selectedPosts[i];
        if (completedSet.has(post.id)) {
          this.progress.skipped++;
          continue;
        }

        this.progress.currentTitle = post.caption ? post.caption.slice(0, 40) : `Post ${post.id}`;
        this.notifyProgress();

        try {
          const uploadedItems: UploadedMediaItem[] = [];

          if (post.children && post.children.length > 0) {
            // Upload all carousel album slides
            for (let c = 0; c < post.children.length; c++) {
              const child = post.children[c];
              let blob = child.fileBlob;
              if (!blob && child.media_url) {
                try {
                  blob = await downloadMediaBinary(child.media_url);
                  child.fileBlob = blob;
                } catch (downloadErr) {
                  this.addLog('warning', `Could not download carousel slide ${c + 1} for post ${post.id}: ${downloadErr}`);
                }
              }

              if (blob && options.uploadToBlossom) {
                const uploaded = await blossomService.uploadBlob(blob, pubkey, blossomServers);
                child.blossomUrl = uploaded.url;
                child.sha256 = uploaded.sha256;

                const dims = await calculateImageDimensions(blob);
                if (dims) child.dimensions = dims;

                uploadedItems.push({
                  url: uploaded.url,
                  sha256: uploaded.sha256,
                  mime: blob.type,
                  dim: dims ? `${dims.width}x${dims.height}` : undefined,
                });
              } else {
                uploadedItems.push({
                  url: child.media_url || '',
                  sha256: child.sha256 || '',
                  mime: child.media_type === 'VIDEO' ? 'video/mp4' : 'image/jpeg',
                });
              }
            }
          } else {
            // Upload single image or video
            let blob = post.fileBlob;
            if (!blob && post.media_url) {
              try {
                blob = await downloadMediaBinary(post.media_url);
                post.fileBlob = blob;
              } catch (downloadErr) {
                this.addLog('warning', `Could not download media for post ${post.id}: ${downloadErr}`);
              }
            }

            if (blob && options.uploadToBlossom) {
              const uploaded = await blossomService.uploadBlob(blob, pubkey, blossomServers);
              post.blossomUrls = [uploaded.url];
              post.sha256Hashes = [uploaded.sha256];

              const dims = await calculateImageDimensions(blob);
              if (dims) post.dimensions = dims;

              uploadedItems.push({
                url: uploaded.url,
                sha256: uploaded.sha256,
                mime: blob.type,
                dim: dims ? `${dims.width}x${dims.height}` : undefined,
              });
            } else {
              uploadedItems.push({
                url: post.media_url || '',
                sha256: post.sha256Hashes?.[0] || '',
                mime: post.media_type === 'VIDEO' ? 'video/mp4' : 'image/jpeg',
              });
            }
          }

          // Build unsigned NIP-68 (Kind 20) picture event
          const unsignedEvent = buildKind20PictureEvent(post, pubkey, uploadedItems);

          // Sign event via NIP-07
          const signedEvent: SignedNostrEvent = await nostrService.signEvent(unsignedEvent);

          // Publish to active Nostr relays
          await nostrService.publishEvent(signedEvent);

          completedSet.add(post.id);
          session.completedBookIds = Array.from(completedSet);
          session.updatedAt = new Date().toISOString();
          importSessionService.saveSession(session);

          this.progress.succeeded++;
          this.progress.processed++;
          this.progress.percentage = Math.round((this.progress.processed / this.progress.total) * 100);
          this.notifyProgress();

          this.addLog('success', `Published Kind 20 picture event for post ${post.id} (${post.caption ? post.caption.slice(0, 30) + '...' : 'Photo'})`);
        } catch (postErr: unknown) {
          const msg = postErr instanceof Error ? postErr.message : String(postErr);
          this.addLog('error', `Failed to migrate post ${post.id}: ${msg}`);
          this.progress.failed++;
          this.progress.processed++;
          this.notifyProgress();
        }

        // Polite delay between Nostr events
        await new Promise((r) => setTimeout(r, 150));
      }

      session.phase = this.isCancelled ? 'in-progress' : 'completed';
      importSessionService.saveSession(session);

      this.progress.phase = this.isCancelled ? 'idle' : 'completed';
      this.notifyProgress();
      this.addLog('success', `Migration complete: ${this.progress.succeeded} posts published to Nostr.`);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Generates a sovereign JSON-L export of all selected posts formatted as Nostr Kind 20 events.
   */
  public async exportBackupBundle(pubkey?: string): Promise<string> {
    const events = await this.generateUnsignedEvents({}, pubkey);
    return events.map((e) => JSON.stringify(e)).join('\n');
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
  }

  public cancel(): void {
    this.isCancelled = true;
    this.isPaused = false;
  }

  public reset(): void {
    this.posts = [];
    this.logs = [];
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
    this.notifyProgress();
    this.notifyPostsChange();
  }
}

export const instagramPipeline = new InstagramPipeline();
