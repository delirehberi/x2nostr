/**
 * HTML to Markdown Conversion Engine & Media Extractor for WordPress Posts.
 * Converts WordPress WXR HTML content (including Gutenberg blocks, Elementor widgets,
 * WPBakery/Divi shortcodes, tables, and media embeds) into NIP-23 compliant Markdown.
 */

export function convertHtmlToMarkdown(html: string): string {
  if (!html || !html.trim()) return '';

  // 1. Pre-process WordPress specific shortcodes, Gutenberg block comments, and page builders
  const cleanHtml = preProcessWordPressHtml(html);

  // 2. Browser DOMParser or fallback regex parser
  if (typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<body>${cleanHtml}</body>`, 'text/html');

      // Strip non-content tags: script, style, noscript, svg
      doc.querySelectorAll('script, style, noscript, svg, link, meta').forEach((el) => el.remove());

      // Pre-process Elementor widgets before general tree walk
      preProcessElementorWidgets(doc.body);

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
 * Extracts all <img> src and <video> / iframe video URLs found inside HTML content.
 */
export function extractImageUrlsFromHtml(html: string): string[] {
  if (!html) return [];
  const urls: string[] = [];

  if (typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<body>${html}</body>`, 'text/html');
      
      // Images
      doc.querySelectorAll('img').forEach((img) => {
        const src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
        if (src && src.trim() && !urls.includes(src.trim()) && !src.startsWith('data:')) {
          urls.push(src.trim());
        }
      });

      return urls;
    } catch {
      // fallback to regex
    }
  }

  const imgRegex = /<img[^>]+(?:src|data-src|data-lazy-src)=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1]?.trim();
    if (src && !urls.includes(src) && !src.startsWith('data:')) {
      urls.push(src);
    }
  }

  return urls;
}

/**
 * Pre-processes WordPress HTML: handles shortcodes, Gutenberg block comments,
 * Elementor JSON comments, and WPBakery / Divi tags.
 */
function preProcessWordPressHtml(html: string): string {
  let result = html;

  // 1. Remove Gutenberg block comments: <!-- wp:heading {"level":2} -->, <!-- /wp:heading -->
  result = result.replace(/<!--\s*\/?wp:[a-zA-Z0-9_\-\/]+(?:\s+[\s\S]*?)?-->/gi, '');

  // 2. Remove Elementor comments: <!-- wp:elementor ... -->
  result = result.replace(/<!--\s*[\s\S]*?-->/gi, '');

  // 3. WordPress [caption ...]<img ... /> Caption[/caption]
  result = result.replace(/\[caption[^\]]*\]([\s\S]*?)\[\/caption\]/gi, (_match, inner) => {
    return `<div class="wp-caption-processed">${inner}</div>`;
  });

  // 4. WordPress [embed]...[/embed]
  result = result.replace(/\[embed[^\]]*\]([\s\S]*?)\[\/embed\]/gi, (_match, url) => {
    const cleanUrl = url.trim();
    return `<p><a href="${cleanUrl}">${cleanUrl}</a></p>`;
  });

  // 5. WPBakery shortcodes
  result = result.replace(/\[vc_custom_heading[^\]]*text=["']([^"']+)["'][^\]]*\]/gi, '<h3>$1</h3>');
  result = result.replace(/\[\/?vc_[a-zA-Z0-9_-]+[^\]]*\]/gi, '');

  // 6. Divi shortcodes
  result = result.replace(/\[et_pb_image[^\]]*src=["']([^"']+)["'][^\]]*\/\]/gi, '<img src="$1" />');
  result = result.replace(/\[\/?et_pb_[a-zA-Z0-9_-]+[^\]]*\]/gi, '');

  // 7. Generic leftover shortcodes like [gallery ids="..."] or [audio ...]
  result = result.replace(/\[[a-zA-Z0-9_-]+(?:\s+[^\]]*)?\]/gi, (match) => {
    // If it looks like markdown link syntax accidentally matched, preserve it
    if (match.startsWith('[') && match.includes('](')) return match;
    return '';
  });
  result = result.replace(/\[\/[a-zA-Z0-9_-]+\]/gi, '');

  return result;
}

