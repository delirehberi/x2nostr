import { LinkedInArticleRecord, UnsignedNostrEvent } from '../../types';

/**
 * Builds an unsigned NIP-23 Long-Form Content event (Kind 30023) for a LinkedIn article.
 */
export function buildLinkedInArticleEvent(article: LinkedInArticleRecord, pubkey: string): UnsignedNostrEvent {
  const dTag = article.slug || article.articleId || `linkedin-${article.id}`;

  const tags: string[][] = [
    ['d', dTag],
    ['title', article.title],
    ['published_at', String(article.publishedAtTimestamp)],
    ['client', 'x2nostr'],
  ];

  if (article.summary && article.summary.trim()) {
    tags.push(['summary', article.summary.trim()]);
  }

  const coverUrl = article.blossomCoverUrl || article.coverImageUrl;
  if (coverUrl) {
    tags.push(['image', coverUrl]);
  }

  // Add topics/tags
  const uniqueTags = new Set<string>();
  article.tags.forEach((tag) => {
    const slug = tag.toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
    if (slug) uniqueTags.add(slug);
  });

  uniqueTags.forEach((tag) => {
    tags.push(['t', tag]);
  });

  // Replace original image URLs with Blossom URLs in Markdown body if available
  let markdownBody = article.contentMarkdown || '';
  if (article.blossomImageMap && Object.keys(article.blossomImageMap).length > 0) {
    for (const [origUrl, blossomUrl] of Object.entries(article.blossomImageMap)) {
      if (origUrl && blossomUrl && origUrl !== blossomUrl) {
        markdownBody = markdownBody.replaceAll(origUrl, blossomUrl);
      }
    }
  }

  return {
    kind: 30023,
    created_at: article.publishedAtTimestamp,
    tags,
    content: markdownBody,
    pubkey,
  };
}

/**
 * Builds an unsigned NIP-09 Deletion Event (Kind 5) targeting previous NIP-23 article events.
 */
export function buildLinkedInDeletionEvent(
  eventIds: string[],
  reason = 'Replacing previous LinkedIn article import via x2nostr',
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
