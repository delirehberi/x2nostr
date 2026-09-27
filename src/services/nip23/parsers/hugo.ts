import { ConvertedPostRecord } from '../types';
import { unzipBuffer } from '../zip';
import { slugify } from '../../tags';

interface FrontmatterData {
  title?: string;
  slug?: string;
  url?: string;
  link?: string;
  date?: string;
  publishDate?: string;
  published_at?: string;
  created_at?: string;
  summary?: string;
  description?: string;
  excerpt?: string;
  image?: string;
  cover?: string | { image?: string; src?: string; url?: string };
  featured_image?: string;
  featuredImage?: string;
  thumbnail?: string;
  tags?: string[];
  categories?: string[];
  author?: string;
  draft?: boolean;
}

/**
 * Parses Hugo exports (single markdown string, binary buffer, or ZIP archive of markdown files).
 */
export async function parseHugoExport(
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
      return (lower.endsWith('.md') || lower.endsWith('.markdown')) && !lower.startsWith('.');
    });

    if (mdEntries.length === 0) {
      throw new Error('No Markdown (.md) files found in the Hugo ZIP archive.');
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
      throw new Error('Could not parse any valid Hugo Markdown posts from the archive.');
    }

    return posts;
  }

  const text = new TextDecoder('utf-8').decode(bytes);
  return [parseHugoMarkdownFile(text, 'post.md')];
}

/**
 * Parses a single Hugo Markdown file content with frontmatter into ConvertedPostRecord.
 */
export function parseHugoMarkdownFile(rawContent: string, fileName = 'post.md'): ConvertedPostRecord {
  const { frontmatter, body } = extractFrontmatter(rawContent);

  const cleanFileName = fileName.replace(/\.(md|markdown)$/i, '').split('/').pop() || 'post';

  const title = frontmatter.title || extractH1Title(body) || cleanTitleFromFilename(cleanFileName);
  let slug = frontmatter.slug || frontmatter.url || frontmatter.link;
  if (!slug) {
    slug = slugify(cleanFileName) || slugify(title);
  } else {
    slug = slug.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9_-]+/g, '-');
  }

  // Resolve date
  const dateStr = frontmatter.date || frontmatter.publishDate || frontmatter.published_at || frontmatter.created_at;
  let publishedAtTimestamp = Math.floor(Date.now() / 1000);
  if (dateStr) {
    const parsedDate = new Date(dateStr);
    if (!isNaN(parsedDate.getTime())) {
      publishedAtTimestamp = Math.floor(parsedDate.getTime() / 1000);
    }
  }

  // Resolve cover / featured image
  let featuredImageUrl: string | undefined = undefined;
  if (typeof frontmatter.cover === 'string') {
    featuredImageUrl = frontmatter.cover;
  } else if (typeof frontmatter.cover === 'object' && frontmatter.cover) {
    featuredImageUrl = frontmatter.cover.image || frontmatter.cover.src || frontmatter.cover.url;
  }
  if (!featuredImageUrl) {
    featuredImageUrl = frontmatter.featured_image || frontmatter.featuredImage || frontmatter.image || frontmatter.thumbnail;
  }

  // Extract inline image URLs from markdown body
  const imageUrls: string[] = [];
  if (featuredImageUrl) {
    imageUrls.push(featuredImageUrl);
  }

  const imgRegex = /!\[.*?\]\((https?:\/\/[^\s\)]+)\)/gi;
  let match: RegExpExecArray | null;
  while ((match = imgRegex.exec(body)) !== null) {
    const url = match[1]?.trim();
    if (url && !imageUrls.includes(url)) {
      imageUrls.push(url);
    }
  }

  const summary = frontmatter.summary || frontmatter.description || frontmatter.excerpt || extractSummaryFromMarkdown(body);

  return {
    title,
    slug,
    contentMarkdown: body.trim(),
    publishedAtTimestamp,
    summary,
    featuredImageUrl,
    imageUrls,
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
    categories: Array.isArray(frontmatter.categories) ? frontmatter.categories : [],
    author: frontmatter.author,
  };
}

