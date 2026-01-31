/**
 * CarnivoreOS - Settings Screen
 *
 * ユーザー設定画面: 文字サイズ、表示設定など
 */

import { useState, useEffect } from 'react';
import { useTranslation } from '../utils/i18n';
import { useSettings } from '../hooks/useSettings';
import { saveUserProfile } from '../utils/storage';
import { isSupabaseAvailable } from '../lib/supabaseClient';
import { requestNotificationPermission } from '../utils/defrostReminder';
import HelpTooltip from '../components/common/HelpTooltip';

import './SettingsScreen.css';

interface SettingsScreenProps {
  onShowOnboarding?: () => void;
  onBack?: () => void;
}

export default function SettingsScreen({ onShowOnboarding, onBack }: SettingsScreenProps = {}) {
  const { t } = useTranslation();
  const {
    showKnowledge,
    toggleKnowledge,
    showNutrientPreview,
    toggleNutrientPreview,
    fontSize,
    setFontSize,
    darkMode,
    toggleDarkMode,
    tipsEnabled,
    toggleTips,
    toggleDebugMode,
  } = useSettings();

  const [fontSizeLocal, setFontSizeLocal] = useState(fontSize || 'medium');
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>('default');
  const [notificationEnabled, setNotificationEnabled] = useState(() => {
    const saved = localStorage.getItem('settings_notification_enabled');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (fontSize) {
      setFontSizeLocal(fontSize);
    }
  }, [fontSize]);

  useEffect(() => {
    // 通知の許可状態を確認
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleNotificationToggle = async () => {
    if (!('Notification' in window)) {
      alert('このブラウザは通知をサポートしていません');
      return;
    }

    if (!notificationEnabled) {
      // 通知を有効にする場合、許可をリクエスト
      const permission = await requestNotificationPermission();
      if (permission) {
        setNotificationEnabled(true);
        setNotificationPermission(Notification.permission);
        localStorage.setItem('settings_notification_enabled', JSON.stringify(true));
      } else {
        alert('通知の許可が必要です。ブラウザの設定から通知を許可してください。');
      }
    } else {
      // 通知を無効にする場合
      setNotificationEnabled(false);
      localStorage.setItem('settings_notification_enabled', JSON.stringify(false));
    }
  };

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large' | 'xlarge') => {
    setFontSizeLocal(size);
    setFontSize(size);
  };

  return (
    <div className="settings-screen-container">
      <div className="settings-screen-content">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                marginRight: '0.5rem',
                padding: '0.25rem',
              }}
              aria-label="戻る"
            >
              ←
            </button>
          )}
          <h1 className="settings-screen-title" style={{ marginBottom: 0 }}>{t('settings.title')}</h1>
        </div>

        {/* 文字サイズ設定 */}
        <div className="settings-screen-section">
          <h2 className="settings-screen-section-title">文字サイズ</h2>
          <div className="settings-screen-button-row">
            <button
              className={`settings-screen-option-button ${fontSizeLocal === 'small' ? 'active' : ''}`}
              onClick={() => handleFontSizeChange('small')}
            >
              小
            </button>
            <button
              className={`settings-screen-option-button ${fontSizeLocal === 'medium' ? 'active' : ''}`}
              onClick={() => handleFontSizeChange('medium')}
            >
              中
            </button>
            <button
              className={`settings-screen-option-button ${fontSizeLocal === 'large' ? 'active' : ''}`}
              onClick={() => handleFontSizeChange('large')}
            >
              大
            </button>
            <button
              className={`settings-screen-option-button ${fontSizeLocal === 'xlarge' ? 'active' : ''}`}
              onClick={() => handleFontSizeChange('xlarge')}
            >
              特大
            </button>
          </div>
        </div>

        {/* 栄養素表示設定 */}


        {/* 表示設定 */}
        <div className="settings-screen-section">
          <h2 className="settings-screen-section-title">その他の表示設定</h2>
          <div className="settings-screen-switch-row">
            <div className="settings-screen-switch-label-group">
              <label className="settings-screen-switch-label">
                知識ベースを表示
                <HelpTooltip text="カーニボアダイエットに関する科学的根拠に基づいた知識を表示します。各栄養素や食品について詳しい説明が確認できます。" />
              </label>
              <div className="settings-screen-switch-description">
                カーニボアダイエットに関する知識を表示します
              </div>
            </div>
            <label className="settings-screen-switch">
              <input type="checkbox" checked={showKnowledge} onChange={toggleKnowledge} />
              <span className="settings-screen-switch-slider"></span>
            </label>
          </div>
          <div className="settings-screen-switch-row">
            <div className="settings-screen-switch-label-group">
              <label className="settings-screen-switch-label">
                栄養素プレビューを表示
                <HelpTooltip text="食品を追加する際に、その食品を追加した場合の栄養素の変動を事前にプレビュー表示します。目標値との比較が一目で分かります。" />
              </label>
              <div className="settings-screen-switch-description">
                食品追加時に栄養素の変動をプレビュー表示します
              </div>
            </div>
            <label className="settings-screen-switch">
              <input
                type="checkbox"
                checked={showNutrientPreview}
                onChange={toggleNutrientPreview}
              />
              <span className="settings-screen-switch-slider"></span>
            </label>
          </div>
          <div className="settings-screen-switch-row">
            <div className="settings-screen-switch-label-group">
              <label className="settings-screen-switch-label">
                ダークモード
                <HelpTooltip text="ダークテーマに切り替えます。暗い環境での使用時や、目に優しい表示を希望する場合に有効にしてください。" />
              </label>
              <div className="settings-screen-switch-description">
                ダークテーマに切り替えます（目に優しい暗い背景）
              </div>
            </div>
            <label className="settings-screen-switch">
              <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
              <span className="settings-screen-switch-slider"></span>
            </label>
          </div>
          <div className="settings-screen-switch-row">
            <div className="settings-screen-switch-label-group">
              <label className="settings-screen-switch-label">
                Tips（豆知識）を表示
                <HelpTooltip text="AI応答のローディング中やアプリ起動時に、カーニボアダイエットに関する役立つTipsをランダムに表示します。知識を深めるのに役立ちます。" />
              </label>
              <div className="settings-screen-switch-description">
                AI応答のローディング中やアプリ起動時に、カーニボアに関するTipsをランダム表示
              </div>
            </div>
            <label className="settings-screen-switch">
              <input type="checkbox" checked={tipsEnabled} onChange={toggleTips} />
              <span className="settings-screen-switch-slider"></span>
            </label>
          </div>
          <div className="settings-screen-switch-row">
            <div className="settings-screen-switch-label-group">
              <label className="settings-screen-switch-label">
                デバッグモード
                <HelpTooltip text="開発・テスト用の機能です。30日分のサンプルデータを表示します。実際のデータではなく、アプリの動作確認用の仮データです。" />
              </label>
              <div className="settings-screen-switch-description">
                仮データを表示（30日分のサンプルデータ）
              </div>
            </div>
            <label className="settings-screen-switch">
              <input type="checkbox" checked={debugMode} onChange={toggleDebugMode} />
              <span className="settings-screen-switch-slider"></span>
            </label>
          </div>
        </div>

        {/* 通知設定 */}
        <div className="settings-screen-section">
          <h2 className="settings-screen-section-title">通知設定</h2>
          <div className="settings-screen-switch-row">
            <div className="settings-screen-switch-label-group">
              <label className="settings-screen-switch-label">
                通知を有効にする
                <HelpTooltip text="ブラウザの通知機能を有効にします。電解質アラート、脂質不足リマインダー、ストリークリマインダーなどの通知を受け取れます。" />
              </label>
              <div className="settings-screen-switch-description">
                {notificationPermission === 'granted'
                  ? '通知が許可されています'
                  : notificationPermission === 'denied'
                    ? '通知が拒否されています。ブラウザの設定から許可してください。'
                    : '通知の許可をリクエストします'}
              </div>
            </div>
            <label className="settings-screen-switch">
              <input
                type="checkbox"
                checked={notificationEnabled && notificationPermission === 'granted'}
                onChange={handleNotificationToggle}
                disabled={notificationPermission === 'denied'}
              />
              <span className="settings-screen-switch-slider"></span>
            </label>
          </div>
          {notificationPermission === 'denied' && (
            <div
              style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                fontSize: '0.875rem',
                color: '#991b1b',
              }}
            >
              ⚠️ 通知が拒否されています。ブラウザの設定から通知を許可してください。
            </div>
          )}
        </div>

        {/* データ管理 */}
        <div className="settings-screen-section">
          <h2 className="settings-screen-section-title">データ管理</h2>
          <div className="settings-screen-button-row">
            <button
              className="settings-screen-option-button"
              onClick={() => {
                const event = new CustomEvent('navigateToScreen', { detail: 'dataExport' });
                window.dispatchEvent(event);
              }}
            >
              データエクスポート
            </button>
            <button
              className="settings-screen-option-button"
              onClick={() => {
                const event = new CustomEvent('navigateToScreen', { detail: 'dataImport' });
                window.dispatchEvent(event);
              }}
            >
              データインポート
            </button>
          </div>
        </div>

        {/* サポート */}
        <div className="settings-screen-section">
          <h2 className="settings-screen-section-title">サポート</h2>
          <div className="settings-screen-button-row">
            <button
              className="settings-screen-option-button"
              onClick={() => {
                const event = new CustomEvent('navigateToScreen', { detail: 'feedback' });
                window.dispatchEvent(event);
              }}
            >
              バグ報告・フィードバック
            </button>
          </div>
        </div>

        {/* アプリ情報 */}
        <div className="settings-screen-section">
          <h2 className="settings-screen-section-title">アプリ情報</h2>
          <div className="settings-screen-button-row">
            <button
              className="settings-screen-option-button"
              onClick={() => {
                if (onShowOnboarding) {
                  localStorage.removeItem('primal_logic_onboarding_completed');
                  onShowOnboarding();
                }
              }}
            >
              オンボーディングを再表示
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
