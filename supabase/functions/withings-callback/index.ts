/**
 * Withings OAuth コールバック（雛形）
 * 認証後に Withings からリダイレクトされる URL で呼ばれる。
 * code を token に交換し、DB に保存する。本実装時は Withings アプリの client_secret を env に設定すること。
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const _state = url.searchParams.get('state');
    void _state;
    const origin = req.headers.get('origin') || 'https://carnivos.netlify.app';

    if (!code) {
      return Response.redirect(`${origin}/?withings=error&reason=no_code`, 302);
    }

    const clientId = Deno.env.get('WITHINGS_CLIENT_ID');
    const clientSecret = Deno.env.get('WITHINGS_CLIENT_SECRET');
    const redirectUri = Deno.env.get('WITHINGS_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('Withings: WITHINGS_CLIENT_ID / WITHINGS_CLIENT_SECRET / WITHINGS_REDIRECT_URI が未設定');
      return Response.redirect(`${origin}/?withings=error&reason=config`, 302);
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    });

    const tokenRes = await fetch('https://wbsapi.withings.net/v2/oauth2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Withings token exchange failed:', tokenRes.status, errText);
      return Response.redirect(`${origin}/?withings=error&reason=token`, 302);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.body?.access_token;
    const refreshToken = tokenData.body?.refresh_token;
    const _userId = tokenData.body?.userid;
    void _userId;

    if (!accessToken || !refreshToken) {
      return Response.redirect(`${origin}/?withings=error&reason=no_tokens`, 302);
    }

    // TODO: userId と refresh_token を DB に保存（user_id と紐付ける）。本実装時に追加。
    // いまは成功だけ返してフロントへリダイレクト。
    return Response.redirect(`${origin}/?withings=success`, 302);
  } catch (e) {
    console.error('Withings callback error:', e);
    const origin = req.headers.get('origin') || 'https://carnivos.netlify.app';
    return Response.redirect(`${origin}/?withings=error&reason=exception`, 302);
  }
});
