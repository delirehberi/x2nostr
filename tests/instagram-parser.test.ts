import { describe, expect, it } from 'vitest';
import { extractHashtags, fixMetaUtf8Encoding, parseInstagramArchiveJson, sanitizeMetaUri } from '../src/importers/instagram/parser';

describe('Meta URI Sanitizer (sanitizeMetaUri)', () => {
  it('should strip file:/// schemes and absolute android/ios storage paths', () => {
    expect(sanitizeMetaUri('file:///storage/emulated/0/Download/media/posts/17895491646657919.heic')).toBe('media/posts/17895491646657919.heic');
    expect(sanitizeMetaUri('file:///Users/username/Downloads/archive/media/reels/202608/reel1.mp4')).toBe('media/reels/202608/reel1.mp4');
    expect(sanitizeMetaUri('file://media/posts/123.jpg')).toBe('media/posts/123.jpg');
    expect(sanitizeMetaUri('media\\posts\\123.heic')).toBe('media/posts/123.heic');
    expect(sanitizeMetaUri('/media/posts/123.heic')).toBe('media/posts/123.heic');
  });

  it('should sanitize raw file:/// URIs in parseInstagramArchiveJson', () => {
    const rawJson = JSON.stringify([
      {
        title: 'Mobile export photo',
        creation_timestamp: 1786732260,
        media: [
          {
            uri: 'file:///storage/emulated/0/Instagram/media/posts/mobile_photo.heic',
            creation_timestamp: 1786732260,
          },
        ],
      },
    ]);

    const records = parseInstagramArchiveJson(rawJson);
    expect(records).toHaveLength(1);
    expect(records[0].media_url).toBe('media/posts/mobile_photo.heic');
  });
});

