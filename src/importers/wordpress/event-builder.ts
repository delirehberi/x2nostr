import { UnsignedNostrEvent, WordPressPostRecord } from '../../types';

/**
 * Builds an unsigned NIP-23 Long-Form Content event (Kind 30023).
 */
export function buildWordPressPostEvent(post: WordPressPostRecord, pubkey: string): UnsignedNostrEvent {
  const dTag = post.slug || `wp-${post.wpPostId}`;

  const tags: string[][] = [
    ['d', dTag],
    ['title', post.title],
    ['published_at', String(post.publishedAtTimestamp)],
    ['client', 'x2nostr'],
  ];

  if (post.summary && post.summary.trim()) {
    tags.push(['summary', post.summary.trim()]);
  }

  const coverUrl = post.blossomCoverUrl || post.featuredImageUrl;
  if (coverUrl) {
    tags.push(['image', coverUrl]);
  }

  // Combine categories & tags into NIP-23 "t" tags
  const combinedTopics = new Set<string>();
  post.categories.forEach((cat) => {
    const slug = cat.toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
    if (slug) combinedTopics.add(slug);
  });
  post.tags.forEach((tag) => {
    const slug = tag.toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
    if (slug) combinedTopics.add(slug);
  });

  combinedTopics.forEach((topic) => {
    tags.push(['t', topic]);
  });

  // Prepare Markdown body content and replace original image URLs with Blossom URLs
  let markdownBody = post.contentMarkdown || '';
  if (post.blossomImageMap && Object.keys(post.blossomImageMap).length > 0) {
    for (const [origUrl, blossomUrl] of Object.entries(post.blossomImageMap)) {
      if (origUrl && blossomUrl && origUrl !== blossomUrl) {
        markdownBody = markdownBody.replaceAll(origUrl, blossomUrl);
      }
    }
  }

  return {
    kind: 30023,
    created_at: post.publishedAtTimestamp,
    tags,
    content: markdownBody,
    pubkey,
  };
}

/**
 * Builds an unsigned NIP-09 Deletion Event (Kind 5) targeting NIP-23 articles.
 */
export function buildWordPressDeletionEvent(
  eventIds: string[],
  reason = 'Replacing previous WordPress blog import via x2nostr',
  pubkey: string
): UnsignedNostrEvent {
  const tags: string[][] = eventIds.map((id) => ['e', id]);
  tags.push(['k', '30023']);

  return {
    kind: 5,
    created_at: Math.floor(Date.now() / 1000),
    tags,
    content: reason,
    pubkey,
  };
}
