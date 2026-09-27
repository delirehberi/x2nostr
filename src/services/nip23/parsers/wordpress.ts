import { ConvertedPostRecord } from '../types';
import { parseWordPressXmlString } from '../../../importers/wordpress/parser';
import { WordPressPostRecord } from '../../../types';
import { unzipBuffer } from '../zip';

/**
 * Parses a WordPress WXR XML export (string, binary buffer, or ZIP archive) into ConvertedPostRecord[].
 */
export async function parseWordPressExport(
  input: string | Uint8Array | ArrayBuffer
): Promise<ConvertedPostRecord[]> {
  if (typeof input === 'string') {
    return parseWxrStringToConvertedPosts(input);
  }

  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);

  // Check if buffer is a ZIP archive (starts with 'PK\x03\x04')
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    const entries = await unzipBuffer(bytes);
    const xmlEntries = entries.filter((e) => e.name.toLowerCase().endsWith('.xml') || e.name.toLowerCase().endsWith('.wxr'));

    if (xmlEntries.length === 0) {
      throw new Error('No WordPress XML (.xml or .wxr) file found in the ZIP archive.');
    }

    const allPosts: ConvertedPostRecord[] = [];
    for (const xmlEntry of xmlEntries) {
      const xmlText = xmlEntry.text();
      const posts = parseWxrStringToConvertedPosts(xmlText);
      allPosts.push(...posts);
    }
    return allPosts;
  }

  // Otherwise, treat buffer as UTF-8 XML string
  const text = new TextDecoder('utf-8').decode(bytes);
  return parseWxrStringToConvertedPosts(text);
}

/**
 * Converts WordPress WXR XML string into ConvertedPostRecord[].
 */
export function parseWxrStringToConvertedPosts(xmlText: string): ConvertedPostRecord[] {
  const wpRecords: WordPressPostRecord[] = parseWordPressXmlString(xmlText);

  return wpRecords.map((wp: WordPressPostRecord) => {
    return {
      title: wp.title || 'Untitled Post',
      slug: wp.slug || `post-${wp.wpPostId}`,
      contentMarkdown: wp.contentMarkdown,
      publishedAtTimestamp: wp.publishedAtTimestamp,
      summary: wp.summary,
      featuredImageUrl: wp.featuredImageUrl,
      imageUrls: wp.imageUrls || [],
      tags: wp.tags || [],
      categories: wp.categories || [],
      author: wp.author,
    };
  });
}
