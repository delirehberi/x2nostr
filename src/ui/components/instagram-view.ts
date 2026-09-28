import { instagramPipeline } from '../../importers/instagram/pipeline';
import { i18n, t } from '../../services/i18n';
import { importSessionService } from '../../services/import-session';
import { nostrService } from '../../services/nostr';
import { DEFAULT_BLOSSOM_SERVERS } from '../../services/blossom';
import { imageConverter } from '../../services/image-converter';
import { IGMediaRecord, ImportSession, InstagramFilterCategory, InstagramMigrationOptions } from '../../types';
import { showToast } from '../toast';
import { showDryRunModal } from './modal';
import { icons } from '../icons';

export function renderInstagramView(container: HTMLElement): void {
  let posts = instagramPipeline.getPosts();
  let progress = instagramPipeline.getProgress();
  let logs = instagramPipeline.getLogs();
  let conversionProgress = instagramPipeline.getConversionProgress();

  let activeFilter: InstagramFilterCategory = 'all';
  let searchQuery = '';

  // Migration Options state
  let uploadToBlossom = true;
  let blossomServers = [...DEFAULT_BLOSSOM_SERVERS];
  let deletePreviousPosts = false;
  let includeOriginalTimestamp = true;
  let convertHeicToJpeg = true;

  // Preview modal state
  let previewPost: IGMediaRecord | null = null;
  let activeCarouselSlide = 0;
  let isConvertingPreview = false;

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

  const render = () => {
    updateSessionState();
    const loc = (key: Parameters<typeof i18n.t>[0], params?: Record<string, string | number>) => i18n.t(key, params);

    const filteredPosts = posts.filter((post) => {
      let matchesCategory = true;
      if (activeFilter === 'image') matchesCategory = post.media_type === 'IMAGE' && post.media_product_type !== 'STORY';
      if (activeFilter === 'carousel') matchesCategory = post.media_type === 'CAROUSEL_ALBUM';
      if (activeFilter === 'video') matchesCategory = post.media_type === 'VIDEO' || post.media_product_type === 'REELS';
      if (activeFilter === 'story') matchesCategory = post.media_product_type === 'STORY';

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (post.caption && post.caption.toLowerCase().includes(q)) ||
        post.tags.some((tag) => tag.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });

    const selectedCount = posts.filter((p) => p.selected).length;
    const unconvertedHeicCount = instagramPipeline.countUnconvertedHeic();
    const missingMediaCount = posts.filter((p) => {
      if (p.children && p.children.length > 0) {
        return p.children.some((c) => !c.fileBlob);
      }
      return !p.fileBlob;
    }).length;

    container.innerHTML = `
      <div class="space-y-8">
        <!-- Header Banner -->
        <div class="card-workbench p-6 sm:p-8 space-y-2">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent-subtle-border)] text-xs font-mono font-medium">
            <span>${icons.camera}</span>
            <span>NIP-68 Picture Posts (Kind 20) & Blossom Media</span>
          </div>
          <h2 class="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-ink)]">${loc('instagramImporterTitle')}</h2>
          <p class="text-[var(--color-ink-muted)] text-xs sm:text-sm leading-relaxed max-w-3xl">${loc('instagramImporterSubtitle')}</p>
        </div>

        <!-- 3-Step Wizard Roadmap -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div class="card-workbench p-4 space-y-1">
            <div class="text-xs font-mono font-bold text-[var(--color-accent)] uppercase tracking-wider">${loc('instagramStep1Title')}</div>
            <p class="text-xs text-[var(--color-ink-muted)] leading-relaxed">${loc('instagramStep1Desc')}</p>
          </div>
          <div class="card-workbench p-4 space-y-1">
            <div class="text-xs font-mono font-bold text-[var(--color-accent)] uppercase tracking-wider">${loc('instagramStep2Title')}</div>
            <p class="text-xs text-[var(--color-ink-muted)] leading-relaxed">${loc('instagramStep2Desc')}</p>
          </div>
          <div class="card-workbench p-4 space-y-1">
            <div class="text-xs font-mono font-bold text-[var(--color-accent)] uppercase tracking-wider">${loc('instagramStep3Title')}</div>
            <p class="text-xs text-[var(--color-ink-muted)] leading-relaxed">${loc('instagramStep3Desc')}</p>
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

        <!-- Archive Upload Section -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-xs space-y-4">
          <div class="flex items-center gap-3 pb-2">
            <div class="p-2 rounded-xl bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400">
              ${icons.upload}
            </div>
            <div>
              <div class="text-base font-bold text-slate-900 dark:text-white">${loc('instagramUploadTab')}</div>
              <p class="text-xs text-slate-500 dark:text-slate-400">${loc('instagramDropArchiveDesc')}</p>
            </div>
          </div>

          <div id="drop-zone" class="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-pink-500 rounded-3xl p-8 text-center bg-slate-50/50 dark:bg-slate-900/30 transition cursor-pointer space-y-4">
            <input id="archive-file-input" type="file" accept=".json,.zip" class="hidden" />
            <input id="archive-folder-input" type="file" webkitdirectory directory multiple class="hidden" />
            
            <div class="flex flex-col items-center gap-3">
              <div class="p-4 rounded-2xl bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400">${icons.upload}</div>
              <div class="font-bold text-slate-800 dark:text-slate-100 text-sm">${loc('instagramDropArchiveTitle')}</div>
              <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm">${loc('instagramDropArchiveDesc')}</p>
            </div>

            <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button id="select-folder-btn" type="button" class="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer">
                <span>📁</span>
                <span>${loc('instagramSelectFolderBtn')}</span>
              </button>
              <button id="select-file-btn" type="button" class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer">
                <span>📄</span>
                <span>${loc('instagramSelectFileBtn')}</span>
              </button>
            </div>
          </div>
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
                }">${loc('instagramFilterPhotos')} (${posts.filter((p) => p.media_type === 'IMAGE' && p.media_product_type !== 'STORY').length})</button>
                <button data-filter="carousel" class="filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeFilter === 'carousel'
                    ? 'bg-pink-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }">${loc('instagramFilterCarousels')} (${posts.filter((p) => p.media_type === 'CAROUSEL_ALBUM').length})</button>
                <button data-filter="video" class="filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeFilter === 'video'
                    ? 'bg-pink-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }">${loc('instagramFilterVideos')} (${posts.filter((p) => p.media_type === 'VIDEO' || p.media_product_type === 'REELS').length})</button>
                <button data-filter="story" class="filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeFilter === 'story'
                    ? 'bg-pink-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }">${loc('instagramFilterStories')} (${posts.filter((p) => p.media_product_type === 'STORY').length})</button>
              </div>

              <div class="flex flex-wrap items-center gap-3">
                <div class="relative grow sm:grow-0">
                  <input id="gallery-search" type="text" placeholder="${loc('instagramSearchPlaceholder')}" value="${searchQuery}" class="w-full sm:w-64 pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500" />
                  <span class="absolute left-2.5 top-2 text-slate-400">${icons.search}</span>
                </div>
                ${
                  activeFilter !== 'all'
                    ? `
                  <button id="select-category-btn" class="px-3 py-1.5 bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 hover:bg-pink-100 rounded-xl text-xs font-bold transition cursor-pointer">
                    ${loc('instagramSelectCategory')}
                  </button>
                  <button id="deselect-category-btn" class="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer">
                    ${loc('instagramDeselectCategory')}
                  </button>
                `
                    : ''
                }
                <button id="select-all-btn" class="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer">
                  ${selectedCount === posts.length ? loc('deselectAll') : loc('selectAll')}
                </button>
              </div>
            </div>

            <!-- Missing Media Folder Banner -->
            ${
              missingMediaCount > 0
                ? `
              <div class="px-4 py-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold animate-in fade-in duration-200">
                <div class="flex items-center gap-2.5">
                  <span class="text-xl">📁</span>
                  <div>
                    <span class="font-bold">${loc('instagramMediaMissingAlert', { count: missingMediaCount })}</span>
                    <p class="text-[11px] font-normal text-amber-700 dark:text-amber-300 mt-0.5">${loc('instagramMediaMissingDesc')}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <input id="link-media-folder-input" type="file" webkitdirectory directory multiple class="hidden" />
                  <input id="link-media-files-input" type="file" multiple accept="image/*,video/*,.heic,.heif,.mp4,.mov,.webm,.jpg,.jpeg,.png" class="hidden" />
                  <button id="link-media-folder-btn" class="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5">
                    ${icons.upload} ${loc('instagramLinkMediaBtn')}
                  </button>
                  <button id="link-media-files-btn" class="px-3.5 py-1.5 bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5">
                    ${loc('instagramLinkFilesBtn')}
                  </button>
                </div>
              </div>
            `
                : ''
            }

            <!-- HEIC Resource Warning & Manual Conversion Banner -->
            ${
              unconvertedHeicCount > 0 && !conversionProgress.active
                ? `
              <div class="p-4 rounded-2xl bg-pink-50/80 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 text-pink-950 dark:text-pink-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
                <div class="flex items-start gap-3">
                  <span class="text-2xl mt-0.5">📸</span>
                  <div class="space-y-1">
                    <div class="text-xs font-bold text-pink-900 dark:text-pink-200">${loc('instagramHeicDetectedTitle', { count: unconvertedHeicCount })}</div>
                    <p class="text-[11px] text-pink-800/90 dark:text-pink-300 leading-relaxed max-w-2xl">${loc('instagramHeicDetectedDesc', { count: unconvertedHeicCount })}</p>
                    <div class="text-[10px] font-mono text-pink-600 dark:text-pink-400">⚡ ${loc('instagramHeicWorkerNotice')}</div>
                  </div>
                </div>
                <button id="trigger-heic-convert-btn" class="shrink-0 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5">
                  <span>⚙️</span>
                  <span>${loc('instagramConvertHeicBtn')}</span>
                </button>
              </div>
            `
                : ''
            }

            <!-- Background HEIC Previews Conversion Banner -->
            ${
              conversionProgress.active
                ? `
              <div class="px-4 py-3 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 text-pink-900 dark:text-pink-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold animate-in fade-in duration-200">
                <div class="flex items-center gap-2.5">
                  <div class="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin shrink-0"></div>
                  <div>
                    <div>${loc('instagramOptimizingPreviews', {
                      current: conversionProgress.current,
                      total: conversionProgress.total,
                      percent: conversionProgress.percentage,
                    })}</div>
                    ${conversionProgress.filename ? `<span class="font-mono text-[10px] text-pink-600 dark:text-pink-400">(${conversionProgress.filename})</span>` : ''}
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-full sm:w-40 h-2 rounded-full bg-pink-200 dark:bg-pink-900 overflow-hidden shrink-0">
                    <div class="h-full bg-pink-600 transition-all duration-300" style="width: ${conversionProgress.percentage}%"></div>
                  </div>
                  <button id="cancel-heic-convert-btn" class="px-3 py-1 rounded-lg bg-pink-200 dark:bg-pink-900/60 hover:bg-pink-300 dark:hover:bg-pink-800 text-pink-900 dark:text-pink-200 text-xs font-bold transition cursor-pointer">
                    ${loc('instagramCancelConversionBtn')}
                  </button>
                </div>
              </div>
            `
                : ''
            }

            <!-- Post Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              ${filteredPosts
                .map((post) => {
                  const hasCarousel = post.media_type === 'CAROUSEL_ALBUM' && post.children && post.children.length > 0;
                  const slideCount = hasCarousel ? post.children!.length : 1;
                  const activeMedia = hasCarousel ? post.children![0] : post;
                  const thumb = activeMedia.thumbnail_url || activeMedia.media_url || '';
                  const hasBlob = !!activeMedia.fileBlob;
                  const isVideo =
                    activeMedia.media_type === 'VIDEO' ||
                    post.media_type === 'VIDEO' ||
                    post.media_product_type === 'REELS' ||
                    thumb.endsWith('.mp4') ||
                    thumb.endsWith('.mov') ||
                    thumb.endsWith('.webm') ||
                    activeMedia.filename?.endsWith('.mp4') ||
                    activeMedia.originalPath?.endsWith('.mp4');
                  const isHeic =
                    (thumb.endsWith('.heic') ||
                      activeMedia.filename?.endsWith('.heic') ||
                      activeMedia.originalPath?.endsWith('.heic')) &&
                    !thumb.startsWith('blob:');
                  const isConverting = isHeic && hasBlob && conversionProgress.active;
                  const isBlobOrHttp = thumb.startsWith('blob:') || thumb.startsWith('http://') || thumb.startsWith('https://');
                  const dateStr = new Date(post.timestampUnix * 1000).toLocaleDateString();

                  let mediaHtml = '';
                  if (isVideo && isBlobOrHttp) {
                    mediaHtml = `<video src="${thumb}#t=0.1" preload="metadata" muted playsinline class="w-full h-full object-cover group-hover:scale-105 transition duration-300"></video>`;
                  } else if (isBlobOrHttp && !isHeic) {
                    mediaHtml = `<img src="${thumb}" alt="${post.caption || 'Instagram'}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.classList.remove('hidden');" /><div class="hidden w-full h-full flex flex-col items-center justify-center p-2 text-center text-slate-400 text-xs font-mono">📷 Photo</div>`;
                  } else if (isConverting) {
                    const fname = activeMedia.filename || activeMedia.originalPath?.split('/').pop() || 'photo.heic';
                    mediaHtml = `
                      <div class="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-600 dark:text-slate-300 space-y-1.5 animate-pulse">
                        <div class="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                        <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-pink-500">Converting...</span>
                        <span class="text-[9px] font-mono text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[90%]">${fname}</span>
                      </div>
                    `;
                  } else if (isHeic) {
                    const fname = activeMedia.filename || activeMedia.originalPath?.split('/').pop() || 'photo.heic';
                    mediaHtml = `
                      <div class="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-600 dark:text-slate-300 space-y-1">
                        <span class="text-2xl">📸</span>
                        <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-pink-500">HEIC Photo</span>
                        <span class="text-[9px] font-mono text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[90%]">${fname}</span>
                        ${!hasBlob ? `<span class="text-[8px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">Media not linked</span>` : ''}
                      </div>
                    `;
                  } else if (isVideo) {
                    const fname = activeMedia.filename || activeMedia.originalPath?.split('/').pop() || 'video.mp4';
                    mediaHtml = `
                      <div class="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-600 dark:text-slate-300 space-y-1">
                        <span class="text-2xl">▶</span>
                        <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-500">${post.media_product_type === 'REELS' ? 'MP4 Reel' : 'MP4 Video'}</span>
                        <span class="text-[9px] font-mono text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[90%]">${fname}</span>
                        ${!hasBlob ? `<span class="text-[8px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">Media not linked</span>` : ''}
                      </div>
                    `;
                  } else {
                    const fname = activeMedia.filename || activeMedia.originalPath?.split('/').pop() || 'media.jpg';
                    mediaHtml = `
                      <div class="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 space-y-1">
                        <span class="text-2xl">📸</span>
                        <span class="text-[9px] font-mono line-clamp-1 max-w-[90%]">${fname}</span>
                        ${!hasBlob ? `<span class="text-[8px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">Media not linked</span>` : ''}
                      </div>
                    `;
                  }

                  return `
                  <div data-post-id="${post.id}" class="post-card group relative bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden border ${
                    post.selected ? 'border-pink-500 ring-2 ring-pink-500/20' : 'border-slate-200 dark:border-slate-700'
                  } transition shadow-xs flex flex-col justify-between">
                    <!-- Image Thumbnail -->
                    <div class="aspect-square relative bg-slate-200 dark:bg-slate-800 overflow-hidden cursor-pointer preview-trigger flex items-center justify-center">
                      ${mediaHtml}
                      
                      <!-- Type Badge -->
                      <div class="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-[10px] font-bold text-white shadow-xs">
                        ${hasCarousel ? `❐ ${slideCount}` : isVideo ? '▶ Video' : isHeic ? '📸 HEIC' : '📷 Photo'}
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
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Blossom Settings -->
                <div class="space-y-3">
                  <div class="text-xs font-bold uppercase tracking-wider text-slate-500">${loc('instagramBlossomSettingsTitle')}</div>
                  <label class="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input id="toggle-blossom" type="checkbox" ${uploadToBlossom ? 'checked' : ''} class="w-4 h-4 text-pink-600 rounded-md" />
                    ${loc('instagramUploadBlossomLabel')}
                  </label>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">${loc('instagramUploadBlossomDesc')}</p>
                </div>

                <!-- HEIC Auto-Conversion -->
                <div class="space-y-3">
                  <div class="text-xs font-bold uppercase tracking-wider text-slate-500">${loc('instagramConvertHeicLabel')}</div>
                  <label class="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input id="toggle-convert-heic" type="checkbox" ${convertHeicToJpeg ? 'checked' : ''} class="w-4 h-4 text-pink-600 rounded-md" />
                    ${loc('instagramConvertHeicLabel')}
                  </label>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">${loc('instagramConvertHeicDesc')}</p>
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
                  ${previewPost.media_product_type === 'REELS' || previewPost.media_type === 'VIDEO' ? '🎬 Reel / Video Preview (Kind 20)' : `${icons.camera} Post Preview (Kind 20)`}
                  ${
                    previewPost.children && previewPost.children.length > 1
                      ? `<span class="px-2 py-0.5 rounded-md bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300 text-xs font-mono font-semibold">Slide ${activeCarouselSlide + 1} of ${previewPost.children.length}</span>`
                      : ''
                  }
                </div>
                <button id="close-preview-btn" class="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">${icons.x}</button>
              </div>
              <div class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div class="aspect-square bg-slate-900 rounded-2xl overflow-hidden relative flex items-center justify-center p-2">
                  ${(() => {
                    if (isConvertingPreview) {
                      return `
                        <div class="flex flex-col items-center justify-center p-8 text-center space-y-3 bg-slate-950/60 rounded-2xl border border-slate-700 max-w-md">
                          <div class="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                          <div class="text-sm font-bold text-slate-100">Converting HEIC photo for preview...</div>
                          <p class="text-[11px] text-slate-400">Single-thread browser conversion to high-compatibility JPEG</p>
                        </div>
                      `;
                    }

                    const hasSlides = previewPost.children && previewPost.children.length > 0;
                    const activeMedia = hasSlides ? previewPost.children![activeCarouselSlide] : previewPost;
                    let url = activeMedia.media_url || '';

                    if (activeMedia.fileBlob && !url.startsWith('blob:') && !url.startsWith('http://') && !url.startsWith('https://')) {
                      if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
                        url = URL.createObjectURL(activeMedia.fileBlob);
                        activeMedia.media_url = url;
                        activeMedia.thumbnail_url = url;
                      }
                    }

                    const isVideo =
                      activeMedia.media_type === 'VIDEO' ||
                      previewPost.media_type === 'VIDEO' ||
                      ('media_product_type' in activeMedia && (activeMedia as any).media_product_type === 'REELS') ||
                      previewPost.media_product_type === 'REELS' ||
                      url.toLowerCase().endsWith('.mp4') ||
                      url.toLowerCase().endsWith('.mov') ||
                      url.toLowerCase().endsWith('.webm') ||
                      activeMedia.filename?.toLowerCase().endsWith('.mp4') ||
                      activeMedia.filename?.toLowerCase().endsWith('.mov') ||
                      activeMedia.filename?.toLowerCase().endsWith('.webm') ||
                      activeMedia.originalPath?.toLowerCase().endsWith('.mp4') ||
                      activeMedia.originalPath?.toLowerCase().endsWith('.mov') ||
                      activeMedia.originalPath?.toLowerCase().endsWith('.webm') ||
                      activeMedia.fileBlob?.type?.startsWith('video/');

                    const isHeic =
                      (url.endsWith('.heic') ||
                        activeMedia.filename?.endsWith('.heic') ||
                        activeMedia.originalPath?.endsWith('.heic')) &&
                      !url.startsWith('blob:');

                    const isBlobOrHttp = url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://');

                    if (isVideo && isBlobOrHttp) {
                      return `
                        <div class="w-full h-full flex flex-col items-center justify-center relative p-1">
                          <video
                            src="${url}"
                            controls
                            autoplay
                            playsinline
                            preload="auto"
                            class="max-w-full max-h-[58vh] rounded-xl shadow-2xl bg-black object-contain"
                          ></video>
                          <div class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs text-[10px] font-mono font-bold text-white flex items-center gap-1.5 shadow-md">
                            <span>🎬</span>
                            <span>${previewPost.media_product_type === 'REELS' ? 'Reel Video' : 'Video Player'}</span>
                          </div>
                        </div>
                      `;
                    }
                    if (isBlobOrHttp && !isHeic) {
                      return `<img src="${url}" alt="${previewPost.caption || 'Instagram'}" class="max-w-full max-h-full object-contain rounded-xl" onerror="this.style.display='none'; this.nextElementSibling.classList.remove('hidden');" /><div class="hidden p-8 text-center text-slate-400 font-mono text-xs">📷 Photo Asset Ready for Upload</div>`;
                    }
                    if (isHeic) {
                      const fname = activeMedia.filename || activeMedia.originalPath?.split('/').pop() || 'photo.heic';
                      return `
                        <div class="flex flex-col items-center justify-center p-8 text-center space-y-4 bg-slate-950/70 rounded-2xl border border-slate-700 max-w-md">
                          <div class="p-3 rounded-2xl bg-pink-950/60 text-pink-400 border border-pink-800 text-3xl">📸</div>
                          <div class="space-y-1">
                            <div class="text-sm font-bold text-slate-100">Apple HEIC High-Efficiency Photo</div>
                            <div class="text-xs font-mono text-pink-400 px-3 py-1 rounded-lg bg-pink-950/50 border border-pink-800 inline-block">${fname}</div>
                          </div>
                          <p class="text-[11px] text-slate-400 leading-relaxed">${loc('instagramAttachMediaDesc')}</p>
                          <label for="attach-single-media-input" class="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center gap-2">
                            <span>📁</span>
                            <span>${loc('instagramAttachVideoFile', { filename: fname })}</span>
                          </label>
                          <input id="attach-single-media-input" type="file" accept="image/*,video/*,.heic,.heif,.mp4,.mov,.webm,.jpg,.jpeg,.png" class="hidden" />
                        </div>
                      `;
                    }
                    if (isVideo) {
                      const fname = activeMedia.filename || activeMedia.originalPath?.split('/').pop() || 'video.mp4';
                      return `
                        <div class="flex flex-col items-center justify-center p-8 text-center space-y-4 bg-slate-950/70 rounded-2xl border border-slate-700 max-w-md">
                          <div class="p-3 rounded-2xl bg-purple-950/60 text-purple-400 border border-purple-800 text-3xl">🎬</div>
                          <div class="space-y-1">
                            <div class="text-sm font-bold text-slate-100">${previewPost.media_product_type === 'REELS' ? 'Instagram Reel' : 'Instagram Video'}</div>
                            <div class="text-xs font-mono text-purple-400 px-3 py-1 rounded-lg bg-purple-950/50 border border-purple-800 inline-block">${fname}</div>
                          </div>
                          <p class="text-[11px] text-slate-400 leading-relaxed">${loc('instagramAttachMediaDesc')}</p>
                          <label for="attach-single-media-input" class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center gap-2">
                            <span>📁</span>
                            <span>${loc('instagramAttachVideoFile', { filename: fname })}</span>
                          </label>
                          <input id="attach-single-media-input" type="file" accept="video/*,image/*,.mp4,.mov,.webm,.heic,.jpg,.jpeg,.png" class="hidden" />
                        </div>
                      `;
                    }
                    const fname = activeMedia.filename || activeMedia.originalPath?.split('/').pop() || 'media.jpg';
                    return `
                      <div class="flex flex-col items-center justify-center p-8 text-center space-y-4 bg-slate-950/70 rounded-2xl border border-slate-700 max-w-md">
                        <div class="p-3 rounded-2xl bg-slate-800 text-slate-300 border border-slate-700 text-3xl">📸</div>
                        <div class="space-y-1">
                          <div class="text-sm font-bold text-slate-100">Instagram Photo Asset</div>
                          <div class="text-xs font-mono text-slate-300 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 inline-block">${fname}</div>
                        </div>
                        <p class="text-[11px] text-slate-400 leading-relaxed">${loc('instagramAttachMediaDesc')}</p>
                        <label for="attach-single-media-input" class="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center gap-2">
                          <span>📁</span>
                          <span>${loc('instagramAttachVideoFile', { filename: fname })}</span>
                        </label>
                        <input id="attach-single-media-input" type="file" accept="image/*,video/*,.heic,.heif,.mp4,.mov,.webm,.jpg,.jpeg,.png" class="hidden" />
                      </div>
                    `;
                  })()}
                  ${
                    previewPost.children && previewPost.children.length > 1
                      ? `
                    <div class="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                      <button id="prev-slide-btn" class="p-2 rounded-full bg-slate-900/80 text-white pointer-events-auto hover:bg-pink-600 transition cursor-pointer shadow-md">◀</button>
                      <button id="next-slide-btn" class="p-2 rounded-full bg-slate-900/80 text-white pointer-events-auto hover:bg-pink-600 transition cursor-pointer shadow-md">▶</button>
                    </div>
                    <div class="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 pointer-events-none">
                      ${previewPost.children
                        .map(
                          (_, i) => `
                        <span class="w-2 h-2 rounded-full ${i === activeCarouselSlide ? 'bg-pink-500 scale-125' : 'bg-slate-600'} transition"></span>
                      `
                        )
                        .join('')}
                    </div>
                  `
                      : ''
                  }
                </div>
                <div class="space-y-2 text-xs">
                  <div class="text-slate-500 dark:text-slate-400 font-mono">${new Date(previewPost.timestampUnix * 1000).toLocaleString()} • ${previewPost.permalink}</div>
                  <p class="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">${previewPost.caption || 'No caption'}</p>
                </div>
                ${
                  previewPost.children && previewPost.children.length > 1
                    ? `
                  <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <div class="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">NIP-68 imeta Album Structure (${previewPost.children.length} items):</div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] font-mono text-slate-500">
                      ${previewPost.children
                        .map(
                          (c, idx) => `
                        <div class="px-2 py-1 rounded-lg ${idx === activeCarouselSlide ? 'bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 font-bold' : 'bg-white dark:bg-slate-800'} border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                          <span>Slide ${idx + 1}: ${c.filename || c.originalPath?.split('/').pop() || 'slide'}</span>
                          <span class="text-[9px] uppercase">${c.media_type}</span>
                        </div>
                      `
                        )
                        .join('')}
                    </div>
                  </div>
                `
                    : ''
                }
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

  const getFilesFromDataTransfer = async (dataTransfer: DataTransfer): Promise<File[]> => {
    const files: File[] = [];
    const items = dataTransfer.items;

    if (items && items.length > 0) {
      const entries: any[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (typeof (item as any).webkitGetAsEntry === 'function') {
          const entry = (item as any).webkitGetAsEntry();
          if (entry) entries.push(entry);
        }
      }

      if (entries.length > 0) {
        const readEntry = async (entry: any, path = ''): Promise<void> => {
          if (entry.isFile) {
            await new Promise<void>((resolve) => {
              entry.file(
                (file: File) => {
                  Object.defineProperty(file, 'webkitRelativePath', {
                    value: path + file.name,
                    configurable: true,
                  });
                  files.push(file);
                  resolve();
                },
                () => resolve()
              );
            });
          } else if (entry.isDirectory) {
            const dirReader = entry.createReader();
            const readEntries = async (): Promise<void> => {
              const batch = await new Promise<any[]>((resolve) => {
                dirReader.readEntries(
                  (results: any[]) => resolve(results),
                  () => resolve([])
                );
              });
              if (batch.length > 0) {
                for (const child of batch) {
                  await readEntry(child, `${path}${entry.name}/`);
                }
                await readEntries();
              }
            };
            await readEntries();
          }
        };

        for (const entry of entries) {
          await readEntry(entry);
        }
      }
    }

    if (files.length === 0 && dataTransfer.files && dataTransfer.files.length > 0) {
      return Array.from(dataTransfer.files);
    }
    return files;
  };

  const attachEventListeners = () => {
    // Dropzone for Data Archive JSON / Folders
    const dropZone = container.querySelector('#drop-zone');
    const fileInput = container.querySelector('#archive-file-input') as HTMLInputElement | null;
    const folderInput = container.querySelector('#archive-folder-input') as HTMLInputElement | null;
    const selectFolderBtn = container.querySelector('#select-folder-btn');
    const selectFileBtn = container.querySelector('#select-file-btn');

    selectFolderBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      folderInput?.click();
    });

    selectFileBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput?.click();
    });

    dropZone?.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('button')) return;
      folderInput?.click();
    });

    dropZone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('border-pink-500');
    });
    dropZone?.addEventListener('dragleave', () => dropZone.classList.remove('border-pink-500'));
    dropZone?.addEventListener('drop', async (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-pink-500');
      const dt = (e as DragEvent).dataTransfer;
      if (dt) {
        const files = await getFilesFromDataTransfer(dt);
        if (files.length > 0) {
          await handleUploadedFiles(files);
        }
      }
    });

    fileInput?.addEventListener('change', async () => {
      if (fileInput.files && fileInput.files.length > 0) {
        await handleUploadedFiles(fileInput.files);
      }
    });

    folderInput?.addEventListener('change', async () => {
      if (folderInput.files && folderInput.files.length > 0) {
        await handleUploadedFiles(folderInput.files);
      }
    });

    // Filter Buttons
    container.querySelector('#trigger-heic-convert-btn')?.addEventListener('click', () => {
      instagramPipeline.startBackgroundMediaConversion(posts);
    });

    container.querySelector('#cancel-heic-convert-btn')?.addEventListener('click', () => {
      instagramPipeline.cancelBackgroundMediaConversion();
    });

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

    // Select / Deselect Category
    container.querySelector('#select-category-btn')?.addEventListener('click', () => {
      if (activeFilter !== 'all') {
        instagramPipeline.selectByCategory(activeFilter, true);
        render();
      }
    });
    container.querySelector('#deselect-category-btn')?.addEventListener('click', () => {
      if (activeFilter !== 'all') {
        instagramPipeline.selectByCategory(activeFilter, false);
        render();
      }
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

    // Option Toggles
    const blossomToggle = container.querySelector('#toggle-blossom') as HTMLInputElement | null;
    blossomToggle?.addEventListener('change', (e) => {
      uploadToBlossom = (e.target as HTMLInputElement).checked;
    });

    const convertHeicToggle = container.querySelector('#toggle-convert-heic') as HTMLInputElement | null;
    convertHeicToggle?.addEventListener('change', (e) => {
      convertHeicToJpeg = (e.target as HTMLInputElement).checked;
    });

    const deletePrevToggle = container.querySelector('#toggle-delete-prev') as HTMLInputElement | null;
    deletePrevToggle?.addEventListener('change', (e) => {
      deletePreviousPosts = (e.target as HTMLInputElement).checked;
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
          triggerPreviewConversion(previewPost, 0);
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
        triggerPreviewConversion(previewPost, activeCarouselSlide);
      }
    });
    container.querySelector('#next-slide-btn')?.addEventListener('click', () => {
      if (previewPost?.children && activeCarouselSlide < previewPost.children.length - 1) {
        activeCarouselSlide++;
        render();
        triggerPreviewConversion(previewPost, activeCarouselSlide);
      }
    });

    // Dry Run Button
    container.querySelector('#dry-run-btn')?.addEventListener('click', async () => {
      try {
        const events = await instagramPipeline.generateUnsignedEvents({
          uploadToBlossom,
          blossomServers,
          convertHeicToJpeg,
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
          convertHeicToJpeg,
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

    // Link Media Folder / Files Buttons
    const linkMediaFolderBtn = container.querySelector('#link-media-folder-btn');
    const linkMediaFilesBtn = container.querySelector('#link-media-files-btn');
    const linkMediaFolderInput = container.querySelector('#link-media-folder-input') as HTMLInputElement | null;
    const linkMediaFilesInput = container.querySelector('#link-media-files-input') as HTMLInputElement | null;

    linkMediaFolderBtn?.addEventListener('click', () => {
      linkMediaFolderInput?.click();
    });
    linkMediaFilesBtn?.addEventListener('click', () => {
      linkMediaFilesInput?.click();
    });
    linkMediaFolderInput?.addEventListener('change', async () => {
      if (linkMediaFolderInput.files && linkMediaFolderInput.files.length > 0) {
        await handleUploadedFiles(linkMediaFolderInput.files);
      }
    });
    linkMediaFilesInput?.addEventListener('change', async () => {
      if (linkMediaFilesInput.files && linkMediaFilesInput.files.length > 0) {
        await handleUploadedFiles(linkMediaFilesInput.files);
      }
    });

    // Attach single media file inside preview modal
    const attachSingleMediaInput = container.querySelector('#attach-single-media-input') as HTMLInputElement | null;
    attachSingleMediaInput?.addEventListener('change', async (e) => {
      const input = e.target as HTMLInputElement;
      if (input.files && input.files.length > 0 && previewPost) {
        const file = input.files[0];
        const hasSlides = previewPost.children && previewPost.children.length > 0;
        const activeMedia = hasSlides ? previewPost.children![activeCarouselSlide] : previewPost;
        activeMedia.fileBlob = file;
        const blobUrl = URL.createObjectURL(file);
        activeMedia.media_url = blobUrl;
        activeMedia.thumbnail_url = blobUrl;
        if (!hasSlides) {
          previewPost.fileBlob = file;
          previewPost.media_url = blobUrl;
          previewPost.thumbnail_url = blobUrl;
        }
        instagramPipeline.attachMediaFiles([file]);
        render();
        await triggerPreviewConversion(previewPost, activeCarouselSlide);
      }
    });
  };

  const triggerPreviewConversion = async (post: IGMediaRecord, slideIdx: number) => {
    const hasSlides = post.children && post.children.length > 0;
    const activeMedia = hasSlides ? post.children![slideIdx] : post;
    if (!activeMedia) return;

    const blob = activeMedia.fileBlob || (hasSlides ? undefined : post.fileBlob);
    const path = activeMedia.filename || activeMedia.originalPath || activeMedia.media_url;

    if (blob && imageConverter.isHeic(path, blob)) {
      if (activeMedia.media_url && activeMedia.media_url.startsWith('blob:') && !activeMedia.media_url.endsWith('.heic')) {
        return;
      }
      const cacheKey = activeMedia.originalPath || activeMedia.filename || activeMedia.id;
      if (imageConverter.hasCached(cacheKey)) {
        const cached = imageConverter.getCached(cacheKey);
        if (cached) {
          activeMedia.fileBlob = cached.blob;
          activeMedia.media_url = cached.url;
          activeMedia.thumbnail_url = cached.url;
          render();
          return;
        }
      }

      isConvertingPreview = true;
      render();

      try {
        const result = await imageConverter.convertHeicToJpeg(blob, cacheKey);
        activeMedia.fileBlob = result.blob;
        activeMedia.media_url = result.url;
        activeMedia.thumbnail_url = result.url;
      } catch (err) {
        console.warn('Failed to convert preview image:', err);
      } finally {
        isConvertingPreview = false;
        render();
      }
    }
  };

  const handleUploadedFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    try {
      if (fileArray.length === 1 && fileArray[0].name.toLowerCase().endsWith('.json')) {
        const text = await fileArray[0].text();
        instagramPipeline.loadArchiveJson(text);
        showToast(t('instagramArchiveLoaded'), 'success');
      } else {
        const hasJson = fileArray.some((f) => f.name.toLowerCase().endsWith('.json'));
        if (hasJson || posts.length === 0) {
          await instagramPipeline.loadExportFolder(fileArray);
          showToast(t('instagramArchiveLoaded'), 'success');
        } else {
          const linked = instagramPipeline.attachMediaFiles(fileArray);
          if (linked > 0) {
            showToast(t('instagramMediaLinked', { count: linked }), 'success');
          } else {
            await instagramPipeline.loadExportFolder(fileArray);
            showToast(t('instagramArchiveLoaded'), 'success');
          }
        }
      }
      render();
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
  instagramPipeline.subscribeConversionProgress((newConvProg) => {
    conversionProgress = newConvProg;
    render();
  });

  render();
}
