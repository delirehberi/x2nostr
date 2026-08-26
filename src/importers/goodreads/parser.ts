import Papa from 'papaparse';
import { BookRecord, ShelfCategory } from '../../types';

interface RawGoodreadsRow {
  [key: string]: string | undefined;
}

/**
 * Sanitizes Excel formula wrappers (e.g. `="9780140449136"` or `=""9780140449136""`)
 */
export function sanitizeFormulaString(val?: string): string {
  if (!val) return '';
  let cleaned = val.trim();
  // Strip leading =" or =""
  if (cleaned.startsWith('=')) {
    cleaned = cleaned.replace(/^=\s*"+/, '').replace(/"+$/, '');
  }
  // Strip non-alphanumeric except hyphens for standard text
  return cleaned.trim();
}

export function sanitizeIsbn(val?: string): string {
  const cleaned = sanitizeFormulaString(val);
  return cleaned.replace(/[^0-9X]/gi, '');
}

export function parseShelf(val?: string): ShelfCategory {
  const shelf = (val || '').toLowerCase().trim();
  if (shelf === 'read') return 'read';
  if (shelf === 'currently-reading' || shelf === 'currently reading' || shelf === 'reading') {
    return 'currently-reading';
  }
  if (shelf === 'to-read' || shelf === 'to read' || shelf === 'want to read') {
    return 'to-read';
  }
  return 'custom';
}

export async function parseGoodreadsCsv(file: File | string): Promise<BookRecord[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawGoodreadsRow>(file as any, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header: string) => header.trim(),
      complete: (results) => {
        try {
          if (!results.data || results.data.length === 0) {
            resolve([]);
            return;
          }

          const books: BookRecord[] = [];

          results.data.forEach((row, idx) => {
            const title = sanitizeFormulaString(row['Title'] || row['title'] || '');
            const author = sanitizeFormulaString(row['Author'] || row['author'] || '');
            
            // Skip rows without at least a title
            if (!title) return;

            const bookId = sanitizeFormulaString(row['Book Id'] || row['book_id'] || `book_${idx + 1}`);
            const isbn = sanitizeIsbn(row['ISBN'] || row['isbn']);
            const isbn13 = sanitizeIsbn(row['ISBN13'] || row['isbn13']);
            const myRating = parseInt(row['My Rating'] || row['my_rating'] || '0', 10) || 0;
            const avgRating = parseFloat(row['Average Rating'] || row['average_rating'] || '0') || undefined;
            const pageCount = parseInt(row['Number of Pages'] || row['page_count'] || '0', 10) || undefined;
            const yearPublished = parseInt(row['Year Published'] || '0', 10) || undefined;
            const origYear = parseInt(row['Original Publication Year'] || '0', 10) || undefined;
            const exclusiveShelf = parseShelf(row['Exclusive Shelf'] || row['exclusive_shelf']);
            const bookshelves = sanitizeFormulaString(row['Bookshelves'] || '');
            const dateRead = sanitizeFormulaString(row['Date Read'] || '');
            const dateAdded = sanitizeFormulaString(row['Date Added'] || new Date().toISOString().split('T')[0]);
            const myReview = sanitizeFormulaString(row['My Review'] || row['review'] || '');
            const spoiler = sanitizeFormulaString(row['Spoiler'] || '');
            const privateNotes = sanitizeFormulaString(row['Private Notes'] || '');
            const publisher = sanitizeFormulaString(row['Publisher'] || '');
            const binding = sanitizeFormulaString(row['Binding'] || '');

            const bookRecord: BookRecord = {
              id: `gr_${bookId}_${idx}`,
              bookId,
              title,
              author,
              additionalAuthors: sanitizeFormulaString(row['Additional Authors']),
              isbn,
              isbn13,
              myRating: Math.min(5, Math.max(0, myRating)),
              averageRating: avgRating,
              publisher,
              binding,
              pageCount,
              yearPublished,
              originalPublicationYear: origYear,
              dateRead: dateRead ? dateRead.split(' ')[0].replace(/\//g, '-') : undefined,
              dateAdded: dateAdded.split(' ')[0].replace(/\//g, '-'),
              bookshelves,
              exclusiveShelf,
              myReview,
              spoiler,
              privateNotes,
              readCount: parseInt(row['Read Count'] || '1', 10) || 1,
              ownedCopies: parseInt(row['Owned Copies'] || '0', 10) || 0,
              selected: true,
              metadataResolved: false,
            };

            books.push(bookRecord);
          });

          resolve(books);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => {
        reject(new Error(`CSV parse failure: ${err.message}`));
      },
    });
  });
}
