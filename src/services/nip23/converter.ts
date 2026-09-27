import { ConvertApiResponse, ConvertedPostRecord, SupportedPlatform, UnsignedNip23Event } from './types';
import { detectPlatform } from './detector';
import { buildUnsignedNip23Event } from './event-builder';
import { parseWordPressExport } from './parsers/wordpress';
import { parseGhostExport } from './parsers/ghost';
import { parseHugoExport } from './parsers/hugo';
import { parseMediumExport } from './parsers/medium';
import { parseSubstackExport } from './parsers/substack';
import { parseGenericMarkdownExport } from './parsers/markdown';

export interface ConvertOptions {
  fileName?: string;
  platform?: string | null;
  mimeType?: string;
}

const SUPPORTED_PLATFORMS: SupportedPlatform[] = [
  'wordpress',
  'ghost',
  'hugo',
  'medium',
  'substack',
  'markdown',
];

/**
 * Main conversion engine: converts any supported blog archive into an array of unsigned NIP-23 event templates.
 */
export async function convertBlogArchiveToNip23(
  buffer: Uint8Array | ArrayBuffer,
  options: ConvertOptions = {}
): Promise<ConvertApiResponse> {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

  // 1. Resolve Platform
  let platform: SupportedPlatform;
  const requestedPlatform = (options.platform || '').toLowerCase().trim();

  if (requestedPlatform && SUPPORTED_PLATFORMS.includes(requestedPlatform as SupportedPlatform)) {
    platform = requestedPlatform as SupportedPlatform;
  } else {
    platform = await detectPlatform(bytes, options.fileName, options.mimeType);
  }

  // 2. Dispatch to Platform Parser
  let postRecords: ConvertedPostRecord[] = [];

  switch (platform) {
    case 'wordpress':
      postRecords = await parseWordPressExport(bytes);
      break;
    case 'ghost':
      postRecords = await parseGhostExport(bytes);
      break;
    case 'hugo':
      postRecords = await parseHugoExport(bytes);
      break;
    case 'medium':
      postRecords = await parseMediumExport(bytes);
      break;
    case 'substack':
      postRecords = await parseSubstackExport(bytes);
      break;
    case 'markdown':
      postRecords = await parseGenericMarkdownExport(bytes);
      break;
    default:
      throw new Error(`Unsupported blog platform: ${platform}`);
  }

  if (!postRecords || postRecords.length === 0) {
    throw new Error(`No posts could be extracted from the uploaded ${platform} archive.`);
  }

  // 3. Build Unsigned NIP-23 Event Templates
  const events: UnsignedNip23Event[] = postRecords.map((post) => buildUnsignedNip23Event(post));

  return {
    success: true,
    platform,
    totalPosts: events.length,
    events,
  };
}
