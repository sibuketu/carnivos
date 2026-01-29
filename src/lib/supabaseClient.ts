/**
 * Primal Logic - Supabase Client
 *
 * Supabaseクライアントの初期化と設定
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase環境変数が設定されていない場合は、localStorageのみを使用

// Supabaseクライアントを作成（環境変数が設定されていない場合はnullを返す）
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      })
    : null;

// Supabaseが利用可能かどうかをチェック
export const isSupabaseAvailable = () => {
  return supabase !== null;
};
