import Papa from 'papaparse';
import { MovieRecord, MovieTitleType } from '../../types';

interface RawMovieRow {
  [key: string]: string | undefined;
}

/**
 * Sanitizes Excel formula wrappers (e.g. `="tt123456"` or `=""tt123456""`) and leading/trailing quotes
 */
export function sanitizeFormulaString(val?: string): string {
  if (!val) return '';
  let cleaned = val.trim();
  if (cleaned.startsWith('=')) {
    cleaned = cleaned.replace(/^=\s*"+/, '').replace(/"+$/, '');
  }
  return cleaned.trim();
}

/**
 * Normalizes title types into standard union categories
 */
export function normalizeTitleType(rawType?: string): MovieTitleType {
  const t = (rawType || '').trim().toLowerCase();
  if (t === 'movie' || t === 'film') return 'Movie';
  if (t === 'tv series' || t === 'tvseries' || t === 'series') return 'TV Series';
  if (t === 'tv mini series' || t === 'tv miniseries' || t === 'mini series') return 'TV Mini Series';
  if (t === 'tv episode' || t === 'episode') return 'TV Episode';
  if (t === 'short' || t === 'short film') return 'Short';
  if (t === 'tv special' || t === 'special') return 'TV Special';
  if (t === 'video game') return 'Video Game';
  if (t === 'video') return 'Video';
  return 'Other';
}

/**
 * Parses comma-separated string lists into clean string arrays
 */
export function parseCommaSeparated(val?: string): string[] {
  const cleaned = sanitizeFormulaString(val);
  if (!cleaned) return [];
  return cleaned
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export async function parseMoviesCsv(file: File | string): Promise<MovieRecord[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawMovieRow>(file as any, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header: string) => header.trim(),
      complete: (results) => {
        try {
          if (!results.data || results.data.length === 0) {
            resolve([]);
            return;
          }

          const records: MovieRecord[] = [];

          results.data.forEach((row, idx) => {
            const rawConst = sanitizeFormulaString(row['Const'] || row['const'] || row['ID'] || row['id'] || '');
            const title = sanitizeFormulaString(row['Title'] || row['title'] || '');
            
            // Skip rows without at least a title or ID
            if (!title && !rawConst) return;

            const originalTitle = sanitizeFormulaString(row['Original Title'] || row['original_title'] || '') || undefined;
            const omdbId = rawConst.replace(/[^a-zA-Z0-9]/g, '') || `title_${idx + 1}`;
            const myRating = parseInt(row['Your Rating'] || row['your_rating'] || row['Rating'] || row['rating'] || '0', 10) || 0;
            const communityRating = parseFloat(row['IMDb Rating'] || row['imdb_rating'] || row['Rating'] || '0') || undefined;
            const runtimeMins = parseInt(row['Runtime (mins)'] || row['runtime'] || row['Runtime'] || '0', 10) || undefined;
            const year = parseInt(row['Year'] || row['year'] || '0', 10) || undefined;
            const numVotes = parseInt(row['Num Votes'] || row['num_votes'] || '0', 10) || undefined;
            const releaseDate = sanitizeFormulaString(row['Release Date'] || row['release_date'] || '');
            const dateRated = sanitizeFormulaString(row['Date Rated'] || row['date_rated'] || '');
            const rawUrl = sanitizeFormulaString(row['URL'] || row['url'] || '');
            const rawTitleType = sanitizeFormulaString(row['Title Type'] || row['title_type'] || row['Type'] || '');
            const genres = parseCommaSeparated(row['Genres'] || row['genres'] || row['Genre'] || '');
            const directors = parseCommaSeparated(row['Directors'] || row['directors'] || row['Director'] || '');

            const movieRecord: MovieRecord = {
              id: `movie_${omdbId}_${idx}`,
              omdbId,
              title: title || originalTitle || omdbId,
              originalTitle: originalTitle !== title ? originalTitle : undefined,
              myRating: Math.min(10, Math.max(0, myRating)),
              dateRated: dateRated ? dateRated.split(' ')[0].replace(/\//g, '-') : undefined,
              url: rawUrl || undefined,
              titleType: normalizeTitleType(rawTitleType),
              communityRating,
              runtimeMins: runtimeMins && runtimeMins > 0 ? runtimeMins : undefined,
              year: year && year > 1800 ? year : undefined,
              genres,
              numVotes: numVotes && numVotes > 0 ? numVotes : undefined,
              releaseDate: releaseDate ? releaseDate.split(' ')[0].replace(/\//g, '-') : undefined,
              directors,
              selected: true,
            };

            records.push(movieRecord);
          });

          resolve(records);
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
