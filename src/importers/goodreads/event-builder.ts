import { BookRecord, ShelfCategory, UnsignedNostrEvent } from '../../types';

/**
 * Normalizes OpenLibrary work ID to clean ID format without leading /works/ prefix
 */
function cleanOpenLibraryId(id?: string): string | undefined {
  if (!id) return undefined;
  return id.replace(/^\/?works\//, '').replace(/^\//, '');
}

/**
 * Builds NIP-51 Kind 30003 Parameterized Replaceable Bookmark Set Event for a specific shelf
 * (Conforms to NIP-51 standard for Coracle, Nostrudel, Amethyst, Primal)
 */
export function buildShelfListEvent(
  shelf: ShelfCategory,
  books: BookRecord[],
  pubkey: string
): UnsignedNostrEvent {
  const shelfNames: Record<ShelfCategory, { d: string; title: string; desc: string }> = {
    'read': {
      d: 'read',
      title: 'Books: Read',
      desc: 'List of completed books migrated via x2nostr',
    },
    'currently-reading': {
      d: 'currently-reading',
      title: 'Books: Currently Reading',
      desc: 'List of currently reading books migrated via x2nostr',
    },
    'to-read': {
      d: 'to-read',
      title: 'Books: Want to Read',
      desc: 'List of books to read migrated via x2nostr',
    },
    'custom': {
      d: 'books',
      title: 'Books Library',
      desc: 'Custom book collection migrated via x2nostr',
    },
  };

  const info = shelfNames[shelf] || shelfNames.custom;
  const tags: string[][] = [
    ['d', info.d],
    ['name', info.title],
    ['title', info.title],
    ['description', info.desc],
    ['t', 'books'],
    ['t', 'bookstr'],
    ['t', info.d],
    ['client', 'x2nostr.emre.xyz'],
    ['alt', `Book list: ${info.title}`],
  ];

  books.forEach((book) => {
    const cleanOlId = cleanOpenLibraryId(book.openLibraryWorkId);
    // Identifier tag 'i' following NIP-51 / NIP-73 conventions
    const identifier = cleanOlId 
      ? `openlibrary:${cleanOlId}`
      : book.isbn13 
        ? `isbn:${book.isbn13.replace(/[\s-]/g, '')}` 
        : book.isbn 
          ? `isbn:${book.isbn.replace(/[\s-]/g, '')}` 
          : `title:${encodeURIComponent(book.title)}:${encodeURIComponent(book.author)}`;

    // Add identifier tag with metadata hint
    tags.push(['i', identifier, 'book', book.title]);

    // ISBN metadata tags
    if (book.isbn13) {
      const cleanIsbn13 = book.isbn13.replace(/[\s-]/g, '');
      tags.push(['isbn13', cleanIsbn13]);
      tags.push(['isbn', cleanIsbn13]);
    } else if (book.isbn) {
      const cleanIsbn = book.isbn.replace(/[\s-]/g, '');
      tags.push(['isbn', cleanIsbn]);
    }
  });

  return {
    kind: 30003,
    created_at: Math.floor(Date.now() / 1000),
    tags,
    // Strictly empty string per NIP-51 when there are no encrypted private tags
    content: '',
    pubkey,
  };
}

/**
 * Builds Bookstr-native Replaceable Shelf List Event (Kinds 10073, 10074, 10075)
 * (Conforms to Bookstr.xyz reading tracker expectations)
 */
export function buildBookstrShelfListEvent(
  shelf: ShelfCategory,
  books: BookRecord[],
  pubkey: string
): UnsignedNostrEvent {
  const shelfKindMap: Record<ShelfCategory, number> = {
    'read': 10073,              // BOOK_READ (Finished)
    'currently-reading': 10074, // BOOK_READING (Currently Reading)
    'to-read': 10075,           // BOOK_TBR (Want to Read)
    'custom': 10075,            // Default custom shelves to TBR
  };

  const kind = shelfKindMap[shelf] || 10075;
  const tags: string[][] = [
    ['k', 'isbn'],
    ['client', 'x2nostr.emre.xyz'],
  ];

  books.forEach((book) => {
    const rawIsbn = book.isbn13 || book.isbn;
    if (rawIsbn) {
      const cleanIsbn = rawIsbn.replace(/[\s-]/g, '');
      tags.push(['i', `isbn:${cleanIsbn}`]);
      tags.push(['isbn', cleanIsbn]);
    }
  });

  return {
    kind,
    created_at: Math.floor(Date.now() / 1000),
    tags,
    content: '',
    pubkey,
  };
}

/**
 * Builds NIP-32 / Kind 31985 Parameterized Replaceable Rating and Review event for an individual book
 * (Compatible with Bookstr.xyz ratings map and NIP-32 label consumers)
 */
export function buildBookReviewEvent(
  book: BookRecord,
  pubkey: string
): UnsignedNostrEvent {
  const timestamp = book.dateRead 
    ? Math.floor(new Date(book.dateRead).getTime() / 1000) 
    : Math.floor(Date.now() / 1000);

  const cleanOlId = cleanOpenLibraryId(book.openLibraryWorkId);
  const cleanIsbn13 = book.isbn13 ? book.isbn13.replace(/[\s-]/g, '') : undefined;
  const cleanIsbn = book.isbn ? book.isbn.replace(/[\s-]/g, '') : undefined;
  const primaryIsbn = cleanIsbn13 || cleanIsbn;

  const identifier = primaryIsbn
    ? `isbn:${primaryIsbn}`
    : cleanOlId
      ? `openlibrary:${cleanOlId}`
      : `title:${encodeURIComponent(book.title)}`;

  // The d tag parameterizes the replaceable review (enabling updates without relay duplication)
  const dTag = primaryIsbn
    ? `isbn:${primaryIsbn}`
    : cleanOlId
      ? `openlibrary:${cleanOlId}`
      : `title:${encodeURIComponent(book.title)}`;

  const tags: string[][] = [
    ['d', dTag],
    ['k', 'isbn'],
    ['L', 'review/book'],
    ['l', 'review/book', 'ISO-639-1:en'],
    ['i', identifier, 'book'],
    ['title', book.title],
    ['author', book.author],
    ['client', 'x2nostr.emre.xyz'],
  ];

  if (book.myRating > 0) {
    // Bookstr uses fraction 0..1 scale (e.g. 5/5 = 1, 4/5 = 0.8)
    const ratingFraction = (book.myRating / 5).toString();
    tags.push(['rating', ratingFraction]);
    tags.push(['rating/value', String(book.myRating)]);
    tags.push(['rating/max', '5']);
  }

  if (cleanIsbn13) {
    tags.push(['isbn13', cleanIsbn13]);
    tags.push(['isbn', cleanIsbn13]);
  } else if (cleanIsbn) {
    tags.push(['isbn', cleanIsbn]);
  }

  if (book.dateRead) tags.push(['date_read', book.dateRead]);
  if (cleanOlId) tags.push(['openlibrary_work', cleanOlId]);

  let reviewBody = book.myReview ? book.myReview.trim() : '';
  if (!reviewBody) {
    if (book.myRating > 0) {
      reviewBody = `Rated ${book.myRating}/5 stars for "${book.title}" by ${book.author}. Migrated from Goodreads via x2nostr.`;
    } else {
      reviewBody = `Added to bookshelf: "${book.title}" by ${book.author}. Migrated from Goodreads via x2nostr.`;
    }
  }

  return {
    kind: 31985,
    created_at: isNaN(timestamp) ? Math.floor(Date.now() / 1000) : timestamp,
    tags,
    content: reviewBody,
    pubkey,
  };
}

/**
 * Builds NIP-09 Deletion Event (Kind 5) for a list of event IDs
 */
export function buildDeletionEvent(
  eventIds: string[],
  reason: string,
  pubkey: string,
  targetKind?: number
): UnsignedNostrEvent {
  const tags: string[][] = eventIds.map((id) => ['e', id]);
  if (targetKind !== undefined) {
    tags.push(['k', String(targetKind)]);
  }

  return {
    kind: 5,
    created_at: Math.floor(Date.now() / 1000),
    tags,
    content: reason,
    pubkey,
  };
}
