/**
 * CarnivOS - エラーハンドリングユーティリティ
 *
 * 統一されたエラーハンドリングとユーザーフレンドリーなエラーメッセージ
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * エラータイプ
 */
export type ErrorType =
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR'
  | 'VALIDATION_ERROR'
  | 'API_ERROR'
  | 'STORAGE_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * エラーをユーザーフレンドリーなメッセージに変換
 */
export function getUserFriendlyErrorMessage(error: unknown, _context?: Record<string, unknown>): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // ネットワークエラー
    if (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Network')
    ) {
      return 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
    }

    // 認証エラー
    if (
      error.message.includes('auth') ||
      error.message.includes('unauthorized') ||
      error.message.includes('認証')
    ) {
      return '認証エラーが発生しました。ログインし直してください。';
    }

    // バリデーションエラー
    if (
      error.message.includes('validation') ||
      error.message.includes('invalid') ||
      error.message.includes('無効')
    ) {
      return '入力内容に誤りがあります。確認してください。';
    }

    // APIエラー
    if (
      error.message.includes('API') ||
      error.message.includes('500') ||
      error.message.includes('503')
    ) {
      return 'サーバーエラーが発生しました。しばらくしてから再度お試しください。';
    }

    // ストレージエラー
    if (
      error.message.includes('storage') ||
      error.message.includes('localStorage') ||
      error.message.includes('保存')
    ) {
      return 'データの保存に失敗しました。ブラウザの設定を確認してください。';
    }

    // その他のエラー
    return error.message || '予期しないエラーが発生しました。';
  }

  if (typeof error === 'string') {
    return error;
  }

  return '予期しないエラーが発生しました。';
}

/**
 * エラータイプを判定
 */
export function getErrorType(error: unknown): ErrorType {
  if (error instanceof AppError) {
    if (error.code) {
      if (error.code.includes('NETWORK')) return 'NETWORK_ERROR';
      if (error.code.includes('AUTH')) return 'AUTH_ERROR';
      if (error.code.includes('VALIDATION')) return 'VALIDATION_ERROR';
      if (error.code.includes('API')) return 'API_ERROR';
      if (error.code.includes('STORAGE')) return 'STORAGE_ERROR';
    }
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('fetch') || message.includes('network')) return 'NETWORK_ERROR';
    if (message.includes('auth') || message.includes('unauthorized')) return 'AUTH_ERROR';
    if (message.includes('validation') || message.includes('invalid')) return 'VALIDATION_ERROR';
    if (message.includes('api') || message.includes('500') || message.includes('503'))
      return 'API_ERROR';
    if (message.includes('storage') || message.includes('localstorage')) return 'STORAGE_ERROR';
  }

  return 'UNKNOWN_ERROR';
}

/**
 * エラーをログに記録（開発環境のみ）
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    console.error('Error:', error);
    if (context) {
      console.error('Context:', context);
    }
  }

  // 本番環境では、エラー追跡サービス（Sentry等）に送信
  // Sentry統合（環境変数が設定されている場合のみ実行）
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  const win = window as Window & { Sentry?: { captureException: (e: unknown, opts?: object) => void } };
  if (sentryDsn && typeof window !== 'undefined' && win.Sentry) {
    try {
      win.Sentry.captureException(error, {
        tags: context,
        extra: { timestamp: new Date().toISOString() },
      });
    } catch (sentryError) {
      // Sentry送信に失敗した場合は、コンソールに出力
      if (import.meta.env.DEV) {
        console.error('[Sentry] Failed to send error:', sentryError);
      }
    }
  }
}

/**
 * Async関数のエラーハンドリングラッパー
 */
export function withErrorHandling<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  errorMessage?: string
): T {
  return (async (...args: unknown[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, { function: fn.name, args });
      const message = errorMessage || getUserFriendlyErrorMessage(error);
      throw new AppError(message, getErrorType(error), { originalError: error });
    }
  }) as T;
}

/**
 * エラーを安全に処理する（エラーを投げずに処理）
 */
export async function safeExecute<T>(fn: () => Promise<T>, fallback?: T): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    logError(error);
    return fallback ?? null;
  }
}
