/**
 * GitHub API and CDN Gist Service for sovereign client-side ingestion.
 * Features rate-limiting protection, CDN raw URL fetching, token support, and pagination.
 */

export interface GitHubRateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: Date;
  used: number;
}

export interface GitHubGistFile {
  filename: string;
  type: string;
  language: string | null;
  raw_url: string;
  size: number;
  truncated?: boolean;
  content?: string;
}

export interface GitHubGistItem {
  id: string;
  html_url: string;
  description: string | null;
  public: boolean;
  created_at: string;
  updated_at: string;
  files: Record<string, GitHubGistFile>;
  owner?: {
    login: string;
    avatar_url: string;
  };
}

class GitHubService {
  private lastRateLimit: GitHubRateLimitInfo | null = null;

  public getLastRateLimit(): GitHubRateLimitInfo | null {
    return this.lastRateLimit;
  }

  private updateRateLimitFromHeaders(headers: Headers): void {
    const limit = headers.get('x-ratelimit-limit');
    const remaining = headers.get('x-ratelimit-remaining');
    const reset = headers.get('x-ratelimit-reset');
    const used = headers.get('x-ratelimit-used');

    if (limit && remaining && reset) {
      this.lastRateLimit = {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        resetTime: new Date(parseInt(reset, 10) * 1000),
        used: used ? parseInt(used, 10) : parseInt(limit, 10) - parseInt(remaining, 10),
      };
    }
  }

  private getHeaders(token?: string): HeadersInit {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    };
    if (token && token.trim()) {
      const cleanToken = token.trim();
      headers['Authorization'] = cleanToken.startsWith('Bearer ') || cleanToken.startsWith('token ')
        ? cleanToken
        : `token ${cleanToken}`;
    }
    return headers;
  }

  /**
   * Extracts Gist ID from a URL or raw ID string.
   */
  public extractGistId(input: string): string | null {
    if (!input) return null;
    const clean = input.trim();
    // Matches https://gist.github.com/username/gistId or https://gist.github.com/gistId
    const urlMatch = clean.match(/gist\.github\.com\/(?:[^/]+\/)?([a-f0-9]+)/i);
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1];
    }
    // Matches raw hex/alphanumeric gist ID
    if (/^[a-f0-9]{10,40}$/i.test(clean)) {
      return clean;
    }
    return null;
  }

  /**
   * Fetches all public (and secret, if token provided) gists for a user with pagination.
   */
  public async fetchUserGists(
    username: string,
    token?: string,
    onProgress?: (status: string) => void
  ): Promise<GitHubGistItem[]> {
    const cleanUser = username.trim();
    const hasToken = Boolean(token && token.trim());

    // If token is provided, verify whether it matches the requested username
    let useAuthGistsEndpoint = hasToken && (!cleanUser || cleanUser.toLowerCase() === 'me');

    if (hasToken && cleanUser && cleanUser.toLowerCase() !== 'me') {
      try {
        const userRes = await fetch('https://api.github.com/user', {
          headers: this.getHeaders(token),
        });
        if (userRes.ok) {
          const authUser = (await userRes.json()) as { login?: string };
          if (authUser.login && authUser.login.toLowerCase() === cleanUser.toLowerCase()) {
            useAuthGistsEndpoint = true;
          }
        }
      } catch (err) {
        console.warn('Could not verify token user:', err);
      }
    }

    const allGists: GitHubGistItem[] = [];
    let page = 1;
    const perPage = 100;
    let hasMore = true;

    while (hasMore) {
      if (onProgress) {
        onProgress(`Fetching Gists page ${page} from GitHub...`);
      }

      // GET /gists returns BOTH public and secret gists for authenticated user.
      // GET /users/:username/gists returns only public gists.
      const endpoint = useAuthGistsEndpoint
        ? `https://api.github.com/gists?per_page=${perPage}&page=${page}`
        : `https://api.github.com/users/${encodeURIComponent(cleanUser)}/gists?per_page=${perPage}&page=${page}`;

      const response = await fetch(endpoint, {
        headers: this.getHeaders(token),
      });

      this.updateRateLimitFromHeaders(response.headers);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`GitHub user "${cleanUser}" was not found.`);
        }
        if (response.status === 403) {
          const resetMsg = this.lastRateLimit
            ? ` Rate limit will reset at ${this.lastRateLimit.resetTime.toLocaleTimeString()}.`
            : '';
          throw new Error(`GitHub API rate limit reached (403).${resetMsg} Provide a GitHub Personal Access Token (PAT) for 5,000 req/hr.`);
        }
        const errorText = await response.text();
        throw new Error(`GitHub API error (${response.status}): ${errorText || response.statusText}`);
      }

      const data = (await response.json()) as GitHubGistItem[];
      if (!Array.isArray(data) || data.length === 0) {
        hasMore = false;
        break;
      }

      allGists.push(...data);

      if (data.length < perPage || page >= 10) {
        hasMore = false;
      } else {
        page++;
        // Polite 100ms pause between pagination requests
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    return allGists;
  }

  /**
   * Fetches a single gist by ID or URL.
   */
  public async fetchSingleGist(gistIdOrUrl: string, token?: string): Promise<GitHubGistItem> {
    const gistId = this.extractGistId(gistIdOrUrl);
    if (!gistId) {
      throw new Error(`Invalid GitHub Gist ID or URL: "${gistIdOrUrl}"`);
    }

    const endpoint = `https://api.github.com/gists/${encodeURIComponent(gistId)}`;
    const response = await fetch(endpoint, {
      headers: this.getHeaders(token),
    });

    this.updateRateLimitFromHeaders(response.headers);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Gist "${gistId}" not found or is private without token authorization.`);
      }
      if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please provide a GitHub Token.');
      }
      throw new Error(`GitHub API returned status ${response.status}`);
    }

    return (await response.json()) as GitHubGistItem;
  }

  /**
   * Fetches the raw file content from CDN (gist.githubusercontent.com / raw_url).
   * Note: We intentionally omit custom Authorization headers when fetching from
   * gist.githubusercontent.com because CDN endpoints have open CORS (Access-Control-Allow-Origin: *)
   * for simple GET requests, whereas custom headers trigger preflight OPTIONS which the CDN rejects.
   */
  public async fetchRawContent(rawUrl: string): Promise<string> {
    if (!rawUrl) return '';

    try {
      const response = await fetch(rawUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.text();
    } catch (err) {
      console.warn(`Failed to fetch CDN raw content from ${rawUrl}:`, err);
      return '';
    }
  }
}

export const gitHubService = new GitHubService();
