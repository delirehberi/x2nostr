import { wordPressPipeline } from '../../importers/wordpress/pipeline';
import { DEFAULT_BLOSSOM_SERVERS } from '../../services/blossom';
import { i18n, t } from '../../services/i18n';
import { importSessionService } from '../../services/import-session';
import { nostrService } from '../../services/nostr';
import { ImportSession, WordPressMigrationOptions } from '../../types';
import { showDryRunModal } from './modal';
import { icons } from '../icons';

declare global {
  interface Window {
    lucide?: {
      createIcons(): void;
    };
  }
}

export function renderWordPressView(container: HTMLElement): void {
  let posts = wordPressPipeline.getPosts();
  let progress = wordPressPipeline.getProgress();
  let logs = wordPressPipeline.getLogs();
  let activeFilter: 'all' | 'publish' | 'draft' = 'all';
  let searchQuery = '';

  // Options state
  let uploadImagesToBlossom = true;
  let blossomServersStr = DEFAULT_BLOSSOM_SERVERS.join(', ');
  let deletePreviousPosts = false;

  // Session state
  let existingSession: ImportSession | null = null;
  let useResumeSession = false;

  const updateSessionState = () => {
    const pubkey = nostrService.getPubkey();
    const fingerprint = wordPressPipeline.getFingerprint();
    if (pubkey && fingerprint) {
      existingSession = importSessionService.findSession('wordpress', pubkey, fingerprint);
    } else {
      existingSession = null;
    }
  };

  const render = () => {
    updateSessionState();
    const t = (key: Parameters<typeof i18n.t>[0], params?: Record<string, string | number>) => i18n.t(key, params);

    const filteredPosts = posts.filter((post) => {
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'publish' && post.status === 'publish') ||
        (activeFilter === 'draft' && post.status === 'draft');

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.author.toLowerCase().includes(q) ||
        post.categories.some((c) => c.toLowerCase().includes(q)) ||
        post.tags.some((tg) => tg.toLowerCase().includes(q));

      return matchesFilter && matchesSearch;
    });

    const selectedCount = posts.filter((p) => p.selected).length;

    container.innerHTML = `
      <div class="space-y-8">
        <!-- Header Banner -->
        <div class="card-workbench p-6 sm:p-8 space-y-2">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent-subtle-border)] text-xs font-mono font-medium">
            <span>${icons.fileText}</span>
            <span>NIP-23 Long-Form Articles (Kind 30023)</span>
          </div>
          <h2 class="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-ink)]">${t('wpImporterTitle')}</h2>
          <p class="text-[var(--color-ink-muted)] text-xs sm:text-sm leading-relaxed max-w-3xl">${t('wpImporterSubtitle')}</p>
        </div>

        <!-- Real-Time Auto-Sync Recommendation Banner -->
        <div class="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-start gap-3">
            <div class="w-9 h-9 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <i data-lucide="refresh-cw" class="w-4 h-4"></i>
            </div>
            <div class="space-y-0.5">
              <h4 class="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">${t('wpSyncTipTitle')}</h4>
              <p class="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                ${t('wpSyncTipDesc', {
                  link: `<a href="https://wordpress.org/plugins/postr-for-nostr/" target="_blank" rel="noopener noreferrer" class="font-bold text-blue-600 dark:text-blue-400 underline hover:text-blue-700 inline-flex items-center gap-1">${t('postrPluginName')} <i data-lucide="external-link" class="w-3 h-3"></i></a>`
                })}
              </p>
            </div>
          </div>
        </div>

        <!-- Resume Session Banner (if existing session found) -->
        ${
          existingSession && existingSession.phase === 'in-progress'
            ? `
          <div id="wp-resume-banner" class="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 rounded-r-2xl p-5 shadow-sm space-y-3">
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
                <button id="btn-wp-resume" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-600/20">
                  ${t('resumeBannerResume')}
                </button>
                <button id="btn-wp-fresh" class="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all">
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
          posts.length === 0
            ? `
          <div id="wp-dropzone" class="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-3xl p-10 sm:p-14 text-center bg-slate-50/50 dark:bg-slate-900/50 hover:bg-blue-50/30 transition-all cursor-pointer group">
            <input type="file" id="wp-file-input" accept=".xml,.wxr" class="hidden" />
            <div class="max-w-md mx-auto space-y-4">
              <div class="w-16 h-16 mx-auto rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-blue-500/10">
                <i data-lucide="upload-cloud" class="w-8 h-8"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">${t('wpDropzoneTitle')}</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${t('wpDropzoneSubtitle')}</p>
              </div>
              <div class="pt-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
                  <i data-lucide="file-code" class="w-3.5 h-3.5"></i>
                  ${t('wpDropzoneSupport')}
                </span>
              </div>
            </div>
          </div>
        `
            : ''
        }

        <!-- Loaded Data Preview Table & Controls -->
        ${
          posts.length > 0
            ? `
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <!-- Toolbar -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div class="flex items-center gap-3">
                <div class="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold text-sm">
                  ${posts.length} ${t('wpPostsLoaded')}
                </div>
                <div class="text-xs text-slate-500 dark:text-slate-400">
                  ${t('selectedCount', { count: selectedCount, total: posts.length })}
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <!-- Filters -->
                <div class="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
                  <button class="wp-filter-btn px-3 py-1.5 rounded-lg ${activeFilter === 'all' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400'}" data-filter="all">
                    ${t('filterAll')}
                  </button>
                  <button class="wp-filter-btn px-3 py-1.5 rounded-lg ${activeFilter === 'publish' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400'}" data-filter="publish">
                    ${t('wpFilterPublished')}
                  </button>
                  <button class="wp-filter-btn px-3 py-1.5 rounded-lg ${activeFilter === 'draft' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400'}" data-filter="draft">
                    ${t('wpFilterDrafts')}
                  </button>
                </div>

                <!-- Search Input -->
                <div class="relative">
                  <i data-lucide="search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input type="text" id="wp-search" placeholder="${t('searchPlaceholder')}" value="${searchQuery}" class="pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-44 sm:w-60 text-slate-900 dark:text-white" />
                </div>

                <!-- Select All / Deselect All -->
                <button id="wp-btn-select-all" class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all">
                  ${t('selectAll')}
                </button>
                <button id="wp-btn-deselect-all" class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all">
                  ${t('deselectAll')}
                </button>
              </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th class="py-3 px-3 w-10 text-center">
                      <input type="checkbox" id="wp-toggle-all-cb" ${selectedCount === posts.length ? 'checked' : ''} class="rounded text-blue-600 focus:ring-blue-500" />
                    </th>
                    <th class="py-3 px-4">${t('colTitleAuthor')}</th>
                    <th class="py-3 px-4">${t('wpColCategories')}</th>
                    <th class="py-3 px-4">${t('colType')}</th>
                    <th class="py-3 px-4">${t('wpColMedia')}</th>
                    <th class="py-3 px-4 text-right">${t('colDateRead')}</th>
                    <th class="py-3 px-3 text-center w-12">${t('inspectRowEvent')}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  ${
                    filteredPosts.length === 0
                      ? `
                    <tr>
                      <td colspan="7" class="py-8 text-center text-slate-400">
                        ${t('noBooksFound')}
                      </td>
                    </tr>
                  `
                      : filteredPosts
                          .map(
                            (p) => `
                    <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${p.selected ? '' : 'opacity-50'}">
                      <td class="py-3.5 px-3 text-center">
                        <input type="checkbox" class="wp-post-cb rounded text-blue-600 focus:ring-blue-500" data-id="${p.id}" ${p.selected ? 'checked' : ''} />
                      </td>
                      <td class="py-3.5 px-4">
                        <div class="font-bold text-slate-900 dark:text-white line-clamp-1">${p.title}</div>
                        <div class="text-[11px] text-slate-500 dark:text-slate-400">by ${p.author} &bull; <span class="font-mono text-slate-400">${p.slug}</span></div>
                      </td>
                      <td class="py-3.5 px-4">
                        <div class="flex flex-wrap gap-1">
                          ${p.categories.map((c) => `<span class="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium text-[10px]">${c}</span>`).join('')}
                          ${p.tags.map((tg) => `<span class="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">#${tg}</span>`).join('')}
                        </div>
                      </td>
                      <td class="py-3.5 px-4">
                        <span class="px-2 py-0.5 rounded-md font-semibold text-[10px] ${p.status === 'publish' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'}">
                          ${p.status.toUpperCase()}
                        </span>
                      </td>
                      <td class="py-3.5 px-4">
                        <div class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                          <i data-lucide="image" class="w-3.5 h-3.5 text-slate-400"></i>
                          <span>${p.imageUrls.length + (p.featuredImageUrl ? 1 : 0)} images</span>
                        </div>
                      </td>
                      <td class="py-3.5 px-4 text-right font-mono text-slate-500 dark:text-slate-400">
                        ${p.publishedDate}
                      </td>
                      <td class="py-3.5 px-3 text-center">
                        <button class="wp-btn-preview-row p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer" data-id="${p.id}" title="${t('inspectRowEvent')}">
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

        <!-- Migration Settings Panel -->
        ${
          posts.length > 0
            ? `
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <i data-lucide="sliders" class="w-4 h-4 text-blue-500"></i>
              ${t('migrationOptionsTitle')}
            </h3>

            <div class="space-y-4 text-xs">
              <!-- Blossom Media Upload Option -->
              <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
                <label class="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" id="wp-opt-blossom" ${uploadImagesToBlossom ? 'checked' : ''} class="mt-0.5 rounded text-blue-600 focus:ring-blue-500" />
                  <div class="space-y-0.5">
                    <span class="font-bold text-slate-900 dark:text-white text-xs">${t('wpOptBlossomTitle')}</span>
                    <p class="text-slate-500 dark:text-slate-400 text-[11px]">${t('wpOptBlossomDesc')}</p>
                  </div>
                </label>

                ${
                  uploadImagesToBlossom
                    ? `
                  <div class="pt-2 space-y-1">
                    <label class="block font-medium text-slate-700 dark:text-slate-300 text-[11px]">${t('wpBlossomServersLabel')}</label>
                    <input type="text" id="wp-blossom-servers" value="${blossomServersStr}" placeholder="https://blossom.primal.net, https://cdn.nostr.build" class="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                `
                    : ''
                }
              </div>

              <!-- Delete Previous Posts (NIP-09) -->
              <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <label class="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" id="wp-opt-delete" ${deletePreviousPosts ? 'checked' : ''} class="mt-0.5 rounded text-blue-600 focus:ring-blue-500" />
                  <div class="space-y-0.5">
                    <span class="font-bold text-slate-900 dark:text-white text-xs">${t('wpOptDeleteTitle')}</span>
                    <p class="text-slate-500 dark:text-slate-400 text-[11px]">${t('wpOptDeleteDesc')}</p>
                  </div>
                </label>
              </div>
            </div>

            <!-- Migration Actions -->
            <div class="pt-4 flex flex-wrap items-center gap-3">
              ${
                progress.phase === 'idle' || progress.phase === 'completed' || progress.phase === 'error'
                  ? `
                <button id="btn-wp-start" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer">
                  <i data-lucide="rocket" class="w-4 h-4"></i>
                  ${t('startMigration')}
                </button>
                <button id="btn-wp-dryrun" class="px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-2xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs">
                  <i data-lucide="eye" class="w-4 h-4 text-blue-500"></i>
                  ${t('dryRunButton')}
                </button>
              `
                  : ''
              }

              ${
                progress.phase === 'broadcasting' || progress.phase === 'resolving' || progress.phase === 'signing'
                  ? `
                <button id="btn-wp-pause" class="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2">
                  <i data-lucide="pause" class="w-4 h-4"></i>
                  ${t('pauseMigration')}
                </button>
              `
                  : ''
              }

              ${
                progress.phase === 'paused'
                  ? `
                <button id="btn-wp-resume-active" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2">
                  <i data-lucide="play" class="w-4 h-4"></i>
                  ${t('resumeMigration')}
                </button>
              `
                  : ''
              }

              ${
                progress.phase !== 'idle' && progress.phase !== 'completed' && progress.phase !== 'error'
                  ? `
                <button id="btn-wp-cancel" class="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all">
                  ${t('cancelMigration')}
                </button>
              `
                  : ''
              }
            </div>
          </div>
        `
            : ''
        }

        <!-- Progress Bar & Status -->
        ${
          progress.phase !== 'idle'
            ? `
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Phase: <span class="text-blue-600 dark:text-blue-400">${progress.phase}</span>
              </span>
              <span class="font-mono text-slate-500 dark:text-slate-400">${progress.percentage}%</span>
            </div>

            <div class="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <div class="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-300" style="width: ${progress.percentage}%"></div>
            </div>

            ${
              progress.currentTitle
                ? `
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
                ${t('currentlyProcessing', { title: progress.currentTitle })}
              </p>
            `
                : ''
            }
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
            <button id="btn-wp-clear-logs" class="text-[11px] text-slate-400 hover:text-white transition-colors">
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
                        : 'text-blue-300'
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

    // Re-initialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Attach Event Listeners
    attachEventListeners();
  };

  const attachEventListeners = () => {
    // Dropzone events
    const dropzone = container.querySelector('#wp-dropzone');
    const fileInput = container.querySelector('#wp-file-input') as HTMLInputElement | null;

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('border-blue-500');
      });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('border-blue-500'));
      dropzone.addEventListener('drop', (e: Event) => {
        const dragEvt = e as DragEvent;
        dragEvt.preventDefault();
        dropzone.classList.remove('border-blue-500');
        if (dragEvt.dataTransfer?.files && dragEvt.dataTransfer.files[0]) {
          wordPressPipeline.loadXml(dragEvt.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files[0]) {
          wordPressPipeline.loadXml(fileInput.files[0]);
        }
      });
    }

    // Filters
    container.querySelectorAll('.wp-filter-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const filter = (e.currentTarget as HTMLElement).getAttribute('data-filter') as 'all' | 'publish' | 'draft';
        activeFilter = filter;
        render();
      });
    });

    // Search
    const searchInput = container.querySelector('#wp-search') as HTMLInputElement | null;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = (e.target as HTMLInputElement).value;
        render();
      });
    }

    // Checkboxes
    container.querySelectorAll('.wp-post-cb').forEach((cb) => {
      cb.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        const id = target.getAttribute('data-id');
        if (id) {
          wordPressPipeline.togglePostSelection(id, target.checked);
        }
      });
    });

    const toggleAllCb = container.querySelector('#wp-toggle-all-cb') as HTMLInputElement | null;
    if (toggleAllCb) {
      toggleAllCb.addEventListener('change', () => {
        wordPressPipeline.selectAll(toggleAllCb.checked, activeFilter);
      });
    }

    container.querySelector('#wp-btn-select-all')?.addEventListener('click', () => wordPressPipeline.selectAll(true, activeFilter));
    container.querySelector('#wp-btn-deselect-all')?.addEventListener('click', () => wordPressPipeline.selectAll(false, activeFilter));

    // Options inputs
    const blossomCb = container.querySelector('#wp-opt-blossom') as HTMLInputElement | null;
    if (blossomCb) {
      blossomCb.addEventListener('change', () => {
        uploadImagesToBlossom = blossomCb.checked;
        render();
      });
    }

    const blossomServersInput = container.querySelector('#wp-blossom-servers') as HTMLInputElement | null;
    if (blossomServersInput) {
      blossomServersInput.addEventListener('input', () => {
        blossomServersStr = blossomServersInput.value;
      });
    }

    const deleteCb = container.querySelector('#wp-opt-delete') as HTMLInputElement | null;
    if (deleteCb) {
      deleteCb.addEventListener('change', () => {
        deletePreviousPosts = deleteCb.checked;
      });
    }

    // Row-level event preview
    container.querySelectorAll('.wp-btn-preview-row').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        if (id) {
          const event = wordPressPipeline.generateSinglePostEvent(id);
          const post = wordPressPipeline.getPosts().find((p) => p.id === id);
          if (event) {
            showDryRunModal({
              title: post ? post.title : 'Preview Event',
              events: [event],
            });
          }
        }
      });
    });

    // Action buttons
    container.querySelector('#btn-wp-dryrun')?.addEventListener('click', () => {
      const servers = blossomServersStr
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const options: WordPressMigrationOptions = {
        generateKind30023: true,
        uploadImagesToBlossom,
        blossomServers: servers.length > 0 ? servers : DEFAULT_BLOSSOM_SERVERS,
        includeDrafts: activeFilter === 'draft',
        deletePreviousPostsBeforeImport: deletePreviousPosts,
        publishToCustomRelaysOnly: false,
      };

      const events = wordPressPipeline.generateUnsignedEvents(options);
      showDryRunModal({
        title: t('wpImporterTitle'),
        events,
        onProceed: () => {
          wordPressPipeline.startMigration({
            ...options,
            resumeSession: useResumeSession && existingSession ? existingSession : undefined,
          });
        },
      });
    });

    container.querySelector('#btn-wp-start')?.addEventListener('click', () => {
      const servers = blossomServersStr
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const options: WordPressMigrationOptions = {
        generateKind30023: true,
        uploadImagesToBlossom,
        blossomServers: servers.length > 0 ? servers : DEFAULT_BLOSSOM_SERVERS,
        includeDrafts: activeFilter === 'draft',
        deletePreviousPostsBeforeImport: deletePreviousPosts,
        publishToCustomRelaysOnly: false,
        resumeSession: useResumeSession && existingSession ? existingSession : undefined,
      };

      wordPressPipeline.startMigration(options);
    });

    container.querySelector('#btn-wp-pause')?.addEventListener('click', () => wordPressPipeline.pause());
    container.querySelector('#btn-wp-resume-active')?.addEventListener('click', () => wordPressPipeline.resume());
    container.querySelector('#btn-wp-cancel')?.addEventListener('click', () => wordPressPipeline.cancel());
    container.querySelector('#btn-wp-clear-logs')?.addEventListener('click', () => wordPressPipeline.clearLogs());

    // Resume Session Banner buttons
    container.querySelector('#btn-wp-resume')?.addEventListener('click', () => {
      useResumeSession = true;
      const servers = blossomServersStr
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const options: WordPressMigrationOptions = {
        generateKind30023: true,
        uploadImagesToBlossom,
        blossomServers: servers.length > 0 ? servers : DEFAULT_BLOSSOM_SERVERS,
        includeDrafts: activeFilter === 'draft',
        deletePreviousPostsBeforeImport: deletePreviousPosts,
        publishToCustomRelaysOnly: false,
        resumeSession: existingSession || undefined,
      };
      wordPressPipeline.startMigration(options);
    });

    container.querySelector('#btn-wp-fresh')?.addEventListener('click', () => {
      useResumeSession = false;
      existingSession = null;
      render();
    });
  };

  // Subscribe to pipeline events
  wordPressPipeline.onPostsChange((newPosts) => {
    posts = newPosts;
    render();
  });

  wordPressPipeline.onProgress((newProgress) => {
    progress = newProgress;
    render();
  });

  wordPressPipeline.onLog(() => {
    logs = wordPressPipeline.getLogs();
    render();
  });

  render();
}
