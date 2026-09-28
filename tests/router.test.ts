import { describe, it, expect } from 'vitest';
import { normalizeImporterSlug, IMPORTER_SLUG_ALIASES } from '../src/services/router';

describe('Router Service & Subpage Slug Resolution', () => {
  it('should correctly normalize known importer aliases', () => {
    expect(normalizeImporterSlug('imdb')).toBe('movies');
    expect(normalizeImporterSlug('blogs')).toBe('wordpress');
    expect(normalizeImporterSlug('blog')).toBe('wordpress');
    expect(normalizeImporterSlug('gist')).toBe('gists');
    expect(normalizeImporterSlug('snippets')).toBe('gists');
    expect(normalizeImporterSlug('github')).toBe('gists');
    expect(normalizeImporterSlug('insta')).toBe('instagram');
    expect(normalizeImporterSlug('photos')).toBe('instagram');
    expect(normalizeImporterSlug('pulse')).toBe('linkedin');
    expect(normalizeImporterSlug('article')).toBe('linkedin');
    expect(normalizeImporterSlug('articles')).toBe('linkedin');
    expect(normalizeImporterSlug('books')).toBe('goodreads');
  });

  it('should preserve standard primary slugs', () => {
    expect(normalizeImporterSlug('goodreads')).toBe('goodreads');
    expect(normalizeImporterSlug('movies')).toBe('movies');
    expect(normalizeImporterSlug('wordpress')).toBe('wordpress');
    expect(normalizeImporterSlug('gists')).toBe('gists');
    expect(normalizeImporterSlug('instagram')).toBe('instagram');
    expect(normalizeImporterSlug('linkedin')).toBe('linkedin');
    expect(normalizeImporterSlug('spotify')).toBe('spotify');
  });

  it('should handle whitespace and uppercase gracefully', () => {
    expect(normalizeImporterSlug('  IMDB ')).toBe('movies');
    expect(normalizeImporterSlug('  WordPress  ')).toBe('wordpress');
  });
});
