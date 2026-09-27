import { renderImporterMenu } from '../components/importer-menu';
import { renderGoodreadsView } from '../components/goodreads-view';
import { renderMoviesView } from '../components/movies-view';
import { renderWordPressView } from '../components/wordpress-view';
import { renderLinkedInView } from '../components/linkedin-view';
import { renderGistsView } from '../components/gists-view';
import { renderInstagramView } from '../components/instagram-view';
import { router } from '../../services/router';

export function renderImportersPage(container: HTMLElement): void {
  const queryParams = router.getQueryParams();
  let activeImporter = queryParams.type || 'goodreads';
  if (activeImporter === 'imdb') activeImporter = 'movies';
  if (activeImporter === 'wordpress') activeImporter = 'blogs';
  if (activeImporter === 'gist' || activeImporter === 'snippets') activeImporter = 'gists';
  if (activeImporter === 'insta' || activeImporter === 'photos') activeImporter = 'instagram';
  if (activeImporter === 'pulse' || activeImporter === 'article') activeImporter = 'linkedin';

  const render = () => {
    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div id="page-importer-menu-root"></div>
        <div id="page-importer-view-root" class="mt-8"></div>
      </div>
    `;

    const menuRoot = container.querySelector('#page-importer-menu-root') as HTMLElement | null;
    const viewRoot = container.querySelector('#page-importer-view-root') as HTMLElement | null;

    if (menuRoot) {
      renderImporterMenu(menuRoot, activeImporter, (id) => {
        activeImporter = id === 'imdb' ? 'movies' : id;
        render();
      });
    }

    if (viewRoot) {
      renderView(viewRoot, activeImporter);
    }
  };

  const renderView = (viewRoot: HTMLElement, importerId: string) => {
    if (importerId === 'goodreads') {
      renderGoodreadsView(viewRoot);
    } else if (importerId === 'movies' || importerId === 'imdb') {
      renderMoviesView(viewRoot);
    } else if (importerId === 'blogs' || importerId === 'wordpress') {
      renderWordPressView(viewRoot);
    } else if (importerId === 'linkedin') {
      renderLinkedInView(viewRoot);
    } else if (importerId === 'gists') {
      renderGistsView(viewRoot);
    } else if (importerId === 'instagram') {
      renderInstagramView(viewRoot);
    }
  };

  render();
}
