import { IGMediaChild, IGMediaRecord, IGMediaType } from '../../types';
import { extractHashtags as extractTagsHelper } from '../../services/tags';

/**
 * Extracts hashtags from post caption text.
 * Strips leading '#' and normalizes to clean lowercase tag strings.
 */
export function extractHashtags(caption?: string): string[] {
  return extractTagsHelper(caption);
}

/**
 * Structure of official Instagram Data Export (posts_1.json)
 */
export interface MetaExportPostItem {
  title?: string;
  creation_timestamp?: number;
  media?: Array<{
    uri: string;
    creation_timestamp?: number;
    title?: string;
  }>;
}

/**
 * Parses official Meta Download Your Information archive content (posts_1.json).
 */
export function parseInstagramArchiveJson(jsonInput: string | unknown): IGMediaRecord[] {
  let parsed: unknown = jsonInput;

  if (typeof jsonInput === 'string') {
    try {
      parsed = JSON.parse(jsonInput);
    } catch (err) {
      throw new Error(`Invalid JSON format: ${(err as Error).message}`);
    }
  }

  const rawList = Array.isArray(parsed)
    ? parsed
    : typeof parsed === 'object' && parsed !== null && 'items' in parsed && Array.isArray((parsed as { items: unknown[] }).items)
    ? (parsed as { items: unknown[] }).items
    : [];

  const records: IGMediaRecord[] = [];

  for (let i = 0; i < rawList.length; i++) {
    const entry = rawList[i] as MetaExportPostItem;
    const caption = entry.title || '';
    const creationTimestamp = entry.creation_timestamp || Math.floor(Date.now() / 1000);
    const tags = extractHashtags(caption);

    const mediaList = entry.media || [];
    const isCarousel = mediaList.length > 1;
    const firstMedia = mediaList[0];

    const mediaType: IGMediaType = isCarousel
      ? 'CAROUSEL_ALBUM'
      : firstMedia?.uri?.endsWith('.mp4')
      ? 'VIDEO'
      : 'IMAGE';

    const children: IGMediaChild[] = mediaList.map((m, idx) => ({
      id: `archive-${i}-${idx}`,
      media_type: m.uri?.endsWith('.mp4') ? 'VIDEO' : 'IMAGE',
      media_url: m.uri,
    }));

    records.push({
      id: `export-${creationTimestamp}-${i}`,
      caption,
      media_type: mediaType,
      media_url: firstMedia?.uri || '',
      permalink: `https://www.instagram.com/`,
      timestamp: new Date(creationTimestamp * 1000).toISOString(),
      timestampUnix: creationTimestamp,
      children: children.length > 1 ? children : undefined,
      tags,
      selected: true,
    });
  }

  return records;
}

/**
 * In-browser calculation of image dimensions (width x height) from a Blob.
 */
export async function calculateImageDimensions(blob: Blob): Promise<{ width: number; height: number } | null> {
  if (typeof window === 'undefined' || !blob.type.startsWith('image/')) {
    return null;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const dimensions = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(dimensions);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
}

/**
 * Computes SHA-256 hexadecimal digest for a Blob.
 */
export async function computeBlobSha256(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
