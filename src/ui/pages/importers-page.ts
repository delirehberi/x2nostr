import { renderImporterMenu, renderQuickSwitcher, MENU_ITEMS } from '../components/importer-menu';
import { renderGoodreadsView } from '../components/goodreads-view';
import { renderMoviesView } from '../components/movies-view';
import { renderWordPressView } from '../components/wordpress-view';
import { renderLinkedInView } from '../components/linkedin-view';
import { renderGistsView } from '../components/gists-view';
import { renderInstagramView } from '../components/instagram-view';
import { router, normalizeImporterSlug } from '../../services/router';
import { showComingSoonModal } from '../components/modal';
import { t } from '../../services/i18n';

export function renderImportersPage(container: HTMLElement): void {
  const activeSlug = router.getImporterSlug();

  // If no specific importer subpage is requested, render the Migration Hub Catalog
  if (!activeSlug) {
    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div id="page-importer-hub-root"></div>
      </div>
    `;

    const hubRoot = container.querySelector('#page-importer-hub-root') as HTMLElement | null;
    if (hubRoot) {
      renderImporterMenu(hubRoot, '', (slug) => {
        router.navigate(`/importers/${slug}`);
      });
    }
    return;
  }

  // A specific subpage is requested (/importers/:slug or /importers?type=slug)
  const normalized = normalizeImporterSlug(activeSlug);

  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div id="page-importer-switcher-root"></div>
      <div id="page-importer-view-root"></div>
    </div>
  `;

  const switcherRoot = container.querySelector('#page-importer-switcher-root') as HTMLElement | null;
  const viewRoot = container.querySelector('#page-importer-view-root') as HTMLElement | null;

  if (switcherRoot) {
    renderQuickSwitcher(switcherRoot, normalized, (targetSlug) => {
      router.navigate(`/importers/${targetSlug}`);
    });
  }

  if (viewRoot) {
    renderSubpageView(viewRoot, normalized);
  }
}

function renderSubpageView(viewRoot: HTMLElement, slug: string): void {
  switch (slug) {
    case 'goodreads':
    case 'books':
      renderGoodreadsView(viewRoot);
      break;

    case 'movies':
    case 'imdb':
      renderMoviesView(viewRoot);
      break;

    case 'wordpress':
    case 'blogs':
      renderWordPressView(viewRoot);
      break;

    case 'gists':
    case 'github':
    case 'snippets':
      renderGistsView(viewRoot);
      break;

    case 'instagram':
    case 'photos':
      renderInstagramView(viewRoot);
      break;

    case 'linkedin':
    case 'articles':
    case 'pulse':
      renderLinkedInView(viewRoot);
      break;

    case 'spotify': {
      const item = MENU_ITEMS.find((m) => m.id === 'spotify') || MENU_ITEMS[MENU_ITEMS.length - 1];
      viewRoot.innerHTML = `
        <div class="card-workbench p-12 text-center max-w-xl mx-auto space-y-4">
          <div class="w-16 h-16 rounded-2xl bg-[var(--color-paper-subtle)] text-[var(--color-ink-muted)] flex items-center justify-center mx-auto text-2xl">
            🎵
          </div>
          <span class="text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Roadmap Phase 7
          </span>
          <h2 class="font-display text-2xl font-bold text-[var(--color-ink)]">${t(item.nameKey)}</h2>
          <p class="text-sm text-[var(--color-ink-muted)] leading-relaxed">${t(item.descKey)}</p>
          <div class="pt-4 flex justify-center gap-3">
            <button id="btn-spotify-roadmap-modal" class="btn-primary">
              <span>View Milestone Details</span>
            </button>
            <a href="/importers" class="btn-secondary">
              <span>Back to Hub</span>
            </a>
          </div>
        </div>
      `;

      const btnModal = viewRoot.querySelector('#btn-spotify-roadmap-modal') as HTMLButtonElement | null;
      if (btnModal) {
        btnModal.addEventListener('click', () => {
          showComingSoonModal({
            name: t(item.nameKey),
            phase: item.phase,
            targetKind: t(item.targetKey),
            descKey: item.descKey,
            iconName: item.iconName,
          });
        });
      }
      break;
    }

    default:
      // Fallback to Goodreads if unknown slug
      renderGoodreadsView(viewRoot);
      break;
  }
}
