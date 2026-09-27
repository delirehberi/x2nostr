import { describe, expect, it } from 'vitest';
import {
  buildLinkedInArticleEvent,
  buildLinkedInDeletionEvent,
} from '../src/importers/linkedin/event-builder';
import { LinkedInArticleRecord } from '../src/types';

describe('LinkedIn Event Builder', () => {
  const sampleArticle: LinkedInArticleRecord = {
    id: 'li-technofeudalism-digital-landlordship',
    articleId: 'li-technofeudalism-digital-landlordship',
    title: 'Technofeudalism – Digital Landlordship',
    slug: 'technofeudalism-digital-landlordship',
    canonicalUrl: 'https://www.linkedin.com/pulse/technofeudalism-digital-landlordship',
    contentHtml: '<p>Article body</p>',
    contentMarkdown: '# Technofeudalism\n\n![Cover](https://media.licdn.com/cover.jpg)\n\nBody content.',
    summary: 'Who owns the digital land holds the power.',
    author: 'Emre Yilmaz',
    publishedDate: '2026-02-24 00:09',
    publishedAtTimestamp: 1771891740,
    coverImageUrl: 'https://media.licdn.com/cover.jpg',
    imageUrls: ['https://media.licdn.com/cover.jpg'],
    tags: ['nostr', 'freedom', 'technology'],
    selected: true,
  };

  const samplePubkey = 'fa8f01b312b6f17e3f83733ef52f146a7be7c7ba6473e6bcf1cfec111f11a473';

  it('should build a valid NIP-23 Kind 30023 unsigned event', () => {
    const event = buildLinkedInArticleEvent(sampleArticle, samplePubkey);

    expect(event.kind).toBe(30023);
    expect(event.pubkey).toBe(samplePubkey);
    expect(event.created_at).toBe(sampleArticle.publishedAtTimestamp);

    // Tags assertion
    const dTag = event.tags.find((t) => t[0] === 'd');
    const titleTag = event.tags.find((t) => t[0] === 'title');
    const publishedAtTag = event.tags.find((t) => t[0] === 'published_at');
    const summaryTag = event.tags.find((t) => t[0] === 'summary');
    const imageTag = event.tags.find((t) => t[0] === 'image');
    const clientTag = event.tags.find((t) => t[0] === 'client');
    const tTags = event.tags.filter((t) => t[0] === 't').map((t) => t[1]);

    expect(dTag).toEqual(['d', 'technofeudalism-digital-landlordship']);
    expect(titleTag).toEqual(['title', 'Technofeudalism – Digital Landlordship']);
    expect(publishedAtTag).toEqual(['published_at', '1771891740']);
    expect(summaryTag).toEqual(['summary', 'Who owns the digital land holds the power.']);
    expect(imageTag).toEqual(['image', 'https://media.licdn.com/cover.jpg']);
    expect(clientTag).toEqual(['client', 'x2nostr']);
    expect(tTags).toContain('nostr');
    expect(tTags).toContain('freedom');
    expect(tTags).toContain('technology');
  });

  it('should replace image URLs with Blossom mirrored URLs in content and tags', () => {
    const articleWithBlossom: LinkedInArticleRecord = {
      ...sampleArticle,
      blossomCoverUrl: 'https://blossom.primal.net/abc123cover.jpg',
      blossomImageMap: {
        'https://media.licdn.com/cover.jpg': 'https://blossom.primal.net/abc123cover.jpg',
      },
    };

    const event = buildLinkedInArticleEvent(articleWithBlossom, samplePubkey);

    const imageTag = event.tags.find((t) => t[0] === 'image');
    expect(imageTag).toEqual(['image', 'https://blossom.primal.net/abc123cover.jpg']);
    expect(event.content).toContain('https://blossom.primal.net/abc123cover.jpg');
    expect(event.content).not.toContain('https://media.licdn.com/cover.jpg');
  });

  it('should build a valid NIP-09 Kind 5 deletion event', () => {
    const eventIds = ['event-id-1', 'event-id-2'];
    const deletionEvent = buildLinkedInDeletionEvent(eventIds, 'Replacing old articles', samplePubkey);

    expect(deletionEvent.kind).toBe(5);
    expect(deletionEvent.pubkey).toBe(samplePubkey);
    expect(deletionEvent.content).toBe('Replacing old articles');

    const eTags = deletionEvent.tags.filter((t) => t[0] === 'e').map((t) => t[1]);
    const kTag = deletionEvent.tags.find((t) => t[0] === 'k');

    expect(eTags).toEqual(['event-id-1', 'event-id-2']);
    expect(kTag).toEqual(['k', '30023']);
  });
});
