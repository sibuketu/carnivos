/**
 * Primal Logic - 認証画面
 *
 * ログイン・登録・パスワードリセット機能
 */

import { useState, useEffect } from 'react';
import { supabase, isSupabaseAvailable } from '../lib/supabaseClient';
import './AuthScreen.css';

type AuthMode = 'login' | 'signup' | 'reset';

export default function AuthScreen({ onAuthSuccess }: { onAuthSuccess?: () => void }) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // セッション確認
    if (isSupabaseAvailable() && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session && onAuthSuccess) {
          onAuthSuccess();
        }
      });

      // 認証状態の変更をリッスン
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session && onAuthSuccess) {
          onAuthSuccess();
        }
      });
    }
  }, [onAuthSuccess]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!isSupabaseAvailable() || !supabase) {
      setError('認証機能が利用できません。Supabaseの設定を確認してください。');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setMessage('ログインに成功しました');
      if (onAuthSuccess) {
        setTimeout(() => onAuthSuccess(), 500);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'ログインに失敗しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }

    setLoading(true);

    if (!isSupabaseAvailable() || !supabase) {
      setError('認証機能が利用できません。Supabaseの設定を確認してください。');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      setMessage('登録に成功しました。確認メールを送信しました。');
      setMode('login');
    } catch (err: any) {
      setError(err.message || '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!isSupabaseAvailable() || !supabase) {
      setError('認証機能が利用できません。Supabaseの設定を確認してください。');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage('パスワードリセットメールを送信しました');
    } catch (err: any) {
      setError(err.message || 'パスワードリセットに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!isSupabaseAvailable() || !supabase) return;

    await supabase.auth.signOut();
    setSession(null);
  };

  // 既にログインしている場合
  if (session) {
    return (
      <div className="auth-screen">
        <div className="auth-container">
          <h2 className="auth-title">ログイン中</h2>
          <p className="auth-message">メールアドレス: {session.user.email}</p>
          <button onClick={handleLogout} className="auth-button auth-button-secondary">
            ログアウト
          </button>
        </div>
      </div>
    );
  }

  // Supabaseが利用できない場合（ゲストモード）
  if (!isSupabaseAvailable()) {
    return (
      <div className="auth-screen">
        <div className="auth-container">
          <h2 className="auth-title">ゲストモード</h2>
          <p className="auth-message">
            Supabaseが設定されていないため、ゲストモードで使用しています。
            データはローカルに保存されます。
          </p>
          {onAuthSuccess && (
            <button onClick={onAuthSuccess} className="auth-button auth-button-primary">
              続ける
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <h2 className="auth-title">
          {mode === 'login' && 'ログイン'}
          {mode === 'signup' && '新規登録'}
          {mode === 'reset' && 'パスワードリセット'}
        </h2>

        {error && <div className="auth-error">{error}</div>}

        {message && <div className="auth-message">{message}</div>}

        <form
          onSubmit={
            mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleResetPassword
          }
          className="auth-form"
        >
          <div className="auth-form-group">
            <label htmlFor="email" className="auth-label">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
              placeholder="example@email.com"
            />
          </div>

          {mode !== 'reset' && (
            <div className="auth-form-group">
              <label htmlFor="password" className="auth-label">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
                placeholder="6文字以上"
                minLength={6}
              />
            </div>
          )}

          {mode === 'signup' && (
            <div className="auth-form-group">
              <label htmlFor="confirmPassword" className="auth-label">
                パスワード（確認）
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="auth-input"
                placeholder="パスワードを再入力"
                minLength={6}
              />
            </div>
          )}

          <button type="submit" disabled={loading} className="auth-button auth-button-primary">
            {loading
              ? '処理中...'
              : mode === 'login'
                ? 'ログイン'
                : mode === 'signup'
                  ? '登録'
                  : '送信'}
          </button>
        </form>

        <div className="auth-links">
          {mode === 'login' && (
            <>
              <button onClick={() => setMode('signup')} className="auth-link-button">
                新規登録
              </button>
              <button onClick={() => setMode('reset')} className="auth-link-button">
                パスワードを忘れた場合
              </button>
            </>
          )}
          {mode === 'signup' && (
            <button onClick={() => setMode('login')} className="auth-link-button">
              ログインに戻る
            </button>
          )}
          {mode === 'reset' && (
            <button onClick={() => setMode('login')} className="auth-link-button">
              ログインに戻る
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
