import { gistPipeline } from '../../importers/gists/pipeline';
import { gitHubService } from '../../importers/gists/github-service';
import { i18n } from '../../services/i18n';
import { importSessionService } from '../../services/import-session';
import { nostrService } from '../../services/nostr';
import { GistFilterCategory, GistMigrationOptions, GistSnippetRecord, ImportSession } from '../../types';

declare global {
  interface Window {
    lucide?: {
      createIcons(): void;
    };
  }
}

export function renderGistsView(container: HTMLElement): void {
  let snippets = gistPipeline.getSnippets();
  let progress = gistPipeline.getProgress();
  let logs = gistPipeline.getLogs();

  let activeTab: 'github' | 'upload' = 'github';
  let activeFilter: GistFilterCategory = 'all';
  let selectedLanguageFilter = 'all';
  let searchQuery = '';

  // Form input state
  let githubInput = '';
  let githubToken = '';
  let isFetchingGitHub = false;

  // Options state
  let generateKind1337 = true;
  let encryptPrivateGists = true;
  let defaultLicense = 'MIT';
  let defaultRuntime = '';
  let deletePreviousSnippets = false;

  // Code preview modal state
  let previewSnippet: GistSnippetRecord | null = null;

  // Session state
  let existingSession: ImportSession | null = null;
  let useResumeSession = false;

  const updateSessionState = () => {
    const pubkey = nostrService.getPubkey();
    const fingerprint = gistPipeline.getFingerprint();
    if (pubkey && fingerprint) {
      existingSession = importSessionService.findSession('gists', pubkey, fingerprint);
    } else {
      existingSession = null;
    }
  };

  const render = () => {
    updateSessionState();
    const t = (key: Parameters<typeof i18n.t>[0], params?: Record<string, string | number>) => i18n.t(key, params);

    // Available languages for filter dropdown
    const availableLanguages = Array.from(new Set(snippets.map((s) => s.language).filter(Boolean))).sort();

    const filteredSnippets = snippets.filter((snippet) => {
      let matchesCategory = true;
      if (activeFilter === 'public') matchesCategory = snippet.isPublic;
      if (activeFilter === 'secret') matchesCategory = !snippet.isPublic;

      let matchesLang = true;
      if (selectedLanguageFilter !== 'all') {
        matchesLang = snippet.language.toLowerCase() === selectedLanguageFilter.toLowerCase();
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        snippet.name.toLowerCase().includes(q) ||
        snippet.language.toLowerCase().includes(q) ||
        snippet.description.toLowerCase().includes(q) ||
        (snippet.tags && snippet.tags.some((tg) => tg.toLowerCase().includes(q)));

      return matchesCategory && matchesLang && matchesSearch;
    });

    const selectedCount = snippets.filter((s) => s.selected).length;
    const rateLimit = gitHubService.getLastRateLimit();

    container.innerHTML = `
      <div class="space-y-8">
        <!-- Header Banner -->
        <div class="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <div class="max-w-3xl space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
              <i data-lucide="code" class="w-3.5 h-3.5"></i>
              NIP-C0 (Kind 1337) & NIP-44 Encrypted (Kind 30078)
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">${t('gistsImporterTitle')}</h2>
            <p class="text-slate-300 text-sm leading-relaxed">${t('gistsImporterSubtitle')}</p>
          </div>
        </div>

        <!-- 3-Step Wizard Roadmap -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
            <div class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">${t('gistsStep1Title')}</div>
            <p class="text-xs text-slate-600 dark:text-slate-300">${t('gistsStep1Desc')}</p>
          </div>
          <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
            <div class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">${t('gistsStep2Title')}</div>
            <p class="text-xs text-slate-600 dark:text-slate-300">${t('gistsStep2Desc')}</p>
          </div>
          <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
            <div class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">${t('gistsStep3Title')}</div>
            <p class="text-xs text-slate-600 dark:text-slate-300">${t('gistsStep3Desc')}</p>
          </div>
        </div>

        <!-- Secret Gists API Notice Callout -->
        <div class="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-start gap-3">
            <div class="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <i data-lucide="shield-alert" class="w-4 h-4"></i>
            </div>
            <div class="space-y-0.5">
              <h4 class="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                ${t('secretGistsNoticeTitle')}
              </h4>
              <p class="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                ${t('secretGistsNoticeDesc')}
              </p>
            </div>
          </div>
        </div>

        <!-- Ingestion Mode Selector Tabs -->
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
          <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-4">
            <button
              id="tab-btn-github"
              class="px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'github'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }"
            >
              <i data-lucide="github" class="w-4 h-4"></i>
              ${t('gistsFetchTab')}
            </button>
            <button
              id="tab-btn-upload"
              class="px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }"
            >
              <i data-lucide="upload-cloud" class="w-4 h-4"></i>
              ${t('gistsUploadTab')}
            </button>
          </div>

          <!-- Tab 1: GitHub API Form -->
          <div id="tab-content-github" class="${activeTab === 'github' ? 'block' : 'hidden'} space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  ${t('githubUsernameLabel')}
                </label>
                <div class="relative">
                  <input
                    type="text"
                    id="github-username-input"
                    value="${githubInput}"
                    placeholder="${t('githubUsernamePlaceholder')}"
                    class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  ${t('githubTokenLabel')}
                </label>
                <div class="relative">
                  <input
                    type="password"
                    id="github-token-input"
                    value="${githubToken}"
                    placeholder="${t('githubTokenPlaceholder')}"
                    class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                ${
                  rateLimit
                    ? `
                  <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 text-xs font-mono">
                    <i data-lucide="gauge" class="w-3.5 h-3.5 text-emerald-500"></i>
                    ${t('rateLimitRemaining', {
                      remaining: rateLimit.remaining,
                      limit: rateLimit.limit,
                      time: rateLimit.resetTime.toLocaleTimeString(),
                    })}
                  </div>
                `
                    : ''
                }
              </div>

              <button
                id="btn-fetch-github"
                ${isFetchingGitHub ? 'disabled' : ''}
                class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                ${
                  isFetchingGitHub
                    ? `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> ${t('githubFetching')}`
                    : `<i data-lucide="download" class="w-4 h-4"></i> ${t('githubFetchBtn')}`
                }
              </button>
            </div>
          </div>

          <!-- Tab 2: Upload Dropzone -->
          <div id="tab-content-upload" class="${activeTab === 'upload' ? 'block' : 'hidden'}">
            <div
              id="gists-dropzone"
              class="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-2xl p-8 text-center transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-900/30 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20"
            >
              <input
                type="file"
                id="gists-file-input"
                multiple
                accept=".js,.ts,.jsx,.tsx,.py,.rs,.go,.c,.cpp,.h,.hpp,.rb,.php,.sh,.bash,.zsh,.json,.yaml,.yml,.toml,.xml,.sql,.md,.txt,.env,.dockerfile,.makefile"
                class="hidden"
              />
              <div class="flex flex-col items-center gap-3">
                <div class="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <i data-lucide="upload-cloud" class="w-6 h-6"></i>
                </div>
                <div>
                  <h4 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base">${t('gistsDropzoneTitle')}</h4>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${t('gistsDropzoneSubtitle')}</p>
                </div>
                <div class="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                  ${t('gistsDropzoneSupport')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Resume Session Banner (if existing session found) -->
        ${
          existingSession && existingSession.phase === 'in-progress'
            ? `
          <div id="gists-resume-banner" class="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 rounded-r-2xl p-5 shadow-sm space-y-3">
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-1">
                <h4 class="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <i data-lucide="history" class="w-4 h-4 text-amber-600"></i>
                  ${t('resumeBannerTitle')}
                </h4>
                <p class="text-xs text-slate-600 dark:text-slate-300">
                  ${t('gistsResumeBannerDescription', {
                    completed: existingSession.completedBookIds.length,
                    total: existingSession.totalBooks,
                  })}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  id="btn-resume-session"
                  class="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <i data-lucide="play" class="w-3.5 h-3.5"></i>
                  ${t('resumeBannerResume')}
                </button>
                <button
                  id="btn-fresh-session"
                  class="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  ${t('resumeBannerFresh')}
                </button>
              </div>
            </div>
          </div>
        `
            : ''
        }

        <!-- Snippets Table & Preview Section -->
        ${
          snippets.length > 0
            ? `
          <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="flex flex-wrap items-center gap-2">
                <button
                  id="filter-cat-all"
                  class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    activeFilter === 'all'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }"
                >
                  ${t('filterAll')} (${snippets.length})
                </button>
                <button
                  id="filter-cat-public"
                  class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    activeFilter === 'public'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }"
                >
                  🌐 ${t('filterPublic')} (${snippets.filter((s) => s.isPublic).length})
                </button>
                <button
                  id="filter-cat-secret"
                  class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    activeFilter === 'secret'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }"
                >
                  🔒 ${t('filterSecret')} (${snippets.filter((s) => !s.isPublic).length})
                </button>

                <!-- Language Filter Dropdown -->
                ${
                  availableLanguages.length > 0
                    ? `
                  <select
                    id="filter-lang-select"
                    class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 focus:outline-hidden"
                  >
                    <option value="all" ${selectedLanguageFilter === 'all' ? 'selected' : ''}>All Languages</option>
                    ${availableLanguages
                      .map(
                        (lang) =>
                          `<option value="${lang}" ${selectedLanguageFilter === lang ? 'selected' : ''}>${lang}</option>`
                      )
                      .join('')}
                  </select>
                `
                    : ''
                }
              </div>

              <!-- Search & Selection Controls -->
              <div class="flex flex-wrap items-center gap-2">
                <div class="relative w-full sm:w-56">
                  <i data-lucide="search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input
                    type="text"
                    id="search-input"
                    value="${searchQuery}"
                    placeholder="${t('searchPlaceholder')}"
                    class="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <button
                  id="btn-select-all"
                  class="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0 cursor-pointer"
                >
                  ${t('selectAll')}
                </button>
                <button
                  id="btn-deselect-all"
                  class="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0 cursor-pointer"
                >
                  ${t('deselectAll')}
                </button>
                <button
                  id="btn-mark-secret"
                  class="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/60 shrink-0 cursor-pointer"
                  title="${t('markAsSecret')}"
                >
                  🔒 ${t('markAsSecret')}
                </button>
                <button
                  id="btn-mark-public"
                  class="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 shrink-0 cursor-pointer"
                  title="${t('markAsPublic')}"
                >
                  🌐 ${t('markAsPublic')}
                </button>
              </div>
            </div>

            <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">
              ${t('selectedCount', { count: selectedCount, total: snippets.length })}
            </div>

            <!-- Snippets Table -->
            <div class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">
                  <tr>
                    <th class="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        id="table-select-all-checkbox"
                        ${filteredSnippets.length > 0 && filteredSnippets.every((s) => s.selected) ? 'checked' : ''}
                        class="rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </th>
                    <th class="p-3">${t('colSnippetName')}</th>
                    <th class="p-3">${t('colLanguage')}</th>
                    <th class="p-3">${t('colPrivacy')}</th>
                    <th class="p-3">${t('colSize')}</th>
                    <th class="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
                  ${
                    filteredSnippets.length === 0
                      ? `
                    <tr>
                      <td colspan="6" class="p-8 text-center text-slate-400 italic">
                        ${t('noSnippetsFound')}
                      </td>
                    </tr>
                  `
                      : filteredSnippets
                          .map(
                            (snippet) => `
                    <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors ${
                      snippet.selected ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                    }">
                      <td class="p-3 text-center">
                        <input
                          type="checkbox"
                          data-snippet-id="${snippet.id}"
                          class="snippet-checkbox rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          ${snippet.selected ? 'checked' : ''}
                        />
                      </td>
                      <td class="p-3">
                        <div class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <i data-lucide="file-code" class="w-4 h-4 text-slate-400 shrink-0"></i>
                          <span>${snippet.name}</span>
                        </div>
                        ${
                          snippet.description
                            ? `<p class="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-md mt-0.5">${snippet.description}</p>`
                            : ''
                        }
                      </td>
                      <td class="p-3">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-700 text-emerald-700 dark:text-emerald-400">
                          ${snippet.language}
                        </span>
                      </td>
                      <td class="p-3">
                        <button
                          data-toggle-privacy-id="${snippet.id}"
                          class="btn-toggle-privacy inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                            snippet.isPublic
                              ? 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300'
                              : 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300'
                          }"
                          title="Click to toggle between Public (NIP-C0) and Secret (NIP-44 Encrypted)"
                        >
                          ${snippet.isPublic ? `🌐 ${t('badgePublic')}` : `🔒 ${t('badgeSecret')}`}
                          <i data-lucide="refresh-cw" class="w-3 h-3 opacity-60"></i>
                        </button>
                      </td>
                      <td class="p-3 font-mono text-slate-500 dark:text-slate-400">
                        ${Math.round(snippet.sizeBytes / 1024) || 1} KB
                      </td>
                      <td class="p-3 text-right">
                        <div class="inline-flex items-center gap-2">
                          ${
                            snippet.repoUrl
                              ? `
                            <a
                              href="${snippet.repoUrl}"
                              target="_blank"
                              rel="noopener noreferrer"
                              class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                              title="Open original Gist"
                            >
                              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                            </a>
                          `
                              : ''
                          }
                          <button
                            data-preview-id="${snippet.id}"
                            class="btn-preview-snippet px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 font-semibold text-[11px] transition-colors cursor-pointer"
                          >
                            ${t('previewCode')}
                          </button>
                        </div>
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

          <!-- Migration Settings Card -->
          <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <i data-lucide="settings" class="w-4 h-4 text-emerald-500"></i>
              ${t('migrationOptionsTitle')}
            </h3>

            <div class="space-y-4">
              <!-- Public Kind 1337 Toggle -->
              <label class="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="opt-generate-kind1337"
                  class="mt-1 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  ${generateKind1337 ? 'checked' : ''}
                />
                <div>
                  <div class="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    ${t('optGenerateKind1337')}
                  </div>
                  <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    ${t('optGenerateKind1337Desc')}
                  </div>
                </div>
              </label>

              <!-- Encrypt Private Gists Toggle -->
              <label class="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="opt-encrypt-private"
                  class="mt-1 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  ${encryptPrivateGists ? 'checked' : ''}
                />
                <div>
                  <div class="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                    <i data-lucide="shield" class="w-3.5 h-3.5 text-amber-500"></i>
                    ${t('optEncryptPrivate')}
                  </div>
                  <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    ${t('optEncryptPrivateDesc')}
                  </div>
                </div>
              </label>

              <!-- License & Runtime Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    ${t('optDefaultLicense')}
                  </label>
                  <select
                    id="opt-default-license"
                    class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="MIT" ${defaultLicense === 'MIT' ? 'selected' : ''}>MIT</option>
                    <option value="Apache-2.0" ${defaultLicense === 'Apache-2.0' ? 'selected' : ''}>Apache-2.0</option>
                    <option value="GPL-3.0-or-later" ${defaultLicense === 'GPL-3.0-or-later' ? 'selected' : ''}>GPL-3.0-or-later</option>
                    <option value="BSD-3-Clause" ${defaultLicense === 'BSD-3-Clause' ? 'selected' : ''}>BSD-3-Clause</option>
                    <option value="Unlicense" ${defaultLicense === 'Unlicense' ? 'selected' : ''}>Unlicense</option>
                    <option value="" ${defaultLicense === '' ? 'selected' : ''}>None / Unspecified</option>
                  </select>
                </div>

                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    ${t('optDefaultRuntime')}
                  </label>
                  <input
                    type="text"
                    id="opt-default-runtime"
                    value="${defaultRuntime}"
                    placeholder="e.g. Node.js v22, Python 3.12, Rust 1.80"
                    class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <!-- Delete Previous Snippets Toggle -->
              <label class="flex items-start gap-3 cursor-pointer pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <input
                  type="checkbox"
                  id="opt-delete-previous"
                  class="mt-1 rounded-sm border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                  ${deletePreviousSnippets ? 'checked' : ''}
                />
                <div>
                  <div class="font-bold text-red-600 dark:text-red-400 text-xs sm:text-sm">
                    ${t('optDeletePreviousGists')}
                  </div>
                  <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    ${t('optDeletePreviousGistsDesc')}
                  </div>
                </div>
              </label>
            </div>

            <!-- Migration Actions -->
            <div class="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center gap-3">
              <button
                id="btn-start-migration"
                class="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <i data-lucide="zap" class="w-4 h-4"></i>
                ${t('startMigration')}
              </button>

              ${
                progress.phase === 'broadcasting' || progress.phase === 'resolving'
                  ? `
                <button
                  id="btn-pause-migration"
                  class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <i data-lucide="pause" class="w-3.5 h-3.5"></i>
                  ${t('pauseMigration')}
                </button>
              `
                  : ''
              }

              ${
                progress.phase === 'paused'
                  ? `
                <button
                  id="btn-resume-migration"
                  class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <i data-lucide="play" class="w-3.5 h-3.5"></i>
                  ${t('resumeMigration')}
                </button>
              `
                  : ''
              }

              ${
                progress.phase !== 'idle' && progress.phase !== 'completed' && progress.phase !== 'error'
                  ? `
                <button
                  id="btn-cancel-migration"
                  class="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <i data-lucide="x" class="w-3.5 h-3.5"></i>
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

        <!-- Progress Bar (Active or Completed) -->
        ${
          progress.phase !== 'idle'
            ? `
          <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span class="flex items-center gap-2">
                <i data-lucide="activity" class="w-4 h-4 text-emerald-500 animate-pulse"></i>
                ${t('currentProgress', {
                  current: progress.processed,
                  total: progress.total,
                  percent: progress.percentage,
                })}
              </span>
              <span>${progress.percentage}%</span>
            </div>
            <div class="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 rounded-full"
                style="width: ${progress.percentage}%"
              ></div>
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

        <!-- Live Activity Log Console -->
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <i data-lucide="terminal" class="w-4 h-4 text-emerald-500"></i>
              ${t('activityLogTitle')}
            </h3>
            <button
              id="btn-clear-logs"
              class="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              ${t('clearLogs')}
            </button>
          </div>

          <div
            id="gists-log-console"
            class="h-48 overflow-y-auto bg-slate-950 text-slate-200 font-mono text-xs p-4 rounded-2xl space-y-1.5 border border-slate-800"
          >
            ${
              logs.length === 0
                ? `<div class="text-slate-500 italic">${t('noLogsYet')}</div>`
                : logs
                    .map((l) => {
                      const color =
                        l.level === 'error'
                          ? 'text-red-400'
                          : l.level === 'warning'
                            ? 'text-amber-400'
                            : l.level === 'success'
                              ? 'text-emerald-400'
                              : 'text-slate-300';
                      return `<div><span class="text-slate-500">[${new Date(
                        l.timestamp
                      ).toLocaleTimeString()}]</span> <span class="${color}">${l.message}</span></div>`;
                    })
                    .join('')
            }
          </div>
        </div>

        <!-- Code Preview Modal -->
        ${
          previewSnippet
            ? `
          <div id="code-preview-modal-backdrop" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div class="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div class="space-y-0.5">
                  <h4 class="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <i data-lucide="file-code" class="w-4 h-4 text-emerald-500"></i>
                    ${previewSnippet.name}
                  </h4>
                  <p class="text-xs text-slate-500 dark:text-slate-400">${previewSnippet.language} • ${Math.round(
                previewSnippet.sizeBytes / 1024
              )} KB</p>
                </div>
                <button
                  id="btn-close-code-modal"
                  class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <i data-lucide="x" class="w-5 h-5"></i>
                </button>
              </div>

              <div class="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-950 text-slate-100 font-mono text-xs">
                <pre class="whitespace-pre-wrap select-text"><code>${escapeHtml(previewSnippet.content)}</code></pre>
              </div>

              <div class="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
                <button
                  id="btn-modal-toggle-privacy"
                  class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    previewSnippet.isPublic
                      ? 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300'
                  }"
                  title="Toggle snippet privacy"
                >
                  ${previewSnippet.isPublic ? '🌐 Public (Kind 1337)' : '🔒 Secret (NIP-44 Encrypted)'}
                  <i data-lucide="refresh-cw" class="w-3 h-3 opacity-60"></i>
                </button>
                <button
                  id="btn-copy-code"
                  class="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                  Copy Code
                </button>
              </div>
            </div>
          </div>
        `
            : ''
        }
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    attachEventListeners();
  };

  const attachEventListeners = () => {
    // Tabs
    const tabGithub = container.querySelector('#tab-btn-github') as HTMLButtonElement | null;
    const tabUpload = container.querySelector('#tab-btn-upload') as HTMLButtonElement | null;
    if (tabGithub && tabUpload) {
      tabGithub.addEventListener('click', () => {
        activeTab = 'github';
        render();
      });
      tabUpload.addEventListener('click', () => {
        activeTab = 'upload';
        render();
      });
    }

    // GitHub Input sync
    const usernameInput = container.querySelector('#github-username-input') as HTMLInputElement | null;
    if (usernameInput) {
      usernameInput.addEventListener('input', (e) => {
        githubInput = (e.target as HTMLInputElement).value;
      });
    }

    const tokenInput = container.querySelector('#github-token-input') as HTMLInputElement | null;
    if (tokenInput) {
      tokenInput.addEventListener('input', (e) => {
        githubToken = (e.target as HTMLInputElement).value;
      });
    }

    // Fetch GitHub Button
    const btnFetch = container.querySelector('#btn-fetch-github') as HTMLButtonElement | null;
    if (btnFetch) {
      btnFetch.addEventListener('click', async () => {
        if (!githubInput.trim()) return;
        isFetchingGitHub = true;
        render();

        try {
          // Check if user entered a specific Gist ID/URL
          const gistId = gitHubService.extractGistId(githubInput);
          if (gistId && (githubInput.includes('gist.github.com') || gistId === githubInput.trim())) {
            await gistPipeline.loadSingleGist(githubInput.trim(), githubToken.trim() || undefined);
          } else {
            await gistPipeline.loadFromGitHub(githubInput.trim(), githubToken.trim() || undefined);
          }
        } catch (err) {
          console.error('Fetch error:', err);
        } finally {
          isFetchingGitHub = false;
          render();
        }
      });
    }

    // File dropzone
    const dropzone = container.querySelector('#gists-dropzone') as HTMLElement | null;
    const fileInput = container.querySelector('#gists-file-input') as HTMLInputElement | null;
    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('border-emerald-500', 'bg-emerald-50/50');
      });
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('border-emerald-500', 'bg-emerald-50/50');
      });
      dropzone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-emerald-500', 'bg-emerald-50/50');
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
          await gistPipeline.loadFiles(Array.from(e.dataTransfer.files));
        }
      });

      fileInput.addEventListener('change', async (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files && files.length > 0) {
          await gistPipeline.loadFiles(Array.from(files));
        }
      });
    }

    // Category Filter Buttons
    const btnFilterAll = container.querySelector('#filter-cat-all') as HTMLButtonElement | null;
    const btnFilterPublic = container.querySelector('#filter-cat-public') as HTMLButtonElement | null;
    const btnFilterSecret = container.querySelector('#filter-cat-secret') as HTMLButtonElement | null;
    if (btnFilterAll) {
      btnFilterAll.addEventListener('click', () => {
        activeFilter = 'all';
        render();
      });
    }
    if (btnFilterPublic) {
      btnFilterPublic.addEventListener('click', () => {
        activeFilter = 'public';
        render();
      });
    }
    if (btnFilterSecret) {
      btnFilterSecret.addEventListener('click', () => {
        activeFilter = 'secret';
        render();
      });
    }

    // Language Dropdown Filter
    const langSelect = container.querySelector('#filter-lang-select') as HTMLSelectElement | null;
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        selectedLanguageFilter = (e.target as HTMLSelectElement).value;
        render();
      });
    }

    // Search Input
    const searchInput = container.querySelector('#search-input') as HTMLInputElement | null;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = (e.target as HTMLInputElement).value;
        render();
      });
    }

    // Selection buttons
    const btnSelectAll = container.querySelector('#btn-select-all') as HTMLButtonElement | null;
    const btnDeselectAll = container.querySelector('#btn-deselect-all') as HTMLButtonElement | null;
    const tableHeaderCheck = container.querySelector('#table-select-all-checkbox') as HTMLInputElement | null;

    if (btnSelectAll) {
      btnSelectAll.addEventListener('click', () => {
        gistPipeline.selectAll(true, activeFilter, selectedLanguageFilter);
      });
    }
    if (btnDeselectAll) {
      btnDeselectAll.addEventListener('click', () => {
        gistPipeline.selectAll(false, activeFilter, selectedLanguageFilter);
      });
    }
    if (tableHeaderCheck) {
      tableHeaderCheck.addEventListener('change', (e) => {
        gistPipeline.selectAll((e.target as HTMLInputElement).checked, activeFilter, selectedLanguageFilter);
      });
    }

    // Mark Secret / Public Batch buttons
    const btnMarkSecret = container.querySelector('#btn-mark-secret') as HTMLButtonElement | null;
    const btnMarkPublic = container.querySelector('#btn-mark-public') as HTMLButtonElement | null;
    if (btnMarkSecret) {
      btnMarkSecret.addEventListener('click', () => {
        const selectedIds = snippets.filter((s) => s.selected).map((s) => s.id);
        if (selectedIds.length > 0) {
          gistPipeline.setSnippetsPrivacy(selectedIds, false);
        }
      });
    }
    if (btnMarkPublic) {
      btnMarkPublic.addEventListener('click', () => {
        const selectedIds = snippets.filter((s) => s.selected).map((s) => s.id);
        if (selectedIds.length > 0) {
          gistPipeline.setSnippetsPrivacy(selectedIds, true);
        }
      });
    }

    // Individual Privacy Toggle buttons
    const privacyBtns = container.querySelectorAll('.btn-toggle-privacy');
    privacyBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-toggle-privacy-id');
        if (id) {
          gistPipeline.toggleSnippetPrivacy(id);
        }
      });
    });

    // Individual checkboxes
    const snippetChecks = container.querySelectorAll('.snippet-checkbox');
    snippetChecks.forEach((chk) => {
      chk.addEventListener('change', (e) => {
        const id = (e.target as HTMLElement).getAttribute('data-snippet-id');
        if (id) {
          gistPipeline.toggleSnippetSelection(id, (e.target as HTMLInputElement).checked);
        }
      });
    });

    // Preview Code buttons
    const previewBtns = container.querySelectorAll('.btn-preview-snippet');
    previewBtns.forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-preview-id');
        if (id) {
          const found = snippets.find((s) => s.id === id) || null;
          if (found) {
            if (!found.content && found.rawUrl) {
              try {
                found.content = await gitHubService.fetchRawContent(found.rawUrl);
              } catch (fetchErr) {
                console.warn('Failed to fetch snippet content for preview:', fetchErr);
              }
            }
            previewSnippet = found;
            render();
          }
        }
      });
    });

    // Close preview modal
    const btnCloseCodeModal = container.querySelector('#btn-close-code-modal') as HTMLButtonElement | null;
    const modalBackdrop = container.querySelector('#code-preview-modal-backdrop') as HTMLElement | null;
    if (btnCloseCodeModal) {
      btnCloseCodeModal.addEventListener('click', () => {
        previewSnippet = null;
        render();
      });
    }
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
          previewSnippet = null;
          render();
        }
      });
    }

    // Modal toggle privacy button
    const btnModalTogglePrivacy = container.querySelector('#btn-modal-toggle-privacy') as HTMLButtonElement | null;
    if (btnModalTogglePrivacy && previewSnippet) {
      btnModalTogglePrivacy.addEventListener('click', () => {
        if (previewSnippet) {
          gistPipeline.toggleSnippetPrivacy(previewSnippet.id);
          previewSnippet = snippets.find((s) => s.id === previewSnippet!.id) || null;
          render();
        }
      });
    }

    // Copy Code button
    const btnCopyCode = container.querySelector('#btn-copy-code') as HTMLButtonElement | null;
    if (btnCopyCode && previewSnippet) {
      btnCopyCode.addEventListener('click', () => {
        if (previewSnippet) {
          navigator.clipboard.writeText(previewSnippet.content);
          btnCopyCode.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5"></i> Copied!';
          if (window.lucide) window.lucide.createIcons();
          setTimeout(() => render(), 1500);
        }
      });
    }

    // Options checkboxes
    const optKind1337 = container.querySelector('#opt-generate-kind1337') as HTMLInputElement | null;
    if (optKind1337) {
      optKind1337.addEventListener('change', (e) => {
        generateKind1337 = (e.target as HTMLInputElement).checked;
      });
    }

    const optEncrypt = container.querySelector('#opt-encrypt-private') as HTMLInputElement | null;
    if (optEncrypt) {
      optEncrypt.addEventListener('change', (e) => {
        encryptPrivateGists = (e.target as HTMLInputElement).checked;
      });
    }

    const optLicense = container.querySelector('#opt-default-license') as HTMLSelectElement | null;
    if (optLicense) {
      optLicense.addEventListener('change', (e) => {
        defaultLicense = (e.target as HTMLSelectElement).value;
      });
    }

    const optRuntime = container.querySelector('#opt-default-runtime') as HTMLInputElement | null;
    if (optRuntime) {
      optRuntime.addEventListener('input', (e) => {
        defaultRuntime = (e.target as HTMLInputElement).value;
      });
    }

    const optDeletePrev = container.querySelector('#opt-delete-previous') as HTMLInputElement | null;
    if (optDeletePrev) {
      optDeletePrev.addEventListener('change', (e) => {
        deletePreviousSnippets = (e.target as HTMLInputElement).checked;
      });
    }

    // Resume session actions
    const btnResumeSession = container.querySelector('#btn-resume-session') as HTMLButtonElement | null;
    const btnFreshSession = container.querySelector('#btn-fresh-session') as HTMLButtonElement | null;
    if (btnResumeSession && existingSession) {
      btnResumeSession.addEventListener('click', () => {
        useResumeSession = true;
        startMigrationProcess();
      });
    }
    if (btnFreshSession && existingSession) {
      btnFreshSession.addEventListener('click', () => {
        importSessionService.clearSession(existingSession!.sessionKey);
        existingSession = null;
        useResumeSession = false;
        render();
      });
    }

    // Start Migration
    const btnStart = container.querySelector('#btn-start-migration') as HTMLButtonElement | null;
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        startMigrationProcess();
      });
    }

    // Pause, Resume, Cancel
    const btnPause = container.querySelector('#btn-pause-migration') as HTMLButtonElement | null;
    if (btnPause) {
      btnPause.addEventListener('click', () => gistPipeline.pause());
    }

    const btnResume = container.querySelector('#btn-resume-migration') as HTMLButtonElement | null;
    if (btnResume) {
      btnResume.addEventListener('click', () => gistPipeline.resume());
    }

    const btnCancel = container.querySelector('#btn-cancel-migration') as HTMLButtonElement | null;
    if (btnCancel) {
      btnCancel.addEventListener('click', () => gistPipeline.cancel());
    }

    // Clear logs
    const btnClearLogs = container.querySelector('#btn-clear-logs') as HTMLButtonElement | null;
    if (btnClearLogs) {
      btnClearLogs.addEventListener('click', () => gistPipeline.clearLogs());
    }
  };

  const startMigrationProcess = async () => {
    const options: GistMigrationOptions = {
      generateKind1337,
      encryptPrivateGists,
      defaultLicense: defaultLicense || undefined,
      defaultRuntime: defaultRuntime || undefined,
      publishToCustomRelaysOnly: false,
      deletePreviousSnippetsBeforeImport: deletePreviousSnippets,
      resumeSession: useResumeSession && existingSession ? existingSession : undefined,
    };

    try {
      await gistPipeline.startMigration(options);
    } catch (err) {
      console.error('Migration error:', err);
    }
  };

  // Pipeline listeners
  gistPipeline.onSnippetsChange((updated) => {
    snippets = updated;
    render();
  });

  gistPipeline.onProgress((p) => {
    progress = p;
    render();
  });

  gistPipeline.onLog((l) => {
    if (l.id === 'clear') {
      logs = [];
    } else {
      logs = gistPipeline.getLogs();
    }
    const logConsole = container.querySelector('#gists-log-console');
    if (logConsole) {
      logConsole.innerHTML = logs
        .map((logItem) => {
          const color =
            logItem.level === 'error'
              ? 'text-red-400'
              : logItem.level === 'warning'
                ? 'text-amber-400'
                : logItem.level === 'success'
                  ? 'text-emerald-400'
                  : 'text-slate-300';
          return `<div><span class="text-slate-500">[${new Date(
            logItem.timestamp
          ).toLocaleTimeString()}]</span> <span class="${color}">${logItem.message}</span></div>`;
        })
        .join('');
      logConsole.scrollTop = logConsole.scrollHeight;
    }
  });

  render();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
