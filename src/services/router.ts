export type Route = '/' | '/getting-started' | '/importers' | '/docs';

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
    const path = window.location.pathname as Route;
    if (path === '/getting-started' || path === '/importers' || path === '/docs') {
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
