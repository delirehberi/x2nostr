import { convertBlogArchiveToNip23 } from '../../../src/services/nip23/converter';

interface Env {
  ALLOWED_ORIGINS?: string;
}

type PagesFunction<T = Record<string, unknown>> = (context: {
  request: Request;
  env: T;
  params: Record<string, string | string[]>;
  waitUntil: (promise: Promise<unknown>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: Record<string, unknown>;
}) => Promise<Response>;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Resolves CORS headers based on request Origin and optional ALLOWED_ORIGINS whitelist.
 */
function resolveCorsHeaders(request: Request, env: Env): { headers: Headers; isAllowed: boolean } {
  const origin = request.headers.get('Origin') || '';
  const allowedOriginsConfig = env.ALLOWED_ORIGINS?.trim();

  const headers = new Headers();
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  headers.set('Access-Control-Max-Age', '86400');

  // If no whitelist is configured, allow all origins
  if (!allowedOriginsConfig || allowedOriginsConfig === '*') {
    headers.set('Access-Control-Allow-Origin', '*');
    return { headers, isAllowed: true };
  }

  // Parse whitelist
  const allowedList = allowedOriginsConfig.split(',').map((o) => o.trim().toLowerCase());
  const originLower = origin.toLowerCase();

  const isMatch = allowedList.some((allowed) => {
    if (allowed === '*' || allowed === originLower) return true;
    if (allowed.startsWith('*.') && originLower.endsWith(allowed.slice(2))) return true;
    return false;
  });

  if (isMatch || !origin) {
    headers.set('Access-Control-Allow-Origin', origin || '*');
    return { headers, isAllowed: true };
  }

  return { headers, isAllowed: false };
}

/**
 * Handles CORS Preflight (OPTIONS) requests.
 */
export const onRequestOptions: PagesFunction<Env> = async (context) => {
  const { headers, isAllowed } = resolveCorsHeaders(context.request, context.env);

  if (!isAllowed) {
    return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(null, { status: 204, headers });
};

/**
 * Handles Blog Archive Content Conversion (POST) requests.
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { headers, isAllowed } = resolveCorsHeaders(context.request, context.env);
  headers.set('Content-Type', 'application/json');

  if (!isAllowed) {
    return new Response(
      JSON.stringify({ success: false, error: 'Origin not allowed by CORS security policy.' }),
      { status: 403, headers }
    );
  }

  try {
    const contentType = context.request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid request Content-Type. Must be multipart/form-data with a "file" field.',
        }),
        { status: 400, headers }
      );
    }

    const formData = await context.request.formData();
    const fileEntry = formData.get('file');
    const platformParam = formData.get('platform')?.toString() || null;

    if (!fileEntry || typeof fileEntry === 'string') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required "file" field in multipart form-data payload.',
        }),
        { status: 400, headers }
      );
    }

    const file = fileEntry as File;

    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `File size exceeds the 50MB limit (uploaded: ${(file.size / (1024 * 1024)).toFixed(2)}MB).`,
        }),
        { status: 413, headers }
      );
    }

    if (file.size === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Uploaded file is empty (0 bytes).',
        }),
        { status: 400, headers }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const response = await convertBlogArchiveToNip23(arrayBuffer, {
      fileName: file.name,
      mimeType: file.type,
      platform: platformParam,
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Internal server error during archive conversion.';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      { status: 400, headers }
    );
  }
};
