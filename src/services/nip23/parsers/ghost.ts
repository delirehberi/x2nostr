import { ConvertedPostRecord } from '../types';
import { convertHtmlToMarkdown, extractImageUrlsFromHtml } from '../../html-to-markdown';
import { unzipBuffer } from '../zip';
import { slugify } from '../../tags';

interface GhostTag {
  id?: string;
  name: string;
  slug?: string;
}

interface GhostPostTagRelation {
  post_id: string;
  tag_id: string;
}

interface GhostPostRaw {
  id?: string;
  title?: string;
  slug?: string;
  html?: string;
  mobiledoc?: string;
  lexical?: string;
  markdown?: string;
  plaintext?: string;
  feature_image?: string;
  featured_image?: string;
  image?: string;
  status?: string;
  type?: string;
  published_at?: string | number | null;
  created_at?: string | number | null;
  custom_excerpt?: string;
  excerpt?: string;
  tags?: Array<GhostTag | string>;
  primary_author?: { name?: string };
}

interface GhostExportDb {
  data?: {
    posts?: GhostPostRaw[];
    tags?: GhostTag[];
    posts_tags?: GhostPostTagRelation[];
  };
}

interface GhostExportRoot {
  db?: GhostExportDb[];
  data?: {
    posts?: GhostPostRaw[];
    tags?: GhostTag[];
    posts_tags?: GhostPostTagRelation[];
  };
  posts?: GhostPostRaw[];
}

/**
 * Parses a Ghost JSON export (string, Uint8Array buffer, or ZIP archive) into ConvertedPostRecord[].
 */
export async function parseGhostExport(
  input: string | Uint8Array | ArrayBuffer
): Promise<ConvertedPostRecord[]> {
  if (typeof input === 'string') {
    return parseGhostJsonString(input);
  }

  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);

  // Check if buffer is a ZIP archive
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    const entries = await unzipBuffer(bytes);
    const jsonEntries = entries.filter((e) => e.name.toLowerCase().endsWith('.json'));

    if (jsonEntries.length === 0) {
      throw new Error('No Ghost JSON (.json) file found in the ZIP archive.');
    }

    const allPosts: ConvertedPostRecord[] = [];
    for (const jsonEntry of jsonEntries) {
      const jsonText = jsonEntry.text();
      try {
        const posts = parseGhostJsonString(jsonText);
        allPosts.push(...posts);
      } catch {
        // continue if secondary JSON file is not ghost export
      }
    }

    if (allPosts.length === 0) {
      throw new Error('No valid Ghost posts found in the JSON files inside ZIP archive.');
    }

    return allPosts;
  }

  const text = new TextDecoder('utf-8').decode(bytes);
  return parseGhostJsonString(text);
}

/**
 * Parses Ghost JSON string into ConvertedPostRecord[].
 */
export function parseGhostJsonString(jsonText: string): ConvertedPostRecord[] {
  let parsed: GhostExportRoot;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(`Failed to parse Ghost export JSON: ${err instanceof Error ? err.message : String(err)}`);
  }

  let postsRaw: GhostPostRaw[] = [];
  const tagMap = new Map<string, string>(); // tag_id -> tag_name
  const postTagRelations = new Map<string, string[]>(); // post_id -> [tag_name, ...]

  if (Array.isArray(parsed.db) && parsed.db.length > 0 && parsed.db[0].data) {
    const data = parsed.db[0].data;
    postsRaw = data.posts || [];
    if (Array.isArray(data.tags)) {
      data.tags.forEach((t) => {
        if (t.id && t.name) tagMap.set(t.id, t.name);
      });
    }
    if (Array.isArray(data.posts_tags)) {
      data.posts_tags.forEach((pt) => {
        const tagName = tagMap.get(pt.tag_id);
        if (tagName) {
          const list = postTagRelations.get(pt.post_id) || [];
          list.push(tagName);
          postTagRelations.set(pt.post_id, list);
        }
      });
    }
  } else if (parsed.data?.posts && Array.isArray(parsed.data.posts)) {
    postsRaw = parsed.data.posts;
  } else if (Array.isArray(parsed.posts)) {
    postsRaw = parsed.posts;
  } else if (Array.isArray(parsed)) {
    postsRaw = parsed as GhostPostRaw[];
  }

  if (postsRaw.length === 0) {
    throw new Error('No posts found in Ghost JSON export.');
  }

  const posts: ConvertedPostRecord[] = [];

  for (const post of postsRaw) {
    // Filter out page types or drafts if specified
    if (post.type && post.type !== 'post' && post.type !== 'page') {
      continue;
    }

    const title = post.title || 'Untitled Post';
    let slug = post.slug;
    if (!slug) {
      slug = slugify(title) || `ghost-${Date.now()}`;
    }

    // Resolve published date
    const rawDate = post.published_at || post.created_at || new Date().toISOString();
    const parsedDate = typeof rawDate === 'number' ? new Date(rawDate) : new Date(String(rawDate));
    const publishedAtTimestamp = isNaN(parsedDate.getTime())
      ? Math.floor(Date.now() / 1000)
      : Math.floor(parsedDate.getTime() / 1000);

    // Resolve content
    let contentMarkdown = '';
    let extractedImageUrls: string[] = [];

    if (post.html && post.html.trim()) {
      contentMarkdown = convertHtmlToMarkdown(post.html);
      extractedImageUrls = extractImageUrlsFromHtml(post.html);
    } else if (post.markdown && post.markdown.trim()) {
      contentMarkdown = post.markdown;
    } else if (post.mobiledoc) {
      contentMarkdown = extractMarkdownFromMobiledoc(post.mobiledoc);
    } else if (post.lexical) {
      contentMarkdown = extractMarkdownFromLexical(post.lexical);
    } else if (post.plaintext) {
      contentMarkdown = post.plaintext;
    }

    const featuredImageUrl = post.feature_image || post.featured_image || post.image;
    if (featuredImageUrl && !extractedImageUrls.includes(featuredImageUrl)) {
      extractedImageUrls.unshift(featuredImageUrl);
    }

    // Resolve tags
    const tagsList: string[] = [];
    if (post.id && postTagRelations.has(post.id)) {
      tagsList.push(...(postTagRelations.get(post.id) || []));
    }
    if (Array.isArray(post.tags)) {
      post.tags.forEach((t) => {
        const tagName = typeof t === 'string' ? t : t?.name;
        if (tagName && !tagsList.includes(tagName)) {
          tagsList.push(tagName);
        }
      });
    }

    const summary = post.custom_excerpt || post.excerpt || extractSummaryFromMarkdown(contentMarkdown);

    posts.push({
      title,
      slug,
      contentMarkdown,
      publishedAtTimestamp,
      summary,
      featuredImageUrl,
      imageUrls: extractedImageUrls,
      tags: tagsList,
      author: post.primary_author?.name,
    });
  }

  return posts;
}

