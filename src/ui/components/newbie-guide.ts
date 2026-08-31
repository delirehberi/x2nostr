import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools';
import { t } from '../../services/i18n';
import { icons } from '../icons';
import { showToast } from '../toast';
import { showModal } from './modal';

export function showNewbieGuideModal(): void {
  let generatedNsec = '';
  let generatedNpub = '';

  const renderContent = () => `
    <div class="space-y-6 text-slate-700 text-sm">
      <!-- Subtitle & Manifesto -->
      <div class="p-4 rounded-xl bg-purple-50/70 border border-purple-100 space-y-2">
        <p class="text-xs text-purple-900 leading-relaxed font-medium">
          ${t('newbieGuideSubtitle')}
        </p>
      </div>

      <!-- Step 1: Key Generation / Connection -->
      <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">1</span>
          <h4 class="font-bold text-slate-900">${t('newbieStep1Title')}</h4>
        </div>
        <p class="text-xs text-slate-600 leading-relaxed">
          ${t('newbieStep1Desc')}
        </p>

        <div class="pt-1 flex flex-col sm:flex-row gap-2">
          <button id="btn-generate-key" class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-2">
            ${icons.key}
            <span>${t('generateKeyBtn')}</span>
          </button>
        </div>

        <div id="keygen-output-area" class="${generatedNsec ? 'block' : 'hidden'} space-y-2 pt-2">
          <div class="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
            <span class="text-emerald-600">${icons.checkCircle}</span>
            <span>${t('keyGeneratedNotice')}</span>
          </div>

          <div class="space-y-1">
            <label class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Private Key (nsec — KEEP SECRET)</label>
            <div class="flex items-center gap-2">
              <input readonly type="password" value="${generatedNsec}" id="input-nsec" class="grow px-3 py-1.5 text-xs font-mono rounded-lg bg-white border border-slate-200 text-slate-900" />
              <button id="btn-copy-nsec" class="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shrink-0">
                ${t('copyNsec')}
              </button>
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Public Key (npub — Share Freely)</label>
            <div class="flex items-center gap-2">
              <input readonly type="text" value="${generatedNpub}" id="input-npub" class="grow px-3 py-1.5 text-xs font-mono rounded-lg bg-white border border-slate-200 text-slate-900" />
              <button id="btn-copy-npub" class="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shrink-0">
                ${t('copyNpub')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Signers & Bunker (Amber, Extensions) -->
      <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">2</span>
          <h4 class="font-bold text-slate-900">${t('newbieStep2Title')}</h4>
        </div>
        <p class="text-xs text-slate-600 leading-relaxed">
          ${t('newbieStep2Desc')}
        </p>
        <div class="p-3 rounded-lg bg-white border border-slate-200 text-xs space-y-1.5">
          <div class="font-bold text-purple-700 flex items-center gap-1.5">
            ${icons.shield}
            <span>${t('whySovereigntyTitle')}</span>
          </div>
          <p class="text-slate-600">
            ${t('whySovereigntyDesc')}
          </p>
        </div>
      </div>

      <!-- Step 3: Import Your Data -->
      <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">3</span>
          <h4 class="font-bold text-slate-900">${t('newbieStep3Title')}</h4>
        </div>
        <p class="text-xs text-slate-600 leading-relaxed">
          ${t('newbieStep3Desc')}
        </p>
      </div>

      <!-- Step 4: Explore Ecosystem -->
      <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">4</span>
          <h4 class="font-bold text-slate-900">${t('newbieStep4Title')}</h4>
        </div>
        <p class="text-xs text-slate-600 leading-relaxed">
          ${t('newbieStep4Desc')}
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <a href="https://bookstr.xyz" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-purple-300 transition-colors flex items-center justify-between group">
            <span class="font-semibold text-slate-900 group-hover:text-purple-700">📚 Bookstr.xyz</span>
            <span class="text-slate-400 group-hover:text-purple-600 text-[10px]">${t('openApp')} →</span>
          </a>
          <a href="https://ditto.pub" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-purple-300 transition-colors flex items-center justify-between group">
            <span class="font-semibold text-slate-900 group-hover:text-purple-700">📝 Ditto.pub</span>
            <span class="text-slate-400 group-hover:text-purple-600 text-[10px]">${t('openApp')} →</span>
          </a>
          <a href="https://yakihonne.com" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-purple-300 transition-colors flex items-center justify-between group">
            <span class="font-semibold text-slate-900 group-hover:text-purple-700">✍️ Yakihonne</span>
            <span class="text-slate-400 group-hover:text-purple-600 text-[10px]">${t('openApp')} →</span>
          </a>
          <a href="https://primal.net" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-purple-300 transition-colors flex items-center justify-between group">
            <span class="font-semibold text-slate-900 group-hover:text-purple-700">⚡ Primal</span>
            <span class="text-slate-400 group-hover:text-purple-600 text-[10px]">${t('openApp')} →</span>
          </a>
        </div>
      </div>
    </div>
  `;

  showModal(t('newbieGuideTitle'), renderContent());

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return;

  const btnGen = modalRoot.querySelector('#btn-generate-key') as HTMLButtonElement | null;
  if (btnGen) {
    btnGen.onclick = () => {
      try {
        const secretKey = generateSecretKey();
        const pubkey = getPublicKey(secretKey);
        generatedNsec = nip19.nsecEncode(secretKey);
        generatedNpub = nip19.npubEncode(pubkey);

        const outputArea = modalRoot.querySelector('#keygen-output-area');
        const inputNsec = modalRoot.querySelector('#input-nsec') as HTMLInputElement | null;
        const inputNpub = modalRoot.querySelector('#input-npub') as HTMLInputElement | null;

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

  const btnCopyNsec = modalRoot.querySelector('#btn-copy-nsec') as HTMLButtonElement | null;
  if (btnCopyNsec) {
    btnCopyNsec.onclick = () => {
      if (generatedNsec) {
        navigator.clipboard.writeText(generatedNsec);
        showToast('nsec copied to clipboard!', 'info');
      }
    };
  }

  const btnCopyNpub = modalRoot.querySelector('#btn-copy-npub') as HTMLButtonElement | null;
  if (btnCopyNpub) {
    btnCopyNpub.onclick = () => {
      if (generatedNpub) {
        navigator.clipboard.writeText(generatedNpub);
        showToast('npub copied to clipboard!', 'info');
      }
    };
  }
}
