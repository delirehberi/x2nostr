import { i18n, t } from '../../services/i18n';
import { nostrService } from '../../services/nostr';
import { icons } from '../icons';
import { showRelayModal } from './modal';
import { showToast } from '../toast';

export function renderHeader(container: HTMLElement): void {
  const pubkey = nostrService.getPubkey();
  const npub = nostrService.getNpub();
  const username = nostrService.getUsername();
  const currentLocale = i18n.getLocale();
  const relays = nostrService.getRelays();
  const activeRelayCount = relays.filter((r) => r.write).length;


  container.innerHTML = `
    <header class="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 border-b border-slate-200 shadow-xs transition-all">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <!-- Logo & Brand -->
        <a href="#" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
            ${icons.zap}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xl font-bold tracking-tight text-slate-900 font-mono">x2<span class="text-purple-600">nostr</span></span>
              <span class="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">v1.0</span>
            </div>
            <p class="text-[11px] text-slate-500 hidden sm:block">x2nostr.emre.xyz</p>
          </div>
        </a>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <!-- Relay Status Badge -->
          <button id="btn-relays" class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-medium text-slate-700 transition-colors cursor-pointer" title="${t('relaysConfig')}">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>${activeRelayCount} ${t('activeRelays')}</span>
            <span class="text-slate-500">${icons.server}</span>
          </button>

          <!-- Language Selector -->
          <div class="relative inline-block">
            <select id="select-lang" class="appearance-none bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer font-medium">
              <option value="en" class="bg-white text-slate-900" ${currentLocale === 'en' ? 'selected' : ''}>🇬🇧 EN</option>
              <option value="tr" class="bg-white text-slate-900" ${currentLocale === 'tr' ? 'selected' : ''}>🇹🇷 TR</option>
              <option value="es" class="bg-white text-slate-900" ${currentLocale === 'es' ? 'selected' : ''}>🇪🇸 ES</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <svg class="fill-current h-3 w-3" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
            </div>
          </div>

          <!-- Nostr Auth Button / Profile -->
          ${
            pubkey && npub
              ? `
              <div class="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg p-1 pl-3">
                <div class="flex items-center gap-1.5 text-xs font-mono text-purple-900 font-medium">
                  <span class="w-2 h-2 rounded-full bg-purple-600"></span>
                  <span title="${npub}">${username}</span>
                </div>
                <button id="btn-copy-npub" class="p-1.5 rounded hover:bg-purple-100 text-purple-700 transition-colors cursor-pointer" title="Copy npub">
                  ${icons.copy}
                </button>
                <button id="btn-disconnect" class="text-xs px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-medium transition-colors cursor-pointer">
                  ${t('disconnect')}
                </button>
              </div>
            `
              : `
              <button id="btn-connect-nostr" class="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium text-xs sm:text-sm shadow-sm shadow-purple-600/20 hover:shadow transition-all cursor-pointer">
                ${icons.key}
                <span>${t('connectNostr')}</span>
              </button>
            `
          }
        </div>
      </div>
    </header>
  `;

  // Attach Event Handlers
  const langSelect = container.querySelector('#select-lang') as HTMLSelectElement | null;
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      i18n.setLocale(target.value as 'en' | 'tr' | 'es');
    });
  }

  const btnRelays = container.querySelector('#btn-relays') as HTMLButtonElement | null;
  if (btnRelays) {
    btnRelays.addEventListener('click', () => {
      showRelayModal();
    });
  }

  const btnConnect = container.querySelector('#btn-connect-nostr') as HTMLButtonElement | null;
  if (btnConnect) {
    btnConnect.addEventListener('click', async () => {
      try {
        btnConnect.disabled = true;
        btnConnect.innerHTML = `
          <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>${t('connecting')}</span>
        `;
        await nostrService.connect();
        showToast(t('connected'), 'success');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t('extensionNotFound');
        showToast(msg, 'error');
        renderHeader(container);
      }
    });
  }

  const btnCopyNpub = container.querySelector('#btn-copy-npub') as HTMLButtonElement | null;
  if (btnCopyNpub && npub) {
    btnCopyNpub.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(npub);
        showToast('npub copied to clipboard!', 'success');
      } catch {
        showToast('Failed to copy npub', 'error');
      }
    });
  }

  const btnDisconnect = container.querySelector('#btn-disconnect') as HTMLButtonElement | null;
  if (btnDisconnect) {
    btnDisconnect.addEventListener('click', () => {
      nostrService.disconnect();
      showToast('Disconnected from Nostr', 'info');
    });
  }
}
