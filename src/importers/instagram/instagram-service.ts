import { IGUser } from '../../types';

export interface InstagramRateLimitInfo {
  callCount?: number;
  totalTime?: number;
  estimatedReset?: Date;
}

export const DEFAULT_INSTAGRAM_CLIENT_ID = '1241198440536780'; // x2nostr default client ID

class InstagramService {
  private lastRateLimit: InstagramRateLimitInfo | null = null;
  private currentAccessToken: string | null = null;

  public getLastRateLimit(): InstagramRateLimitInfo | null {
    return this.lastRateLimit;
  }

  public setAccessToken(token: string | null): void {
    this.currentAccessToken = token;
  }

  public getAccessToken(): string | null {
    return this.currentAccessToken;
  }

  /**
   * Generates the Instagram OAuth authorization URL.
   */
  public getAuthUrl(clientId?: string, redirectUri?: string): string {
    const finalClientId = clientId || DEFAULT_INSTAGRAM_CLIENT_ID;
    const finalRedirectUri =
      redirectUri ||
      (typeof window !== 'undefined'
        ? `${window.location.origin}/importers?type=instagram`
        : 'https://x2nostr.emre.xyz/importers?type=instagram');

    const params = new URLSearchParams({
      client_id: finalClientId.trim(),
      redirect_uri: finalRedirectUri,
      scope: 'user_profile,user_media',
      response_type: 'code',
    });

    return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchanges an OAuth authorization code for an Instagram User Access Token
   * using the sovereign Cloudflare Pages Function endpoint /api/instagram/token.
   */
  public async exchangeCodeForToken(
    code: string,
    redirectUri?: string,
    customClientId?: string,
    customClientSecret?: string
  ): Promise<{ accessToken: string; userId?: string }> {
    const finalRedirectUri =
      redirectUri ||
      (typeof window !== 'undefined'
        ? `${window.location.origin}/importers?type=instagram`
        : 'https://x2nostr.emre.xyz/importers?type=instagram');

    const response = await fetch('/api/instagram/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code.replace(/#_$/, ''),
        redirect_uri: finalRedirectUri,
        client_id: customClientId || undefined,
        client_secret: customClientSecret || undefined,
      }),
    });

    if (!response.ok) {
      let errorMsg = `Server returned ${response.status}`;
      try {
        const errorJson = (await response.json()) as { error?: string };
        if (errorJson.error) errorMsg = errorJson.error;
      } catch {
        // use fallback errorMsg
      }
      throw new Error(`Instagram Login error: ${errorMsg}`);
    }

    const data = (await response.json()) as { access_token?: string; user_id?: string; error?: string };
    if (!data.access_token) {
      throw new Error(data.error || 'Failed to obtain Instagram access token.');
    }

    this.currentAccessToken = data.access_token;
    return {
      accessToken: data.access_token,
      userId: data.user_id,
    };
  }

  /**
   * Fetches the authenticated user profile using Meta Instagram Graph API.
   * Endpoint: GET /me?fields=id,username,name,biography,account_type,media_count,profile_picture_url
   */
  public async fetchUserProfile(accessToken: string): Promise<IGUser> {
    const cleanToken = accessToken.trim();
    const endpoint = `https://graph.instagram.com/me?fields=id,username,name,biography,account_type,media_count,profile_picture_url&access_token=${encodeURIComponent(
      cleanToken
    )}`;

    const response = await fetch(endpoint);
    if (!response.ok) {
      let errorDetails = `HTTP ${response.status}`;
      try {
        const errJson = (await response.json()) as { error?: { message?: string } };
        if (errJson.error?.message) errorDetails = errJson.error.message;
      } catch {
        // fallback
      }
      throw new Error(`Failed to fetch Instagram profile: ${errorDetails}`);
    }

    const user = (await response.json()) as IGUser;
    return user;
  }

  /**
   * Traverses the user's media graph node-by-node and page-by-page using cursor pagination.
   * Includes nested carousel children for CAROUSEL_ALBUM media items.
   */
  public async walkMediaGraph(
    accessToken: string,
    onProgress?: (status: string, count: number) => void
  ): Promise<RawIGMediaItem[]> {
    const cleanToken = accessToken.trim();
    const allItems: RawIGMediaItem[] = [];

    const fields = [
      'id',
      'caption',
      'media_type',
      'media_url',
      'permalink',
      'thumbnail_url',
      'timestamp',
      'media_product_type',
      'shortcode',
      'like_count',
      'comments_count',
      'children{id,media_type,media_url,thumbnail_url,timestamp}',
    ].join(',');

    let nextUrl: string | null = `https://graph.instagram.com/me/media?fields=${encodeURIComponent(
      fields
    )}&limit=50&access_token=${encodeURIComponent(cleanToken)}`;

    let page = 1;

    while (nextUrl) {
      if (onProgress) {
        onProgress(`Traversing Instagram graph page ${page}...`, allItems.length);
      }

      const response = await fetch(nextUrl);
      if (!response.ok) {
        let errorDetails = `HTTP ${response.status}`;
        try {
          const errJson = (await response.json()) as { error?: { message?: string; code?: number } };
          if (errJson.error?.message) {
            errorDetails = errJson.error.message;
          }
        } catch {
          // fallback
        }

        if (response.status === 401 || response.status === 190) {
          throw new Error('Instagram session expired or invalid access token. Please log in again.');
        }
        if (response.status === 429) {
          throw new Error('Instagram Graph API rate limit reached. Please wait a few moments before retrying.');
        }
        throw new Error(`Instagram Graph API error: ${errorDetails}`);
      }

      const payload = (await response.json()) as {
        data?: RawIGMediaItem[];
        paging?: { next?: string; cursors?: { after?: string } };
      };

      const pageItems = payload.data || [];
      if (pageItems.length === 0) {
        break;
      }

      allItems.push(...pageItems);

      if (onProgress) {
        onProgress(`Retrieved ${allItems.length} Instagram posts...`, allItems.length);
      }

      // Check if there is another page
      if (payload.paging?.next) {
        nextUrl = payload.paging.next;
        page++;
        // Polite 100ms pause between Graph API pagination queries
        await new Promise((resolve) => setTimeout(resolve, 100));
      } else {
        nextUrl = null;
      }
    }

    return allItems;
  }

  /**
   * Downloads a media binary (image/video) client-side with timeout and CORS detection.
   */
  public async downloadMediaBinary(mediaUrl: string): Promise<Blob> {
    if (!mediaUrl || !mediaUrl.startsWith('http')) {
      throw new Error(`Invalid media URL: "${mediaUrl}"`);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(mediaUrl, {
        mode: 'cors',
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} fetching media binary`);
      }

      return await response.blob();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to download Instagram media asset: ${message}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export interface RawIGMediaItem {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
  media_product_type?: 'FEED' | 'STORY' | 'REELS' | 'AD';
  shortcode?: string;
  like_count?: number;
  comments_count?: number;
  children?: {
    data: Array<{
      id: string;
      media_type: 'IMAGE' | 'VIDEO';
      media_url?: string;
      thumbnail_url?: string;
      timestamp?: string;
    }>;
  };
}

export const instagramService = new InstagramService();
