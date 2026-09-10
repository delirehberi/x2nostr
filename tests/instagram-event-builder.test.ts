import { describe, expect, it } from 'vitest';
import { buildInstagramDeletionEvent, buildKind20PictureEvent, UploadedMediaItem } from '../src/importers/instagram/event-builder';
import { IGMediaRecord } from '../src/types';

describe('Instagram Event Builder (Strictly Kind 20 - NIP-68)', () => {
  const TEST_PUBKEY = 'fa107444c193c71d437c5f778939c315d6253bc0fa5e505413be97cbda614d40';

  const SAMPLE_RECORD: IGMediaRecord = {
    id: '17923849123456789',
    caption: 'Sunset over Istanbul! Beautiful views #istanbul #sunset #photography',
    media_type: 'IMAGE',
    media_url: 'https://scontent.cdninstagram.com/photo.jpg',
    permalink: 'https://www.instagram.com/p/C_abc123/',
    timestamp: '2026-06-15T18:45:00Z',
    timestampUnix: 1781549100,
    tags: ['istanbul', 'sunset', 'photography'],
  };

  const UPLOADED_MEDIA: UploadedMediaItem[] = [
    {
      url: 'https://blossom.primal.net/a1b2c3d4e5f6.jpg',
      sha256: 'a1b2c3d4e5f67890123456789012345678901234567890123456789012345678',
      mime: 'image/jpeg',
      dim: '1080x1350',
      alt: 'Sunset over Istanbul! Beautiful views',
    },
  ];

  it('should build strictly Kind 20 Picture Post event with correct NIP-68 and NIP-92 tags', () => {
    const event = buildKind20PictureEvent(SAMPLE_RECORD, TEST_PUBKEY, UPLOADED_MEDIA);

    // Strict Kind 20 assertion
    expect(event.kind).toBe(20);
    expect(event.pubkey).toBe(TEST_PUBKEY);
    expect(event.created_at).toBe(SAMPLE_RECORD.timestampUnix);
    expect(event.content).toBe(SAMPLE_RECORD.caption);

    // Verify NIP-68 'image' tag format: ['image', url, dim, sha256]
    const imageTags = event.tags.filter((t) => t[0] === 'image');
    expect(imageTags).toHaveLength(1);
    expect(imageTags[0]).toEqual([
      'image',
      'https://blossom.primal.net/a1b2c3d4e5f6.jpg',
      '1080x1350',
      'a1b2c3d4e5f67890123456789012345678901234567890123456789012345678',
    ]);

    // Verify NIP-92 'imeta' tag
    const imetaTags = event.tags.filter((t) => t[0] === 'imeta');
    expect(imetaTags).toHaveLength(1);
    const imetaEntries = imetaTags[0].slice(1);
    expect(imetaEntries).toContain('url https://blossom.primal.net/a1b2c3d4e5f6.jpg');
    expect(imetaEntries).toContain('m image/jpeg');
    expect(imetaEntries).toContain('x a1b2c3d4e5f67890123456789012345678901234567890123456789012345678');
    expect(imetaEntries).toContain('dim 1080x1350');

    // Verify hashtag tags ['t', 'hashtag']
    const tTags = event.tags.filter((t) => t[0] === 't');
    expect(tTags).toEqual([
      ['t', 'istanbul'],
      ['t', 'sunset'],
      ['t', 'photography'],
    ]);

    // Verify provenance tags
    expect(event.tags).toContainEqual(['published_at', '1781549100']);
    expect(event.tags).toContainEqual(['proxy', 'https://www.instagram.com/p/C_abc123/', 'instagram']);
    expect(event.tags).toContainEqual(['client', 'x2nostr']);
  });

  it('should format carousel album slides as multiple image and imeta tags preserving slide order', () => {
    const CAROUSEL_MEDIA: UploadedMediaItem[] = [
      {
        url: 'https://blossom.primal.net/slide1.jpg',
        sha256: 'hash1111111111111111111111111111111111111111111111111111111111111111',
        dim: '1080x1080',
      },
      {
        url: 'https://blossom.primal.net/slide2.jpg',
        sha256: 'hash2222222222222222222222222222222222222222222222222222222222222222',
        dim: '1080x1080',
      },
    ];

    const event = buildKind20PictureEvent(SAMPLE_RECORD, TEST_PUBKEY, CAROUSEL_MEDIA);

    expect(event.kind).toBe(20);
    const imageTags = event.tags.filter((t) => t[0] === 'image');
    expect(imageTags).toHaveLength(2);
    expect(imageTags[0][1]).toBe('https://blossom.primal.net/slide1.jpg');
    expect(imageTags[1][1]).toBe('https://blossom.primal.net/slide2.jpg');
  });

  it('should build NIP-09 deletion event targeting Kind 20 picture events', () => {
    const event = buildInstagramDeletionEvent(['event123', 'event456'], TEST_PUBKEY);
    expect(event.kind).toBe(5);
    expect(event.tags).toContainEqual(['e', 'event123']);
    expect(event.tags).toContainEqual(['e', 'event456']);
    expect(event.tags).toContainEqual(['k', '20']);
  });
});
