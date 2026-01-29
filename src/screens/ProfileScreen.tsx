/**
 * Primal Logic - User Profile Screen (Web版)
 *
 * ユーザープロファイル設定画面: 基本情報、目標、設定
 */

import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { exportAllData, importAllData } from '../utils/storage';
import { useSettings } from '../hooks/useSettings';
import { useUserConfig } from '../hooks/useUserConfig';
import { setLanguage, getLanguage, useTranslation, type Language } from '../utils/i18n';
import { isSupabaseAvailable } from '../lib/supabaseClient';
import CustomFoodScreen from './CustomFoodScreen';
import './ProfileScreen.css';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { userProfile, loadUserProfile } = useApp();
  const { debugMode, toggleDebugMode } = useSettings();
  const { config, updateConfig } = useUserConfig();
  const [languageState, setLanguageState] = useState<Language>(
    (userProfile?.language as Language) || getLanguage()
  );
  const [showCustomFoodScreen, setShowCustomFoodScreen] = useState(false);

  // 言語切り替えハンドラー（アプリ全体を再レンダリング）
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang); // i18nのsetLanguageを呼び出し
    setLanguageState(lang); // ローカルステートも更新
    // アプリ全体を再レンダリングするため、window.location.reload()を呼び出す
    // ただし、これはUX的に良くないので、代わりにAppContextで言語変更を検知して再レンダリング
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
  };

  useEffect(() => {
    if (userProfile) {
      const savedLanguage = (userProfile.language as Language) || getLanguage();
      const currentLanguage = getLanguage();
      // 現在の言語と同じ場合はsetLanguageを呼ばない（リロードを防ぐ）
      if (savedLanguage !== currentLanguage) {
        setLanguage(savedLanguage);
      }
      setLanguageState(savedLanguage);
    }
  }, [userProfile]);

  return (
    <div className="profile-screen-container">
      <div className="profile-screen-content">
        <h1 className="profile-screen-title">{t('settings.title')}</h1>

        {/* ユーザー設定（画面遷移） */}
        <div className="profile-screen-section">
          <div
            className="nav-item"
            role="button"
            tabIndex={0}
            aria-label={t('profile.navigateToUserSettings')}
            onClick={() => {
              // ユーザー設定画面に遷移
              window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'userSettings' }));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.dispatchEvent(
                  new CustomEvent('navigateToScreen', { detail: 'userSettings' })
                );
              }
            }}
          >
            <div className="nav-item-content">
              <h2 className="nav-item-title">{t('profile.userSettings')}</h2>
              <p className="nav-item-description">{t('profile.userSettingsDescription')}</p>
            </div>
            <span className="nav-item-arrow">→</span>
          </div>
        </div>

        {/* 言語設定（遷移式） */}
        <div className="profile-screen-section">
          <div
            className="nav-item"
            role="button"
            tabIndex={0}
            aria-label={t('profile.navigateToLanguage')}
            onClick={() => {
              // 言語設定画面に遷移
              window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'language' }));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'language' }));
              }
            }}
          >
            <div className="nav-item-content">
              <h2 className="nav-item-title">{t('profile.languageSettings')}</h2>
              <p className="nav-item-description">
                {t('common.current')}:{' '}
                {languageState === 'ja'
                  ? t('language.japanese')
                  : languageState === 'en'
                    ? t('language.english')
                    : languageState === 'fr'
                      ? t('language.french')
                      : languageState === 'de'
                        ? t('language.german')
                        : t('language.chinese')}
              </p>
            </div>
            <span className="nav-item-arrow">→</span>
          </div>
        </div>

        {/* デバッグモード */}
        <div className="profile-screen-section">
          <h2 className="profile-screen-section-title">{t('profile.debugMode')}</h2>
          <div className="switch-container">
            <div className="switch-row">
              <span className="switch-label">{t('profile.debugModeDescription')}</span>
              <label className="profile-screen-switch">
                <input type="checkbox" checked={debugMode} onChange={toggleDebugMode} />
                <span className="profile-screen-switch-slider"></span>
              </label>
            </div>
            <div className="switch-status">
              {debugMode ? t('profile.debugModeOn') : t('profile.debugModeOff')}
            </div>
          </div>
        </div>

        {/* カスタム食品登録 */}
        <div className="profile-screen-section">
          <div
            className="nav-item"
            role="button"
            tabIndex={0}
            aria-label={t('profile.openCustomFood')}
            onClick={() => setShowCustomFoodScreen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowCustomFoodScreen(true);
              }
            }}
          >
            <div className="nav-item-content">
              <h2 className="nav-item-title">{t('profile.customFood')}</h2>
              <p className="nav-item-description">{t('profile.customFoodDescription')}</p>
            </div>
            <span className="nav-item-arrow">→</span>
          </div>
        </div>

        {/* UI設定（画面遷移） */}
        <div className="profile-screen-section">
          <div
            className="nav-item"
            role="button"
            tabIndex={0}
            aria-label={t('profile.navigateToUISettings')}
            onClick={() => {
              // UI設定画面に遷移（App.tsxで管理）
              window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'settings' }));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'settings' }));
              }
            }}
          >
            <div className="nav-item-content">
              <h2 className="nav-item-title">{t('profile.uiSettings')}</h2>
              <p className="nav-item-description">{t('profile.uiSettingsDescription')}</p>
            </div>
            <span className="nav-item-arrow">→</span>
          </div>
        </div>

        {/* 塩ミルの設定（遷移式） */}
        <div className="profile-screen-section">
          <div
            className="nav-item"
            role="button"
            tabIndex={0}
            aria-label={t('profile.navigateToSaltSettings')}
            onClick={() => {
              window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'salt' }));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'salt' }));
              }
            }}
          >
            <div className="nav-item-content">
              <h2 className="nav-item-title">{t('profile.saltSettings')}</h2>
              <p className="nav-item-description">
                {t('profile.saltType')}:{' '}
                {config.saltType === 'table_salt'
                  ? t('profile.tableSalt')
                  : config.saltType === 'sea_salt'
                    ? t('profile.seaSalt')
                    : config.saltType === 'himalayan_salt'
                      ? t('profile.himalayanSalt')
                      : t('profile.celticSalt')}{' '}
                / {config.saltUnitWeight}g/{t('profile.perShave')}
              </p>
            </div>
            <span className="nav-item-arrow">→</span>
          </div>
        </div>

        {/* 炭水化物ターゲット設定（遷移式） */}
        <div className="profile-screen-section">
          <div
            className="nav-item"
            role="button"
            tabIndex={0}
            aria-label={t('profile.navigateToCarbTargetSettings')}
            onClick={() => {
              window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'carbTarget' }));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'carbTarget' }));
              }
            }}
          >
            <div className="nav-item-content">
              <h2 className="nav-item-title">{t('profile.carbTargetSettings')}</h2>
              <p className="nav-item-description">
                {t('common.current')}: {config.targetCarbs}g/{t('common.perDay')}
              </p>
            </div>
            <span className="nav-item-arrow">→</span>
          </div>
        </div>

        {/* データエクスポート/インポート */}
        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#1f2937',
            }}
          >
            {t('profile.dataManagement')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={async () => {
                try {
                  const data = await exportAllData();
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `primal-logic-backup-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  alert(t('profile.exportSuccess'));
                } catch (error) {
                  alert(
                    t('profile.exportFailed') + ': ' + (error instanceof Error ? error.message : '')
                  );
                }
              }}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#f3f4f6',
                color: '#1f2937',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              📥 {t('profile.exportData')}
            </button>
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'application/json';
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (!file) return;

                  try {
                    const text = await file.text();
                    if (window.confirm(t('profile.importConfirm'))) {
                      await importAllData(text);
                      await loadUserProfile();
                      alert(t('profile.importSuccess'));
                    }
                  } catch (error) {
                    alert(
                      t('profile.importFailed') +
                        ': ' +
                        (error instanceof Error ? error.message : '')
                    );
                  }
                };
                input.click();
              }}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#f3f4f6',
                color: '#1f2937',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              📤 {t('profile.importData')}
            </button>
          </div>
        </div>

        {/* アカウント */}
        {isSupabaseAvailable() && (
          <div className="profile-screen-section">
            <div
              className="nav-item"
              role="button"
              tabIndex={0}
              aria-label={t('profile.navigateToAccount')}
              onClick={() => {
                window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'auth' }));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'auth' }));
                }
              }}
            >
              <div className="nav-item-content">
                <h2 className="nav-item-title">{t('profile.account')}</h2>
                <p className="nav-item-description">{t('profile.accountDescription')}</p>
              </div>
              <span className="nav-item-arrow">→</span>
            </div>
          </div>
        )}

        {/* データ管理 */}
        <div className="profile-screen-section">
          <div
            className="nav-item"
            role="button"
            tabIndex={0}
            aria-label={t('profile.navigateToDataExport')}
            onClick={() => {
              window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'dataExport' }));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'dataExport' }));
              }
            }}
          >
            <div className="nav-item-content">
              <h2 className="nav-item-title">{t('profile.exportData')}</h2>
              <p className="nav-item-description">{t('profile.exportDescription')}</p>
            </div>
            <span className="nav-item-arrow">→</span>
          </div>
          <div
            className="nav-item"
            role="button"
            tabIndex={0}
            aria-label={t('profile.navigateToDataDelete')}
            onClick={() => {
              window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'dataDelete' }));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'dataDelete' }));
              }
            }}
            style={{ color: '#dc2626' }}
          >
            <div className="nav-item-content">
              <h2 className="nav-item-title">{t('profile.deleteData')}</h2>
              <p className="nav-item-description">{t('profile.deleteDescription')}</p>
            </div>
            <span className="nav-item-arrow">→</span>
          </div>
        </div>

        {/* ヘルプとサポート */}
        <div className="profile-screen-section">
          <div
            className="nav-item"
            role="button"
            tabIndex={0}
            aria-label={t('profile.navigateToFeedback')}
            onClick={() => {
              window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'feedback' }));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'feedback' }));
              }
            }}
          >
            <div className="nav-item-content">
              <h2 className="nav-item-title">フィードバックを送信</h2>
              <p className="nav-item-description">バグ報告、機能リクエスト、ご意見</p>
            </div>
            <span className="nav-item-arrow">→</span>
          </div>
        </div>

        {/* 法的情報 */}
        <div className="profile-screen-section">
          <div
            className="nav-item"
            role="button"
            tabIndex={0}
            aria-label={t('profile.navigateToPrivacyPolicy')}
            onClick={() => {
              window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'privacy' }));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'privacy' }));
              }
            }}
          >
            <div className="nav-item-content">
              <h2 className="nav-item-title">プライバシーポリシー</h2>
              <p className="nav-item-description">個人情報の取り扱いについて</p>
            </div>
            <span className="nav-item-arrow">→</span>
          </div>
          <div
            className="nav-item"
            role="button"
            tabIndex={0}
            aria-label={t('profile.navigateToTermsOfService')}
            onClick={() => {
              window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'terms' }));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'terms' }));
              }
            }}
          >
            <div className="nav-item-content">
              <h2 className="nav-item-title">利用規約</h2>
              <p className="nav-item-description">サービスの利用条件</p>
            </div>
            <span className="nav-item-arrow">→</span>
          </div>
        </div>

        {/* アプリ情報 */}
        <div className="profile-screen-section">
          <div
            className="profile-screen-section-title"
            style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}
          >
            アプリ情報
          </div>
          <div style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#6b7280' }}>
            <div style={{ marginBottom: '0.25rem' }}>Primal Logic</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>バージョン 0.0.0</div>
          </div>
        </div>
      </div>

      {/* カスタム食品登録画面（モーダル） */}
      {showCustomFoodScreen && (
        <CustomFoodScreen
          onClose={() => setShowCustomFoodScreen(false)}
          onSave={() => {
            // 保存後の処理（必要に応じて）
          }}
        />
      )}
    </div>
  );
}