/**
 * Normalizes Elementor DOM widgets into standard semantic HTML before DOM walking.
 */
function preProcessElementorWidgets(body: HTMLElement): void {
  // 1. Elementor Heading Widgets
  body.querySelectorAll('.elementor-widget-heading').forEach((headingWidget) => {
    const titleEl = headingWidget.querySelector('.elementor-heading-title');
    if (titleEl) {
      const tag = titleEl.tagName.toLowerCase();
      const level = tag.startsWith('h') ? tag : 'h3';
      const text = titleEl.textContent?.trim() || '';
      if (text) {
        const h = document.createElement(level);
        h.textContent = text;
        headingWidget.replaceWith(h);
      }
    }
  });

  // 2. Elementor Button Widgets
  body.querySelectorAll('.elementor-widget-button').forEach((btnWidget) => {
    const a = btnWidget.querySelector('a.elementor-button, a.elementor-button-link');
    if (a) {
      const href = a.getAttribute('href') || '';
      const text = a.textContent?.trim() || 'Click Here';
      const p = document.createElement('p');
      const newA = document.createElement('a');
      newA.setAttribute('href', href);
      newA.textContent = text;
      p.appendChild(newA);
      btnWidget.replaceWith(p);
    }
  });

  // 3. Elementor Dividers
  body.querySelectorAll('.elementor-widget-divider').forEach((divWidget) => {
    const hr = document.createElement('hr');
    divWidget.replaceWith(hr);
  });

  // 4. Elementor Blockquote & Testimonial
  body.querySelectorAll('.elementor-widget-blockquote, .elementor-widget-testimonial').forEach((quoteWidget) => {
    const contentEl = quoteWidget.querySelector('.elementor-blockquote__content, .elementor-testimonial-content, blockquote');
    const authorEl = quoteWidget.querySelector('.elementor-blockquote__author, .elementor-testimonial-name');
    const quoteText = contentEl ? contentEl.textContent?.trim() : quoteWidget.textContent?.trim();
    const authorText = authorEl?.textContent?.trim();

    if (quoteText) {
      const bq = document.createElement('blockquote');
      let combined = quoteText;
      if (authorText) combined += ` — ${authorText}`;
      bq.textContent = combined;
      quoteWidget.replaceWith(bq);
    }
  });

  // 5. Elementor Accordion & Toggle
  body.querySelectorAll('.elementor-widget-accordion, .elementor-widget-toggle').forEach((accWidget) => {
    const items = accWidget.querySelectorAll('.elementor-accordion-item, .elementor-toggle-item');
    const container = document.createElement('div');
    items.forEach((item) => {
      const title = item.querySelector('.elementor-tab-title')?.textContent?.trim();
      const content = item.querySelector('.elementor-tab-content')?.textContent?.trim();
      if (title) {
        const h4 = document.createElement('h4');
        h4.textContent = title;
        container.appendChild(h4);
      }
      if (content) {
        const p = document.createElement('p');
        p.textContent = content;
        container.appendChild(p);
      }
    });
    if (container.childNodes.length > 0) {
      accWidget.replaceWith(container);
    }
  });

  // 6. Elementor Alert Boxes
  body.querySelectorAll('.elementor-widget-alert').forEach((alertWidget) => {
    const title = alertWidget.querySelector('.elementor-alert-title')?.textContent?.trim();
    const desc = alertWidget.querySelector('.elementor-alert-description')?.textContent?.trim();
    if (title || desc) {
      const bq = document.createElement('blockquote');
      bq.textContent = [title ? `**${title}**` : '', desc || ''].filter(Boolean).join('\n\n');
      alertWidget.replaceWith(bq);
    }
  });

  // 7. Elementor Icon Box / Image Box
  body.querySelectorAll('.elementor-widget-icon-box, .elementor-widget-image-box').forEach((boxWidget) => {
    const title = boxWidget.querySelector('.elementor-icon-box-title, .elementor-image-box-title')?.textContent?.trim();
    const desc = boxWidget.querySelector('.elementor-icon-box-description, .elementor-image-box-description')?.textContent?.trim();
    const img = boxWidget.querySelector('img');
    const container = document.createElement('div');
    if (img && img.getAttribute('src')) {
      container.appendChild(img.cloneNode(true));
    }
    if (title) {
      const h4 = document.createElement('h4');
      h4.textContent = title;
      container.appendChild(h4);
    }
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc;
      container.appendChild(p);
    }
    if (container.childNodes.length > 0) {
      boxWidget.replaceWith(container);
    }
  });
}

