import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onBack: () => void;
  backLabel?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 画面単位のエラーバウンダリ。Lazy読み込み失敗やレンダーエラー時に
 * アプリ全体を落とさず「読み込みに失敗しました。戻る」を表示する。
 */
export class ScreenErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ScreenErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const label = this.props.backLabel ?? '戻る';
      return (
        <div
          className="screen-error-fallback"
          style={{
            padding: '2rem',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            backgroundColor: 'var(--bg-secondary, #1e1e1e)',
            color: 'var(--text-primary, #e5e5e5)',
            borderRadius: '8px',
            margin: '1rem',
          }}
        >
          <p style={{ margin: 0, color: 'var(--text-secondary, #a3a3a3)' }}>
            読み込みに失敗しました。
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              this.props.onBack();
            }}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              cursor: 'pointer',
              backgroundColor: 'var(--accent, #4da6ff)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
            }}
          >
            {label}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
