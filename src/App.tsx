import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { NutritionProvider } from './context/NutritionContext';
import { supabase, isSupabaseAvailable } from './lib/supabaseClient';
import { getUserFriendlyErrorMessage, logError } from './utils/errorHandler';
import { useTranslation } from './utils/i18n';
import type { FoodItem } from './types';
import type { Session } from '@supabase/supabase-js';
// メイン画面（即座に読み込む必要がある）
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import LabsScreen from './screens/LabsScreen';
import SettingsScreen from './screens/SettingsScreen';
import CustomFoodScreen from './screens/CustomFoodScreen';
import AuthScreen from './screens/AuthScreen';
import ConsentScreen from './screens/ConsentScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import AISpeedDial from './components/dashboard/AISpeedDial';
import Toast from './components/common/Toast';
import PaywallModal from './components/PaywallModal';
import { getFeatureDisplaySettings } from './utils/featureDisplaySettings';
import './App.css';
import './styles/common.css';
import './styles/pixel-art.css';

// レイジーローディング（パフォーマンス最適化）
const LazyHistoryScreen = lazy(() => import('./screens/HistoryScreen'));
const LazyUserSettingsScreen = lazy(() => import('./screens/UserSettingsScreen'));
const LazyStreakTrackerScreen = lazy(() => import('./screens/StreakTrackerScreen'));
const LazyCommunityScreen = lazy(() => import('./screens/CommunityScreen'));
const LazyDiaryScreen = lazy(() => import('./screens/DiaryScreen'));
const LazyStatsScreen = lazy(() => import('./screens/StatsScreen'));
const LazyPrivacyPolicyScreen = lazy(() => import('./screens/PrivacyPolicyScreen'));
const LazyTermsOfServiceScreen = lazy(() => import('./screens/TermsOfServiceScreen'));
const LazyDataExportScreen = lazy(() => import('./screens/DataExportScreen'));
const LazyDataImportScreen = lazy(() => import('./screens/DataImportScreen'));
const LazyDataDeleteScreen = lazy(() => import('./screens/DataDeleteScreen'));
const LazyFeedbackScreen = lazy(() => import('./screens/FeedbackScreen'));
const LazyLanguageSettingsScreen = lazy(() => import('./screens/LanguageSettingsScreen'));
const LazySaltSettingsScreen = lazy(() => import('./screens/SaltSettingsScreen'));
const LazyCarbTargetSettingsScreen = lazy(() => import('./screens/CarbTargetSettingsScreen'));
const LazyNutrientTargetCustomizationScreen = lazy(() => import('./screens/NutrientTargetCustomizationScreen'));
const LazyGiftScreen = lazy(() => import('./screens/GiftScreen'));
const LazyShopScreen = lazy(() => import('./screens/ShopScreen'));
const LazyRecipeScreen = lazy(() => import('./screens/RecipeScreen'));
const LazyHealthDeviceScreen = lazy(() => import('./screens/HealthDeviceScreen'));
const LazyInputScreen = lazy(() => import('./screens/InputScreen'));

type Screen = 'home' | 'profile' | 'history' | 'labs' | 'settings' | 'userSettings' | 'streakTracker' | 'customFood' | 'community' | 'diary' | 'stats' | 'auth' | 'privacy' | 'terms' | 'dataExport' | 'dataImport' | 'dataDelete' | 'feedback' | 'consent' | 'onboarding' | 'language' | 'salt' | 'carbTarget' | 'nutrientCustom' | 'gift' | 'shop' | 'recipe' | 'healthDevice' | 'input';

