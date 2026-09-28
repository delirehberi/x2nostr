import { t, TranslationKey } from '../../services/i18n';
import { icons } from '../icons';
import { showComingSoonModal } from './modal';
import { router } from '../../services/router';

export type ImporterCategory = 'all' | 'books-media' | 'publishing' | 'code' | 'social';

export interface ImporterMenuItem {
  id: string;
  slug: string;
  nameKey: TranslationKey;
  descKey: TranslationKey;
  targetKey: TranslationKey;
  iconName: keyof typeof icons;
  status: 'active' | 'coming-soon';
  phase: number;
  category: ImporterCategory;
  formats: string[];
}

export const MENU_ITEMS: ImporterMenuItem[] = [
  {
    id: 'goodreads',
    slug: 'goodreads',
    nameKey: 'goodreadsName',
    descKey: 'goodreadsDesc',
    targetKey: 'goodreadsTarget',
    iconName: 'bookOpen',
    status: 'active',
    phase: 1,
    category: 'books-media',
    formats: ['CSV', 'Open Library', 'Kind 30003', 'Kind 31985'],
  },
  {
    id: 'movies',
    slug: 'movies',
    nameKey: 'moviesName',
    descKey: 'moviesDesc',
    targetKey: 'moviesTarget',
    iconName: 'film',
    status: 'active',
    phase: 2,
    category: 'books-media',
    formats: ['IMDb CSV', 'OMDb API', 'Kind 30003', 'Kind 31985'],
  },
  {
    id: 'wordpress',
    slug: 'wordpress',
    nameKey: 'blogsName',
    descKey: 'blogsDesc',
    targetKey: 'blogsTarget',
    iconName: 'fileText',
    status: 'active',
    phase: 3,
    category: 'publishing',
    formats: ['WXR XML', 'Markdown', 'Blossom Media', 'Kind 30023'],
  },
  {
    id: 'gists',
    slug: 'gists',
    nameKey: 'gistsName',
    descKey: 'gistsDesc',
    targetKey: 'gistsTarget',
    iconName: 'code',
    status: 'active',
    phase: 4,
    category: 'code',
    formats: ['GitHub API', 'NIP-C0 Kind 1337', 'NIP-44 Encrypted'],
  },
  {
    id: 'instagram',
    slug: 'instagram',
    nameKey: 'instagramName',
    descKey: 'instagramDesc',
    targetKey: 'instagramTarget',
    iconName: 'camera',
    status: 'active',
    phase: 5,
    category: 'social',
    formats: ['Meta Export JSON', 'HEIC/JPEG Worker', 'Blossom', 'Kind 20'],
  },
  {
    id: 'linkedin',
    slug: 'linkedin',
    nameKey: 'linkedinName',
    descKey: 'linkedinDesc',
    targetKey: 'linkedinTarget',
    iconName: 'fileText',
    status: 'active',
    phase: 6,
    category: 'publishing',
    formats: ['ZIP Archive', 'HTML Articles', 'Kind 30023'],
  },
  {
    id: 'spotify',
    slug: 'spotify',
    nameKey: 'spotifyName',
    descKey: 'spotifyDesc',
    targetKey: 'spotifyTarget',
    iconName: 'music',
    status: 'coming-soon',
    phase: 7,
    category: 'social',
    formats: ['JSON Playlists', 'Kind 30001 (NIP-51)'],
  },
];

/**
 * Renders the full Migration Hub Catalog Grid (used on /importers and Home).
 */
