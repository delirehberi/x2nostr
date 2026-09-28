import './style.css';
import { i18n } from './services/i18n';
import { nostrService } from './services/nostr';
import { router } from './services/router';
import { renderHeader } from './ui/components/header';
import { renderHero } from './ui/components/hero';
import { renderImporterMenu } from './ui/components/importer-menu';
import { renderEcosystem } from './ui/components/ecosystem';
import { renderFooter } from './ui/components/footer';
import { renderGettingStartedPage } from './ui/pages/getting-started-page';
import { renderImportersPage } from './ui/pages/importers-page';
import { renderDocsPage } from './ui/pages/docs-page';

class App {
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
    router.subscribe(() => this.render());
    nostrService.onAuthChange(() => this.renderHeaderOnly());
    nostrService.onRelaysChange(() => this.renderHeaderOnly());
    nostrService.onProfileChange(() => this.renderHeaderOnly());
  }

  private render(): void {
    const currentRoute = router.getRoute();

    this.appContainer.innerHTML = `
      <div id="header-root"></div>
      <main id="main-content" class="grow">
        <div id="page-root"></div>
      </main>
      <div id="footer-root"></div>
    `;

    const headerRoot = this.appContainer.querySelector('#header-root') as HTMLElement;
    const pageRoot = this.appContainer.querySelector('#page-root') as HTMLElement;
    const footerRoot = this.appContainer.querySelector('#footer-root') as HTMLElement;

    if (headerRoot) renderHeader(headerRoot);
    if (footerRoot) renderFooter(footerRoot);

    if (pageRoot) {
      if (currentRoute === '/getting-started') {
        renderGettingStartedPage(pageRoot);
      } else if (router.isImporterRoute()) {
        renderImportersPage(pageRoot);
      } else if (currentRoute === '/docs') {
        renderDocsPage(pageRoot);
      } else {
        // Home Page ('/')
        pageRoot.innerHTML = `
          <div id="hero-root"></div>
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div id="home-importers-root"></div>
          </div>
          <div id="ecosystem-root"></div>
        `;
        const heroRoot = pageRoot.querySelector('#hero-root') as HTMLElement | null;
        const homeImportersRoot = pageRoot.querySelector('#home-importers-root') as HTMLElement | null;
        const ecosystemRoot = pageRoot.querySelector('#ecosystem-root') as HTMLElement | null;

        if (heroRoot) renderHero(heroRoot);
        if (homeImportersRoot) {
          renderImporterMenu(homeImportersRoot, '', (slug) => {
            router.navigate(`/importers/${slug}`);
          });
        }
        if (ecosystemRoot) renderEcosystem(ecosystemRoot);
      }
    }
  }

  private renderHeaderOnly(): void {
    const headerRoot = this.appContainer.querySelector('#header-root') as HTMLElement;
    if (headerRoot) {
      renderHeader(headerRoot);
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
