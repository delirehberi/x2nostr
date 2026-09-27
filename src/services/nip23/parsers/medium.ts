import { ConvertedPostRecord } from '../types';
import { convertHtmlToMarkdown, extractImageUrlsFromHtml } from '../../html-to-markdown';
import { unzipBuffer } from '../zip';

/**
 * Parses Medium export (single HTML string, binary buffer, or ZIP archive containing posts/*.html).
 */
export async function parseMediumExport(
  input: string | Uint8Array | ArrayBuffer
): Promise<ConvertedPostRecord[]> {
  if (typeof input === 'string') {
    return [parseMediumHtmlString(input, 'post.html')];
  }

  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);

  // Check if buffer is a ZIP archive
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    const entries = await unzipBuffer(bytes);
    const htmlEntries = entries.filter((e) => {
      const lower = e.name.toLowerCase();
      return (
        lower.endsWith('.html') &&
        !lower.startsWith('.') &&
        !lower.includes('bookmarks') &&
        !lower.includes('profile') &&
        !lower.includes('claps') &&
        !lower.includes('highlights')
      );
    });

    if (htmlEntries.length === 0) {
      throw new Error('No Medium post HTML files found in the ZIP archive.');
    }

    const posts: ConvertedPostRecord[] = [];
    for (const entry of htmlEntries) {
      const text = entry.text();
      try {
        const post = parseMediumHtmlString(text, entry.name);
        posts.push(post);
      } catch {
        // Skip non-post HTML files
      }
    }

    if (posts.length === 0) {
      throw new Error('Could not parse any valid Medium posts from the archive.');
    }

    return posts;
  }

  const text = new TextDecoder('utf-8').decode(bytes);
  return [parseMediumHtmlString(text, 'post.html')];
}

/**
 * Parses a single Medium HTML file into ConvertedPostRecord.
 */
export function parseMediumHtmlString(htmlText: string, fileName = 'post.html'): ConvertedPostRecord {
  const cleanFileName = fileName.replace(/\.html$/i, '').split('/').pop() || 'post';

  // 1. Extract Title
  const titleMatch =
    htmlText.match(/<h1[^>]*class=["'][^"']*p-name[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i) ||
    htmlText.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
    htmlText.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

  const rawTitle = titleMatch ? stripHtmlTags(titleMatch[1]).trim() : '';
  const title = rawTitle || cleanTitleFromFilename(cleanFileName);

  // 2. Extract Slug
  let slug = cleanFileName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (!slug || slug === 'post' || slug === 'index') {
    slug = generateSlug(title);
  }

  // 3. Extract Published Date
  const timeMatch = htmlText.match(/<time[^>]*datetime=["']([^"']+)["'][^>]*>/i);
  let publishedAtTimestamp = Math.floor(Date.now() / 1000);
  if (timeMatch && timeMatch[1]) {
    const parsedDate = new Date(timeMatch[1]);
    if (!isNaN(parsedDate.getTime())) {
      publishedAtTimestamp = Math.floor(parsedDate.getTime() / 1000);
    }
  }

  // 4. Extract Subtitle / Summary
  const subtitleMatch = htmlText.match(/<section[^>]*data-field=["']subtitle["'][^>]*>([\s\S]*?)<\/section>/i);
  const summary = subtitleMatch ? stripHtmlTags(subtitleMatch[1]).trim() : undefined;

  // 5. Extract Tags
  const tags: string[] = [];
  const tagListMatch = htmlText.match(/<ul[^>]*class=["'][^"']*tags[^"']*["'][^>]*>([\s\S]*?)<\/ul>/i);
  if (tagListMatch && tagListMatch[1]) {
    const liRegex = /<li[^>]*>(?:<a[^>]*>)?([\s\S]*?)(?:<\/a>)?<\/li>/gi;
    let liMatch: RegExpExecArray | null;
    while ((liMatch = liRegex.exec(tagListMatch[1])) !== null) {
      const tagText = stripHtmlTags(liMatch[1]).trim();
      if (tagText && !tags.includes(tagText)) {
        tags.push(tagText);
      }
    }
  }

  // 6. Extract Author
  const authorMatch = htmlText.match(/<a[^>]*class=["'][^"']*p-author[^"']*["'][^>]*>([\s\S]*?)<\/a>/i);
  const author = authorMatch ? stripHtmlTags(authorMatch[1]).trim() : undefined;

  // 7. Extract Body Content HTML
  const bodyMatch =
    htmlText.match(/<section[^>]*data-field=["']body["'][^>]*>([\s\S]*?)<\/section>/i) ||
    htmlText.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
    htmlText.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

  const rawBodyHtml = bodyMatch ? bodyMatch[1] : htmlText;
  const contentMarkdown = convertHtmlToMarkdown(rawBodyHtml);
  const imageUrls = extractImageUrlsFromHtml(rawBodyHtml);

  const featuredImageUrl = imageUrls.length > 0 ? imageUrls[0] : undefined;

  return {
    title,
    slug,
    contentMarkdown,
    publishedAtTimestamp,
    summary: summary || extractSummaryFromMarkdown(contentMarkdown),
    featuredImageUrl,
    imageUrls,
    tags,
    author,
  };
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function cleanTitleFromFilename(filename: string): string {
  return filename
    .replace(/^\d{4}-\d{2}-\d{2}_/, '')
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `medium-${Date.now()}`;
}

function extractSummaryFromMarkdown(md: string): string {
  if (!md) return '';
  const clean = md.replace(/!\[.*?\]\(.*?\)/g, '').replace(/#+\s+/g, '').replace(/\n+/g, ' ').trim();
  if (clean.length <= 200) return clean;
  return `${clean.slice(0, 197)}...`;
}
