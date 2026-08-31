import { WordPressPostRecord } from '../../types';
import { convertHtmlToMarkdown, extractImageUrlsFromHtml } from '../../services/html-to-markdown';

export async function parseWordPressXml(file: File): Promise<WordPressPostRecord[]> {
  const xmlText = await file.text();
  return parseWordPressXmlString(xmlText);
}

export function parseWordPressXmlString(xmlText: string): WordPressPostRecord[] {
  if (!xmlText || !xmlText.trim()) {
    throw new Error('WordPress WXR XML file is empty.');
  }

  // Use DOMParser if present, otherwise use fallback XML string parser for Node/Vitest
  if (typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      let doc = parser.parseFromString(xmlText, 'application/xml');
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        doc = parser.parseFromString(xmlText, 'text/html');
      }
      const items = doc.querySelectorAll('item');
      if (items.length > 0) {
        return parseWithDomParser(items);
      }
    } catch {
      // Fallback to regex parser
    }
  }

  return parseWithRegexFallback(xmlText);
}

function parseWithDomParser(items: NodeListOf<Element>): WordPressPostRecord[] {
  // 1. Build Attachment Map (wp:post_id -> attachment_url)
  const attachmentMap = new Map<string, string>();
  items.forEach((item) => {
    const postType = getElementTextByLocalName(item, 'post_type');
    if (postType === 'attachment') {
      const postId = getElementTextByLocalName(item, 'post_id');
      const attachmentUrl = getElementTextByLocalName(item, 'attachment_url') || getElementTextByLocalName(item, 'guid');
      if (postId && attachmentUrl) {
        attachmentMap.set(postId, attachmentUrl);
      }
    }
  });

  // 2. Parse Post Items
  const posts: WordPressPostRecord[] = [];
  let index = 0;

  items.forEach((item) => {
    const postType = getElementTextByLocalName(item, 'post_type') || 'post';
    const status = getElementTextByLocalName(item, 'status') || 'publish';

    if (postType !== 'post' && postType !== 'page') {
      return;
    }

    const wpPostId = getElementTextByLocalName(item, 'post_id') || `wp-${Date.now()}-${index}`;
    const title = getElementTextByLocalName(item, 'title') || 'Untitled Post';
    let slug = getElementTextByLocalName(item, 'post_name');
    if (!slug) {
      slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `post-${wpPostId}`;
    }

    const contentHtml = getElementTextByLocalName(item, 'encoded') || getElementTextByLocalName(item, 'content') || '';
    const summary = getElementTextByLocalName(item, 'excerpt') || extractSummaryFallback(contentHtml);
    const author = getElementTextByLocalName(item, 'creator') || getElementTextByLocalName(item, 'author') || 'Anonymous';
    
    const postDateGmt = getElementTextByLocalName(item, 'post_date_gmt');
    const postDate = getElementTextByLocalName(item, 'post_date');
    const pubDateStr = getElementTextByLocalName(item, 'pubDate');

    const rawDate = postDateGmt && postDateGmt !== '0000-00-00 00:00:00' 
      ? postDateGmt 
      : (postDate || pubDateStr || new Date().toISOString());

    const parsedDate = new Date(rawDate);
    const publishedAtTimestamp = isNaN(parsedDate.getTime()) 
      ? Math.floor(Date.now() / 1000) 
      : Math.floor(parsedDate.getTime() / 1000);

    const categories: string[] = [];
    const tags: string[] = [];

    const categoryElements = item.querySelectorAll('category');
    categoryElements.forEach((catEl) => {
      const domain = catEl.getAttribute('domain');
      const catText = catEl.textContent?.trim();
      if (!catText) return;

      if (domain === 'category') {
        if (!categories.includes(catText)) categories.push(catText);
      } else if (domain === 'post_tag') {
        if (!tags.includes(catText)) tags.push(catText);
      }
    });

    let featuredImageUrl: string | undefined = undefined;
    const postmetaElements = item.querySelectorAll('postmeta');
    postmetaElements.forEach((metaEl) => {
      const metaKey = getElementTextByLocalName(metaEl, 'meta_key');
      if (metaKey === '_thumbnail_id') {
        const thumbnailId = getElementTextByLocalName(metaEl, 'meta_value');
        if (thumbnailId && attachmentMap.has(thumbnailId)) {
          featuredImageUrl = attachmentMap.get(thumbnailId);
        }
      }
    });

    const imageUrls = extractImageUrlsFromHtml(contentHtml);
    if (!featuredImageUrl && imageUrls.length > 0) {
      featuredImageUrl = imageUrls[0];
    }

    const contentMarkdown = convertHtmlToMarkdown(contentHtml);

    posts.push({
      id: `wp_${wpPostId}`,
      wpPostId,
      title,
      slug,
      contentHtml,
      contentMarkdown,
      summary,
      author,
      publishedDate: parsedDate.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      publishedAtTimestamp,
      postType,
      status,
      categories,
      tags,
      featuredImageUrl,
      imageUrls,
      selected: status === 'publish',
    });

    index++;
  });

  return posts;
}

