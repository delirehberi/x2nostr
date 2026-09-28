import { IGMediaChild, IGMediaRecord, IGMediaType } from '../../types';
import { extractHashtags as extractTagsHelper } from '../../services/tags';

/**
 * Repairs Meta's Latin-1 escaped UTF-8 mojibake strings back to pristine Unicode.
 * Meta exports characters like 'ü', 'ç', 'ğ', 'ş', 'ö' and emojis as raw byte sequences
 * decoded into ISO-8859-1 strings (e.g. "\u00c3\u00bc" -> "ü", "\u00f0\u009f\u00a4\u0098" -> "🤘").
 */
export function fixMetaUtf8Encoding(str?: string): string {
  if (!str) return '';
  try {
    // If string already contains characters > 255 (e.g. ğ, ş, ı, pristine emojis),
    // it is already well-formed Unicode and does not have Meta ISO-8859-1 byte encoding.
    for (let i = 0; i < str.length; i++) {
      if (str.charCodeAt(i) > 255) {
        return str;
      }
    }

    // Only attempt decoding if characters in the high byte range 0x80..0xFF exist
    if (!/[\u0080-\u00FF]/.test(str)) {
      return str;
    }

    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i);
    }

    // fatal: true ensures invalid UTF-8 byte sequences throw instead of corrupting
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return decoded || str;
  } catch {
    return str;
  }
}

/**
 * Extracts hashtags from post caption text after repairing Meta encoding.
 */
export function extractHashtags(caption?: string): string[] {
  const decoded = fixMetaUtf8Encoding(caption);
  return extractTagsHelper(decoded);
}

/**
 * Sanitizes Meta export URIs by stripping file:/// schemes, absolute device storage paths,
 * and normalizing backslashes to clean relative paths (e.g. 'media/posts/123.heic').
 */
