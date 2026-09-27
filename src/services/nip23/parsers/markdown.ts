import { ConvertedPostRecord } from '../types';
import { unzipBuffer } from '../zip';
import { parseHugoMarkdownFile } from './hugo';

/**
 * Parses generic Markdown exports (single .md string, binary buffer, or ZIP archive of .md files).
 */
export async function parseGenericMarkdownExport(
  input: string | Uint8Array | ArrayBuffer
): Promise<ConvertedPostRecord[]> {
  if (typeof input === 'string') {
    return [parseHugoMarkdownFile(input, 'post.md')];
  }

  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);

  // Check if buffer is a ZIP archive
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    const entries = await unzipBuffer(bytes);
    const mdEntries = entries.filter((e) => {
      const lower = e.name.toLowerCase();
      return (lower.endsWith('.md') || lower.endsWith('.markdown') || lower.endsWith('.txt')) && !lower.startsWith('.');
    });

    if (mdEntries.length === 0) {
      throw new Error('No Markdown (.md or .markdown) files found in the ZIP archive.');
    }

    const posts: ConvertedPostRecord[] = [];
    for (const entry of mdEntries) {
      const text = entry.text();
      try {
        const post = parseHugoMarkdownFile(text, entry.name);
        posts.push(post);
      } catch {
        // Skip unparseable files
      }
    }

    if (posts.length === 0) {
      throw new Error('Could not parse any valid Markdown posts from the archive.');
    }

    return posts;
  }

  const text = new TextDecoder('utf-8').decode(bytes);
  return [parseHugoMarkdownFile(text, 'post.md')];
}
