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
  accent: string;
}

const APPS: EcosystemApp[] = [
  {
    id: 'bookstr',
    name: 'Bookstr.xyz',
    descKey: 'appBookstrDesc',
    kinds: 'Kind 30003, 10073-10075 & 31985',
    categoryKey: 'catBooks',
    url: 'https://bookstr.xyz',
    iconName: 'bookOpen',
    accent: 'from-amber-50 to-orange-50 text-amber-600 border-amber-200',
  },
  {
    id: 'ditto',
    name: 'Ditto.pub',
    descKey: 'appDittoDesc',
    kinds: 'Kind 30023 & NIP-01',
    categoryKey: 'catSocialBlogs',
    url: 'https://ditto.pub',
    iconName: 'fileText',
    accent: 'from-blue-50 to-cyan-50 text-blue-600 border-blue-200',
  },
  {
    id: 'yakihonne',
    name: 'Yakihonne',
    descKey: 'appYakihonneDesc',
    kinds: 'Kind 30023 & NIP-51',
    categoryKey: 'catPublishing',
    url: 'https://yakihonne.com',
    iconName: 'fileText',
    accent: 'from-purple-50 to-pink-50 text-purple-600 border-purple-200',
  },
  {
    id: 'damus',
    name: 'Damus (iOS)',
    descKey: 'appDamusDesc',
    kinds: 'Kind 1 & Zaps',
    categoryKey: 'catSocialMobile',
    url: 'https://damus.io',
    iconName: 'zap',
    accent: 'from-indigo-50 to-purple-50 text-indigo-600 border-indigo-200',
  },
  {
    id: 'amethyst',
    name: 'Amethyst (Android)',
    descKey: 'appAmethystDesc',
    kinds: 'Kind 1, 30003, 30023',
    categoryKey: 'catSocialMedia',
    url: 'https://github.com/vitorpamplona/amethyst',
    iconName: 'globe',
    accent: 'from-emerald-50 to-teal-50 text-emerald-600 border-emerald-200',
  },
  {
    id: 'primal',
    name: 'Primal',
    descKey: 'appPrimalDesc',
    kinds: 'Kind 1 & Fast Cache',
    categoryKey: 'catWebMobile',
    url: 'https://primal.net',
    iconName: 'zap',
    accent: 'from-rose-50 to-orange-50 text-rose-600 border-rose-200',
  },
  {
    id: 'wavelake',
    name: 'Wavelake',
    descKey: 'appWavelakeDesc',
    kinds: 'Kind 30003 Audio',
    categoryKey: 'catMusic',
    url: 'https://wavelake.com',
    iconName: 'music',
    accent: 'from-cyan-50 to-blue-50 text-cyan-600 border-cyan-200',
  },
  {
    id: 'zapstream',
    name: 'ZapStream',
    descKey: 'appZapStreamDesc',
    kinds: 'Kind 30311 & 20',
    categoryKey: 'catVideo',
    url: 'https://zapstream.com',
    iconName: 'film',
    accent: 'from-violet-50 to-purple-50 text-violet-600 border-violet-200',
  },
];

export function renderEcosystem(container: HTMLElement): void {
  const cardsHtml = APPS.map(
    (app) => `
    <div class="glass-card glass-card-hover bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs hover:border-purple-300 hover:shadow-md">
      <div>
        <div class="flex items-center justify-between mb-4">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br ${app.accent} border flex items-center justify-center">
            ${icons[app.iconName] || icons.globe}
          </div>
          <span class="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
            ${app.kinds}
          </span>
        </div>
        <div class="text-xs font-semibold uppercase tracking-wider text-purple-600 mb-1">${t(app.categoryKey)}</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">${app.name}</h3>
        <p class="text-sm text-slate-500 leading-relaxed mb-6">${t(app.descKey)}</p>
      </div>
      <a href="${app.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-all cursor-pointer">
        <span>${t('openApp')}</span>
        ${icons.externalLink}
      </a>
    </div>
  `
  ).join('');

  container.innerHTML = `
    <section id="ecosystem" class="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">${t('ecosystemTitle')}</h2>
        <p class="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto">${t('ecosystemSubtitle')}</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        ${cardsHtml}
      </div>
    </section>
  `;
}
