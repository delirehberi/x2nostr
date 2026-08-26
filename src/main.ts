import './style.css';
import { i18n } from './services/i18n';
import { nostrService } from './services/nostr';
import { renderHeader } from './ui/components/header';
import { renderHero } from './ui/components/hero';
import { renderImporterMenu } from './ui/components/importer-menu';
import { renderGoodreadsView } from './ui/components/goodreads-view';
import { renderMoviesView } from './ui/components/movies-view';
import { renderEcosystem } from './ui/components/ecosystem';
import { renderFooter } from './ui/components/footer';

class App {
  private activeImporter = 'goodreads';
  private appContainer: HTMLElement;

  constructor() {
    const container = document.getElementById('app');
    if (!container) throw new Error('App root container #app not found');
    this.appContainer = container;
    this.init();
  }

  private init(): void {
    this.render();

    // Subscribe to reactive state updates
    i18n.subscribe(() => this.render());
    nostrService.onAuthChange(() => this.renderHeaderOnly());
    nostrService.onRelaysChange(() => this.renderHeaderOnly());
    nostrService.onProfileChange(() => this.renderHeaderOnly());
  }

  private render(): void {
    this.appContainer.innerHTML = `
      <div id="header-root"></div>
      <main class="grow">
        <div id="hero-root"></div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div id="importer-menu-root"></div>
          <div id="importer-view-root"></div>
        </div>
        <div id="ecosystem-root"></div>
      </main>
      <div id="footer-root"></div>
    `;

    const headerRoot = this.appContainer.querySelector('#header-root') as HTMLElement;
    const heroRoot = this.appContainer.querySelector('#hero-root') as HTMLElement;
    const importerMenuRoot = this.appContainer.querySelector('#importer-menu-root') as HTMLElement;
    const importerViewRoot = this.appContainer.querySelector('#importer-view-root') as HTMLElement;
    const ecosystemRoot = this.appContainer.querySelector('#ecosystem-root') as HTMLElement;
    const footerRoot = this.appContainer.querySelector('#footer-root') as HTMLElement;

    if (headerRoot) renderHeader(headerRoot);
    if (heroRoot) renderHero(heroRoot);
    if (importerMenuRoot) {
      renderImporterMenu(importerMenuRoot, this.activeImporter, (id) => {
        this.activeImporter = id;
        this.renderImporterView(importerViewRoot);
      });
    }
    if (importerViewRoot) this.renderImporterView(importerViewRoot);
    if (ecosystemRoot) renderEcosystem(ecosystemRoot);
    if (footerRoot) renderFooter(footerRoot);
  }

  private renderHeaderOnly(): void {
    const headerRoot = this.appContainer.querySelector('#header-root') as HTMLElement;
    if (headerRoot) {
      renderHeader(headerRoot);
    }
  }

  private renderImporterView(viewRoot: HTMLElement): void {
    if (this.activeImporter === 'goodreads') {
      renderGoodreadsView(viewRoot);
    } else if (this.activeImporter === 'movies' || this.activeImporter === 'imdb') {
      renderMoviesView(viewRoot);
    }
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  new App();
}
