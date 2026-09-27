import { t, TranslationKey } from '../../services/i18n';
import { icons } from '../icons';
import { router } from '../../services/router';

interface DocItem {
  id: string;
  titleKey: TranslationKey;
  summaryKey: TranslationKey;
  contentKey: TranslationKey;
  tag: string;
}

const DOCS: DocItem[] = [
  {
    id: 'keys',
    titleKey: 'doc1Title',
    summaryKey: 'doc1Summary',
    contentKey: 'doc1Content',
    tag: 'NIP-01 / NIP-07',
  },
  {
    id: 'amber',
    titleKey: 'doc2Title',
    summaryKey: 'doc2Summary',
    contentKey: 'doc2Content',
    tag: 'NIP-46 / NIP-55',
  },
  {
    id: 'goodreads',
    titleKey: 'doc3Title',
    summaryKey: 'doc3Summary',
    contentKey: 'doc3Content',
    tag: 'NIP-51 & NIP-32',
  },
  {
    id: 'cinema',
    titleKey: 'doc4Title',
    summaryKey: 'doc4Summary',
    contentKey: 'doc4Content',
    tag: 'Cinema & Film',
  },
  {
    id: 'blogs',
    titleKey: 'doc5Title',
    summaryKey: 'doc5Summary',
    contentKey: 'doc5Content',
    tag: 'NIP-23 Blog',
  },
  {
    id: 'manifesto',
    titleKey: 'doc6Title',
    summaryKey: 'doc6Summary',
    contentKey: 'doc6Content',
    tag: 'Manifesto & Spec',
  },
];

export function renderDocsPage(container: HTMLElement): void {
  const queryParams = router.getQueryParams();
  let selectedDocId = queryParams.id || DOCS[0].id;

  const render = () => {
    const selectedDoc = DOCS.find((d) => d.id === selectedDocId) || DOCS[0];

    const listHtml = DOCS.map((doc) => {
      const isSelected = doc.id === selectedDoc.id;
      return `
        <div data-doc-id="${doc.id}" class="doc-nav-item card-workbench card-workbench-interactive p-4 transition-all cursor-pointer ${
          isSelected
            ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)] bg-[var(--color-paper-card)]'
            : 'hover:border-[var(--color-border-focus)]'
        }">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-[var(--color-paper-subtle)] text-[var(--color-accent)] border border-[var(--color-border-subtle)]">${doc.tag}</span>
            ${isSelected ? `<span class="text-[var(--color-accent)]">${icons.checkCircle}</span>` : ''}
          </div>
          <h4 class="font-display text-sm font-bold text-[var(--color-ink)] mb-1">${t(doc.titleKey)}</h4>
          <p class="text-xs text-[var(--color-ink-muted)] line-clamp-2">${t(doc.summaryKey)}</p>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
        <!-- Page Header -->
        <div class="mb-8">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-paper-subtle)] border border-[var(--color-border)] text-[var(--color-ink-muted)] text-xs font-mono font-medium mb-3">
            <span class="text-[var(--color-accent)]">${icons.fileText}</span>
            <span>${t('navDocs')}</span>
          </div>
          <h1 class="font-display text-2xl sm:text-4xl font-bold text-[var(--color-ink)] tracking-tight mb-2">
            ${t('docsTitle')}
          </h1>
          <p class="text-xs sm:text-sm text-[var(--color-ink-muted)] max-w-3xl">
            ${t('docsSubtitle')}
          </p>
        </div>

        <!-- Main Layout: Sidebar & Content -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <!-- Sidebar Navigation -->
          <div class="lg:col-span-4 space-y-3">
            ${listHtml}
          </div>

          <!-- Document Viewer -->
          <div class="lg:col-span-8 card-workbench p-6 sm:p-8">
            <div class="pb-4 mb-6 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
              <span class="text-xs font-mono font-bold text-[var(--color-accent)] uppercase tracking-wider">${selectedDoc.tag}</span>
              <span class="text-xs font-mono text-[var(--color-ink-muted)]">x2nostr Spec & Guide</span>
            </div>
            <div class="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed text-[var(--color-ink)] space-y-4">
              ${t(selectedDoc.contentKey)}
            </div>
          </div>
        </div>
      </div>
    `;

    // Attach click events
    const navItems = container.querySelectorAll('.doc-nav-item');
    navItems.forEach((item) => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-doc-id');
        if (id) {
          selectedDocId = id;
          render();
        }
      });
    });
  };

  render();
}
