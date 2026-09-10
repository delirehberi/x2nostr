import { instagramPipeline } from '../../importers/instagram/pipeline';
import { instagramService } from '../../importers/instagram/instagram-service';
import { i18n, t } from '../../services/i18n';
import { importSessionService } from '../../services/import-session';
import { nostrService } from '../../services/nostr';
import { DEFAULT_BLOSSOM_SERVERS } from '../../services/blossom';
import { IGMediaRecord, ImportSession, InstagramFilterCategory, InstagramMigrationOptions } from '../../types';
import { showToast } from '../toast';
import { showDryRunModal } from './modal';
import { icons } from '../icons';

export function renderInstagramView(container: HTMLElement): void {
  let posts = instagramPipeline.getPosts();
  let progress = instagramPipeline.getProgress();
  let logs = instagramPipeline.getLogs();

  let activeTab: 'oauth' | 'upload' = 'oauth';
  let activeFilter: InstagramFilterCategory = 'all';
  let searchQuery = '';

  // OAuth & Token state
  let customTokenInput = '';
  let customClientIdInput = '';
  let customClientSecretInput = '';
  let isAdvancedOpen = false;
  let isWalking = false;

  // Migration Options state
  let uploadToBlossom = true;
  let blossomServers = [...DEFAULT_BLOSSOM_SERVERS];
  let deletePreviousPosts = false;
  let includeOriginalTimestamp = true;

  // Preview modal state
  let previewPost: IGMediaRecord | null = null;
  let activeCarouselSlide = 0;

  // Session state
  let existingSession: ImportSession | null = null;
  let useResumeSession = false;

  const updateSessionState = () => {
    const pubkey = nostrService.getPubkey();
    const fingerprint = instagramPipeline.getFingerprint();
    if (pubkey && fingerprint) {
      existingSession = importSessionService.findSession('instagram', pubkey, fingerprint);
    } else {
      existingSession = null;
    }
  };

  // Check if redirected with an OAuth authorization code
  const handleUrlOAuthCode = async () => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code && !instagramService.getAccessToken()) {
      try {
        showToast(t('instagramConnecting'), 'info');
        const tokenResult = await instagramService.exchangeCodeForToken(code);
        showToast(t('instagramAuthSuccess'), 'success');

        // Clean up code from browser URL without triggering reload
        urlParams.delete('code');
        const cleanUrl = `${window.location.pathname}?${urlParams.toString()}`;
        window.history.replaceState({}, '', cleanUrl);

        // Auto-walk user's posts
        isWalking = true;
        render();
        await instagramPipeline.walkInstagramAccount(tokenResult.accessToken);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        showToast(msg, 'error');
      } finally {
        isWalking = false;
        render();
      }
    }
  };

  const render = () => {
    updateSessionState();
    const loc = (key: Parameters<typeof i18n.t>[0], params?: Record<string, string | number>) => i18n.t(key, params);

    const filteredPosts = posts.filter((post) => {
      let matchesCategory = true;
      if (activeFilter === 'image') matchesCategory = post.media_type === 'IMAGE';
      if (activeFilter === 'carousel') matchesCategory = post.media_type === 'CAROUSEL_ALBUM';
      if (activeFilter === 'video') matchesCategory = post.media_type === 'VIDEO';

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (post.caption && post.caption.toLowerCase().includes(q)) ||
        post.tags.some((tag) => tag.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });

    const selectedCount = posts.filter((p) => p.selected).length;

    container.innerHTML = `
      <div class="space-y-8">
        <!-- Header Banner -->
        <div class="bg-gradient-to-r from-pink-900 via-purple-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <div class="max-w-3xl space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-semibold border border-pink-400/30">
              ${icons.camera}
              NIP-68 Picture Posts (Kind 20) & Blossom Media
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">${loc('instagramImporterTitle')}</h2>
            <p class="text-slate-300 text-sm leading-relaxed">${loc('instagramImporterSubtitle')}</p>
          </div>
        </div>

        <!-- 3-Step Wizard Roadmap -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
            <div class="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">${loc('instagramStep1Title')}</div>
            <p class="text-xs text-slate-600 dark:text-slate-300">${loc('instagramStep1Desc')}</p>
          </div>
          <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
            <div class="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">${loc('instagramStep2Title')}</div>
            <p class="text-xs text-slate-600 dark:text-slate-300">${loc('instagramStep2Desc')}</p>
          </div>
          <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
            <div class="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">${loc('instagramStep3Title')}</div>
            <p class="text-xs text-slate-600 dark:text-slate-300">${loc('instagramStep3Desc')}</p>
          </div>
        </div>

        <!-- Session Resume Banner -->
        ${
          existingSession && existingSession.phase === 'in-progress'
            ? `
            <div class="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <span class="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">${icons.refresh}</span>
                <div>
                  <div class="text-sm font-bold">${loc('instagramResumeTitle')}</div>
                  <div class="text-xs text-amber-700 dark:text-amber-300">
                    ${loc('instagramResumeDesc', {
                      done: existingSession.completedBookIds.length,
                      total: existingSession.totalBooks,
                    })}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button id="ig-resume-btn" class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition cursor-pointer">
                  ${loc('instagramResumeBtn')}
                </button>
                <button id="ig-dismiss-session-btn" class="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300 transition cursor-pointer">
                  ${loc('dismiss')}
                </button>
              </div>
            </div>
          `
            : ''
        }

        <!-- Ingestion Tabs -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-xs space-y-6">
          <div class="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
            <button id="tab-oauth" class="px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'oauth'
                ? 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }">
              ${icons.camera}
              ${loc('instagramLoginTab')}
            </button>
            <button id="tab-upload" class="px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }">
              ${icons.upload}
              ${loc('instagramUploadTab')}
            </button>
          </div>

          <!-- Tab Content: 1-Click Login / Graph API -->
          ${
            activeTab === 'oauth'
              ? `
            <div class="space-y-6">
              <div class="p-6 rounded-2xl bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border border-pink-100 dark:border-pink-900/40 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div class="space-y-2 text-center sm:text-left">
                  <div class="text-base font-bold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                    ${icons.camera}
                    ${loc('instagramLoginPrimaryTitle')}
                  </div>
                  <p class="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
                    ${loc('instagramLoginPrimaryDesc')}
                  </p>
                </div>
                <div class="flex flex-col sm:flex-row items-center gap-3">
                  <button id="ig-oauth-login-btn" class="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer">
                    ${icons.camera}
                    ${loc('instagramLoginBtn')}
                  </button>
                  ${
                    instagramService.getAccessToken()
                      ? `
                    <button id="ig-walk-btn" class="px-5 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-md transition flex items-center gap-2 cursor-pointer ${
                      isWalking ? 'opacity-60 cursor-not-allowed' : ''
                    }">
                      ${isWalking ? icons.refresh : icons.play}
                      ${isWalking ? loc('instagramWalking') : loc('instagramWalkPostsBtn')}
                    </button>
                  `
                      : ''
                  }
                </div>
              </div>

              <!-- Advanced Settings Accordion -->
              <div class="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/30">
                <button id="toggle-advanced-btn" class="w-full flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer">
                  <span class="flex items-center gap-2">
                    ${icons.lock}
                    ${loc('instagramAdvancedTitle')}
                  </span>
                  <span>${isAdvancedOpen ? '▲' : '▼'}</span>
                </button>

                ${
                  isAdvancedOpen
                    ? `
                  <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4 text-xs">
                    <p class="text-slate-500 dark:text-slate-400">
                      ${loc('instagramAdvancedDesc')}
                    </p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">${loc('instagramCustomClientId')}</label>
                        <input id="custom-client-id" type="text" value="${customClientIdInput}" placeholder="e.g. 1241198440536780" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100" />
                      </div>
                      <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">${loc('instagramCustomClientSecret')}</label>
                        <input id="custom-client-secret" type="password" value="${customClientSecretInput}" placeholder="Meta App Secret" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100" />
                      </div>
                    </div>
                    <div>
                      <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">${loc('instagramDirectToken')}</label>
                      <div class="flex gap-2">
                        <input id="custom-access-token" type="password" value="${customTokenInput}" placeholder="IGQVJY..." class="grow px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100" />
                        <button id="save-custom-token-btn" class="px-4 py-2 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded-xl font-bold cursor-pointer">
                          ${loc('save')}
                        </button>
                      </div>
                    </div>
                  </div>
                `
                    : ''
                }
              </div>
            </div>
          `
              : `
            <!-- Tab Content: Archive Upload -->
            <div class="space-y-4">
              <div id="drop-zone" class="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-pink-500 rounded-3xl p-8 text-center bg-slate-50/50 dark:bg-slate-900/30 transition cursor-pointer">
                <input id="archive-file-input" type="file" accept=".json,.zip" class="hidden" />
                <div class="flex flex-col items-center gap-3">
                  <div class="p-4 rounded-2xl bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400">${icons.upload}</div>
                  <div class="font-bold text-slate-800 dark:text-slate-100 text-sm">${loc('instagramDropArchiveTitle')}</div>
                  <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm">${loc('instagramDropArchiveDesc')}</p>
                </div>
              </div>
            </div>
          `
          }
        </div>

        <!-- Post Gallery Section -->
        ${
          posts.length > 0
            ? `
          <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-xs space-y-6">
            <!-- Filter Bar & Search -->
            <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
              <div class="flex flex-wrap items-center gap-2">
                <button data-filter="all" class="filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-pink-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }">${loc('all')} (${posts.length})</button>
                <button data-filter="image" class="filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeFilter === 'image'
                    ? 'bg-pink-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }">${loc('instagramFilterPhotos')} (${posts.filter((p) => p.media_type === 'IMAGE').length})</button>
                <button data-filter="carousel" class="filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeFilter === 'carousel'
                    ? 'bg-pink-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }">${loc('instagramFilterCarousels')} (${posts.filter((p) => p.media_type === 'CAROUSEL_ALBUM').length})</button>
                <button data-filter="video" class="filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeFilter === 'video'
                    ? 'bg-pink-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }">${loc('instagramFilterVideos')} (${posts.filter((p) => p.media_type === 'VIDEO').length})</button>
              </div>

              <div class="flex items-center gap-3">
                <div class="relative grow sm:grow-0">
                  <input id="gallery-search" type="text" placeholder="${loc('instagramSearchPlaceholder')}" value="${searchQuery}" class="w-full sm:w-64 pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500" />
                  <span class="absolute left-2.5 top-2 text-slate-400">${icons.search}</span>
                </div>
                <button id="select-all-btn" class="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer">
                  ${selectedCount === posts.length ? loc('deselectAll') : loc('selectAll')}
                </button>
              </div>
            </div>

            <!-- Post Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              ${filteredPosts
                .map((post) => {
                  const hasCarousel = post.media_type === 'CAROUSEL_ALBUM' && post.children && post.children.length > 0;
                  const slideCount = hasCarousel ? post.children!.length : 1;
                  const thumb = post.thumbnail_url || post.media_url || (hasCarousel ? post.children![0].media_url : '');
                  const dateStr = new Date(post.timestampUnix * 1000).toLocaleDateString();

                  return `
                  <div data-post-id="${post.id}" class="post-card group relative bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden border ${
                    post.selected ? 'border-pink-500 ring-2 ring-pink-500/20' : 'border-slate-200 dark:border-slate-700'
                  } transition shadow-xs flex flex-col justify-between">
                    <!-- Image Thumbnail -->
                    <div class="aspect-square relative bg-slate-200 dark:bg-slate-800 overflow-hidden cursor-pointer preview-trigger">
                      ${
                        thumb
                          ? `<img src="${thumb}" alt="${post.caption || 'Instagram'}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" loading="lazy" />`
                          : `<div class="w-full h-full flex items-center justify-center text-slate-400">${icons.camera}</div>`
                      }
                      
                      <!-- Type Badge -->
                      <div class="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-[10px] font-bold text-white">
                        ${hasCarousel ? `❐ ${slideCount}` : post.media_type === 'VIDEO' ? '▶ Video' : '📷 Photo'}
                      </div>

                      <!-- Selection Checkbox -->
                      <div class="absolute top-2 left-2">
                        <input type="checkbox" data-select-id="${post.id}" ${post.selected ? 'checked' : ''} class="w-4 h-4 rounded-md text-pink-600 focus:ring-pink-500 cursor-pointer" />
                      </div>
                    </div>

                    <!-- Post Info & Caption -->
                    <div class="p-3 space-y-1">
                      <div class="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                        <span>${dateStr}</span>
                        ${post.like_count !== undefined ? `<span class="text-pink-600">♥ ${post.like_count}</span>` : ''}
                      </div>
                      <p class="text-xs text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">
                        ${post.caption || '<em class="text-slate-400">No caption</em>'}
                      </p>
                      ${
                        post.tags.length > 0
                          ? `
                        <div class="flex flex-wrap gap-1 pt-1">
                          ${post.tags
                            .slice(0, 3)
                            .map((tg) => `<span class="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">#${tg}</span>`)
                            .join('')}
                        </div>
                      `
                          : ''
                      }
                    </div>
                  </div>
                `;
                })
                .join('')}
            </div>

            <!-- Migration Controls & Blossom Settings -->
            <div class="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Blossom Settings -->
                <div class="space-y-3">
                  <div class="text-xs font-bold uppercase tracking-wider text-slate-500">${loc('instagramBlossomSettingsTitle')}</div>
                  <label class="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input id="toggle-blossom" type="checkbox" ${uploadToBlossom ? 'checked' : ''} class="w-4 h-4 text-pink-600 rounded-md" />
                    ${loc('instagramUploadBlossomLabel')}
                  </label>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">${loc('instagramUploadBlossomDesc')}</p>
                </div>

                <!-- Nostr Kind 20 & Options -->
                <div class="space-y-3">
                  <div class="text-xs font-bold uppercase tracking-wider text-slate-500">${loc('instagramNostrSettingsTitle')}</div>
                  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold">
                    ${icons.check} NIP-68 Kind 20 Picture Post Standard
                  </div>
                  <label class="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input id="toggle-delete-prev" type="checkbox" ${deletePreviousPosts ? 'checked' : ''} class="w-4 h-4 text-pink-600 rounded-md" />
                    ${loc('instagramDeletePrevLabel')}
                  </label>
                </div>
              </div>

              <!-- Action Toolbar -->
              <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div class="text-xs font-bold text-slate-600 dark:text-slate-400">
                  ${loc('instagramSelectedSummary', { count: selectedCount, total: posts.length })}
                </div>
                <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <button id="dry-run-btn" class="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5">
                    ${icons.eye} ${loc('dryRun')}
                  </button>
                  <button id="download-backup-btn" class="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5">
                    ${icons.download} ${loc('instagramDownloadBackupBtn')}
                  </button>
                  <button id="start-migration-btn" class="grow sm:grow-0 px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center justify-center gap-2">
                    ${icons.zap} ${loc('instagramStartMigrationBtn')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        `
            : ''
        }

        <!-- Progress & Log Section -->
        ${
          progress.phase !== 'idle'
            ? `
          <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-xs space-y-4">
            <div class="flex items-center justify-between">
              <div class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                ${icons.zap}
                <span>${loc('instagramProgressTitle')}</span>
              </div>
              <div class="text-xs font-bold text-pink-600">${progress.percentage}%</div>
            </div>

            <!-- Progress Bar -->
            <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300" style="width: ${progress.percentage}%"></div>
            </div>

            <div class="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>${progress.currentTitle ? `Current: ${progress.currentTitle}` : ''}</span>
              <span>${progress.processed} / ${progress.total} (${progress.succeeded} ok, ${progress.failed} failed)</span>
            </div>

            <!-- Console Log Box -->
            <div class="p-4 rounded-2xl bg-slate-900 text-slate-300 font-mono text-[11px] h-40 overflow-y-auto space-y-1">
              ${logs
                .slice(-30)
                .map(
                  (l) => `
                <div class="${l.level === 'error' ? 'text-red-400' : l.level === 'success' ? 'text-emerald-400' : l.level === 'warning' ? 'text-amber-400' : 'text-slate-400'}">
                  [${new Date(l.timestamp).toLocaleTimeString()}] ${l.message}
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `
            : ''
        }

        <!-- Single Post Preview Modal -->
        ${
          previewPost
            ? `
          <div id="preview-modal-backdrop" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div class="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
              <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  ${icons.camera} Post Preview (Kind 20)
                </div>
                <button id="close-preview-btn" class="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">${icons.x}</button>
              </div>
              <div class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div class="aspect-square bg-slate-900 rounded-2xl overflow-hidden relative flex items-center justify-center">
                  ${(() => {
                    const hasSlides = previewPost.children && previewPost.children.length > 0;
                    const activeMedia = hasSlides ? previewPost.children![activeCarouselSlide] : previewPost;
                    return `<img src="${activeMedia.media_url}" class="max-w-full max-h-full object-contain" />`;
                  })()}
                  ${
                    previewPost.children && previewPost.children.length > 1
                      ? `
                    <div class="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                      <button id="prev-slide-btn" class="p-2 rounded-full bg-slate-900/70 text-white pointer-events-auto hover:bg-slate-900 cursor-pointer">◀</button>
                      <button id="next-slide-btn" class="p-2 rounded-full bg-slate-900/70 text-white pointer-events-auto hover:bg-slate-900 cursor-pointer">▶</button>
                    </div>
                  `
                      : ''
                  }
                </div>
                <div class="space-y-2 text-xs">
                  <div class="text-slate-500 dark:text-slate-400 font-mono">${new Date(previewPost.timestampUnix * 1000).toLocaleString()} • ${previewPost.permalink}</div>
                  <p class="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">${previewPost.caption || 'No caption'}</p>
                </div>
              </div>
            </div>
          </div>
        `
            : ''
        }
      </div>
    `;

    attachEventListeners();
  };

  const attachEventListeners = () => {
    // Tab Switching
    container.querySelector('#tab-oauth')?.addEventListener('click', () => {
      activeTab = 'oauth';
      render();
    });
    container.querySelector('#tab-upload')?.addEventListener('click', () => {
      activeTab = 'upload';
      render();
    });

    // 1-Click Login With Instagram
    container.querySelector('#ig-oauth-login-btn')?.addEventListener('click', () => {
      const authUrl = instagramService.getAuthUrl(customClientIdInput || undefined);
      window.location.href = authUrl;
    });

    // Walk Posts Button
    container.querySelector('#ig-walk-btn')?.addEventListener('click', async () => {
      const token = instagramService.getAccessToken();
      if (!token) return;
      try {
        isWalking = true;
        render();
        await instagramPipeline.walkInstagramAccount(token);
        showToast(t('instagramPostsLoaded', { count: instagramPipeline.getPosts().length }), 'success');
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : String(err), 'error');
      } finally {
        isWalking = false;
        render();
      }
    });

    // Advanced settings accordion
    container.querySelector('#toggle-advanced-btn')?.addEventListener('click', () => {
      isAdvancedOpen = !isAdvancedOpen;
      render();
    });

    // Save custom direct token
    container.querySelector('#save-custom-token-btn')?.addEventListener('click', async () => {
      const input = container.querySelector('#custom-access-token') as HTMLInputElement | null;
      if (input && input.value.trim()) {
        instagramService.setAccessToken(input.value.trim());
        showToast(t('instagramTokenSaved'), 'success');
        try {
          isWalking = true;
          render();
          await instagramPipeline.walkInstagramAccount(input.value.trim());
        } catch (err: unknown) {
          showToast(err instanceof Error ? err.message : String(err), 'error');
        } finally {
          isWalking = false;
          render();
        }
      }
    });

    // Dropzone for Data Archive JSON
    const dropZone = container.querySelector('#drop-zone');
    const fileInput = container.querySelector('#archive-file-input') as HTMLInputElement | null;

    dropZone?.addEventListener('click', () => fileInput?.click());
    dropZone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('border-pink-500');
    });
    dropZone?.addEventListener('dragleave', () => dropZone.classList.remove('border-pink-500'));
    dropZone?.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-pink-500');
      const files = (e as DragEvent).dataTransfer?.files;
      if (files && files[0]) handleUploadedFile(files[0]);
    });

    fileInput?.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        handleUploadedFile(fileInput.files[0]);
      }
    });

    // Filter Buttons
    container.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-filter') as InstagramFilterCategory;
        if (cat) {
          activeFilter = cat;
          render();
        }
      });
    });

    // Gallery Search
    const searchInput = container.querySelector('#gallery-search') as HTMLInputElement | null;
    searchInput?.addEventListener('input', (e) => {
      searchQuery = (e.target as HTMLInputElement).value;
      render();
    });

    // Select All / Deselect All
    container.querySelector('#select-all-btn')?.addEventListener('click', () => {
      const allSelected = posts.every((p) => p.selected);
      instagramPipeline.selectAll(!allSelected);
      render();
    });

    // Individual Post Checkboxes
    container.querySelectorAll('input[data-select-id]').forEach((chk) => {
      chk.addEventListener('change', (e) => {
        const id = (e.target as HTMLElement).getAttribute('data-select-id');
        if (id) {
          instagramPipeline.toggleSelection(id);
          render();
        }
      });
    });

    // Preview Triggers
    container.querySelectorAll('.preview-trigger').forEach((trig) => {
      trig.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') return;
        const card = trig.closest('.post-card');
        const id = card?.getAttribute('data-post-id');
        const post = posts.find((p) => p.id === id);
        if (post) {
          previewPost = post;
          activeCarouselSlide = 0;
          render();
        }
      });
    });

    // Preview Modal navigation
    container.querySelector('#close-preview-btn')?.addEventListener('click', () => {
      previewPost = null;
      render();
    });
    container.querySelector('#prev-slide-btn')?.addEventListener('click', () => {
      if (previewPost?.children && activeCarouselSlide > 0) {
        activeCarouselSlide--;
        render();
      }
    });
    container.querySelector('#next-slide-btn')?.addEventListener('click', () => {
      if (previewPost?.children && activeCarouselSlide < previewPost.children.length - 1) {
        activeCarouselSlide++;
        render();
      }
    });

    // Dry Run Button
    container.querySelector('#dry-run-btn')?.addEventListener('click', async () => {
      try {
        const events = await instagramPipeline.generateUnsignedEvents({
          uploadToBlossom,
          blossomServers,
        });
        showDryRunModal({
          title: t('dryRunTitle'),
          events,
        });
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : String(err), 'error');
      }
    });

    // Download Backup (.jsonl)
    container.querySelector('#download-backup-btn')?.addEventListener('click', async () => {
      try {
        const jsonl = await instagramPipeline.exportBackupBundle();
        const blob = new Blob([jsonl], { type: 'application/x-ndjson' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `instagram-posts-kind20-${Date.now()}.jsonl`;
        a.click();
        URL.revokeObjectURL(url);
        showToast(t('instagramBackupDownloaded'), 'success');
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : String(err), 'error');
      }
    });

    // Start Migration
    container.querySelector('#start-migration-btn')?.addEventListener('click', async () => {
      try {
        const options: InstagramMigrationOptions = {
          uploadToBlossom,
          blossomServers,
          includeCaptions: true,
          includeOriginalTimestamp,
          deletePreviousPostsBeforeImport: deletePreviousPosts,
          publishToCustomRelaysOnly: false,
          resumeSession: useResumeSession && existingSession ? existingSession : undefined,
        };
        await instagramPipeline.startMigration(options);
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : String(err), 'error');
      }
    });

    // Resume session button
    container.querySelector('#ig-resume-btn')?.addEventListener('click', () => {
      useResumeSession = true;
      container.querySelector('#start-migration-btn')?.dispatchEvent(new MouseEvent('click'));
    });
    container.querySelector('#ig-dismiss-session-btn')?.addEventListener('click', () => {
      if (existingSession) {
        importSessionService.deleteSession(existingSession.sessionKey);
        existingSession = null;
        render();
      }
    });
  };

  const handleUploadedFile = async (file: File) => {
    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        instagramPipeline.loadArchiveJson(text);
        showToast(t('instagramArchiveLoaded'), 'success');
        render();
      } else {
        showToast(t('instagramUnsupportedFormat'), 'warning');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : String(err), 'error');
    }
  };

  // Subscribe to pipeline updates
  instagramPipeline.subscribePosts((newPosts) => {
    posts = newPosts;
    render();
  });
  instagramPipeline.subscribeProgress((newProg) => {
    progress = newProg;
    render();
  });
  instagramPipeline.subscribeLogs(() => {
    logs = instagramPipeline.getLogs();
    render();
  });

  // Handle URL code if redirected from Meta
  handleUrlOAuthCode();

  render();
}