/**
 * Extracts plain text/markdown from Ghost Mobiledoc JSON string.
 */
function extractMarkdownFromMobiledoc(mobiledocJson: string): string {
  try {
    const doc = JSON.parse(mobiledocJson);
    if (!doc.cards && !doc.sections) return '';

    const textPieces: string[] = [];

    // Extract cards (markdown or html cards)
    if (Array.isArray(doc.cards)) {
      doc.cards.forEach((card: [string, Record<string, unknown>]) => {
        if (card[0] === 'markdown' && typeof card[1]?.markdown === 'string') {
          textPieces.push(card[1].markdown);
        } else if (card[0] === 'html' && typeof card[1]?.html === 'string') {
          textPieces.push(convertHtmlToMarkdown(card[1].html));
        } else if (card[0] === 'image' && typeof card[1]?.src === 'string') {
          textPieces.push(`![](${card[1].src})`);
        }
      });
    }

    // Extract sections
    if (Array.isArray(doc.sections)) {
      doc.sections.forEach((section: [number, string, Array<[number, number[], number, string]>]) => {
        if (section[0] === 1 && Array.isArray(section[2])) {
          // Markup section
          const paraText = section[2].map((marker) => marker[3] || '').join('');
          if (paraText) textPieces.push(paraText);
        }
      });
    }

    return textPieces.join('\n\n');
  } catch {
    return mobiledocJson;
  }
}

/**
 * Extracts text/markdown from Ghost Lexical JSON string.
 */
function extractMarkdownFromLexical(lexicalJson: string): string {
  try {
    const doc = JSON.parse(lexicalJson);
    const root = doc.root;
    if (!root || !Array.isArray(root.children)) return '';

    const pieces: string[] = [];
    for (const node of root.children) {
      if (node.type === 'paragraph' && Array.isArray(node.children)) {
        const text = node.children.map((c: { text?: string }) => c.text || '').join('');
        if (text) pieces.push(text);
      } else if (node.type === 'heading' && Array.isArray(node.children)) {
        const text = node.children.map((c: { text?: string }) => c.text || '').join('');
        const tag = node.tag === 'h1' ? '#' : node.tag === 'h2' ? '##' : '###';
        if (text) pieces.push(`${tag} ${text}`);
      } else if (node.type === 'image' && node.src) {
        pieces.push(`![${node.altText || ''}](${node.src})`);
      }
    }

    return pieces.join('\n\n');
  } catch {
    return lexicalJson;
  }
}

function extractSummaryFromMarkdown(md: string): string {
  if (!md) return '';
  const clean = md.replace(/!\[.*?\]\(.*?\)/g, '').replace(/#+\s+/g, '').replace(/\n+/g, ' ').trim();
  if (clean.length <= 200) return clean;
  return `${clean.slice(0, 197)}...`;
}
