/**
 * Primal Logic - Withings API Service（骨格）
 *
 * 体重計・体組成計のデータ取得用。本実装は docs/デバイス連携_本実装計画.md に従う。
 * OAuth 2.0 → アクセストークン → Measure API で体重・体脂肪を取得。
 */

import { logError } from './errorHandler';

export interface WithingsMeasure {
  weight?: number; // kg
  fatFreeMass?: number; // kg
  fatRatio?: number; // %
  fatMassWeight?: number; // kg
}

const WITHINGS_AUTH_URL = 'https://account.withings.com/oauth2_user/authorize2';
const _WITHINGS_TOKEN_URL = 'https://wbsapi.withings.net/v2/oauth2';
const _WITHINGS_MEASURE_URL = 'https://wbsapi.withings.net/measure';

/**
 * Withings OAuth 認証 URL を生成（リダイレクト用）
 * 本実装時: client_id, redirect_uri, scope, state を env から取得し、ユーザーをこの URL へリダイレクトする。
 */
export function getWithingsAuthUrl(): string {
  const clientId = import.meta.env.VITE_WITHINGS_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_WITHINGS_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    if (import.meta.env.DEV) {
      console.warn('Withings: VITE_WITHINGS_CLIENT_ID / VITE_WITHINGS_REDIRECT_URI が未設定です。');
    }
    return '';
  }
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'user.metrics',
    state: crypto.randomUUID?.() ?? String(Date.now()),
  });
  return `${WITHINGS_AUTH_URL}?${params.toString()}`;
}

/**
 * 認証コードをトークンに交換（サーバー側で実行すること。client_secret を隠すため）
 * 本実装時: Supabase Edge Function または自 API で callback を受け、この処理を実行する。
 */
export async function exchangeWithingsCode(_code: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  // 未実装: サーバー側で token 交換を行う
  if (import.meta.env.DEV) {
    console.warn('Withings: exchangeWithingsCode はサーバー側で実装してください。');
  }
  return null;
}

/**
 * Withings Measure API で体重・体脂肪を取得
 * 本実装時: 保存済み access_token で API を呼び、最新の measure を返す。
 */
export async function getWithingsMeasures(_accessToken: string): Promise<WithingsMeasure | null> {
  try {
    // 未実装: GET measure で lastupdate が今日のデータを取得
    if (import.meta.env.DEV) {
      console.warn('Withings: getWithingsMeasures はアクセストークン取得後に実装してください。');
    }
    return null;
  } catch (error) {
    logError(error, { component: 'withingsService', action: 'getWithingsMeasures' });
    return null;
  }
}
