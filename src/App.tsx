import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NutritionProvider } from './context/NutritionContext';
import { isSupabaseAvailable } from './lib/supabaseClient';
import { useTranslation } from './utils/i18n';
import type { FoodItem } from './types';
// メイン画面（即座に読み込む必要がある）
import HomeScreen from './screens/HomeScreen';

import OthersScreen from './screens/OthersScreen';
import SettingsScreen from './screens/SettingsScreen';
import CustomFoodScreen from './screens/CustomFoodScreen';
import AuthScreen from './screens/AuthScreen';
import ConsentScreen from './screens/ConsentScreen';
import PaywallScreen from './screens/PaywallScreen';
import { getPaywallChoice, clearPaywallChoice } from './screens/PaywallScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import AISpeedDial from './components/dashboard/AISpeedDial';
import Toast from './components/common/Toast';
import PaywallModal from './components/PaywallModal';
import { getFeatureDisplaySettings } from './utils/featureDisplaySettings';
import { startFastingTimerWatcher } from './utils/notificationService';
import './App.css';
import './styles/common.css';
import './styles/pixel-art.css';

// レイジーローディング（パフォーマンス最適化）
const LazyHistoryScreen = lazy(() => import('./screens/HistoryScreen'));
const LazyUserSettingsScreen = lazy(() => import('./screens/UserSettingsScreen'));
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

type Screen = 'home' | 'profile' | 'history' | 'labs' | 'settings' | 'userSettings' | 'streakTracker' | 'customFood' | 'community' | 'diary' | 'stats' | 'auth' | 'privacy' | 'terms' | 'dataExport' | 'dataImport' | 'dataDelete' | 'feedback' | 'consent' | 'paywall' | 'onboarding' | 'language' | 'salt' | 'carbTarget' | 'nutrientCustom' | 'gift' | 'shop' | 'recipe' | 'healthDevice' | 'input';

