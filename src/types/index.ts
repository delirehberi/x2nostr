/**
 * Core type definitions for x2nostr
 */

export type SupportedLocale = 'en' | 'tr' | 'es';

export type ShelfCategory = 'read' | 'currently-reading' | 'to-read' | 'custom';

export interface BookRecord {
  id: string;
  bookId: string;
  title: string;
  author: string;
  additionalAuthors?: string;
  isbn: string;
  isbn13: string;
  myRating: number; // 0-5
  averageRating?: number;
  publisher?: string;
  binding?: string;
  pageCount?: number;
  yearPublished?: number;
  originalPublicationYear?: number;
  dateRead?: string;
  dateAdded: string;
  bookshelves: string;
  bookshelvesWithPositions?: string;
  exclusiveShelf: ShelfCategory;
  myReview?: string;
  spoiler?: string;
  privateNotes?: string;
  readCount?: number;
  ownedCopies?: number;
  
  // Metadata enrichment
  openLibraryWorkId?: string;
  openLibraryEditionId?: string;
  coverUrl?: string;
  metadataResolved?: boolean;
  selected?: boolean;
}

export type MovieTitleType = 'Movie' | 'TV Series' | 'TV Mini Series' | 'TV Episode' | 'Short' | 'TV Special' | 'Video Game' | 'Video' | 'Other';

export interface MovieRecord {
  id: string;
  omdbId: string; // Universal title ID e.g. tt32565993
  title: string;
  originalTitle?: string;
  myRating: number; // 0-10
  dateRated?: string; // YYYY-MM-DD
  url?: string;
  titleType: MovieTitleType;
  communityRating?: number; // e.g. 7.4
  runtimeMins?: number; // e.g. 109
  year?: number; // e.g. 2026
  genres: string[]; // e.g. ["Comedy", "Mystery", "Family"]
  numVotes?: number; // e.g. 104821
  releaseDate?: string; // e.g. "2026-05-08"
  directors: string[]; // e.g. ["Kyle Balda"]
  posterUrl?: string;
  selected?: boolean;
}

export type MovieFilterCategory = 'all' | 'movie' | 'tv' | 'episode' | 'high-rated' | 'unrated';

export interface MovieMigrationOptions {
  generateCuratedLists: boolean; // Kind 30003 (NIP-51) Cinema/TV Curated Sets
  generateReviewEvents: boolean; // Kind 31985 (NIP-32 / Reviews & Ratings)
  deletePreviousReviewsBeforeImport?: boolean; // NIP-09 Kind 5 deletion
  publishToCustomRelaysOnly: boolean;
  resumeSession?: ImportSession;
}

export interface WordPressPostRecord {
  id: string;
  wpPostId: string;
  title: string;
  slug: string;
  contentHtml: string;
  contentMarkdown: string;
  summary: string;
  author: string;
  publishedDate: string;
  publishedAtTimestamp: number;
  postType: string; // e.g. 'post' | 'page'
  status: string; // e.g. 'publish' | 'draft'
  categories: string[];
  tags: string[];
  featuredImageUrl?: string;
  imageUrls: string[];
  selected?: boolean;
  blossomCoverUrl?: string;
  blossomImageMap?: Record<string, string>;
}

export interface WordPressMigrationOptions {
  generateKind30023: boolean; // Kind 30023 Long-Form Articles
  uploadImagesToBlossom: boolean;
  blossomServers: string[];
  includeDrafts: boolean;
  deletePreviousPostsBeforeImport?: boolean; // NIP-09 Kind 5 deletion of Kind 30023 events
  publishToCustomRelaysOnly: boolean;
  resumeSession?: ImportSession;
}

export interface LinkedInArticleRecord {
  id: string;
  articleId: string;
  title: string;
  slug: string;
  canonicalUrl?: string;
  contentHtml: string;
  contentMarkdown: string;
  summary: string;
  author: string;
  createdDate?: string;
  publishedDate: string;
  publishedAtTimestamp: number;
  coverImageUrl?: string;
  imageUrls: string[];
  tags: string[];
  selected?: boolean;
  blossomCoverUrl?: string;
  blossomImageMap?: Record<string, string>;
}

export interface LinkedInMigrationOptions {
  generateKind30023: boolean; // Kind 30023 Long-Form Articles
  uploadImagesToBlossom: boolean;
  blossomServers: string[];
  deletePreviousArticlesBeforeImport?: boolean; // NIP-09 Kind 5 deletion of Kind 30023 events
  publishToCustomRelaysOnly: boolean;
  resumeSession?: ImportSession;
}

export interface GistSnippetRecord {
  id: string; // Internal unique ID
  gistId: string; // GitHub Gist ID or source identifier
  name: string; // Filename (e.g. 'quicksort.py', 'server.ts')
  extension: string; // Extension without dot (e.g. 'py', 'ts')
  language: string; // Lowercase language identifier (e.g. 'python', 'typescript')
  description: string; // Summary of what the code does
  content: string; // Raw code snippet text
  runtime?: string; // e.g. 'node v22', 'python 3.12'
  license?: string; // SPDX identifier e.g. 'MIT', 'Apache-2.0'
  dependencies?: string[];
  repoUrl?: string; // Original URL e.g. https://gist.github.com/alice/12345
  rawUrl?: string; // CDN raw file URL
  createdAtTimestamp: number; // Unix timestamp in seconds
  sizeBytes: number;
  isPublic: boolean; // true = public gist, false = secret/private gist
  selected?: boolean;
  tags?: string[];
}

