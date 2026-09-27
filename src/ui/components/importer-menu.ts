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
    id: 'instagram',
    nameKey: 'instagramName',
    descKey: 'instagramDesc',
    targetKey: 'instagramTarget',
    iconName: 'camera',
    status: 'active',
    phase: 5,
  },
  {
    id: 'linkedin',
    nameKey: 'linkedinName',
    descKey: 'linkedinDesc',
    targetKey: 'linkedinTarget',
    iconName: 'fileText',
    status: 'active',
    phase: 6,
  },
  {
    id: 'spotify',
    nameKey: 'spotifyName',
    descKey: 'spotifyDesc',
    targetKey: 'spotifyTarget',
    iconName: 'music',
    status: 'coming-soon',
    phase: 7,
  },
];

export function renderImporterMenu(container: HTMLElement, activeImporterId = 'goodreads', onSelect?: (id: string) => void): void {
  const cardsHtml = MENU_ITEMS.map((item) => {
    const isActive = item.id === activeImporterId;
    const isReady = item.status === 'active';

    return `
      <div 
        data-importer-id="${item.id}"
        class="importer-tab-card card-workbench card-workbench-interactive cursor-pointer p-4 flex flex-col justify-between transition-all ${
          isActive
            ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)] bg-[var(--color-paper-card)]'
            : isReady
            ? 'hover:border-[var(--color-border-focus)]'
            : 'opacity-70 bg-[var(--color-paper-subtle)]'
        }"
      >
        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="w-8 h-8 rounded-lg ${
              isActive 
                ? 'bg-[var(--color-accent)] text-white'
                : isReady 
                ? 'bg-[var(--color-paper-subtle)] text-[var(--color-ink)]' 
                : 'bg-[var(--color-paper-inset)] text-[var(--color-ink-faint)]'
            } flex items-center justify-center">
              ${icons[item.iconName] || icons.zap}
            </div>
            <span class="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded ${
              isActive
                ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent-subtle-border)]'
                : isReady 
                ? 'bg-[var(--color-paper-subtle)] text-[var(--color-ink-muted)] border border-[var(--color-border-subtle)]' 
                : 'bg-[var(--color-paper-inset)] text-[var(--color-ink-faint)]'
            }">
              ${isReady ? t('statusActive') : `Phase ${item.phase}`}
            </span>
          </div>
          <h4 class="font-display text-sm font-bold text-[var(--color-ink)] mb-1">${t(item.nameKey as any)}</h4>
          <p class="text-xs text-[var(--color-ink-muted)] line-clamp-2 mb-3 leading-relaxed">${t(item.descKey as any)}</p>
        </div>
        <div class="pt-2.5 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-[11px] font-mono font-medium ${
          isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-muted)]'
        }">
          <span class="truncate">${t(item.targetKey as any)}</span>
          ${isReady ? icons.checkCircle : icons.arrowRight}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div id="migration-hub" class="mb-10 text-left">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
        <div>
          <div class="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-1">x2nostr Engine</div>
          <h2 class="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">${t('importersTitle')}</h2>
          <p class="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">${t('importersSubtitle')}</p>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
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
