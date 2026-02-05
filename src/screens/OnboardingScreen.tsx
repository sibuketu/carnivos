/**
 * Primal Logic - Onboarding Screen
 *
 * 初回起動時のオンボーディング（3ステップ）
 * Step 1: 言語選択
 * Step 2: プロフィール（性別/体重/目標/代謝状態）
 * Step 3: 通知設定
 */

import { useState, useEffect } from 'react';
import { setLanguage, getLanguage, useTranslation, type Language } from '../utils/i18n';
import { saveUserProfile, getUserProfile } from '../utils/storage';
import { USER_GOALS, METABOLIC_STATUS } from '../constants/carnivore_constants';
import type { UserProfile, UserGoal, MetabolicStatus } from '../types';
import './OnboardingScreen.css';

interface OnboardingStep {
  title: string;
  description: string;
  icon?: string;
  isLanguageStep?: boolean;
  isProfileStep?: boolean;
  isNotificationStep?: boolean;
}

interface OnboardingScreenProps {
  onComplete: () => void;
}

// 代謝状態の選択肢（UI用）
type MetabolicStageUI = 'just_started' | 'transitioning' | 'adapted';

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(getLanguage());

  const onboardingSteps: OnboardingStep[] = [
    { title: t('onboarding.step1Title'), description: t('onboarding.step1Desc'), icon: '🌐', isLanguageStep: true },
    { title: t('onboarding.step2Title'), description: t('onboarding.step2Desc'), icon: '👤', isProfileStep: true },
    { title: t('onboarding.step3Title'), description: t('onboarding.step3Desc'), icon: '🔔', isNotificationStep: true },
  ];

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
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
  ];

  const goals: { code: UserGoal; name: string; icon: string }[] = [
    { code: USER_GOALS.HEALING, name: t('onboarding.goalHealing'), icon: '💚' },
    { code: USER_GOALS.PERFORMANCE, name: t('onboarding.goalPerformance'), icon: '💪' },
    { code: USER_GOALS.WEIGHT_LOSS, name: t('onboarding.goalWeightLoss'), icon: '⚡' },
    { code: USER_GOALS.AUTOIMMUNE_HEALING, name: t('onboarding.goalAutoimmune'), icon: '🛡️' },
  ];

  const metabolicStages: { code: MetabolicStageUI; name: string; description: string }[] = [
    { code: 'just_started', name: t('onboarding.metabolicJustStarted'), description: t('onboarding.metabolicJustStartedDesc') },
    { code: 'transitioning', name: t('onboarding.metabolicTransitioning'), description: t('onboarding.metabolicTransitioningDesc') },
    { code: 'adapted', name: t('onboarding.metabolicAdapted'), description: t('onboarding.metabolicAdaptedDesc') },
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
      gender: existingProfile.gender || 'male',
      goal: existingProfile.goal || USER_GOALS.HEALING,
      trial_start_date: trialStartDate,
      subscription_status: 'trial',
    };
    await saveUserProfile(updatedProfile);

    // プロフィール更新をAppContextに通知
    window.dispatchEvent(new CustomEvent('userProfileUpdated'));

    // サブスクはPaywallScreenで既に表示済み。オンボーディング完了後は即ホームへ
    onComplete();
  };

  const step = onboardingSteps[currentStep];
  const totalSteps = onboardingSteps.length;

  return (
    <div className="onboarding-screen-container">
      <div className="onboarding-screen-content">
        {/* 進捗表示（離脱率低減のため 1/3 形式） */}
        <div className="onboarding-screen-progress-wrap" aria-label={`${t('onboarding.stepLabel')} ${currentStep + 1} / ${totalSteps}`}>
          <span className="onboarding-screen-progress-text">{currentStep + 1} / {totalSteps}</span>
          <div className="onboarding-screen-progress">
            {onboardingSteps.map((_, i) => (
              <div
                key={i}
                className={`onboarding-screen-progress-dot ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}`}
              />
            ))}
          </div>
        </div>
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
              <label className="onboarding-profile-label">{t('onboarding.gender')}</label>
              <div className="onboarding-gender-buttons">
                <button
                  className={`onboarding-gender-button ${gender === 'male' ? 'active' : ''}`}
                  onClick={() => setGender('male')}
                >
                  {t('onboarding.male')}
                </button>
                <button
                  className={`onboarding-gender-button ${gender === 'female' ? 'active' : ''}`}
                  onClick={() => setGender('female')}
                >
                  {t('onboarding.female')}
                </button>
              </div>
            </div>

            {/* 体重 */}
            <div className="onboarding-profile-group">
              <label className="onboarding-profile-label">{t('onboarding.weight')}</label>
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
              <label className="onboarding-profile-label">{t('onboarding.goal')}</label>
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
              <label className="onboarding-profile-label">{t('onboarding.carnivoreHistory')}</label>
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
              <div className="onboarding-carb-notice-icon"></div>
              <div className="onboarding-carb-notice-text">
                <strong>{t('onboarding.carbNoticeTitle')}</strong>
                <p>{t('onboarding.carbNoticeDesc')}</p>
              </div>
            </div>
          </div>
        )}

        {/* 通知設定ステップ */}
        {step.isNotificationStep && (
          <div className="onboarding-notification-info">
            <div className="onboarding-notification-item">
              <span className="onboarding-notification-icon">⚡</span>
              <span>{t('onboarding.notify1')}</span>
            </div>
            <div className="onboarding-notification-item">
              <span className="onboarding-notification-icon"></span>
              <span>{t('onboarding.notify2')}</span>
            </div>
            <div className="onboarding-notification-item">
              <span className="onboarding-notification-icon"></span>
              <span>{t('onboarding.notify3')}</span>
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
              {t('onboarding.back')}
            </button>
          )}
          <button
            className="onboarding-screen-button onboarding-screen-button-secondary"
            onClick={handleSkip}
          >
            {t('onboarding.skip')}
          </button>
          <button
            className="onboarding-screen-button onboarding-screen-button-primary"
            onClick={handleNext}
          >
            {currentStep < onboardingSteps.length - 1
              ? t('onboarding.next')
              : step.isNotificationStep
                ? t('onboarding.enableNotifications')
                : t('onboarding.start')}
          </button>
        </div>
      </div>
    </div>
  );
}