export function sanitizeMetaUri(rawUri?: string): string {
  if (!rawUri) return '';
  let uri = rawUri.trim();
  if (uri.startsWith('file:///')) {
    uri = uri.replace(/^file:\/\/\/?/, '');
  } else if (uri.startsWith('file://')) {
    uri = uri.replace(/^file:\/\//, '');
  }
  uri = uri.replace(/\\/g, '/');

  const mediaIdx = uri.toLowerCase().lastIndexOf('media/');
  if (mediaIdx !== -1) {
    uri = uri.substring(mediaIdx);
  } else {
    uri = uri.replace(/^\/+/, '');
  }
  return uri;
}

/**
 * Determines media type from file extension.
 */
export function detectMediaType(uri?: string, isCarousel = false): IGMediaType {
  if (isCarousel) return 'CAROUSEL_ALBUM';
  if (!uri) return 'IMAGE';
  const clean = sanitizeMetaUri(uri).toLowerCase();
  if (clean.endsWith('.mp4') || clean.endsWith('.mov') || clean.endsWith('.webm')) {
    return 'VIDEO';
  }
  return 'IMAGE';
}

/**
 * Structure of Meta Simplified Post Export (posts_1.json)
 */
export interface MetaSimplifiedPostItem {
  title?: string;
  creation_timestamp?: number;
  media?: Array<{
    uri: string;
    creation_timestamp?: number;
    title?: string;
    media_metadata?: {
      photo_metadata?: {
        exif_data?: Array<{
          latitude?: number;
          longitude?: number;
          date_time_original?: string;
          software?: string;
        }>;
      };
      video_metadata?: {
        exif_data?: Array<{
          latitude?: number;
          longitude?: number;
        }>;
      };
    };
  }>;
}

/**
 * Structure of Meta Labeled Values Post Export (posts.json)
 */
export interface MetaLabeledValuesItem {
  timestamp?: number;
  fbid?: string;
  media?: unknown[];
  label_values?: Array<{
    label?: string;
    value?: string;
    timestamp_value?: number;
    title?: string;
    media?: Array<{
      uri: string;
      creation_timestamp?: number;
      title?: string;
      media_metadata?: Record<string, unknown>;
    }>;
    dict?: unknown[];
    vec?: unknown[];
  }>;
}

/**
 * Structure of Meta Reels Export (reels.json)
 */
export interface MetaReelsExportRoot {
  ig_reels_media?: Array<{
    media?: Array<{
      uri: string;
      creation_timestamp?: number;
      title?: string;
      media_metadata?: {
        video_metadata?: {
          subtitles?: {
            uri: string;
            creation_timestamp?: number;
          };
          exif_data?: Array<{
            latitude?: number;
            longitude?: number;
          }>;
        };
      };
    }>;
  }>;
}

/**
 * Structure of Meta Stories Export (stories.json)
 */
export interface MetaStoriesExportRoot {
  ig_stories?: Array<{
    uri?: string;
    creation_timestamp?: number;
    title?: string;
    media?: Array<{
      uri: string;
      creation_timestamp?: number;
      title?: string;
    }>;
  }>;
}

export interface ExtractedMediaItem {
  uri: string;
  creation_timestamp?: number;
  title?: string;
}

/**
 * Recursively extracts all media items with 'uri' from any nested Meta JSON node.
 */
export function extractMediaNodes(node: unknown, results: ExtractedMediaItem[] = []): ExtractedMediaItem[] {
  if (!node || typeof node !== 'object') return results;

  if (Array.isArray(node)) {
    for (const item of node) {
      extractMediaNodes(item, results);
    }
    return results;
  }

  const obj = node as Record<string, unknown>;

  if (typeof obj.uri === 'string' && obj.uri.trim().length > 0) {
    const uri = sanitizeMetaUri(obj.uri);
    if (uri && !results.some((m) => m.uri === uri)) {
      results.push({
        uri,
        creation_timestamp: typeof obj.creation_timestamp === 'number' ? obj.creation_timestamp : undefined,
        title: typeof obj.title === 'string' ? obj.title : undefined,
      });
    }
  }

  for (const key of Object.keys(obj)) {
    if (
      key === 'photo_metadata' ||
      key === 'video_metadata' ||
      key === 'camera_metadata' ||
      key === 'exif_data' ||
      key === 'cross_post_source'
    ) {
      continue;
    }
    extractMediaNodes(obj[key], results);
  }

  return results;
}

/**
 * Parses Format A: Simplified posts export (posts_1.json, archived_posts.json).
 */
export function parseSimplifiedPostsArchive(items: MetaSimplifiedPostItem[]): IGMediaRecord[] {
  const records: IGMediaRecord[] = [];

  for (let i = 0; i < items.length; i++) {
    const entry = items[i];
    const mediaList = extractMediaNodes(entry);

    if (mediaList.length === 0) {
      continue;
    }

    const firstMedia = mediaList[0];
    const rawCaption = entry.title || firstMedia?.title || '';
    const caption = fixMetaUtf8Encoding(rawCaption);
    const creationTimestamp = firstMedia?.creation_timestamp || entry.creation_timestamp || Math.floor(Date.now() / 1000);
    const tags = extractHashtags(caption);

    const isCarousel = mediaList.length > 1;
    const mediaType = detectMediaType(firstMedia?.uri, isCarousel);

    const children: IGMediaChild[] = mediaList.map((m, idx) => ({
      id: `post-${creationTimestamp}-${i}-${idx}`,
      media_type: detectMediaType(m.uri, false) as 'IMAGE' | 'VIDEO',
      media_url: m.uri,
      timestamp: m.creation_timestamp ? new Date(m.creation_timestamp * 1000).toISOString() : undefined,
    }));

    records.push({
      id: `post-${creationTimestamp}-${i}`,
      caption,
      media_type: mediaType,
      media_url: firstMedia?.uri || '',
      permalink: 'https://www.instagram.com/',
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
 * Parses Format B: Rich labeled values posts export (posts.json).
 */
export function parseLabeledValuesPostsArchive(items: MetaLabeledValuesItem[]): IGMediaRecord[] {
  const records: IGMediaRecord[] = [];

  for (let i = 0; i < items.length; i++) {
    const entry = items[i];
    const labels = entry.label_values || [];

    let rawCaption = '';
    let creationTimestamp = entry.timestamp || Math.floor(Date.now() / 1000);

    for (const lv of labels) {
      if (lv.label === 'Caption' && lv.value) {
        rawCaption = lv.value;
      } else if (lv.label === 'Title' && lv.value && !rawCaption) {
        rawCaption = lv.value;
      } else if (lv.label === 'Creation time' && lv.timestamp_value && lv.timestamp_value > 0) {
        creationTimestamp = lv.timestamp_value;
      }
    }

    // Recursively extract all media across label_values, media array, dict trees, etc.
    const allMediaUris = extractMediaNodes(entry);

    if (allMediaUris.length === 0) {
      continue;
    }

    if (!rawCaption && allMediaUris[0].title) {
      rawCaption = allMediaUris[0].title;
    }

    const firstMedia = allMediaUris[0];
    const finalTimestamp = firstMedia?.creation_timestamp || creationTimestamp;
    const caption = fixMetaUtf8Encoding(rawCaption);
    const tags = extractHashtags(caption);
    const isCarousel = allMediaUris.length > 1;
    const mediaType = detectMediaType(firstMedia.uri, isCarousel);

    const children: IGMediaChild[] = allMediaUris.map((m, idx) => ({
      id: `labeled-${entry.fbid || finalTimestamp}-${i}-${idx}`,
      media_type: detectMediaType(m.uri, false) as 'IMAGE' | 'VIDEO',
      media_url: m.uri,
      timestamp: m.creation_timestamp ? new Date(m.creation_timestamp * 1000).toISOString() : undefined,
    }));

    records.push({
      id: entry.fbid ? `post-${entry.fbid}` : `post-${finalTimestamp}-${i}`,
      caption,
      media_type: mediaType,
      media_url: firstMedia.uri,
      permalink: 'https://www.instagram.com/',
      timestamp: new Date(finalTimestamp * 1000).toISOString(),
      timestampUnix: finalTimestamp,
      children: children.length > 1 ? children : undefined,
      tags,
      selected: true,
    });
  }

  return records;
}

/**
 * Parses Format C: Reels export (reels.json).
 */
export function parseReelsArchive(reelsData: MetaReelsExportRoot): IGMediaRecord[] {
  const items = reelsData.ig_reels_media || [];
  const records: IGMediaRecord[] = [];

  for (let i = 0; i < items.length; i++) {
    const reel = items[i];
    const mediaList = reel.media || [];
    const video = mediaList[0];
    if (!video || !video.uri) continue;
    const cleanUri = sanitizeMetaUri(video.uri);
    if (!cleanUri) continue;

    const rawCaption = video.title || '';
    const caption = fixMetaUtf8Encoding(rawCaption);
    const creationTimestamp = video.creation_timestamp || Math.floor(Date.now() / 1000);
    const tags = extractHashtags(caption);

    records.push({
      id: `reel-${creationTimestamp}-${i}`,
      caption,
      media_type: 'VIDEO',
      media_url: cleanUri,
      media_product_type: 'REELS',
      permalink: 'https://www.instagram.com/',
      timestamp: new Date(creationTimestamp * 1000).toISOString(),
      timestampUnix: creationTimestamp,
      tags,
      selected: true,
    });
  }

  return records;
}

/**
 * Parses Format D: Stories export (stories.json).
 */
export function parseStoriesArchive(storiesData: MetaStoriesExportRoot | Array<{ uri?: string; creation_timestamp?: number; title?: string }>): IGMediaRecord[] {
  const items = Array.isArray(storiesData) ? storiesData : storiesData.ig_stories || [];
  const records: IGMediaRecord[] = [];

  for (let i = 0; i < items.length; i++) {
    const story = items[i];
    const rawUri = story.uri || (story as { media?: Array<{ uri: string }> }).media?.[0]?.uri;
    if (!rawUri) continue;
    const uri = sanitizeMetaUri(rawUri);
    if (!uri) continue;

    const rawCaption = story.title || (story as { media?: Array<{ title?: string }> }).media?.[0]?.title || '';
    const caption = fixMetaUtf8Encoding(rawCaption);
    const creationTimestamp = story.creation_timestamp || (story as { media?: Array<{ creation_timestamp?: number }> }).media?.[0]?.creation_timestamp || Math.floor(Date.now() / 1000);
    const tags = extractHashtags(caption);
    const mediaType = detectMediaType(uri, false);

    records.push({
      id: `story-${creationTimestamp}-${i}`,
      caption,
      media_type: mediaType,
      media_url: uri,
      media_product_type: 'STORY',
      permalink: 'https://www.instagram.com/',
      timestamp: new Date(creationTimestamp * 1000).toISOString(),
      timestampUnix: creationTimestamp,
      tags,
      selected: true,
    });
  }

  return records;
}

/**
 * Universally parses any official Meta Download Your Information archive content
 * (posts_1.json, posts.json, reels.json, stories.json, archived_posts.json).
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

  if (!parsed || typeof parsed !== 'object') {
    return [];
  }

  // Format C: reels.json ({ ig_reels_media: [ ... ] })
  if ('ig_reels_media' in (parsed as Record<string, unknown>)) {
    return parseReelsArchive(parsed as MetaReelsExportRoot);
  }

  // Format D: stories.json ({ ig_stories: [ ... ] })
  if ('ig_stories' in (parsed as Record<string, unknown>)) {
    return parseStoriesArchive(parsed as MetaStoriesExportRoot);
  }

  // Array schemas: posts_1.json or posts.json
  const rawList = Array.isArray(parsed)
    ? parsed
    : 'items' in (parsed as Record<string, unknown>) && Array.isArray((parsed as { items: unknown[] }).items)
    ? (parsed as { items: unknown[] }).items
    : [];

  if (rawList.length === 0) {
    return [];
  }

  // Format B: posts.json (elements have 'label_values')
  const firstItem = rawList[0] as Record<string, unknown>;
  if (firstItem && ('label_values' in firstItem || 'fbid' in firstItem)) {
    return parseLabeledValuesPostsArchive(rawList as MetaLabeledValuesItem[]);
  }

  // Format A: posts_1.json (elements have direct 'media' array or 'title')
  return parseSimplifiedPostsArchive(rawList as MetaSimplifiedPostItem[]);
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
