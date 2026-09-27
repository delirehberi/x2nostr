/**
 * Core type definitions for NIP-23 content conversion API & parsers.
 */

export type SupportedPlatform =
  | 'wordpress'
  | 'ghost'
  | 'hugo'
  | 'medium'
  | 'substack'
  | 'markdown';

export interface UnsignedNip23Event {
  kind: 30023;
  created_at: number;
  tags: string[][];
  content: string;
}

export interface ConvertApiResponse {
  success: boolean;
  platform: SupportedPlatform;
  totalPosts: number;
  events: UnsignedNip23Event[];
  error?: string;
}

export interface ConvertedPostRecord {
  title: string;
  slug: string;
  contentMarkdown: string;
  publishedAtTimestamp: number;
  summary?: string;
  featuredImageUrl?: string;
  imageUrls: string[];
  tags: string[];
  categories?: string[];
  author?: string;
}
