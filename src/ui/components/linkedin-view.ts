import { linkedInPipeline } from '../../importers/linkedin/pipeline';
import { DEFAULT_BLOSSOM_SERVERS } from '../../services/blossom';
import { i18n } from '../../services/i18n';
import { importSessionService } from '../../services/import-session';
import { nostrService } from '../../services/nostr';
import { ImportSession, LinkedInMigrationOptions } from '../../types';
import { showDryRunModal } from './modal';
import { icons } from '../icons';

declare global {
  interface Window {
    lucide?: {
      createIcons(): void;
    };
  }
}

export function renderLinkedInView(container: HTMLElement): void {
  let articles = linkedInPipeline.getArticles();
  let progress = linkedInPipeline.getProgress();
  let logs = linkedInPipeline.getLogs();
  let searchQuery = '';

  // Options state
  let uploadImagesToBlossom = true;
  let blossomServersStr = DEFAULT_BLOSSOM_SERVERS.join(', ');
  let deletePreviousArticles = false;
  let showExportGuide = false;

  // Session state
  let existingSession: ImportSession | null = null;
  let useResumeSession = false;

  const updateSessionState = () => {
    const pubkey = nostrService.getPubkey();
    const fingerprint = linkedInPipeline.getFingerprint();
    if (pubkey && fingerprint) {
      existingSession = importSessionService.findSession('linkedin', pubkey, fingerprint);
    } else {
      existingSession = null;
    }
  };

  const render = () => {
    updateSessionState();
    const t = (key: Parameters<typeof i18n.t>[0], params?: Record<string, string | number>) => i18n.t(key, params);

    const filteredArticles = articles.filter((article) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        article.title.toLowerCase().includes(q) ||
        article.author.toLowerCase().includes(q) ||
        article.slug.toLowerCase().includes(q) ||
        article.summary.toLowerCase().includes(q) ||
        article.tags.some((tg) => tg.toLowerCase().includes(q))
      );
    });

    const selectedCount = articles.filter((a) => a.selected).length;

    container.innerHTML = `
      <div class="space-y-8">
        <!-- Header Banner -->
        <div class="card-workbench p-6 sm:p-8 space-y-2">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent-subtle-border)] text-xs font-mono font-medium">
            <span>${icons.fileText}</span>
            <span>NIP-23 Long-Form Articles (Kind 30023)</span>
          </div>
          <h2 class="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-ink)]">${t('linkedinImporterTitle')}</h2>
          <p class="text-[var(--color-ink-muted)] text-xs sm:text-sm leading-relaxed max-w-3xl">${t('linkedinImporterSubtitle')}</p>
        </div>

        <!-- LinkedIn Export Guide Box -->
        <div class="bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-900/60 rounded-3xl p-5 shadow-xs">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-start gap-3">
              <div class="w-9 h-9 rounded-2xl bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                <i data-lucide="help-circle" class="w-4 h-4"></i>
              </div>
              <div class="space-y-1">
                <h4 class="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">${t('linkedinGuideTitle')}</h4>
                <p class="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                  ${t('linkedinGuideShort')}
                </p>
              </div>
            </div>
            <button id="btn-toggle-guide" class="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 underline shrink-0 cursor-pointer">
              ${showExportGuide ? t('hideInstructions') : t('showInstructions')}
            </button>
          </div>

          ${
            showExportGuide
              ? `
            <div class="mt-4 pt-4 border-t border-sky-200/60 dark:border-sky-900/40 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700 dark:text-slate-300">
              <div class="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-sky-100 dark:border-slate-800 space-y-1">
                <div class="font-bold text-sky-600 dark:text-sky-400">1. ${t('linkedinStep1Title')}</div>
                <p class="text-slate-500 dark:text-slate-400 text-[11px]">${t('linkedinStep1Desc')}</p>
              </div>
              <div class="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-sky-100 dark:border-slate-800 space-y-1">
                <div class="font-bold text-sky-600 dark:text-sky-400">2. ${t('linkedinStep2Title')}</div>
                <p class="text-slate-500 dark:text-slate-400 text-[11px]">${t('linkedinStep2Desc')}</p>
              </div>
              <div class="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-sky-100 dark:border-slate-800 space-y-1">
                <div class="font-bold text-sky-600 dark:text-sky-400">3. ${t('linkedinStep3Title')}</div>
                <p class="text-slate-500 dark:text-slate-400 text-[11px]">${t('linkedinStep3Desc')}</p>
              </div>
            </div>
          `
              : ''
          }
        </div>

        <!-- Resume Session Banner (if existing session found) -->
        ${
          existingSession && existingSession.phase === 'in-progress'
            ? `
          <div id="li-resume-banner" class="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 rounded-r-2xl p-5 shadow-sm space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold">⚡</span>
                  <h4 class="font-bold text-amber-900 dark:text-amber-200 text-base">${t('resumeBannerTitle')}</h4>
                </div>
                <p class="text-xs text-amber-800/80 dark:text-amber-300/80">
                  ${t('resumeBannerDescription', {
                    completed: existingSession.completedBookIds.length,
                    total: existingSession.totalBooks,
                  })}
                </p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <button id="btn-li-resume" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-600/20 cursor-pointer">
                  ${t('resumeBannerResume')}
                </button>
                <button id="btn-li-fresh" class="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer">
                  ${t('resumeBannerFresh')}
                </button>
              </div>
            </div>
          </div>
        `
            : ''
        }

        <!-- Dropzone / Upload Area -->
        ${
          articles.length === 0
            ? `
          <div id="li-dropzone" class="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 rounded-3xl p-10 sm:p-14 text-center bg-slate-50/50 dark:bg-slate-900/50 hover:bg-sky-50/30 transition-all cursor-pointer group">
            <input type="file" id="li-file-input" accept=".zip,.html,.htm,.csv" class="hidden" />
            <div class="max-w-md mx-auto space-y-4">
              <div class="w-16 h-16 mx-auto rounded-2xl bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-sky-500/10">
                <i data-lucide="upload-cloud" class="w-8 h-8"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">${t('linkedinDropzoneTitle')}</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${t('linkedinDropzoneSubtitle')}</p>
              </div>
              <div class="pt-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
                  <i data-lucide="file-code" class="w-3.5 h-3.5"></i>
                  ${t('linkedinDropzoneSupport')}
                </span>
              </div>
            </div>
          </div>
        `
            : ''
        }

        <!-- Loaded Data Preview Table & Controls -->
        ${
          articles.length > 0
            ? `
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <!-- Toolbar -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div class="flex items-center gap-3">
                <div class="px-3.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-bold text-sm">
                  ${articles.length} ${t('linkedinArticlesLoaded')}
                </div>
                <div class="text-xs text-slate-500 dark:text-slate-400">
                  ${t('selectedCount', { count: selectedCount, total: articles.length })}
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <!-- Search Input -->
                <div class="relative">
                  <i data-lucide="search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input type="text" id="li-search" placeholder="${t('searchPlaceholder')}" value="${searchQuery}" class="pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 w-48 sm:w-64 text-slate-900 dark:text-white" />
                </div>

                <!-- Select All / Deselect All -->
                <button id="li-btn-select-all" class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer">
                  ${t('selectAll')}
                </button>
                <button id="li-btn-deselect-all" class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer">
                  ${t('deselectAll')}
                </button>
                <button id="li-btn-reupload" class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer">
                  <i data-lucide="upload" class="w-3.5 h-3.5 inline mr-1"></i> ${t('changeFile')}
                </button>
              </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th class="py-3 px-3 w-10 text-center">
                      <input type="checkbox" id="li-toggle-all-cb" ${selectedCount === articles.length ? 'checked' : ''} class="rounded text-sky-600 focus:ring-sky-500" />
                    </th>
                    <th class="py-3 px-4">${t('colTitleAuthor')}</th>
                    <th class="py-3 px-4">${t('summary')}</th>
                    <th class="py-3 px-4">${t('tags')}</th>
                    <th class="py-3 px-4">${t('wpColMedia')}</th>
                    <th class="py-3 px-4 text-right">${t('publishedDate')}</th>
                    <th class="py-3 px-3 text-center w-12">${t('inspectRowEvent')}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  ${
                    filteredArticles.length === 0
                      ? `
                    <tr>
                      <td colspan="7" class="py-8 text-center text-slate-400">
                        ${t('noArticlesFound')}
                      </td>
                    </tr>
                  `
                      : filteredArticles
                          .map(
                            (a) => `
                    <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${a.selected ? '' : 'opacity-50'}">
                      <td class="py-3.5 px-3 text-center">
                        <input type="checkbox" class="li-article-cb rounded text-sky-600 focus:ring-sky-500" data-id="${a.id}" ${a.selected ? 'checked' : ''} />
                      </td>
                      <td class="py-3.5 px-4 max-w-xs">
                        <div class="font-bold text-slate-900 dark:text-white line-clamp-1">${a.title}</div>
                        <div class="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>${a.author}</span>
                          ${a.canonicalUrl ? `<a href="${a.canonicalUrl}" target="_blank" rel="noopener noreferrer" class="text-sky-600 hover:underline inline-flex items-center gap-0.5"><i data-lucide="external-link" class="w-3 h-3"></i></a>` : ''}
                        </div>
                      </td>
                      <td class="py-3.5 px-4 max-w-sm text-slate-600 dark:text-slate-300">
                        <p class="line-clamp-2 text-[11px]">${a.summary || '-'}</p>
                      </td>
                      <td class="py-3.5 px-4">
                        <div class="flex flex-wrap gap-1 max-w-xs">
                          ${a.tags.length > 0 ? a.tags.map((tg) => `<span class="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">#${tg}</span>`).join('') : '<span class="text-slate-400">-</span>'}
                        </div>
                      </td>
                      <td class="py-3.5 px-4">
                        <div class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                          <i data-lucide="image" class="w-3.5 h-3.5 text-slate-400"></i>
                          <span>${a.imageUrls.length + (a.coverImageUrl ? 1 : 0)}</span>
                        </div>
                      </td>
                      <td class="py-3.5 px-4 text-right font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        ${a.publishedDate}
                      </td>
                      <td class="py-3.5 px-3 text-center">
                        <button class="li-btn-preview-row p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-sky-900 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer" data-id="${a.id}" title="${t('inspectRowEvent')}">
                          <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                        </button>
                      </td>
                    </tr>
                  `
                          )
                          .join('')
                  }
                </tbody>
              </table>
            </div>
          </div>
        `
            : ''
        }

        <!-- Migration Options Card -->
        ${
          articles.length > 0
            ? `
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">${t('migrationOptionsTitle')}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${t('goodreadsTarget')}</p>
            </div>

            <div class="space-y-4">
              <!-- Blossom Uploads Option -->
              <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <label class="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" id="li-opt-blossom" ${uploadImagesToBlossom ? 'checked' : ''} class="mt-1 rounded text-sky-600 focus:ring-sky-500" />
                  <div class="space-y-0.5">
                    <div class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <i data-lucide="cloud" class="w-3.5 h-3.5 text-sky-500"></i>
                      ${t('wpOptBlossomTitle')}
                    </div>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">${t('wpOptBlossomDesc')}</p>
                  </div>
                </label>

                ${
                  uploadImagesToBlossom
                    ? `
                  <div class="pl-7 pt-1 space-y-1">
                    <label class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">${t('wpBlossomServersLabel')}</label>
                    <input type="text" id="li-blossom-servers" value="${blossomServersStr}" placeholder="https://blossom.primal.net, https://cdn.nostrcheck.me" class="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white" />
                  </div>
                `
                    : ''
                }
              </div>

              <!-- NIP-09 Clean Slate Deletion -->
              <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <label class="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" id="li-opt-delete" ${deletePreviousArticles ? 'checked' : ''} class="mt-1 rounded text-sky-600 focus:ring-sky-500" />
                  <div class="space-y-0.5">
                    <div class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <i data-lucide="trash-2" class="w-3.5 h-3.5 text-rose-500"></i>
                      ${t('wpOptDeleteTitle')}
                    </div>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">${t('wpOptDeleteDesc')}</p>
                  </div>
                </label>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button id="li-btn-dry-run" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer">
                <i data-lucide="code" class="w-4 h-4"></i>
                ${t('dryRunButton')}
              </button>

              <div class="flex items-center gap-3 w-full sm:w-auto">
                ${
                  progress.phase === 'signing' || progress.phase === 'broadcasting'
                    ? `
                  <button id="li-btn-pause" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer">
                    <i data-lucide="pause" class="w-4 h-4"></i>
                    ${t('pauseMigration')}
                  </button>
                  <button id="li-btn-cancel" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-rose-600/20 cursor-pointer">
                    <i data-lucide="x" class="w-4 h-4"></i>
                    ${t('cancelMigration')}
                  </button>
                `
                    : progress.phase === 'paused'
                    ? `
                  <button id="li-btn-resume-action" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer">
                    <i data-lucide="play" class="w-4 h-4"></i>
                    ${t('resumeMigration')}
                  </button>
                  <button id="li-btn-cancel" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-rose-600/20 cursor-pointer">
                    <i data-lucide="x" class="w-4 h-4"></i>
                    ${t('cancelMigration')}
                  </button>
                `
                    : `
                  <button id="li-btn-start" class="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-600/25 cursor-pointer">
                    <i data-lucide="send" class="w-4 h-4"></i>
                    ${t('startMigration')} (${selectedCount})
                  </button>
                `
                }
              </div>
            </div>
          </div>
        `
            : ''
        }

        <!-- Activity Log Console -->
        <div class="bg-slate-950 text-slate-200 rounded-3xl p-6 shadow-xl space-y-3 font-mono text-xs">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h4 class="font-bold text-slate-100">${t('activityLogTitle')}</h4>
            </div>
            <button id="btn-li-clear-logs" class="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer">
              ${t('clearLogs')}
            </button>
          </div>

          <div class="h-48 overflow-y-auto space-y-1.5 pr-2">
            ${
              logs.length === 0
                ? `<div class="text-slate-500 italic py-4 text-center">${t('noLogsYet')}</div>`
                : logs
                    .map(
                      (l) => `
                  <div class="flex items-start gap-2">
                    <span class="text-slate-500 text-[10px]">${l.timestamp.toLocaleTimeString()}</span>
                    <span class="${
                      l.level === 'success'
                        ? 'text-emerald-400'
                        : l.level === 'error'
                        ? 'text-rose-400'
                        : l.level === 'warning'
                        ? 'text-amber-400'
                        : 'text-sky-300'
                    }">${l.message}</span>
                  </div>
                `
                    )
                    .join('')
            }
          </div>
        </div>
      </div>
    `;

    // Reinitialize lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    bindEvents();
  };

  const bindEvents = () => {
    // 1. Toggle Instructions Guide
    const toggleGuideBtn = container.querySelector('#btn-toggle-guide');
    if (toggleGuideBtn) {
      toggleGuideBtn.addEventListener('click', () => {
        showExportGuide = !showExportGuide;
        render();
      });
    }

    // 2. Dropzone & File Upload
    const dropzone = container.querySelector('#li-dropzone') as HTMLElement | null;
    const fileInput = container.querySelector('#li-file-input') as HTMLInputElement | null;
    const reuploadBtn = container.querySelector('#li-btn-reupload');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      dropzone.addEventListener('dragover', (e: Event) => {
        const dragEvent = e as DragEvent;
        dragEvent.preventDefault();
        dropzone.classList.add('border-sky-500', 'bg-sky-50/40');
      });
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('border-sky-500', 'bg-sky-50/40');
      });
      dropzone.addEventListener('drop', async (e: Event) => {
        const dragEvent = e as DragEvent;
        dragEvent.preventDefault();
        dropzone.classList.remove('border-sky-500', 'bg-sky-50/40');
        if (dragEvent.dataTransfer && dragEvent.dataTransfer.files.length > 0) {
          const file = dragEvent.dataTransfer.files[0];
          await handleFileUpload(file);
        }
      });
      fileInput.addEventListener('change', async () => {
        if (fileInput.files && fileInput.files.length > 0) {
          const file = fileInput.files[0];
          await handleFileUpload(file);
        }
      });
    }

    if (reuploadBtn) {
      reuploadBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.zip,.html,.htm,.csv';
        input.onchange = async () => {
          if (input.files && input.files.length > 0) {
            await handleFileUpload(input.files[0]);
          }
        };
        input.click();
      });
    }

    // 3. Search & Filters
    const searchInput = container.querySelector('#li-search') as HTMLInputElement | null;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = (e.target as HTMLInputElement).value;
        render();
      });
    }

    // 4. Selection Toggles
    const selectAllBtn = container.querySelector('#li-btn-select-all');
    const deselectAllBtn = container.querySelector('#li-btn-deselect-all');
    const toggleAllCb = container.querySelector('#li-toggle-all-cb') as HTMLInputElement | null;

    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', () => {
        linkedInPipeline.selectAll(true);
      });
    }

    if (deselectAllBtn) {
      deselectAllBtn.addEventListener('click', () => {
        linkedInPipeline.selectAll(false);
      });
    }

    if (toggleAllCb) {
      toggleAllCb.addEventListener('change', () => {
        linkedInPipeline.selectAll(toggleAllCb.checked);
      });
    }

    container.querySelectorAll('.li-article-cb').forEach((cb) => {
      cb.addEventListener('change', (e) => {
        const el = e.target as HTMLInputElement;
        const id = el.getAttribute('data-id');
        if (id) {
          linkedInPipeline.toggleArticleSelection(id, el.checked);
        }
      });
    });

    // 5. Row Event Preview Modal
    container.querySelectorAll('.li-btn-preview-row').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (id) {
          const event = linkedInPipeline.generateSingleArticleEvent(id);
          const article = linkedInPipeline.getArticles().find((a) => a.id === id);
          if (event) {
            showDryRunModal({
              title: article ? article.title : 'Preview Event',
              events: [event],
            });
          }
        }
      });
    });

    // 6. Resume Session Controls
    const btnResume = container.querySelector('#btn-li-resume');
    const btnFresh = container.querySelector('#btn-li-fresh');

    if (btnResume) {
      btnResume.addEventListener('click', () => {
        useResumeSession = true;
        handleStartMigration();
      });
    }

    if (btnFresh) {
      btnFresh.addEventListener('click', () => {
        if (existingSession) {
          importSessionService.deleteSession(existingSession.sessionKey);
          existingSession = null;
        }
        useResumeSession = false;
        render();
      });
    }

    // 7. Migration Options
    const optBlossom = container.querySelector('#li-opt-blossom') as HTMLInputElement | null;
    const optDelete = container.querySelector('#li-opt-delete') as HTMLInputElement | null;
    const serversInput = container.querySelector('#li-blossom-servers') as HTMLInputElement | null;

    if (optBlossom) {
      optBlossom.addEventListener('change', () => {
        uploadImagesToBlossom = optBlossom.checked;
        render();
      });
    }

    if (optDelete) {
      optDelete.addEventListener('change', () => {
        deletePreviousArticles = optDelete.checked;
      });
    }

    if (serversInput) {
      serversInput.addEventListener('change', () => {
        blossomServersStr = serversInput.value;
      });
    }

    // 8. Migration Actions
    const btnDryRun = container.querySelector('#li-btn-dry-run');
    const btnStart = container.querySelector('#li-btn-start');
    const btnPause = container.querySelector('#li-btn-pause');
    const btnResumeAction = container.querySelector('#li-btn-resume-action');
    const btnCancel = container.querySelector('#li-btn-cancel');

    if (btnDryRun) {
      btnDryRun.addEventListener('click', () => {
        const events = linkedInPipeline.generateUnsignedEvents();
        showDryRunModal({
          title: i18n.t('linkedinImporterTitle'),
          events,
          onProceed: () => {
            handleStartMigration();
          },
        });
      });
    }

    if (btnStart) {
      btnStart.addEventListener('click', () => {
        handleStartMigration();
      });
    }

    if (btnPause) {
      btnPause.addEventListener('click', () => {
        linkedInPipeline.pauseMigration();
      });
    }

    if (btnResumeAction) {
      btnResumeAction.addEventListener('click', () => {
        linkedInPipeline.resumeMigration();
      });
    }

    if (btnCancel) {
      btnCancel.addEventListener('click', () => {
        linkedInPipeline.cancelMigration();
      });
    }

    const btnClearLogs = container.querySelector('#btn-li-clear-logs');
    if (btnClearLogs) {
      btnClearLogs.addEventListener('click', () => {
        linkedInPipeline.reset();
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      await linkedInPipeline.loadFile(file);
    } catch (err) {
      console.error('File load failed:', err);
    }
  };

  const handleStartMigration = async () => {
    const servers = blossomServersStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const options: LinkedInMigrationOptions = {
      generateKind30023: true,
      uploadImagesToBlossom,
      blossomServers: servers.length > 0 ? servers : DEFAULT_BLOSSOM_SERVERS,
      deletePreviousArticlesBeforeImport: deletePreviousArticles,
      publishToCustomRelaysOnly: false,
      resumeSession: useResumeSession && existingSession ? existingSession : undefined,
    };

    await linkedInPipeline.startMigration(options);
  };

  // Subscribe to pipeline updates
  linkedInPipeline.onArticlesChange((newArticles) => {
    articles = newArticles;
    render();
  });

  linkedInPipeline.onProgress((newProgress) => {
    progress = newProgress;
    render();
  });

  linkedInPipeline.onLog(() => {
    logs = linkedInPipeline.getLogs();
    render();
  });

  render();
}
