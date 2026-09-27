import { LinkedInArticleRecord } from '../../types';
import { convertHtmlToMarkdown, extractImageUrlsFromHtml } from '../../services/html-to-markdown';
import { unzipBuffer } from '../../services/nip23/zip';
import Papa from 'papaparse';

/**
 * Extracts hashtags (#tag) from text.
 */
export function extractHashtagsFromText(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/#[a-zA-Z0-9_\u0080-\uFFFF]+/g);
  if (!matches) return [];

  const uniqueTags = new Set<string>();
  for (const match of matches) {
    const clean = match.replace(/^#/, '').toLowerCase().trim();
    if (clean) {
      uniqueTags.add(clean);
    }
  }

  return Array.from(uniqueTags);
}

/**
 * Parses LinkedIn Export file (ZIP archive, HTML file, or CSV).
 */
export async function parseLinkedInExport(file: File): Promise<LinkedInArticleRecord[]> {
  const fileNameLower = file.name.toLowerCase();

  if (fileNameLower.endsWith('.zip')) {
    const arrayBuffer = await file.arrayBuffer();
    return parseLinkedInZipBuffer(new Uint8Array(arrayBuffer));
  }

  if (fileNameLower.endsWith('.html') || fileNameLower.endsWith('.htm')) {
    const htmlText = await file.text();
    const record = parseLinkedInHtmlString(htmlText, file.name);
    return [record];
  }

  if (fileNameLower.endsWith('.csv')) {
    const csvText = await file.text();
    return parseLinkedInCsvString(csvText);
  }

  throw new Error(`Unsupported file type for LinkedIn import: ${file.name}. Expected .zip, .html, or .csv`);
}

/**
 * Parses binary ZIP archive buffer from LinkedIn data export.
 */
export async function parseLinkedInZipBuffer(bytes: Uint8Array): Promise<LinkedInArticleRecord[]> {
  const entries = await unzipBuffer(bytes);

  // 1. Look for HTML article files inside Articles/ or Articles/Articles/ or root
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
    const records: LinkedInArticleRecord[] = [];
    for (const entry of htmlEntries) {
      const text = entry.text();
      try {
        const record = parseLinkedInHtmlString(text, entry.name);
        records.push(record);
      } catch (err) {
        console.warn(`Could not parse LinkedIn article file ${entry.name}:`, err);
      }
    }

    if (records.length > 0) {
      return records;
    }
  }

  // 2. Check for Articles.csv or Shares.csv in zip
  const csvEntry = entries.find((e) => {
    const lower = e.name.toLowerCase();
    return lower.endsWith('articles.csv') || lower.endsWith('shares.csv');
  });

  if (csvEntry) {
    const csvText = csvEntry.text();
    return parseLinkedInCsvString(csvText);
  }

  throw new Error('No valid LinkedIn article HTML files or Articles.csv found in the ZIP archive.');
}

/**
 * Parses a single LinkedIn exported Article HTML file into a LinkedInArticleRecord.
 */
