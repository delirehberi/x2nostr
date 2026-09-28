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

  const isRouteActive = (route: string) => {
    if (route === '/importers') {
      return currentRoute === '/importers' || currentRoute.startsWith('/importers/');
    }
    return currentRoute === route;
  };
  const truncatedNpub = npub ? `${npub.slice(0, 10)}…${npub.slice(-4)}` : '';
  const userInitials = username ? username.slice(0, 2).toUpperCase() : 'NP';

  container.innerHTML = `
    <header class="sticky top-3 z-40 w-full px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-all">
      <div class="nav-floating-pill rounded-2xl sm:rounded-full px-4 sm:px-6 h-14 flex items-center justify-between">
        <!-- Brand Wordmark & Icon -->
        <div class="flex items-center gap-6">
          <a href="/" data-route="/" class="nav-link flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-white shadow-xs">
              ${icons.zap}
            </div>
            <div class="flex items-center gap-1.5 font-display font-bold text-lg tracking-tight text-[var(--color-ink)]">
              <span>x2<span class="text-[var(--color-accent)]">nostr</span></span>
              <span class="text-[10px] font-mono font-medium uppercase px-1.5 py-0.5 rounded bg-[var(--color-paper-subtle)] text-[var(--color-ink-muted)] border border-[var(--color-border)]">v1.0</span>
            </div>
          </a>

          <!-- Desktop Navigation Links -->
          <nav class="hidden md:flex items-center gap-1 text-xs font-semibold">
            <a href="/" data-route="/" class="nav-link px-3 py-1.5 rounded-full transition-colors ${
              isRouteActive('/') 
                ? 'bg-[var(--color-ink)] text-[var(--color-ink-inverse)]' 
                : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-subtle)]'
            }">
              ${t('navHome')}
            </a>
            <a href="/importers" data-route="/importers" class="nav-link px-3 py-1.5 rounded-full transition-colors ${
              isRouteActive('/importers') 
                ? 'bg-[var(--color-ink)] text-[var(--color-ink-inverse)]' 
                : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-subtle)]'
            }">
              ${t('navImporters')}
            </a>
            <a href="/getting-started" data-route="/getting-started" class="nav-link px-3 py-1.5 rounded-full transition-colors ${
              isRouteActive('/getting-started') 
                ? 'bg-[var(--color-ink)] text-[var(--color-ink-inverse)]' 
                : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-subtle)]'
            }">
              ${t('navGettingStarted')}
            </a>
            <a href="/docs" data-route="/docs" class="nav-link px-3 py-1.5 rounded-full transition-colors ${
              isRouteActive('/docs') 
                ? 'bg-[var(--color-ink)] text-[var(--color-ink-inverse)]' 
                : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-subtle)]'
            }">
              ${t('navDocs')}
            </a>
            <a href="mailto:nostr@emre.xyz" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-full transition-colors text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-subtle)] flex items-center gap-1">
              <span>${t('navSupport')}</span>
            </a>
          </nav>
        </div>

        <!-- Header Actions: Relay, Lang, Auth -->
        <div class="flex items-center gap-2">
          <!-- Relay Status & Dropdown -->
          <div class="relative">
            <button id="btn-relay-toggle" class="p-2 rounded-full hover:bg-[var(--color-paper-subtle)] border border-[var(--color-border-subtle)] text-[var(--color-ink)] transition-colors relative cursor-pointer flex items-center justify-center" title="${t('relaysConfig')}">
              ${icons.server}
              <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </button>

            <!-- Relay Dropdown Menu -->
            <div id="relay-dropdown" class="hidden absolute right-0 mt-2 w-64 card-workbench py-3 px-3 z-50 shadow-lg">
              <div class="flex items-center justify-between px-2 pb-2 border-b border-[var(--color-border-subtle)] mb-2">
                <span class="text-xs font-semibold text-[var(--color-ink)]">${t('relaysSummary', { count: activeRelayCount })}</span>
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div class="max-h-48 overflow-y-auto space-y-1 py-1">
                ${
                  relays.length > 0
                    ? relays
                        .map(
                          (r) => `
                      <div class="flex items-center justify-between text-[11px] px-2 py-1.5 rounded-lg bg-[var(--color-paper-subtle)] border border-[var(--color-border-subtle)] text-[var(--color-ink)] font-mono">
                        <span class="truncate max-w-[170px]" title="${r.url}">${r.url.replace('wss://', '')}</span>
                        <span class="w-1.5 h-1.5 rounded-full ${r.write ? 'bg-emerald-500' : 'bg-amber-400'}"></span>
                      </div>
                    `
                        )
                        .join('')
                    : `<p class="text-xs text-[var(--color-ink-muted)] p-2 text-center">No relays connected</p>`
                }
              </div>
              <div class="pt-2 border-t border-[var(--color-border-subtle)] mt-2">
                <button id="btn-open-relay-modal" class="w-full text-center text-xs font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)] py-1.5 px-2 rounded-lg transition-colors cursor-pointer">
                  ${t('configureRelays')}
                </button>
              </div>
            </div>
          </div>

          <!-- Language Selector -->
          <div class="flex items-center gap-0.5 bg-[var(--color-paper-subtle)] p-0.5 rounded-full border border-[var(--color-border-subtle)]">
            <button data-lang="en" class="btn-lang px-2 py-1 text-xs rounded-full transition-all cursor-pointer ${
              currentLocale === 'en' ? 'bg-white font-bold text-[var(--color-ink)] shadow-2xs' : 'opacity-60 hover:opacity-100 text-[var(--color-ink-muted)]'
            }" title="English">🇬🇧</button>
            <button data-lang="tr" class="btn-lang px-2 py-1 text-xs rounded-full transition-all cursor-pointer ${
              currentLocale === 'tr' ? 'bg-white font-bold text-[var(--color-ink)] shadow-2xs' : 'opacity-60 hover:opacity-100 text-[var(--color-ink-muted)]'
            }" title="Türkçe">🇹🇷</button>
            <button data-lang="es" class="btn-lang px-2 py-1 text-xs rounded-full transition-all cursor-pointer ${
              currentLocale === 'es' ? 'bg-white font-bold text-[var(--color-ink)] shadow-2xs' : 'opacity-60 hover:opacity-100 text-[var(--color-ink-muted)]'
            }" title="Español">🇪🇸</button>
          </div>

          <!-- Auth / Connect Button -->
          ${
            pubkey && npub
              ? `
              <div class="relative">
                <button id="btn-user-toggle" class="relative flex items-center justify-center p-0.5 rounded-full border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all cursor-pointer" title="${username}">
                  <div class="w-8 h-8 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center font-bold text-xs">
                    ${userInitials}
                  </div>
                  <span class="w-2 h-2 rounded-full bg-emerald-500 absolute bottom-0 right-0 ring-2 ring-white"></span>
                </button>

                <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-56 card-workbench py-3 px-3 z-50 shadow-lg">
                  <div class="px-2 pb-2.5 border-b border-[var(--color-border-subtle)] mb-2">
                    <p class="text-xs font-bold text-[var(--color-ink)] truncate">${username}</p>
                    <p class="text-[11px] font-mono text-[var(--color-ink-muted)] truncate" title="${npub}">${truncatedNpub}</p>
                  </div>
                  <div class="space-y-1">
                    <button id="btn-copy-npub" class="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-paper-subtle)] rounded-lg transition-colors cursor-pointer">
                      ${icons.copy}
                      <span>Copy npub</span>
                    </button>
                    <button id="btn-disconnect" class="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] rounded-lg transition-colors cursor-pointer">
                      ${icons.logOut}
                      <span>${t('disconnect')}</span>
                    </button>
                  </div>
                </div>
              </div>
            `
              : `
              <button id="btn-connect-nostr" class="btn-primary text-xs py-1.5 px-3.5 rounded-full" title="${t('connectNostr')}">
                ${icons.logIn}
                <span class="hidden sm:inline">${t('connectNostr')}</span>
              </button>
            `
          }

          <!-- Mobile Hamburger Toggle -->
          <button id="btn-mobile-menu" class="md:hidden p-2 rounded-full text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-subtle)] transition-colors cursor-pointer" title="Toggle menu">
            ${icons.menu}
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown Drawer -->
      <div id="mobile-menu" class="hidden md:hidden card-workbench mt-2 p-4 space-y-3 shadow-lg">
        <nav class="flex flex-col gap-1 text-sm font-semibold">
          <a href="/" data-route="/" class="nav-link px-3 py-2 rounded-xl transition-colors ${
            isRouteActive('/') ? 'bg-[var(--color-ink)] text-[var(--color-ink-inverse)]' : 'text-[var(--color-ink)] hover:bg-[var(--color-paper-subtle)]'
          }">
            ${t('navHome')}
          </a>
          <a href="/importers" data-route="/importers" class="nav-link px-3 py-2 rounded-xl transition-colors ${
            isRouteActive('/importers') ? 'bg-[var(--color-ink)] text-[var(--color-ink-inverse)]' : 'text-[var(--color-ink)] hover:bg-[var(--color-paper-subtle)]'
          }">
            ${t('navImporters')}
          </a>
          <a href="/getting-started" data-route="/getting-started" class="nav-link px-3 py-2 rounded-xl transition-colors ${
            isRouteActive('/getting-started') ? 'bg-[var(--color-ink)] text-[var(--color-ink-inverse)]' : 'text-[var(--color-ink)] hover:bg-[var(--color-paper-subtle)]'
          }">
            ${t('navGettingStarted')}
          </a>
          <a href="/docs" data-route="/docs" class="nav-link px-3 py-2 rounded-xl transition-colors ${
            isRouteActive('/docs') ? 'bg-[var(--color-ink)] text-[var(--color-ink-inverse)]' : 'text-[var(--color-ink)] hover:bg-[var(--color-paper-subtle)]'
          }">
            ${t('navDocs')}
          </a>
          <a href="mailto:nostr@emre.xyz" target="_blank" rel="noopener noreferrer" class="px-3 py-2 rounded-xl text-[var(--color-ink)] hover:bg-[var(--color-paper-subtle)] flex items-center justify-between">
            <span>${t('navSupport')}</span>
            ${icons.externalLink}
          </a>
        </nav>

        <div class="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-3">
          <button id="btn-mobile-relay-modal" class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-paper-subtle)] border border-[var(--color-border-subtle)] text-xs font-medium text-[var(--color-ink)] transition-colors cursor-pointer">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
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
          <svg class="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
