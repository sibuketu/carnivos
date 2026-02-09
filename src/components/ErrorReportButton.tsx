/**
 * CarnivOS - Error Report Button
 *
 * ユーザーが簡単にバグ報告できるフローティングボタン
 */

import { useState } from 'react';
import { useTranslation } from '../utils/i18n';

interface ErrorReportButtonProps {
  /** 現在の画面名 */
  screenName?: string;
}

export default function ErrorReportButton({ screenName }: ErrorReportButtonProps) {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    // エラー情報を収集
    const errorReport = {
      description,
      screenName,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // LocalStorageに保存（後でエクスポート可能）
    const reports = JSON.parse(localStorage.getItem('@carnivos:error_reports') || '[]');
    reports.push(errorReport);
    localStorage.setItem('@carnivos:error_reports', JSON.stringify(reports));

    // GitHubイシュー用のテンプレートURLを生成
    const title = encodeURIComponent(`[Bug Report] ${screenName || 'General'}: ${description.substring(0, 50)}`);
    const body = encodeURIComponent(`
## 問題の説明
${description}

## 環境情報
- 画面: ${screenName || '不明'}
- 日時: ${new Date().toLocaleString('ja-JP')}
- User Agent: ${navigator.userAgent}
- URL: ${window.location.href}

## 再現手順
1.
2.
3.

## 期待される動作


## 実際の動作


---
*この報告はアプリ内から自動生成されました*
    `);

    const githubUrl = `https://github.com/anthropics/carnivos/issues/new?title=${title}&body=${body}`;

    setSubmitted(true);
    setTimeout(() => {
      window.open(githubUrl, '_blank');
      setShowModal(false);
      setDescription('');
      setSubmitted(false);
    }, 1500);
  };

  return (
    <>
      {/* フローティングバグ報告ボタン（四角・左下配置） */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'fixed',
          bottom: '80px',
          left: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '12px',
          backgroundColor: '#dc2626',
          color: 'white',
          border: '2px solid #b91c1c',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="バグを報告"
      >
        🐛
      </button>

      {/* バグ報告モーダル */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {submitted ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  報告ありがとうございます！
                </h2>
                <p style={{ color: '#78716c', fontSize: '0.875rem' }}>
                  GitHubイシューページを開きます...
                </p>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
                  🐛 バグを報告
                </h2>
                <p style={{ color: '#78716c', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  問題の内容を簡潔に説明してください
                </p>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="例: ホーム画面で食品を追加しようとするとエラーが出る"
                  style={{
                    width: '100%',
                    height: '120px',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-primary)',
                    fontSize: '1rem',
                    marginBottom: '1rem',
                    resize: 'vertical',
                  }}
                />

                <div style={{ fontSize: '0.75rem', color: '#78716c', marginBottom: '1rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0' }}>{t('errorReport.autoCollected')}</p>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                    <li>{t('errorReport.screen')}: {screenName || t('errorReport.unknown')}</li>
                    <li>{t('errorReport.dateTime')}: {new Date().toLocaleString('ja-JP')}</li>
                    <li>{t('errorReport.browserInfo')}</li>
                  </ul>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => setShowModal(false)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'transparent',
                      color: 'var(--color-text-secondary)',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!description.trim()}
                    style={{
                      flex: 2,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: description.trim() ? '#ef4444' : '#9ca3af',
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: '700',
                      cursor: description.trim() ? 'pointer' : 'not-allowed',
                    }}
                  >
                    報告する
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