function parseWithRegexFallback(xmlText: string): WordPressPostRecord[] {
  const itemMatches = xmlText.match(/<item[\s\S]*?<\/item>/gi) || [];
  if (itemMatches.length === 0) {
    throw new Error('No <item> elements found in WordPress WXR export file.');
  }

  // 1. Build attachment map
  const attachmentMap = new Map<string, string>();
  itemMatches.forEach((itemXml) => {
    const postType = getRegexXmlTagValue(itemXml, 'post_type');
    if (postType === 'attachment') {
      const postId = getRegexXmlTagValue(itemXml, 'post_id');
      const attachmentUrl = getRegexXmlTagValue(itemXml, 'attachment_url') || getRegexXmlTagValue(itemXml, 'guid');
      if (postId && attachmentUrl) {
        attachmentMap.set(postId, attachmentUrl);
      }
    }
  });

  // 2. Build posts
  const posts: WordPressPostRecord[] = [];
  let index = 0;

  itemMatches.forEach((itemXml) => {
    const postType = getRegexXmlTagValue(itemXml, 'post_type') || 'post';
    const status = getRegexXmlTagValue(itemXml, 'status') || 'publish';

    if (postType !== 'post' && postType !== 'page') {
      return;
    }

    const wpPostId = getRegexXmlTagValue(itemXml, 'post_id') || `wp-${Date.now()}-${index}`;
    const title = getRegexXmlTagValue(itemXml, 'title') || 'Untitled Post';
    let slug = getRegexXmlTagValue(itemXml, 'post_name');
    if (!slug) {
      slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `post-${wpPostId}`;
    }

    const contentHtml = getRegexXmlTagValue(itemXml, 'encoded') || getRegexXmlTagValue(itemXml, 'content') || '';
    const summary = getRegexXmlTagValue(itemXml, 'excerpt') || extractSummaryFallback(contentHtml);
    const author = getRegexXmlTagValue(itemXml, 'creator') || getRegexXmlTagValue(itemXml, 'author') || 'Anonymous';

    const postDateGmt = getRegexXmlTagValue(itemXml, 'post_date_gmt');
    const postDate = getRegexXmlTagValue(itemXml, 'post_date');
    const pubDateStr = getRegexXmlTagValue(itemXml, 'pubDate');

    const rawDate = postDateGmt && postDateGmt !== '0000-00-00 00:00:00'
      ? postDateGmt
      : (postDate || pubDateStr || new Date().toISOString());

    const parsedDate = new Date(rawDate);
    const publishedAtTimestamp = isNaN(parsedDate.getTime())
      ? Math.floor(Date.now() / 1000)
      : Math.floor(parsedDate.getTime() / 1000);

    const categories: string[] = [];
    const tags: string[] = [];

    const categoryRegex = /<category[^>]*domain=["']([^"']+)["'][^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([^<]+))<\/category>/gi;
    let catMatch: RegExpExecArray | null;
    while ((catMatch = categoryRegex.exec(itemXml)) !== null) {
      const domain = catMatch[1];
      const catText = (catMatch[2] || catMatch[3] || '').trim();
      if (!catText) continue;

      if (domain === 'category') {
        if (!categories.includes(catText)) categories.push(catText);
      } else if (domain === 'post_tag') {
        if (!tags.includes(catText)) tags.push(catText);
      }
    }

    let featuredImageUrl: string | undefined = undefined;
    const metaRegex = /<wp:postmeta[\s\S]*?<\/wp:postmeta>/gi;
    let metaMatch: RegExpExecArray | null;
    while ((metaMatch = metaRegex.exec(itemXml)) !== null) {
      const metaBlock = metaMatch[0];
      const key = getRegexXmlTagValue(metaBlock, 'meta_key');
      if (key === '_thumbnail_id') {
        const thumbId = getRegexXmlTagValue(metaBlock, 'meta_value');
        if (thumbId && attachmentMap.has(thumbId)) {
          featuredImageUrl = attachmentMap.get(thumbId);
        }
      }
    }

    const imageUrls = extractImageUrlsFromHtml(contentHtml);
    if (!featuredImageUrl && imageUrls.length > 0) {
      featuredImageUrl = imageUrls[0];
    }

    const contentMarkdown = convertHtmlToMarkdown(contentHtml);

    posts.push({
      id: `wp_${wpPostId}`,
      wpPostId,
      title,
      slug,
      contentHtml,
      contentMarkdown,
      summary,
      author,
      publishedDate: parsedDate.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      publishedAtTimestamp,
      postType,
      status,
      categories,
      tags,
      featuredImageUrl,
      imageUrls,
      selected: status === 'publish',
    });

    index++;
  });

  return posts;
}

function getElementTextByLocalName(parent: Element, localName: string): string {
  const children = Array.from(parent.children);
  for (const child of children) {
    const nodeLocalName = child.localName || child.tagName.split(':').pop() || '';
    if (nodeLocalName.toLowerCase() === localName.toLowerCase()) {
      return child.textContent?.trim() || '';
    }
  }
  return '';
}

function getRegexXmlTagValue(xmlBlock: string, tagLocalName: string): string {
  const regex = new RegExp(`<(?:[a-zA-Z0-9_-]+:)?${tagLocalName}[^>]*>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\\/(?:[a-zA-Z0-9_-]+:)?${tagLocalName}>`, 'i');
  const match = xmlBlock.match(regex);
  if (match) {
    return (match[1] !== undefined ? match[1] : match[2] || '').trim();
  }
  return '';
}

function extractSummaryFallback(html: string): string {
  if (!html) return '';
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= 200) return text;
  return `${text.slice(0, 197)}...`;
}