// アプリケーション本体
function AppContent() {
  const { t } = useTranslation();
  const { syncLocalStorageToSupabase, error, clearError, isLoading, trialStatus } = useApp();
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    // 初回起動時の画面決定
    const consentAccepted = localStorage.getItem('primal_logic_consent_accepted');
    const onboardingCompleted = localStorage.getItem('primal_logic_onboarding_completed');

    if (!consentAccepted) {
      return 'consent';
    }
    if (!onboardingCompleted) {
      return 'onboarding';
    }
    return 'home';
  });
  const [openFatTabCallback, setOpenFatTabCallback] = useState<(() => void) | null>(null);
  const [addFoodCallback, setAddFoodCallback] = useState<((foodItem: FoodItem) => void) | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isPixelArtEnabled, setIsPixelArtEnabled] = useState(() => {
    return localStorage.getItem('primal_logic_dot_ui_enabled') === 'true';
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // グローバルなToast表示関数を設定
  useEffect(() => {
    (window as any).showToast = (message: string) => {
      setToastMessage(message);
    };
    return () => {
      delete (window as any).showToast;
    };
  }, []);

  // 認証状態の確認
  useEffect(() => {
    if (isSupabaseAvailable() && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        // セッションがない場合は認証画面を表示（オプション：必須にする場合はコメントアウトを解除）
        // if (!session) {
        //   setShowAuth(true);
        // }
      });

      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session) {
          setShowAuth(false);
        }
      });
    }
  }, []);

  // ドット絵UIの適用
  useEffect(() => {
    if (isPixelArtEnabled) {
      document.documentElement.setAttribute('data-pixel-art', 'true');
    } else {
      document.documentElement.removeAttribute('data-pixel-art');
    }
  }, [isPixelArtEnabled]);

  // ドット絵UI変更イベントをリッスン
  useEffect(() => {
    const handleDotUIChange = () => {
      const enabled = localStorage.getItem('primal_logic_dot_ui_enabled') === 'true';
      setIsPixelArtEnabled(enabled);
    };
    window.addEventListener('dotUIChanged', handleDotUIChange);
    return () => {
      window.removeEventListener('dotUIChanged', handleDotUIChange);
    };
  }, []);

  // アプリ起動時にlocalStorageからSupabaseへ同期
  useEffect(() => {
    if (session || !isSupabaseAvailable()) {
      syncLocalStorageToSupabase();
    }
  }, [syncLocalStorageToSupabase, session]);

  // 言語変更イベントをリッスンして全画面を再レンダリング
  const [languageChangeKey, setLanguageChangeKey] = useState(0);
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      // 言語変更時に強制的に再レンダリング
      setLanguageChangeKey(prev => prev + 1);
      // リロードも実行（確実に反映させるため）
      setTimeout(() => {
        window.location.reload();
      }, 100);
    };
    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

  // 画面遷移イベントをリッスン（ProfileScreenからUI設定画面への遷移など）
  useEffect(() => {
    const handleNavigate = (event: CustomEvent<string>) => {
      const screen = event.detail as Screen;
      if (['home', 'profile', 'history', 'labs', 'settings', 'userSettings', 'streakTracker', 'customFood', 'community', 'diary', 'stats', 'auth', 'privacy', 'terms', 'dataExport', 'dataImport', 'dataDelete', 'feedback', 'consent', 'onboarding', 'language', 'salt', 'carbTarget', 'nutrientCustom', 'gift', 'shop', 'recipe', 'healthDevice', 'input'].includes(screen)) {
        setCurrentScreen(screen);
        // 画面遷移時にデータ更新を通知（各画面で再計算を促す）
        window.dispatchEvent(new CustomEvent('screenChanged'));
      }
    };

    window.addEventListener('navigateToScreen', handleNavigate as EventListener);
    return () => {
      window.removeEventListener('navigateToScreen', handleNavigate as EventListener);
    };
  }, []);

  // コールバックを安定化（無限ループ防止）
  const handleOpenFatTabReady = useCallback((callback: () => void) => {
    setOpenFatTabCallback(() => callback);
  }, []);

  const handleAddFoodReady = useCallback((callback: (foodItem: FoodItem) => void) => {
    setAddFoodCallback(() => callback);
  }, []);

  return (
    <>
      {/* エラー通知 */}
      {error && (
        <div
          style={{
            position: 'fixed',
            top: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            zIndex: 2000,
            maxWidth: '90%',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <span>⚠️ {error}</span>
          <button
            onClick={clearError}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc2626',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '0',
              lineHeight: '1',
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* ローディングインジケーター */}
      {isLoading && (
        <div
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            zIndex: 2000,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span className="animate-spin">⏳</span>
          <span>処理中...</span>
        </div>
      )}

      {/* トースト通知 */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      <div className="app-container" key={languageChangeKey}>
        {/* Main Content */}
        <div className="app-content">
          {currentScreen === 'consent' && (
            <ConsentScreen
              onAccept={() => setCurrentScreen('onboarding')}
              onDecline={() => {
                alert('プライバシーポリシーと利用規約に同意していただく必要があります。');
              }}
            />
          )}
          {currentScreen === 'onboarding' && (
            <OnboardingScreen
              onComplete={() => setCurrentScreen('home')}
            />
          )}
          {currentScreen === 'home' && (
            <HomeScreen
              onOpenFatTabReady={handleOpenFatTabReady}
              onAddFoodReady={handleAddFoodReady}
            />
          )}
          {currentScreen === 'profile' && <ProfileScreen />}
          {currentScreen === 'settings' && (
            <SettingsScreen onShowOnboarding={() => setCurrentScreen('onboarding')} />
          )}
          {currentScreen === 'userSettings' && (
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>読み込み中...</div>}>
              <LazyUserSettingsScreen />
            </Suspense>
          )}
          {currentScreen === 'history' && (
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>読み込み中...</div>}>
              <LazyHistoryScreen />
            </Suspense>
          )}
          {currentScreen === 'labs' && <LabsScreen />}
          {currentScreen === 'streakTracker' && (
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>読み込み中...</div>}>
              <LazyStreakTrackerScreen onBack={() => setCurrentScreen('labs')} />
            </Suspense>
          )}
          {currentScreen === 'customFood' && (
            <CustomFoodScreen
              onClose={() => setCurrentScreen('home')}
              onSave={() => {
                // 保存後にホーム画面に戻る
                setCurrentScreen('home');
              }}
            />
          )}
          {currentScreen === 'community' && (
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>読み込み中...</div>}>
              <LazyCommunityScreen onBack={() => setCurrentScreen('labs')} />
            </Suspense>
          )}
          {currentScreen === 'diary' && (
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>読み込み中...</div>}>
              <LazyDiaryScreen onBack={() => setCurrentScreen('labs')} />
            </Suspense>
          )}
          {currentScreen === 'stats' && (
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>読み込み中...</div>}>
              <LazyStatsScreen />
            </Suspense>
          )}
          {currentScreen === 'auth' && (
            <AuthScreen onAuthSuccess={() => setCurrentScreen('home')} />
          )}
          {currentScreen === 'privacy' && (
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>読み込み中...</div>}>
              <LazyPrivacyPolicyScreen />
            </Suspense>
          )}
          {currentScreen === 'terms' && (
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>読み込み中...</div>}>
              <LazyTermsOfServiceScreen />
            </Suspense>
          )}
          {currentScreen === 'dataExport' && (
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>読み込み中...</div>}>
              <LazyDataExportScreen />
            </Suspense>
          )}
          {currentScreen === 'dataImport' && (
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>読み込み中...</div>}>
              <LazyDataImportScreen onBack={() => setCurrentScreen('settings')} />
            </Suspense>
          )}
          {currentScreen === 'dataDelete' && (
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>読み込み中...</div>}>
              <LazyDataDeleteScreen />
            </Suspense>
          )}
          {currentScreen === 'feedback' && (
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>読み込み中...</div>}>
              <LazyFeedbackScreen />
            </Suspense>
          )}
          {currentScreen === 'language' && (
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>読み込み中...</div>}>
              <LazyLanguageSettingsScreen onBack={() => setCurrentScreen('profile')} />
            </Suspense>
          )}
          {currentScreen === 'salt' && (
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>読み込み中...</div>}>
              <LazySaltSettingsScreen onBack={() => setCurrentScreen('profile')} />
            </Suspense>
          )}
          {currentScreen === 'carbTarget' && (
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>読み込み中...</div>}>
              <LazyCarbTargetSettingsScreen onBack={() => setCurrentScreen('profile')} />
            </Suspense>
          )}
          {currentScreen === 'nutrientCustom' && (
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>読み込み中...</div>}>
              <LazyNutrientTargetCustomizationScreen onBack={() => setCurrentScreen('profile')} />
            </Suspense>
          )}
          {currentScreen === 'gift' && (
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>読み込み中...</div>}>
              <LazyGiftScreen onBack={() => setCurrentScreen('labs')} />
            </Suspense>
          )}
          {currentScreen === 'shop' && (
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>読み込み中...</div>}>
              <LazyShopScreen onBack={() => setCurrentScreen('labs')} />
            </Suspense>
          )}
          {currentScreen === 'recipe' && (
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>読み込み中...</div>}>
              <LazyRecipeScreen onBack={() => setCurrentScreen('home')} />
            </Suspense>
          )}
          {currentScreen === 'healthDevice' && (
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>読み込み中...</div>}>
              <LazyHealthDeviceScreen onBack={() => setCurrentScreen('labs')} />
            </Suspense>
          )}
          {currentScreen === 'input' && (
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>読み込み中...</div>}>
              <LazyInputScreen
                onClose={() => setCurrentScreen('home')}
              />
            </Suspense>
          )}
        </div>

        {/* Bottom Navigation */}
        <nav className="app-navigation" role="navigation" aria-label={t('nav.mainNavigationAriaLabel')}>
          <button
            className={`app-nav-button ${currentScreen === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('home')}
            aria-label={t('nav.homeAriaLabel')}
            aria-current={currentScreen === 'home' ? 'page' : undefined}
          >
            <span style={{ fontSize: '20px' }} aria-hidden="true">🏠</span>
            <span>{t('nav.home')}</span>
          </button>
          <button
            className={`app-nav-button ${currentScreen === 'history' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('history')}
            aria-label={t('nav.historyAriaLabel')}
            aria-current={currentScreen === 'history' ? 'page' : undefined}
          >
            <span style={{ fontSize: '20px' }} aria-hidden="true">📊</span>
            <span>{t('nav.history')}</span>
          </button>
          <button
            className={`app-nav-button ${currentScreen === 'labs' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('labs')}
            aria-label={t('nav.labsAriaLabel')}
            aria-current={currentScreen === 'labs' ? 'page' : undefined}
          >
            <span style={{ fontSize: '20px' }} aria-hidden="true">🧪</span>
            <span>{t('nav.labs')}</span>
          </button>
          <button
            className={`app-nav-button ${currentScreen === 'profile' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('profile')}
            aria-label={t('nav.profileAriaLabel')}
            aria-current={currentScreen === 'profile' ? 'page' : undefined}
          >
            <span style={{ fontSize: '20px' }} aria-hidden="true">⚙️</span>
            <span>{t('nav.profile')}</span>
          </button>
        </nav>
      </div>
      {getFeatureDisplaySettings().aiSpeedDial && (
        <AISpeedDial
          onOpenFatTab={openFatTabCallback || undefined}
          onAddFood={addFoodCallback || undefined}
        />
      )}

      {/* ペイウォールモーダル（トライアル期限切れ時） */}
      {trialStatus && trialStatus.isExpired && !trialStatus.hasSubscription && (
        <PaywallModal
          trialStatus={trialStatus}
          onSubscribe={async () => {
            try {
              const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
              if (!supabaseUrl) {
                alert('Supabase URLが設定されていません');
                return;
              }

              const origin = window.location.origin;
              const response = await fetch(`${supabaseUrl}/functions/v1/create-subscription-session`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  priceId: 'price_monthly',
                  successUrl: `${origin}/?payment=success`,
                  cancelUrl: `${origin}/?payment=canceled`,
                }),
              });

              const data = await response.json();
              if (data.url) {
                window.location.href = data.url;
              } else {
                throw new Error('Checkout URLの取得に失敗しました');
              }
            } catch (err) {
              logError(err, { component: 'App', action: 'subscribe' });
              alert('決済画面への遷移に失敗しました。設定画面から再度お試しください。');
            }
          }}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <NutritionProvider>
        <AppContent />
      </NutritionProvider>
    </AppProvider>
  );
}