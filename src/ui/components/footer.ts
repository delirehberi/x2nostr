import { t } from '../../services/i18n';
import { icons } from '../icons';

export function renderFooter(container: HTMLElement): void {
  container.innerHTML = `
    <footer class="w-full mt-auto border-t border-[var(--color-border)] bg-[var(--color-paper)] py-12 px-4 sm:px-6 lg:px-8 text-xs text-[var(--color-ink-muted)]">
      <div class="max-w-7xl mx-auto space-y-8">
        <!-- Colophon Top Row -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <!-- Col 1: Brand & Sovereignty Guarantee -->
          <div class="md:col-span-5 space-y-3 text-left">
            <div class="flex items-center gap-2 font-display font-bold text-base text-[var(--color-ink)]">
              <span>x2<span class="text-[var(--color-accent)]">nostr</span></span>
              <span class="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--color-paper-subtle)] border border-[var(--color-border)] text-[var(--color-ink-muted)]">Client-Side Only</span>
            </div>
            <p class="text-xs leading-relaxed max-w-sm text-[var(--color-ink-muted)]">
              ${t('footerClientSideOnly')}
            </p>
            <div class="font-mono text-[11px] text-[var(--color-ink-faint)]">
              Protocol spec: NIP-01 · NIP-07 · NIP-23 · NIP-32 · NIP-34 · NIP-51
            </div>
          </div>

          <!-- Col 2: Community & Relay Ecosystem -->
          <div class="md:col-span-4 space-y-2 text-left">
            <div class="font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink)]">Ecosystem & Community</div>
            <ul class="space-y-1.5 text-xs">
              <li>
                <a href="https://nostr.org.tr" target="_blank" rel="noopener noreferrer" class="hover:text-[var(--color-accent)] transition-colors inline-flex items-center gap-1.5 font-medium">
                  ${icons.globe}
                  <span>${t('footerCommunity', { link: 'nostr.org.tr' })}</span>
                </a>
              </li>
              <li>
                <a href="https://nostr.how" target="_blank" rel="noopener noreferrer" class="hover:text-[var(--color-accent)] transition-colors inline-flex items-center gap-1.5">
                  ${icons.helpCircle}
                  <span>Nostr.how — Protocol Guide</span>
                </a>
              </li>
            </ul>
          </div>

          <!-- Col 3: Source Code & Provenance -->
          <div class="md:col-span-3 space-y-2 text-left">
            <div class="font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink)]">Open Source</div>
            <ul class="space-y-1.5 text-xs">
              <li>
                <a href="https://gitworkshop.dev/delirehberi@emre.xyz/relay.ngit.dev/x2Nostr" target="_blank" rel="noopener noreferrer" class="hover:text-emerald-700 transition-colors inline-flex items-center gap-1.5 font-medium">
                  ${icons.code}
                  <span>${t('sourceCode')} (GitWorkshop / NIP-34)</span>
                </a>
              </li>
              <li class="font-mono text-[11px] text-[var(--color-ink-faint)]">
                MIT Licensed · Zero tracking · Zero ads
              </li>
            </ul>
          </div>
        </div>

        <!-- Colophon Bottom Bar -->
        <div class="pt-6 border-t border-[var(--color-border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-[var(--color-ink-faint)]">
          <div>© ${new Date().getFullYear()} x2nostr — Move to Nostr. Data sovereignty restored.</div>
          <div class="flex items-center gap-3">
            <span>Powered by Nostr Protocol</span>
            <span>•</span>
            <a href="mailto:nostr@emre.xyz" class="hover:text-[var(--color-ink)] transition-colors">nostr@emre.xyz</a>
          </div>
        </div>
      </div>
    </footer>
  `;
}
