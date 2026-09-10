import { describe, expect, it } from 'vitest';
import { extractHashtags, parseIGMediaItems, parseInstagramArchiveJson } from '../src/importers/instagram/parser';
import { RawIGMediaItem } from '../src/importers/instagram/instagram-service';

describe('Instagram Hashtag Extractor', () => {
  it('should extract hashtags cleanly as lowercase tags without # symbol', () => {
    const caption = 'Sunset at the beach! #Photography #GoldenHour #Nostr #Decentralized';
    const tags = extractHashtags(caption);
    expect(tags).toEqual(['photography', 'goldenhour', 'nostr', 'decentralized']);
  });

  it('should deduplicate hashtags and handle captions without tags', () => {
    expect(extractHashtags('Repeated #nostr and #NOSTR')).toEqual(['nostr']);
    expect(extractHashtags('Just a plain text caption without any tags')).toEqual([]);
    expect(extractHashtags('')).toEqual([]);
    expect(extractHashtags(undefined)).toEqual([]);
  });
});

describe('Instagram Graph API Item Parser', () => {
  const SAMPLE_PHOTO: RawIGMediaItem = {
    id: '17923849123456789',
    caption: 'Beautiful morning coffee in Istanbul #istanbul #coffee',
    media_type: 'IMAGE',
    media_url: 'https://scontent.cdninstagram.com/v/t51.2885-15/photo.jpg',
    permalink: 'https://www.instagram.com/p/C_abc123/',
    timestamp: '2026-06-15T08:30:00+0000',
    media_product_type: 'FEED',
    shortcode: 'C_abc123',
    like_count: 142,
    comments_count: 8,
  };

  const SAMPLE_CAROUSEL: RawIGMediaItem = {
    id: '17999888123456789',
    caption: 'Weekend road trip album #travel #adventure',
    media_type: 'CAROUSEL_ALBUM',
    permalink: 'https://www.instagram.com/p/C_album456/',
    timestamp: '2026-06-18T14:00:00+0000',
    media_product_type: 'FEED',
    shortcode: 'C_album456',
    like_count: 285,
    comments_count: 19,
    children: {
      data: [
        {
          id: 'child_1',
          media_type: 'IMAGE',
          media_url: 'https://scontent.cdninstagram.com/v/slide1.jpg',
          timestamp: '2026-06-18T14:00:00+0000',
        },
        {
          id: 'child_2',
          media_type: 'IMAGE',
          media_url: 'https://scontent.cdninstagram.com/v/slide2.jpg',
          timestamp: '2026-06-18T14:00:00+0000',
        },
      ],
    },
  };

  it('should parse single image Graph API items accurately', () => {
    const records = parseIGMediaItems([SAMPLE_PHOTO]);
    expect(records).toHaveLength(1);
    const post = records[0];

    expect(post.id).toBe('17923849123456789');
    expect(post.caption).toBe('Beautiful morning coffee in Istanbul #istanbul #coffee');
    expect(post.media_type).toBe('IMAGE');
    expect(post.media_url).toBe('https://scontent.cdninstagram.com/v/t51.2885-15/photo.jpg');
    expect(post.permalink).toBe('https://www.instagram.com/p/C_abc123/');
    expect(post.timestampUnix).toBe(Math.floor(new Date('2026-06-15T08:30:00+0000').getTime() / 1000));
    expect(post.tags).toEqual(['istanbul', 'coffee']);
    expect(post.like_count).toBe(142);
    expect(post.selected).toBe(true);
    expect(post.children).toBeUndefined();
  });

  it('should parse carousel album Graph API items with children slides', () => {
    const records = parseIGMediaItems([SAMPLE_CAROUSEL]);
    expect(records).toHaveLength(1);
    const post = records[0];

    expect(post.id).toBe('17999888123456789');
    expect(post.media_type).toBe('CAROUSEL_ALBUM');
    expect(post.tags).toEqual(['travel', 'adventure']);
    expect(post.children).toBeDefined();
    expect(post.children).toHaveLength(2);
    expect(post.children![0].id).toBe('child_1');
    expect(post.children![0].media_url).toBe('https://scontent.cdninstagram.com/v/slide1.jpg');
    expect(post.children![1].id).toBe('child_2');
    expect(post.children![1].media_url).toBe('https://scontent.cdninstagram.com/v/slide2.jpg');
  });
});

describe('Meta Data Export Archive Parser', () => {
  it('should parse official posts_1.json data export structure', () => {
    const mockExportJson = JSON.stringify([
      {
        title: 'Sunset over Bosporus #bosphorus #nostr',
        creation_timestamp: 1718450000,
        media: [
          {
            uri: 'media/posts/202406/sunset.jpg',
            creation_timestamp: 1718450000,
            title: 'Sunset over Bosporus',
          },
        ],
      },
    ]);

    const records = parseInstagramArchiveJson(mockExportJson);
    expect(records).toHaveLength(1);
    expect(records[0].caption).toBe('Sunset over Bosporus #bosphorus #nostr');
    expect(records[0].media_type).toBe('IMAGE');
    expect(records[0].media_url).toBe('media/posts/202406/sunset.jpg');
    expect(records[0].tags).toEqual(['bosphorus', 'nostr']);
    expect(records[0].timestampUnix).toBe(1718450000);
  });
});
