import { describe, expect, it } from 'vitest';
import {
  parseLinkedInHtmlString,
  parseLinkedInCsvString,
  extractHashtagsFromText,
} from '../src/importers/linkedin/parser';

describe('LinkedIn Article Parser', () => {
  const SAMPLE_LINKEDIN_HTML = `<html>
<head>
  <title>Technofeudalism – Digital Landlordship</title>
  <style>
    body {
      margin: 0 auto;
      width: 744px;
      font-family: Source Serif Pro, serif;
      line-height: 32px;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.7);
      font-size: 21px;
    }
  </style>
</head>
<body>
    <img src="https://media.licdn.com/mediaD4D12AQFX3i-F9lpzcg" alt="" title="" />
      <h1><a href="https://www.linkedin.com/pulse/technofeudalism-digital-landlordship-emre-yilmaz-tvl1f">Technofeudalism – Digital Landlordship</a></h1>
    <p class="created">Created on 2026-02-24 00:06</p>
  <p class="published">Published on 2026-02-24 00:09</p>
  <div><p>Social trends sometimes go through ironic cycles: the very structures we started in hopes of gaining freedom eventually turn into a new kind of feudalism. In traditional feudalism, power belonged to those who owned the land, and that power was used to rule over those who worked it. In our digital age, the reality is now clear to everyone: <strong>whoever owns the digital land (the data and the platform) holds the power.</strong></p><hr><h3>The Solution: Digital Cooperatives</h3><p>So, how did history deal with feudalism? By forming cooperatives. The key to a social revolution in the digital world lies in this same "cooperative" logic. While the internet was meant to be decentralized, it became centralized over time because the structures we built for social interaction had a flawed design. The fix isn't building a new app or platform; <strong>it’s agreeing on a protocol.</strong></p><h3>Nostr: Truly Owning Your Identity</h3><p>This is where the Nostr protocol comes in. This system brings the cooperative mindset to the digital universe:</p><ul><li><p><strong>Personal Sovereignty:</strong> With Nostr, the user becomes the sole owner of their digital identity (via a private key). This means every individual in the system is equally valuable and powerful.</p></li><li><p><strong>The Relay System:</strong> Relays act like branches of a cooperative. You decide which branch (server) you want to use, but no matter which one you pick, you still have access to the whole system.</p></li><li><p><strong>Middleman-Free Economy:</strong> The protocol focuses on "utility" rather than corporate greed. Since humans need an economy to thrive, Nostr uses "Zaps" (via the Lightning Network) to remove the "shady brokers" between the creator and the consumer.</p></li></ul><p><strong>In short:</strong> When you create content for Spotify, YouTube, or Instagram, these platforms take most of the profit and give you just enough to keep you from quitting. On the other hand, a payment made through the Nostr protocol goes <strong>directly to your personal wallet</strong> without any cuts.</p><p>The way out of digital feudalism isn't relying on the mercy of big platforms; it’s meeting on protocols where we own our own land and identity. #nostr #freedom</p><hr><p></p></div>
</body>
</html>`;

  it('should parse real LinkedIn article HTML correctly', () => {
    const record = parseLinkedInHtmlString(
      SAMPLE_LINKEDIN_HTML,
      'Articles/technofeudalism-digital-landlordship-emre-yilmaz-tvl1f.html'
    );

    expect(record.title).toBe('Technofeudalism – Digital Landlordship');
    expect(record.slug).toBe('technofeudalism-digital-landlordship-emre-yilmaz-tvl1f');
    expect(record.canonicalUrl).toBe(
      'https://www.linkedin.com/pulse/technofeudalism-digital-landlordship-emre-yilmaz-tvl1f'
    );
    expect(record.coverImageUrl).toBe('https://media.licdn.com/mediaD4D12AQFX3i-F9lpzcg');
    expect(record.publishedDate).toBe('2026-02-24 00:09');
    expect(record.createdDate).toBe('2026-02-24 00:06');
    expect(record.publishedAtTimestamp).toBeGreaterThan(0);

    // Markdown conversion assertions
    expect(record.contentMarkdown).toContain('### The Solution: Digital Cooperatives');
    expect(record.contentMarkdown).toContain('### Nostr: Truly Owning Your Identity');
    expect(record.contentMarkdown).toContain('**Personal Sovereignty:**');
    expect(record.contentMarkdown).toContain('**The Relay System:**');
    expect(record.contentMarkdown).toContain('---');

    // Summary & Hashtags
    expect(record.summary).toContain('Social trends sometimes go through ironic cycles');
    expect(record.tags).toContain('nostr');
    expect(record.tags).toContain('freedom');
  });

  it('should parse LinkedIn CSV strings correctly', () => {
    const csvContent = `Title,URL,Published Date,Content
"Decentralized Publishing with Nostr","https://www.linkedin.com/pulse/decentralized-publishing-emre-123","2026-01-15","<p>Nostr allows sovereign censorship-resistant communication. #nostr #web3</p>"`;

    const records = parseLinkedInCsvString(csvContent);
    expect(records).toHaveLength(1);
    expect(records[0].title).toBe('Decentralized Publishing with Nostr');
    expect(records[0].slug).toBe('decentralized-publishing-emre-123');
    expect(records[0].contentMarkdown).toBe('Nostr allows sovereign censorship-resistant communication. #nostr #web3');
    expect(records[0].tags).toEqual(['nostr', 'web3']);
  });

  it('should extract unique lowercase hashtags', () => {
    const text = 'Testing #Nostr and #Lightning with #nostr #Bitcoin #web3';
    const tags = extractHashtagsFromText(text);
    expect(tags).toEqual(['nostr', 'lightning', 'bitcoin', 'web3']);
  });

  it('should handle missing titles by falling back to filename', () => {
    const htmlWithoutTitle = `<html><body><p class="published">Published on 2026-03-01 10:00</p><div><p>Simple post content</p></div></body></html>`;
    const record = parseLinkedInHtmlString(htmlWithoutTitle, '2026-03-01_my_special_article.html');
    expect(record.title).toBe('My Special Article');
    expect(record.publishedDate).toBe('2026-03-01 10:00');
  });

  it('should throw on empty HTML string', () => {
    expect(() => parseLinkedInHtmlString('')).toThrow('LinkedIn article HTML content is empty.');
  });
});
