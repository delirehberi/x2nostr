interface Env {
  INSTAGRAM_CLIENT_ID?: string;
  INSTAGRAM_CLIENT_SECRET?: string;
}

interface TokenRequestBody {
  code: string;
  redirect_uri: string;
  client_id?: string;
  client_secret?: string;
}

type PagesFunction<T = Record<string, unknown>> = (context: {
  request: Request;
  env: T;
  params: Record<string, string | string[]>;
  waitUntil: (promise: Promise<unknown>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: Record<string, unknown>;
}) => Promise<Response>;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = (await context.request.json()) as TokenRequestBody;
    const { code, redirect_uri } = body;

    if (!code || !redirect_uri) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: code and redirect_uri' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Support both Cloudflare Pages environment secrets and custom client-supplied secrets (for self-hosters)
    const clientId = body.client_id || context.env.INSTAGRAM_CLIENT_ID;
    const clientSecret = body.client_secret || context.env.INSTAGRAM_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({
          error:
            'Instagram Client ID or Client Secret is not configured. Please configure INSTAGRAM_CLIENT_ID and INSTAGRAM_CLIENT_SECRET or provide your own in the advanced settings.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Instagram OAuth access token exchange requires application/x-www-form-urlencoded
    const formData = new URLSearchParams();
    formData.append('client_id', clientId.trim());
    formData.append('client_secret', clientSecret.trim());
    formData.append('grant_type', 'authorization_code');
    formData.append('redirect_uri', redirect_uri.trim());
    formData.append('code', code.trim().replace(/#_$/, '')); // Instagram often appends #_ to redirect codes

    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const tokenData = (await tokenResponse.json()) as {
      access_token?: string;
      user_id?: string;
      error_message?: string;
      error_type?: string;
      code?: number;
    };

    if (!tokenResponse.ok || !tokenData.access_token) {
      return new Response(
        JSON.stringify({
          error:
            tokenData.error_message ||
            `Instagram OAuth failed (${tokenResponse.status}): ${JSON.stringify(tokenData)}`,
        }),
        { status: tokenResponse.status >= 400 && tokenResponse.status < 600 ? tokenResponse.status : 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Exchange short-lived token for long-lived 60-day token via graph.instagram.com/access_token
    try {
      const longLivedUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${encodeURIComponent(
        clientSecret.trim()
      )}&access_token=${encodeURIComponent(tokenData.access_token)}`;

      const longLivedRes = await fetch(longLivedUrl);
      if (longLivedRes.ok) {
        const longLivedData = (await longLivedRes.json()) as {
          access_token?: string;
          token_type?: string;
          expires_in?: number;
        };
        if (longLivedData.access_token) {
          return new Response(
            JSON.stringify({
              access_token: longLivedData.access_token,
              user_id: tokenData.user_id,
              expires_in: longLivedData.expires_in,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    } catch (longLivedErr) {
      // If long-lived exchange fails, gracefully return the standard access token
      console.warn('Could not exchange for long-lived token:', longLivedErr);
    }

    return new Response(
      JSON.stringify({
        access_token: tokenData.access_token,
        user_id: tokenData.user_id,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
