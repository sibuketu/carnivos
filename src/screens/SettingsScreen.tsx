/**
 * CarnivoreOS - Settings Screen
 *
 * ユーザー設定画面: 文字サイズ、表示設定など
 */

import { useState, useEffect } from 'react';
import { useTranslation } from '../utils/i18n';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../context/AuthContext';
import { requestNotificationPermission } from '../utils/defrostReminder';
import { getFastingDefaultHours, setFastingDefaultHours } from '../utils/fastingDefaults';
import {
  getNutrientDisplayMode,
  saveNutrientDisplayMode,
  type NutrientDisplayMode,
} from '../utils/nutrientPriority';
import HelpTooltip from '../components/common/HelpTooltip';

import './SettingsScreen.css';

interface SettingsScreenProps {
  onShowOnboarding?: () => void;
  onBack?: () => void;
}

export default function SettingsScreen({ onShowOnboarding, onBack }: SettingsScreenProps = {}) {
  const { t, language } = useTranslation();
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
    debugMode,
    toggleDebugMode,
  } = useSettings();

  const { signOut } = useAuth();

  const [fontSizeLocal, setFontSizeLocal] = useState(fontSize || 'medium');
  const [fastingDefaultHours, setFastingDefaultHoursLocal] = useState(() => getFastingDefaultHours());
  const [nutrientMode, setNutrientMode] = useState<NutrientDisplayMode>(() => getNutrientDisplayMode());
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
        alert(t('settings.notificationPermissionRequired'));
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

        <div className="settings-screen-button-row">
          <button
            className={`settings-screen-option-button ${i18n.language === 'en' ? 'active' : ''}`}
            onClick={() => changeLanguage('en')}
          >
            English
          </button>
          <button
            className={`settings-screen-option-button ${language === 'ja' ? 'active' : ''}`}
            onClick={() => setLanguage('ja')}
          >
            日本語
          </button>
          <button
            className={`settings-screen-option-button ${i18n.language === 'fr' ? 'active' : ''}`}
            onClick={() => changeLanguage('fr')}
          >
            Français
          </button>
          <button
            className={`settings-screen-option-button ${language === 'de' ? 'active' : ''}`}
            onClick={() => setLanguage('de')}
          >
            Deutsch
          </button>
          <button
            className={`settings-screen-option-button ${language === 'zh' ? 'active' : ''}`}
            onClick={() => setLanguage('zh')}
          >
            中文
          </button>
        </div>


        {/* 断食タイマーのデフォルト時間 */}
        <div className="settings-screen-section">
          <h2 className="settings-screen-section-title">断食タイマー（デフォルト時間）</h2>
          <div className="settings-screen-button-row">
            {[12, 16, 18, 24].map((h) => (
              <button
                key={h}
                className={`settings-screen-option-button ${fastingDefaultHours === h ? 'active' : ''}`}
                onClick={() => {
                  setFastingDefaultHours(h);
                  setFastingDefaultHoursLocal(h);
                }}
              >
                {h}{t('settings.hours')}
              </button>
            ))}
          </div>
        </div>

        {/* 文字サイズ設定 */}
        <div className="settings-screen-section">
          <h2 className="settings-screen-section-title">文字サイズ</h2>
          <div className="settings-screen-button-row">
            <button
              className={`settings-screen-option-button ${fontSizeLocal === 'small' ? 'active' : ''}`}
              onClick={() => handleFontSizeChange('small')}
            >
              {t('settings.fontSizeSmall')}
            </button>
            <button
              className={`settings-screen-option-button ${fontSizeLocal === 'medium' ? 'active' : ''}`}
              onClick={() => handleFontSizeChange('medium')}
            >
              {t('settings.fontSizeMedium')}
            </button>
            <button
              className={`settings-screen-option-button ${fontSizeLocal === 'large' ? 'active' : ''}`}
              onClick={() => handleFontSizeChange('large')}
            >
              {t('settings.fontSizeLarge')}
            </button>
            <button
              className={`settings-screen-option-button ${fontSizeLocal === 'xlarge' ? 'active' : ''}`}
              onClick={() => handleFontSizeChange('xlarge')}
            >
              {t('settings.fontSizeXlarge')}
            </button>
          </div>
        </div>

        {/* 栄養素表示モード（3モードUI） */}
        <div className="settings-screen-section">
          <h2 className="settings-screen-section-title">栄養素の表示モード</h2>
          <p className="settings-screen-section-description" style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
            ホーム・履歴で表示する栄養素の量を選べます。シンプル→標準→詳細の順に多く表示されます。
          </p>
          <div className="settings-screen-button-row" style={{ flexDirection: 'column', gap: '0.5rem' }}>
            {(
              [
                { value: 'simple' as const, label: 'シンプル', desc: '電解質（Na, K, Mg）と脂質のみ' },
                { value: 'standard' as const, label: '標準', desc: '電解質・マクロ＋主要ミネラル・ビタミン' },
                { value: 'detailed' as const, label: '詳細', desc: '全栄養素（60項目以上）' },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  saveNutrientDisplayMode(option.value);
                  setNutrientMode(option.value);
                  window.dispatchEvent(new CustomEvent('nutrientDisplayModeChanged'));
                }}
                className={`settings-screen-option-button ${nutrientMode === option.value ? 'active' : ''}`}
                style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem' }}
              >
                <div style={{ fontWeight: '600' }}>{option.label}</div>
                <div style={{ fontSize: '0.8125rem', opacity: 0.9 }}>{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 表示設定 */}
        <div className="settings-screen-section">
          <h2 className="settings-screen-section-title">その他の表示設定</h2>
          <div className="settings-screen-switch-row">
            <div className="settings-screen-switch-label-group">
              <label className="settings-screen-switch-label">
                {t('settings.showKnowledge')}
                <HelpTooltip text={t('settings.knowledgeTooltip')} />
              </label>
              <div className="settings-screen-switch-description">
                {t('settings.knowledgeDesc')}
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
                {t('settings.darkMode')}
                <HelpTooltip text={t('settings.darkModeTooltip')} />
              </label>
              <div className="settings-screen-switch-description">
                {t('settings.darkModeDesc')}
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
                {t('settings.debugMode')}
                <HelpTooltip text={t('settings.debugModeTooltip')} />
              </label>
              <div className="settings-screen-switch-description">
                {t('settings.debugModeDesc')}
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

          {notificationPermission === 'default' ? (
            // 許可が未取得の場合: ボタンを表示
            <div style={{ padding: '1rem 0' }}>
              <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
                解凍リマインダーなどの通知を受け取るには、ブラウザの通知許可が必要です。
              </p>
              <button
                onClick={async () => {
                  const permission = await requestNotificationPermission();
                  if (permission) {
                    setNotificationEnabled(true);
                    setNotificationPermission(Notification.permission);
                    localStorage.setItem('settings_notification_enabled', JSON.stringify(true));
                  } else {
                    alert(t('settings.notificationPermissionRequired'));
                  }
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minHeight: '44px',
                  minWidth: '44px',
                }}
              >
                🔔 通知を受け取る
              </button>
            </div>
          ) : notificationPermission === 'granted' ? (
            // 許可済みの場合: トグルを表示
            <div className="settings-screen-switch-row">
              <div className="settings-screen-switch-label-group">
                <label className="settings-screen-switch-label">
                  {t('settings.notificationEnable')}
                  <HelpTooltip text={t('settings.notificationTooltip')} />
                </label>
                <div className="settings-screen-switch-description">
                  {t('settings.notificationGranted')}
                </div>
              </div>
              <label className="settings-screen-switch">
                <input
                  type="checkbox"
                  checked={notificationEnabled}
                  onChange={handleNotificationToggle}
                />
                <span className="settings-screen-switch-slider"></span>
              </label>
            </div>
          ) : (
            // 拒否された場合: 警告を表示
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
              ⚠️ {t('settings.notificationDenied')}
              <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                ブラウザの設定から通知を許可してください。
              </p>
            </div>
          )}
        </div>

        {/* データ管理 */}
        <div className="settings-screen-section">
          <h2 className="settings-screen-section-title">{t('settings.dataManagement')}</h2>
          <div className="settings-screen-button-row">
            <button
              className="settings-screen-option-button"
              onClick={() => {
                const event = new CustomEvent('navigateToScreen', { detail: 'dataExport' });
                window.dispatchEvent(event);
              }}
            >
              {t('profile.exportData')}
            </button>
            <button
              className="settings-screen-option-button"
              onClick={() => {
                const event = new CustomEvent('navigateToScreen', { detail: 'dataImport' });
                window.dispatchEvent(event);
              }}
            >
              {t('profile.importData')}
            </button>
          </div>
        </div>

        {/* 機能紹介: 軽い説明→タップで実際のUIを見せる（決定の背景） */}
        <div className="settings-screen-section">
          <h2 className="settings-screen-section-title">{t('settings.featureIntro')}</h2>
          <p className="settings-screen-section-description" style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
            {t('settings.featureIntroDesc')}
          </p>
          <div className="settings-feature-intro-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { titleKey: 'settings.featureHome', descKey: 'settings.featureHomeDesc', screen: 'home' as const },
              { titleKey: 'settings.featureDiary', descKey: 'settings.featureDiaryDesc', screen: 'diary' as const },
              { titleKey: 'settings.featureHistory', descKey: 'settings.featureHistoryDesc', screen: 'history' as const },
              { titleKey: 'settings.featureStats', descKey: 'settings.featureStatsDesc', screen: 'stats' as const },
              { titleKey: 'settings.featureLabs', descKey: 'settings.featureLabsDesc', screen: 'labs' as const },
            ].map((item) => (
              <div
                key={item.screen}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: '#fafafa',
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{item.title}</div>
                <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '0.5rem' }}>{item.desc}</div>
                <button
                  type="button"
                  className="settings-screen-option-button"
                  style={{ width: '100%', textAlign: 'left' }}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: item.screen }));
                  }}
                >
                  実際の画面を見る →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* サポート */}
        <div className="settings-screen-section">
          <h2 className="settings-screen-section-title">{t('settings.support')}</h2>
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
          <h2 className="settings-screen-section-title">{t('settings.appInfo')}</h2>
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
            <button
              className="settings-screen-option-button"
              onClick={() => {
                const event = new CustomEvent('navigateToScreen', { detail: 'privacy' });
                window.dispatchEvent(event);
              }}
            >
              プライバシーポリシー
            </button>
            <button
              className="settings-screen-option-button"
              onClick={() => {
                const event = new CustomEvent('navigateToScreen', { detail: 'terms' });
                window.dispatchEvent(event);
              }}
            >
              利用規約
            </button>
          </div>
        </div>

        {/* アカウント管理（危険エリア） */}
        <div className="settings-screen-section" style={{ border: '1px solid #fee2e2', backgroundColor: '#fff5f5' }}>
          <h2 className="settings-screen-section-title" style={{ color: '#dc2626' }}>{t('settings.accountMgmt')}</h2>
          <div className="settings-screen-button-row">
            <button
              className="settings-screen-option-button"
              onClick={async () => {
                if (window.confirm('ログアウトしますか？')) {
                  await signOut();
                }
              }}
              style={{ color: '#374151' }}
            >
              {t('settings.logout')}
            </button>
            <button
              className="settings-screen-option-button"
              onClick={() => {
                const event = new CustomEvent('navigateToScreen', { detail: 'dataDelete' });
                window.dispatchEvent(event);
              }}
              style={{ color: '#dc2626', fontWeight: 'bold' }}
            >
              {t('settings.deleteAccount')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
