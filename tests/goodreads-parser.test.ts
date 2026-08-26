import { describe, it, expect } from 'vitest';
import {
  sanitizeFormulaString,
  sanitizeIsbn,
  parseShelf,
  parseGoodreadsCsv,
} from '../src/importers/goodreads/parser';

describe('Goodreads Parser Utilities', () => {
  describe('sanitizeFormulaString', () => {
    it('returns empty string for undefined or empty input', () => {
      expect(sanitizeFormulaString()).toBe('');
      expect(sanitizeFormulaString('')).toBe('');
      expect(sanitizeFormulaString('   ')).toBe('');
    });

    it('strips Excel formula wrappers like ="value" and =""value""', () => {
      expect(sanitizeFormulaString('="9780140449136"')).toBe('9780140449136');
      expect(sanitizeFormulaString('=""9780140449136""')).toBe('9780140449136');
      expect(sanitizeFormulaString('="War and Peace"')).toBe('War and Peace');
    });

    it('trims outer whitespace', () => {
      expect(sanitizeFormulaString('  The Hobbit  ')).toBe('The Hobbit');
    });
  });

  describe('sanitizeIsbn', () => {
    it('cleans ISBN with formula wrapper and extra formatting', () => {
      expect(sanitizeIsbn('="978-0-14-044913-6"')).toBe('9780140449136');
      expect(sanitizeIsbn('0-7432-7356-7')).toBe('0743273567');
      expect(sanitizeIsbn('014044913X')).toBe('014044913X');
    });

    it('handles empty or missing ISBN', () => {
      expect(sanitizeIsbn('')).toBe('');
      expect(sanitizeIsbn(undefined)).toBe('');
    });
  });

  describe('parseShelf', () => {
    it('maps standard Goodreads shelves to ShelfCategory', () => {
      expect(parseShelf('read')).toBe('read');
      expect(parseShelf('currently-reading')).toBe('currently-reading');
      expect(parseShelf('currently reading')).toBe('currently-reading');
      expect(parseShelf('reading')).toBe('currently-reading');
      expect(parseShelf('to-read')).toBe('to-read');
      expect(parseShelf('to read')).toBe('to-read');
      expect(parseShelf('want to read')).toBe('to-read');
    });

    it('falls back to "custom" for non-standard shelves', () => {
      expect(parseShelf('favorites')).toBe('custom');
      expect(parseShelf('sci-fi')).toBe('custom');
      expect(parseShelf('')).toBe('custom');
      expect(parseShelf(undefined)).toBe('custom');
    });
  });

  describe('parseGoodreadsCsv', () => {
    it('parses valid Goodreads CSV content into BookRecord objects', async () => {
      const csvContent = [
        'Book Id,Title,Author,Additional Authors,ISBN,ISBN13,My Rating,Average Rating,Publisher,Binding,Number of Pages,Year Published,Original Publication Year,Date Read,Date Added,Bookshelves,Bookshelves with positions,Exclusive Shelf,My Review,Spoiler,Private Notes,Read Count,Owned Copies',
        '1001,="1984",="George Orwell",,"=""0451524934""","=""9780451524935""",5,4.19,Signet Classics,Paperback,328,1950,1949,2023/05/10,2023/01/15,dystopian,dystopian (#1),read,Masterpiece of political fiction.,,,1,1',
        '1002,Dune,Frank Herbert,,0441172717,9780441172719,4,4.26,Ace,Paperback,896,1990,1965,,2023/02/01,sci-fi,sci-fi (#2),currently-reading,,,,1,0',
      ].join('\n');

      const books = await parseGoodreadsCsv(csvContent);

      expect(books).toHaveLength(2);

      const book1 = books[0];
      expect(book1.bookId).toBe('1001');
      expect(book1.title).toBe('1984');
      expect(book1.author).toBe('George Orwell');
      expect(book1.isbn).toBe('0451524934');
      expect(book1.isbn13).toBe('9780451524935');
      expect(book1.myRating).toBe(5);
      expect(book1.exclusiveShelf).toBe('read');
      expect(book1.myReview).toBe('Masterpiece of political fiction.');
      expect(book1.dateRead).toBe('2023-05-10');
      expect(book1.dateAdded).toBe('2023-01-15');

      const book2 = books[1];
      expect(book2.bookId).toBe('1002');
      expect(book2.title).toBe('Dune');
      expect(book2.author).toBe('Frank Herbert');
      expect(book2.exclusiveShelf).toBe('currently-reading');
      expect(book2.myRating).toBe(4);
    });

    it('returns empty array for empty CSV', async () => {
      const books = await parseGoodreadsCsv('');
      expect(books).toEqual([]);
    });
  });
});
