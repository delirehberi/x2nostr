import {
  IGMediaChild,
  IGMediaRecord,
  ImportSession,
  InstagramFilterCategory,
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
import { imageConverter } from '../../services/image-converter';

type ProgressListener = (progress: MigrationProgress) => void;
type LogListener = (log: MigrationLog) => void;
type PostsChangeListener = (posts: IGMediaRecord[]) => void;

export interface InstagramConversionProgress {
  active: boolean;
  current: number;
  total: number;
  filename?: string;
  percentage: number;
}
export type InstagramConversionProgressListener = (progress: InstagramConversionProgress) => void;

function inferMimeType(filename?: string, blob?: Blob, defaultType = 'image/jpeg'): string {
  if (blob && blob.type && blob.type !== 'application/octet-stream') {
    return blob.type;
  }
  if (!filename) return defaultType;
  const lower = filename.toLowerCase();
  if (lower.endsWith('.heic') || lower.endsWith('.heif')) return 'image/heic';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.mp4')) return 'video/mp4';
  if (lower.endsWith('.mov')) return 'video/quicktime';
  if (lower.endsWith('.webm')) return 'video/webm';
  return defaultType;
}

class InstagramPipeline {
  private posts: IGMediaRecord[] = [];
  private logs: MigrationLog[] = [];
  private isPaused = false;
  private isCancelled = false;
  private isRunning = false;

  private sourceFingerprint: string | null = null;
  private activeSessionKey: string | null = null;
  private backgroundConversionAbortController: AbortController | null = null;

  private progress: MigrationProgress = {
    total: 0,
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    phase: 'idle',
    percentage: 0,
  };

  private conversionProgress: InstagramConversionProgress = {
    active: false,
    current: 0,
    total: 0,
    percentage: 0,
  };

  private progressListeners: Set<ProgressListener> = new Set();
  private logListeners: Set<LogListener> = new Set();
  private postsListeners: Set<PostsChangeListener> = new Set();
  private conversionListeners: Set<InstagramConversionProgressListener> = new Set();

  public getPosts(): IGMediaRecord[] {
    return [...this.posts];
  }

  public getLogs(): MigrationLog[] {
    return [...this.logs];
  }

  public getProgress(): MigrationProgress {
    return { ...this.progress };
  }

  public getConversionProgress(): InstagramConversionProgress {
    return { ...this.conversionProgress };
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

  public selectByCategory(category: InstagramFilterCategory, selected: boolean): void {
    this.posts.forEach((p) => {
      let matches = false;
      if (category === 'all') matches = true;
      else if (category === 'image') matches = p.media_type === 'IMAGE' && p.media_product_type !== 'STORY';
      else if (category === 'carousel') matches = p.media_type === 'CAROUSEL_ALBUM';
      else if (category === 'video') matches = p.media_type === 'VIDEO' || p.media_product_type === 'REELS';
      else if (category === 'story') matches = p.media_product_type === 'STORY';

      if (matches) {
        p.selected = selected;
      }
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

  public subscribeConversionProgress(listener: InstagramConversionProgressListener): () => void {
    this.conversionListeners.add(listener);
    return () => this.conversionListeners.delete(listener);
  }

  private notifyProgress(): void {
    const p = { ...this.progress };
    this.progressListeners.forEach((l) => {
      try {
        l(p);
      } catch (err) {
        console.error('Error notifying progress listener:', err);
      }
    });
  }

  private notifyConversionProgress(): void {
    const cp = { ...this.conversionProgress };
    this.conversionListeners.forEach((l) => {
      try {
        l(cp);
      } catch (err) {
        console.error('Error notifying conversion listener:', err);
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

  private activeObjectUrls: Set<string> = new Set();

  private clearObjectUrls(): void {
    if (this.backgroundConversionAbortController) {
      this.backgroundConversionAbortController.abort();
      this.backgroundConversionAbortController = null;
    }
    imageConverter.clearCache();

    if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
      for (const url of this.activeObjectUrls) {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore revocation errors
        }
      }
    }
    this.activeObjectUrls.clear();
  }

  /**
   * Ingests an uploaded official Instagram data export JSON string.
   */
  public loadArchiveJson(jsonString: string): IGMediaRecord[] {
    try {
      this.clearObjectUrls();
      this.addLog('info', 'Parsing Instagram archive JSON...');
      const records = parseInstagramArchiveJson(jsonString);
      for (const rec of records) {
        rec.originalPath = rec.media_url;
        rec.filename = rec.media_url?.split('/').pop();
        if (rec.children) {
          for (const child of rec.children) {
            child.originalPath = child.media_url;
            child.filename = child.media_url?.split('/').pop();
          }
        }
      }
      this.setPosts(records);
      this.addLog('success', `Loaded ${records.length} posts from Instagram export.`);
      return records;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.addLog('error', `Failed to parse Instagram archive JSON: ${msg}`);
      throw err;
    }
  }

  /**
   * Ingests an extracted Meta export folder (containing posts_1.json, posts.json, reels.json, media/...).
   * Indexes local File handles by normalized relative path and associates them with records on-demand.
   */
  public async loadExportFolder(files: FileList | File[]): Promise<IGMediaRecord[]> {
    this.clearObjectUrls();
    const fileList = Array.from(files);
    this.addLog('info', `Scanning ${fileList.length} files from export folder...`);

    // Map files by normalized relative path (e.g., 'media/posts/123.heic') and by basename ('123.heic')
    const pathMap = new Map<string, File>();
    const nameMap = new Map<string, File>();
    const jsonCandidates: File[] = [];

    for (const f of fileList) {
      const relPath = (f.webkitRelativePath || f.name).replace(/\\/g, '/').toLowerCase();
      pathMap.set(relPath, f);

      // Map all sub-paths (e.g., folder_name/media/posts/1.jpg -> media/posts/1.jpg)
      const parts = relPath.split('/');
      for (let i = 1; i < parts.length; i++) {
        pathMap.set(parts.slice(i).join('/'), f);
      }

      nameMap.set(f.name.toLowerCase(), f);

      if (f.name.endsWith('.json')) {
        const lower = f.name.toLowerCase();
        if (
          lower === 'posts_1.json' ||
          lower === 'posts.json' ||
          lower === 'reels.json' ||
          lower === 'archived_posts.json' ||
          lower === 'stories.json'
        ) {
          jsonCandidates.push(f);
        }
      }
    }

    if (jsonCandidates.length === 0) {
      // Fallback: search for any JSON file
      for (const f of fileList) {
        if (f.name.endsWith('.json') && !jsonCandidates.includes(f)) {
          jsonCandidates.push(f);
        }
      }
    }

    if (jsonCandidates.length === 0) {
      // If we already have posts loaded and the user selected media files/folder, attach them!
      if (this.posts.length > 0) {
        const linked = this.attachMediaFiles(fileList);
        if (linked > 0) return this.posts;
      }
      throw new Error('No Instagram activity JSON files (posts_1.json, posts.json, reels.json) found in selected folder.');
    }

    const allRecords: IGMediaRecord[] = [];

    for (const jsonFile of jsonCandidates) {
      try {
        const text = await jsonFile.text();
        const records = parseInstagramArchiveJson(text);
        this.addLog('info', `Parsed ${records.length} items from ${jsonFile.name}`);
        allRecords.push(...records);
      } catch (err) {
        this.addLog('warning', `Could not parse ${jsonFile.name}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // Deduplicate by ID or timestamp + media_url
    const uniqueMap = new Map<string, IGMediaRecord>();
    for (const rec of allRecords) {
      const key = `${rec.id}-${rec.timestampUnix}-${rec.media_url}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, rec);
      }
    }

    const finalRecords = Array.from(uniqueMap.values());

    // Associate disk File Blobs with records and carousel children
    const resolveFile = (uri?: string): File | undefined => {
      if (!uri) return undefined;
      const cleanUri = uri.replace(/\\/g, '/').toLowerCase();
      if (pathMap.has(cleanUri)) return pathMap.get(cleanUri);
      const filename = cleanUri.split('/').pop();
      if (filename && nameMap.has(filename)) return nameMap.get(filename);
      return undefined;
    };

    let matchedMediaCount = 0;
    for (const rec of finalRecords) {
      rec.originalPath = rec.media_url;
      rec.filename = rec.media_url?.split('/').pop();

      const mainFile = resolveFile(rec.originalPath);
      if (mainFile) {
        rec.fileBlob = mainFile;
        if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
          const blobUrl = URL.createObjectURL(mainFile);
          this.activeObjectUrls.add(blobUrl);
          rec.media_url = blobUrl;
          rec.thumbnail_url = blobUrl;
        }
        matchedMediaCount++;
      }

      if (rec.children && rec.children.length > 0) {
        for (const child of rec.children) {
          child.originalPath = child.media_url;
          child.filename = child.media_url?.split('/').pop();

          const childFile = resolveFile(child.originalPath);
          if (childFile) {
            child.fileBlob = childFile;
            if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
              const childBlobUrl = URL.createObjectURL(childFile);
              this.activeObjectUrls.add(childBlobUrl);
              child.media_url = childBlobUrl;
              child.thumbnail_url = childBlobUrl;
            }
          }
        }
      }
    }

    this.setPosts(finalRecords);
    this.addLog('success', `Loaded ${finalRecords.length} posts/reels. Matched ${matchedMediaCount} media assets from disk.`);
    return finalRecords;
  }

  /**
   * Attaches local media files (e.g. video files, photos dropped or selected incrementally)
   * to already loaded JSON records.
   */
  public attachMediaFiles(files: FileList | File[]): number {
    const fileList = Array.from(files);
    if (fileList.length === 0 || this.posts.length === 0) return 0;

    const pathMap = new Map<string, File>();
    const nameMap = new Map<string, File>();

    for (const f of fileList) {
      const relPath = (f.webkitRelativePath || f.name).replace(/\\/g, '/').toLowerCase();
      pathMap.set(relPath, f);

      const parts = relPath.split('/');
      for (let i = 1; i < parts.length; i++) {
        pathMap.set(parts.slice(i).join('/'), f);
      }
      nameMap.set(f.name.toLowerCase(), f);
    }

    const resolveFile = (uri?: string): File | undefined => {
      if (!uri) return undefined;
      const cleanUri = uri.replace(/\\/g, '/').toLowerCase();
      if (pathMap.has(cleanUri)) return pathMap.get(cleanUri);
      const filename = cleanUri.split('/').pop();
      if (filename && nameMap.has(filename)) return nameMap.get(filename);
      return undefined;
    };

    let matchedCount = 0;
    for (const rec of this.posts) {
      const mainFile = resolveFile(rec.originalPath || rec.media_url);
      if (mainFile && !rec.fileBlob) {
        rec.fileBlob = mainFile;
        if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
          const blobUrl = URL.createObjectURL(mainFile);
          this.activeObjectUrls.add(blobUrl);
          rec.media_url = blobUrl;
          rec.thumbnail_url = blobUrl;
        }
        matchedCount++;
      }

      if (rec.children && rec.children.length > 0) {
        for (const child of rec.children) {
          const childFile = resolveFile(child.originalPath || child.media_url);
          if (childFile && !child.fileBlob) {
            child.fileBlob = childFile;
            if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
              const childBlobUrl = URL.createObjectURL(childFile);
              this.activeObjectUrls.add(childBlobUrl);
              child.media_url = childBlobUrl;
              child.thumbnail_url = childBlobUrl;
            }
            matchedCount++;
          }
        }
      }
    }

    if (matchedCount > 0) {
      this.notifyPostsChange();
      this.addLog('success', `Linked ${matchedCount} media files from disk.`);
    }

    return matchedCount;
  }

  /**
   * Counts how many HEIC assets in loaded posts have not yet been converted.
   */
  public countUnconvertedHeic(): number {
    let count = 0;
    for (const post of this.posts) {
      if (post.children && post.children.length > 0) {
        for (const child of post.children) {
          const blob = child.fileBlob;
          const path = child.filename || child.originalPath || child.media_url;
          const isConverted = child.media_url?.startsWith('blob:') && !child.media_url?.toLowerCase().endsWith('.heic');
          if (blob && imageConverter.isHeic(path, blob) && !isConverted) {
            count++;
          }
        }
      } else {
        const blob = post.fileBlob;
        const path = post.filename || post.originalPath || post.media_url;
        const isConverted = post.media_url?.startsWith('blob:') && !post.media_url?.toLowerCase().endsWith('.heic');
        if (blob && imageConverter.isHeic(path, blob) && !isConverted) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Stops active background media conversion worker and resets conversion progress.
   */
  public cancelBackgroundMediaConversion(): void {
    if (this.backgroundConversionAbortController) {
      this.backgroundConversionAbortController.abort();
      this.backgroundConversionAbortController = null;
    }
    imageConverter.terminateWorker();
    this.conversionProgress = {
      active: false,
      current: this.conversionProgress.current,
      total: this.conversionProgress.total,
      percentage: this.conversionProgress.percentage,
    };
    this.notifyConversionProgress();
    this.addLog('info', 'HEIC background conversion stopped.');
  }

  /**
   * Sequentially converts HEIC assets in the background, updating media URLs and post thumbnails
   * in real-time so images display natively in browser gallery immediately.
   */
  public async startBackgroundMediaConversion(records: IGMediaRecord[]): Promise<void> {
    if (this.backgroundConversionAbortController) {
      this.backgroundConversionAbortController.abort();
    }
    this.backgroundConversionAbortController = new AbortController();
    const signal = this.backgroundConversionAbortController.signal;

    interface ConversionTarget {
      mediaRecord: IGMediaRecord | IGMediaChild;
      parentPost?: IGMediaRecord;
      blob: Blob;
      cacheKey: string;
      filename: string;
    }

    const targets: ConversionTarget[] = [];

    for (const post of records) {
      if (post.children && post.children.length > 0) {
        post.children.forEach((child, idx) => {
          const blob = child.fileBlob;
          const path = child.filename || child.originalPath || child.media_url;
          if (blob && imageConverter.isHeic(path, blob)) {
            const cacheKey = child.originalPath || child.filename || child.id;
            targets.push({
              mediaRecord: child,
              parentPost: idx === 0 ? post : undefined,
              blob,
              cacheKey,
              filename: child.filename || child.originalPath?.split('/').pop() || 'photo.heic',
            });
          }
        });
      } else {
        const blob = post.fileBlob;
        const path = post.filename || post.originalPath || post.media_url;
        if (blob && imageConverter.isHeic(path, blob)) {
          const cacheKey = post.originalPath || post.filename || post.id;
          targets.push({
            mediaRecord: post,
            blob,
            cacheKey,
            filename: post.filename || post.originalPath?.split('/').pop() || 'photo.heic',
          });
        }
      }
    }

    if (targets.length === 0) {
      this.conversionProgress = {
        active: false,
        current: 0,
        total: 0,
        percentage: 100,
      };
      this.notifyConversionProgress();
      return;
    }

    this.conversionProgress = {
      active: true,
      current: 0,
      total: targets.length,
      percentage: 0,
    };
    this.notifyConversionProgress();

    for (let i = 0; i < targets.length; i++) {
      if (signal.aborted) break;
      const target = targets[i];

      try {
        const result = await imageConverter.convertHeicToJpeg(target.blob, target.cacheKey);
        if (signal.aborted) break;

        target.mediaRecord.media_url = result.url;
        target.mediaRecord.thumbnail_url = result.url;
        if (target.parentPost) {
          target.parentPost.thumbnail_url = result.url;
        }
      } catch (err) {
        console.warn(`[InstagramPipeline] Could not convert HEIC ${target.filename}:`, err);
      }

      this.conversionProgress = {
        active: true,
        current: i + 1,
        total: targets.length,
        filename: target.filename,
        percentage: Math.round(((i + 1) / targets.length) * 100),
      };
      this.notifyConversionProgress();
      this.notifyPostsChange();
    }

    if (!signal.aborted) {
      this.conversionProgress = {
        active: false,
        current: targets.length,
        total: targets.length,
        percentage: 100,
      };
      this.notifyConversionProgress();
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
          const mime = inferMimeType(child.media_url, child.fileBlob, child.media_type === 'VIDEO' ? 'video/mp4' : 'image/jpeg');
          mockMediaItems.push({
            url: child.blossomUrl || child.media_url || 'https://blossom.primal.net/preview_child.jpg',
            sha256: child.sha256 || '0000000000000000000000000000000000000000000000000000000000000000',
            dim: child.dimensions ? `${child.dimensions.width}x${child.dimensions.height}` : '1080x1080',
            mime,
          });
        }
      } else {
        const mime = inferMimeType(post.media_url, post.fileBlob, post.media_type === 'VIDEO' ? 'video/mp4' : 'image/jpeg');
        mockMediaItems.push({
          url: post.blossomUrls?.[0] || post.media_url || 'https://blossom.primal.net/preview.jpg',
          sha256: post.sha256Hashes?.[0] || '0000000000000000000000000000000000000000000000000000000000000000',
          dim: post.dimensions ? `${post.dimensions.width}x${post.dimensions.height}` : '1080x1080',
          mime,
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
        const mime = inferMimeType(child.media_url, child.fileBlob, child.media_type === 'VIDEO' ? 'video/mp4' : 'image/jpeg');
        mockMediaItems.push({
          url: child.blossomUrl || child.media_url || 'https://blossom.primal.net/preview_child.jpg',
          sha256: child.sha256 || '0000000000000000000000000000000000000000000000000000000000000000',
          dim: child.dimensions ? `${child.dimensions.width}x${child.dimensions.height}` : '1080x1080',
          mime,
        });
      }
    } else {
      const mime = inferMimeType(post.media_url, post.fileBlob, post.media_type === 'VIDEO' ? 'video/mp4' : 'image/jpeg');
      mockMediaItems.push({
        url: post.blossomUrls?.[0] || post.media_url || 'https://blossom.primal.net/preview.jpg',
        sha256: post.sha256Hashes?.[0] || '0000000000000000000000000000000000000000000000000000000000000000',
        dim: post.dimensions ? `${post.dimensions.width}x${post.dimensions.height}` : '1080x1080',
        mime,
      });
    }

    return buildKind20PictureEvent(post, pubkey, mockMediaItems);
  }

  /**
   * Starts the migration pipeline: downloads/reads media, uploads to Blossom,
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
              if (!blob && child.media_url && child.media_url.startsWith('http')) {
                try {
                  blob = await downloadMediaBinary(child.media_url);
                  child.fileBlob = blob;
                } catch (downloadErr) {
                  this.addLog('warning', `Could not download carousel slide ${c + 1} for post ${post.id}: ${downloadErr}`);
                }
              }

              // Check if HEIC conversion to JPEG is requested
              if (blob && (options.convertHeicToJpeg ?? true) && imageConverter.isHeic(child.filename || child.originalPath, blob)) {
                this.addLog('info', `Converting carousel slide ${c + 1} (${child.filename || 'HEIC'}) to JPEG...`);
                try {
                  const converted = await imageConverter.convertHeicToJpeg(blob, `${post.id}-child-${c}`);
                  blob = converted.blob;
                } catch (convErr) {
                  this.addLog('warning', `HEIC conversion fallback for ${child.filename}: ${convErr}`);
                }
              }

              const mime = inferMimeType(blob?.type === 'image/jpeg' ? 'photo.jpg' : child.media_url, blob, child.media_type === 'VIDEO' ? 'video/mp4' : 'image/jpeg');

              if (blob && options.uploadToBlossom) {
                const uploaded = await blossomService.uploadBlob(blob, pubkey, blossomServers);
                child.blossomUrl = uploaded.url;
                child.sha256 = uploaded.sha256;

                const dims = await calculateImageDimensions(blob);
                if (dims) child.dimensions = dims;

                uploadedItems.push({
                  url: uploaded.url,
                  sha256: uploaded.sha256,
                  mime,
                  dim: dims ? `${dims.width}x${dims.height}` : undefined,
                });
              } else {
                uploadedItems.push({
                  url: child.blossomUrl || child.media_url || '',
                  sha256: child.sha256 || '',
                  mime,
                });
              }
            }
          } else {
            // Upload single image or video
            let blob = post.fileBlob;
            if (!blob && post.media_url && post.media_url.startsWith('http')) {
              try {
                blob = await downloadMediaBinary(post.media_url);
                post.fileBlob = blob;
              } catch (downloadErr) {
                this.addLog('warning', `Could not download media for post ${post.id}: ${downloadErr}`);
              }
            }

            // Check if HEIC conversion to JPEG is requested
            if (blob && (options.convertHeicToJpeg ?? true) && imageConverter.isHeic(post.filename || post.originalPath, blob)) {
              this.addLog('info', `Converting photo (${post.filename || 'HEIC'}) to JPEG...`);
              try {
                const converted = await imageConverter.convertHeicToJpeg(blob, post.id);
                blob = converted.blob;
              } catch (convErr) {
                this.addLog('warning', `HEIC conversion fallback for ${post.filename}: ${convErr}`);
              }
            }

            const mime = inferMimeType(blob?.type === 'image/jpeg' ? 'photo.jpg' : post.media_url, blob, post.media_type === 'VIDEO' ? 'video/mp4' : 'image/jpeg');

            if (blob && options.uploadToBlossom) {
              const uploaded = await blossomService.uploadBlob(blob, pubkey, blossomServers);
              post.blossomUrls = [uploaded.url];
              post.sha256Hashes = [uploaded.sha256];

              const dims = await calculateImageDimensions(blob);
              if (dims) post.dimensions = dims;

              uploadedItems.push({
                url: uploaded.url,
                sha256: uploaded.sha256,
                mime,
                dim: dims ? `${dims.width}x${dims.height}` : undefined,
              });
            } else {
              uploadedItems.push({
                url: post.blossomUrls?.[0] || post.media_url || '',
                sha256: post.sha256Hashes?.[0] || '',
                mime,
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
    if (this.backgroundConversionAbortController) {
      this.backgroundConversionAbortController.abort();
      this.backgroundConversionAbortController = null;
    }
    imageConverter.clearCache();
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
    this.conversionProgress = {
      active: false,
      current: 0,
      total: 0,
      percentage: 0,
    };
    this.notifyProgress();
    this.notifyConversionProgress();
    this.notifyPostsChange();
  }
}

export const instagramPipeline = new InstagramPipeline();