/**
 * Recursively converts a DOM node to Markdown text.
 */
function walkDomNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.nodeValue || '';
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const element = node as HTMLElement;
  const tagName = element.tagName.toLowerCase();

  // If node is a table, handle table specially
  if (tagName === 'table') {
    return renderTableMarkdown(element);
  }

  // If node is an iframe (e.g. YouTube, Vimeo, Spotify), convert to link/embed
  if (tagName === 'iframe') {
    return renderIframeMarkdown(element);
  }

  // If node is a video tag
  if (tagName === 'video') {
    const src = element.getAttribute('src') || element.querySelector('source')?.getAttribute('src') || '';
    return src ? `\n\n[Watch Video](${src})\n\n` : '';
  }

  // If node is a figure
  if (tagName === 'figure') {
    const img = element.querySelector('img');
    const figcaption = element.querySelector('figcaption');
    if (img) {
      const src = img.getAttribute('src') || '';
      const alt = img.getAttribute('alt') || figcaption?.textContent?.trim() || '';
      const captionText = figcaption?.textContent?.trim();
      let md = src ? `\n\n![${alt}](${src})\n` : '';
      if (captionText) {
        md += `*${captionText}*\n\n`;
      } else {
        md += '\n';
      }
      return md;
    }
  }

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
      return childrenText.trim() ? `\n\n${childrenText.trim()}\n\n` : '';
    case 'br':
      return '\n';
    case 'strong':
    case 'b':
      return childrenText.trim() ? `**${childrenText.trim()}**` : '';
    case 'em':
    case 'i':
      return childrenText.trim() ? `*${childrenText.trim()}*` : '';
    case 'del':
    case 's':
    case 'strike':
      return childrenText.trim() ? `~~${childrenText.trim()}~~` : '';
    case 'code':
      if (element.parentElement?.tagName.toLowerCase() === 'pre') {
        return childrenText;
      }
      return childrenText.trim() ? `\`${childrenText.trim()}\`` : '';
    case 'pre': {
      const codeChild = element.querySelector('code');
      const langClass = (codeChild?.getAttribute('class') || element.getAttribute('class') || '')
        .split(' ')
        .find((c) => c.startsWith('language-') || c.startsWith('lang-'));
      const lang = langClass ? langClass.replace(/^language-|^lang-/, '') : '';
      const codeText = codeChild ? codeChild.textContent || '' : childrenText;
      return `\n\n\`\`\`${lang}\n${codeText.trim()}\n\`\`\`\n\n`;
    }
    case 'blockquote': {
      const trimmed = childrenText.trim();
      return trimmed ? `\n\n> ${trimmed.replace(/\n/g, '\n> ')}\n\n` : '';
    }
    case 'a': {
      const href = element.getAttribute('href');
      const title = childrenText.trim() || href || '';
      return href ? `[${title}](${href})` : childrenText;
    }
    case 'img': {
      const src = element.getAttribute('src') || element.getAttribute('data-src') || '';
      const alt = element.getAttribute('alt') || '';
      return src ? `![${alt}](${src})` : '';
    }
    case 'ul':
      return `\n\n${childrenText.trim()}\n\n`;
    case 'ol':
      return `\n\n${childrenText.trim()}\n\n`;
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
    case 'figcaption':
      return childrenText.trim() ? `\n*${childrenText.trim()}*\n` : '';
    case 'div':
    case 'section':
    case 'article':
    case 'main':
    case 'header':
    case 'footer':
      return childrenText ? `\n${childrenText}\n` : '';
    default:
      return childrenText;
  }
}

