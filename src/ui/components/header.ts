import { i18n, t } from '../../services/i18n';
import { nostrService } from '../../services/nostr';
import { router, Route } from '../../services/router';
import { icons } from '../icons';
import { showRelayModal } from './modal';
import { showToast } from '../toast';

export function renderHeader(container: HTMLElement): void {
  const pubkey = nostrService.getPubkey();
  const npub = nostrService.getNpub();
  const username = nostrService.getUsername();
  const currentLocale = i18n.getLocale();
  const relays = nostrService.getRelays();
  const activeRelays = relays.filter((r) => r.write);
  const activeRelayCount = activeRelays.length;
  const currentRoute = router.getRoute();

  const isRouteActive = (route: Route) => currentRoute === route;
  const truncatedNpub = npub ? `${npub.slice(0, 10)}...${npub.slice(-4)}` : '';
  const userInitials = username ? username.slice(0, 2).toUpperCase() : 'NP';

  container.innerHTML = `
    <header class="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 border-b border-slate-200/80 shadow-xs transition-all">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <!-- Logo & Brand (Domain Removed) -->
        <div class="flex items-center gap-6">
          <a href="/" data-route="/" class="nav-link flex items-center gap-3 group">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              ${icons.zap}
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xl font-bold tracking-tight text-slate-900 font-mono">x2<span class="text-purple-600">nostr</span></span>
              <span class="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">v1.0</span>
            </div>
          </a>

          <!-- Desktop Navigation Links -->
          <nav class="hidden md:flex items-center gap-1 text-xs font-semibold">
            <a href="/" data-route="/" class="nav-link px-3 py-2 rounded-lg transition-colors ${
              isRouteActive('/') ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
            }">
              ${t('navHome')}
            </a>
            <a href="/getting-started" data-route="/getting-started" class="nav-link px-3 py-2 rounded-lg transition-colors ${
              isRouteActive('/getting-started') ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
            }">
              ${t('navGettingStarted')}
            </a>
            <a href="/docs" data-route="/docs" class="nav-link px-3 py-2 rounded-lg transition-colors ${
              isRouteActive('/docs') ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
            }">
              ${t('navDocs')}
            </a>
            <a href="mailto:nostr@emre.xyz" target="_blank" rel="noopener noreferrer" class="px-3 py-2 rounded-lg transition-colors text-slate-600 hover:text-purple-600 hover:bg-slate-50 flex items-center gap-1.5">
              <span>${t('navSupport')}</span>
            </a>
          </nav>
        </div>

        <!-- Right Header Actions -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Relay Status Symbol & Dropdown -->
          <div class="relative">
            <button id="btn-relay-toggle" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 transition-colors relative cursor-pointer flex items-center justify-center" title="${t('relaysConfig')}">
              ${icons.server}
              <span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse"></span>
            </button>

            <!-- Relay Dropdown Menu -->
            <div id="relay-dropdown" class="hidden absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 px-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div class="flex items-center justify-between px-2 pb-2 border-b border-slate-100 mb-2">
                <span class="text-xs font-bold text-slate-800">${t('relaysSummary', { count: activeRelayCount })}</span>
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div class="max-h-48 overflow-y-auto space-y-1 py-1">
                ${
                  relays.length > 0
                    ? relays
                        .map(
                          (r) => `
                      <div class="flex items-center justify-between text-[11px] px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 font-mono">
                        <span class="truncate max-w-[170px]" title="${r.url}">${r.url.replace('wss://', '')}</span>
                        <span class="w-1.5 h-1.5 rounded-full ${r.write ? 'bg-emerald-500' : 'bg-amber-400'}"></span>
                      </div>
                    `
                        )
                        .join('')
                    : `<p class="text-xs text-slate-400 p-2 text-center">No relays connected</p>`
                }
              </div>
              <div class="pt-2 border-t border-slate-100 mt-2">
                <button id="btn-open-relay-modal" class="w-full text-center text-xs font-semibold text-purple-600 hover:text-purple-700 hover:bg-purple-50 py-1.5 px-2 rounded-lg transition-colors cursor-pointer">
                  ${t('configureRelays')}
                </button>
              </div>
            </div>
          </div>

          <!-- Flag-only Language Selector -->
          <div class="flex items-center gap-0.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button data-lang="en" class="btn-lang px-2 py-1 text-xs rounded-lg transition-all cursor-pointer ${
              currentLocale === 'en' ? 'bg-white shadow-xs font-bold text-slate-900 ring-1 ring-slate-200/60' : 'opacity-60 hover:opacity-100 text-slate-700'
            }" title="English">🇬🇧</button>
            <button data-lang="tr" class="btn-lang px-2 py-1 text-xs rounded-lg transition-all cursor-pointer ${
              currentLocale === 'tr' ? 'bg-white shadow-xs font-bold text-slate-900 ring-1 ring-slate-200/60' : 'opacity-60 hover:opacity-100 text-slate-700'
            }" title="Türkçe">🇹🇷</button>
            <button data-lang="es" class="btn-lang px-2 py-1 text-xs rounded-lg transition-all cursor-pointer ${
              currentLocale === 'es' ? 'bg-white shadow-xs font-bold text-slate-900 ring-1 ring-slate-200/60' : 'opacity-60 hover:opacity-100 text-slate-700'
            }" title="Español">🇪🇸</button>
          </div>

          <!-- Auth & User Profile Avatar Menu -->
          ${
            pubkey && npub
              ? `
              <div class="relative">
                <button id="btn-user-toggle" class="relative flex items-center justify-center p-0.5 rounded-full hover:ring-2 hover:ring-purple-300 transition-all cursor-pointer" title="${username}">
                  <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-white">
                    ${userInitials}
                  </div>
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 ring-2 ring-white"></span>
                </button>

                <!-- User Dropdown Menu -->
                <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 px-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div class="px-2 pb-2.5 border-b border-slate-100 mb-2">
                    <p class="text-xs font-bold text-slate-900 truncate">${username}</p>
                    <p class="text-[11px] font-mono text-slate-500 truncate" title="${npub}">${truncatedNpub}</p>
                  </div>
                  <div class="space-y-1">
                    <button id="btn-copy-npub" class="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer">
                      ${icons.copy}
                      <span>Copy npub</span>
                    </button>
                    <button id="btn-disconnect" class="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                      ${icons.logOut}
                      <span>${t('disconnect')}</span>
                    </button>
                  </div>
                </div>
              </div>
            `
              : `
              <button id="btn-connect-nostr" class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium text-xs shadow-sm shadow-purple-600/20 hover:shadow transition-all cursor-pointer" title="${t('connectNostr')}">
                ${icons.logIn}
                <span class="hidden sm:inline">${t('connectNostr')}</span>
              </button>
            `
          }

          <!-- Mobile Hamburger Toggle -->
          <button id="btn-mobile-menu" class="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer" title="Toggle menu">
            ${icons.menu}
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown Drawer -->
      <div id="mobile-menu" class="hidden md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-4 pt-3 pb-5 space-y-3">
        <nav class="flex flex-col gap-1 text-sm font-semibold">
          <a href="/" data-route="/" class="nav-link px-3 py-2.5 rounded-xl transition-colors ${
            isRouteActive('/') ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
          }">
            ${t('navHome')}
          </a>
          <a href="/getting-started" data-route="/getting-started" class="nav-link px-3 py-2.5 rounded-xl transition-colors ${
            isRouteActive('/getting-started') ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
          }">
            ${t('navGettingStarted')}
          </a>
          <a href="/docs" data-route="/docs" class="nav-link px-3 py-2.5 rounded-xl transition-colors ${
            isRouteActive('/docs') ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
          }">
            ${t('navDocs')}
          </a>
          <a href="mailto:nostr@emre.xyz" target="_blank" rel="noopener noreferrer" class="px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center justify-between">
            <span>${t('navSupport')}</span>
            ${icons.externalLink}
          </a>
        </nav>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button data-lang="en" class="btn-lang px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
              currentLocale === 'en' ? 'bg-white shadow-xs font-bold text-slate-900 ring-1 ring-slate-200/60' : 'opacity-60 hover:opacity-100 text-slate-700'
            }" title="English">🇬🇧</button>
            <button data-lang="tr" class="btn-lang px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
              currentLocale === 'tr' ? 'bg-white shadow-xs font-bold text-slate-900 ring-1 ring-slate-200/60' : 'opacity-60 hover:opacity-100 text-slate-700'
            }" title="Türkçe">🇹🇷</button>
            <button data-lang="es" class="btn-lang px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
              currentLocale === 'es' ? 'bg-white shadow-xs font-bold text-slate-900 ring-1 ring-slate-200/60' : 'opacity-60 hover:opacity-100 text-slate-700'
            }" title="Español">🇪🇸</button>
          </div>

          <button id="btn-mobile-relay-modal" class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-medium text-slate-700 transition-colors cursor-pointer">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>${activeRelayCount} ${t('activeRelays')}</span>
          </button>
        </div>
      </div>
    </header>
  `;

  // --- Attach Event Listeners ---

  // 1. Navigation Links (Desktop & Mobile)
  const navLinks = container.querySelectorAll('.nav-link');
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetRoute = link.getAttribute('data-route') as Route | null;
      if (targetRoute) {
        closeAllDropdowns();
        router.navigate(targetRoute);
      }
    });
  });

  // Dropdowns & Mobile Menu Elements
  const btnRelayToggle = container.querySelector('#btn-relay-toggle') as HTMLButtonElement | null;
  const relayDropdown = container.querySelector('#relay-dropdown') as HTMLElement | null;
  const btnOpenRelayModal = container.querySelector('#btn-open-relay-modal') as HTMLButtonElement | null;
  const btnMobileRelayModal = container.querySelector('#btn-mobile-relay-modal') as HTMLButtonElement | null;

  const btnUserToggle = container.querySelector('#btn-user-toggle') as HTMLButtonElement | null;
  const userDropdown = container.querySelector('#user-dropdown') as HTMLElement | null;

  const btnMobileMenu = container.querySelector('#btn-mobile-menu') as HTMLButtonElement | null;
  const mobileMenu = container.querySelector('#mobile-menu') as HTMLElement | null;

  const closeAllDropdowns = () => {
    relayDropdown?.classList.add('hidden');
    userDropdown?.classList.add('hidden');
    mobileMenu?.classList.add('hidden');
  };

  // 2. Relay Dropdown & Modal Toggle
  if (btnRelayToggle && relayDropdown) {
    btnRelayToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown?.classList.add('hidden');
      mobileMenu?.classList.add('hidden');
      relayDropdown.classList.toggle('hidden');
    });
  }

  if (btnOpenRelayModal) {
    btnOpenRelayModal.addEventListener('click', () => {
      closeAllDropdowns();
      showRelayModal();
    });
  }

  if (btnMobileRelayModal) {
    btnMobileRelayModal.addEventListener('click', () => {
      closeAllDropdowns();
      showRelayModal();
    });
  }

  // 3. User Avatar Profile Dropdown
  if (btnUserToggle && userDropdown) {
    btnUserToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      relayDropdown?.classList.add('hidden');
      mobileMenu?.classList.add('hidden');
      userDropdown.classList.toggle('hidden');
    });
  }

  // 4. Mobile Menu Drawer Toggle
  if (btnMobileMenu && mobileMenu) {
    btnMobileMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      relayDropdown?.classList.add('hidden');
      userDropdown?.classList.add('hidden');
      mobileMenu.classList.toggle('hidden');
    });
  }

  // 5. Click-outside to close open dropdowns
  const handleOutsideClick = (e: MouseEvent) => {
    if (!container.contains(e.target as Node)) {
      closeAllDropdowns();
    }
  };
  document.removeEventListener('click', handleOutsideClick);
  document.addEventListener('click', handleOutsideClick);

  // 6. Flag Language Buttons
  const langButtons = container.querySelectorAll('.btn-lang');
  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetLang = btn.getAttribute('data-lang') as 'en' | 'tr' | 'es' | null;
      if (targetLang && targetLang !== currentLocale) {
        closeAllDropdowns();
        i18n.setLocale(targetLang);
      }
    });
  });

  // 7. Nostr Auth & User Actions
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
        closeAllDropdowns();
      } catch {
        showToast('Failed to copy npub', 'error');
      }
    });
  }

  const btnDisconnect = container.querySelector('#btn-disconnect') as HTMLButtonElement | null;
  if (btnDisconnect) {
    btnDisconnect.addEventListener('click', () => {
      closeAllDropdowns();
      nostrService.disconnect();
      showToast('Disconnected from Nostr', 'info');
    });
  }
}
