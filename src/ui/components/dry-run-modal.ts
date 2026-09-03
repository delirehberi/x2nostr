import { UnsignedNostrEvent } from '../../types';
import { t } from '../../services/i18n';
import { icons } from '../icons';
import { showToast } from '../toast';

export interface DryRunModalOptions {
  title: string;
  subtitle?: string;
  events: UnsignedNostrEvent[];
  onProceed?: () => void;
  proceedButtonText?: string;
}

export function showDryRunModal(opts: {
  title: string;
  subtitle?: string;
  events: UnsignedNostrEvent[];
  onProceed?: () => void;
  proceedButtonText?: string;
}): void {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return;

  const { events, onProceed } = opts;

  if (events.length === 0) {
    showToast(t('dryRunNoSelection'), 'warning');
    return;
  }

  let selectedIndex = 0;
  let activeTab: 'preview' | 'content' | 'json' = 'preview';
  let searchQuery = '';

  const backdrop = document.createElement('div');
  backdrop.className = 'fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm transition-opacity overflow-hidden';

  // Count events by kind
  const kindCounts: Record<number, number> = {};
  events.forEach((ev) => {
    kindCounts[ev.kind] = (kindCounts[ev.kind] || 0) + 1;
  });

  const getKindLabel = (kind: number): { name: string; color: string } => {
    switch (kind) {
      case 30023:
        return { name: 'Kind 30023 (NIP-23 Article)', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 30003:
        return { name: 'Kind 30003 (NIP-51 Bookmark Set)', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
      case 10073:
      case 10074:
      case 10075:
        return { name: `Kind ${kind} (Bookstr Shelf)`, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 31985:
        return { name: 'Kind 31985 (NIP-32 Review & Rating)', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      case 1337:
        return { name: 'Kind 1337 (NIP-C0 Code Snippet)', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
      case 30078:
        return { name: 'Kind 30078 (NIP-44 Encrypted Snippet)', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
      case 5:
        return { name: 'Kind 5 (NIP-09 Deletion)', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
      default:
        return { name: `Kind ${kind}`, color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
    }
  };

  const getEventTitle = (ev: UnsignedNostrEvent, idx: number): string => {
    const titleTag = ev.tags.find((t) => t[0] === 'title' || t[0] === 'name');
    if (titleTag && titleTag[1]) return titleTag[1];

    const dTag = ev.tags.find((t) => t[0] === 'd');
    if (dTag && dTag[1]) return dTag[1];

    if (ev.content && ev.content.length > 0) {
      const firstLine = ev.content.split('\n')[0].replace(/^#+\s*/, '').trim();
      if (firstLine) return firstLine.slice(0, 45);
    }

    return `Event #${idx + 1} (${getKindLabel(ev.kind).name})`;
  };

  const renderModalContent = () => {
    const filteredEventIndices = events
      .map((ev, idx) => ({ ev, idx }))
      .filter(({ ev, idx }) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const title = getEventTitle(ev, idx).toLowerCase();
        const kindStr = String(ev.kind);
        const contentStr = ev.content.toLowerCase();
        const tagsStr = ev.tags.map((t) => t.join(' ')).join(' ').toLowerCase();
        return title.includes(q) || kindStr.includes(q) || contentStr.includes(q) || tagsStr.includes(q);
      });

    const currentIdx = filteredEventIndices.some((item) => item.idx === selectedIndex)
      ? selectedIndex
      : (filteredEventIndices[0]?.idx ?? 0);

    const currentEvent = events[currentIdx] || events[0];

    backdrop.innerHTML = `
      <div class="relative w-full max-w-5xl h-[92vh] max-h-[850px] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-200 animate-in fade-in zoom-in duration-200" role="dialog" aria-modal="true">
        
        <!-- Header -->
        <div class="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div class="space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold font-mono">
                ${icons.eye}
                <span>${t('dryRunBadge')}</span>
              </span>
              <h3 class="text-base sm:text-lg font-extrabold text-white">${opts.title}</h3>
            </div>
            <p class="text-xs text-slate-400">${opts.subtitle || t('dryRunSubtitle', { count: events.length })}</p>
          </div>

          <div class="flex items-center gap-2 self-end sm:self-center">
            <!-- Kind summary badges -->
            <div class="hidden md:flex items-center gap-1.5 overflow-x-auto">
              ${Object.entries(kindCounts)
                .map(([kind, count]) => {
                  const info = getKindLabel(Number(kind));
                  return `<span class="px-2 py-0.5 rounded-md border text-[10px] font-mono font-semibold ${info.color}">${count}x ${info.name.split(' ')[0]} ${info.name.split(' ')[1] || ''}</span>`;
                })
                .join('')}
            </div>
            <button id="modal-dryrun-close-btn" class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer" title="Close">
              ${icons.x}
            </button>
          </div>
        </div>

        <!-- Body: 2 Columns (Sidebar + Inspector) -->
        <div class="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          <!-- Left Column: Event List Selector -->
          <div class="md:col-span-4 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/40 flex flex-col overflow-hidden max-h-48 md:max-h-full shrink-0">
            <!-- Search in events -->
            <div class="p-3 border-b border-slate-800/80">
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-500 pointer-events-none">
                  ${icons.search}
                </span>
                <input id="dryrun-search" type="text" placeholder="${t('searchPlaceholder')}" value="${searchQuery}" class="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans" />
              </div>
            </div>

            <!-- List items -->
            <div class="flex-1 overflow-y-auto divide-y divide-slate-800/50">
              ${
                filteredEventIndices.length === 0
                  ? `<div class="p-4 text-center text-xs text-slate-500">${t('noBooksFound')}</div>`
                  : filteredEventIndices
                      .map(({ ev, idx }) => {
                        const isSelected = idx === currentIdx;
                        const kindInfo = getKindLabel(ev.kind);
                        const itemTitle = getEventTitle(ev, idx);
                        const dateStr = new Date(ev.created_at * 1000).toLocaleDateString();

                        return `
                        <button class="dryrun-event-item w-full text-left p-3 hover:bg-slate-800/60 transition-colors cursor-pointer flex flex-col gap-1 ${
                          isSelected ? 'bg-blue-900/30 border-l-4 border-blue-500' : ''
                        }" data-idx="${idx}">
                          <div class="flex items-center justify-between gap-2">
                            <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${kindInfo.color}">Kind ${ev.kind}</span>
                            <span class="text-[10px] text-slate-500 font-mono">${dateStr}</span>
                          </div>
                          <div class="font-bold text-xs text-white truncate max-w-full" title="${itemTitle}">${itemTitle}</div>
                          <div class="text-[11px] text-slate-400 font-mono truncate">${ev.tags.length} tags &bull; ${ev.content.length} chars</div>
                        </button>
                      `;
                      })
                      .join('')
              }
            </div>
          </div>

          <!-- Right Column: Active Event Inspector -->
          <div class="md:col-span-8 flex flex-col overflow-hidden bg-slate-900/80">
            ${
              !currentEvent
                ? `<div class="p-8 text-center text-slate-500">Select an event to inspect</div>`
                : `
              <!-- Event Meta Header & Tabs -->
              <div class="p-4 border-b border-slate-800 bg-slate-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div class="space-y-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded-md font-mono text-xs font-bold border ${getKindLabel(currentEvent.kind).color}">
                      ${getKindLabel(currentEvent.kind).name}
                    </span>
                    <span class="text-xs text-slate-400 font-mono">
                      created_at: ${currentEvent.created_at} (${new Date(currentEvent.created_at * 1000).toLocaleString()})
                    </span>
                  </div>
                  <h4 class="text-sm font-bold text-white truncate">${getEventTitle(currentEvent, currentIdx)}</h4>
                </div>

                <!-- Tabs -->
                <div class="inline-flex p-1 bg-slate-950 rounded-xl text-xs font-medium shrink-0 border border-slate-800">
                  <button class="dryrun-tab-btn px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'preview' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
                  }" data-tab="preview">
                    ${t('tabRenderedPreview')}
                  </button>
                  <button class="dryrun-tab-btn px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'content' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
                  }" data-tab="content">
                    ${t('tabRawContent')}
                  </button>
                  <button class="dryrun-tab-btn px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'json' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
                  }" data-tab="json">
                    ${t('tabNostrJson')}
                  </button>
                </div>
              </div>

              <!-- Inspector Content Body -->
              <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-sans text-xs">
                
                <!-- Tags Box -->
                <div class="rounded-2xl bg-slate-950/80 border border-slate-800 p-3.5 space-y-2">
                  <div class="flex items-center justify-between text-xs font-bold text-slate-300">
                    <div class="flex items-center gap-1.5">
                      <i data-lucide="tag" class="w-3.5 h-3.5 text-blue-400"></i>
                      <span>Event Tags (${currentEvent.tags.length})</span>
                    </div>
                  </div>
                  <div class="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                    ${
                      currentEvent.tags.length === 0
                        ? `<span class="text-slate-500 italic text-[11px]">No tags</span>`
                        : currentEvent.tags
                            .map((tag) => {
                              const [key, val, ...extra] = tag;
                              const extraStr = extra.length > 0 ? ` (${extra.join(', ')})` : '';
                              return `
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700/80 text-[11px] font-mono">
                          <span class="text-blue-400 font-bold">${key}</span>
                          <span class="text-slate-500">:</span>
                          <span class="text-slate-200 truncate max-w-xs" title="${val}">${val}${extraStr}</span>
                        </span>
                      `;
                            })
                            .join('')
                    }
                  </div>
                </div>

                <!-- Tab 1: Rendered Markdown Preview -->
                ${
                  activeTab === 'preview'
                    ? `
                  <div class="rounded-2xl bg-slate-950/40 border border-slate-800 p-5 space-y-4">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span class="text-xs font-bold text-slate-300">${t('tabRenderedPreview')}</span>
                      <button id="btn-copy-tab-content" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer">
                        ${icons.copy}
                        <span>${t('copyContent')}</span>
                      </button>
                    </div>
                    <div class="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed text-xs">
                      ${renderSimpleMarkdownPreview(currentEvent.content)}
                    </div>
                  </div>
                `
                    : ''
                }

                <!-- Tab 2: Raw Markdown / Text Content -->
                ${
                  activeTab === 'content'
                    ? `
                  <div class="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-3">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span class="text-xs font-bold text-slate-300">${t('tabRawContent')} (${currentEvent.content.length} characters)</span>
                      <button id="btn-copy-tab-content" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer">
                        ${icons.copy}
                        <span>${t('copyContent')}</span>
                      </button>
                    </div>
                    <pre class="font-mono text-xs text-slate-300 whitespace-pre-wrap break-all max-h-96 overflow-y-auto leading-relaxed p-2 rounded bg-slate-900/50">${escapeHtml(currentEvent.content || '(empty content)')}</pre>
                  </div>
                `
                    : ''
                }

                <!-- Tab 3: Complete Nostr JSON Event -->
                ${
                  activeTab === 'json'
                    ? `
                  <div class="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-3">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span class="text-xs font-bold text-slate-300 font-mono">Unsigned Nostr Event JSON</span>
                      <button id="btn-copy-single-json" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer">
                        ${icons.copy}
                        <span>${t('copyJson')}</span>
                      </button>
                    </div>
                    <pre class="font-mono text-[11px] text-cyan-300 whitespace-pre-wrap break-all max-h-96 overflow-y-auto leading-relaxed p-2 rounded bg-slate-900/50">${escapeHtml(JSON.stringify(currentEvent, null, 2))}</pre>
                  </div>
                `
                    : ''
                }

              </div>
            `
            }
          </div>

        </div>

        <!-- Footer Actions -->
        <div class="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div class="flex items-center gap-2">
            <button id="btn-dryrun-copy-all" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer">
              ${icons.copy}
              <span>${t('copyAllEventsJson')}</span>
            </button>
            <button id="btn-dryrun-download" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer">
              ${icons.download}
              <span>${t('downloadJson')}</span>
            </button>
          </div>

          <div class="flex items-center gap-2">
            <button id="btn-dryrun-close-bottom" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer">
              ${t('closeModal')}
            </button>
            ${
              onProceed
                ? `
              <button id="btn-dryrun-proceed" class="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer">
                ${icons.zap}
                <span>${opts.proceedButtonText || t('proceedMigration')}</span>
              </button>
            `
                : ''
            }
          </div>
        </div>

      </div>
    `;

    bindModalEvents();
  };

  const close = () => {
    backdrop.classList.add('opacity-0');
    setTimeout(() => {
      if (backdrop.parentNode === modalRoot) {
        modalRoot.removeChild(backdrop);
      }
    }, 150);
  };

  const bindModalEvents = () => {
    // Close buttons
    backdrop.querySelector('#modal-dryrun-close-btn')?.addEventListener('click', close);
    backdrop.querySelector('#btn-dryrun-close-bottom')?.addEventListener('click', close);

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close();
    });

    // Search input
    const searchInput = backdrop.querySelector('#dryrun-search') as HTMLInputElement | null;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = (e.target as HTMLInputElement).value;
        renderModalContent();
      });
    }

    // Event selection
    backdrop.querySelectorAll('.dryrun-event-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        const idx = Number((e.currentTarget as HTMLElement).getAttribute('data-idx'));
        if (!isNaN(idx)) {
          selectedIndex = idx;
          renderModalContent();
        }
      });
    });

    // Tab buttons
    backdrop.querySelectorAll('.dryrun-tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tab = (e.currentTarget as HTMLElement).getAttribute('data-tab') as 'preview' | 'content' | 'json';
        if (tab) {
          activeTab = tab;
          renderModalContent();
        }
      });
    });

    // Copy single content
    backdrop.querySelector('#btn-copy-tab-content')?.addEventListener('click', () => {
      const currentEv = events[selectedIndex] || events[0];
      if (currentEv) {
        navigator.clipboard.writeText(currentEv.content);
        showToast(t('copiedContent'), 'success');
      }
    });

    // Copy single JSON
    backdrop.querySelector('#btn-copy-single-json')?.addEventListener('click', () => {
      const currentEv = events[selectedIndex] || events[0];
      if (currentEv) {
        navigator.clipboard.writeText(JSON.stringify(currentEv, null, 2));
        showToast(t('copiedJson'), 'success');
      }
    });

    // Copy All Events JSON
    backdrop.querySelector('#btn-dryrun-copy-all')?.addEventListener('click', () => {
      navigator.clipboard.writeText(JSON.stringify(events, null, 2));
      showToast(t('copiedJson'), 'success');
    });

    // Download Events JSON
    backdrop.querySelector('#btn-dryrun-download')?.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `x2nostr-dryrun-${events[0]?.kind || 'events'}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(t('downloadJson') + ' started!', 'info');
    });

    // Proceed with Migration
    backdrop.querySelector('#btn-dryrun-proceed')?.addEventListener('click', () => {
      close();
      if (onProceed) {
        onProceed();
      }
    });
  };

  modalRoot.appendChild(backdrop);
  renderModalContent();

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      close();
      window.removeEventListener('keydown', handleKeydown);
    }
  };
  window.addEventListener('keydown', handleKeydown);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Lightweight safe Markdown renderer for client-side visual inspection.
 */
function renderSimpleMarkdownPreview(md: string): string {
  if (!md || !md.trim()) return '<p class="text-slate-500 italic">No content</p>';

  let html = md;

  // Code blocks: ```lang ... ```
  html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
    return `<pre class="bg-slate-950 p-3 rounded-xl border border-slate-800 overflow-x-auto text-[11px] font-mono text-blue-300 my-3"><code>${escapeHtml(code.trim())}</code></pre>`;
  });

  // Inline code: `...`
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 font-mono text-[11px]">$1</code>');

  // Headings
  html = html.replace(/^######\s+(.*)$/gm, '<h6 class="text-xs font-bold text-white mt-3 mb-1">$1</h6>');
  html = html.replace(/^#####\s+(.*)$/gm, '<h5 class="text-sm font-bold text-white mt-3 mb-1">$1</h5>');
  html = html.replace(/^####\s+(.*)$/gm, '<h4 class="text-sm font-bold text-white mt-3 mb-1">$1</h4>');
  html = html.replace(/^###\s+(.*)$/gm, '<h3 class="text-base font-bold text-white mt-4 mb-2">$1</h3>');
  html = html.replace(/^##\s+(.*)$/gm, '<h2 class="text-lg font-bold text-white mt-4 mb-2">$1</h2>');
  html = html.replace(/^#\s+(.*)$/gm, '<h1 class="text-xl font-extrabold text-white mt-5 mb-2">$1</h1>');

  // Images: ![alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<div class="my-3"><img src="$2" alt="$1" class="max-h-64 rounded-xl border border-slate-700 object-cover" loading="lazy" /></div>');

  // Links: [title](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline font-medium">$1</a>');

  // Blockquotes: > ...
  html = html.replace(/^\>\s+(.*)$/gm, '<blockquote class="border-l-4 border-blue-500 pl-3 py-1 my-2 bg-blue-950/20 text-slate-300 italic">$1</blockquote>');

  // Horizontal rules: ---
  html = html.replace(/^---$/gm, '<hr class="border-slate-800 my-4" />');

  // Bold & Italics
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-300">$1</em>');
  html = html.replace(/~~([^~]+)~~/g, '<del class="line-through text-slate-500">$1</del>');

  // Lists: - ...
  html = html.replace(/^- (.*)$/gm, '<li class="ml-4 list-disc text-slate-300">$1</li>');

  // Paragraphs
  const paragraphs = html.split(/\n\n+/);
  return paragraphs
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<h') || trimmed.startsWith('<pre') || trimmed.startsWith('<blockquote') || trimmed.startsWith('<hr') || trimmed.startsWith('<div') || trimmed.startsWith('<li')) {
        return trimmed;
      }
      return `<p class="my-2 leading-relaxed text-slate-300">${trimmed.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('');
}
