import { describe, expect, it } from 'vitest';
import { parseWordPressXmlString } from '../src/importers/wordpress/parser';
import { convertHtmlToMarkdown, extractImageUrlsFromHtml } from '../src/services/html-to-markdown';
import { buildWordPressPostEvent } from '../src/importers/wordpress/event-builder';

const SAMPLE_WXR_XML = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:excerpt="http://wordpress.org/export/1.1/excerpt/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:wp="http://wordpress.org/export/1.1/"
>
<channel>
  <title>My Personal Sovereign Blog</title>
  <link>https://myblog.example.com</link>

  <!-- Attachment Item -->
  <item>
    <title>Featured Photo</title>
    <wp:post_id>101</wp:post_id>
    <wp:post_type>attachment</wp:post_type>
    <wp:attachment_url>https://myblog.example.com/uploads/2026/05/hero.jpg</wp:attachment_url>
  </item>

  <!-- Post Item -->
  <item>
    <title>Hello Nostr Sovereign World</title>
    <dc:creator>Alice WXR</dc:creator>
    <content:encoded><![CDATA[<h1>Welcome</h1><p>This is my first post on <strong>Nostr</strong>!</p>[caption id="attachment_1" align="alignnone" width="300"]<img src="https://myblog.example.com/uploads/2026/05/photo.jpg" alt="A photo" /> Caption text[/caption]<p>Check out <a href="https://habla.news">Habla.news</a>.</p>]]></content:encoded>
    <excerpt:encoded><![CDATA[Summary excerpt of my first Nostr post]]></excerpt:encoded>
    <wp:post_id>42</wp:post_id>
    <wp:post_name>hello-nostr-sovereign-world</wp:post_name>
    <wp:post_type>post</wp:post_type>
    <wp:status>publish</wp:status>
    <wp:post_date_gmt>2026-05-15 14:30:00</wp:post_date_gmt>
    <category domain="category" nicename="decentralization"><![CDATA[Decentralization]]></category>
    <category domain="post_tag" nicename="nostr"><![CDATA[Nostr]]></category>
    <wp:postmeta>
      <wp:meta_key>_thumbnail_id</wp:meta_key>
      <wp:meta_value>101</wp:meta_value>
    </wp:postmeta>
  </item>
</channel>
</rss>`;

describe('WordPress WXR Parser', () => {
  it('should parse WXR XML string into typed WordPressPostRecord', () => {
    const posts = parseWordPressXmlString(SAMPLE_WXR_XML);
    expect(posts).toHaveLength(1);

    const post = posts[0];
    expect(post.wpPostId).toBe('42');
    expect(post.title).toBe('Hello Nostr Sovereign World');
    expect(post.slug).toBe('hello-nostr-sovereign-world');
    expect(post.author).toBe('Alice WXR');
    expect(post.status).toBe('publish');
    expect(post.categories).toContain('Decentralization');
    expect(post.tags).toContain('Nostr');
    expect(post.featuredImageUrl).toBe('https://myblog.example.com/uploads/2026/05/hero.jpg');
    expect(post.imageUrls).toContain('https://myblog.example.com/uploads/2026/05/photo.jpg');
    expect(post.publishedAtTimestamp).toBeGreaterThan(0);
  });
});

describe('HTML to Markdown Converter (Gutenberg, Elementor, Shortcodes)', () => {
  it('should convert Gutenberg blocks cleanly', () => {
    const gutenbergHtml = `
      <!-- wp:heading {"level":2} -->
      <h2>Sovereign Publishing</h2>
      <!-- /wp:heading -->
      <!-- wp:paragraph -->
      <p>Decentralize your writing with <strong>NIP-23</strong>.</p>
      <!-- /wp:paragraph -->
      <!-- wp:quote -->
      <blockquote class="wp-block-quote"><p>Words cannot be stopped.</p></blockquote>
      <!-- /wp:quote -->
    `;
    const md = convertHtmlToMarkdown(gutenbergHtml);
    expect(md).toContain('## Sovereign Publishing');
    expect(md).toContain('Decentralize your writing with **NIP-23**.');
    expect(md).toContain('> Words cannot be stopped.');
    expect(md).not.toContain('<!-- wp:');
  });

  it('should clean WordPress captions and shortcodes', () => {
    const htmlWithShortcodes = `
      [caption id="attachment_123" align="aligncenter" width="600"]<img src="https://example.com/cover.jpg" alt="Cover" /> Sovereign Network[/caption]
      [embed]https://www.youtube.com/watch?v=123456789[/embed]
      [vc_row][vc_column][vc_custom_heading text="WPBakery Heading" /][/vc_column][/vc_row]
    `;
    const md = convertHtmlToMarkdown(htmlWithShortcodes);
    expect(md).toContain('![Cover](https://example.com/cover.jpg)');
    expect(md).toContain('Sovereign Network');
    expect(md).toContain('https://www.youtube.com/watch?v=123456789');
    expect(md).toContain('WPBakery Heading');
    expect(md).not.toContain('[vc_row]');
  });
});

describe('WordPress NIP-23 Event Builder', () => {
  it('should build a valid Kind 30023 event payload', () => {
    const posts = parseWordPressXmlString(SAMPLE_WXR_XML);
    const post = posts[0];
    post.blossomCoverUrl = 'https://blossom.primal.net/hero.jpg';
    post.blossomImageMap = {
      'https://myblog.example.com/uploads/2026/05/photo.jpg': 'https://blossom.primal.net/photo.jpg',
    };

    const pubkey = '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff';
    const event = buildWordPressPostEvent(post, pubkey);

    expect(event.kind).toBe(30023);
    expect(event.pubkey).toBe(pubkey);

    const dTag = event.tags.find((t) => t[0] === 'd');
    expect(dTag).toEqual(['d', 'hello-nostr-sovereign-world']);

    const titleTag = event.tags.find((t) => t[0] === 'title');
    expect(titleTag).toEqual(['title', 'Hello Nostr Sovereign World']);

    const imageTag = event.tags.find((t) => t[0] === 'image');
    expect(imageTag).toEqual(['image', 'https://blossom.primal.net/hero.jpg']);

    const topicTags = event.tags.filter((t) => t[0] === 't').map((t) => t[1]);
    expect(topicTags).toContain('decentralization');
    expect(topicTags).toContain('nostr');

    expect(event.content).toContain('https://blossom.primal.net/photo.jpg');
    expect(event.content).not.toContain('https://myblog.example.com/uploads/2026/05/photo.jpg');
  });
});