/**
 * Extracts frontmatter (YAML `---`, TOML `+++`, JSON `{...}`) and content body.
 */
function extractFrontmatter(content: string): { frontmatter: FrontmatterData; body: string } {
  const trimmed = content.trim();

  // YAML frontmatter `---`
  if (trimmed.startsWith('---')) {
    const endIdx = trimmed.indexOf('\n---', 3);
    if (endIdx !== -1) {
      const rawYaml = trimmed.slice(3, endIdx).trim();
      const body = trimmed.slice(endIdx + 4).trim();
      return { frontmatter: parseSimpleYaml(rawYaml), body };
    }
  }

  // TOML frontmatter `+++`
  if (trimmed.startsWith('+++')) {
    const endIdx = trimmed.indexOf('\n+++', 3);
    if (endIdx !== -1) {
      const rawToml = trimmed.slice(3, endIdx).trim();
      const body = trimmed.slice(endIdx + 4).trim();
      return { frontmatter: parseSimpleToml(rawToml), body };
    }
  }

  // JSON frontmatter `{ ... }`
  if (trimmed.startsWith('{')) {
    const endIdx = trimmed.indexOf('\n}\n');
    if (endIdx !== -1) {
      const rawJson = trimmed.slice(0, endIdx + 2).trim();
      const body = trimmed.slice(endIdx + 2).trim();
      try {
        const json = JSON.parse(rawJson);
        return { frontmatter: json, body };
      } catch {
        // Fallback to plain markdown
      }
    }
  }

  return { frontmatter: {}, body: trimmed };
}

/**
 * Lightweight, robust parser for common YAML frontmatter keys without heavy dependencies.
 */
function parseSimpleYaml(yamlStr: string): FrontmatterData {
  const result: Record<string, unknown> = {};
  const lines = yamlStr.split(/\r?\n/);

  let currentKey = '';
  let inArray = false;
  let arrayValues: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Array item e.g. "  - nostr"
    if (trimmed.startsWith('- ') && inArray) {
      const val = trimmed.slice(2).trim().replace(/^["']|["']$/g, '');
      arrayValues.push(val);
      continue;
    }

    // Key-value pair e.g. "title: Hello World" or "tags: [a, b]"
    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      if (inArray && currentKey) {
        result[currentKey] = arrayValues;
        inArray = false;
        arrayValues = [];
      }

      const key = line.slice(0, colonIdx).trim();
      let value = line.slice(colonIdx + 1).trim();

      if (value.startsWith('[') && value.endsWith(']')) {
        // Inline YAML array [a, b, c]
        const items = value
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
        result[key] = items;
      } else if (!value) {
        // Possible multi-line array
        currentKey = key;
        inArray = true;
        arrayValues = [];
      } else {
        // Scalar value
        value = value.replace(/^["']|["']$/g, '');
        if (value.toLowerCase() === 'true') result[key] = true;
        else if (value.toLowerCase() === 'false') result[key] = false;
        else result[key] = value;
      }
    }
  }

  if (inArray && currentKey) {
    result[currentKey] = arrayValues;
  }

  return result as FrontmatterData;
}

/**
 * Lightweight parser for common TOML frontmatter keys.
 */
function parseSimpleToml(tomlStr: string): FrontmatterData {
  const result: Record<string, unknown> = {};
  const lines = tomlStr.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();

      if (val.startsWith('[') && val.endsWith(']')) {
        const items = val
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
        result[key] = items;
      } else {
        val = val.replace(/^["']|["']$/g, '');
        if (val.toLowerCase() === 'true') result[key] = true;
        else if (val.toLowerCase() === 'false') result[key] = false;
        else result[key] = val;
      }
    }
  }

  return result as FrontmatterData;
}

function extractH1Title(md: string): string | undefined {
  const match = md.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : undefined;
}

function cleanTitleFromFilename(filename: string): string {
  return filename
    .replace(/^\d{4}-\d{2}-\d{2}-?/, '') // remove leading date if present
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
