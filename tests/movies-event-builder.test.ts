import { describe, it, expect } from 'vitest';
import {
  buildMovieListEvent,
  buildMovieReviewEvent,
  buildMovieDeletionEvent,
} from '../src/importers/movies/event-builder';
import { MovieRecord } from '../src/types';

const mockMovie: MovieRecord = {
  id: 'movie_tt0111161_0',
  omdbId: 'tt0111161',
  title: 'The Shawshank Redemption',
  myRating: 10,
  communityRating: 9.3,
  year: 1994,
  runtimeMins: 142,
  genres: ['Drama'],
  directors: ['Frank Darabont'],
  dateRated: '2023-08-15',
  titleType: 'Movie',
  selected: true,
};

const mockPubkey = 'fa87f45a55dd1972a250a8ddde8092fa9ac50b236901dda72737523fb0ea9070';

describe('Movies Nostr Event Builder', () => {
  describe('buildMovieListEvent (NIP-51 Kind 30003)', () => {
    it('creates parameterized movie set with d tag, title, and omdb identifier', () => {
      const event = buildMovieListEvent('movies:rated', [mockMovie], mockPubkey);

      expect(event.kind).toBe(30003);
      expect(event.pubkey).toBe(mockPubkey);
      expect(event.content).toBe('');

      const dTag = event.tags.find((t) => t[0] === 'd');
      expect(dTag?.[1]).toBe('movies:rated');

      const iTag = event.tags.find((t) => t[0] === 'i');
      expect(iTag?.[1]).toBe('omdb:tt0111161');

      const clientTag = event.tags.find((t) => t[0] === 'client');
      expect(clientTag?.[1]).toBe('x2nostr.emre.xyz');
    });
  });

  describe('buildMovieReviewEvent (NIP-32 Kind 31985)', () => {
    it('creates movie rating event with normalized rating tag and media labels', () => {
      const event = buildMovieReviewEvent(mockMovie, mockPubkey);

      expect(event.kind).toBe(31985);
      expect(event.pubkey).toBe(mockPubkey);

      const dTag = event.tags.find((t) => t[0] === 'd');
      expect(dTag?.[1]).toBe('omdb:tt0111161');

      const ratingTag = event.tags.find((t) => t[0] === 'rating');
      expect(ratingTag?.[1]).toBe('1'); // 10 / 10 = 1

      const ratingVal = event.tags.find((t) => t[0] === 'rating/value');
      expect(ratingVal?.[1]).toBe('10');

      const labelTag = event.tags.find((t) => t[0] === 'L');
      expect(labelTag?.[1]).toBe('review/media');

      const movieLabel = event.tags.find((t) => t[0] === 'l');
      expect(movieLabel?.[1]).toBe('review/movie');

      expect(event.content).toContain('The Shawshank Redemption');
      expect(event.content).toContain('Rated 10/10');
      expect(event.content).toContain('dir. Frank Darabont');
    });
  });

  describe('buildMovieDeletionEvent (NIP-09 Kind 5)', () => {
    it('creates kind 5 deletion event', () => {
      const event = buildMovieDeletionEvent(['movie_evt_1'], 'Rollback movies', mockPubkey, 31985);

      expect(event.kind).toBe(5);
      expect(event.pubkey).toBe(mockPubkey);
      expect(event.content).toBe('Rollback movies');
      expect(event.tags.some((t) => t[0] === 'e' && t[1] === 'movie_evt_1')).toBe(true);
    });
  });
});
