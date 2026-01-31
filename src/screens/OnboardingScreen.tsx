/**
 * Primal Logic - Onboarding Screen
 *
 * 初回起動時のオンボーディング（3ステップ）
 * Step 1: 言語選択
 * Step 2: プロフィール（性別/体重/目標/代謝状態）
 * Step 3: 通知設定
 */

import { useState, useEffect } from 'react';
import { setLanguage, getLanguage, type Language } from '../utils/i18n';
import { saveUserProfile, getUserProfile } from '../utils/storage';
import { USER_GOALS, METABOLIC_STATUS } from '../constants/carnivore_constants';
import type { UserProfile, UserGoal, MetabolicStatus } from '../types';
import './OnboardingScreen.css';

interface OnboardingStep {
  title: string;
  description: string;
  icon: string;
  isLanguageStep?: boolean;
  isProfileStep?: boolean;
  isNotificationStep?: boolean;
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: '言語を選択',
    description: 'まず、アプリの表示言語を選択してください。後から変更することもできます。',
    icon: '🌐',
    isLanguageStep: true,
  },
  {
    title: 'プロフィール',
    description: 'あなたに最適な栄養目標を計算するための情報です。すべてスキップ可能です。',
    icon: '👤',
    isProfileStep: true,
  },
  {
    title: '通知設定',
    description: '電解質アラート、脂質不足リマインダーなどの通知を受け取れます。',
    icon: '🔔',
    isNotificationStep: true,
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

// 代謝状態の選択肢（UI用）
type MetabolicStageUI = 'just_started' | 'transitioning' | 'adapted';

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(getLanguage());
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly'); // デフォルトは年額（お得）

  // プロフィール状態
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState<string>('70');
  const [goal, setGoal] = useState<UserGoal>(USER_GOALS.HEALING);
  const [metabolicStage, setMetabolicStage] = useState<MetabolicStageUI>('transitioning');

  // 既存プロフィールを読み込む
  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getUserProfile();
      if (profile) {
        setGender(profile.gender || 'male');
        setWeight(profile.weight?.toString() || '70');
        setGoal(profile.goal || USER_GOALS.HEALING);
        // 代謝状態をUIの3段階にマッピング
        if (profile.metabolicStatus === METABOLIC_STATUS.ADAPTED) {
          setMetabolicStage('adapted');
        } else {
          setMetabolicStage('transitioning');
        }
      }
    };
    loadProfile();
  }, []);

  const languages: { code: Language; name: string; nativeName: string }[] = [
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
  ];

  const goals: { code: UserGoal; name: string; icon: string }[] = [
    { code: USER_GOALS.HEALING, name: '回復', icon: '💚' },
    { code: USER_GOALS.PERFORMANCE, name: 'パフォーマンス', icon: '💪' },
    { code: USER_GOALS.WEIGHT_LOSS, name: '減量', icon: '⚡' },
    { code: USER_GOALS.AUTOIMMUNE_HEALING, name: '自己免疫回復', icon: '🛡️' },
  ];

  const metabolicStages: { code: MetabolicStageUI; name: string; description: string }[] = [
    { code: 'just_started', name: '始めたばかり', description: '1週間以内' },
    { code: 'transitioning', name: '移行中', description: '1週間〜1ヶ月' },
    { code: 'adapted', name: '適応済み', description: '1ヶ月以上' },
  ];

  const handleLanguageSelect = (lang: Language) => {
    setSelectedLanguage(lang);
    setLanguage(lang);
    const event = new CustomEvent('languageChanged', { detail: lang });
    window.dispatchEvent(event);
  };

  // 代謝状態のUIをDBの値にマッピング
  const mapMetabolicStageToStatus = (stage: MetabolicStageUI): MetabolicStatus => {
    if (stage === 'adapted') {
      return METABOLIC_STATUS.ADAPTED as MetabolicStatus;
    }
    // 'just_started' と 'transitioning' は両方とも TRANSITIONING にマッピング
    return METABOLIC_STATUS.TRANSITIONING as MetabolicStatus;
  };

  const handleNext = async () => {
    const step = onboardingSteps[currentStep];

    // プロフィールステップの場合、保存する
    if (step.isProfileStep) {
      const existingProfile = await getUserProfile();
      const updatedProfile: UserProfile = {
        ...existingProfile,
        gender,
        weight: parseFloat(weight) || 70,
        goal,
        metabolicStatus: mapMetabolicStageToStatus(metabolicStage),
      };
      await saveUserProfile(updatedProfile);
    }

    // 通知設定ステップの場合、通知許可をリクエスト
    if (step.isNotificationStep) {
      const { requestNotificationPermission } = await import('../utils/defrostReminder');
      await requestNotificationPermission();
    }

    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    localStorage.setItem('primal_logic_onboarding_completed', 'true');

    // トライアル開始日を設定して保存
    const trialStartDate = new Date().toISOString();
    const existingProfile = await getUserProfile();
    const updatedProfile: UserProfile = {
      ...existingProfile,
      trial_start_date: trialStartDate,
      subscription_status: 'trial',
    };
    await saveUserProfile(updatedProfile);

    // プロフィール更新をAppContextに通知
    window.dispatchEvent(new CustomEvent('userProfileUpdated'));

    // 決済モーダルを表示
    setShowPaymentModal(true);
  };

  const handleStartTrial = () => {
    setShowPaymentModal(false);
    onComplete();
  };

  const handleSubscribeNow = async () => {
    try {
      // Stripe Checkoutセッションを作成してリダイレクト
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        alert('Supabase URLが設定されていません');
        return;
      }

      const origin = window.location.origin;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          priceId: selectedPlan === 'monthly'
            ? 'price_1Sv4nR06Z0q3rla2GBp7jQop' // 月額 (Test)
            : 'price_1Sv4n606Z0q3rla28iMGLD9O', // 年額 (Test)
          successUrl: `${origin}/?payment=success`,
          cancelUrl: `${origin}/?payment=canceled`,
        }),
      });

      const data = await response.json();
      if (data.url) {
        // Stripe Checkoutにリダイレクト
        window.location.href = data.url;
      } else {
        console.error('No URL in response:', data);
        throw new Error(data.error || 'Checkout URLの取得に失敗しました');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('決済画面への遷移に失敗しました。後で設定画面から登録できます。');
      handleStartTrial();
    }
  };

  const step = onboardingSteps[currentStep];

  return (
    <div className="onboarding-screen-container">
      <div className="onboarding-screen-content">
        <div className="onboarding-screen-icon">{step.icon}</div>
        <h1 className="onboarding-screen-title">{step.title}</h1>
        <p className="onboarding-screen-description">{step.description}</p>

        {/* 言語選択ステップ */}
        {step.isLanguageStep && (
          <div className="onboarding-language-selector">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`onboarding-language-button ${selectedLanguage === lang.code ? 'active' : ''}`}
                onClick={() => handleLanguageSelect(lang.code)}
              >
                <div className="onboarding-language-name">{lang.nativeName}</div>
                <div className="onboarding-language-subtitle">{lang.name}</div>
                {selectedLanguage === lang.code && (
                  <span className="onboarding-language-check">✓</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* プロフィールステップ */}
        {step.isProfileStep && (
          <div className="onboarding-profile-section">
            {/* 性別 */}
            <div className="onboarding-profile-group">
              <label className="onboarding-profile-label">性別</label>
              <div className="onboarding-gender-buttons">
                <button
                  className={`onboarding-gender-button ${gender === 'male' ? 'active' : ''}`}
                  onClick={() => setGender('male')}
                >
                  👨 男性
                </button>
                <button
                  className={`onboarding-gender-button ${gender === 'female' ? 'active' : ''}`}
                  onClick={() => setGender('female')}
                >
                  👩 女性
                </button>
              </div>
            </div>

            {/* 体重 */}
            <div className="onboarding-profile-group">
              <label className="onboarding-profile-label">体重 (kg)</label>
              <input
                type="number"
                className="onboarding-weight-input"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="30"
                max="200"
                placeholder="70"
              />
            </div>

            {/* 目標 */}
            <div className="onboarding-profile-group">
              <label className="onboarding-profile-label">目標</label>
              <div className="onboarding-goal-grid">
                {goals.map((g) => (
                  <button
                    key={g.code}
                    className={`onboarding-goal-button ${goal === g.code ? 'active' : ''}`}
                    onClick={() => setGoal(g.code)}
                  >
                    <span className="onboarding-goal-icon">{g.icon}</span>
                    <span className="onboarding-goal-name">{g.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 代謝状態 */}
            <div className="onboarding-profile-group">
              <label className="onboarding-profile-label">カーニボア歴</label>
              <div className="onboarding-metabolic-buttons">
                {metabolicStages.map((stage) => (
                  <button
                    key={stage.code}
                    className={`onboarding-metabolic-button ${metabolicStage === stage.code ? 'active' : ''}`}
                    onClick={() => setMetabolicStage(stage.code)}
                  >
                    <span className="onboarding-metabolic-name">{stage.name}</span>
                    <span className="onboarding-metabolic-desc">{stage.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 糖質目標の説明 */}
            <div className="onboarding-carb-notice">
              <div className="onboarding-carb-notice-icon">🥩</div>
              <div className="onboarding-carb-notice-text">
                <strong>糖質目標: 0g</strong>
                <p>CarnivOSは厳格カーニボア専用。糖質ゼロを推奨します。</p>
              </div>
            </div>
          </div>
        )}

        {/* 通知設定ステップ */}
        {step.isNotificationStep && (
          <div className="onboarding-notification-info">
            <div className="onboarding-notification-item">
              <span className="onboarding-notification-icon">⚡</span>
              <span>電解質（ナトリウム/マグネシウム）不足アラート</span>
            </div>
            <div className="onboarding-notification-item">
              <span className="onboarding-notification-icon">🧈</span>
              <span>脂質不足リマインダー</span>
            </div>
            <div className="onboarding-notification-item">
              <span className="onboarding-notification-icon">🧊</span>
              <span>解凍リマインダー</span>
            </div>
          </div>
        )}

        <div className="onboarding-screen-progress">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`onboarding-screen-progress-dot ${index === currentStep ? 'active' : index < currentStep ? 'completed' : ''
                }`}
            />
          ))}
        </div>

        <div className="onboarding-screen-buttons">
          {currentStep > 0 && (
            <button
              className="onboarding-screen-button onboarding-screen-button-back"
              onClick={handleBack}
            >
              戻る
            </button>
          )}
          <button
            className="onboarding-screen-button onboarding-screen-button-secondary"
            onClick={handleSkip}
          >
            スキップ
          </button>
          <button
            className="onboarding-screen-button onboarding-screen-button-primary"
            onClick={handleNext}
          >
            {currentStep < onboardingSteps.length - 1
              ? '次へ'
              : step.isNotificationStep
                ? '通知を有効にする'
                : '始める'}
          </button>
        </div>
      </div>

      {/* 決済モーダル */}
      {showPaymentModal && (
        <div className="onboarding-payment-modal-overlay">
          <div className="onboarding-payment-modal">
            <h2 className="onboarding-payment-modal-title">🎉 ようこそ！</h2>
            <p className="onboarding-payment-modal-description">
              CarnivOSをご利用いただきありがとうございます。
            </p>

            {/* プラン選択 */}
            <div className="onboarding-payment-modal-plan-selection">
              <button
                className={`onboarding-payment-modal-plan ${selectedPlan === 'yearly' ? 'active' : ''}`}
                onClick={() => setSelectedPlan('yearly')}
              >
                <div className="plan-badge">🏆 おすすめ</div>
                <div className="plan-name">年額プラン</div>
                <div className="plan-price">¥9,999/年</div>
                <div className="plan-detail">月額換算 ¥833/月</div>
                <div className="plan-savings">月額より58%お得</div>
              </button>
              <button
                className={`onboarding-payment-modal-plan ${selectedPlan === 'monthly' ? 'active' : ''}`}
                onClick={() => setSelectedPlan('monthly')}
              >
                <div className="plan-name">月額プラン</div>
                <div className="plan-price">¥1,999/月</div>
                <div className="plan-detail">いつでもキャンセル可能</div>
              </button>
            </div>

            <p className="onboarding-payment-modal-note">
              7日間無料トライアル。トライアル期間中はいつでもキャンセル可能です。
            </p>
            <div className="onboarding-payment-modal-buttons">
              <button
                className="onboarding-payment-modal-button onboarding-payment-modal-button-primary"
                onClick={handleSubscribeNow}
              >
                今すぐ登録（7日間無料）
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
