import { t } from '../../services/i18n';
import { icons } from '../icons';

export function renderFooter(container: HTMLElement): void {
  container.innerHTML = `
    <footer class="w-full mt-auto border-t border-slate-200 bg-white py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <!-- Brand & Sovereign Notice -->
        <div class="space-y-2 text-center md:text-left">
          <div class="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <span class="text-sm font-bold text-slate-900 font-mono">x2<span class="text-purple-600">nostr</span></span>
            <span class="text-[10px] text-slate-400">— x2nostr.emre.xyz</span>
            <a href="https://nostr.org.tr" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200/80 hover:bg-purple-100 hover:border-purple-300 transition-colors shadow-2xs">
              ${icons.globe}
              <span>${t('footerCommunity', { link: 'nostr.org.tr' })}</span>
            </a>
          </div>
          <p class="text-[11px] text-slate-500 max-w-md">
            ${t('footerClientSideOnly')}
          </p>
        </div>

        <!-- Links -->
        <div class="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
          <a href="https://nostr.org.tr" target="_blank" rel="noopener noreferrer" class="hover:text-purple-600 transition-colors flex items-center gap-1.5 text-purple-700 font-medium">
            ${icons.globe}
            <span>nostr.org.tr</span>
          </a>
          <a href="https://gitworkshop.dev/delirehberi@emre.xyz/relay.ngit.dev/x2Nostr" target="_blank" rel="noopener noreferrer" class="hover:text-emerald-600 transition-colors flex items-center gap-1.5 text-emerald-700 font-semibold">
            ${icons.code}
            <span>${t('sourceCode')}</span>
          </a>
        </div>
      </div>
    </footer>
  `;
}
