import { SupportedPlatform } from './types';
import { unzipBuffer } from './zip';

/**
 * Auto-detects the blog export platform from filename, MIME type, and file buffer.
 */
export async function detectPlatform(
  buffer: Uint8Array | ArrayBuffer,
  fileName?: string,
  _mimeType?: string
): Promise<SupportedPlatform> {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const lowerName = (fileName || '').toLowerCase();

  // 1. If it's a ZIP archive
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    try {
      const entries = await unzipBuffer(bytes, { maxFiles: 200 });

      // Check XML files for WordPress
      const xmlEntry = entries.find((e) => e.name.toLowerCase().endsWith('.xml') || e.name.toLowerCase().endsWith('.wxr'));
      if (xmlEntry) {
        const textSample = xmlEntry.text().slice(0, 2000);
        if (textSample.includes('<wp:') || textSample.includes('wordpress.org') || textSample.includes('<rss')) {
          return 'wordpress';
        }
      }

      // Check JSON files for Ghost
      const jsonEntry = entries.find((e) => e.name.toLowerCase().endsWith('.json'));
      if (jsonEntry) {
        const textSample = jsonEntry.text().slice(0, 2000);
        if (textSample.includes('"posts"') || textSample.includes('"mobiledoc"') || textSample.includes('"lexical"') || textSample.includes('"ghost"')) {
          return 'ghost';
        }
      }

      // Check CSV for Substack
      const csvEntry = entries.find((e) => e.name.toLowerCase().endsWith('.csv'));
      if (csvEntry) {
        const textSample = csvEntry.text().slice(0, 1000);
        if (textSample.includes('post_id') || textSample.includes('body_html') || textSample.includes('subtitle') || textSample.includes('is_published')) {
          return 'substack';
        }
      }

      // Check LinkedIn HTML structure (Articles/*.html, linkedin.com/pulse markers, or created/published classes)
      const linkedInEntries = entries.filter((e) => {
        const lower = e.name.toLowerCase();
        return lower.includes('articles/') && (lower.endsWith('.html') || lower.endsWith('.htm'));
      });
      if (linkedInEntries.length > 0) {
        return 'linkedin';
      }

      // Check Medium HTML structure (posts/*.html or HTML with Medium markers)
      const htmlEntries = entries.filter((e) => e.name.toLowerCase().endsWith('.html'));
      if (htmlEntries.length > 0) {
        const sample = htmlEntries[0].text().slice(0, 2000);
        if (sample.includes('linkedin.com/pulse') || sample.includes('media.licdn.com') || (sample.includes('class="created"') && sample.includes('class="published"'))) {
          return 'linkedin';
        }
        if (sample.includes('graf--') || sample.includes('p-name') || sample.includes('e-content') || sample.includes('medium.com')) {
          return 'medium';
        }
        return 'medium';
      }

      // Check Hugo / Markdown files
      const mdEntries = entries.filter((e) => e.name.toLowerCase().endsWith('.md') || e.name.toLowerCase().endsWith('.markdown'));
      if (mdEntries.length > 0) {
        const sample = mdEntries[0].text().slice(0, 1000);
        if (sample.startsWith('---') || sample.startsWith('+++') || sample.includes('categories:') || sample.includes('tags:')) {
          return 'hugo';
        }
        return 'markdown';
      }
    } catch {
      // Fallback to name/text detection
    }
  }

  // 2. Extension-based & text-based inspection
  const textSample = new TextDecoder('utf-8', { fatal: false }).decode(bytes.subarray(0, Math.min(bytes.length, 4000)));

  if (lowerName.endsWith('.xml') || lowerName.endsWith('.wxr') || textSample.includes('<rss') || textSample.includes('<wp:')) {
    return 'wordpress';
  }

  if (lowerName.endsWith('.json') || (textSample.trim().startsWith('{') && (textSample.includes('"posts"') || textSample.includes('"db"')))) {
    return 'ghost';
  }

  if (lowerName.endsWith('.csv') || textSample.includes('post_id,') || textSample.includes('body_html')) {
    return 'substack';
  }

  if (textSample.includes('linkedin.com/pulse') || textSample.includes('media.licdn.com') || (textSample.includes('class="created"') && textSample.includes('class="published"'))) {
    return 'linkedin';
  }

  if (lowerName.endsWith('.html') || lowerName.endsWith('.htm') || textSample.includes('<html') || textSample.includes('<!DOCTYPE html')) {
    return 'medium';
  }

  if (lowerName.endsWith('.md') || lowerName.endsWith('.markdown')) {
    if (textSample.startsWith('---') || textSample.startsWith('+++')) {
      return 'hugo';
    }
    return 'markdown';
  }

  // Default fallback
  return 'markdown';
}
