import { nostrService } from './nostr';

export const DEFAULT_BLOSSOM_SERVERS: string[] = [
  'https://blossom.primal.net',
  'https://cdn.nostr.build',
  'https://nostr.check.mail.kras.sh',
];

interface BlossomUploadResponse {
  url?: string;
  sha256?: string;
  size?: number;
  type?: string;
  error?: string;
}

class BlossomService {
  /**
   * Uploads an image URL to Blossom servers.
   * Downloads original image blob, computes SHA-256 digest, creates & signs a Kind 24242 auth header,
   * uploads to active Blossom server, and returns the Blossom URL.
   * On failure (CORS/network/signing rejection), gracefully falls back to the original URL.
   */
  public async uploadImageUrl(
    imageUrl: string,
    pubkey: string,
    servers: string[] = DEFAULT_BLOSSOM_SERVERS
  ): Promise<string> {
    if (!imageUrl || !imageUrl.startsWith('http')) {
      return imageUrl;
    }

    try {
      // 1. Download image content as ArrayBuffer with 8s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      let response: Response;
      try {
        response = await fetch(imageUrl, { mode: 'cors', signal: controller.signal });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        console.warn(`Could not fetch image at ${imageUrl}: status ${response.status}`);
        return imageUrl;
      }

      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      // 2. Compute SHA-256 hash digest
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const sha256Hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      // 3. Try uploading to servers in order
      const targetServers = servers.length > 0 ? servers : DEFAULT_BLOSSOM_SERVERS;

      for (const serverUrl of targetServers) {
        try {
          const cleanServer = serverUrl.replace(/\/$/, '');
          const uploadUrl = `${cleanServer}/upload`;

          // Construct NIP-98 / Blossom Kind 24242 auth event
          const expiration = Math.floor(Date.now() / 1000) + 300; // 5 minutes validity
          const unsignedAuthEvent = {
            kind: 24242,
            created_at: Math.floor(Date.now() / 1000),
            tags: [
              ['t', 'upload'],
              ['x', sha256Hex],
              ['expiration', String(expiration)],
              ['size', String(blob.size)],
            ],
            content: `Upload ${imageUrl} to Blossom`,
            pubkey,
          };

          const signedAuthEvent = await nostrService.signEvent(unsignedAuthEvent);
          const authHeaderValue = `Nostr ${btoa(JSON.stringify(signedAuthEvent))}`;

          // Upload to Blossom endpoint
          const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              Authorization: authHeaderValue,
              'Content-Type': blob.type || 'application/octet-stream',
            },
            body: blob,
          });

          if (uploadRes.ok) {
            const data: BlossomUploadResponse = await uploadRes.json();
            if (data.url) {
              return data.url;
            }
            // Standard Blossom URL fallback if server returns SHA256 only
            if (data.sha256) {
              const ext = this.getExtensionFromMime(blob.type) || 'jpg';
              return `${cleanServer}/${data.sha256}.${ext}`;
            }
          }
        } catch (serverErr) {
          console.warn(`Blossom upload failed for server ${serverUrl}:`, serverErr);
        }
      }
    } catch (err) {
      console.warn(`Failed to process image ${imageUrl} for Blossom upload:`, err);
    }

    // Graceful fallback to original URL
    return imageUrl;
  }

  /**
   * Uploads a raw Blob/File to Blossom servers using NIP-98 authentication.
   * Returns the canonical Blossom CDN URL and the computed SHA-256 hash.
   */
  public async uploadBlob(
    blob: Blob,
    pubkey: string,
    servers: string[] = DEFAULT_BLOSSOM_SERVERS
  ): Promise<{ url: string; sha256: string }> {
    const arrayBuffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha256Hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    const targetServers = servers.length > 0 ? servers : DEFAULT_BLOSSOM_SERVERS;

    for (const serverUrl of targetServers) {
      try {
        const cleanServer = serverUrl.replace(/\/$/, '');
        const uploadUrl = `${cleanServer}/upload`;

        const expiration = Math.floor(Date.now() / 1000) + 300;
        const unsignedAuthEvent = {
          kind: 24242,
          created_at: Math.floor(Date.now() / 1000),
          tags: [
            ['t', 'upload'],
            ['x', sha256Hex],
            ['expiration', String(expiration)],
            ['size', String(blob.size)],
          ],
          content: 'Upload media to Blossom via x2nostr',
          pubkey,
        };

        const signedAuthEvent = await nostrService.signEvent(unsignedAuthEvent);
        const authHeaderValue = `Nostr ${btoa(JSON.stringify(signedAuthEvent))}`;

        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            Authorization: authHeaderValue,
            'Content-Type': blob.type || 'application/octet-stream',
          },
          body: blob,
        });

        if (uploadRes.ok) {
          const data: BlossomUploadResponse = await uploadRes.json();
          if (data.url) {
            return { url: data.url, sha256: sha256Hex };
          }
          if (data.sha256) {
            const ext = this.getExtensionFromMime(blob.type) || 'jpg';
            return { url: `${cleanServer}/${data.sha256}.${ext}`, sha256: sha256Hex };
          }
        }
      } catch (serverErr) {
        console.warn(`Blossom blob upload failed for server ${serverUrl}:`, serverErr);
      }
    }

    throw new Error('Failed to upload media asset to configured Blossom servers.');
  }

  private getExtensionFromMime(mime: string): string | null {
    if (mime.includes('png')) return 'png';
    if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
    if (mime.includes('webp')) return 'webp';
    if (mime.includes('gif')) return 'gif';
    if (mime.includes('svg')) return 'svg';
    return null;
  }
}

export const blossomService = new BlossomService();