export type GistFilterCategory = 'all' | 'public' | 'secret';

export interface GistMigrationOptions {
  generateKind1337: boolean; // NIP-C0 Kind 1337 for public snippets
  encryptPrivateGists: boolean; // NIP-44 self-encryption into Kind 30078 for secret gists
  defaultLicense?: string; // Default SPDX license (e.g. 'MIT')
  defaultRuntime?: string; // Default runtime environment
  publishToCustomRelaysOnly: boolean;
  deletePreviousSnippetsBeforeImport?: boolean; // NIP-09 Kind 5 deletion
  resumeSession?: ImportSession;
}

export type IGMediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
export type IGMediaProductType = 'FEED' | 'STORY' | 'REELS' | 'AD';

export interface IGMediaChild {
  id: string;
  media_type: 'IMAGE' | 'VIDEO';
  media_url?: string;
  thumbnail_url?: string;
  timestamp?: string;
  // Local enrichment
  fileBlob?: Blob;
  dimensions?: { width: number; height: number };
  blossomUrl?: string;
  sha256?: string;
}

export interface IGMediaRecord {
  id: string;
  caption?: string;
  media_type: IGMediaType;
  media_url?: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string; // ISO 8601
  timestampUnix: number; // Unix seconds
  media_product_type?: IGMediaProductType;
  shortcode?: string;
  like_count?: number;
  comments_count?: number;
  is_comment_enabled?: boolean;
  children?: IGMediaChild[];
  tags: string[]; // Extracted hashtags
  selected?: boolean;
  
  // Media enrichment & Blossom state
  fileBlob?: Blob;
  dimensions?: { width: number; height: number };
  blossomUrls?: string[];
  sha256Hashes?: string[];
}

export type InstagramFilterCategory = 'all' | 'image' | 'carousel' | 'video';

export interface InstagramMigrationOptions {
  uploadToBlossom: boolean;
  blossomServers: string[];
  includeCaptions: boolean;
  includeOriginalTimestamp: boolean;
  deletePreviousPostsBeforeImport?: boolean; // NIP-09 Kind 5 deletion of Kind 20 events
  publishToCustomRelaysOnly: boolean;
  resumeSession?: ImportSession;
}

export interface UnsignedNostrEvent {
  kind: number;
  created_at: number;
  tags: string[][];
  content: string;
  pubkey: string;
}

export interface SignedNostrEvent extends UnsignedNostrEvent {
  id: string;
  sig: string;
}

export interface RelayConfig {
  url: string;
  read: boolean;
  write: boolean;
  status?: 'connecting' | 'connected' | 'error' | 'disconnected';
  latencyMs?: number;
  error?: string;
}

export interface MigrationProgress {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  currentTitle?: string;
  phase: 'idle' | 'parsing' | 'resolving' | 'signing' | 'broadcasting' | 'completed' | 'paused' | 'error';
  percentage: number;
  enrichment?: {
    enriched: number;
    total: number;
  };
}

export interface MigrationLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details?: Record<string, unknown> | string;
}

export interface MigrationOptions {
  generateShelfLists: boolean; // Kind 30003 (NIP-51) & Kinds 10073-10075 (Bookstr)
  generateReviewEvents: boolean; // Kind 31985 (NIP-32 / Bookstr)
  deletePreviousReviewsBeforeImport?: boolean; // NIP-09 Kind 5 deletion of previous review events
  selectedShelves: ShelfCategory[];
  publishToCustomRelaysOnly: boolean;
  /**
   * When provided, the pipeline resumes from this session, skipping
   * books and shelves that were already successfully published.
   */
  resumeSession?: ImportSession;
}

/**
 * Persisted progress ledger stored in localStorage.
 * Scoped to: importer + pubkey prefix + CSV content fingerprint.
 * This prevents duplicate Nostr events when an import is interrupted
 * and the user re-uploads the same file to continue later.
 */
export interface ImportSession {
  /** Composite key used as the localStorage key. */
  sessionKey: string;
  importerID: string;
  /** First 8 hex characters of the connected pubkey. */
  pubkeyPrefix: string;
  /**
   * SHA-256 hex digest of the first 512 bytes of the CSV concatenated
   * with the file's byte size. Stable across re-uploads of the same file.
   */
  csvFingerprint: string;
  createdAt: string;
  updatedAt: string;
  options: Record<string, unknown>;
  /** Item id values (books/movies) whose review events were successfully published. */
  completedBookIds: string[];
  /** Shelf / list names whose list events were successfully published. */
  shelvesCompleted: string[];
  /** Total items in the session (used for resume banner display). */
  totalBooks: number;
  phase: 'in-progress' | 'completed';
}

export interface ImporterPlugin<TRow = unknown, TEvent = unknown> {
  readonly id: string;
  readonly name: string;
  readonly descriptionKey: string;
  readonly icon: string;
  readonly targetPlatform: string;
  readonly targetKindDescription: string;
  readonly status: 'active' | 'coming-soon' | 'beta';
  readonly acceptedFileTypes: string[];
  
  parseFile(file: File): Promise<TRow[]>;
  resolveMetadata?(row: TRow, onProgress?: (status: string) => void): Promise<TRow>;
  buildEvent(row: TRow, pubkey: string): Promise<TEvent> | TEvent;
}

export interface NostrUserProfile {
  pubkey: string;
  npub: string;
  name?: string;
  displayName?: string;
  about?: string;
  picture?: string;
  banner?: string;
  nip05?: string;
  lud16?: string;
  /** Resolved display label: display_name → name → truncated npub */
  username: string;
}
