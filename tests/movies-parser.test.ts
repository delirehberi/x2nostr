import { describe, it, expect } from 'vitest';
import {
  sanitizeFormulaString,
  normalizeTitleType,
  parseCommaSeparated,
  parseMoviesCsv,
} from '../src/importers/movies/parser';

describe('Movies CSV Parser Utilities', () => {
  describe('sanitizeFormulaString', () => {
    it('strips formula formatting and whitespace', () => {
      expect(sanitizeFormulaString('="tt0111161"')).toBe('tt0111161');
      expect(sanitizeFormulaString('  Inception  ')).toBe('Inception');
      expect(sanitizeFormulaString('')).toBe('');
      expect(sanitizeFormulaString(undefined)).toBe('');
    });
  });

  describe('normalizeTitleType', () => {
    it('normalizes known title types', () => {
      expect(normalizeTitleType('movie')).toBe('Movie');
      expect(normalizeTitleType('film')).toBe('Movie');
      expect(normalizeTitleType('tv series')).toBe('TV Series');
      expect(normalizeTitleType('tv miniseries')).toBe('TV Mini Series');
      expect(normalizeTitleType('short')).toBe('Short');
      expect(normalizeTitleType('unknown type')).toBe('Other');
    });
  });

  describe('parseCommaSeparated', () => {
    it('splits comma separated lists and trims elements', () => {
      expect(parseCommaSeparated('Drama, Crime, Sci-Fi')).toEqual(['Drama', 'Crime', 'Sci-Fi']);
      expect(parseCommaSeparated('Christopher Nolan, Jonathan Nolan')).toEqual([
        'Christopher Nolan',
        'Jonathan Nolan',
      ]);
      expect(parseCommaSeparated('')).toEqual([]);
      expect(parseCommaSeparated(undefined)).toEqual([]);
    });
  });

  describe('parseMoviesCsv', () => {
    it('parses IMDb ratings CSV export correctly', async () => {
      const csvData = [
        'Const,Your Rating,Date Rated,Title,URL,Title Type,IMDb Rating,Runtime (mins),Year,Genres,Num Votes,Release Date,Directors',
        '="tt0111161",10,2022-04-15,The Shawshank Redemption,https://www.imdb.com/title/tt0111161/,Movie,9.3,142,1994,"Drama",2800000,1994-10-14,Frank Darabont',
        'tt0468569,9,2023-01-10,The Dark Knight,https://www.imdb.com/title/tt0468569/,Movie,9.0,152,2008,"Action, Crime, Drama",2900000,2008-07-18,Christopher Nolan',
      ].join('\n');

      const records = await parseMoviesCsv(csvData);

      expect(records).toHaveLength(2);

      const m1 = records[0];
      expect(m1.omdbId).toBe('tt0111161');
      expect(m1.title).toBe('The Shawshank Redemption');
      expect(m1.myRating).toBe(10);
      expect(m1.communityRating).toBe(9.3);
      expect(m1.runtimeMins).toBe(142);
      expect(m1.year).toBe(1994);
      expect(m1.directors).toEqual(['Frank Darabont']);
      expect(m1.genres).toEqual(['Drama']);

      const m2 = records[1];
      expect(m2.omdbId).toBe('tt0468569');
      expect(m2.title).toBe('The Dark Knight');
      expect(m2.myRating).toBe(9);
      expect(m2.genres).toEqual(['Action', 'Crime', 'Drama']);
    });
  });
});
