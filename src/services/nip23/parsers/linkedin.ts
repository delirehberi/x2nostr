import { ConvertedPostRecord } from '../types';
import { unzipBuffer } from '../zip';
import { parseLinkedInHtmlString, parseLinkedInCsvString } from '../../../importers/linkedin/parser';

/**
 * Parses LinkedIn export (single HTML string, binary buffer, or ZIP archive containing Articles/*.html).
 */
export async function parseLinkedInExport(
  input: string | Uint8Array | ArrayBuffer
): Promise<ConvertedPostRecord[]> {
  if (typeof input === 'string') {
    const record = parseLinkedInHtmlString(input, 'article.html');
    return [convertToConvertedPostRecord(record)];
  }

  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);

  // Check if buffer is a ZIP archive
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    const entries = await unzipBuffer(bytes);
    const htmlEntries = entries.filter((e) => {
      const lower = e.name.toLowerCase();
      return (
        (lower.endsWith('.html') || lower.endsWith('.htm')) &&
        !lower.startsWith('.') &&
        !lower.includes('__macosx') &&
        !lower.includes('messages') &&
        !lower.includes('profile') &&
        !lower.includes('connections')
      );
    });

    if (htmlEntries.length > 0) {
      const posts: ConvertedPostRecord[] = [];
      for (const entry of htmlEntries) {
        const text = entry.text();
        try {
          const record = parseLinkedInHtmlString(text, entry.name);
          posts.push(convertToConvertedPostRecord(record));
        } catch {
          // Skip non-article HTML files
        }
      }

      if (posts.length > 0) {
        return posts;
      }
    }

    // Check for CSV
    const csvEntry = entries.find((e) => {
      const lower = e.name.toLowerCase();
      return lower.endsWith('articles.csv') || lower.endsWith('shares.csv');
    });

    if (csvEntry) {
      const csvText = csvEntry.text();
      const records = parseLinkedInCsvString(csvText);
      return records.map(convertToConvertedPostRecord);
    }

    throw new Error('No LinkedIn article HTML files found in the ZIP archive.');
  }

  const text = new TextDecoder('utf-8').decode(bytes);
  const record = parseLinkedInHtmlString(text, 'article.html');
  return [convertToConvertedPostRecord(record)];
}

function convertToConvertedPostRecord(record: ReturnType<typeof parseLinkedInHtmlString>): ConvertedPostRecord {
  return {
    title: record.title,
    slug: record.slug,
    contentMarkdown: record.contentMarkdown,
    publishedAtTimestamp: record.publishedAtTimestamp,
    summary: record.summary,
    featuredImageUrl: record.coverImageUrl,
    imageUrls: record.imageUrls,
    tags: record.tags,
    author: record.author,
  };
}
