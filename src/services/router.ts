export type Route =
  | '/'
  | '/getting-started'
  | '/importers'
  | '/importers/goodreads'
  | '/importers/movies'
  | '/importers/wordpress'
  | '/importers/gists'
  | '/importers/instagram'
  | '/importers/linkedin'
  | '/importers/spotify'
  | '/docs'
  | string;

export const IMPORTER_SLUG_ALIASES: Record<string, string> = {
  imdb: 'movies',
  blogs: 'wordpress',
  blog: 'wordpress',
  gist: 'gists',
  snippets: 'gists',
  github: 'gists',
  insta: 'instagram',
  photos: 'instagram',
  pulse: 'linkedin',
  article: 'linkedin',
  articles: 'linkedin',
  book: 'goodreads',
  books: 'goodreads',
};

export function normalizeImporterSlug(slug: string): string {
  const clean = slug.toLowerCase().trim();
  return IMPORTER_SLUG_ALIASES[clean] || clean;
}

type RouteListener = (route: Route, params?: Record<string, string>) => void;

class RouterService {
  private listeners: Set<RouteListener> = new Set();
  private currentRoute: Route = '/';
  private queryParams: Record<string, string> = {};

  constructor() {
    if (typeof window !== 'undefined') {
      this.syncFromLocation();
      window.addEventListener('popstate', () => {
        this.syncFromLocation();
        this.notifyListeners();
      });
    }
  }

  private syncFromLocation(): void {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname;

    if (path === '/getting-started' || path === '/docs') {
      this.currentRoute = path;
    } else if (path === '/importers' || path.startsWith('/importers/')) {
      this.currentRoute = path;
    } else {
      this.currentRoute = '/';
    }

    const searchParams = new URLSearchParams(window.location.search);
    const params: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      params[key] = val;
    });
    this.queryParams = params;
  }

  public getRoute(): Route {
    return this.currentRoute;
  }

  public getQueryParams(): Record<string, string> {
    return { ...this.queryParams };
  }

  /**
   * Returns the active importer slug if currently on an importer route or query param, or null.
   */
  public getImporterSlug(): string | null {
    const route = this.currentRoute;
    if (route.startsWith('/importers/')) {
      const slug = route.replace('/importers/', '').split('/')[0];
      if (slug) return normalizeImporterSlug(slug);
    }
    if (route === '/importers' && this.queryParams.type) {
      return normalizeImporterSlug(this.queryParams.type);
    }
    return null;
  }

  public isImporterRoute(): boolean {
    return this.currentRoute === '/importers' || this.currentRoute.startsWith('/importers/');
  }

  public navigate(route: Route, queryParams?: Record<string, string>): void {
    this.currentRoute = route;
    this.queryParams = queryParams || {};

    if (typeof window !== 'undefined') {
      let url = route as string;
      if (queryParams && Object.keys(queryParams).length > 0) {
        const search = new URLSearchParams(queryParams).toString();
        url += `?${search}`;
      }
      window.history.pushState({}, '', url);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    this.notifyListeners();
  }

  public subscribe(listener: RouteListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentRoute, this.queryParams);
      } catch (err) {
        console.error('Error in route listener:', err);
      }
    });
  }
}

export const router = new RouterService();
