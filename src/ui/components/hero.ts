import { t } from '../../services/i18n';
import { icons } from '../icons';

export function renderHero(container: HTMLElement): void {
  container.innerHTML = `
    <section class="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
      <!-- Badge -->
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-6 shadow-xs">
        ${icons.zap}
        <span>${t('heroBadge')}</span>
      </div>

      <!-- Main Headline -->
      <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
        ${t('heroTitle')} <br class="hidden sm:block" />
        <span class="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
          ${t('heroTitleHighlight')}
        </span>
      </h1>

      <!-- Subtitle -->
      <p class="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 mb-10 leading-relaxed">
        ${t('heroSubtitle')}
      </p>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center justify-center gap-4 mb-20">
        <a href="#migration-hub" class="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base shadow-md shadow-purple-600/25 hover:shadow-lg hover:shadow-purple-600/30 hover:scale-[1.02] transition-all cursor-pointer">
          ${icons.upload}
          <span>${t('getStarted')}</span>
          ${icons.arrowRight}
        </a>
        <a href="#ecosystem" class="flex items-center gap-2 px-6 py-3.5 rounded-xl glass-card bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm sm:text-base border border-slate-200 hover:border-purple-300 shadow-xs hover:scale-[1.02] transition-all">
          ${icons.globe}
          <span>${t('exploreEcosystem')}</span>
        </a>
      </div>

      <!-- Why Nostr Section -->
      <div class="pt-12 border-t border-slate-200">
        <div class="mb-12">
          <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">${t('whyNostrTitle')}</h2>
          <p class="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">${t('whyNostrSubtitle')}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          <!-- Feature 1 -->
          <div class="glass-card glass-card-hover p-6 rounded-2xl bg-white">
            <div class="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mb-4">
              ${icons.key}
            </div>
            <h3 class="text-lg font-semibold text-slate-900 mb-2">${t('feature1Title')}</h3>
            <p class="text-sm text-slate-600 leading-relaxed">${t('feature1Desc')}</p>
          </div>

          <!-- Feature 2 -->
          <div class="glass-card glass-card-hover p-6 rounded-2xl bg-white">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-4">
              ${icons.shield}
            </div>
            <h3 class="text-lg font-semibold text-slate-900 mb-2">${t('feature2Title')}</h3>
            <p class="text-sm text-slate-600 leading-relaxed">${t('feature2Desc')}</p>
          </div>

          <!-- Feature 3 -->
          <div class="glass-card glass-card-hover p-6 rounded-2xl bg-white">
            <div class="w-10 h-10 rounded-xl bg-violet-50 border border-violet-200 text-violet-600 flex items-center justify-center mb-4">
              ${icons.globe}
            </div>
            <h3 class="text-lg font-semibold text-slate-900 mb-2">${t('feature3Title')}</h3>
            <p class="text-sm text-slate-600 leading-relaxed">${t('feature3Desc')}</p>
          </div>

          <!-- Feature 4 -->
          <div class="glass-card glass-card-hover p-6 rounded-2xl bg-white">
            <div class="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4">
              ${icons.zap}
            </div>
            <h3 class="text-lg font-semibold text-slate-900 mb-2">${t('feature4Title')}</h3>
            <p class="text-sm text-slate-600 leading-relaxed">${t('feature4Desc')}</p>
          </div>

          <!-- Feature 5 -->
          <div class="glass-card glass-card-hover p-6 rounded-2xl bg-white">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4">
              ${icons.lock}
            </div>
            <h3 class="text-lg font-semibold text-slate-900 mb-2">${t('feature5Title')}</h3>
            <p class="text-sm text-slate-600 leading-relaxed">${t('feature5Desc')}</p>
          </div>

          <!-- Feature 6 -->
          <div class="glass-card glass-card-hover p-6 rounded-2xl bg-white">
            <div class="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center mb-4">
              ${icons.server}
            </div>
            <h3 class="text-lg font-semibold text-slate-900 mb-2">${t('feature6Title')}</h3>
            <p class="text-sm text-slate-600 leading-relaxed">${t('feature6Desc')}</p>
          </div>
        </div>
      </div>
    </section>
  `;
}