export function renderImporterMenu(
  container: HTMLElement,
  activeImporterId = '',
  onSelect?: (id: string) => void
): void {
  let currentCategory: ImporterCategory = 'all';
  let searchQuery = '';

  const renderGrid = () => {
    const filteredItems = MENU_ITEMS.filter((item) => {
      const matchCategory = currentCategory === 'all' || item.category === currentCategory;
      if (!matchCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const title = t(item.nameKey).toLowerCase();
      const desc = t(item.descKey).toLowerCase();
      const target = t(item.targetKey).toLowerCase();
      const formats = item.formats.join(' ').toLowerCase();

      return title.includes(q) || desc.includes(q) || target.includes(q) || formats.includes(q);
    });

    const categoryFilters: { key: ImporterCategory; labelKey: TranslationKey; count: number }[] = [
      { key: 'all', labelKey: 'hubFilterAll', count: MENU_ITEMS.length },
      { key: 'books-media', labelKey: 'hubFilterBooksMedia', count: MENU_ITEMS.filter((m) => m.category === 'books-media').length },
      { key: 'publishing', labelKey: 'hubFilterPublishing', count: MENU_ITEMS.filter((m) => m.category === 'publishing').length },
      { key: 'code', labelKey: 'hubFilterCode', count: MENU_ITEMS.filter((m) => m.category === 'code').length },
      { key: 'social', labelKey: 'hubFilterSocial', count: MENU_ITEMS.filter((m) => m.category === 'social').length },
    ];

    const filterTabsHtml = categoryFilters
      .map(
        (filter) => `
        <button 
          data-category="${filter.key}" 
          class="btn-category-filter px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
            currentCategory === filter.key
              ? 'bg-[var(--color-ink)] text-[var(--color-ink-inverse)] shadow-xs'
              : 'bg-[var(--color-paper-card)] hover:bg-[var(--color-paper-subtle)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] border border-[var(--color-border-subtle)]'
          }"
        >
          <span>${t(filter.labelKey)}</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full ${
            currentCategory === filter.key
              ? 'bg-white/20 text-white'
              : 'bg-[var(--color-paper-subtle)] text-[var(--color-ink-muted)]'
          }">${filter.count}</span>
        </button>
      `
      )
      .join('');

    const cardsHtml =
      filteredItems.length > 0
        ? filteredItems
            .map((item) => {
              const isActive = item.id === activeImporterId;
              const isReady = item.status === 'active';

              const formatsPills = item.formats
                .map(
                  (f) => `
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--color-paper-subtle)] text-[var(--color-ink-muted)] border border-[var(--color-border-subtle)]">
                  ${f}
                </span>
              `
                )
                .join('');

              return `
                <div 
                  data-importer-id="${item.id}"
                  data-importer-slug="${item.slug}"
                  class="importer-catalog-card card-workbench card-workbench-interactive cursor-pointer p-6 flex flex-col justify-between transition-all group ${
                    isActive
                      ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20 bg-[var(--color-paper-card)]'
                      : isReady
                      ? 'hover:border-[var(--color-border-focus)] hover:shadow-md'
                      : 'opacity-75 bg-[var(--color-paper-subtle)]'
                  }"
                >
                  <div class="space-y-4">
                    <!-- Top Icon and Status Row -->
                    <div class="flex items-center justify-between">
                      <div class="w-11 h-11 rounded-xl ${
                        isReady
                          ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent-subtle-border)] group-hover:bg-[var(--color-accent)] group-hover:text-white transition-colors'
                          : 'bg-[var(--color-paper-inset)] text-[var(--color-ink-faint)] border border-[var(--color-border-subtle)]'
                      } flex items-center justify-center shadow-2xs">
                        ${icons[item.iconName] || icons.zap}
                      </div>

                      <div class="flex items-center gap-2">
                        <span class="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full ${
                          isReady
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                        }">
                          ${isReady ? t('statusActive') : `Phase ${item.phase}`}
                        </span>
                      </div>
                    </div>

                    <!-- Title & Description -->
                    <div class="space-y-1.5 text-left">
                      <h3 class="font-display text-lg font-bold text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors">
                        ${t(item.nameKey)}
                      </h3>
                      <p class="text-xs sm:text-sm text-[var(--color-ink-muted)] line-clamp-2 leading-relaxed">
                        ${t(item.descKey)}
                      </p>
                    </div>

                    <!-- Supported Formats Pills -->
                    <div class="flex flex-wrap gap-1.5 pt-1">
                      ${formatsPills}
                    </div>
                  </div>

                  <!-- Footer: Target Protocol & Launch Action -->
                  <div class="pt-5 mt-5 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-3 text-left">
                    <div class="min-w-0">
                      <div class="text-[10px] font-mono font-medium uppercase text-[var(--color-ink-faint)] tracking-wider">
                        ${t('targetNip')}
                      </div>
                      <div class="text-xs font-mono font-medium text-[var(--color-ink)] truncate" title="${t(item.targetKey)}">
                        ${t(item.targetKey)}
                      </div>
                    </div>

                    <div class="shrink-0 flex items-center gap-1 text-xs font-semibold ${
                      isReady ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-muted)]'
                    }">
                      <span class="hidden sm:inline">${isReady ? t('launchImporter') : t('statusComingSoon')}</span>
                      ${icons.arrowRight}
                    </div>
                  </div>
                </div>
              `;
            })
            .join('')
        : `
          <div class="col-span-full card-workbench p-12 text-center space-y-3">
            <div class="w-12 h-12 rounded-full bg-[var(--color-paper-subtle)] text-[var(--color-ink-muted)] flex items-center justify-center mx-auto">
              ${icons.helpCircle}
            </div>
            <h4 class="font-display text-base font-bold text-[var(--color-ink)]">${t('noImportersFound')}</h4>
            <p class="text-xs text-[var(--color-ink-muted)] max-w-sm mx-auto">Try changing your search query or selecting another category filter above.</p>
          </div>
        `;

    container.innerHTML = `
      <div id="migration-hub" class="space-y-6 text-left">
        <!-- Hub Header Section -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[var(--color-border-subtle)]">
          <div>
            <div class="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-1">
              x2nostr Engine
            </div>
            <h2 class="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">
              ${t('importersTitle')}
            </h2>
            <p class="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
              ${t('importersSubtitle')}
            </p>
          </div>

          <!-- Search Bar -->
          <div class="w-full md:w-80 relative">
            <input 
              id="hub-search-input"
              type="text" 
              value="${searchQuery}" 
              placeholder="${t('searchImportersPlaceholder')}"
              class="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--color-paper-card)] border border-[var(--color-border)] text-xs text-[var(--color-ink)] placeholder-[var(--color-ink-faint)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all shadow-2xs"
            />
            <div class="absolute left-3 top-2.5 text-[var(--color-ink-muted)] pointer-events-none">
              ${icons.search || icons.externalLink}
            </div>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          ${filterTabsHtml}
        </div>

        <!-- Responsive Card Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          ${cardsHtml}
        </div>
      </div>
    `;

    // Attach Category Filter Listeners
    const filterButtons = container.querySelectorAll('.btn-category-filter');
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category') as ImporterCategory | null;
        if (cat) {
          currentCategory = cat;
          renderGrid();
        }
      });
    });

    // Attach Search Input Listener
    const searchInput = container.querySelector('#hub-search-input') as HTMLInputElement | null;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = (e.target as HTMLInputElement).value;
        renderGrid();
        const updatedInput = container.querySelector('#hub-search-input') as HTMLInputElement | null;
        if (updatedInput) {
          updatedInput.focus();
          updatedInput.setSelectionRange(updatedInput.value.length, updatedInput.value.length);
        }
      });
    }

    // Attach Card Click Listeners
    const cards = container.querySelectorAll('.importer-catalog-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-importer-id');
        const slug = card.getAttribute('data-importer-slug') || id;
        const item = MENU_ITEMS.find((m) => m.id === id);
        if (!item) return;

        if (item.status === 'active') {
          if (onSelect) {
            onSelect(slug || item.id);
          } else {
            router.navigate(`/importers/${slug}`);
          }
        } else {
          showComingSoonModal({
            name: t(item.nameKey),
            phase: item.phase,
            targetKind: t(item.targetKey),
            descKey: item.descKey,
            iconName: item.iconName,
          });
        }
      });
    });
  };

  renderGrid();
}