// アプリケーション本体
function AppContent() {
  const { t } = useTranslation();
  const { syncLocalStorageToSupabase, error, clearError, isLoading, trialStatus } = useApp();
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    // 初回起動時の画面決定（docs/フロー_ログインサブスク.md）
    // 初回: Consent → サブスク → auth → オンボーディング / 既存ユーザー別デバイス: paywallで「ログイン」→ auth → home
    const consentAccepted = localStorage.getItem('primal_logic_consent_accepted');
    const onboardingCompleted = localStorage.getItem('primal_logic_onboarding_completed');

    if (!consentAccepted) return 'consent';
    if (!onboardingCompleted) return 'paywall';
    return 'home';
  });
  const [openFatTabCallback, setOpenFatTabCallback] = useState<(() => void) | null>(null);
  const [addFoodCallback, setAddFoodCallback] = useState<((foodItem: FoodItem) => void) | null>(null);


  const [isPixelArtEnabled, setIsPixelArtEnabled] = useState(() => {
    return localStorage.getItem('primal_logic_dot_ui_enabled') === 'true';
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' && navigator.onLine);

  // オフライン検出（ネットワークエラー時は永遠にローディングしないため）
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // グローバルなToast表示関数を設定
  useEffect(() => {
    (window as unknown as { showToast: (msg: string) => void }).showToast = (message: string) => {
      setToastMessage(message);
    };
    return () => {
      delete (window as unknown as { showToast: ((msg: string) => void) | undefined }).showToast;
    };
  }, []);

  // 断食タイマー終了通知
  useEffect(() => {
    return startFastingTimerWatcher();
  }, []);

  const { session, isGuest, loading: authLoading } = useAuth();

  // 認証状態の確認と画面遷移（#29: 初回=サブスク→ログイン→オンボ、既存ユーザー別デバイス=ログイン→ホーム）
  useEffect(() => {
    if (authLoading) return;

    const consentAccepted = localStorage.getItem('primal_logic_consent_accepted');
    const onboardingCompleted = localStorage.getItem('primal_logic_onboarding_completed');

    if (!consentAccepted) {
      if (currentScreen !== 'consent') setCurrentScreen('consent');
      return;
    }

    // 既存ユーザー別デバイス: Supabaseログイン済みならオンボーディングをスキップしてホームへ
    if (session && !onboardingCompleted) {
      localStorage.setItem('primal_logic_onboarding_completed', 'true');
      if (['paywall', 'auth', 'onboarding'].includes(currentScreen)) setCurrentScreen('home');
      return;
    }

    if (!onboardingCompleted) {
      if (!['paywall', 'auth', 'onboarding'].includes(currentScreen)) setCurrentScreen('paywall');
      return;
    }

    if (!session && !isGuest) {
      if (['consent', 'paywall', 'onboarding', 'auth'].includes(currentScreen)) return;
      setCurrentScreen('auth');
    } else {
      if (currentScreen === 'auth') setCurrentScreen('home');
    }
  }, [session, isGuest, authLoading, currentScreen]);

  // URLパスまたはパラメータによる画面切り替え（/privacy, /terms, ?screen=privacy など）
  useEffect(() => {
    const pathname = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const screenParam = params.get('screen');

    // パスベースの画面切り替え
    const pathMappings: Record<string, string> = {
      '/privacy': 'privacy',
      '/privacy-policy': 'privacy',
      '/terms': 'terms',
      '/terms-of-service': 'terms',
    };

    // 許可された画面名のリスト
    const allowedScreens = ['privacy', 'terms'] as const;

    // パスから画面を判定
    if (pathMappings[pathname]) {
      setCurrentScreen(pathMappings[pathname] as typeof allowedScreens[number]);
      return;
    }

    // クエリパラメータから画面を判定
    if (screenParam && allowedScreens.includes(screenParam as typeof allowedScreens[number])) {
      setCurrentScreen(screenParam as typeof allowedScreens[number]);
    }
  }, []);

  // 決済完了のリダイレクト処理
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');

    if (paymentStatus === 'success') {
      // 成功した場合、オンボーディング完了として扱う
      localStorage.setItem('primal_logic_onboarding_completed', 'true');
      setCurrentScreen('home');
      // URLパラメータを削除（スッキリさせるため）
      window.history.replaceState({}, '', window.location.pathname);

      // 少し遅延させてトースト表示（DOMのマウントを待つ）
      setTimeout(() => {
        (window as unknown as { showToast: (msg: string) => void }).showToast?.('ようこそ！CarnivOSへ（決済完了）');
      }, 1000);
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
    const handleLanguageChange = () => {
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
  const setScreenRef = useRef(setCurrentScreen);
  setScreenRef.current = setCurrentScreen;
  useEffect(() => {
    const handleNavigate = (event: CustomEvent<string>) => {
      const screen = event.detail as Screen;
      if (screen === 'streakTracker') {
        setStatsInitialTab('streak');
        setScreenRef.current('stats');
        window.dispatchEvent(new CustomEvent('screenChanged'));
        return;
      }
      if (screen === 'stats') setStatsInitialTab(undefined);
      if (['home', 'profile', 'history', 'labs', 'settings', 'userSettings', 'streakTracker', 'customFood', 'community', 'diary', 'stats', 'auth', 'privacy', 'terms', 'dataExport', 'dataImport', 'dataDelete', 'feedback', 'consent', 'onboarding', 'language', 'salt', 'carbTarget', 'nutrientCustom', 'gift', 'shop', 'recipe', 'healthDevice', 'input'].includes(screen)) {
        setScreenRef.current(screen);
        window.dispatchEvent(new CustomEvent('screenChanged'));
      }
    };

    (window as unknown as { __navigateToScreen?: (s: Screen) => void }).__navigateToScreen = (screen: Screen) => {
      setScreenRef.current(screen);
      window.dispatchEvent(new CustomEvent('screenChanged'));
    };

    window.addEventListener('navigateToScreen', handleNavigate as EventListener);
    return () => {
      delete (window as unknown as { __navigateToScreen?: (s: Screen) => void }).__navigateToScreen;
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
      {/* オフラインバナー（Task 3-6: オフライン時は画面上部に表示） */}
      {!isOnline && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: '#fef3c7',
            color: '#92400e',
            padding: '0.5rem 1rem',
            textAlign: 'center',
            fontSize: '14px',
            zIndex: 1999,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          📡 オフラインです。一部の機能（AIチャット等）は利用できません。
        </div>
      )}

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
              onAccept={() => setCurrentScreen('paywall')}
              onDecline={() => {
                alert(t('consent.declineAlert'));
              }}
            />
          )}
          {currentScreen === 'paywall' && (
            <PaywallScreen
              onGoToAuth={() => setCurrentScreen('auth')}
              onContinue={() => setCurrentScreen('auth')}
            />
          )}
          {currentScreen === 'onboarding' && (
            <OnboardingScreen
              onComplete={() => {
                if (session) {
                  setCurrentScreen('home');
                } else {
                  setCurrentScreen('auth');
                }
              }}
            />
          )}
          {currentScreen === 'home' && (
            <HomeScreen
              onOpenFatTabReady={handleOpenFatTabReady}
              onAddFoodReady={handleAddFoodReady}
            />
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen
              onShowOnboarding={() => setCurrentScreen('onboarding')}
              onBack={() => setCurrentScreen('labs')}
            />
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
          {currentScreen === 'labs' && <OthersScreen />}
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
            <AuthScreen
              onAuthSuccess={() => {
                const choice = getPaywallChoice();
                clearPaywallChoice();
                // paywallで「スキップ/購入」を選んだ新規のみオンボーディングへ。ログイン or 未設定（既存ユーザー）はホーム
                if (choice === 'signup') {
                  setCurrentScreen('onboarding');
                } else {
                  localStorage.setItem('primal_logic_onboarding_completed', 'true');
                  setCurrentScreen('home');
                }
              }}
            />
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
              <LazyLanguageSettingsScreen onBack={() => setCurrentScreen('labs')} />
            </Suspense>
          )}
          {currentScreen === 'salt' && (
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>読み込み中...</div>}>
              <LazySaltSettingsScreen onBack={() => setCurrentScreen('labs')} />
            </Suspense>
          )}
          {currentScreen === 'carbTarget' && (
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>読み込み中...</div>}>
              <LazyCarbTargetSettingsScreen onBack={() => setCurrentScreen('labs')} />
            </Suspense>
          )}
          {currentScreen === 'nutrientCustom' && (
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>読み込み中...</div>}>
              <LazyNutrientTargetCustomizationScreen onBack={() => setCurrentScreen('labs')} />
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


        {/* Bottom Navigation - Only show when NOT in restricted screens */}
        {!['auth', 'consent', 'paywall', 'onboarding'].includes(currentScreen) && (
          <nav className="app-navigation" role="navigation" aria-label={t('nav.mainNavigationAriaLabel')}>
            <button
              data-testid="nav-home"
              className={`app-nav-button ${currentScreen === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentScreen('home')}
              aria-label={t('nav.homeAriaLabel')}
              aria-current={currentScreen === 'home' ? 'page' : undefined}
            >
              <span style={{ fontSize: '20px' }} aria-hidden="true">🏠</span>
              <span>{t('nav.home')}</span>
            </button>
            <button
              data-testid="nav-history"
              className={`app-nav-button ${currentScreen === 'history' ? 'active' : ''}`}
              onClick={() => setCurrentScreen('history')}
              aria-label={t('nav.historyAriaLabel')}
              aria-current={currentScreen === 'history' ? 'page' : undefined}
            >
              <span style={{ fontSize: '20px' }} aria-hidden="true">📊</span>
              <span>{t('nav.history')}</span>
            </button>
            <button
              data-testid="nav-others"
              className={`app-nav-button ${currentScreen === 'labs' ? 'active' : ''}`}
              onClick={() => setCurrentScreen('labs')}
              aria-label={t('nav.othersAriaLabel')}
              aria-current={currentScreen === 'labs' ? 'page' : undefined}
            >
              <span style={{ fontSize: '20px' }} aria-hidden="true">📑</span>
              <span>{t('nav.others')}</span>
            </button>
          </nav>
        )}
      </div>
      {getFeatureDisplaySettings().aiSpeedDial &&
        !['consent', 'paywall', 'auth', 'onboarding'].includes(currentScreen) && (
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
              console.error('Subscription error:', err);
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
      <AuthProvider>
        <NutritionProvider>
          <AppContent />
        </NutritionProvider>
      </AuthProvider>
    </AppProvider>
  );
}