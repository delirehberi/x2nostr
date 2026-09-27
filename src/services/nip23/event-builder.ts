import { ConvertedPostRecord, UnsignedNip23Event } from './types';

/**
 * Builds an unsigned NIP-23 (Kind 30023) event template from a ConvertedPostRecord.
 *
 * Implements NIP-23 tag standards and NIP-92/Blossom-ready imeta tags:
 * - ["d", "<slug>"]
 * - ["title", "<title>"]
 * - ["published_at", "<unix_seconds>"]
 * - ["summary", "<summary>"]
 * - ["image", "<original_url>"]
 * - ["imeta", "url <original_url>"]
 * - ["t", "<topic>"]
 * - ["client", "x2nostr"]
 */
export function buildUnsignedNip23Event(post: ConvertedPostRecord): UnsignedNip23Event {
  const dTag = post.slug || generateSlug(post.title) || `post-${post.publishedAtTimestamp}`;

  const tags: string[][] = [
    ['d', dTag],
    ['title', post.title || 'Untitled Post'],
    ['published_at', String(post.publishedAtTimestamp)],
  ];

  if (post.summary && post.summary.trim()) {
    tags.push(['summary', post.summary.trim()]);
  }

  // Collect all unique image URLs (featured image first, then inline content images)
  const allImageUrls: string[] = [];
  if (post.featuredImageUrl && post.featuredImageUrl.trim()) {
    allImageUrls.push(post.featuredImageUrl.trim());
  }

  if (post.imageUrls && Array.isArray(post.imageUrls)) {
    post.imageUrls.forEach((img) => {
      const trimmed = img?.trim();
      if (trimmed && !allImageUrls.includes(trimmed)) {
        allImageUrls.push(trimmed);
      }
    });
  }

  // Also extract any markdown image URLs from content if not already found
  const markdownImgRegex = /!\[.*?\]\((https?:\/\/[^\s\)]+)\)/gi;
  let mdMatch: RegExpExecArray | null;
  while ((mdMatch = markdownImgRegex.exec(post.contentMarkdown || '')) !== null) {
    const url = mdMatch[1]?.trim();
    if (url && !allImageUrls.includes(url)) {
      allImageUrls.push(url);
    }
  }

  // Add ["image", url] and ["imeta", "url " + url] tags
  allImageUrls.forEach((url) => {
    tags.push(['image', url]);
    tags.push(['imeta', `url ${url}`]);
  });

  // Combine and normalize categories and tags into ["t", topic]
  const topics = new Set<string>();
  if (post.categories) {
    post.categories.forEach((cat) => {
      const normalized = normalizeTopic(cat);
      if (normalized) topics.add(normalized);
    });
  }
  if (post.tags) {
    post.tags.forEach((tag) => {
      const normalized = normalizeTopic(tag);
      if (normalized) topics.add(normalized);
    });
  }

  topics.forEach((topic) => {
    tags.push(['t', topic]);
  });

  tags.push(['client', 'x2nostr']);

  return {
    kind: 30023,
    created_at: post.publishedAtTimestamp,
    tags,
    content: post.contentMarkdown || '',
  };
}

/**
 * Normalizes a topic / tag string into a clean lowercase slug.
 */
function normalizeTopic(topic: string): string {
  if (!topic) return '';
  return topic
    .toLowerCase()
    .trim()
    .replace(/[#@]/g, '')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generates a clean URL slug from a title string.
 */
function generateSlug(title: string): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
