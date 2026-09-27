import { describe, expect, it } from 'vitest';
import { extractHashtags, normalizeTopic, slugify } from '../src/services/tags';

describe('tags.ts service', () => {
  describe('normalizeTopic', () => {
    it('should preserve Turkish characters in tags and topics', () => {
      expect(normalizeTopic('Köşe Yazıları')).toBe('köşe-yazıları');
      expect(normalizeTopic('Sağlık')).toBe('sağlık');
      expect(normalizeTopic('Donör')).toBe('donör');
      expect(normalizeTopic('Hücre')).toBe('hücre');
      expect(normalizeTopic('Çevre & Doğa')).toBe('çevre-doğa');
      expect(normalizeTopic('Isparta')).toBe('isparta');
      expect(normalizeTopic('Ilıca')).toBe('ilıca');
      expect(normalizeTopic('İstanbul')).toBe('istanbul');
      expect(normalizeTopic('İki Kadın')).toBe('iki-kadın');
    });

    it('should handle apostrophes cleanly without creating stray s characters', () => {
      expect(normalizeTopic("Leigh's Sendromu")).toBe('leighs-sendromu');
      expect(normalizeTopic('Bitcoin’s Future')).toBe('bitcoins-future');
    });

    it('should strip leading hash and mention symbols', () => {
      expect(normalizeTopic('#sağlık')).toBe('sağlık');
      expect(normalizeTopic('##köşeyazısı')).toBe('köşeyazısı');
      expect(normalizeTopic('@nostr')).toBe('nostr');
    });

    it('should preserve other international Unicode characters', () => {
      expect(normalizeTopic('Tecnología y Educación')).toBe('tecnología-y-educación');
      expect(normalizeTopic('München Grüße')).toBe('münchen-grüße');
      expect(normalizeTopic('Привет Мир')).toBe('привет-мир');
      expect(normalizeTopic('日本語タグ')).toBe('日本語タグ');
    });

    it('should handle edge cases and empty strings gracefully', () => {
      expect(normalizeTopic('')).toBe('');
      expect(normalizeTopic(null)).toBe('');
      expect(normalizeTopic(undefined)).toBe('');
      expect(normalizeTopic('---')).toBe('');
      expect(normalizeTopic('   #  ')).toBe('');
      expect(normalizeTopic('...test...')).toBe('test');
    });
  });

  describe('slugify', () => {
    it('should transliterate Turkish characters to clean ASCII slugs', () => {
      expect(slugify('İki kadın, bir erkek ve bir bebek!')).toBe('iki-kadin-bir-erkek-ve-bir-bebek');
      expect(slugify('Köşe Yazıları')).toBe('kose-yazilari');
      expect(slugify('Sağlık Haberleri')).toBe('saglik-haberleri');
      expect(slugify('Hücre Çekirdeği')).toBe('hucre-cekirdegi');
      expect(slugify('Donör Adayı')).toBe('donor-adayi');
    });

    it('should transliterate European accented characters to ASCII', () => {
      expect(slugify('Crème Brûlée & Café')).toBe('creme-brulee-cafe');
      expect(slugify('El Niño en España')).toBe('el-nino-en-espana');
    });

    it('should handle edge cases', () => {
      expect(slugify('')).toBe('');
      expect(slugify(null)).toBe('');
      expect(slugify(undefined)).toBe('');
      expect(slugify('---hello---world---')).toBe('hello-world');
    });
  });

  describe('extractHashtags', () => {
    it('should extract hashtags with Turkish and Unicode characters intact', () => {
      const text = 'Bugün harika bir gün! #sağlık #köşeyazıları #hücre #donör #nostr #İkiKadın';
      const tags = extractHashtags(text);
      expect(tags).toContain('sağlık');
      expect(tags).toContain('köşeyazıları');
      expect(tags).toContain('hücre');
      expect(tags).toContain('donör');
      expect(tags).toContain('nostr');
      expect(tags).toContain('ikikadın');
    });

    it('should return unique tags and ignore empty text', () => {
      expect(extractHashtags('')).toEqual([]);
      expect(extractHashtags(null)).toEqual([]);
      expect(extractHashtags('#nostr #NOSTR #nostr')).toEqual(['nostr']);
    });
  });
});