/**
 * Renders a compact, sleek quick-switcher pill bar for subpages.
 */
export function renderQuickSwitcher(
  container: HTMLElement,
  activeImporterSlug: string,
  onSelect?: (slug: string) => void
): void {
  const activeItem = MENU_ITEMS.find((m) => m.slug === activeImporterSlug || m.id === activeImporterSlug) || MENU_ITEMS[0];

  const pillsHtml = MENU_ITEMS.map((item) => {
    const isActive = item.slug === activeImporterSlug || item.id === activeImporterSlug;
    const isReady = item.status === 'active';

    return `
      <button 
        data-switcher-slug="${item.slug}"
        class="btn-importer-switcher px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
          isActive
            ? 'bg-[var(--color-accent)] text-white shadow-xs'
            : isReady
            ? 'bg-[var(--color-paper-card)] hover:bg-[var(--color-paper-subtle)] text-[var(--color-ink)] border border-[var(--color-border-subtle)]'
            : 'bg-[var(--color-paper-subtle)] opacity-60 text-[var(--color-ink-muted)] border border-dashed border-[var(--color-border)]'
        }"
        title="${t(item.nameKey)}"
      >
        <span class="w-4 h-4 flex items-center justify-center">
          ${icons[item.iconName] || icons.zap}
        </span>
        <span class="whitespace-nowrap">${t(item.nameKey).split(' ')[0]}</span>
        ${
          !isReady
            ? `<span class="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-black/10">P${item.phase}</span>`
            : ''
        }
      </button>
    `;
  }).join('');

  container.innerHTML = `
    <div class="space-y-3 text-left">
      <!-- Breadcrumb Bar -->
      <nav class="flex items-center gap-2 text-xs font-mono text-[var(--color-ink-muted)]">
        <a href="/" data-route="/" class="nav-breadcrumb-link hover:text-[var(--color-ink)] transition-colors">${t('breadcrumbHome')}</a>
        <span class="text-[var(--color-ink-faint)]">/</span>
        <a href="/importers" data-route="/importers" class="nav-breadcrumb-link hover:text-[var(--color-ink)] transition-colors">${t('breadcrumbHub')}</a>
        <span class="text-[var(--color-ink-faint)]">/</span>
        <span class="text-[var(--color-accent)] font-semibold">${t(activeItem.nameKey)}</span>
      </nav>

      <!-- Switcher Container -->
      <div class="flex items-center justify-between gap-4 p-2 rounded-2xl bg-[var(--color-paper-card)] border border-[var(--color-border)] shadow-xs">
        <div class="flex items-center gap-2 overflow-x-auto py-0.5 px-1 scrollbar-none">
          <a href="/importers" data-route="/importers" class="nav-breadcrumb-link px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-subtle)] transition-all shrink-0 flex items-center gap-1.5 border border-[var(--color-border-subtle)]">
            ${icons.arrowLeft}
            <span>${t('allImporters')}</span>
          </a>
          <div class="h-4 w-px bg-[var(--color-border)] shrink-0"></div>
          ${pillsHtml}
        </div>
      </div>
    </div>
  `;

  // Attach breadcrumb listeners
  const breadcrumbLinks = container.querySelectorAll('.nav-breadcrumb-link');
  breadcrumbLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetRoute = link.getAttribute('data-route');
      if (targetRoute) {
        router.navigate(targetRoute);
      }
    });
  });

  // Attach switcher button listeners
  const switcherBtns = container.querySelectorAll('.btn-importer-switcher');
  switcherBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const slug = btn.getAttribute('data-switcher-slug');
      if (!slug) return;
      const item = MENU_ITEMS.find((m) => m.slug === slug || m.id === slug);
      if (!item) return;

      if (item.status === 'active') {
        if (onSelect) {
          onSelect(slug);
        } else {
          router.navigate(`/importers/${slug}`);
        }
      } else {
        showComingSoonModal({
          name: t(item.nameKey),
          phase: item.phase,
          targetKind: t(item.targetKey),
          descKey: item.descKey,
          iconName: item.iconName,
        });
      }
    });
  });
}
