import { describe, it, expect } from 'vitest';
import { en } from '../src/locales/en';
import { tr } from '../src/locales/tr';
import { es } from '../src/locales/es';
import { t, i18n } from '../src/services/i18n';

describe('Internationalization (i18n)', () => {
  const enKeys = Object.keys(en) as (keyof typeof en)[];
  const trKeys = Object.keys(tr) as (keyof typeof tr)[];
  const esKeys = Object.keys(es) as (keyof typeof es)[];

  it('has 100% key parity between English and Turkish', () => {
    const missingInTr = enKeys.filter((k) => !(k in tr));
    const extraInTr = trKeys.filter((k) => !(k in en));

    expect(missingInTr).toEqual([]);
    expect(extraInTr).toEqual([]);
    expect(trKeys.length).toBe(enKeys.length);
  });

  it('has 100% key parity between English and Spanish', () => {
    const missingInEs = enKeys.filter((k) => !(k in es));
    const extraInEs = esKeys.filter((k) => !(k in en));

    expect(missingInEs).toEqual([]);
    expect(extraInEs).toEqual([]);
    expect(esKeys.length).toBe(enKeys.length);
  });

  it('translates strings dynamically and supports parameters', () => {
    i18n.setLocale('en');
    expect(i18n.getLocale()).toBe('en');

    // Test parameter interpolation
    const rendered = t('selectedCount', { count: 5, total: 10 });
    expect(rendered).toBe('5 of 10 selected');
  });

  it('switches locales seamlessly', () => {
    i18n.setLocale('tr');
    expect(i18n.getLocale()).toBe('tr');
    expect(t('heroBadge')).toBe(tr.heroBadge);

    i18n.setLocale('es');
    expect(i18n.getLocale()).toBe('es');
    expect(t('heroBadge')).toBe(es.heroBadge);

    // Reset back to en
    i18n.setLocale('en');
    expect(i18n.getLocale()).toBe('en');
    expect(t('heroBadge')).toBe(en.heroBadge);
  });
});