export function parseLinkedInHtmlString(htmlText: string, fileName = 'article.html'): LinkedInArticleRecord {
  if (!htmlText || !htmlText.trim()) {
    throw new Error('LinkedIn article HTML content is empty.');
  }

  const cleanFileName = fileName.replace(/\.html?$/i, '').split('/').pop() || 'article';

  let title = '';
  let canonicalUrl = '';
  let createdDate = '';
  let publishedDate = '';
  let publishedAtTimestamp = Math.floor(Date.now() / 1000);
  let coverImageUrl = '';
  let bodyHtml = '';
  let author = 'LinkedIn Author';

  if (typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      // 1. Extract Title & Canonical URL
      const h1 = doc.querySelector('h1');
      if (h1) {
        const link = h1.querySelector('a');
        if (link) {
          title = link.textContent?.trim() || '';
          canonicalUrl = link.getAttribute('href')?.trim() || '';
        } else {
          title = h1.textContent?.trim() || '';
        }
      }

      if (!title) {
        const titleTag = doc.querySelector('title');
        if (titleTag) {
          title = titleTag.textContent?.trim() || '';
        }
      }

      // 2. Extract Cover Image (leading image before h1 or top image in body)
      const topImg = doc.querySelector('body > img, .article-cover-image img, header img');
      if (topImg) {
        const src = topImg.getAttribute('src')?.trim();
        if (src && !src.startsWith('data:')) {
          coverImageUrl = src;
        }
      }

      // 3. Extract Published & Created Dates
      const publishedP = doc.querySelector('.published, time.published, p.published');
      if (publishedP) {
        const pText = publishedP.textContent?.trim() || '';
        const match = pText.match(/Published on\s+([0-9]{4}-[0-9]{2}-[0-9]{2}(?:\s+[0-9]{2}:[0-9]{2})?)/i) ||
                      pText.match(/([0-9]{4}-[0-9]{2}-[0-9]{2}(?:[T\s][0-9]{2}:[0-9]{2}(?::[0-9]{2})?)?)/);
        if (match && match[1]) {
          publishedDate = match[1].trim();
          const parsed = new Date(publishedDate);
          if (!isNaN(parsed.getTime())) {
            publishedAtTimestamp = Math.floor(parsed.getTime() / 1000);
          }
        }
      }

      const createdP = doc.querySelector('.created, time.created, p.created');
      if (createdP) {
        const cText = createdP.textContent?.trim() || '';
        const match = cText.match(/Created on\s+([0-9]{4}-[0-9]{2}-[0-9]{2}(?:\s+[0-9]{2}:[0-9]{2})?)/i);
        if (match && match[1]) {
          createdDate = match[1].trim();
        }
      }

      // 4. Extract Body HTML
      // In LinkedIn export, content is in a <div> following the .published element
      let contentContainer: Element | null = null;
      if (publishedP && publishedP.nextElementSibling) {
        let sibling = publishedP.nextElementSibling;
        while (sibling && sibling.tagName.toLowerCase() !== 'div' && sibling.tagName.toLowerCase() !== 'article') {
          sibling = sibling.nextElementSibling as Element;
        }
        if (sibling) {
          contentContainer = sibling;
        }
      }

      if (!contentContainer) {
        contentContainer = doc.querySelector('article, .article-body, body > div');
      }

      if (contentContainer) {
        // Clone and strip header/created/published elements if present
        const clone = contentContainer.cloneNode(true) as HTMLElement;
        clone.querySelectorAll('style, script, .created, .published, h1').forEach((el) => el.remove());
        bodyHtml = clone.innerHTML;
      } else {
        // Fallback: extract everything inside body except h1, created, published, top img
        const bodyClone = doc.body.cloneNode(true) as HTMLElement;
        bodyClone.querySelectorAll('style, script, .created, .published, h1, body > img:first-child').forEach((el) => el.remove());
        bodyHtml = bodyClone.innerHTML;
      }
    } catch {
      // Fallback regex parser below
    }
  }

  // Regex fallback parser for non-DOM or error states
  if (!bodyHtml) {
    const parsedRegex = parseWithRegex(htmlText);
    if (!title) title = parsedRegex.title;
    if (!canonicalUrl) canonicalUrl = parsedRegex.canonicalUrl;
    if (!createdDate) createdDate = parsedRegex.createdDate;
    if (!publishedDate) publishedDate = parsedRegex.publishedDate;
    if (!publishedAtTimestamp || isNaN(publishedAtTimestamp)) publishedAtTimestamp = parsedRegex.publishedAtTimestamp;
    if (!coverImageUrl) coverImageUrl = parsedRegex.coverImageUrl;
    bodyHtml = parsedRegex.bodyHtml;
  }

  if (!title) {
    title = cleanTitleFromFilename(cleanFileName);
  }

  // Generate clean slug
  let slug = '';
  if (canonicalUrl) {
    try {
      const urlObj = new URL(canonicalUrl);
      const parts = urlObj.pathname.split('/').filter(Boolean);
      slug = parts.pop() || '';
    } catch {
      const match = canonicalUrl.match(/\/pulse\/([^/?#]+)/i);
      if (match && match[1]) slug = match[1];
    }
  }

  if (!slug) {
    slug = cleanFileName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  if (!slug || slug === 'article' || slug === 'index') {
    slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `linkedin-${Date.now()}`;
  }

  // Convert Body HTML to clean NIP-23 Markdown
  const contentMarkdown = convertHtmlToMarkdown(bodyHtml);
  const imageUrls = extractImageUrlsFromHtml(bodyHtml);

  // If cover image wasn't found in top img, check first inline image
  if (!coverImageUrl && imageUrls.length > 0) {
    coverImageUrl = imageUrls[0];
  }

  // Extract Summary
  const summary = extractSummaryFromMarkdown(contentMarkdown);

  // Extract Hashtags from Markdown
  const tags = extractHashtagsFromText(contentMarkdown);

  const articleId = `li-${slug}`;

  return {
    id: articleId,
    articleId,
    title,
    slug,
    canonicalUrl: canonicalUrl || undefined,
    contentHtml: bodyHtml,
    contentMarkdown,
    summary,
    author,
    createdDate: createdDate || undefined,
    publishedDate: publishedDate || new Date(publishedAtTimestamp * 1000).toISOString().slice(0, 10),
    publishedAtTimestamp,
    coverImageUrl: coverImageUrl || undefined,
    imageUrls,
    tags,
    selected: true,
  };
}

/**
 * Fallback regex parser for LinkedIn article HTML.
 */
function parseWithRegex(htmlText: string): {
  title: string;
  canonicalUrl: string;
  createdDate: string;
  publishedDate: string;
  publishedAtTimestamp: number;
  coverImageUrl: string;
  bodyHtml: string;
} {
  // Title & URL
  const h1Match = htmlText.match(/<h1>\s*<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>\s*<\/h1>/i) ||
                  htmlText.match(/<h1>([\s\S]*?)<\/h1>/i) ||
                  htmlText.match(/<title>([\s\S]*?)<\/title>/i);

  let title = '';
  let canonicalUrl = '';

  if (h1Match) {
    if (h1Match.length >= 3) {
      canonicalUrl = h1Match[1]?.trim() || '';
      title = stripTags(h1Match[2]).trim();
    } else {
      title = stripTags(h1Match[1]).trim();
    }
  }

  // Cover Image
  const imgMatch = htmlText.match(/<body[^>]*>\s*<img[^>]+src=["']([^"']+)["']/i) ||
                  htmlText.match(/<img[^>]+src=["']([^"']+)["']/i);
  const coverImageUrl = imgMatch ? imgMatch[1].trim() : '';

  // Created Date
  const createdMatch = htmlText.match(/<p[^>]*class=["'][^"']*created[^"']*["'][^>]*>Created on\s+([0-9]{4}-[0-9]{2}-[0-9]{2}(?:\s+[0-9]{2}:[0-9]{2})?)/i);
  let createdDate = '';
  if (createdMatch && createdMatch[1]) {
    createdDate = createdMatch[1].trim();
  }

  // Published Date
  const pubMatch = htmlText.match(/<p[^>]*class=["'][^"']*published[^"']*["'][^>]*>Published on\s+([0-9]{4}-[0-9]{2}-[0-9]{2}(?:\s+[0-9]{2}:[0-9]{2})?)/i);
  let publishedDate = '';
  let publishedAtTimestamp = Math.floor(Date.now() / 1000);

  if (pubMatch && pubMatch[1]) {
    publishedDate = pubMatch[1].trim();
    const parsed = new Date(publishedDate);
    if (!isNaN(parsed.getTime())) {
      publishedAtTimestamp = Math.floor(parsed.getTime() / 1000);
    }
  }

  // Body div
  const divMatch = htmlText.match(/<p[^>]*class=["'][^"']*published[^"']*["'][^>]*>[\s\S]*?<\/p>\s*<div>([\s\S]*?)<\/div>\s*<\/body>/i) ||
                  htmlText.match(/<div>([\s\S]*?)<\/div>\s*<\/body>/i);

  const bodyHtml = divMatch ? divMatch[1] : htmlText;

  return {
    title,
    canonicalUrl,
    createdDate,
    publishedDate,
    publishedAtTimestamp,
    coverImageUrl,
    bodyHtml,
  };
}

/**
 * Parses LinkedIn Articles.csv / Shares.csv into LinkedInArticleRecord[].
 */
export function parseLinkedInCsvString(csvText: string): LinkedInArticleRecord[] {
  if (!csvText || !csvText.trim()) {
    throw new Error('LinkedIn CSV file is empty.');
  }

  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0 && result.data.length === 0) {
    throw new Error(`Failed to parse CSV: ${result.errors[0]?.message}`);
  }

  const records: LinkedInArticleRecord[] = [];

  for (let i = 0; i < result.data.length; i++) {
    const row = result.data[i];
    const title = row['Title'] || row['Article Title'] || row['Headline'] || row['ShareCommentary'] || '';
    const url = row['URL'] || row['Article URL'] || row['Link'] || row['ShareLink'] || '';
    const rawDate = row['Published Date'] || row['Created Date'] || row['Date'] || '';
    const content = row['Content'] || row['Article Text'] || row['Body'] || row['Text'] || '';

    // Only include long-form articles (title present and length > 100 chars, or explicit article URL)
    if (!title && !content) continue;

    const parsedDate = rawDate ? new Date(rawDate) : new Date();
    const publishedAtTimestamp = isNaN(parsedDate.getTime())
      ? Math.floor(Date.now() / 1000)
      : Math.floor(parsedDate.getTime() / 1000);

    const slug = url.split('/').filter(Boolean).pop() || `article-${i + 1}`;
    const contentMarkdown = content.startsWith('<') ? convertHtmlToMarkdown(content) : content;
    const summary = extractSummaryFromMarkdown(contentMarkdown);
    const tags = extractHashtagsFromText(contentMarkdown);

    records.push({
      id: `li-csv-${i + 1}`,
      articleId: `li-csv-${i + 1}`,
      title: title || `Article ${i + 1}`,
      slug,
      canonicalUrl: url || undefined,
      contentHtml: content,
      contentMarkdown,
      summary,
      author: row['Author'] || 'LinkedIn Author',
      publishedDate: rawDate || new Date(publishedAtTimestamp * 1000).toISOString().slice(0, 10),
      publishedAtTimestamp,
      imageUrls: [],
      tags,
      selected: true,
    });
  }

  if (records.length === 0) {
    throw new Error('No valid article records found in LinkedIn CSV.');
  }

  return records;
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function cleanTitleFromFilename(filename: string): string {
  return filename
    .replace(/^\d{4}-\d{2}-\d{2}_/, '')
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
