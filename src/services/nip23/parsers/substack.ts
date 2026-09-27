import Papa from 'papaparse';
import { ConvertedPostRecord } from '../types';
import { convertHtmlToMarkdown, extractImageUrlsFromHtml } from '../../html-to-markdown';
import { unzipBuffer } from '../zip';
import { slugify } from '../../tags';

interface SubstackCsvRow {
  post_id?: string;
  id?: string;
  title?: string;
  subtitle?: string;
  post_date?: string;
  created_at?: string;
  is_published?: string | boolean;
  type?: string;
  body_html?: string;
  html?: string;
  description?: string;
  cover_image?: string;
  cover_image_url?: string;
  canonical_url?: string;
  slug?: string;
  audience?: string;
}

/**
 * Parses Substack export (CSV string, CSV binary buffer, or ZIP archive).
 */
export async function parseSubstackExport(
  input: string | Uint8Array | ArrayBuffer
): Promise<ConvertedPostRecord[]> {
  if (typeof input === 'string') {
    return parseSubstackCsvString(input);
  }

  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);

  // Check if buffer is a ZIP archive
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    const entries = await unzipBuffer(bytes);

    // Look for posts.csv
    const csvEntry = entries.find((e) => e.name.toLowerCase().endsWith('.csv'));
    const htmlEntries = entries.filter((e) => e.name.toLowerCase().endsWith('.html') && !e.name.startsWith('.'));

    // Build map of filename -> HTML text for external body files
    const htmlFilesMap = new Map<string, string>();
    for (const hEntry of htmlEntries) {
      const baseName = hEntry.name.replace(/\.html$/i, '').toLowerCase();
      htmlFilesMap.set(baseName, hEntry.text());
      const fullPathBase = hEntry.path.replace(/\.html$/i, '').toLowerCase();
      htmlFilesMap.set(fullPathBase, hEntry.text());
    }

    if (csvEntry) {
      const csvText = csvEntry.text();
      return parseSubstackCsvString(csvText, htmlFilesMap);
    }

    // If no CSV found, parse HTML entries directly
    if (htmlEntries.length > 0) {
      const posts: ConvertedPostRecord[] = [];
      for (const hEntry of htmlEntries) {
        const text = hEntry.text();
        const post = parseSubstackHtmlFallback(text, hEntry.name);
        posts.push(post);
      }
      return posts;
    }

    throw new Error('No Substack posts (posts.csv or HTML files) found in the ZIP archive.');
  }

  const text = new TextDecoder('utf-8').decode(bytes);
  return parseSubstackCsvString(text);
}

/**
 * Parses Substack CSV string and matches any external HTML files if available.
 */
export function parseSubstackCsvString(
  csvText: string,
  externalHtmlMap?: Map<string, string>
): ConvertedPostRecord[] {
  const result = Papa.parse<SubstackCsvRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/[\s-]+/g, '_'),
  });

  if (result.errors.length > 0 && result.data.length === 0) {
    throw new Error(`Failed to parse Substack CSV: ${result.errors[0]?.message || 'Invalid format'}`);
  }

  const posts: ConvertedPostRecord[] = [];

  for (const row of result.data) {
    // Check if post is published (if flag exists)
    const isPublished = row.is_published !== undefined 
      ? String(row.is_published).toLowerCase() === 'true' || String(row.is_published) === '1'
      : true;

    if (!isPublished) {
      continue;
    }

    const postId = row.post_id || row.id || `substack-${Date.now()}`;
    const title = (row.title || 'Untitled Post').trim();

    let slug = row.slug;
    if (!slug && row.canonical_url) {
      try {
        const urlObj = new URL(row.canonical_url);
        slug = urlObj.pathname.split('/').filter(Boolean).pop();
      } catch {
        // ignore
      }
    }
    if (!slug) {
      slug = slugify(title) || `post-${postId}`;
    }

    // Resolve date
    const rawDate = row.post_date || row.created_at || new Date().toISOString();
    const parsedDate = new Date(rawDate);
    const publishedAtTimestamp = isNaN(parsedDate.getTime())
      ? Math.floor(Date.now() / 1000)
      : Math.floor(parsedDate.getTime() / 1000);

    // Resolve HTML content: from CSV body_html, or external HTML file
    let bodyHtml = row.body_html || row.html || row.description || '';
    if (!bodyHtml && externalHtmlMap && externalHtmlMap.size > 0) {
      const match =
        externalHtmlMap.get(postId.toLowerCase()) ||
        externalHtmlMap.get(slug.toLowerCase()) ||
        externalHtmlMap.get(`posts/${postId.toLowerCase()}`) ||
        externalHtmlMap.get(`posts/${slug.toLowerCase()}`);
      if (match) {
        bodyHtml = match;
      }
    }

    const contentMarkdown = convertHtmlToMarkdown(bodyHtml);
    const imageUrls = extractImageUrlsFromHtml(bodyHtml);

    const coverImage = row.cover_image || row.cover_image_url;
    if (coverImage && !imageUrls.includes(coverImage)) {
      imageUrls.unshift(coverImage);
    }

    const summary = row.subtitle?.trim() || extractSummaryFromMarkdown(contentMarkdown);

    posts.push({
      title,
      slug,
      contentMarkdown,
      publishedAtTimestamp,
      summary,
      featuredImageUrl: coverImage,
      imageUrls,
      tags: [],
    });
  }

  if (posts.length === 0) {
    throw new Error('No valid published posts found in Substack CSV export.');
  }

  return posts;
}

function parseSubstackHtmlFallback(htmlText: string, fileName: string): ConvertedPostRecord {
  const cleanFileName = fileName.replace(/\.html$/i, '').split('/').pop() || 'post';

  const titleMatch =
    htmlText.match(/<h1[^>]*class=["'][^"']*post-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i) ||
    htmlText.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
    htmlText.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : cleanTitleFromFilename(cleanFileName);
  const slug = slugify(cleanFileName) || slugify(title) || `post-${Date.now()}`;

  const contentMarkdown = convertHtmlToMarkdown(htmlText);
  const imageUrls = extractImageUrlsFromHtml(htmlText);

  return {
    title,
    slug,
    contentMarkdown,
    publishedAtTimestamp: Math.floor(Date.now() / 1000),
    summary: extractSummaryFromMarkdown(contentMarkdown),
    featuredImageUrl: imageUrls[0],
    imageUrls,
    tags: [],
  };
}

function cleanTitleFromFilename(filename: string): string {
  return filename
    .replace(/^\d{4}-\d{2}-\d{2}[-_]/, '')
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function extractSummaryFromMarkdown(md: string): string {
  if (!md) return '';
  const clean = md.replace(/!\[.*?\]\(.*?\)/g, '').replace(/#+\s+/g, '').replace(/\n+/g, ' ').trim();
  if (clean.length <= 200) return clean;
  return `${clean.slice(0, 197)}...`;
}
