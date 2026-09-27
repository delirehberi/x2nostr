import { t, TranslationKey } from '../../services/i18n';
import { icons } from '../icons';

interface EcosystemApp {
  id: string;
  name: string;
  descKey: TranslationKey;
  kinds: string;
  categoryKey: TranslationKey;
  url: string;
  iconName: keyof typeof icons;
  badgeClass: string;
}

const APPS: EcosystemApp[] = [
  {
    id: 'bookstr',
    name: 'Bookstr.xyz',
    descKey: 'appBookstrDesc',
    kinds: 'Kind 30003 & 31985',
    categoryKey: 'catBooks',
    url: 'https://bookstr.xyz',
    iconName: 'bookOpen',
    badgeClass: 'text-[var(--color-ink)] bg-[var(--color-paper-subtle)] border-[var(--color-border)]',
  },
  {
    id: 'ditto',
    name: 'Ditto.pub',
    descKey: 'appDittoDesc',
    kinds: 'Kind 30023 & NIP-01',
    categoryKey: 'catSocialBlogs',
    url: 'https://ditto.pub',
    iconName: 'fileText',
    badgeClass: 'text-[var(--color-ink)] bg-[var(--color-paper-subtle)] border-[var(--color-border)]',
  },
  {
    id: 'yakihonne',
    name: 'Yakihonne',
    descKey: 'appYakihonneDesc',
    kinds: 'Kind 30023 & NIP-51',
    categoryKey: 'catPublishing',
    url: 'https://yakihonne.com',
    iconName: 'fileText',
    badgeClass: 'text-[var(--color-ink)] bg-[var(--color-paper-subtle)] border-[var(--color-border)]',
  },
  {
    id: 'damus',
    name: 'Damus (iOS)',
    descKey: 'appDamusDesc',
    kinds: 'Kind 1 & Zaps',
    categoryKey: 'catSocialMobile',
    url: 'https://damus.io',
    iconName: 'zap',
    badgeClass: 'text-[var(--color-ink)] bg-[var(--color-paper-subtle)] border-[var(--color-border)]',
  },
  {
    id: 'amethyst',
    name: 'Amethyst (Android)',
    descKey: 'appAmethystDesc',
    kinds: 'Kind 1, 30003, 30023',
    categoryKey: 'catSocialMedia',
    url: 'https://github.com/vitorpamplona/amethyst',
    iconName: 'globe',
    badgeClass: 'text-[var(--color-ink)] bg-[var(--color-paper-subtle)] border-[var(--color-border)]',
  },
  {
    id: 'primal',
    name: 'Primal',
    descKey: 'appPrimalDesc',
    kinds: 'Kind 1 & Fast Cache',
    categoryKey: 'catWebMobile',
    url: 'https://primal.net',
    iconName: 'zap',
    badgeClass: 'text-[var(--color-ink)] bg-[var(--color-paper-subtle)] border-[var(--color-border)]',
  },
  {
    id: 'wavelake',
    name: 'Wavelake',
    descKey: 'appWavelakeDesc',
    kinds: 'Kind 30003 Audio',
    categoryKey: 'catMusic',
    url: 'https://wavelake.com',
    iconName: 'music',
    badgeClass: 'text-[var(--color-ink)] bg-[var(--color-paper-subtle)] border-[var(--color-border)]',
  },
  {
    id: 'zapstream',
    name: 'ZapStream',
    descKey: 'appZapStreamDesc',
    kinds: 'Kind 30311 & 20',
    categoryKey: 'catVideo',
    url: 'https://zapstream.com',
    iconName: 'film',
    badgeClass: 'text-[var(--color-ink)] bg-[var(--color-paper-subtle)] border-[var(--color-border)]',
  },
  {
    id: 'gitworkshop',
    name: 'GitWorkshop.dev',
    descKey: 'appGitWorkshopDesc',
    kinds: 'NIP-34 (Git Repos)',
    categoryKey: 'catCodeGit',
    url: 'https://gitworkshop.dev',
    iconName: 'code',
    badgeClass: 'text-[var(--color-ink)] bg-[var(--color-paper-subtle)] border-[var(--color-border)]',
  },
];

export function renderEcosystem(container: HTMLElement): void {
  const cardsHtml = APPS.map(
    (app) => `
    <div class="card-workbench card-workbench-interactive p-5 flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-4">
          <div class="w-9 h-9 rounded-lg bg-[var(--color-paper-subtle)] border border-[var(--color-border-subtle)] text-[var(--color-ink)] flex items-center justify-center">
            ${icons[app.iconName] || icons.globe}
          </div>
          <span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${app.badgeClass}">
            ${app.kinds}
          </span>
        </div>
        <div class="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-1">${t(app.categoryKey)}</div>
        <h3 class="font-display text-base font-bold text-[var(--color-ink)] mb-1.5">${app.name}</h3>
        <p class="text-xs text-[var(--color-ink-muted)] leading-relaxed mb-5">${t(app.descKey)}</p>
      </div>
      <a href="${app.url}" target="_blank" rel="noopener noreferrer" class="btn-secondary w-full text-xs py-2">
        <span>${t('openApp')}</span>
        ${icons.externalLink}
      </a>
    </div>
  `
  ).join('');

  container.innerHTML = `
    <section id="ecosystem" class="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left">
      <div class="mb-10">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-paper-subtle)] border border-[var(--color-border)] text-[var(--color-ink-muted)] text-xs font-mono font-medium mb-3">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Open Protocol Clients</span>
        </div>
        <h2 class="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)] mb-2">${t('ecosystemTitle')}</h2>
        <p class="text-xs sm:text-sm text-[var(--color-ink-muted)] max-w-2xl">${t('ecosystemSubtitle')}</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
        ${cardsHtml}
      </div>
    </section>
  `;
}
