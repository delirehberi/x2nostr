import { moviesPipeline } from '../../importers/movies/pipeline';
import { ImportSession, MovieFilterCategory, MovieRecord } from '../../types';
import { t } from '../../services/i18n';
import { nostrService } from '../../services/nostr';
import { importSessionService } from '../../services/import-session';
import { icons } from '../icons';
import { showToast } from '../toast';
import { showConfirmModal } from './modal';

export function renderMoviesView(container: HTMLElement): void {
  let activeFilter: MovieFilterCategory = 'all';
  let searchQuery = '';
  let generateLists = true;
  let generateReviews = true;
  let deletePreviousReviews = false;
  let pendingResumeSession: ImportSession | null = null;

  const render = () => {
    const movies = moviesPipeline.getMovies();
    const progress = moviesPipeline.getProgress();
    const logs = moviesPipeline.getLogs();
    const pubkey = nostrService.getPubkey();

    // Filter movies
    const filteredMovies = movies.filter((m) => {
      // Category filter
      if (activeFilter === 'movie' && m.titleType !== 'Movie' && m.titleType !== 'Short') return false;
      if (activeFilter === 'tv' && m.titleType !== 'TV Series' && m.titleType !== 'TV Mini Series') return false;
      if (activeFilter === 'episode' && m.titleType !== 'TV Episode') return false;
      if (activeFilter === 'high-rated' && m.myRating < 8) return false;
      if (activeFilter === 'unrated' && m.myRating !== 0) return false;

      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = m.title.toLowerCase().includes(q);
        const matchOrig = m.originalTitle ? m.originalTitle.toLowerCase().includes(q) : false;
        const matchDirector = m.directors.some((d) => d.toLowerCase().includes(q));
        const matchGenre = m.genres.some((g) => g.toLowerCase().includes(q));
        const matchId = m.omdbId.toLowerCase().includes(q);
        if (!matchTitle && !matchOrig && !matchDirector && !matchGenre && !matchId) return false;
      }

      return true;
    });

    const counts = {
      all: movies.length,
      movies: movies.filter((m) => m.titleType === 'Movie' || m.titleType === 'Short').length,
      tv: movies.filter((m) => m.titleType === 'TV Series' || m.titleType === 'TV Mini Series').length,
      episodes: movies.filter((m) => m.titleType === 'TV Episode').length,
      highRated: movies.filter((m) => m.myRating >= 8).length,
      unrated: movies.filter((m) => m.myRating === 0).length,
      selected: movies.filter((m) => m.selected).length,
    };

    container.innerHTML = `
      <div class="space-y-8">
        <!-- Steps Wizard Header -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="glass-card bg-white p-4 rounded-xl flex items-start gap-3 border border-slate-200 shadow-xs">
            <span class="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">1</span>
            <div>
              <h4 class="text-xs font-bold text-slate-900 mb-0.5">${t('moviesStep1Title')}</h4>
              <p class="text-[11px] text-slate-500 leading-tight">${t('moviesStep1Desc')}</p>
            </div>
          </div>
          <div class="glass-card bg-white p-4 rounded-xl flex items-start gap-3 border border-purple-300 shadow-xs ring-1 ring-purple-300/50">
            <span class="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
            <div>
              <h4 class="text-xs font-bold text-slate-900 mb-0.5">${t('moviesStep2Title')}</h4>
              <p class="text-[11px] text-slate-500 leading-tight">${t('moviesStep2Desc')}</p>
            </div>
          </div>
          <div class="glass-card bg-white p-4 rounded-xl flex items-start gap-3 border border-slate-200 shadow-xs">
            <span class="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">3</span>
            <div>
              <h4 class="text-xs font-bold text-slate-900 mb-0.5">${t('moviesStep3Title')}</h4>
              <p class="text-[11px] text-slate-500 leading-tight">${t('moviesStep3Desc')}</p>
            </div>
          </div>
        </div>

        <!-- Upload Dropzone (if no movies loaded) -->
        ${
          movies.length === 0
            ? `
            <div id="dropzone" class="border-2 border-dashed border-purple-200 hover:border-purple-400 bg-white rounded-3xl p-10 sm:p-16 text-center glass-card shadow-xs hover:shadow-md transition-all cursor-pointer group">
              <input type="file" id="csv-file-input" accept=".csv" class="hidden" />
              <div class="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mx-auto mb-4 group-hover:scale-110 transition-transform">
                ${icons.film || icons.upload}
              </div>
              <h3 class="text-lg sm:text-xl font-bold text-slate-900 mb-2">${t('moviesDropzoneTitle')}</h3>
              <p class="text-xs sm:text-sm text-slate-500 mb-6 max-w-md mx-auto">${t('moviesDropzoneSubtitle')}</p>
              <div class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors">
                <span>${t('moviesDropzoneSupport')}</span>
              </div>
            </div>
          `
            : ''
        }

        <!-- Movie Preview & Migration Dashboard -->
        ${
          movies.length > 0
            ? `
          <div class="space-y-6">

            <!-- Resume Import Banner -->
            ${pendingResumeSession ? `
            <div id="resume-banner" class="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-start gap-4">
              <div class="flex items-start gap-3 grow">
                <div class="mt-0.5 shrink-0 w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-amber-900">${t('resumeBannerTitle')}</p>
                  <p class="text-xs text-amber-800 mt-0.5">
                    ${t('moviesResumeBannerDescription')
                      .replace('{completed}', String(pendingResumeSession.completedBookIds.length))
                      .replace('{total}', String(pendingResumeSession.totalBooks))}
                  </p>
                  <!-- Inline fresh-start warning -->
                  <div id="fresh-confirm-area" class="hidden mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
                    <p class="text-xs text-red-900 mb-3">${t('resumeBannerFreshWarning')}</p>
                    <div class="flex items-center gap-2">
                      <button id="btn-fresh-confirm" class="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors cursor-pointer">
                        ${t('resumeBannerFreshConfirm')}
                      </button>
                      <button id="btn-fresh-cancel" class="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer">
                        ${t('resumeBannerFreshCancel')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <button id="btn-banner-resume" class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer">
                  ${t('resumeBannerResume')}
                </button>
                <button id="btn-banner-fresh" class="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer">
                  ${t('resumeBannerFresh')}
                </button>
              </div>
            </div>
            ` : ''}

            <!-- Filter Tabs & Search Bar -->
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl glass-card bg-white border border-slate-200 shadow-xs">
              <!-- Tabs -->
              <div class="flex flex-wrap items-center gap-2">
                <button data-filter="all" class="filter-tab px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === 'all' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }">
                  ${t('filterAll')} <span class="ml-1 opacity-75">(${counts.all})</span>
                </button>
                <button data-filter="movie" class="filter-tab px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === 'movie' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }">
                  ${t('filterMovies')} <span class="ml-1 opacity-75">(${counts.movies})</span>
                </button>
                <button data-filter="tv" class="filter-tab px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === 'tv' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }">
                  ${t('filterTvSeries')} <span class="ml-1 opacity-75">(${counts.tv})</span>
                </button>
                <button data-filter="episode" class="filter-tab px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === 'episode' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }">
                  ${t('filterTvEpisodes')} <span class="ml-1 opacity-75">(${counts.episodes})</span>
                </button>
                <button data-filter="high-rated" class="filter-tab px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === 'high-rated' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }">
                  ${t('filterHighRated')} <span class="ml-1 opacity-75">(${counts.highRated})</span>
                </button>
                <button data-filter="unrated" class="filter-tab px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === 'unrated' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }">
                  ${t('filterUnrated')} <span class="ml-1 opacity-75">(${counts.unrated})</span>
                </button>
              </div>

              <!-- Search & Bulk Actions -->
              <div class="flex items-center gap-3">
                <div class="relative grow sm:w-64">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                    ${icons.search}
                  </span>
                  <input id="input-search" type="text" value="${searchQuery}" placeholder="${t('searchPlaceholder')}" class="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <button id="btn-select-all" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-xs font-semibold text-slate-700 border border-slate-200 whitespace-nowrap cursor-pointer">
                  ${t('selectAll')}
                </button>
                <button id="btn-deselect-all" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-xs font-semibold text-slate-700 border border-slate-200 whitespace-nowrap cursor-pointer">
                  ${t('deselectAll')}
                </button>
              </div>
            </div>

            <!-- Table Container -->
            <div class="overflow-x-auto rounded-2xl glass-card bg-white border border-slate-200 max-h-[520px] overflow-y-auto shadow-xs">
              <table class="w-full text-left text-xs text-slate-700">
                <thead class="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold z-10">
                  <tr>
                    <th class="p-3 w-10 text-center">
                      <input type="checkbox" id="table-select-all" class="rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer" ${
                        counts.selected === movies.length && movies.length > 0 ? 'checked' : ''
                      } />
                    </th>
                    <th class="p-3">${t('colTitleMedia')}</th>
                    <th class="p-3 w-28">${t('colType')}</th>
                    <th class="p-3 w-40">${t('colDirector')}</th>
                    <th class="p-3 w-48">${t('colGenres')}</th>
                    <th class="p-3 w-32">${t('colRating')}</th>
                    <th class="p-3 w-28">${t('colDateRead')}</th>
                    <th class="p-3 w-36">${t('colOmdbId')}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${
                    filteredMovies.length === 0
                      ? `
                    <tr>
                      <td colspan="8" class="p-8 text-center text-slate-500">
                        ${t('noMoviesFound')}
                      </td>
                    </tr>
                  `
                      : filteredMovies.map((m) => renderMovieRow(m)).join('')
                  }
                </tbody>
              </table>
            </div>

            <!-- Migration Options & Controls -->
            <div class="p-6 rounded-2xl glass-card bg-white border border-purple-200/80 shadow-xs space-y-6">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h3 class="text-base font-bold text-slate-900 mb-1">${t('migrationOptionsTitle')}</h3>
                  <p class="text-xs text-purple-600 font-mono font-medium">${t('selectedCount', { count: counts.selected, total: counts.all })}</p>
                </div>
                <div class="flex items-center gap-2">
                  <label class="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-medium text-slate-700">
                    <input type="file" id="reupload-csv" accept=".csv" class="hidden" />
                    <span>Upload Different CSV</span>
                  </label>
                </div>
              </div>

              <!-- Options Checkboxes -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label class="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 cursor-pointer transition-colors">
                  <input type="checkbox" id="opt-movie-lists" ${generateLists ? 'checked' : ''} class="mt-1 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer" />
                  <div>
                    <div class="text-xs font-semibold text-slate-900">${t('optGenerateMovieLists')}</div>
                    <div class="text-[11px] text-slate-500 mt-0.5">${t('optGenerateMovieListsDesc')}</div>
                  </div>
                </label>
                <label class="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 cursor-pointer transition-colors">
                  <input type="checkbox" id="opt-movie-reviews" ${generateReviews ? 'checked' : ''} class="mt-1 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer" />
                  <div>
                    <div class="text-xs font-semibold text-slate-900">${t('optGenerateMovieReviews')}</div>
                    <div class="text-[11px] text-slate-500 mt-0.5">${t('optGenerateMovieReviewsDesc')}</div>
                  </div>
                </label>
                <label class="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/70 hover:bg-amber-50 border border-amber-200 cursor-pointer transition-colors md:col-span-2">
                  <input type="checkbox" id="opt-delete-previous-reviews" ${deletePreviousReviews ? 'checked' : ''} class="mt-1 rounded border-amber-400 text-amber-600 focus:ring-amber-500 cursor-pointer" />
                  <div>
                    <div class="text-xs font-semibold text-amber-900 flex items-center gap-2">
                      <span>${t('optDeletePreviousMovieReviews')}</span>
                      <span class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">Optional</span>
                    </div>
                    <div class="text-[11px] text-amber-800/80 mt-0.5">${t('optDeletePreviousMovieReviewsDesc')}</div>
                  </div>
                </label>
              </div>

              <!-- Progress Bar -->
              ${
                progress.phase !== 'idle'
                  ? `
                <div class="p-4 rounded-xl bg-purple-50/90 border border-purple-200 space-y-3">
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-medium text-purple-900">
                      ${
                        progress.phase === 'completed'
                          ? t('moviesMigrationCompleted')
                          : progress.phase === 'paused'
                          ? 'Migration Paused'
                          : t('currentProgress', { current: progress.processed, total: progress.total, percent: progress.percentage })
                      }
                    </span>
                    <span class="font-mono text-purple-900 font-bold">
                      ${progress.percentage}%
                    </span>
                  </div>

                  <div class="w-full h-2.5 rounded-full bg-purple-200/70 overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300" style="width: ${progress.percentage}%"></div>
                  </div>

                  ${
                    progress.currentTitle
                      ? `<p class="text-[11px] text-purple-700 truncate font-medium">${t('currentlyProcessing', { title: progress.currentTitle })}</p>`
                      : ''
                  }
                </div>
              `
                  : ''
              }

              <!-- Action Controls -->
              <div class="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div class="flex items-center gap-3">
                  ${
                    progress.phase === 'idle' || progress.phase === 'completed' || progress.phase === 'error'
                      ? `
                    <button id="btn-start-migration" class="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-purple-600/25 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50">
                      ${icons.zap}
                      <span>${t('startMigration')}</span>
                    </button>
                  `
                      : `
                    ${
                      progress.phase === 'paused'
                        ? `
                      <button id="btn-resume-migration" class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer">
                        ${icons.play}
                        <span>${t('resumeMigration')}</span>
                      </button>
                    `
                        : `
                      <button id="btn-pause-migration" class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs cursor-pointer">
                        ${icons.pause}
                        <span>${t('pauseMigration')}</span>
                      </button>
                    `
                    }
                    <button id="btn-cancel-migration" class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold transition-colors cursor-pointer">
                      ${icons.x}
                      <span>${t('cancelMigration')}</span>
                    </button>
                  `
                  }
                </div>

                ${
                  !pubkey
                    ? `
                  <div class="text-xs text-amber-900 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl flex items-center gap-2 font-medium">
                    ${icons.alertCircle}
                    <span>Please connect your Nostr extension before migrating.</span>
                  </div>
                `
                    : ''
                }
              </div>
            </div>

            <!-- Activity Log Console -->
            <div class="rounded-2xl glass-card bg-white border border-slate-200 shadow-xs overflow-hidden">
              <div class="flex items-center justify-between p-4 bg-slate-100/90 border-b border-slate-200">
                <div class="flex items-center gap-2 text-xs font-bold text-slate-800">
                  ${icons.terminal}
                  <span>${t('activityLogTitle')}</span>
                </div>
                <div class="flex items-center gap-2">
                  <button id="btn-clear-logs" class="text-[11px] px-2.5 py-1 rounded bg-white hover:bg-slate-200/80 border border-slate-200 text-slate-600 hover:text-slate-900 font-medium transition-colors cursor-pointer">
                    ${t('clearLogs')}
                  </button>
                  <button id="btn-export-logs" class="text-[11px] px-2.5 py-1 rounded bg-white hover:bg-slate-200/80 border border-slate-200 text-slate-600 hover:text-slate-900 font-medium transition-colors cursor-pointer">
                    ${t('exportLogs')}
                  </button>
                </div>
              </div>
              <div id="log-console-body" class="p-4 bg-slate-900 max-h-48 overflow-y-auto font-mono text-[11px] space-y-1.5 text-slate-200">
                ${
                  logs.length === 0
                    ? `<div class="text-slate-500 italic">${t('noLogsYet')}</div>`
                    : logs.map((l) => renderLogItem(l)).join('')
                }
              </div>
            </div>
          </div>
        `
            : ''
        }
      </div>
    `;

    bindEvents();
  };

  const renderMovieRow = (m: MovieRecord): string => {
    const isTv = m.titleType === 'TV Series' || m.titleType === 'TV Mini Series' || m.titleType === 'TV Episode';
    const typeBadgeColor =
      m.titleType === 'Movie'
        ? 'bg-purple-50 text-purple-700 border-purple-200'
        : isTv
        ? 'bg-blue-50 text-blue-700 border-blue-200'
        : m.titleType === 'Short'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-slate-100 text-slate-700 border-slate-200';

    const directorsStr = m.directors.length > 0 ? m.directors.join(', ') : '—';
    const genresHtml = m.genres.slice(0, 3).map((g) => `<span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">${g}</span>`).join(' ');

    return `
      <tr class="hover:bg-slate-50/80 transition-colors ${m.selected ? '' : 'opacity-40'}">
        <td class="p-3 text-center">
          <input type="checkbox" data-movie-id="${m.id}" class="movie-row-select rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer" ${
      m.selected ? 'checked' : ''
    } />
        </td>
        <td class="p-3">
          <div class="font-semibold text-slate-900 truncate max-w-xs" title="${m.title}">${m.title} ${m.year ? `<span class="font-normal text-slate-500">(${m.year})</span>` : ''}</div>
          ${m.originalTitle ? `<div class="text-[11px] text-slate-500 italic truncate max-w-xs">${m.originalTitle}</div>` : ''}
          ${m.runtimeMins ? `<div class="text-[10px] text-slate-400 font-mono">${m.runtimeMins} mins</div>` : ''}
        </td>
        <td class="p-3">
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeBadgeColor}">
            ${m.titleType}
          </span>
        </td>
        <td class="p-3 text-slate-700 truncate max-w-xs" title="${directorsStr}">
          ${directorsStr}
        </td>
        <td class="p-3">
          <div class="flex flex-wrap gap-1 max-w-xs">
            ${genresHtml || '<span class="text-slate-400 italic text-[10px]">None</span>'}
          </div>
        </td>
        <td class="p-3">
          ${
            m.myRating > 0
              ? `
            <div class="flex items-center gap-1">
              <span class="text-amber-500 font-bold text-xs">${m.myRating}</span>
              <span class="text-slate-400 text-[10px]">/ 10</span>
              <span class="text-amber-400">${icons.star}</span>
            </div>
          `
              : `<span class="text-slate-400 italic">Unrated</span>`
          }
        </td>
        <td class="p-3 font-mono text-[11px] text-slate-600">
          ${m.dateRated || '—'}
        </td>
        <td class="p-3 font-mono text-[11px]">
          <span class="text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded font-medium">${m.omdbId}</span>
        </td>
      </tr>
    `;
  };

  const renderLogItem = (log: { timestamp: Date; level: string; message: string }): string => {
    const timeStr = log.timestamp.toLocaleTimeString();
    const color =
      log.level === 'success'
        ? 'text-emerald-400'
        : log.level === 'error'
        ? 'text-rose-400 font-bold'
        : log.level === 'warning'
        ? 'text-amber-400'
        : 'text-slate-200';

    return `
      <div class="flex items-start gap-2">
        <span class="text-slate-400 select-none">[${timeStr}]</span>
        <span class="${color}">${log.message}</span>
      </div>
    `;
  };

  const bindEvents = () => {
    const dropzone = container.querySelector('#dropzone');
    const fileInput = container.querySelector('#csv-file-input') as HTMLInputElement | null;
    const reuploadInput = container.querySelector('#reupload-csv') as HTMLInputElement | null;

    const handleFile = async (file: File) => {
      pendingResumeSession = null;

      try {
        await moviesPipeline.loadCsv(file);
        showToast('Movie ratings CSV parsed successfully!', 'success');

        const pubkey = nostrService.getPubkey();
        const fingerprint = moviesPipeline.getFingerprint();
        if (pubkey && fingerprint) {
          const existingSession = importSessionService.findSession('movies', pubkey, fingerprint);
          if (existingSession) {
            pendingResumeSession = existingSession;
            render();
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to parse CSV';
        showToast(msg, 'error');
      }
    };

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      dropzone.addEventListener('dragover', (e: Event) => {
        e.preventDefault();
        dropzone.classList.add('border-purple-500', 'bg-purple-950/20');
      });
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('border-purple-500', 'bg-purple-950/20');
      });
      dropzone.addEventListener('drop', (e: Event) => {
        e.preventDefault();
        dropzone.classList.remove('border-purple-500', 'bg-purple-950/20');
        const dragEvent = e as DragEvent;
        if (dragEvent.dataTransfer && dragEvent.dataTransfer.files.length > 0) {
          handleFile(dragEvent.dataTransfer.files[0]);
        }
      });
      fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files.length > 0) {
          handleFile(fileInput.files[0]);
        }
      });
    }

    if (reuploadInput) {
      reuploadInput.addEventListener('change', () => {
        if (reuploadInput.files && reuploadInput.files.length > 0) {
          handleFile(reuploadInput.files[0]);
        }
      });
    }

    // Filter tabs
    const filterTabs = container.querySelectorAll('.filter-tab');
    filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const filter = tab.getAttribute('data-filter') as MovieFilterCategory;
        if (filter) {
          activeFilter = filter;
          render();
        }
      });
    });

    // Search input
    const searchInput = container.querySelector('#input-search') as HTMLInputElement | null;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = (e.target as HTMLInputElement).value;
        render();
      });
    }

    // Bulk select/deselect
    const btnSelectAll = container.querySelector('#btn-select-all');
    if (btnSelectAll) {
      btnSelectAll.addEventListener('click', () => {
        moviesPipeline.selectAll(true, activeFilter);
      });
    }

    const btnDeselectAll = container.querySelector('#btn-deselect-all');
    if (btnDeselectAll) {
      btnDeselectAll.addEventListener('click', () => {
        moviesPipeline.selectAll(false, activeFilter);
      });
    }

    const tableSelectAll = container.querySelector('#table-select-all') as HTMLInputElement | null;
    if (tableSelectAll) {
      tableSelectAll.addEventListener('change', (e) => {
        const checked = (e.target as HTMLInputElement).checked;
        moviesPipeline.selectAll(checked);
      });
    }

    // Individual row checkboxes
    const rowCheckboxes = container.querySelectorAll('.movie-row-select');
    rowCheckboxes.forEach((cb) => {
      cb.addEventListener('change', (e) => {
        const movieId = (cb as HTMLInputElement).getAttribute('data-movie-id');
        const checked = (e.target as HTMLInputElement).checked;
        if (movieId) {
          moviesPipeline.toggleMovieSelection(movieId, checked);
        }
      });
    });

    // Option checkboxes
    const optLists = container.querySelector('#opt-movie-lists') as HTMLInputElement | null;
    if (optLists) {
      optLists.addEventListener('change', (e) => {
        generateLists = (e.target as HTMLInputElement).checked;
      });
    }

    const optReviews = container.querySelector('#opt-movie-reviews') as HTMLInputElement | null;
    if (optReviews) {
      optReviews.addEventListener('change', (e) => {
        generateReviews = (e.target as HTMLInputElement).checked;
      });
    }

    const optDeleteReviews = container.querySelector('#opt-delete-previous-reviews') as HTMLInputElement | null;
    if (optDeleteReviews) {
      optDeleteReviews.addEventListener('change', (e) => {
        deletePreviousReviews = (e.target as HTMLInputElement).checked;
      });
    }

    // Migration Controls
    const btnStart = container.querySelector('#btn-start-migration') as HTMLButtonElement | null;
    if (btnStart) {
      btnStart.addEventListener('click', async () => {
        if (!nostrService.getPubkey()) {
          try {
            await nostrService.connect();
          } catch (authErr: unknown) {
            const msg = authErr instanceof Error ? authErr.message : 'Nostr auth failed';
            showToast(msg, 'error');
            return;
          }
        }

        if (!pendingResumeSession) {
          const pubkey = nostrService.getPubkey();
          const fingerprint = moviesPipeline.getFingerprint();
          if (pubkey && fingerprint) {
            const existingSession = importSessionService.findSession('movies', pubkey, fingerprint);
            if (existingSession) {
              pendingResumeSession = existingSession;
              render();
              return;
            }
          }
        }

        const runMigration = async (shouldDelete: boolean) => {
          try {
            const session = pendingResumeSession;
            pendingResumeSession = null;
            await moviesPipeline.startMigration({
              generateCuratedLists: generateLists,
              generateReviewEvents: generateReviews,
              deletePreviousReviewsBeforeImport: shouldDelete,
              publishToCustomRelaysOnly: false,
              resumeSession: session ?? undefined,
            });
          } catch (mErr: unknown) {
            const msg = mErr instanceof Error ? mErr.message : 'Migration failed';
            showToast(msg, 'error');
          }
        };

        if (deletePreviousReviews && generateReviews) {
          showConfirmModal({
            title: t('confirmDeleteMovieModalTitle'),
            message: t('confirmDeleteMovieModalDesc'),
            confirmText: t('confirmDeleteModalConfirm'),
            cancelText: t('confirmDeleteModalCancel'),
            onConfirm: () => {
              runMigration(true);
            },
          });
        } else {
          await runMigration(false);
        }
      });
    }

    // Resume Banner — "Resume Import" button
    const btnBannerResume = container.querySelector('#btn-banner-resume') as HTMLButtonElement | null;
    if (btnBannerResume) {
      btnBannerResume.addEventListener('click', async () => {
        if (!nostrService.getPubkey()) {
          try {
            await nostrService.connect();
          } catch (authErr: unknown) {
            const msg = authErr instanceof Error ? authErr.message : 'Nostr auth failed';
            showToast(msg, 'error');
            return;
          }
        }

        try {
          const session = pendingResumeSession;
          pendingResumeSession = null;
          render();
          await moviesPipeline.startMigration({
            generateCuratedLists: generateLists,
            generateReviewEvents: generateReviews,
            publishToCustomRelaysOnly: false,
            resumeSession: session ?? undefined,
          });
        } catch (mErr: unknown) {
          const msg = mErr instanceof Error ? mErr.message : 'Migration failed';
          showToast(msg, 'error');
        }
      });
    }

    // Resume Banner — "Start Fresh"
    const btnBannerFresh = container.querySelector('#btn-banner-fresh') as HTMLButtonElement | null;
    const freshConfirmArea = container.querySelector('#fresh-confirm-area') as HTMLElement | null;
    const btnFreshConfirm = container.querySelector('#btn-fresh-confirm') as HTMLButtonElement | null;
    const btnFreshCancel = container.querySelector('#btn-fresh-cancel') as HTMLButtonElement | null;

    if (btnBannerFresh && freshConfirmArea) {
      btnBannerFresh.addEventListener('click', () => {
        freshConfirmArea.classList.remove('hidden');
        btnBannerFresh.classList.add('hidden');
      });
    }

    if (btnFreshCancel && freshConfirmArea && btnBannerFresh) {
      btnFreshCancel.addEventListener('click', () => {
        freshConfirmArea.classList.add('hidden');
        btnBannerFresh.classList.remove('hidden');
      });
    }

    if (btnFreshConfirm) {
      btnFreshConfirm.addEventListener('click', async () => {
        if (pendingResumeSession) {
          importSessionService.clearSession(pendingResumeSession.sessionKey);
          pendingResumeSession = null;
          render();
        }

        if (!nostrService.getPubkey()) {
          try {
            await nostrService.connect();
          } catch (authErr: unknown) {
            const msg = authErr instanceof Error ? authErr.message : 'Nostr auth failed';
            showToast(msg, 'error');
            return;
          }
        }

        try {
          await moviesPipeline.startMigration({
            generateCuratedLists: generateLists,
            generateReviewEvents: generateReviews,
            deletePreviousReviewsBeforeImport: deletePreviousReviews,
            publishToCustomRelaysOnly: false,
          });
        } catch (mErr: unknown) {
          const msg = mErr instanceof Error ? mErr.message : 'Migration failed';
          showToast(msg, 'error');
        }
      });
    }

    const btnPause = container.querySelector('#btn-pause-migration');
    if (btnPause) {
      btnPause.addEventListener('click', () => moviesPipeline.pause());
    }

    const btnResume = container.querySelector('#btn-resume-migration');
    if (btnResume) {
      btnResume.addEventListener('click', () => moviesPipeline.resume());
    }

    const btnCancel = container.querySelector('#btn-cancel-migration');
    if (btnCancel) {
      btnCancel.addEventListener('click', () => moviesPipeline.cancel());
    }

    const btnClearLogs = container.querySelector('#btn-clear-logs');
    if (btnClearLogs) {
      btnClearLogs.addEventListener('click', () => moviesPipeline.clearLogs());
    }

    const btnExportLogs = container.querySelector('#btn-export-logs');
    if (btnExportLogs) {
      btnExportLogs.addEventListener('click', () => {
        const logs = moviesPipeline.getLogs();
        const text = logs
          .map((l) => `[${l.timestamp.toISOString()}] [${l.level.toUpperCase()}] ${l.message}`)
          .join('\n');
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `x2nostr-movies-log-${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  };

  // Subscriptions
  moviesPipeline.onProgress(() => render());
  moviesPipeline.onLog(() => render());
  moviesPipeline.onMoviesChange(() => render());

  render();
}