describe('Meta UTF-8 Mojibake Repair (fixMetaUtf8Encoding)', () => {
  it('should repair Turkish characters escaped as ISO-8859-1 byte sequences', () => {
    // "\u00c3\u00bc\u00c3\u00a7" -> "üç"
    const input = '\u00c3\u00bc\u00c3\u00a7, iki, bir...\ndans, renk!';
    expect(fixMetaUtf8Encoding(input)).toBe('üç, iki, bir...\ndans, renk!');
  });

  it('should repair complex Turkish strings with ğ, ş, ö, ç, ü, ı', () => {
    const input = 'ak\u00c5\u009fam vlogu\n\nG\u00c3\u00bclmek iyidir, foto\u00c4\u009fraf \u00c3\u00a7ekmek de g\u00c3\u00bczeldir.';
    expect(fixMetaUtf8Encoding(input)).toBe('akşam vlogu\n\nGülmek iyidir, fotoğraf çekmek de güzeldir.');
  });

  it('should repair 4-byte UTF-8 emojis (🤘, 📸, 🔥)', () => {
    const input = 'Rock on \u00f0\u009f\u00a4\u0098 and take a photo \u00f0\u009f\u0093\u00b8 \u00f0\u009f\u0094\u00a5';
    expect(fixMetaUtf8Encoding(input)).toBe('Rock on 🤘 and take a photo 📸 🔥');
  });

  it('should leave already well-formed UTF-8 text intact without distortion', () => {
    const cleanText = 'Merhaba dünya! Standard English and Turkish text: ç, ğ, ı, ö, ş, ü.';
    expect(fixMetaUtf8Encoding(cleanText)).toBe(cleanText);
  });
});

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

  it('should parse posts.json labeled values format with HEIC photos, captions, and places', () => {
    const mockLabeledPostsJson = JSON.stringify([
      {
        timestamp: 1786732258,
        media: [],
        label_values: [
          {
            label: 'Caption',
            value: '\u00c3\u00bc\u00c3\u00a7, iki, bir...\ndans, renk! #dance #colors',
          },
          {
            label: 'Media',
            media: [
              {
                uri: 'media/posts/17895491646657919.heic',
                creation_timestamp: 1786732260,
                media_metadata: {
                  photo_metadata: {
                    exif_data: [
                      {
                        latitude: 38.439280845488,
                        longitude: 27.144047,
                      },
                    ],
                  },
                },
              },
            ],
          },
        ],
      },
    ]);

    const records = parseInstagramArchiveJson(mockLabeledPostsJson);
    expect(records).toHaveLength(1);
    expect(records[0].caption).toBe('üç, iki, bir...\ndans, renk! #dance #colors');
    expect(records[0].media_type).toBe('IMAGE');
    expect(records[0].media_url).toBe('media/posts/17895491646657919.heic');
    expect(records[0].tags).toEqual(['dance', 'colors']);
    expect(records[0].timestampUnix).toBe(1786732260);
  });

  it('should parse posts.json labeled values carousel format with multiple dict items', () => {
    const mockCarouselPostsJson = JSON.stringify([
      {
        timestamp: 1786000000,
        media: [],
        label_values: [
          {
            label: 'Caption',
            value: 'Awesome carousel album #memories',
          },
          {
            title: 'Media',
            dict: [
              {
                label_values: [
                  {
                    label: 'Media',
                    media: [
                      {
                        uri: 'media/posts/slide_a.heic',
                        creation_timestamp: 1786000000,
                      },
                    ],
                  },
                ],
              },
              {
                label_values: [
                  {
                    label: 'Media',
                    media: [
                      {
                        uri: 'media/posts/slide_b.heic',
                        creation_timestamp: 1786000010,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);

    const records = parseInstagramArchiveJson(mockCarouselPostsJson);
    expect(records).toHaveLength(1);
    expect(records[0].media_type).toBe('CAROUSEL_ALBUM');
    expect(records[0].children).toHaveLength(2);
    expect(records[0].children![0].media_url).toBe('media/posts/slide_a.heic');
    expect(records[0].children![1].media_url).toBe('media/posts/slide_b.heic');
  });

  it('should parse reels.json (ig_reels_media) structure with .mp4 video files', () => {
    const mockReelsJson = JSON.stringify({
      ig_reels_media: [
        {
          media: [
            {
              uri: 'media/reels/202608/18171753448450006.mp4',
              creation_timestamp: 1787164326,
              title: 'ak\u00c5\u009fam vlogu\n\n#catlife #vlog #cats',
            },
          ],
        },
      ],
    });

    const records = parseInstagramArchiveJson(mockReelsJson);
    expect(records).toHaveLength(1);
    expect(records[0].media_type).toBe('VIDEO');
    expect(records[0].media_url).toBe('media/reels/202608/18171753448450006.mp4');
    expect(records[0].caption).toBe('akşam vlogu\n\n#catlife #vlog #cats');
    expect(records[0].tags).toEqual(['catlife', 'vlog', 'cats']);
    expect(records[0].timestampUnix).toBe(1787164326);
  });

  it('should parse stories.json (ig_stories) structure', () => {
    const mockStoriesJson = JSON.stringify({
      ig_stories: [
        {
          uri: 'media/stories/story1.jpg',
          creation_timestamp: 1787100000,
          title: 'Daily story snapshot',
        },
      ],
    });

    const records = parseInstagramArchiveJson(mockStoriesJson);
    expect(records).toHaveLength(1);
    expect(records[0].media_url).toBe('media/stories/story1.jpg');
    expect(records[0].caption).toBe('Daily story snapshot');
    expect(records[0].media_type).toBe('IMAGE');
  });

  it('should parse multi-slide carousel across mixed deep tree structures and assign all slides in order', () => {
    const mockDeepCarousel = JSON.stringify([
      {
        timestamp: 1785000000,
        label_values: [
          { label: 'Caption', value: 'Trip to Cappadocia #turkey #travel' },
          {
            title: 'Media',
            dict: [
              { label: 'Media', media: [{ uri: 'media/posts/cappadocia1.heic', creation_timestamp: 1785000001 }] },
              { label: 'Media', media: [{ uri: 'media/posts/cappadocia2.heic', creation_timestamp: 1785000002 }] },
              { label: 'Media', media: [{ uri: 'media/posts/cappadocia3.mp4', creation_timestamp: 1785000003 }] },
            ],
          },
        ],
      },
    ]);

    const records = parseInstagramArchiveJson(mockDeepCarousel);
    expect(records).toHaveLength(1);
    const post = records[0];
    expect(post.media_type).toBe('CAROUSEL_ALBUM');
    expect(post.children).toHaveLength(3);
    expect(post.children![0].media_url).toBe('media/posts/cappadocia1.heic');
    expect(post.children![0].media_type).toBe('IMAGE');
    expect(post.children![1].media_url).toBe('media/posts/cappadocia2.heic');
    expect(post.children![1].media_type).toBe('IMAGE');
    expect(post.children![2].media_url).toBe('media/posts/cappadocia3.mp4');
    expect(post.children![2].media_type).toBe('VIDEO');
  });

  it('should throw descriptive error on invalid JSON string', () => {
    expect(() => parseInstagramArchiveJson('{ invalid: json')).toThrow(/Invalid JSON format/);
  });
});

describe('Image Converter Service (HEIC detection & memory cache)', () => {
  it('should identify HEIC/HEIF by filename extension or Blob mime type', async () => {
    const { imageConverter } = await import('../src/services/image-converter');
    expect(imageConverter.isHeic('17895491646657919.heic')).toBe(true);
    expect(imageConverter.isHeic('photo.HEIF')).toBe(true);
    expect(imageConverter.isHeic('media/posts/photo.heic')).toBe(true);
    expect(imageConverter.isHeic('sunset.jpg')).toBe(false);
    expect(imageConverter.isHeic('clip.mp4')).toBe(false);
    expect(imageConverter.isHeic(undefined, new Blob([], { type: 'image/heic' }))).toBe(true);
    expect(imageConverter.isHeic(undefined, new Blob([], { type: 'image/jpeg' }))).toBe(false);
  });

  it('should manage cache and eviction correctly', async () => {
    const { imageConverter } = await import('../src/services/image-converter');
    imageConverter.clearCache();
    expect(imageConverter.hasCached('nonexistent')).toBe(false);
    expect(imageConverter.getCached('nonexistent')).toBeUndefined();
  });
});

describe('Instagram Pipeline Category Selection', () => {
  it('should select and deselect items by category', async () => {
    const { instagramPipeline } = await import('../src/importers/instagram/pipeline');
    instagramPipeline.reset();

    const mockExportJson = JSON.stringify([
      {
        title: 'Single photo post',
        creation_timestamp: 1718450000,
        media: [{ uri: 'media/posts/pic.jpg', creation_timestamp: 1718450000 }],
      },
      {
        title: 'Carousel post',
        creation_timestamp: 1718460000,
        media: [
          { uri: 'media/posts/slide1.jpg', creation_timestamp: 1718460000 },
          { uri: 'media/posts/slide2.jpg', creation_timestamp: 1718460000 },
        ],
      },
      {
        title: 'Video post',
        creation_timestamp: 1718470000,
        media: [{ uri: 'media/posts/clip.mp4', creation_timestamp: 1718470000 }],
      },
    ]);

    instagramPipeline.loadArchiveJson(mockExportJson);
    const posts = instagramPipeline.getPosts();
    expect(posts).toHaveLength(3);

    // Deselect all
    instagramPipeline.selectAll(false);
    expect(instagramPipeline.getPosts().every((p) => !p.selected)).toBe(true);

    // Select only carousels
    instagramPipeline.selectByCategory('carousel', true);
    const afterCarouselSelect = instagramPipeline.getPosts();
    expect(afterCarouselSelect.find((p) => p.media_type === 'CAROUSEL_ALBUM')?.selected).toBe(true);
    expect(afterCarouselSelect.find((p) => p.media_type === 'IMAGE')?.selected).toBe(false);
    expect(afterCarouselSelect.find((p) => p.media_type === 'VIDEO')?.selected).toBe(false);

    // Select videos
    instagramPipeline.selectByCategory('video', true);
    const afterVideoSelect = instagramPipeline.getPosts();
    expect(afterVideoSelect.find((p) => p.media_type === 'VIDEO')?.selected).toBe(true);
  });

  it('should handle background HEIC conversion progress and abort safely', async () => {
    const { instagramPipeline } = await import('../src/importers/instagram/pipeline');
    instagramPipeline.reset();

    const initialProgress = instagramPipeline.getConversionProgress();
    expect(initialProgress.active).toBe(false);
    expect(initialProgress.percentage).toBe(0);

    const recordedProgress: any[] = [];
    const unsub = instagramPipeline.subscribeConversionProgress((p) => {
      recordedProgress.push(p);
    });

    const mockPostWithoutHeic = [
      {
        id: 'test-1',
        title: 'photo',
        timestamp: 1718450000,
        timestampUnix: 1718450000,
        media_type: 'IMAGE' as const,
        media_url: 'blob:mock-jpg',
        tags: [],
        selected: true,
        fileBlob: new Blob(['fake-jpg'], { type: 'image/jpeg' }),
      },
    ];

    await instagramPipeline.startBackgroundMediaConversion(mockPostWithoutHeic as any);
    expect(instagramPipeline.getConversionProgress().active).toBe(false);
    expect(instagramPipeline.getConversionProgress().percentage).toBe(100);

    unsub();
  });

  it('should count unconverted HEIC assets accurately and support manual cancellation', async () => {
    const { instagramPipeline } = await import('../src/importers/instagram/pipeline');
    instagramPipeline.reset();

    const mockPosts = [
      {
        id: 'post-1',
        title: 'HEIC photo',
        timestamp: 1718450000,
        timestampUnix: 1718450000,
        media_type: 'IMAGE' as const,
        media_url: 'media/posts/photo1.heic',
        filename: 'photo1.heic',
        tags: [],
        selected: true,
        fileBlob: new Blob(['fake-heic'], { type: 'image/heic' }),
      },
      {
        id: 'post-2',
        title: 'JPEG photo',
        timestamp: 1718460000,
        timestampUnix: 1718460000,
        media_type: 'IMAGE' as const,
        media_url: 'media/posts/photo2.jpg',
        filename: 'photo2.jpg',
        tags: [],
        selected: true,
        fileBlob: new Blob(['fake-jpg'], { type: 'image/jpeg' }),
      },
      {
        id: 'post-3',
        title: 'HEIC carousel',
        timestamp: 1718470000,
        timestampUnix: 1718470000,
        media_type: 'CAROUSEL_ALBUM' as const,
        media_url: '',
        tags: [],
        selected: true,
        children: [
          {
            id: 'c1',
            media_type: 'IMAGE' as const,
            media_url: 'media/posts/slide1.heic',
            filename: 'slide1.heic',
            fileBlob: new Blob(['fake-heic'], { type: 'image/heic' }),
          },
          {
            id: 'c2',
            media_type: 'IMAGE' as const,
            media_url: 'blob:converted-slide2',
            filename: 'slide2.heic',
            fileBlob: new Blob(['fake-heic'], { type: 'image/heic' }),
          },
        ],
      },
    ];

    instagramPipeline.setPosts(mockPosts as any);
    // post-1 (1 HEIC) + post-3 slide1 (1 unconverted HEIC, slide2 is already blob:converted) = 2 unconverted HEICs
    expect(instagramPipeline.countUnconvertedHeic()).toBe(2);

    // Test cancellation resets state
    instagramPipeline.cancelBackgroundMediaConversion();
    expect(instagramPipeline.getConversionProgress().active).toBe(false);
  });
});



