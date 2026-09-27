/**
 * Unicode-aware tag normalization, slugification, and hashtag extraction.
 *
 * Implements NIP-12 / NIP-23 compliant topic tags preserving international
 * and Turkish characters (ö, ş, ı, ğ, ü, ç, İ) while providing clean ASCII
 * fallback slugification for NIP-23 "d" tags and URLs.
 */

const TURKISH_TRANSLITERATION_MAP: Record<string, string> = {
  'ç': 'c',
  'Ç': 'c',
  'ğ': 'g',
  'Ğ': 'g',
  'ı': 'i',
  'I': 'i',
  'İ': 'i',
  'i': 'i',
  'ö': 'o',
  'Ö': 'o',
  'ş': 's',
  'Ş': 's',
  'ü': 'u',
  'Ü': 'u',
};

/**
 * Normalizes a category or tag into a clean NIP-12 / NIP-23 topic string.
 * Preserves Unicode letters and numbers across all languages (e.g. Turkish, Spanish, German, Cyrillic, CJK).
 *
 * Examples:
 * - "Köşe Yazıları" -> "köşe-yazıları"
 * - "Sağlık" -> "sağlık"
 * - "Donör" -> "donör"
 * - "Hücre" -> "hücre"
 * - "Leigh's Sendromu" -> "leigh-sendromu"
 * - "#nostr" -> "nostr"
 */
export function normalizeTopic(topic?: string | null): string {
  if (!topic || typeof topic !== 'string') return '';

  return topic
    .trim()
    // Strip leading hashtags or mentions
    .replace(/^[#@]+/g, '')
    // Handle Turkish uppercase dotted I to avoid combining character artifacts (\u0130 -> i)
    .replace(/\u0130/g, 'i')
    .replace(/İ/g, 'i')
    // Remove apostrophes and quotation marks to keep words together (e.g. Leigh's -> leigh-sendromu)
    .replace(/['"’`]/g, '')
    // Convert to lowercase
    .toLowerCase()
    // Replace any character that is NOT a Unicode letter, Unicode number, underscore, or hyphen with a hyphen
    .replace(/[^\p{L}\p{N}_-]+/gu, '-')
    // Collapse consecutive hyphens
    .replace(/-+/g, '-')
    // Trim leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Generates an ASCII-safe URL slug from any title string with full Turkish
 * and Latin diacritic transliteration. Used for NIP-23 "d" tag identifiers.
 *
 * Examples:
 * - "İki kadın, bir erkek ve bir bebek!" -> "iki-kadin-bir-erkek-ve-bir-bebek"
 * - "Köşe Yazıları & Sağlık" -> "kose-yazilari-saglik"
 */
export function slugify(text?: string | null): string {
  if (!text || typeof text !== 'string') return '';

  let sanitized = text.trim();

  // Transliterate Turkish characters explicitly first
  for (const [src, target] of Object.entries(TURKISH_TRANSLITERATION_MAP)) {
    sanitized = sanitized.replaceAll(src, target);
  }

  return sanitized
    // Normalize and decompose accents/diacritics (e.g. é -> e, ñ -> n)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remove apostrophes and quotes
    .replace(/['"’`]/g, '')
    // Convert to lowercase
    .toLowerCase()
    // Replace non-alphanumeric characters with hyphens
    .replace(/[^a-z0-9_-]+/g, '-')
    // Collapse consecutive hyphens
    .replace(/-+/g, '-')
    // Trim leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Extracts hashtags from unstructured caption or description text,
 * preserving Unicode letters and digits.
 *
 * Examples:
 * - "Harika bir gün! #sağlık #köşeyazıları #nostr" -> ["sağlık", "köşeyazıları", "nostr"]
 */
export function extractHashtags(text?: string | null): string[] {
  if (!text || typeof text !== 'string') return [];

  // Match # followed by Unicode letters, numbers, underscores, or hyphens
  const matches = text.match(/#([\p{L}\p{N}_-]+)/gu);
  if (!matches) return [];

  const uniqueTags = new Set<string>();
  for (const match of matches) {
    const clean = normalizeTopic(match);
    if (clean) {
      uniqueTags.add(clean);
    }
  }

  return Array.from(uniqueTags);
}
