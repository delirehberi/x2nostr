import { MovieRecord, UnsignedNostrEvent } from '../../types';

/**
 * Builds NIP-51 Kind 30003 Parameterized Replaceable Curated Set Event for Movies & Shows
 * (Conforms to NIP-51 standard for Coracle, Nostrudel, Amethyst, Primal)
 */
export function buildMovieListEvent(
  listIdentifier = 'movies:rated',
  movies: MovieRecord[],
  pubkey: string
): UnsignedNostrEvent {
  const title = 'Movies & TV: Rated Library';
  const description = 'Curated collection of rated movies and television shows migrated via x2nostr';

  const tags: string[][] = [
    ['d', listIdentifier],
    ['name', 'Rated Movies & TV Shows'],
    ['title', title],
    ['description', description],
    ['t', 'movies'],
    ['t', 'cinema'],
    ['t', 'tv'],
    ['client', 'x2nostr.emre.xyz'],
    ['alt', `Curated media list: ${title}`],
  ];

  movies.forEach((movie) => {
    const identifier = movie.omdbId
      ? `omdb:${movie.omdbId}`
      : `title:${encodeURIComponent(movie.title)}`;

    // Add identifier tag with metadata hint following NIP-51 conventions
    tags.push(['i', identifier, 'movie', movie.title]);

    if (movie.omdbId) {
      tags.push(['omdb', movie.omdbId]);
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
 * Builds NIP-32 / Kind 31985 Parameterized Replaceable Rating and Review event for an individual movie/show
 */
export function buildMovieReviewEvent(
  movie: MovieRecord,
  pubkey: string
): UnsignedNostrEvent {
  const timestamp = movie.dateRated
    ? Math.floor(new Date(movie.dateRated).getTime() / 1000)
    : Math.floor(Date.now() / 1000);

  const identifier = movie.omdbId
    ? `omdb:${movie.omdbId}`
    : `title:${encodeURIComponent(movie.title)}`;

  // The d tag parameterizes the replaceable review (enables updates without duplicate events)
  const dTag = movie.omdbId ? `omdb:${movie.omdbId}` : `title:${encodeURIComponent(movie.title)}`;

  const isTv = movie.titleType === 'TV Series' || movie.titleType === 'TV Mini Series' || movie.titleType === 'TV Episode';
  const mediaLabel = isTv ? 'review/tv' : 'review/movie';

  const tags: string[][] = [
    ['d', dTag],
    ['k', isTv ? 'tv' : 'movie'],
    ['L', 'review/media'],
    ['l', mediaLabel, 'ISO-639-1:en'],
    ['i', identifier, 'movie'],
    ['title', movie.title],
    ['client', 'x2nostr.emre.xyz'],
  ];

  if (movie.originalTitle && movie.originalTitle !== movie.title) {
    tags.push(['original_title', movie.originalTitle]);
  }

  if (movie.year) {
    tags.push(['year', String(movie.year)]);
  }

  if (movie.directors && movie.directors.length > 0) {
    tags.push(['directors', movie.directors.join(', ')]);
  }

  if (movie.genres && movie.genres.length > 0) {
    tags.push(['genres', ...movie.genres]);
    movie.genres.forEach((genre) => {
      tags.push(['t', genre.toLowerCase().replace(/[^a-z0-9]/g, '-')]);
    });
  }

  if (movie.runtimeMins) {
    tags.push(['runtime', String(movie.runtimeMins)]);
  }

  if (movie.myRating > 0) {
    // NIP-32 uses normalized 0..1 scale (e.g. 8/10 = 0.8)
    const ratingFraction = (movie.myRating / 10).toString();
    tags.push(['rating', ratingFraction]);
    tags.push(['rating/value', String(movie.myRating)]);
    tags.push(['rating/max', '10']);
  }

  if (movie.communityRating) {
    tags.push(['community_rating', String(movie.communityRating)]);
  }

  if (movie.dateRated) {
    tags.push(['date_rated', movie.dateRated]);
  }

  if (movie.omdbId) {
    tags.push(['omdb_id', movie.omdbId]);
  }

  // NIP-31 alt tag for general client fallback
  tags.push(['alt', `Rating for "${movie.title}" (${movie.myRating}/10)`]);

  // Construct human-readable review note
  const metaParts: string[] = [];
  if (movie.year) metaParts.push(String(movie.year));
  if (movie.directors && movie.directors.length > 0) metaParts.push(`dir. ${movie.directors.join(', ')}`);
  const metaStr = metaParts.length > 0 ? ` (${metaParts.join(', ')})` : '';

  let reviewBody = '';
  if (movie.myRating > 0) {
    reviewBody = `Rated ${movie.myRating}/10 for "${movie.title}"${metaStr}.`;
  } else {
    reviewBody = `Added to library: "${movie.title}"${metaStr}.`;
  }

  if (movie.genres && movie.genres.length > 0) {
    reviewBody += `\nGenres: ${movie.genres.join(', ')}`;
  }
  if (movie.runtimeMins) {
    reviewBody += ` • Runtime: ${movie.runtimeMins} mins`;
  }
  reviewBody += `\nMigrated via x2nostr.`;

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
export function buildMovieDeletionEvent(
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
