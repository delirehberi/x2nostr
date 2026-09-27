import { describe, expect, it } from 'vitest';
import { parseWordPressExport } from '../src/services/nip23/parsers/wordpress';
import { parseGhostExport, parseGhostJsonString } from '../src/services/nip23/parsers/ghost';
import { parseHugoExport, parseHugoMarkdownFile } from '../src/services/nip23/parsers/hugo';
import { parseMediumExport, parseMediumHtmlString } from '../src/services/nip23/parsers/medium';
import { parseSubstackExport, parseSubstackCsvString } from '../src/services/nip23/parsers/substack';
import { parseLinkedInExport } from '../src/services/nip23/parsers/linkedin';
import { parseGenericMarkdownExport } from '../src/services/nip23/parsers/markdown';

describe('WordPress Parser (with Elementor & Shortcodes)', () => {
  const SAMPLE_WP_XML = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:excerpt="http://wordpress.org/export/1.1/excerpt/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:wp="http://wordpress.org/export/1.1/"
>
<channel>
  <title>WordPress Test Blog</title>
  <item>
    <wp:post_id>10</wp:post_id>
    <wp:post_type>attachment</wp:post_type>
    <wp:attachment_url>https://example.com/wp-content/uploads/2023/10/cover.jpg</wp:attachment_url>
  </item>
  <item>
    <title>Elementor &amp; Shortcode Post</title>
    <dc:creator>admin</dc:creator>
    <content:encoded><![CDATA[
      <!-- wp:heading {"level":2} -->
      <h2>Heading 2</h2>
      <!-- /wp:heading -->
      [caption id="att_1" align="aligncenter" width="500"]<img src="https://example.com/wp-content/uploads/2023/10/diag.png" alt="Architecture Diagram" /> Architecture Diagram[/caption]
      [embed]https://www.youtube.com/watch?v=dQw4w9WgXcQ[/embed]
      [vc_custom_heading text="WPBakery Section" /]
      [et_pb_button button_text="Click Divi" button_url="https://nostr.com" /]
      [custom_plugin_box]Preserved inner text inside unknown shortcodes[/custom_plugin_box]
    ]]></content:encoded>
    <excerpt:encoded><![CDATA[Summary excerpt of post]]></excerpt:encoded>
    <wp:post_id>99</wp:post_id>
    <wp:post_name>elementor-shortcode-post</wp:post_name>
    <wp:post_type>post</wp:post_type>
    <wp:status>publish</wp:status>
    <wp:post_date_gmt>2023-10-31 12:00:00</wp:post_date_gmt>
    <category domain="category" nicename="technology"><![CDATA[Technology]]></category>
    <category domain="post_tag" nicename="nostr"><![CDATA[Nostr]]></category>
    <wp:postmeta>
      <wp:meta_key>_thumbnail_id</wp:meta_key>
      <wp:meta_value>10</wp:meta_value>
    </wp:postmeta>
  </item>
</channel>
</rss>`;

  it('should parse WordPress XML and convert Elementor/shortcodes cleanly into Markdown', async () => {
    const posts = await parseWordPressExport(SAMPLE_WP_XML);
    expect(posts).toHaveLength(1);

    const post = posts[0];
    expect(post.title).toBe('Elementor & Shortcode Post');
    expect(post.slug).toBe('elementor-shortcode-post');
    expect(post.summary).toBe('Summary excerpt of post');
    expect(post.categories).toContain('Technology');
    expect(post.tags).toContain('Nostr');
    expect(post.featuredImageUrl).toBe('https://example.com/wp-content/uploads/2023/10/cover.jpg');
    expect(post.imageUrls).toContain('https://example.com/wp-content/uploads/2023/10/diag.png');

    // Markdown assertions
    expect(post.contentMarkdown).toContain('## Heading 2');
    expect(post.contentMarkdown).toContain('![Architecture Diagram](https://example.com/wp-content/uploads/2023/10/diag.png)');
    expect(post.contentMarkdown).toContain('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(post.contentMarkdown).toContain('WPBakery Section');
    expect(post.contentMarkdown).toContain('[Click Divi](https://nostr.com)');
    expect(post.contentMarkdown).toContain('Preserved inner text inside unknown shortcodes');
  });
});

describe('Ghost Parser', () => {
  const SAMPLE_GHOST_JSON = JSON.stringify({
    db: [
      {
        meta: { exported_on: 1698765432000, version: '5.0.0' },
        data: {
          posts: [
            {
              id: 'ghost-1',
              title: 'Welcome to Ghost on Nostr',
              slug: 'welcome-to-ghost-on-nostr',
              html: '<h1>Hello Ghost</h1><p>Migrating to <strong>NIP-23</strong>!</p><img src="https://ghost.example.com/content/images/2023/10/ghost-banner.jpg" alt="Ghost Banner" />',
              feature_image: 'https://ghost.example.com/content/images/2023/10/feature.jpg',
              featured: 1,
              status: 'published',
              type: 'post',
              published_at: '2023-10-31T12:00:00.000Z',
              custom_excerpt: 'Ghost migration summary excerpt',
              primary_author: { name: 'Satoshi' },
            },
          ],
          tags: [
            { id: 'tag-1', name: 'OpenSource', slug: 'opensource' },
          ],
          posts_tags: [
            { post_id: 'ghost-1', tag_id: 'tag-1' },
          ],
        },
      },
    ],
  });

  it('should parse Ghost JSON export correctly', () => {
    const posts = parseGhostJsonString(SAMPLE_GHOST_JSON);
    expect(posts).toHaveLength(1);

    const post = posts[0];
    expect(post.title).toBe('Welcome to Ghost on Nostr');
    expect(post.slug).toBe('welcome-to-ghost-on-nostr');
    expect(post.summary).toBe('Ghost migration summary excerpt');
    expect(post.featuredImageUrl).toBe('https://ghost.example.com/content/images/2023/10/feature.jpg');
    expect(post.imageUrls).toContain('https://ghost.example.com/content/images/2023/10/feature.jpg');
    expect(post.imageUrls).toContain('https://ghost.example.com/content/images/2023/10/ghost-banner.jpg');
    expect(post.tags).toContain('OpenSource');
    expect(post.contentMarkdown).toContain('# Hello Ghost');
    expect(post.contentMarkdown).toContain('Migrating to **NIP-23**!');
  });
});

describe('Hugo Parser', () => {
  const SAMPLE_HUGO_YAML = `---
title: "Building on Nostr with Hugo"
slug: building-on-nostr-with-hugo
date: 2023-10-31T14:00:00Z
summary: "A deep dive into decentralized blogging"
image: "https://hugo.example.com/images/hugo-cover.png"
tags: ["nostr", "hugo", "markdown"]
categories: ["development"]
author: "Alice"
---

# Building on Nostr with Hugo

Here is an architectural diagram:
![System Architecture](https://hugo.example.com/images/diagram.png)

Markdown text with [link](https://nostr.how).
`;

  it('should parse Hugo YAML frontmatter markdown file', () => {
    const post = parseHugoMarkdownFile(SAMPLE_HUGO_YAML, 'posts/building-on-nostr.md');
    expect(post.title).toBe('Building on Nostr with Hugo');
    expect(post.slug).toBe('building-on-nostr-with-hugo');
    expect(post.summary).toBe('A deep dive into decentralized blogging');
    expect(post.featuredImageUrl).toBe('https://hugo.example.com/images/hugo-cover.png');
    expect(post.imageUrls).toContain('https://hugo.example.com/images/hugo-cover.png');
    expect(post.imageUrls).toContain('https://hugo.example.com/images/diagram.png');
    expect(post.tags).toEqual(['nostr', 'hugo', 'markdown']);
    expect(post.categories).toEqual(['development']);
    expect(post.contentMarkdown).toContain('![System Architecture](https://hugo.example.com/images/diagram.png)');
  });
});

describe('Medium Parser', () => {
  const SAMPLE_MEDIUM_HTML = `<!DOCTYPE html>
<html>
<head><title>The Future of Decentralized Publishing</title></head>
<body>
<article class="h-entry">
  <h1 class="p-name">The Future of Decentralized Publishing</h1>
  <section data-field="subtitle" class="p-summary">Why sovereign creators are moving to Nostr.</section>
  <time class="dt-published" datetime="2023-10-31T15:30:00.000Z">Oct 31, 2023</time>
  <section data-field="body" class="e-content">
    <figure class="graf--figure"><img src="https://miro.medium.com/v2/resize:fit:1400/1*medium_hero.jpg" alt="Hero Image" /></figure>
    <p>Medium post body paragraph.</p>
  </section>
  <ul class="tags">
    <li><a href="https://medium.com/tag/nostr">Nostr</a></li>
    <li><a href="https://medium.com/tag/web3">Web3</a></li>
  </ul>
</article>
</body>
</html>`;

  it('should parse Medium HTML export correctly', () => {
    const post = parseMediumHtmlString(SAMPLE_MEDIUM_HTML, '2023-10-31_The-Future-of-Decentralized-Publishing.html');
    expect(post.title).toBe('The Future of Decentralized Publishing');
    expect(post.summary).toBe('Why sovereign creators are moving to Nostr.');
    expect(post.tags).toContain('Nostr');
    expect(post.tags).toContain('Web3');
    expect(post.imageUrls).toContain('https://miro.medium.com/v2/resize:fit:1400/1*medium_hero.jpg');
    expect(post.contentMarkdown).toContain('![Hero Image](https://miro.medium.com/v2/resize:fit:1400/1*medium_hero.jpg)');
  });
});

describe('Substack Parser', () => {
  const SAMPLE_SUBSTACK_CSV = `post_id,title,subtitle,post_date,is_published,body_html,cover_image
101,My Substack Newsletter,Issue #1 Deep Dive,2023-10-31 16:00:00,true,"<h1>Issue 1</h1><p>Newsletter body content with image</p><img src=""https://substackcdn.com/image/fetch/w_1456/https://substack-post.png"" alt=""Newsletter"" />",https://substackcdn.com/image/fetch/cover.jpg
`;

  it('should parse Substack CSV export correctly', () => {
    const posts = parseSubstackCsvString(SAMPLE_SUBSTACK_CSV);
    expect(posts).toHaveLength(1);

    const post = posts[0];
    expect(post.title).toBe('My Substack Newsletter');
    expect(post.summary).toBe('Issue #1 Deep Dive');
    expect(post.featuredImageUrl).toBe('https://substackcdn.com/image/fetch/cover.jpg');
    expect(post.imageUrls).toContain('https://substackcdn.com/image/fetch/cover.jpg');
    expect(post.imageUrls).toContain('https://substackcdn.com/image/fetch/w_1456/https://substack-post.png');
    expect(post.contentMarkdown).toContain('# Issue 1');
  });
});

describe('Generic Markdown Parser', () => {
  const SAMPLE_MD = `# Sovereign Notes

This is a generic markdown document.

![Diagram](https://example.com/diagram.svg)
`;

  it('should parse generic Markdown files', async () => {
    const posts = await parseGenericMarkdownExport(SAMPLE_MD);
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe('Sovereign Notes');
    expect(posts[0].imageUrls).toContain('https://example.com/diagram.svg');
    expect(posts[0].contentMarkdown).toContain('![Diagram](https://example.com/diagram.svg)');
  });
});

describe('ZIP Archive Extraction for all platforms', () => {
  function createTestZip(files: Array<{ name: string; content: string }>): Uint8Array {
    const encoder = new TextEncoder();
    const localHeaders: Uint8Array[] = [];
    const cdHeaders: Uint8Array[] = [];
    const localOffsets: number[] = [];

    let currentOffset = 0;

    for (const f of files) {
      localOffsets.push(currentOffset);
      const nameBytes = encoder.encode(f.name);
      const dataBytes = encoder.encode(f.content);

      // Local Header
      const lh = new Uint8Array(30 + nameBytes.length + dataBytes.length);
      const dv = new DataView(lh.buffer);
      dv.setUint32(0, 0x04034b50, true);
      dv.setUint16(4, 20, true);
      dv.setUint16(8, 0, true); // Stored
      dv.setUint32(18, dataBytes.length, true); // compressed size
      dv.setUint32(22, dataBytes.length, true); // uncompressed size
      dv.setUint16(26, nameBytes.length, true);
      lh.set(nameBytes, 30);
      lh.set(dataBytes, 30 + nameBytes.length);

      localHeaders.push(lh);
      currentOffset += lh.length;
    }

    const cdOffset = currentOffset;
    let cdSize = 0;

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const nameBytes = encoder.encode(f.name);
      const dataBytes = encoder.encode(f.content);
      const localOff = localOffsets[i];

      const cd = new Uint8Array(46 + nameBytes.length);
      const dv = new DataView(cd.buffer);
      dv.setUint32(0, 0x02014b50, true);
      dv.setUint16(4, 20, true);
      dv.setUint16(6, 20, true);
      dv.setUint16(10, 0, true); // Stored
      dv.setUint32(20, dataBytes.length, true);
      dv.setUint32(24, dataBytes.length, true);
      dv.setUint16(28, nameBytes.length, true);
      dv.setUint32(42, localOff, true);
      cd.set(nameBytes, 46);

      cdHeaders.push(cd);
      cdSize += cd.length;
    }

    // EOCD
    const eocd = new Uint8Array(22);
    const eocdDv = new DataView(eocd.buffer);
    eocdDv.setUint32(0, 0x06054b50, true);
    eocdDv.setUint16(8, files.length, true);
    eocdDv.setUint16(10, files.length, true);
    eocdDv.setUint32(12, cdSize, true);
    eocdDv.setUint32(16, cdOffset, true);

    const totalLen = currentOffset + cdSize + 22;
    const out = new Uint8Array(totalLen);

    let pos = 0;
    for (const lh of localHeaders) {
      out.set(lh, pos);
      pos += lh.length;
    }
    for (const cd of cdHeaders) {
      out.set(cd, pos);
      pos += cd.length;
    }
    out.set(eocd, pos);

    return out;
  }

  it('should parse Hugo ZIP archive containing multiple markdown posts', async () => {
    const zipBytes = createTestZip([
      {
        name: 'content/posts/first-post.md',
        content: '---\ntitle: "First Post"\ntags: ["nostr"]\n---\n# First Post Body',
      },
      {
        name: 'content/posts/second-post.md',
        content: '---\ntitle: "Second Post"\ntags: ["tech"]\n---\n# Second Post Body',
      },
    ]);

    const posts = await parseHugoExport(zipBytes);
    expect(posts).toHaveLength(2);
    expect(posts[0].title).toBe('First Post');
    expect(posts[1].title).toBe('Second Post');
  });

  it('should parse WordPress ZIP archive containing WXR XML export', async () => {
    const zipBytes = createTestZip([
      {
        name: 'my-wordpress-export.xml',
        content: `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:wp="http://wordpress.org/export/1.1/">
<channel>
  <item>
    <title>Post in ZIP</title>
    <content:encoded><![CDATA[<p>WordPress in ZIP</p>]]></content:encoded>
    <wp:post_id>55</wp:post_id>
    <wp:post_name>post-in-zip</wp:post_name>
    <wp:post_type>post</wp:post_type>
    <wp:status>publish</wp:status>
    <wp:post_date_gmt>2023-10-31 12:00:00</wp:post_date_gmt>
  </item>
</channel>
</rss>`,
      },
    ]);

    const posts = await parseWordPressExport(zipBytes);
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe('Post in ZIP');
    expect(posts[0].slug).toBe('post-in-zip');
  });

  it('should parse Ghost ZIP archive containing JSON export', async () => {
    const ghostJson = JSON.stringify({
      db: [
        {
          data: {
            posts: [
              {
                title: 'Ghost Post in ZIP',
                slug: 'ghost-post-in-zip',
                html: '<p>Ghost in ZIP</p>',
                published_at: '2023-10-31T12:00:00.000Z',
              },
            ],
          },
        },
      ],
    });

    const zipBytes = createTestZip([
      {
        name: 'ghost-export.json',
        content: ghostJson,
      },
    ]);

    const posts = await parseGhostExport(zipBytes);
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe('Ghost Post in ZIP');
  });

  it('should parse LinkedIn ZIP archive containing Articles HTML', async () => {
    const sampleHtml = `<html>
<head><title>LinkedIn Article in ZIP</title></head>
<body>
  <img src="https://media.licdn.com/cover.jpg" />
  <h1><a href="https://www.linkedin.com/pulse/sample-pulse-123">LinkedIn Article in ZIP</a></h1>
  <p class="published">Published on 2026-02-24 00:09</p>
  <div><p>Sovereign articles on Nostr protocol. #nostr</p></div>
</body>
</html>`;

    const zipBytes = createTestZip([
      {
        name: 'Articles/sample-pulse-123.html',
        content: sampleHtml,
      },
    ]);

    const posts = await parseLinkedInExport(zipBytes);
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe('LinkedIn Article in ZIP');
    expect(posts[0].slug).toBe('sample-pulse-123');
    expect(posts[0].featuredImageUrl).toBe('https://media.licdn.com/cover.jpg');
    expect(posts[0].contentMarkdown).toContain('Sovereign articles on Nostr protocol.');
  });
});

