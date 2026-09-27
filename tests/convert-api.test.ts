import { describe, expect, it } from 'vitest';
import { onRequestPost, onRequestOptions } from '../functions/api/v1/convert';

function createMockContext(request: Request, env: Record<string, string> = {}) {
  return {
    request,
    env,
    params: {},
    waitUntil: () => {},
    next: async () => new Response(),
    data: {},
  };
}

describe('POST /api/v1/convert Cloudflare Pages Function', () => {
  const SAMPLE_WP_XML = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:wp="http://wordpress.org/export/1.1/">
<channel>
  <item>
    <title>API Test Post</title>
    <content:encoded><![CDATA[<p>Hello API with <img src="https://example.com/test.jpg" alt="Test Image" /></p>]]></content:encoded>
    <wp:post_id>101</wp:post_id>
    <wp:post_name>api-test-post</wp:post_name>
    <wp:post_type>post</wp:post_type>
    <wp:status>publish</wp:status>
    <wp:post_date_gmt>2023-10-31 12:00:00</wp:post_date_gmt>
  </item>
</channel>
</rss>`;

  it('should successfully convert uploaded multipart/form-data file and return 200 JSON', async () => {
    const formData = new FormData();
    const file = new File([SAMPLE_WP_XML], 'export.xml', { type: 'application/xml' });
    formData.append('file', file);
    formData.append('platform', 'wordpress');

    const request = new Request('https://x2nostr.emre.xyz/api/v1/convert', {
      method: 'POST',
      body: formData,
    });

    const context = createMockContext(request);
    const response = await onRequestPost(context as any);

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Content-Type')).toBe('application/json');

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.platform).toBe('wordpress');
    expect(data.totalPosts).toBe(1);
    expect(data.events).toHaveLength(1);

    const event = data.events[0];
    expect(event.kind).toBe(30023);
    expect(event.tags.find((t: string[]) => t[0] === 'title')?.[1]).toBe('API Test Post');
    expect(event.tags.find((t: string[]) => t[0] === 'image')?.[1]).toBe('https://example.com/test.jpg');
    expect(event.tags.find((t: string[]) => t[0] === 'imeta')?.[1]).toBe('url https://example.com/test.jpg');
    expect(event.tags.find((t: string[]) => t[0] === 'client')?.[1]).toBe('x2nostr');
  });

  it('should handle OPTIONS preflight with 204 No Content and CORS headers', async () => {
    const request = new Request('https://x2nostr.emre.xyz/api/v1/convert', {
      method: 'OPTIONS',
      headers: { Origin: 'https://notyaz.com' },
    });

    const context = createMockContext(request);
    const response = await onRequestOptions(context as any);

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
  });

  it('should respect ALLOWED_ORIGINS whitelist configuration', async () => {
    const env = { ALLOWED_ORIGINS: 'https://notyaz.com,https://app.notyaz.com' };

    // Disallowed origin
    const disallowedReq = new Request('https://x2nostr.emre.xyz/api/v1/convert', {
      method: 'OPTIONS',
      headers: { Origin: 'https://malicious-site.com' },
    });
    const disallowedRes = await onRequestOptions(createMockContext(disallowedReq, env) as any);
    expect(disallowedRes.status).toBe(403);

    // Allowed origin
    const allowedReq = new Request('https://x2nostr.emre.xyz/api/v1/convert', {
      method: 'OPTIONS',
      headers: { Origin: 'https://notyaz.com' },
    });
    const allowedRes = await onRequestOptions(createMockContext(allowedReq, env) as any);
    expect(allowedRes.status).toBe(204);
    expect(allowedRes.headers.get('Access-Control-Allow-Origin')).toBe('https://notyaz.com');
  });

  it('should return 400 when Content-Type is not multipart/form-data', async () => {
    const request = new Request('https://x2nostr.emre.xyz/api/v1/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: 'bad' }),
    });

    const response = await onRequestPost(createMockContext(request) as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('multipart/form-data');
  });

  it('should return 400 when file field is missing', async () => {
    const formData = new FormData();
    formData.append('platform', 'wordpress');

    const request = new Request('https://x2nostr.emre.xyz/api/v1/convert', {
      method: 'POST',
      body: formData,
    });

    const response = await onRequestPost(createMockContext(request) as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Missing required "file" field');
  });

  it('should return 400 when file is empty (0 bytes)', async () => {
    const formData = new FormData();
    const emptyFile = new File([], 'empty.xml', { type: 'application/xml' });
    formData.append('file', emptyFile);

    const request = new Request('https://x2nostr.emre.xyz/api/v1/convert', {
      method: 'POST',
      body: formData,
    });

    const response = await onRequestPost(createMockContext(request) as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('empty');
  });
});