/**
 * Converts an HTML <table> element into a GitHub Flavored Markdown table.
 */
function renderTableMarkdown(tableEl: HTMLElement): string {
  const rows = Array.from(tableEl.querySelectorAll('tr'));
  if (rows.length === 0) return '';

  const tableData: string[][] = [];
  rows.forEach((row) => {
    const cells = Array.from(row.querySelectorAll('th, td')).map((cell) => {
      return cell.textContent?.trim().replace(/\|/g, '\\|').replace(/\n+/g, ' ') || '';
    });
    if (cells.length > 0) {
      tableData.push(cells);
    }
  });

  if (tableData.length === 0) return '';

  // Calculate max columns
  const maxCols = Math.max(...tableData.map((r) => r.length));
  if (maxCols === 0) return '';

  // Pad rows that have fewer columns
  const normalizedData = tableData.map((row) => {
    while (row.length < maxCols) {
      row.push('');
    }
    return row;
  });

  const headerRow = normalizedData[0];
  const separatorRow = new Array(maxCols).fill('---');
  const bodyRows = normalizedData.slice(1);

  let mdTable = `\n\n| ${headerRow.join(' | ')} |\n| ${separatorRow.join(' | ')} |\n`;
  bodyRows.forEach((row) => {
    mdTable += `| ${row.join(' | ')} |\n`;
  });
  mdTable += '\n';

  return mdTable;
}

/**
 * Converts an <iframe> embed (YouTube, Vimeo, etc.) into clean Markdown link/embed.
 */
function renderIframeMarkdown(iframeEl: HTMLElement): string {
  const src = iframeEl.getAttribute('src') || '';
  if (!src) return '';

  // YouTube Embed
  const ytMatch = src.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]+)/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    return `\n\n[![YouTube Video](${thumbUrl})](${watchUrl})\n\n`;
  }

  // Vimeo Embed
  const vimeoMatch = src.match(/player\.vimeo\.com\/video\/([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const vimeoUrl = `https://vimeo.com/${vimeoMatch[1]}`;
    return `\n\n[Watch Vimeo Video](${vimeoUrl})\n\n`;
  }

  // Generic Iframe Link
  return `\n\n[Embedded Content](${src})\n\n`;
}

/**
 * Fallback regex-based HTML-to-Markdown converter for Node/unit-test environments without DOM.
 */
function fallbackRegexHtmlToMarkdown(html: string): string {
  let md = html;

  // Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n\n#### $1\n\n');
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, '\n\n##### $1\n\n');
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, '\n\n###### $1\n\n');

  // Blockquotes (Processed before paragraph conversion to format quotes cleanly)
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_match, inner) => {
    const stripped = inner.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n').trim();
    return `\n\n> ${stripped.replace(/\n+/g, '\n> ')}\n\n`;
  });

  // Paragraphs and breaks
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');

  // Formatting
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');
  md = md.replace(/<del[^>]*>([\s\S]*?)<\/del>/gi, '~~$1~~');
  md = md.replace(/<s[^>]*>([\s\S]*?)<\/s>/gi, '~~$1~~');

  // Code & Pre
  md = md.replace(/<pre[^>]*><code[^>]*class=["'](?:language-|lang-)?([a-zA-Z0-9_-]*)["'][^>]*>([\s\S]*?)<\/code><\/pre>/gi, '\n\n```$1\n$2\n```\n\n');
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '\n\n```\n$1\n```\n\n');
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '\n\n```\n$1\n```\n\n');
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');

  // Links and Images
  md = md.replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*\/?>/gi, '![]($1)');

  // Lists and Dividers
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<hr\s*\/?>/gi, '\n\n---\n\n');

  // Clean remaining tags
  md = md.replace(/<[^>]+>/g, '');

  return md;
}

/**
 * Post-processes generated Markdown string for clean whitespace and consistent formatting.
 */
function postProcessMarkdown(markdown: string): string {
  return markdown
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}
