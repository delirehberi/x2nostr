import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools';
import { t } from '../../services/i18n';
import { icons } from '../icons';
import { showToast } from '../toast';
import { router } from '../../services/router';

export function renderGettingStartedPage(container: HTMLElement): void {
  let generatedNsec = '';
  let generatedNpub = '';

  container.innerHTML = `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      <!-- Header / Title -->
      <div class="space-y-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-paper-subtle)] border border-[var(--color-border)] text-[var(--color-ink-muted)] text-xs font-mono font-medium">
          <span class="text-[var(--color-accent)]">${icons.key}</span>
          <span>${t('navGettingStarted')}</span>
        </div>
        <h1 class="font-display text-2xl sm:text-4xl font-bold text-[var(--color-ink)] tracking-tight">
          ${t('newbieGuideTitle')}
        </h1>
        <p class="text-xs sm:text-sm text-[var(--color-ink-muted)] max-w-2xl leading-relaxed">
          ${t('newbieGuideSubtitle')}
        </p>
      </div>

      <!-- Step 1: Key Generation / Connection -->
      <div class="card-workbench p-6 sm:p-7 space-y-4">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-lg bg-[var(--color-ink)] text-[var(--color-ink-inverse)] text-xs font-mono font-bold flex items-center justify-center">01</span>
          <h2 class="font-display text-lg font-bold text-[var(--color-ink)]">${t('newbieStep1Title')}</h2>
        </div>
        <p class="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
          ${t('newbieStep1Desc')}
        </p>

        <div class="pt-1 flex flex-wrap gap-3">
          <button id="btn-page-generate-key" class="btn-primary text-xs py-2 px-4">
            ${icons.key}
            <span>${t('generateKeyBtn')}</span>
          </button>
        </div>

        <div id="page-keygen-output-area" class="hidden space-y-3 pt-3">
          <div class="p-3 rounded-lg bg-[var(--color-success-subtle)] border border-[var(--color-success-border)] text-emerald-950 text-xs flex items-center gap-2.5">
            <span class="text-emerald-700">${icons.checkCircle}</span>
            <span>${t('keyGeneratedNotice')}</span>
          </div>

          <div class="space-y-1">
            <label class="text-[10px] font-mono font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">Private Key (nsec — Keep Secret)</label>
            <div class="flex items-center gap-2">
              <input readonly type="password" value="" id="page-input-nsec" class="grow px-3 py-2 text-xs font-mono rounded-lg bg-[var(--color-paper-subtle)] border border-[var(--color-border)] text-[var(--color-ink)]" />
              <button id="page-btn-copy-nsec" class="btn-secondary text-xs py-2 px-3 shrink-0">
                ${t('copyNsec')}
              </button>
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-[10px] font-mono font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">Public Key (npub — Share Freely)</label>
            <div class="flex items-center gap-2">
              <input readonly type="text" value="" id="page-input-npub" class="grow px-3 py-2 text-xs font-mono rounded-lg bg-[var(--color-paper-subtle)] border border-[var(--color-border)] text-[var(--color-ink)]" />
              <button id="page-btn-copy-npub" class="btn-secondary text-xs py-2 px-3 shrink-0">
                ${t('copyNpub')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Signers & Bunker (Amber, Extensions) -->
      <div class="card-workbench p-6 sm:p-7 space-y-4">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-lg bg-[var(--color-ink)] text-[var(--color-ink-inverse)] text-xs font-mono font-bold flex items-center justify-center">02</span>
          <h2 class="font-display text-lg font-bold text-[var(--color-ink)]">${t('newbieStep2Title')}</h2>
        </div>
        <p class="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
          ${t('newbieStep2Desc')}
        </p>

        <!-- Product Links Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <a href="https://getalby.com" target="_blank" rel="noopener noreferrer" class="p-3.5 rounded-lg bg-[var(--color-paper-subtle)] border border-[var(--color-border)] hover:border-[var(--color-border-focus)] transition-colors flex items-center justify-between">
            <div>
              <div class="font-bold text-[var(--color-ink)] text-xs font-display flex items-center gap-1.5">
                <span class="text-[var(--color-accent)]">${icons.zap}</span>
                <span>Alby Extension</span>
              </div>
              <div class="text-[11px] text-[var(--color-ink-muted)] mt-0.5">NIP-07 Browser Extension & Lightning Wallet</div>
            </div>
            <span class="text-[var(--color-ink-muted)] text-xs">${icons.externalLink}</span>
          </a>
          <a href="https://github.com/fiatjaf/nos2x" target="_blank" rel="noopener noreferrer" class="p-3.5 rounded-lg bg-[var(--color-paper-subtle)] border border-[var(--color-border)] hover:border-[var(--color-border-focus)] transition-colors flex items-center justify-between">
            <div>
              <div class="font-bold text-[var(--color-ink)] text-xs font-display flex items-center gap-1.5">
                <span class="text-[var(--color-accent)]">${icons.key}</span>
                <span>nos2x Extension</span>
              </div>
              <div class="text-[11px] text-[var(--color-ink-muted)] mt-0.5">Lightweight NIP-07 Signer</div>
            </div>
            <span class="text-[var(--color-ink-muted)] text-xs">${icons.externalLink}</span>
          </a>
          <a href="https://github.com/greenart7c3/Amber" target="_blank" rel="noopener noreferrer" class="p-3.5 rounded-lg bg-[var(--color-paper-subtle)] border border-[var(--color-border)] hover:border-[var(--color-border-focus)] transition-colors flex items-center justify-between">
            <div>
              <div class="font-bold text-[var(--color-ink)] text-xs font-display flex items-center gap-1.5">
                <span class="text-[var(--color-accent)]">${icons.shield}</span>
                <span>Amber (Android)</span>
              </div>
              <div class="text-[11px] text-[var(--color-ink-muted)] mt-0.5">NIP-46 / NIP-55 Remote Signer Bunker</div>
            </div>
            <span class="text-[var(--color-ink-muted)] text-xs">${icons.externalLink}</span>
          </a>
          <a href="https://primal.net" target="_blank" rel="noopener noreferrer" class="p-3.5 rounded-lg bg-[var(--color-paper-subtle)] border border-[var(--color-border)] hover:border-[var(--color-border-focus)] transition-colors flex items-center justify-between">
            <div>
              <div class="font-bold text-[var(--color-ink)] text-xs font-display flex items-center gap-1.5">
                <span class="text-[var(--color-accent)]">${icons.globe}</span>
                <span>Primal Signer</span>
              </div>
              <div class="text-[11px] text-[var(--color-ink-muted)] mt-0.5">Integrated Web & Mobile Key Manager</div>
            </div>
            <span class="text-[var(--color-ink-muted)] text-xs">${icons.externalLink}</span>
          </a>
        </div>
      </div>

      <!-- Step 3: Migrate Data CTA -->
      <div class="card-workbench p-6 sm:p-7 space-y-4">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-lg bg-[var(--color-ink)] text-[var(--color-ink-inverse)] text-xs font-mono font-bold flex items-center justify-center">03</span>
          <h2 class="font-display text-lg font-bold text-[var(--color-ink)]">${t('newbieStep3Title')}</h2>
        </div>
        <p class="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
          ${t('newbieStep3Desc')}
        </p>
        <div class="pt-1">
          <button id="btn-goto-importers" class="btn-primary text-xs py-2.5 px-4">
            <span>${t('navImporters')}</span>
            ${icons.arrowRight}
          </button>
        </div>
      </div>

      <!-- Step 4: Product Recommendations -->
      <div class="card-workbench p-6 sm:p-7 space-y-4">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-lg bg-[var(--color-ink)] text-[var(--color-ink-inverse)] text-xs font-mono font-bold flex items-center justify-center">04</span>
          <h2 class="font-display text-lg font-bold text-[var(--color-ink)]">${t('newbieStep4Title')}</h2>
        </div>
        <p class="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
          ${t('newbieStep4Desc')}
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
          <a href="https://damus.io" target="_blank" rel="noopener noreferrer" class="p-3 rounded-lg bg-[var(--color-paper-subtle)] border border-[var(--color-border)] hover:border-[var(--color-border-focus)] transition-colors flex items-center justify-between">
            <span class="font-bold text-[var(--color-ink)] text-xs">Damus (iOS)</span>
            <span class="text-[var(--color-ink-muted)] text-xs">${icons.externalLink}</span>
          </a>
          <a href="https://github.com/vitorpamplona/amethyst" target="_blank" rel="noopener noreferrer" class="p-3 rounded-lg bg-[var(--color-paper-subtle)] border border-[var(--color-border)] hover:border-[var(--color-border-focus)] transition-colors flex items-center justify-between">
            <span class="font-bold text-[var(--color-ink)] text-xs">Amethyst (Android)</span>
            <span class="text-[var(--color-ink-muted)] text-xs">${icons.externalLink}</span>
          </a>
          <a href="https://primal.net" target="_blank" rel="noopener noreferrer" class="p-3 rounded-lg bg-[var(--color-paper-subtle)] border border-[var(--color-border)] hover:border-[var(--color-border-focus)] transition-colors flex items-center justify-between">
            <span class="font-bold text-[var(--color-ink)] text-xs">Primal (Web / Mobile)</span>
            <span class="text-[var(--color-ink-muted)] text-xs">${icons.externalLink}</span>
          </a>
          <a href="https://bookstr.xyz" target="_blank" rel="noopener noreferrer" class="p-3 rounded-lg bg-[var(--color-paper-subtle)] border border-[var(--color-border)] hover:border-[var(--color-border-focus)] transition-colors flex items-center justify-between">
            <span class="font-bold text-[var(--color-ink)] text-xs">Bookstr.xyz (Books)</span>
            <span class="text-[var(--color-ink-muted)] text-xs">${icons.externalLink}</span>
          </a>
          <a href="https://ditto.pub" target="_blank" rel="noopener noreferrer" class="p-3 rounded-lg bg-[var(--color-paper-subtle)] border border-[var(--color-border)] hover:border-[var(--color-border-focus)] transition-colors flex items-center justify-between">
            <span class="font-bold text-[var(--color-ink)] text-xs">Ditto.pub (Blogs)</span>
            <span class="text-[var(--color-ink-muted)] text-xs">${icons.externalLink}</span>
          </a>
          <a href="https://yakihonne.com" target="_blank" rel="noopener noreferrer" class="p-3 rounded-lg bg-[var(--color-paper-subtle)] border border-[var(--color-border)] hover:border-[var(--color-border-focus)] transition-colors flex items-center justify-between">
            <span class="font-bold text-[var(--color-ink)] text-xs">Yakihonne (Long-Form)</span>
            <span class="text-[var(--color-ink-muted)] text-xs">${icons.externalLink}</span>
          </a>
          <a href="https://gitworkshop.dev" target="_blank" rel="noopener noreferrer" class="p-3 rounded-lg bg-[var(--color-paper-subtle)] border border-[var(--color-border)] hover:border-[var(--color-border-focus)] transition-colors flex items-center justify-between">
            <span class="font-bold text-[var(--color-ink)] text-xs">GitWorkshop (Git / NIP-34)</span>
            <span class="text-[var(--color-ink-muted)] text-xs">${icons.externalLink}</span>
          </a>
        </div>
      </div>
    </div>
  `;

  // Attach keygen handlers
  const btnGen = container.querySelector('#btn-page-generate-key') as HTMLButtonElement | null;
  if (btnGen) {
    btnGen.onclick = () => {
      try {
        const secretKey = generateSecretKey();
        const pubkey = getPublicKey(secretKey);
        generatedNsec = nip19.nsecEncode(secretKey);
        generatedNpub = nip19.npubEncode(pubkey);

        const outputArea = container.querySelector('#page-keygen-output-area');
        const inputNsec = container.querySelector('#page-input-nsec') as HTMLInputElement | null;
        const inputNpub = container.querySelector('#page-input-npub') as HTMLInputElement | null;

        if (outputArea) outputArea.classList.remove('hidden');
        if (inputNsec) inputNsec.value = generatedNsec;
        if (inputNpub) inputNpub.value = generatedNpub;

        showToast('Nostr keypair generated!', 'success');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to generate keypair';
        showToast(msg, 'error');
      }
    };
  }

  const btnCopyNsec = container.querySelector('#page-btn-copy-nsec') as HTMLButtonElement | null;
  if (btnCopyNsec) {
    btnCopyNsec.onclick = () => {
      if (generatedNsec) {
        navigator.clipboard.writeText(generatedNsec);
        showToast('nsec copied to clipboard!', 'info');
      }
    };
  }

  const btnCopyNpub = container.querySelector('#page-btn-copy-npub') as HTMLButtonElement | null;
  if (btnCopyNpub) {
    btnCopyNpub.onclick = () => {
      if (generatedNpub) {
        navigator.clipboard.writeText(generatedNpub);
        showToast('npub copied to clipboard!', 'info');
      }
    };
  }

  const btnGotoImporters = container.querySelector('#btn-goto-importers') as HTMLButtonElement | null;
  if (btnGotoImporters) {
    btnGotoImporters.onclick = () => {
      router.navigate('/importers');
    };
  }
}
