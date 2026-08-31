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
        <div data-doc-id="${doc.id}" class="doc-nav-item p-4 rounded-xl border border-slate-200 transition-all cursor-pointer ${
          isSelected
            ? 'bg-purple-50/90 border-purple-300 shadow-xs'
            : 'bg-white hover:bg-slate-50 text-slate-700'
        }">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-purple-700 border border-slate-200">${doc.tag}</span>
            ${isSelected ? `<span class="text-purple-600">${icons.checkCircle}</span>` : ''}
          </div>
          <h4 class="text-sm font-bold text-slate-900 mb-1">${t(doc.titleKey)}</h4>
          <p class="text-xs text-slate-500 line-clamp-2">${t(doc.summaryKey)}</p>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Page Header -->
        <div class="mb-10 text-center sm:text-left">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-3">
            ${icons.fileText}
            <span>${t('navDocs')}</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            ${t('docsTitle')}
          </h1>
          <p class="text-sm text-slate-600 max-w-3xl">
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
          <div class="lg:col-span-8 glass-card bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div class="pb-4 mb-6 border-b border-slate-200 flex items-center justify-between">
              <span class="text-xs font-mono font-bold text-purple-700 uppercase tracking-wider">${selectedDoc.tag}</span>
              <span class="text-xs text-slate-400">x2nostr HowTo Series</span>
            </div>
            <div class="prose prose-slate max-w-none text-slate-700">
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
