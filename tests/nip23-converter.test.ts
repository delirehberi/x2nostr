import { describe, expect, it } from 'vitest';
import { convertBlogArchiveToNip23 } from '../src/services/nip23/converter';
import { buildUnsignedNip23Event } from '../src/services/nip23/event-builder';
import { ConvertedPostRecord } from '../src/services/nip23/types';

describe('NIP-23 Event Builder', () => {
  it('should build valid Kind 30023 unsigned event with image and imeta tags', () => {
    const sampleRecord: ConvertedPostRecord = {
      title: 'My First Sovereign Post',
      slug: 'my-first-sovereign-post',
      publishedAtTimestamp: 1698765432,
      summary: 'A short summary of the article.',
      featuredImageUrl: 'https://example.com/wp-content/uploads/2023/10/cover.jpg',
      imageUrls: [
        'https://example.com/wp-content/uploads/2023/10/cover.jpg',
        'https://example.com/wp-content/uploads/2023/10/diag.png',
      ],
      tags: ['technology', 'Nostr'],
      categories: ['Decentralization'],
      contentMarkdown: '# My First Sovereign Post\n\nThis is content with an image ![Diagram](https://example.com/wp-content/uploads/2023/10/diag.png)...',
    };

    const event = buildUnsignedNip23Event(sampleRecord);

    expect(event.kind).toBe(30023);
    expect(event.created_at).toBe(1698765432);

    const dTag = event.tags.find((t) => t[0] === 'd');
    expect(dTag).toEqual(['d', 'my-first-sovereign-post']);

    const titleTag = event.tags.find((t) => t[0] === 'title');
    expect(titleTag).toEqual(['title', 'My First Sovereign Post']);

    const pubTag = event.tags.find((t) => t[0] === 'published_at');
    expect(pubTag).toEqual(['published_at', '1698765432']);

    const summaryTag = event.tags.find((t) => t[0] === 'summary');
    expect(summaryTag).toEqual(['summary', 'A short summary of the article.']);

    // Check image tags
    const imageTags = event.tags.filter((t) => t[0] === 'image');
    expect(imageTags).toEqual([
      ['image', 'https://example.com/wp-content/uploads/2023/10/cover.jpg'],
      ['image', 'https://example.com/wp-content/uploads/2023/10/diag.png'],
    ]);

    // Check imeta tags
    const imetaTags = event.tags.filter((t) => t[0] === 'imeta');
    expect(imetaTags).toEqual([
      ['imeta', 'url https://example.com/wp-content/uploads/2023/10/cover.jpg'],
      ['imeta', 'url https://example.com/wp-content/uploads/2023/10/diag.png'],
    ]);

    // Check topic tags
    const tTags = event.tags.filter((t) => t[0] === 't').map((t) => t[1]);
    expect(tTags).toContain('decentralization');
    expect(tTags).toContain('technology');
    expect(tTags).toContain('nostr');

    // Check client tag
    const clientTag = event.tags.find((t) => t[0] === 'client');
    expect(clientTag).toEqual(['client', 'x2nostr']);

    // Check content keeps original URL intact
    expect(event.content).toContain('![Diagram](https://example.com/wp-content/uploads/2023/10/diag.png)');
  });
});

describe('Central convertBlogArchiveToNip23 Orchestrator', () => {
  const SAMPLE_WP_XML = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:wp="http://wordpress.org/export/1.1/">
<channel>
  <item>
    <title>Auto Detect WordPress</title>
    <content:encoded><![CDATA[<p>Content with <img src="https://example.com/photo.jpg" alt="Photo" /></p>]]></content:encoded>
    <wp:post_id>10</wp:post_id>
    <wp:post_name>auto-detect-wordpress</wp:post_name>
    <wp:post_type>post</wp:post_type>
    <wp:status>publish</wp:status>
    <wp:post_date_gmt>2023-10-31 12:00:00</wp:post_date_gmt>
  </item>
</channel>
</rss>`;

  it('should auto-detect WordPress XML and return response format matching API specification', async () => {
    const buffer = new TextEncoder().encode(SAMPLE_WP_XML);
    const response = await convertBlogArchiveToNip23(buffer, { fileName: 'export.xml' });

    expect(response.success).toBe(true);
    expect(response.platform).toBe('wordpress');
    expect(response.totalPosts).toBe(1);
    expect(response.events).toHaveLength(1);

    const event = response.events[0];
    expect(event.kind).toBe(30023);
    expect(event.tags.find((t) => t[0] === 'title')?.[1]).toBe('Auto Detect WordPress');
    expect(event.tags.find((t) => t[0] === 'image')?.[1]).toBe('https://example.com/photo.jpg');
    expect(event.tags.find((t) => t[0] === 'imeta')?.[1]).toBe('url https://example.com/photo.jpg');
    expect(event.tags.find((t) => t[0] === 'client')?.[1]).toBe('x2nostr');
  });

  it('should respect explicit platform override parameter', async () => {
    const sampleMd = `---
title: "Hugo Post"
tags: ["tech"]
---
# Content`;
    const buffer = new TextEncoder().encode(sampleMd);
    const response = await convertBlogArchiveToNip23(buffer, { platform: 'hugo' });

    expect(response.success).toBe(true);
    expect(response.platform).toBe('hugo');
    expect(response.events[0].tags.find((t) => t[0] === 'title')?.[1]).toBe('Hugo Post');
  });
});
