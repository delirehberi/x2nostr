import { describe, expect, it } from 'vitest';
import { extractHashtags, parseInstagramArchiveJson } from '../src/importers/instagram/parser';

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

describe('Meta Data Export Archive Parser', () => {
  it('should parse official posts_1.json single image export structure', () => {
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
    expect(records[0].selected).toBe(true);
  });

  it('should parse official posts_1.json carousel album exports with multiple slides', () => {
    const mockExportJson = JSON.stringify([
      {
        title: 'Weekend road trip album #travel #adventure',
        creation_timestamp: 1718719200,
        media: [
          {
            uri: 'media/posts/202406/slide1.jpg',
            creation_timestamp: 1718719200,
          },
          {
            uri: 'media/posts/202406/slide2.jpg',
            creation_timestamp: 1718719200,
          },
        ],
      },
    ]);

    const records = parseInstagramArchiveJson(mockExportJson);
    expect(records).toHaveLength(1);
    const post = records[0];
    expect(post.media_type).toBe('CAROUSEL_ALBUM');
    expect(post.tags).toEqual(['travel', 'adventure']);
    expect(post.children).toBeDefined();
    expect(post.children).toHaveLength(2);
    expect(post.children![0].media_url).toBe('media/posts/202406/slide1.jpg');
    expect(post.children![1].media_url).toBe('media/posts/202406/slide2.jpg');
  });

  it('should parse video/reel items ending in .mp4 accurately', () => {
    const mockExportJson = JSON.stringify([
      {
        title: 'Drone shot of mountains #nature #video',
        creation_timestamp: 1718800000,
        media: [
          {
            uri: 'media/posts/202406/drone.mp4',
            creation_timestamp: 1718800000,
          },
        ],
      },
    ]);

    const records = parseInstagramArchiveJson(mockExportJson);
    expect(records).toHaveLength(1);
    expect(records[0].media_type).toBe('VIDEO');
    expect(records[0].media_url).toBe('media/posts/202406/drone.mp4');
  });

  it('should handle wrapped object with items array structure', () => {
    const mockExportObj = {
      items: [
        {
          title: 'Direct object array wrapper',
          creation_timestamp: 1718900000,
          media: [{ uri: 'media/posts/direct.jpg' }],
        },
      ],
    };

    const records = parseInstagramArchiveJson(mockExportObj);
    expect(records).toHaveLength(1);
    expect(records[0].caption).toBe('Direct object array wrapper');
  });

  it('should throw descriptive error on invalid JSON string', () => {
    expect(() => parseInstagramArchiveJson('{ invalid: json')).toThrow(/Invalid JSON format/);
  });
});
