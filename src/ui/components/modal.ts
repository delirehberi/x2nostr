import { nostrService } from '../../services/nostr';
import { t } from '../../services/i18n';
import { icons } from '../icons';
import { showToast } from '../toast';

export function showModal(title: string, contentHtml: string): void {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return;

  const backdrop = document.createElement('div');
  backdrop.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity';
  
  backdrop.innerHTML = `
    <div class="relative w-full max-w-lg glass-card bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" role="dialog" aria-modal="true">
      <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
        <h3 class="text-xl font-bold text-slate-900 flex items-center gap-2.5">
          ${title}
        </h3>
        <button id="modal-close-btn" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
          ${icons.x}
        </button>
      </div>
      <div class="text-sm text-slate-600">
        ${contentHtml}
      </div>
    </div>
  `;

  modalRoot.appendChild(backdrop);

  const close = () => {
    backdrop.classList.add('opacity-0');
    setTimeout(() => {
      if (backdrop.parentNode === modalRoot) {
        modalRoot.removeChild(backdrop);
      }
    }, 150);
  };

  const closeBtn = backdrop.querySelector('#modal-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', close);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      close();
      window.removeEventListener('keydown', handleKeydown);
    }
  };
  window.addEventListener('keydown', handleKeydown);
}

export function showComingSoonModal(info: {
  name: string;
  phase: number;
  targetKind: string;
  descKey: string;
  iconName: keyof typeof icons;
}): void {
  const content = `
    <div class="space-y-4">
      <div class="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
        <span class="p-2 rounded-lg bg-amber-100 text-amber-700">${icons[info.iconName] || icons.zap}</span>
        <div>
          <div class="text-xs font-semibold uppercase tracking-wide text-amber-700">${t('statusComingSoon')} — Phase ${info.phase}</div>
          <div class="text-sm font-bold text-slate-900">${info.name}</div>
        </div>
      </div>

      <p class="text-sm text-slate-600 leading-relaxed">
        ${t('comingSoonDesc', { phase: info.phase, name: info.name })}
      </p>

      <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
        <div class="text-xs text-slate-500">
          <strong class="text-slate-700">${t('targetNip')}:</strong>
          <span class="font-mono text-purple-700 font-medium ml-1">${info.targetKind}</span>
        </div>
        <div class="text-xs text-slate-500">
          <strong class="text-slate-700">Format:</strong>
          <span class="text-slate-600 ml-1">Native Browser CSV / JSON / XML Parser</span>
        </div>
      </div>

      <div class="pt-3 flex justify-end gap-3">
        <a href="https://github.com/delirehberi/move-to-nostr.emre.xyz" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-colors flex items-center gap-2 cursor-pointer">
          ${icons.externalLink}
          <span>${t('githubRepo')}</span>
        </a>
      </div>
    </div>
  `;

  showModal(t('comingSoonTitle', { name: info.name }), content);
}

export function showRelayModal(): void {
  const renderRelayList = () => {
    const relays = nostrService.getRelays();
    return relays
      .map(
        (r) => `
      <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
        <div class="flex items-center gap-2 overflow-hidden">
          <span class="w-2 h-2 rounded-full ${r.write ? 'bg-emerald-500' : 'bg-slate-400'}"></span>
          <span class="text-xs font-mono text-slate-800 truncate" title="${r.url}">${r.url}</span>
        </div>
        <div class="flex items-center gap-2">
          <button data-url="${r.url}" class="btn-remove-relay text-xs px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-medium transition-colors cursor-pointer">
            ${t('removeRelay')}
          </button>
        </div>
      </div>
    `
      )
      .join('');
  };

  const modalHtml = `
    <div class="space-y-4">
      <p class="text-xs text-slate-500 leading-relaxed">
        ${t('relayModalDesc')}
      </p>

      <!-- Add Relay Input -->
      <div class="flex gap-2">
        <input id="input-new-relay" type="text" placeholder="${t('addRelayPlaceholder')}" class="grow px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono" />
        <button id="btn-add-relay" class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-xs">
          ${t('addRelayBtn')}
        </button>
      </div>

      <!-- Relays List -->
      <div id="relay-items-container" class="space-y-2 max-h-60 overflow-y-auto pr-1">
        ${renderRelayList()}
      </div>
    </div>
  `;

  showModal(t('relayModalTitle'), modalHtml);

  const container = document.getElementById('modal-root');
  if (!container) return;

  const bindEvents = () => {
    const btnAdd = container.querySelector('#btn-add-relay') as HTMLButtonElement | null;
    const inputAdd = container.querySelector('#input-new-relay') as HTMLInputElement | null;
    const itemsContainer = container.querySelector('#relay-items-container');

    if (btnAdd && inputAdd && itemsContainer) {
      btnAdd.onclick = () => {
        const url = inputAdd.value.trim();
        if (!url) return;
        try {
          const added = nostrService.addRelay(url);
          if (added) {
            inputAdd.value = '';
            itemsContainer.innerHTML = renderRelayList();
            bindEvents();
            showToast('Relay added successfully!', 'success');
          } else {
            showToast('Relay is already configured', 'warning');
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Invalid relay URL';
          showToast(msg, 'error');
        }
      };
    }

    const removeBtns = container.querySelectorAll('.btn-remove-relay');
    removeBtns.forEach((btn) => {
      (btn as HTMLButtonElement).onclick = (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const url = target.getAttribute('data-url');
        if (url) {
          nostrService.removeRelay(url);
          if (itemsContainer) {
            itemsContainer.innerHTML = renderRelayList();
            bindEvents();
          }
          showToast('Relay removed', 'info');
        }
      };
    });
  };

  bindEvents();
}

export function showConfirmModal(opts: {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}): void {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return;

  const backdrop = document.createElement('div');
  backdrop.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity';

  backdrop.innerHTML = `
    <div class="relative w-full max-w-md glass-card bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" role="dialog" aria-modal="true">
      <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <span class="text-amber-500">${icons.alertCircle}</span>
          <span>${opts.title}</span>
        </h3>
        <button id="modal-confirm-close-btn" class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
          ${icons.x}
        </button>
      </div>
      <p class="text-xs text-slate-600 leading-relaxed mb-6">
        ${opts.message}
      </p>
      <div class="flex items-center justify-end gap-2.5">
        <button id="modal-btn-cancel" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer">
          ${opts.cancelText || t('confirmDeleteModalCancel')}
        </button>
        <button id="modal-btn-confirm" class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer">
          ${opts.confirmText || t('confirmDeleteModalConfirm')}
        </button>
      </div>
    </div>
  `;

  modalRoot.appendChild(backdrop);

  const close = () => {
    backdrop.classList.add('opacity-0');
    setTimeout(() => {
      if (backdrop.parentNode === modalRoot) {
        modalRoot.removeChild(backdrop);
      }
    }, 150);
  };

  const closeBtn = backdrop.querySelector('#modal-confirm-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', () => { close(); opts.onCancel?.(); });

  const cancelBtn = backdrop.querySelector('#modal-btn-cancel');
  if (cancelBtn) cancelBtn.addEventListener('click', () => { close(); opts.onCancel?.(); });

  const confirmBtn = backdrop.querySelector('#modal-btn-confirm');
  if (confirmBtn) confirmBtn.addEventListener('click', () => { close(); opts.onConfirm(); });

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) { close(); opts.onCancel?.(); }
  });
}
