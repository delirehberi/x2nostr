/**
 * HTML to Markdown Conversion Engine & Media Extractor for WordPress Posts.
 * Converts WordPress WXR HTML content into NIP-23 compliant Markdown.
 */

export function convertHtmlToMarkdown(html: string): string {
  if (!html) return '';

  // 1. Pre-process WordPress specific shortcodes
  const cleanHtml = cleanWordPressShortcodes(html);

  // 2. Browser DOMParser or fallback regex parser
  if (typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<body>${cleanHtml}</body>`, 'text/html');
      const markdown = walkDomNode(doc.body).trim();
      return postProcessMarkdown(markdown);
    } catch (err) {
      console.warn('DOMParser failed, falling back to regex HTML conversion:', err);
    }
  }

  // Fallback regex conversion for non-browser or error states
  return postProcessMarkdown(fallbackRegexHtmlToMarkdown(cleanHtml));
}

/**
 * Extracts all <img> src URLs found inside HTML content.
 */
export function extractImageUrlsFromHtml(html: string): string[] {
  if (!html) return [];
  const urls: string[] = [];

  if (typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<body>${html}</body>`, 'text/html');
      const imgs = doc.querySelectorAll('img');
      imgs.forEach((img) => {
        const src = img.getAttribute('src');
        if (src && src.trim() && !urls.includes(src.trim())) {
          urls.push(src.trim());
        }
      });
      return urls;
    } catch {
      // fallback to regex
    }
  }

  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = imgRegex.exec(html)) !== null) {
    if (match[1] && !urls.includes(match[1])) {
      urls.push(match[1]);
    }
  }

  return urls;
}

/**
 * Removes WordPress shortcodes (e.g. [caption ...]<img ... /> My Caption[/caption])
 * while preserving inner HTML nodes like <img> tags.
 */
function cleanWordPressShortcodes(html: string): string {
  let result = html.replace(/\[caption[^\]]*\]([\s\S]*?)\[\/caption\]/gi, (_match, inner) => {
    return `<div>${inner}</div>`;
  });

  result = result.replace(/\[[a-zA-Z0-9_-]+[^\]]*\]/g, '');
  return result;
}

function walkDomNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.nodeValue || '';
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const element = node as HTMLElement;
  const tagName = element.tagName.toLowerCase();
  const childrenText = Array.from(element.childNodes).map(walkDomNode).join('');

  switch (tagName) {
    case 'h1':
      return `\n\n# ${childrenText.trim()}\n\n`;
    case 'h2':
      return `\n\n## ${childrenText.trim()}\n\n`;
    case 'h3':
      return `\n\n### ${childrenText.trim()}\n\n`;
    case 'h4':
      return `\n\n#### ${childrenText.trim()}\n\n`;
    case 'h5':
      return `\n\n##### ${childrenText.trim()}\n\n`;
    case 'h6':
      return `\n\n###### ${childrenText.trim()}\n\n`;
    case 'p':
      return `\n\n${childrenText.trim()}\n\n`;
    case 'br':
      return '\n';
    case 'strong':
    case 'b':
      return `**${childrenText.trim()}**`;
    case 'em':
    case 'i':
      return `*${childrenText.trim()}*`;
    case 'code':
      if (element.parentElement?.tagName.toLowerCase() === 'pre') {
        return childrenText;
      }
      return `\`${childrenText.trim()}\``;
    case 'pre': {
      const codeChild = element.querySelector('code');
      const lang = codeChild?.getAttribute('class')?.replace('language-', '') || '';
      const codeText = codeChild ? codeChild.textContent || '' : childrenText;
      return `\n\n\`\`\`${lang}\n${codeText.trim()}\n\`\`\`\n\n`;
    }
    case 'blockquote':
      return `\n\n> ${childrenText.trim().replace(/\n/g, '\n> ')}\n\n`;
    case 'a': {
      const href = element.getAttribute('href');
      const title = childrenText.trim() || href || '';
      return href ? `[${title}](${href})` : childrenText;
    }
    case 'img': {
      const src = element.getAttribute('src') || '';
      const alt = element.getAttribute('alt') || '';
      return src ? `![${alt}](${src})` : '';
    }
    case 'ul':
      return `\n\n${childrenText}\n\n`;
    case 'ol':
      return `\n\n${childrenText}\n\n`;
    case 'li': {
      const parentTag = element.parentElement?.tagName.toLowerCase();
      if (parentTag === 'ol') {
        const index = Array.from(element.parentElement?.children || []).indexOf(element) + 1;
        return `${index}. ${childrenText.trim()}\n`;
      }
      return `- ${childrenText.trim()}\n`;
    }
    case 'hr':
      return '\n\n---\n\n';
    case 'div':
    case 'section':
    case 'article':
    case 'header':
    case 'footer':
      return `\n${childrenText}\n`;
    default:
      return childrenText;
  }
}

function fallbackRegexHtmlToMarkdown(html: string): string {
  let md = html;
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n\n#### $1\n\n');
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');
  md = md.replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]+src=["']([^"']+)["'][^>]*\/?>/gi, '![]($1)');
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '\n\n> $1\n\n');
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<hr\s*\/?>/gi, '\n\n---\n\n');
  md = md.replace(/<[^>]+>/g, '');
  return md;
}

function postProcessMarkdown(markdown: string): string {
  return markdown
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}
