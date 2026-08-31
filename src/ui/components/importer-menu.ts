import { t } from '../../services/i18n';
import { icons } from '../icons';
import { showComingSoonModal } from './modal';

interface ImporterMenuItem {
  id: string;
  nameKey: string;
  descKey: string;
  targetKey: string;
  iconName: keyof typeof icons;
  status: 'active' | 'coming-soon';
  phase: number;
}

const MENU_ITEMS: ImporterMenuItem[] = [
  {
    id: 'goodreads',
    nameKey: 'goodreadsName',
    descKey: 'goodreadsDesc',
    targetKey: 'goodreadsTarget',
    iconName: 'bookOpen',
    status: 'active',
    phase: 1,
  },
  {
    id: 'movies',
    nameKey: 'moviesName',
    descKey: 'moviesDesc',
    targetKey: 'moviesTarget',
    iconName: 'film',
    status: 'active',
    phase: 2,
  },
  {
    id: 'blogs',
    nameKey: 'blogsName',
    descKey: 'blogsDesc',
    targetKey: 'blogsTarget',
    iconName: 'fileText',
    status: 'active',
    phase: 3,
  },
  {
    id: 'gists',
    nameKey: 'gistsName',
    descKey: 'gistsDesc',
    targetKey: 'gistsTarget',
    iconName: 'code',
    status: 'active',
    phase: 4,
  },
  {
    id: 'spotify',
    nameKey: 'spotifyName',
    descKey: 'spotifyDesc',
    targetKey: 'spotifyTarget',
    iconName: 'music',
    status: 'coming-soon',
    phase: 5,
  },
];

export function renderImporterMenu(container: HTMLElement, activeImporterId = 'goodreads', onSelect?: (id: string) => void): void {
  const cardsHtml = MENU_ITEMS.map((item) => {
    const isActive = item.id === activeImporterId;
    const isReady = item.status === 'active';

    return `
      <div 
        data-importer-id="${item.id}"
        class="importer-tab-card cursor-pointer p-4 rounded-2xl border border-slate-200 transition-all flex flex-col justify-between ${
          isActive
            ? 'bg-purple-50/80 shadow-xs'
            : isReady
            ? 'glass-card bg-white hover:bg-slate-50/80 shadow-xs hover:shadow-md'
            : 'glass-card bg-slate-50/60 opacity-80 hover:opacity-100 hover:bg-slate-100/80 shadow-xs'
        }"
      >
        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="w-9 h-9 rounded-xl ${
              isReady ? 'bg-purple-50 border border-purple-200 text-purple-600' : 'bg-amber-50 border border-amber-200 text-amber-600'
            } flex items-center justify-center">
              ${icons[item.iconName] || icons.zap}
            </div>
            <span class="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
              isReady ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }">
              ${isReady ? t('statusActive') : `Phase ${item.phase}`}
            </span>
          </div>
          <h4 class="text-sm font-bold text-slate-900 mb-1">${t(item.nameKey as any)}</h4>
          <p class="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">${t(item.descKey as any)}</p>
        </div>
        <div class="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-purple-600 font-medium">
          <span class="truncate">${t(item.targetKey as any)}</span>
          ${isReady ? icons.checkCircle : icons.arrowRight}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div id="migration-hub" class="mb-10">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
        <div>
          <div class="text-xs font-semibold uppercase tracking-wider text-purple-600 mb-1">x2nostr Engine</div>
          <h2 class="text-2xl sm:text-3xl font-bold text-slate-900">${t('importersTitle')}</h2>
          <p class="text-sm text-slate-500 mt-1">${t('importersSubtitle')}</p>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        ${cardsHtml}
      </div>
    </div>
  `;

  // Attach click handlers
  const cards = container.querySelectorAll('.importer-tab-card');
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-importer-id');
      const item = MENU_ITEMS.find((m) => m.id === id);
      if (!item) return;

      if (item.status === 'active') {
        if (onSelect) onSelect(item.id);
      } else {
        showComingSoonModal({
          name: t(item.nameKey as any),
          phase: item.phase,
          targetKind: t(item.targetKey as any),
          descKey: item.descKey,
          iconName: item.iconName,
        });
      }
    });
  });
}
