import { t } from '../../services/i18n';
import { icons } from '../icons';

export function renderFooter(container: HTMLElement): void {
  container.innerHTML = `
    <footer class="w-full mt-auto border-t border-slate-200 bg-white py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <!-- Brand & Sovereign Notice -->
        <div class="space-y-2 text-center md:text-left">
          <div class="flex items-center justify-center md:justify-start gap-2">
            <span class="text-sm font-bold text-slate-900 font-mono">x2<span class="text-purple-600">nostr</span></span>
            <span class="text-[10px] text-slate-400">— x2nostr.emre.xyz</span>
          </div>
          <p class="text-[11px] text-slate-500 max-w-md">
            ${t('footerClientSideOnly')}
          </p>
        </div>

        <!-- Links & Author -->
        <div class="flex flex-col sm:flex-row items-center gap-6">
          <div class="flex items-center gap-4 text-xs font-medium">
            <a href="https://github.com/delirehberi/move-to-nostr.emre.xyz" target="_blank" rel="noopener noreferrer" class="hover:text-purple-600 transition-colors flex items-center gap-1.5 text-slate-600">
              ${icons.externalLink}
              <span>${t('githubRepo')}</span>
            </a>
            <a href="https://github.com/delirehberi/move-to-nostr.emre.xyz/blob/main/ROADMAP.md" target="_blank" rel="noopener noreferrer" class="hover:text-purple-600 transition-colors flex items-center gap-1.5 text-slate-600">
              ${icons.externalLink}
              <span>${t('roadmapLink')}</span>
            </a>
          </div>
          <div class="text-[11px] text-slate-500">
            ${t('footerAuthor', { author: '<a href="https://emre.xyz" target="_blank" rel="noopener" class="text-slate-700 hover:text-purple-600 font-medium">Emre Yılmaz (@delirehberi)</a>' })}
          </div>
        </div>
      </div>
    </footer>
  `;
}
