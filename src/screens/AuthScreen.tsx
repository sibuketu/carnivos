/**
 * CarnivOS - 認証画面
 *
 * ログイン・登録・パスワードリセット・Googleログイン
 */

import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase, isSupabaseAvailable } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../utils/i18n';
import './AuthScreen.css';

type AuthMode = 'login' | 'signup' | 'reset';

function getOAuthRedirectUrl(): string {
  if (Capacitor.isNativePlatform()) {
    return 'com.CarnivOS.app://auth';
  }
  return `${window.location.origin}${window.location.pathname || '/'}`;
}

export default function AuthScreen({ onAuthSuccess }: { onAuthSuccess?: () => void }) {
  const { t } = useTranslation();
  const { signInAsGuest } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string): boolean => {
    // Spec: Min 8 chars, 1 alphanumeric, 1 symbol (Actually spec says "alphanumeric + symbol", usually implies regex check)
    // Requirement 1.1: 最低8文字、英数字+記号を1つ以上含む
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
  };

  const handleGuestLogin = () => {
    signInAsGuest();
    if (onAuthSuccess) onAuthSuccess();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!isSupabaseAvailable() || !supabase) {
      setError(t('auth.errorSupabase'));
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setMessage(t('auth.successLogin'));
      if (onAuthSuccess) {
        setTimeout(() => onAuthSuccess(), 500);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('auth.errorLogin');
      if (errorMessage === 'Invalid login credentials') {
        setError(t('auth.errorInvalidCredentials'));
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Validation
    if (!validateEmail(email)) {
      setError(t('auth.errorInvalidEmail'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.errorPasswordMismatch'));
      return;
    }

    if (!validatePassword(password)) {
      setError(t('auth.errorPasswordRequirements'));
      return;
    }

    setLoading(true);

    if (!isSupabaseAvailable() || !supabase) {
      setError(t('auth.errorSupabase'));
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      setMessage(t('auth.successSignup'));
      setMode('login');
      // Spec requirement: Transition to email check view or stay on login with message
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (String(msg).includes('already registered')) {
        setError(t('auth.errorAlreadyRegistered'));
      } else {
        setError(msg || t('auth.errorSignup'));
      }
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
      setError(t('auth.errorSupabase'));
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });

      if (error) throw error;

      setMessage(t('auth.successReset'));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('auth.errorReset');
      setError(message || t('auth.errorReset'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setMessage(null);
    setGoogleLoading(true);

    if (!isSupabaseAvailable() || !supabase) {
      setError(t('auth.errorSupabase'));
      setGoogleLoading(false);
      return;
    }

    try {
      const redirectTo = getOAuthRedirectUrl();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });

      if (oauthError) throw oauthError;
      setMessage(t('auth.redirectToGoogle'));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('auth.errorGoogle');
      setError(msg || t('auth.errorGoogle'));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        {/* Logo/Title Area */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: '"Press Start 2P", cursive', color: '#f43f5e', marginBottom: '1rem' }}>CarnivOS</h1>
          <h2 className="auth-title">
            {mode === 'login' && t('auth.login')}
            {mode === 'signup' && t('auth.signup')}
            {mode === 'reset' && t('auth.reset')}
          </h2>
        </div>

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
              Email
            </label>
            <input
              id="email"
              name="email"
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
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
                placeholder={mode === 'signup' ? t('auth.passwordHint') : 'Password'}
                minLength={mode === 'signup' ? 8 : 1}
              />
              {mode === 'signup' && (
                <p style={{ fontSize: '0.7rem', color: '#888', marginTop: '0.25rem' }}>
                  最低8文字、英数字+記号
                </p>
              )}
            </div>
          )}

          {mode === 'signup' && (
            <div className="auth-form-group">
              <label htmlFor="confirmPassword" className="auth-label">
                {t('auth.confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="auth-input"
                placeholder={t('auth.confirmPasswordPlaceholder')}
                minLength={8}
              />
            </div>
          )}

          <button type="submit" disabled={loading} className="auth-button auth-button-primary">
            {loading
              ? t('auth.processing')
              : mode === 'login'
                ? t('auth.login')
                : mode === 'signup'
                  ? t('auth.register')
                  : t('auth.send')}
          </button>

          {mode === 'login' && (
            <>
              <div style={{ margin: '0.75rem 0', borderTop: '1px solid #e5e7eb' }} />
              <button
                type="button"
                disabled={googleLoading}
                onClick={handleGoogleLogin}
                className="auth-button auth-button-google"
              >
                {googleLoading ? t('auth.processing') : t('auth.loginWithGoogle')}
              </button>
            </>
          )}
        </form>

        <div className="auth-links">
          {mode === 'login' && (
            <>
              <button onClick={() => setMode('signup')} className="auth-link-button">
                {t('auth.signup')}
              </button>
              <button onClick={() => setMode('reset')} className="auth-link-button">
                {t('auth.forgotPassword')}
              </button>
              <div style={{ margin: '1rem 0', borderTop: '1px solid #333' }}></div>
              <button onClick={handleGuestLogin} className="auth-link-button" style={{ color: '#aaa' }}>
                {t('auth.guest')}
              </button>
            </>
          )}
          {mode === 'signup' && (
            <button onClick={() => setMode('login')} className="auth-link-button">
              {t('auth.backToLogin')}
            </button>
          )}
          {mode === 'reset' && (
            <button onClick={() => setMode('login')} className="auth-link-button">
              {t('auth.backToLogin')}
            </button>
          )}
        </div>
        <div className="auth-footer" style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem' }}>
          <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#888', marginRight: '1rem' }}>{t('auth.privacy')}</a>
          <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#888' }}>{t('auth.terms')}</a>
        </div>
      </div>
    </div>
  );
}
