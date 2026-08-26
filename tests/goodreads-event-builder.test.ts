import { describe, it, expect } from 'vitest';
import {
  buildShelfListEvent,
  buildBookstrShelfListEvent,
  buildBookReviewEvent,
  buildDeletionEvent,
} from '../src/importers/goodreads/event-builder';
import { BookRecord } from '../src/types';

const mockBook: BookRecord = {
  id: 'gr_1001_0',
  bookId: '1001',
  title: 'The Hobbit',
  author: 'J.R.R. Tolkien',
  isbn: '0345339681',
  isbn13: '9780345339683',
  openLibraryWorkId: 'OL262758W',
  myRating: 5,
  dateRead: '2023-11-20',
  dateAdded: '2023-01-01',
  exclusiveShelf: 'read',
  myReview: 'Incredible journey across Middle-earth.',
  readCount: 1,
  ownedCopies: 1,
  selected: true,
  metadataResolved: true,
};

const mockPubkey = 'fa87f45a55dd1972a250a8ddde8092fa9ac50b236901dda72737523fb0ea9070';

describe('Goodreads Nostr Event Builder', () => {
  describe('buildShelfListEvent (NIP-51 Kind 30003)', () => {
    it('creates parameterized bookmark set with correct d tag and identifiers', () => {
      const event = buildShelfListEvent('read', [mockBook], mockPubkey);

      expect(event.kind).toBe(30003);
      expect(event.pubkey).toBe(mockPubkey);
      expect(event.content).toBe('');

      const dTag = event.tags.find((t) => t[0] === 'd');
      expect(dTag).toBeDefined();
      expect(dTag?.[1]).toBe('read');

      const titleTag = event.tags.find((t) => t[0] === 'title');
      expect(titleTag?.[1]).toBe('Books: Read');

      const clientTag = event.tags.find((t) => t[0] === 'client');
      expect(clientTag?.[1]).toBe('x2nostr.emre.xyz');

      // Identifier tag using OpenLibrary work
      const iTag = event.tags.find((t) => t[0] === 'i');
      expect(iTag).toBeDefined();
      expect(iTag?.[1]).toBe('openlibrary:OL262758W');
    });

    it('falls back to isbn when openLibraryWorkId is missing', () => {
      const bookWithoutOl = { ...mockBook, openLibraryWorkId: undefined };
      const event = buildShelfListEvent('to-read', [bookWithoutOl], mockPubkey);

      const dTag = event.tags.find((t) => t[0] === 'd');
      expect(dTag?.[1]).toBe('to-read');

      const iTag = event.tags.find((t) => t[0] === 'i');
      expect(iTag?.[1]).toBe('isbn:9780345339683');
    });
  });

  describe('buildBookstrShelfListEvent (Bookstr Kinds 10073, 10074, 10075)', () => {
    it('maps read shelf to kind 10073', () => {
      const event = buildBookstrShelfListEvent('read', [mockBook], mockPubkey);
      expect(event.kind).toBe(10073);
      expect(event.pubkey).toBe(mockPubkey);
      expect(event.tags.some((t) => t[0] === 'k' && t[1] === 'isbn')).toBe(true);
      expect(event.tags.some((t) => t[0] === 'i' && t[1] === 'isbn:9780345339683')).toBe(true);
    });

    it('maps currently-reading shelf to kind 10074', () => {
      const event = buildBookstrShelfListEvent('currently-reading', [mockBook], mockPubkey);
      expect(event.kind).toBe(10074);
    });

    it('maps to-read shelf to kind 10075', () => {
      const event = buildBookstrShelfListEvent('to-read', [mockBook], mockPubkey);
      expect(event.kind).toBe(10075);
    });
  });

  describe('buildBookReviewEvent (NIP-32 Kind 31985)', () => {
    it('constructs rating and review event with NIP-32 labels and normalized rating fraction', () => {
      const event = buildBookReviewEvent(mockBook, mockPubkey);

      expect(event.kind).toBe(31985);
      expect(event.pubkey).toBe(mockPubkey);
      expect(event.content).toBe('Incredible journey across Middle-earth.');

      const ratingTag = event.tags.find((t) => t[0] === 'rating');
      expect(ratingTag?.[1]).toBe('1'); // 5 / 5 = 1

      const ratingVal = event.tags.find((t) => t[0] === 'rating/value');
      expect(ratingVal?.[1]).toBe('5');

      const labelTag = event.tags.find((t) => t[0] === 'L');
      expect(labelTag?.[1]).toBe('review/book');

      const dTag = event.tags.find((t) => t[0] === 'd');
      expect(dTag?.[1]).toBe('isbn:9780345339683');
    });

    it('generates fallback review content if user review is empty', () => {
      const bookNoReview = { ...mockBook, myReview: '', myRating: 4 };
      const event = buildBookReviewEvent(bookNoReview, mockPubkey);

      expect(event.content).toContain('Rated 4/5 stars');
      expect(event.content).toContain('The Hobbit');
    });
  });

  describe('buildDeletionEvent (NIP-09 Kind 5)', () => {
    it('creates kind 5 deletion event with referenced event IDs and target kind', () => {
      const event = buildDeletionEvent(['evt_1', 'evt_2'], 'Clean old import', mockPubkey, 31985);

      expect(event.kind).toBe(5);
      expect(event.pubkey).toBe(mockPubkey);
      expect(event.content).toBe('Clean old import');
      expect(event.tags.filter((t) => t[0] === 'e')).toHaveLength(2);
      expect(event.tags.some((t) => t[0] === 'k' && t[1] === '31985')).toBe(true);
    });
  });
});
