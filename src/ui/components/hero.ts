import { t } from '../../services/i18n';
import { icons } from '../icons';
import { router } from '../../services/router';

export function renderHero(container: HTMLElement): void {
  const sampleTransforms: Record<string, { label: string; input: string; output: string; nip: string }> = {
    goodreads: {
      label: 'Goodreads CSV → NIP-51 Book Lists',
      nip: 'Kind 30003 (NIP-51 / NIP-32)',
      input: `Title, Author, Rating, Date Read, Bookshelves
"The Sovereign Individual", "James Dale Davidson", 5, 2024/01/15, "read"
"Mastering Bitcoin", "Andreas M. Antonopoulos", 5, 2023/11/02, "read"`,
      output: `{
  "kind": 30003,
  "tags": [
    ["d", "goodreads-read"],
    ["title", "Books Read (from Goodreads)"],
    ["t", "books"],
    ["a", "30003:pubkey:the-sovereign-individual", "relay.damus.io"]
  ],
  "content": "Migrated from Goodreads: 2 books"
}`,
    },
    wordpress: {
      label: 'WordPress XML → NIP-23 Long-Form',
      nip: 'Kind 30023 (NIP-23 Articles)',
      input: `<item>
  <title>Leaving Walled Gardens</title>
  <content:encoded><![CDATA[# Freedom of Speech...]]></content:encoded>
  <category>Decentralization</category>
</item>`,
      output: `{
  "kind": 30023,
  "tags": [
    ["d", "leaving-walled-gardens"],
    ["title", "Leaving Walled Gardens"],
    ["published_at", "1705320000"],
    ["t", "decentralization"]
  ],
  "content": "# Freedom of Speech\\n\\nDecentralized protocols..."
}`,
    },
    cinema: {
      label: 'IMDb / Letterboxd → NIP-32 Reviews',
      nip: 'Kind 31985 & Kind 1985 (NIP-32)',
      input: `Const, Your Rating, Date Rated, Title, Year
tt0133093, 10, 2024-02-10, "The Matrix", 1999
tt0062622, 9, 2023-12-01, "2001: A Space Odyssey", 1968`,
      output: `{
  "kind": 31985,
  "tags": [
    ["d", "movie-tt0133093"],
    ["l", "IMDb", "tt0133093"],
    ["title", "The Matrix (1999)"],
    ["rating", "1.0", "1.0"]
  ],
  "content": "Rating: 10/10 via IMDb migration"
}`,
    },
  };

  let activeTransform = 'goodreads';

  const renderContent = () => {
    const active = sampleTransforms[activeTransform];

    container.innerHTML = `
      <section class="pt-8 sm:pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <!-- Workbench Hero (Asymmetric Split) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <!-- Left Column: Statement & Value Proposition -->
          <div class="lg:col-span-6 space-y-6 text-left">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-paper-subtle)] border border-[var(--color-border)] text-[var(--color-ink-muted)] text-xs font-mono font-medium">
              <span class="w-2 h-2 rounded-full bg-[var(--color-accent)]"></span>
              <span>${t('heroBadge')}</span>
            </div>

            <h1 class="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--color-ink)] leading-[1.08]">
              ${t('heroTitle')}
              <span class="text-[var(--color-accent)] block mt-1">${t('heroTitleHighlight')}</span>
            </h1>

            <p class="text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed max-w-xl">
              ${t('heroSubtitle')}
            </p>

            <!-- Action Buttons -->
            <div class="flex flex-wrap items-center gap-3 pt-2">
              <button id="btn-hero-start" class="btn-primary">
                ${icons.upload}
                <span>${t('getStarted')}</span>
                ${icons.arrowRight}
              </button>
              <button id="btn-hero-newbie-guide" class="btn-secondary">
                ${icons.helpCircle}
                <span>${t('btnNewbieGuide')}</span>
              </button>
              <a href="#ecosystem" class="btn-secondary">
                ${icons.globe}
                <span>${t('exploreEcosystem')}</span>
              </a>
            </div>

            <!-- Cryptographic Guarantees List -->
            <div class="pt-4 border-t border-[var(--color-border-subtle)] grid grid-cols-2 gap-4 text-xs">
              <div class="space-y-1">
                <div class="font-bold text-[var(--color-ink)] flex items-center gap-1.5">
                  <span class="text-emerald-600">${icons.shield}</span>
                  <span>100% Client-Side</span>
                </div>
                <p class="text-[11px] text-[var(--color-ink-muted)]">Keys and exported files never touch a remote backend.</p>
              </div>
              <div class="space-y-1">
                <div class="font-bold text-[var(--color-ink)] flex items-center gap-1.5">
                  <span class="text-[var(--color-accent)]">${icons.checkCircle}</span>
                  <span>Standard NIP Spec</span>
                </div>
                <p class="text-[11px] text-[var(--color-ink-muted)]">Strictly conforms to NIP-23, NIP-51, NIP-32, and NIP-34.</p>
              </div>
            </div>
          </div>

          <!-- Right Column: Interactive Migration Workbench Window -->
          <div class="lg:col-span-6">
            <div class="card-workbench overflow-hidden border border-[var(--color-border)] shadow-md">
              <!-- Workbench Header / Tabs -->
              <div class="bg-[var(--color-paper-subtle)] border-b border-[var(--color-border)] px-4 py-2.5 flex items-center justify-between">
                <div class="flex items-center gap-2 font-mono text-xs text-[var(--color-ink-muted)] font-medium">
                  <span class="w-2.5 h-2.5 rounded-full bg-[var(--color-border)]"></span>
                  <span class="text-[var(--color-ink)] font-semibold">pipeline-preview.ts</span>
                </div>
                <div class="flex items-center gap-1">
                  <button data-transform="goodreads" class="btn-workbench-tab px-2.5 py-1 text-[11px] rounded-md font-mono transition-colors cursor-pointer ${
                    activeTransform === 'goodreads'
                      ? 'bg-white font-bold text-[var(--color-ink)] border border-[var(--color-border)] shadow-2xs'
                      : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                  }">Goodreads</button>
                  <button data-transform="wordpress" class="btn-workbench-tab px-2.5 py-1 text-[11px] rounded-md font-mono transition-colors cursor-pointer ${
                    activeTransform === 'wordpress'
                      ? 'bg-white font-bold text-[var(--color-ink)] border border-[var(--color-border)] shadow-2xs'
                      : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                  }">WordPress</button>
                  <button data-transform="cinema" class="btn-workbench-tab px-2.5 py-1 text-[11px] rounded-md font-mono transition-colors cursor-pointer ${
                    activeTransform === 'cinema'
                      ? 'bg-white font-bold text-[var(--color-ink)] border border-[var(--color-border)] shadow-2xs'
                      : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                  }">IMDb</button>
                </div>
              </div>

              <!-- Workbench Body -->
              <div class="p-5 space-y-4 text-left">
                <!-- Source Input Preview -->
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between text-[11px] font-mono text-[var(--color-ink-muted)] font-medium">
                    <span class="uppercase tracking-wider">Source Archive Payload</span>
                    <span>Raw Input</span>
                  </div>
                  <pre class="bg-[var(--color-paper-subtle)] border border-[var(--color-border-subtle)] p-3 rounded-lg text-xs font-mono text-[var(--color-ink)] overflow-x-auto"><code>${active.input}</code></pre>
                </div>

                <!-- Arrow Indicator -->
                <div class="flex items-center justify-center text-[var(--color-accent)]">
                  <span class="px-2.5 py-0.5 rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-accent-subtle-border)] text-[10px] font-mono font-bold flex items-center gap-1">
                    <span>${icons.arrowRight}</span>
                    <span>Client-Side Transform & Sign → ${active.nip}</span>
                  </span>
                </div>

                <!-- Nostr Output Event Preview -->
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between text-[11px] font-mono text-[var(--color-ink-muted)] font-medium">
                    <span class="uppercase tracking-wider">Target Nostr Event (Signed)</span>
                    <span class="text-emerald-600 font-semibold">Ready for Relay Broadcast</span>
                  </div>
                  <pre class="bg-[var(--color-paper-inset)] border border-[var(--color-border-subtle)] p-3 rounded-lg text-xs font-mono text-[var(--color-ink)] overflow-x-auto"><code>${active.output}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sovereignty Workflow Stepper -->
        <div class="pt-8 border-t border-[var(--color-border)]">
          <div class="mb-8 text-left">
            <h2 class="font-display text-xl sm:text-2xl font-bold text-[var(--color-ink)] mb-1">${t('whyNostrTitle')}</h2>
            <p class="text-xs sm:text-sm text-[var(--color-ink-muted)]">${t('whyNostrSubtitle')}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <!-- Step 1 -->
            <div class="card-workbench p-6 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[var(--color-paper-subtle)] border border-[var(--color-border)] text-[var(--color-ink-muted)]">01 · INGEST</span>
                <span class="text-[var(--color-accent)]">${icons.upload}</span>
              </div>
              <h3 class="font-display text-base font-bold text-[var(--color-ink)]">${t('feature1Title')}</h3>
              <p class="text-xs text-[var(--color-ink-muted)] leading-relaxed">${t('feature1Desc')}</p>
            </div>

            <!-- Step 2 -->
            <div class="card-workbench p-6 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[var(--color-paper-subtle)] border border-[var(--color-border)] text-[var(--color-ink-muted)]">02 · TRANSFORM</span>
                <span class="text-[var(--color-accent)]">${icons.code}</span>
              </div>
              <h3 class="font-display text-base font-bold text-[var(--color-ink)]">${t('feature2Title')}</h3>
              <p class="text-xs text-[var(--color-ink-muted)] leading-relaxed">${t('feature2Desc')}</p>
            </div>

            <!-- Step 3 -->
            <div class="card-workbench p-6 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[var(--color-paper-subtle)] border border-[var(--color-border)] text-[var(--color-ink-muted)]">03 · BROADCAST</span>
                <span class="text-emerald-600">${icons.server}</span>
              </div>
              <h3 class="font-display text-base font-bold text-[var(--color-ink)]">${t('feature3Title')}</h3>
              <p class="text-xs text-[var(--color-ink-muted)] leading-relaxed">${t('feature3Desc')}</p>
            </div>
          </div>
        </div>
      </section>
    `;

    // Tab buttons event listeners
    const tabButtons = container.querySelectorAll('.btn-workbench-tab');
    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tr = btn.getAttribute('data-transform');
        if (tr && sampleTransforms[tr]) {
          activeTransform = tr;
          renderContent();
        }
      });
    });

    // Navigation Buttons
    const btnHeroStart = container.querySelector('#btn-hero-start') as HTMLButtonElement | null;
    if (btnHeroStart) {
      btnHeroStart.addEventListener('click', () => {
        router.navigate('/importers');
      });
    }

    const btnHeroNewbie = container.querySelector('#btn-hero-newbie-guide') as HTMLButtonElement | null;
    if (btnHeroNewbie) {
      btnHeroNewbie.addEventListener('click', () => {
        router.navigate('/getting-started');
      });
    }
  };

  renderContent();
}
