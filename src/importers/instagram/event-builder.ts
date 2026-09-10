import { IGMediaRecord, UnsignedNostrEvent } from '../../types';

export interface UploadedMediaItem {
  url: string;
  sha256: string;
  mime?: string;
  dim?: string; // e.g. "1080x1080"
  alt?: string;
}

/**
 * Builds a strict NIP-68 (Kind 20 - Picture Post) unsigned Nostr event.
 * Follows NIP-68 picture specifications with NIP-92 imeta media attachments.
 */
export function buildKind20PictureEvent(
  record: IGMediaRecord,
  pubkey: string,
  mediaItems: UploadedMediaItem[]
): UnsignedNostrEvent {
  const tags: string[][] = [];

  // 1. Primary NIP-68 image tags for each media item (first item is main photo, subsequent are carousel slides)
  for (const item of mediaItems) {
    const imageTag = ['image', item.url];
    if (item.dim) imageTag.push(item.dim);
    if (item.sha256) {
      if (!item.dim) imageTag.push(''); // pad dimension if empty
      imageTag.push(item.sha256);
    }
    tags.push(imageTag);
  }

  // 2. NIP-92 imeta tags for rich client interoperability
  for (const item of mediaItems) {
    const imetaEntries: string[] = [`url ${item.url}`];
    if (item.mime) imetaEntries.push(`m ${item.mime}`);
    if (item.sha256) imetaEntries.push(`x ${item.sha256}`);
    if (item.dim) imetaEntries.push(`dim ${item.dim}`);
    if (item.alt || record.caption) {
      const altText = (item.alt || record.caption || '').slice(0, 150).replace(/[\r\n]+/g, ' ');
      imetaEntries.push(`alt ${altText}`);
    }
    tags.push(['imeta', ...imetaEntries]);
  }

  // 3. Title tag (first line of caption or concise snippet)
  if (record.caption) {
    const firstLine = record.caption.split('\n')[0]?.trim();
    if (firstLine) {
      tags.push(['title', firstLine.length > 100 ? `${firstLine.slice(0, 97)}...` : firstLine]);
    }
  }

  // 4. NIP-12 hashtag tags
  if (record.tags && record.tags.length > 0) {
    for (const tag of record.tags) {
      tags.push(['t', tag.toLowerCase()]);
    }
  }

  // 5. Source provenance & timestamps
  tags.push(['published_at', String(record.timestampUnix)]);
  if (record.permalink) {
    tags.push(['proxy', record.permalink, 'instagram']);
  }
  tags.push(['client', 'x2nostr']);

  return {
    kind: 20,
    created_at: record.timestampUnix,
    pubkey,
    tags,
    content: record.caption || '',
  };
}

/**
 * Constructs a NIP-09 (Kind 5) deletion event targeting previously published Kind 20 picture events.
 */
export function buildInstagramDeletionEvent(eventIds: string[], pubkey: string): UnsignedNostrEvent {
  const tags: string[][] = eventIds.map((id) => ['e', id]);
  tags.push(['k', '20']);

  return {
    kind: 5,
    created_at: Math.floor(Date.now() / 1000),
    pubkey,
    tags,
    content: 'Deleted previous Instagram picture imports via x2nostr',
  };
}
