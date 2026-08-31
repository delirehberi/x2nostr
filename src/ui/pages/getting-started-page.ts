import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools';
import { t } from '../../services/i18n';
import { icons } from '../icons';
import { showToast } from '../toast';
import { router } from '../../services/router';

export function renderGettingStartedPage(container: HTMLElement): void {
  let generatedNsec = '';
  let generatedNpub = '';

  container.innerHTML = `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <!-- Header / Title -->
      <div class="text-center space-y-3">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold uppercase tracking-wider">
          ${icons.key}
          <span>${t('navGettingStarted')}</span>
        </div>
        <h1 class="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          ${t('newbieGuideTitle')}
        </h1>
        <p class="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          ${t('newbieGuideSubtitle')}
        </p>
      </div>

      <!-- Step 1: Key Generation / Connection -->
      <div class="glass-card bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div class="flex items-center gap-3">
          <span class="w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-bold flex items-center justify-center">1</span>
          <h2 class="text-xl font-bold text-slate-900">${t('newbieStep1Title')}</h2>
        </div>
        <p class="text-sm text-slate-600 leading-relaxed">
          ${t('newbieStep1Desc')}
        </p>

        <div class="pt-2 flex flex-wrap gap-3">
          <button id="btn-page-generate-key" class="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-2">
            ${icons.key}
            <span>${t('generateKeyBtn')}</span>
          </button>
        </div>

        <div id="page-keygen-output-area" class="hidden space-y-3 pt-3">
          <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5">
            <span class="text-emerald-600">${icons.checkCircle}</span>
            <span>${t('keyGeneratedNotice')}</span>
          </div>

          <div class="space-y-1.5">
            <label class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Private Key (nsec — KEEP SECRET)</label>
            <div class="flex items-center gap-2">
              <input readonly type="password" value="" id="page-input-nsec" class="grow px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-50 border border-slate-200 text-slate-900" />
              <button id="page-btn-copy-nsec" class="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shrink-0">
                ${t('copyNsec')}
              </button>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Public Key (npub — Share Freely)</label>
            <div class="flex items-center gap-2">
              <input readonly type="text" value="" id="page-input-npub" class="grow px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-50 border border-slate-200 text-slate-900" />
              <button id="page-btn-copy-npub" class="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shrink-0">
                ${t('copyNpub')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Signers & Bunker (Amber, Extensions) -->
      <div class="glass-card bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div class="flex items-center gap-3">
          <span class="w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-bold flex items-center justify-center">2</span>
          <h2 class="text-xl font-bold text-slate-900">${t('newbieStep2Title')}</h2>
        </div>
        <p class="text-sm text-slate-600 leading-relaxed">
          ${t('newbieStep2Desc')}
        </p>

        <!-- Product Links Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <a href="https://getalby.com" target="_blank" rel="noopener noreferrer" class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition-colors flex items-center justify-between group">
            <div>
              <div class="font-bold text-slate-900 group-hover:text-purple-700 text-xs">🐝 Alby Extension</div>
              <div class="text-[11px] text-slate-500">NIP-07 Browser Extension & Lightning Wallet</div>
            </div>
            <span class="text-slate-400 group-hover:text-purple-600 text-xs">${icons.externalLink}</span>
          </a>
          <a href="https://github.com/fiatjaf/nos2x" target="_blank" rel="noopener noreferrer" class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition-colors flex items-center justify-between group">
            <div>
              <div class="font-bold text-slate-900 group-hover:text-purple-700 text-xs">🔑 nos2x Extension</div>
              <div class="text-[11px] text-slate-500">Lightweight NIP-07 Signer</div>
            </div>
            <span class="text-slate-400 group-hover:text-purple-600 text-xs">${icons.externalLink}</span>
          </a>
          <a href="https://github.com/greenart7c3/Amber" target="_blank" rel="noopener noreferrer" class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition-colors flex items-center justify-between group">
            <div>
              <div class="font-bold text-slate-900 group-hover:text-purple-700 text-xs">🛡️ Amber (Android)</div>
              <div class="text-[11px] text-slate-500">NIP-46 / NIP-55 Remote Signer Bunker</div>
            </div>
            <span class="text-slate-400 group-hover:text-purple-600 text-xs">${icons.externalLink}</span>
          </a>
          <a href="https://primal.net" target="_blank" rel="noopener noreferrer" class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition-colors flex items-center justify-between group">
            <div>
              <div class="font-bold text-slate-900 group-hover:text-purple-700 text-xs">⚡ Primal Signer</div>
              <div class="text-[11px] text-slate-500">Integrated Web & Mobile Key Manager</div>
            </div>
            <span class="text-slate-400 group-hover:text-purple-600 text-xs">${icons.externalLink}</span>
          </a>
        </div>
      </div>

      <!-- Step 3: Migrate Data CTA -->
      <div class="glass-card bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div class="flex items-center gap-3">
          <span class="w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-bold flex items-center justify-center">3</span>
          <h2 class="text-xl font-bold text-slate-900">${t('newbieStep3Title')}</h2>
        </div>
        <p class="text-sm text-slate-600 leading-relaxed">
          ${t('newbieStep3Desc')}
        </p>
        <div class="pt-2">
          <button id="btn-goto-importers" class="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all cursor-pointer flex items-center gap-2">
            <span>${t('navImporters')}</span>
            ${icons.arrowRight}
          </button>
        </div>
      </div>

      <!-- Step 4: Product Recommendations -->
      <div class="glass-card bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div class="flex items-center gap-3">
          <span class="w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-bold flex items-center justify-center">4</span>
          <h2 class="text-xl font-bold text-slate-900">${t('newbieStep4Title')}</h2>
        </div>
        <p class="text-sm text-slate-600 leading-relaxed">
          ${t('newbieStep4Desc')}
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          <a href="https://damus.io" target="_blank" rel="noopener noreferrer" class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition-colors flex items-center justify-between group">
            <span class="font-bold text-slate-900 group-hover:text-purple-700 text-xs">Damus (iOS)</span>
            <span class="text-slate-400 group-hover:text-purple-600 text-xs">${icons.externalLink}</span>
          </a>
          <a href="https://github.com/vitorpamplona/amethyst" target="_blank" rel="noopener noreferrer" class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition-colors flex items-center justify-between group">
            <span class="font-bold text-slate-900 group-hover:text-purple-700 text-xs">Amethyst (Android)</span>
            <span class="text-slate-400 group-hover:text-purple-600 text-xs">${icons.externalLink}</span>
          </a>
          <a href="https://primal.net" target="_blank" rel="noopener noreferrer" class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition-colors flex items-center justify-between group">
            <span class="font-bold text-slate-900 group-hover:text-purple-700 text-xs">Primal (Web / Mobile)</span>
            <span class="text-slate-400 group-hover:text-purple-600 text-xs">${icons.externalLink}</span>
          </a>
          <a href="https://bookstr.xyz" target="_blank" rel="noopener noreferrer" class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition-colors flex items-center justify-between group">
            <span class="font-bold text-slate-900 group-hover:text-purple-700 text-xs">Bookstr.xyz (Books)</span>
            <span class="text-slate-400 group-hover:text-purple-600 text-xs">${icons.externalLink}</span>
          </a>
          <a href="https://ditto.pub" target="_blank" rel="noopener noreferrer" class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition-colors flex items-center justify-between group">
            <span class="font-bold text-slate-900 group-hover:text-purple-700 text-xs">Ditto.pub (Blogs)</span>
            <span class="text-slate-400 group-hover:text-purple-600 text-xs">${icons.externalLink}</span>
          </a>
          <a href="https://yakihonne.com" target="_blank" rel="noopener noreferrer" class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition-colors flex items-center justify-between group">
            <span class="font-bold text-slate-900 group-hover:text-purple-700 text-xs">Yakihonne (Long-Form)</span>
            <span class="text-slate-400 group-hover:text-purple-600 text-xs">${icons.externalLink}</span>
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
