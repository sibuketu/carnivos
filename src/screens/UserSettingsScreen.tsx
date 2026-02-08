/**
 * CarnivOS - User Settings Screen
 *
 * ユーザー設定画面: 基本情報、目標、代謝状態など
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { saveUserProfile } from '../utils/storage';
import { logError } from '../utils/errorHandler';
import { useTranslation } from '../utils/i18n';
import { getFieldImpactDescription } from '../utils/nutrientImpactHelper';
import { getAllNutrientExplanations } from '../utils/nutrientExplanationHelper';
import {
  ALL_NUTRIENT_DISPLAY_CONFIGS,
  getNutrientDisplaySettings,
  toggleNutrientVisibility,
  toggleCategoryVisibility,
  setAllNutrientsVisible,
  type NutrientKey,
} from '../utils/nutrientDisplaySettings';
import {
  ALL_FEATURE_DISPLAY_CONFIGS,
  getFeatureDisplaySettings,
  toggleFeatureVisibility as toggleFeatureVisibilityUtil,
  toggleCategoryVisibility as toggleFeatureCategoryVisibility,
  setAllFeaturesVisible,
  type FeatureKey,
} from '../utils/featureDisplaySettings';
import { USER_GOALS, METABOLIC_STATUS, DIET_MODES } from '../constants/carnivore_constants';
import type { UserProfile } from '../types';
import { calculateCaffeineFromCoffee } from '../utils/coffeeCaffeineCalculator';
import { calculateProfileCompletion } from '../utils/profileCompletion';
import HelpTooltip from '../components/common/HelpTooltip';
// import './ProfileScreen.css'; // Deleted

type FieldPriority = 'required' | 'recommended' | 'optional';

interface ProfileField {
  key: string;
  label: string;
  priority: FieldPriority;
  description?: string;
}

const PROFILE_FIELDS: Record<string, ProfileField> = {
  gender: {
    key: 'gender',
    label: '性別',
    priority: 'required',
  },
  height: {
    key: 'height',
    label: '身長',
    priority: 'recommended',
    description: 'cm',
  },
  weight: {
    key: 'weight',
    label: '体重',
    priority: 'recommended',
    description: 'kg',
  },
  goal: {
    key: 'goal',
    label: '目標',
    priority: 'required',
  },
  metabolicStatus: {
    key: 'metabolicStatus',
    label: '代謝状態',
    priority: 'required',
  },
  mode: {
    key: 'mode',
    label: 'ダイエットモード',
    priority: 'recommended',
  },
  dairyTolerance: {
    key: 'dairyTolerance',
    label: '乳糖耐性',
    priority: 'optional',
    description: '乳製品を摂取できますか？',
  },
};

const getPriorityLabel = (priority: FieldPriority): string => {
  switch (priority) {
    case 'required':
      return '必須';
    case 'recommended':
      return '推奨';
    case 'optional':
      return '任意';
  }
};

const getPriorityClass = (priority: FieldPriority): string => {
  switch (priority) {
    case 'required':
      return 'profile-screen-priority-required';
    case 'recommended':
      return 'profile-screen-priority-recommended';
    case 'optional':
      return 'profile-screen-priority-optional';
  }
};

export default function UserSettingsScreen() {
  const { t } = useTranslation();
  const { userProfile, loadUserProfile } = useApp();

  const [gender, setGender] = useState<UserProfile['gender']>(userProfile?.gender || 'male');
  const [height, setHeight] = useState<string>(userProfile?.height?.toString() || '');
  const [weight, setWeight] = useState<string>(userProfile?.weight?.toString() || '');
  const [goal, setGoal] = useState<UserProfile['goal']>(userProfile?.goal || USER_GOALS.HEALING);
  const [dairyTolerance, setDairyTolerance] = useState(userProfile?.dairyTolerance ?? false);
  const [metabolicStatus, setMetabolicStatus] = useState<UserProfile['metabolicStatus']>(
    userProfile?.metabolicStatus || METABOLIC_STATUS.TRANSITIONING
  );
  const [mode, setMode] = useState<UserProfile['mode']>(
    userProfile?.mode || DIET_MODES.STRICT_CARNIVORE
  );
  const [age, setAge] = useState<string>(userProfile?.age?.toString() || '');
  const [activityLevel, setActivityLevel] = useState<UserProfile['activityLevel']>(
    userProfile?.activityLevel || 'moderate'
  );
  const [isPregnant, setIsPregnant] = useState(userProfile?.isPregnant ?? false);
  const [isBreastfeeding, setIsBreastfeeding] = useState(userProfile?.isBreastfeeding ?? false);
  const [isPostMenopause, setIsPostMenopause] = useState(userProfile?.isPostMenopause ?? false);
  // ストレスレベルを0-10の数値で管理（内部的には文字列に変換）
  const [stressLevelNumeric, setStressLevelNumeric] = useState<number>(() => {
    if (userProfile?.stressLevel === 'low') return 3;
    if (userProfile?.stressLevel === 'moderate') return 5;
    if (userProfile?.stressLevel === 'high') return 8;
    return 5; // デフォルト: 中程度
  });

  // 数値を文字列に変換する関数
  const getStressLevelString = (num: number): 'low' | 'moderate' | 'high' => {
    if (num <= 3) return 'low';
    if (num <= 7) return 'moderate';
    return 'high';
  };

  const stressLevel = getStressLevelString(stressLevelNumeric);

  // 追加の栄養素変動要因（推奨）
  const [sleepHours, setSleepHours] = useState<string>(userProfile?.sleepHours?.toString() || '');
  const [exerciseIntensity, setExerciseIntensity] = useState<UserProfile['exerciseIntensity']>(
    userProfile?.exerciseIntensity || 'none'
  );
  const [exerciseFrequency, setExerciseFrequency] = useState<UserProfile['exerciseFrequency']>(
    userProfile?.exerciseFrequency || 'none'
  );
  const [thyroidFunction, setThyroidFunction] = useState<UserProfile['thyroidFunction']>(
    userProfile?.thyroidFunction || 'normal'
  );
  const [sunExposureFrequency, setSunExposureFrequency] = useState<
    UserProfile['sunExposureFrequency']
  >(userProfile?.sunExposureFrequency || 'occasional');

  // 追加の栄養素変動要因（任意）
  const [nutrientDisplaySettings, setNutrientDisplaySettings] = useState<
    Record<NutrientKey, boolean>
  >(getNutrientDisplaySettings());
  const [featureDisplaySettings, setFeatureDisplaySettings] = useState<Record<FeatureKey, boolean>>(
    getFeatureDisplaySettings()
  );
  const [digestiveIssues, setDigestiveIssues] = useState(userProfile?.digestiveIssues ?? false);
  const [inflammationLevel, setInflammationLevel] = useState<UserProfile['inflammationLevel']>(
    userProfile?.inflammationLevel || 'low'
  );
  const [mentalHealthStatus, setMentalHealthStatus] = useState<UserProfile['mentalHealthStatus']>(
    userProfile?.mentalHealthStatus || 'good'
  );
  const [supplementMagnesium, setSupplementMagnesium] = useState(
    userProfile?.supplementMagnesium ?? false
  );
  const [supplementVitaminD, setSupplementVitaminD] = useState(
    userProfile?.supplementVitaminD ?? false
  );
  const [supplementIodine, setSupplementIodine] = useState(userProfile?.supplementIodine ?? false);
  const [alcoholFrequency, setAlcoholFrequency] = useState<UserProfile['alcoholFrequency']>(
    userProfile?.alcoholFrequency || 'none'
  );
  const [caffeineIntake, setCaffeineIntake] = useState<UserProfile['caffeineIntake']>(
    userProfile?.caffeineIntake || 'none'
  );

  // Phase 3: 体組成設定（LBMベースのタンパク質計算）
  const [bodyComposition, setBodyComposition] = useState<UserProfile['bodyComposition']>(
    userProfile?.bodyComposition || 'average'
  );
  const [bodyFatPercentage, setBodyFatPercentage] = useState<string>(
    typeof userProfile?.bodyComposition === 'object' &&
      'bodyFatPercentage' in userProfile.bodyComposition
      ? userProfile.bodyComposition.bodyFatPercentage.toString()
      : ''
  );
  const [showBodyFatInput, setShowBodyFatInput] = useState(false);

  // Phase 4: 代謝ストレス指標
  const [metabolicStressIndicators, setMetabolicStressIndicators] = useState<string[]>(
    userProfile?.metabolicStressIndicators || []
  );
  const [coffeeInput, setCoffeeInput] = useState<string>(''); // コーヒー入力（例: "スタバのコーヒーShort", "コーヒー2杯"）

  // Phase 5: 栄養素目標値のカスタマイズ
  const [customNutrientTargets, _setCustomNutrientTargets] = useState<
    Record<string, { mode: 'auto' | 'manual'; value?: number }>
  >(
    userProfile?.customNutrientTargets
      ? Object.fromEntries(
        Object.entries(userProfile.customNutrientTargets).map(([key, value]) => [
          key,
          typeof value === 'number' ? { mode: 'manual' as const, value } : value,
        ])
      )
      : {}
  );

  // プレビュー用のstate
  const [showPreview, setShowPreview] = useState(false);

  // セクションの折りたたみ状態（必須項目はデフォルトで開く）
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('profile_collapsed_sections');
    return saved
      ? JSON.parse(saved)
      : {
        basicInfo: false, // 必須: 開く
        goal: false, // 必須: 開く
        metabolicStatus: false, // 必須: 開く
        dietMode: false, // 推奨: 開く
        dairyTolerance: true, // 任意: 閉じる
        stressLevel: false, // 推奨: 開く
        recommended: false, // 推奨: 開く
        optional: true, // 任意: 閉じる
        femaleSpecific: true, // 任意: 閉じる
      };
  });

  // セクションの表示ON/OFF状態
  const [hiddenSections, setHiddenSections] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('profile_hidden_sections');
    return saved ? JSON.parse(saved) : {};
  });

  const toggleSectionCollapse = (sectionKey: string) => {
    setCollapsedSections((prev) => {
      const newState = { ...prev, [sectionKey]: !prev[sectionKey] };
      localStorage.setItem('profile_collapsed_sections', JSON.stringify(newState));
      return newState;
    });
  };

  const toggleSectionVisibility = (sectionKey: string) => {
    setHiddenSections((prev) => {
      const newState = { ...prev, [sectionKey]: !prev[sectionKey] };
      localStorage.setItem('profile_hidden_sections', JSON.stringify(newState));
      return newState;
    });
  };

  // 自動保存用のdebounceタイマー
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  // 自動保存関数（debounce付き、iOS設定アプリのパターン）
  const autoSave = useCallback(async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(async () => {
      const profile: UserProfile = {
        gender,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        goal,
        dairyTolerance,
        metabolicStatus,
        mode,
        age: age ? parseInt(age, 10) : undefined,
        activityLevel,
        isPregnant: gender === 'female' ? isPregnant : undefined,
        isBreastfeeding: gender === 'female' ? isBreastfeeding : undefined,
        isPostMenopause: gender === 'female' ? isPostMenopause : undefined,
        stressLevel,
        sleepHours: sleepHours ? Number(sleepHours) : undefined,
        exerciseIntensity,
        exerciseFrequency,
        thyroidFunction,
        sunExposureFrequency,
        digestiveIssues,
        inflammationLevel,
        mentalHealthStatus,
        supplementMagnesium,
        supplementVitaminD,
        supplementIodine,
        alcoholFrequency,
        caffeineIntake,
        bodyComposition:
          showBodyFatInput && bodyFatPercentage
            ? { bodyFatPercentage: parseFloat(bodyFatPercentage) }
            : bodyComposition,
        metabolicStressIndicators:
          metabolicStressIndicators.length > 0 ? metabolicStressIndicators : undefined,
        customNutrientTargets:
          Object.keys(customNutrientTargets).length > 0
            ? Object.fromEntries(
              Object.entries(customNutrientTargets).map(([key, value]) => [
                key,
                value.mode === 'auto' ? { mode: 'auto' } : { mode: 'manual', value: value.value },
              ])
            )
            : undefined,
      };
      try {
        await saveUserProfile(profile);
      } catch (error) {
        logError(error, { component: 'UserSettingsScreen', action: 'autoSave' });
      }
    }, 1000); // 1秒後に保存
  }, [
    gender,
    height,
    weight,
    goal,
    dairyTolerance,
    metabolicStatus,
    mode,
    age,
    activityLevel,
    isPregnant,
    isBreastfeeding,
    isPostMenopause,
    stressLevel,
    sleepHours,
    exerciseIntensity,
    exerciseFrequency,
    thyroidFunction,
    sunExposureFrequency,
    digestiveIssues,
    inflammationLevel,
    mentalHealthStatus,
    supplementMagnesium,
    supplementVitaminD,
    supplementIodine,
    alcoholFrequency,
    caffeineIntake,
    showBodyFatInput,
    bodyFatPercentage,
    bodyComposition,
    metabolicStressIndicators,
    customNutrientTargets,
  ]);

  // 設定変更時に自動保存（初期ロード時は除外）
  const isInitialLoad = useRef(true);
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    autoSave();
  }, [autoSave]);

  useEffect(() => {
    if (userProfile) {
      setGender(userProfile.gender || 'male');
      setHeight(userProfile.height?.toString() || '');
      setWeight(userProfile.weight?.toString() || '');
      setGoal(userProfile.goal || USER_GOALS.HEALING);
      setDairyTolerance(userProfile.dairyTolerance ?? false);
      setMetabolicStatus(userProfile.metabolicStatus || METABOLIC_STATUS.TRANSITIONING);
      setMode(userProfile.mode || DIET_MODES.STRICT_CARNIVORE);
      setAge(userProfile.age?.toString() || '');
      setActivityLevel(userProfile.activityLevel || 'moderate');
      setIsPregnant(userProfile.isPregnant ?? false);
      setIsBreastfeeding(userProfile.isBreastfeeding ?? false);
      setIsPostMenopause(userProfile.isPostMenopause ?? false);
      // ストレスレベルを数値に変換
      if (userProfile.stressLevel === 'low') setStressLevelNumeric(3);
      else if (userProfile.stressLevel === 'high') setStressLevelNumeric(8);
      else setStressLevelNumeric(5);
      setSleepHours(userProfile.sleepHours?.toString() || '');
      setExerciseIntensity(userProfile.exerciseIntensity || 'none');
      setExerciseFrequency(userProfile.exerciseFrequency || 'none');
      setThyroidFunction(userProfile.thyroidFunction || 'normal');
      setSunExposureFrequency(userProfile.sunExposureFrequency || 'occasional');
      setDigestiveIssues(userProfile.digestiveIssues ?? false);
      setInflammationLevel(userProfile.inflammationLevel || 'low');
      setMentalHealthStatus(userProfile.mentalHealthStatus || 'good');
      setSupplementMagnesium(userProfile.supplementMagnesium ?? false);
      setSupplementVitaminD(userProfile.supplementVitaminD ?? false);
      setSupplementIodine(userProfile.supplementIodine ?? false);
      setAlcoholFrequency(userProfile.alcoholFrequency || 'none');
      setCaffeineIntake(userProfile.caffeineIntake || 'none');
    }
  }, [userProfile]);

  // 各設定変更時に自動保存をトリガー
  useEffect(() => {
    if (userProfile) {
      autoSave();
    }
  }, [autoSave, userProfile]);

  // 旧handleSave（削除予定、互換性のため残す）
  const handleSave = async () => {
    const profile: UserProfile = {
      gender,
      height: height ? parseFloat(height) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      goal,
      dairyTolerance,
      metabolicStatus,
      mode,
      age: age ? parseInt(age, 10) : undefined,
      activityLevel,
      isPregnant: gender === 'female' ? isPregnant : undefined,
      isBreastfeeding: gender === 'female' ? isBreastfeeding : undefined,
      isPostMenopause: gender === 'female' ? isPostMenopause : undefined,
      stressLevel,
      sleepHours: sleepHours ? Number(sleepHours) : undefined,
      exerciseIntensity,
      exerciseFrequency,
      thyroidFunction,
      sunExposureFrequency,
      digestiveIssues,
      inflammationLevel,
      mentalHealthStatus,
      supplementMagnesium,
      supplementVitaminD,
      supplementIodine,
      alcoholFrequency,
      caffeineIntake,
      // Phase 3: 体組成設定
      bodyComposition:
        showBodyFatInput && bodyFatPercentage
          ? { bodyFatPercentage: parseFloat(bodyFatPercentage) }
          : bodyComposition,
      // Phase 4: 代謝ストレス指標
      metabolicStressIndicators:
        metabolicStressIndicators.length > 0 ? metabolicStressIndicators : undefined,
      // Phase 5: 栄養素目標値のカスタマイズ
      customNutrientTargets:
        Object.keys(customNutrientTargets).length > 0
          ? (Object.fromEntries(
            Object.entries(customNutrientTargets).map(([key, config]) => [
              key,
              config.mode === 'manual' ? { mode: 'manual', value: config.value } : { mode: 'auto' },
            ])
          ) as Record<string, { mode: 'auto' | 'manual'; value?: number }>)
          : undefined,
      ...userProfile,
    };

    await saveUserProfile(profile);
    await loadUserProfile();

    // プロファイル画面に戻る
    window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'profile' }));
  };

  const renderFieldLabel = (field: ProfileField) => (
    <div className="profile-screen-field-header">
      <span className="profile-screen-field-label">{field.label}</span>
      <span className={`profile-screen-priority-badge ${getPriorityClass(field.priority)}`}>
        {getPriorityLabel(field.priority)}
      </span>
    </div>
  );

  return (
    <div className="profile-screen-container">
      <div className="profile-screen-content">
        <div className="screen-header">
          <button
            onClick={() =>
              window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'labs' }))
            }
            className="back-button"
          >
            ←
          </button>
          <div className="screen-header-content">
            <h1 className="screen-header-title">ユーザー設定</h1>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}
            >
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#f43f5e' }}>
                {calculateProfileCompletion(userProfile)}%
              </span>
              <span style={{ fontSize: '10px', color: '#9ca3af', lineHeight: '1.2' }}>
                このアプリで最大限最適化されています
              </span>
            </div>
          </div>
        </div>

        {/* 基本情報（必須） */}
        <div className="profile-screen-section">
          <div
            className="profile-screen-section-header"
            onClick={() => toggleSectionCollapse('basicInfo')}
          >
            <h2 className="profile-screen-section-title">基本情報</h2>
            <div className="profile-screen-section-toggle">
              <span
                className={`profile-screen-collapse-icon ${collapsedSections.basicInfo ? 'collapsed' : ''}`}
              >
                ▼
              </span>
            </div>
          </div>
          {!collapsedSections.basicInfo && (
            <div className="profile-screen-section-content">
              {/* 性別（必須） */}
              <div className="profile-screen-input-group">
                {renderFieldLabel(PROFILE_FIELDS.gender)}
                <div className="profile-screen-button-row">
                  <button
                    className={`profile-screen-option-button ${gender === 'male' ? 'active' : ''}`}
                    onClick={() => setGender('male')}
                  >
                    男性
                  </button>
                  <button
                    className={`profile-screen-option-button ${gender === 'female' ? 'active' : ''}`}
                    onClick={() => setGender('female')}
                  >
                    女性
                  </button>
                </div>
              </div>

              {/* 身長（推奨） */}
              <div className="profile-screen-input-group">
                {renderFieldLabel(PROFILE_FIELDS.height)}
                <div className="profile-screen-number-input-row">
                  <input
                    type="number"
                    className="profile-screen-number-input"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="170"
                    min="0"
                    max="300"
                  />
                  <span className="profile-screen-unit">cm</span>
                </div>
              </div>

              {/* 体重（推奨） */}
              <div className="profile-screen-input-group">
                {renderFieldLabel(PROFILE_FIELDS.weight)}
                <div className="profile-screen-number-input-row">
                  <input
                    type="number"
                    className="profile-screen-number-input"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="70"
                    min="0"
                    max="500"
                    step="0.1"
                  />
                  <span className="profile-screen-unit">kg</span>
                </div>
              </div>

              {/* Phase 3: 体組成設定（LBMベースのタンパク質計算） */}
              {weight && (
                <div className="profile-screen-input-group" style={{ marginTop: '1rem' }}>
                  <div className="profile-screen-field-header">
                    <span className="profile-screen-field-label">体組成（LBM計算用）</span>
                    <span className="profile-screen-priority-badge profile-screen-priority-recommended">
                      推奨
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.75rem' }}>
                    タンパク質目標値 = LBM（除脂肪体重）× 2.2g
                  </p>
                  <div className="profile-screen-button-row">
                    <button
                      className={`profile-screen-option-button ${!showBodyFatInput && bodyComposition === 'muscular' ? 'active' : ''}`}
                      onClick={() => {
                        setBodyComposition('muscular');
                        setShowBodyFatInput(false);
                      }}
                    >
                      筋肉質/引き締まっている
                    </button>
                    <button
                      className={`profile-screen-option-button ${!showBodyFatInput && bodyComposition === 'average' ? 'active' : ''}`}
                      onClick={() => {
                        setBodyComposition('average');
                        setShowBodyFatInput(false);
                      }}
                    >
                      平均的
                    </button>
                    <button
                      className={`profile-screen-option-button ${!showBodyFatInput && bodyComposition === 'high_fat' ? 'active' : ''}`}
                      onClick={() => {
                        setBodyComposition('high_fat');
                        setShowBodyFatInput(false);
                      }}
                    >
                      体脂肪多め
                    </button>
                  </div>
                  <div style={{ marginTop: '0.75rem' }}>
                    <button
                      onClick={() => setShowBodyFatInput(!showBodyFatInput)}
                      className={`toggle-button ${showBodyFatInput ? 'active' : ''}`}
                    >
                      {showBodyFatInput ? '体脂肪率入力モード' : '体脂肪率を直接入力'}
                    </button>
                  </div>
                  {showBodyFatInput && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <label
                        style={{
                          fontSize: '14px',
                          color: '#374151',
                          display: 'block',
                          marginBottom: '0.5rem',
                        }}
                      >
                        体脂肪率 (%)
                      </label>
                      <div className="profile-screen-number-input-row">
                        <input
                          type="number"
                          className="profile-screen-number-input"
                          value={bodyFatPercentage}
                          onChange={(e) => setBodyFatPercentage(e.target.value)}
                          placeholder="20"
                          min="0"
                          max="50"
                          step="0.1"
                        />
                        <span className="profile-screen-unit">%</span>
                      </div>
                      {bodyFatPercentage && weight && (
                        <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                          LBM係数: {((1 - parseFloat(bodyFatPercentage) / 100) * 100).toFixed(1)}%
                          <br />
                          LBM:{' '}
                          {(parseFloat(weight) * (1 - parseFloat(bodyFatPercentage) / 100)).toFixed(
                            1
                          )}
                          kg
                          <br />
                          タンパク質目標値:{' '}
                          {(
                            parseFloat(weight) *
                            (1 - parseFloat(bodyFatPercentage) / 100) *
                            2.2
                          ).toFixed(1)}
                          g
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 年齢（推奨）- 栄養素の必要量に影響 */}
              <div className="profile-screen-input-group">
                <div className="profile-screen-field-header">
                  <span className="profile-screen-field-label">年齢</span>
                  <span className="profile-screen-priority-badge profile-screen-priority-recommended">
                    推奨
                  </span>
                </div>
                <div className="profile-screen-number-input-row">
                  <input
                    type="number"
                    className="profile-screen-number-input"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="30"
                    min="0"
                    max="120"
                    step="1"
                  />
                  <span className="profile-screen-unit">歳</span>
                </div>
              </div>

              {/* 活動量（推奨）- 栄養素の必要量に影響 */}
              <div className="profile-screen-input-group">
                <div className="profile-screen-field-header">
                  <span className="profile-screen-field-label">活動量</span>
                  <span className="profile-screen-priority-badge profile-screen-priority-recommended">
                    推奨
                  </span>
                </div>
                <div className="profile-screen-button-row">
                  <button
                    className={`profile-screen-option-button ${activityLevel === 'sedentary' ? 'active' : ''}`}
                    onClick={() => setActivityLevel('sedentary')}
                  >
                    低い（デスクワーク中心）
                  </button>
                  <button
                    className={`profile-screen-option-button ${activityLevel === 'moderate' ? 'active' : ''}`}
                    onClick={() => setActivityLevel('moderate')}
                  >
                    中程度（週3-4回の運動）
                  </button>
                  <button
                    className={`profile-screen-option-button ${activityLevel === 'active' ? 'active' : ''}`}
                    onClick={() => setActivityLevel('active')}
                  >
                    高い（毎日運動）
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 目標（必須） */}
        <div className="profile-screen-section">
          <div
            className="profile-screen-section-header"
            onClick={() => toggleSectionCollapse('goal')}
          >
            <h2 className="profile-screen-section-title">目標</h2>
            <div className="profile-screen-section-toggle">
              <span
                className={`profile-screen-collapse-icon ${collapsedSections.goal ? 'collapsed' : ''}`}
              >
                ▼
              </span>
            </div>
          </div>
          {!collapsedSections.goal && (
            <div className="profile-screen-section-content">
              {renderFieldLabel(PROFILE_FIELDS.goal)}
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                {goal === USER_GOALS.HEALING &&
                  '炎症の軽減、腸の修復、慢性的な健康問題の改善を目指します。'}
                {goal === USER_GOALS.PERFORMANCE &&
                  '筋力、持久力、認知機能の向上を最優先とします。'}
                {goal === USER_GOALS.WEIGHT_LOSS && '代謝の最適化と体脂肪の減少を目指します。'}
                {goal === USER_GOALS.AUTOIMMUNE_HEALING &&
                  '自己免疫疾患の症状緩和と免疫システムの再調整を目指します。'}
              </div>
              <div className="profile-screen-button-row">
                {Object.values(USER_GOALS).map((g) => (
                  <button
                    key={g}
                    className={`profile-screen-option-button ${goal === g ? 'active' : ''}`}
                    onClick={() => setGoal(g)}
                  >
                    {g === USER_GOALS.HEALING && '治癒・回復'}
                    {g === USER_GOALS.PERFORMANCE && 'パフォーマンス向上'}
                    {g === USER_GOALS.WEIGHT_LOSS && '減量'}
                    {g === USER_GOALS.AUTOIMMUNE_HEALING && '自己免疫疾患の改善'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 代謝状態（必須） */}
        <div className="profile-screen-section">
          <div
            className="profile-screen-section-header"
            onClick={() => toggleSectionCollapse('metabolicStatus')}
          >
            <h2 className="profile-screen-section-title">
              代謝状態
              <HelpTooltip text="適応済み: ケトーシスに完全適応済み。低炭水化物状態で安定。\n移行中: ケトーシスへの移行中。適応過程で一時的な不調の可能性。" />
            </h2>
            <div className="profile-screen-section-toggle">
              <span
                className={`profile-screen-collapse-icon ${collapsedSections.metabolicStatus ? 'collapsed' : ''}`}
              >
                ▼
              </span>
            </div>
          </div>
          {!collapsedSections.metabolicStatus && (
            <div className="profile-screen-section-content">
              {renderFieldLabel(PROFILE_FIELDS.metabolicStatus)}
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                {metabolicStatus === METABOLIC_STATUS.ADAPTED &&
                  'ケトーシスに完全適応済み。低炭水化物状態で安定。'}
                {metabolicStatus === METABOLIC_STATUS.TRANSITIONING &&
                  'ケトーシスへの移行中。適応過程で一時的な不調の可能性。'}
              </div>
              <div className="profile-screen-button-row">
                {Object.values(METABOLIC_STATUS).map((status) => (
                  <button
                    key={status}
                    className={`profile-screen-option-button ${metabolicStatus === status ? 'active' : ''}`}
                    onClick={() => setMetabolicStatus(status)}
                  >
                    {status === METABOLIC_STATUS.ADAPTED && '適応済み'}
                    {status === METABOLIC_STATUS.TRANSITIONING && '移行中'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ダイエットモード（推奨） */}
        <div className="profile-screen-section">
          <div
            className="profile-screen-section-header"
            onClick={() => toggleSectionCollapse('dietMode')}
          >
            <h2 className="profile-screen-section-title">
              ダイエットモード
              <HelpTooltip text="厳格な肉食: 動物性食品のみ。植物性食品は一切摂取しない。\nケトボア: 主に動物性食品。少量の低炭水化物植物（アボカド、ナッツなど）を許可。\nライオンダイエット: 牛肉と塩のみ。最も厳格な形式。" />
            </h2>
            <div className="profile-screen-section-toggle">
              <span
                className={`profile-screen-collapse-icon ${collapsedSections.dietMode ? 'collapsed' : ''}`}
              >
                ▼
              </span>
            </div>
          </div>
          {!collapsedSections.dietMode && (
            <div className="profile-screen-section-content">
              {renderFieldLabel(PROFILE_FIELDS.mode)}
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                {mode === DIET_MODES.STRICT_CARNIVORE &&
                  '動物性食品のみ。植物性食品は一切摂取しない。'}
                {mode === DIET_MODES.KETOVORE &&
                  '主に動物性食品。少量の低炭水化物植物（アボカド、ナッツなど）を許可。'}
                {mode === DIET_MODES.LION_DIET && '牛肉と塩のみ。最も厳格な形式。'}
              </div>
              <div className="profile-screen-button-row">
                {Object.values(DIET_MODES).map((m) => (
                  <button
                    key={m}
                    className={`profile-screen-option-button ${mode === m ? 'active' : ''}`}
                    onClick={() => setMode(m)}
                  >
                    {m === DIET_MODES.STRICT_CARNIVORE && '厳格な肉食'}
                    {m === DIET_MODES.KETOVORE && 'ケトボア'}
                    {m === DIET_MODES.LION_DIET && 'ライオンダイエット'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 乳糖耐性（任意） */}
        <div className="profile-screen-section">
          <div
            className="profile-screen-section-header"
            onClick={() => toggleSectionCollapse('dairyTolerance')}
          >
            <h2 className="profile-screen-section-title">乳糖耐性</h2>
            <div className="profile-screen-section-toggle">
              <span
                className={`profile-screen-collapse-icon ${collapsedSections.dairyTolerance ? 'collapsed' : ''}`}
              >
                ▼
              </span>
            </div>
          </div>
          {!collapsedSections.dairyTolerance && (
            <div className="profile-screen-section-content">
              <div className="profile-screen-switch-row">
                {renderFieldLabel(PROFILE_FIELDS.dairyTolerance)}
                <label className="profile-screen-switch">
                  <input
                    type="checkbox"
                    checked={dairyTolerance}
                    onChange={(e) => setDairyTolerance(e.target.checked)}
                  />
                  <span className="profile-screen-switch-slider"></span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* 女性特有の条件（栄養素の必要量に影響） */}
        {gender === 'female' && !hiddenSections.femaleSpecific && (
          <div className="profile-screen-section">
            <div
              className="profile-screen-section-header"
              onClick={() => toggleSectionCollapse('femaleSpecific')}
            >
              <h2 className="profile-screen-section-title">女性特有の条件（検査不要）</h2>
              <div className="profile-screen-section-toggle">
                <span
                  className="profile-screen-section-visibility-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSectionVisibility('femaleSpecific');
                  }}
                  title={t('settings.hideSection')}
                >
                  非表示
                </span>
                <span
                  className={`profile-screen-collapse-icon ${collapsedSections.femaleSpecific ? 'collapsed' : ''}`}
                >
                  ▼
                </span>
              </div>
            </div>
            {!collapsedSections.femaleSpecific && (
              <div className="profile-screen-section-content">
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                  これらの条件は鉄分・タンパク質・マグネシウムの必要量に影響します（自己申告で分かります）
                </p>

                <div className="profile-screen-switch-row">
                  <div className="profile-screen-switch-label-group">
                    <label className="profile-screen-switch-label">妊娠中</label>
                    <p className="profile-screen-switch-description">
                      タンパク質・鉄分・マグネシウムの必要量が増加します
                    </p>
                  </div>
                  <label className="profile-screen-switch">
                    <input
                      type="checkbox"
                      checked={isPregnant}
                      onChange={(e) => {
                        setIsPregnant(e.target.checked);
                        if (e.target.checked) {
                          setIsBreastfeeding(false); // 妊娠中と授乳中は同時に選択不可
                        }
                      }}
                    />
                    <span className="profile-screen-switch-slider"></span>
                  </label>
                </div>

                <div className="profile-screen-switch-row" style={{ marginTop: '1rem' }}>
                  <div className="profile-screen-switch-label-group">
                    <label className="profile-screen-switch-label">授乳中</label>
                    <p className="profile-screen-switch-description">
                      タンパク質・マグネシウムの必要量が増加します
                    </p>
                  </div>
                  <label className="profile-screen-switch">
                    <input
                      type="checkbox"
                      checked={isBreastfeeding}
                      onChange={(e) => {
                        setIsBreastfeeding(e.target.checked);
                        if (e.target.checked) {
                          setIsPregnant(false); // 妊娠中と授乳中は同時に選択不可
                        }
                      }}
                    />
                    <span className="profile-screen-switch-slider"></span>
                  </label>
                </div>

                <div className="profile-screen-switch-row" style={{ marginTop: '1rem' }}>
                  <div className="profile-screen-switch-label-group">
                    <label className="profile-screen-switch-label">閉経後</label>
                    <p className="profile-screen-switch-description">
                      鉄分の必要量が8mgに減少します（月経がないため）
                    </p>
                  </div>
                  <label className="profile-screen-switch">
                    <input
                      type="checkbox"
                      checked={isPostMenopause}
                      onChange={(e) => setIsPostMenopause(e.target.checked)}
                    />
                    <span className="profile-screen-switch-slider"></span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ストレスレベル（マグネシウムの必要量に影響） */}
        <div className="profile-screen-section">
          <div
            className="profile-screen-section-header"
            onClick={() => toggleSectionCollapse('stressLevel')}
          >
            <h2 className="profile-screen-section-title">ストレスレベル</h2>
            <div className="profile-screen-section-toggle">
              <span
                className={`profile-screen-collapse-icon ${collapsedSections.stressLevel ? 'collapsed' : ''}`}
              >
                ▼
              </span>
            </div>
          </div>
          {!collapsedSections.stressLevel && (
            <div className="profile-screen-section-content">
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                {getFieldImpactDescription('stressLevel', stressLevel)}
              </p>
              <div className="profile-screen-input-group">
                <label className="profile-screen-field-label">ストレスレベル (0-10)</label>
                <div className="profile-screen-number-input-row">
                  <input
                    type="number"
                    className="profile-screen-number-input"
                    value={stressLevelNumeric}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 0 && value <= 10) {
                        setStressLevelNumeric(value);
                      }
                    }}
                    min="0"
                    max="10"
                    step="1"
                  />
                  <span className="profile-screen-unit">/10</span>
                </div>
                <p
                  className="profile-screen-field-description"
                  style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666' }}
                >
                  {stressLevelNumeric <= 3 && '低いストレス'}
                  {stressLevelNumeric > 3 && stressLevelNumeric <= 7 && '中程度のストレス'}
                  {stressLevelNumeric > 7 && '高いストレス'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 推奨項目: 睡眠・運動・甲状腺・日光暴露 */}
        {!hiddenSections.recommended && (
          <div className="profile-screen-section">
            <div
              className="profile-screen-section-header"
              onClick={() => toggleSectionCollapse('recommended')}
            >
              <h2 className="profile-screen-section-title">推奨項目（検査不要）</h2>
              <div className="profile-screen-section-toggle">
                <span
                  className="profile-screen-section-visibility-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSectionVisibility('recommended');
                  }}
                  title={t('settings.hideSection')}
                >
                  非表示
                </span>
                <span
                  className={`profile-screen-collapse-icon ${collapsedSections.recommended ? 'collapsed' : ''}`}
                >
                  ▼
                </span>
              </div>
            </div>
            {!collapsedSections.recommended && (
              <div className="profile-screen-section-content">
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                  これらの項目は栄養素の必要量に大きく影響します（自己申告で分かります）
                </p>

                {/* 睡眠時間 */}
                <div className="profile-screen-input-group" style={{ marginBottom: '1.5rem' }}>
                  <div className="profile-screen-field-header">
                    <span className="profile-screen-field-label">睡眠時間</span>
                    <span className="profile-screen-priority-badge profile-screen-priority-recommended">
                      推奨
                    </span>
                    {getFieldImpactDescription('sleepHours', sleepHours) && (
                      <span className="profile-screen-field-description">
                        {getFieldImpactDescription('sleepHours', sleepHours)}
                      </span>
                    )}
                  </div>
                  <div className="profile-screen-number-input-row">
                    <input
                      type="number"
                      className="profile-screen-number-input"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(e.target.value)}
                      placeholder="7"
                      min="0"
                      max="24"
                      step="0.5"
                    />
                    <span className="profile-screen-unit">時間/日</span>
                  </div>
                </div>

                {/* 運動強度 */}
                <div className="profile-screen-input-group" style={{ marginBottom: '1.5rem' }}>
                  <div className="profile-screen-field-header">
                    <span className="profile-screen-field-label">運動強度</span>
                    <span className="profile-screen-priority-badge profile-screen-priority-recommended">
                      推奨
                    </span>
                    <span className="profile-screen-field-description">
                      {getFieldImpactDescription('exerciseIntensity', exerciseIntensity)}
                    </span>
                  </div>
                  <div className="profile-screen-button-row">
                    <button
                      className={`profile-screen-option-button ${exerciseIntensity === 'none' ? 'active' : ''}`}
                      onClick={() => setExerciseIntensity('none')}
                    >
                      なし
                    </button>
                    <button
                      className={`profile-screen-option-button ${exerciseIntensity === 'light' ? 'active' : ''}`}
                      onClick={() => setExerciseIntensity('light')}
                    >
                      軽い
                    </button>
                    <button
                      className={`profile-screen-option-button ${exerciseIntensity === 'moderate' ? 'active' : ''}`}
                      onClick={() => setExerciseIntensity('moderate')}
                    >
                      中程度
                    </button>
                    <button
                      className={`profile-screen-option-button ${exerciseIntensity === 'intense' ? 'active' : ''}`}
                      onClick={() => setExerciseIntensity('intense')}
                    >
                      激しい
                    </button>
                  </div>
                </div>

                {/* 運動頻度 */}
                <div className="profile-screen-input-group" style={{ marginBottom: '1.5rem' }}>
                  <div className="profile-screen-field-header">
                    <span className="profile-screen-field-label">運動頻度</span>
                    <span className="profile-screen-priority-badge profile-screen-priority-recommended">
                      推奨
                    </span>
                    <span className="profile-screen-field-description">週あたりの運動回数</span>
                  </div>
                  <div className="profile-screen-button-row">
                    <button
                      className={`profile-screen-option-button ${exerciseFrequency === 'none' ? 'active' : ''}`}
                      onClick={() => setExerciseFrequency('none')}
                    >
                      なし
                    </button>
                    <button
                      className={`profile-screen-option-button ${exerciseFrequency === '1-2' ? 'active' : ''}`}
                      onClick={() => setExerciseFrequency('1-2')}
                    >
                      週1-2回
                    </button>
                    <button
                      className={`profile-screen-option-button ${exerciseFrequency === '3-4' ? 'active' : ''}`}
                      onClick={() => setExerciseFrequency('3-4')}
                    >
                      週3-4回
                    </button>
                    <button
                      className={`profile-screen-option-button ${exerciseFrequency === '5+' ? 'active' : ''}`}
                      onClick={() => setExerciseFrequency('5+')}
                    >
                      週5回以上
                    </button>
                  </div>
                </div>

                {/* 甲状腺機能 */}
                <div className="profile-screen-input-group" style={{ marginBottom: '1.5rem' }}>
                  <div className="profile-screen-field-header">
                    <span className="profile-screen-field-label">甲状腺機能</span>
                    <span className="profile-screen-priority-badge profile-screen-priority-recommended">
                      推奨
                    </span>
                    {getFieldImpactDescription('thyroidFunction', thyroidFunction) && (
                      <span className="profile-screen-field-description">
                        {getFieldImpactDescription('thyroidFunction', thyroidFunction)}
                      </span>
                    )}
                  </div>
                  <div className="profile-screen-button-row">
                    <button
                      className={`profile-screen-option-button ${thyroidFunction === 'normal' ? 'active' : ''}`}
                      onClick={() => setThyroidFunction('normal')}
                    >
                      正常
                    </button>
                    <button
                      className={`profile-screen-option-button ${thyroidFunction === 'hypothyroid' ? 'active' : ''}`}
                      onClick={() => setThyroidFunction('hypothyroid')}
                    >
                      機能低下
                    </button>
                    <button
                      className={`profile-screen-option-button ${thyroidFunction === 'hyperthyroid' ? 'active' : ''}`}
                      onClick={() => setThyroidFunction('hyperthyroid')}
                    >
                      機能亢進
                    </button>
                  </div>
                </div>

                {/* 日光暴露頻度 */}
                <div className="profile-screen-input-group" style={{ marginBottom: '1.5rem' }}>
                  <div className="profile-screen-field-header">
                    <span className="profile-screen-field-label">日光暴露頻度</span>
                    <span className="profile-screen-priority-badge profile-screen-priority-recommended">
                      推奨
                    </span>
                    <span className="profile-screen-field-description">
                      {getFieldImpactDescription('sunExposureFrequency', sunExposureFrequency)}
                    </span>
                  </div>
                  <div className="profile-screen-button-row">
                    <button
                      className={`profile-screen-option-button ${sunExposureFrequency === 'none' ? 'active' : ''}`}
                      onClick={() => setSunExposureFrequency('none')}
                    >
                      なし
                    </button>
                    <button
                      className={`profile-screen-option-button ${sunExposureFrequency === 'rare' ? 'active' : ''}`}
                      onClick={() => setSunExposureFrequency('rare')}
                    >
                      まれ
                    </button>
                    <button
                      className={`profile-screen-option-button ${sunExposureFrequency === 'occasional' ? 'active' : ''}`}
                      onClick={() => setSunExposureFrequency('occasional')}
                    >
                      時々
                    </button>
                    <button
                      className={`profile-screen-option-button ${sunExposureFrequency === 'daily' ? 'active' : ''}`}
                      onClick={() => setSunExposureFrequency('daily')}
                    >
                      毎日
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 任意項目: 消化器系・炎症・メンタルヘルス・サプリメント・生活習慣 */}
        {!hiddenSections.optional && (
          <div className="profile-screen-section">
            <div
              className="profile-screen-section-header"
              onClick={() => toggleSectionCollapse('optional')}
            >
              <h2 className="profile-screen-section-title">任意項目（検査不要）</h2>
              <div className="profile-screen-section-toggle">
                <span
                  className="profile-screen-section-visibility-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSectionVisibility('optional');
                  }}
                  title={t('settings.hideSection')}
                >
                  非表示
                </span>
                <span
                  className={`profile-screen-collapse-icon ${collapsedSections.optional ? 'collapsed' : ''}`}
                >
                  ▼
                </span>
              </div>
            </div>
            {!collapsedSections.optional && (
              <div className="profile-screen-section-content">
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                  より詳細なパーソナライズのために任意で設定できます（自己申告で分かります）
                </p>

                {/* 消化器系の問題 */}
                <div className="profile-screen-switch-row" style={{ marginBottom: '1rem' }}>
                  <div className="profile-screen-switch-label-group">
                    <label className="profile-screen-switch-label">消化器系の問題</label>
                    <p className="profile-screen-switch-description"></p>
                  </div>
                  <label className="profile-screen-switch">
                    <input
                      type="checkbox"
                      checked={digestiveIssues}
                      onChange={(e) => setDigestiveIssues(e.target.checked)}
                    />
                    <span className="profile-screen-switch-slider"></span>
                  </label>
                </div>

                {/* 炎症レベル */}
                <div className="profile-screen-input-group" style={{ marginBottom: '1.5rem' }}>
                  <div className="profile-screen-field-header">
                    <span className="profile-screen-field-label">炎症レベル</span>
                    <span className="profile-screen-priority-badge profile-screen-priority-optional">
                      任意
                    </span>
                  </div>
                  <div className="profile-screen-button-row">
                    <button
                      className={`profile-screen-option-button ${inflammationLevel === 'low' ? 'active' : ''}`}
                      onClick={() => setInflammationLevel('low')}
                    >
                      低い
                    </button>
                    <button
                      className={`profile-screen-option-button ${inflammationLevel === 'moderate' ? 'active' : ''}`}
                      onClick={() => setInflammationLevel('moderate')}
                    >
                      中程度
                    </button>
                    <button
                      className={`profile-screen-option-button ${inflammationLevel === 'high' ? 'active' : ''}`}
                      onClick={() => setInflammationLevel('high')}
                    >
                      高い
                    </button>
                  </div>
                </div>

                {/* メンタルヘルス状態 */}
                <div className="profile-screen-input-group" style={{ marginBottom: '1.5rem' }}>
                  <div className="profile-screen-field-header">
                    <span className="profile-screen-field-label">メンタルヘルス状態</span>
                    <span className="profile-screen-priority-badge profile-screen-priority-optional">
                      任意
                    </span>
                  </div>
                  <div className="profile-screen-button-row">
                    <button
                      className={`profile-screen-option-button ${mentalHealthStatus === 'good' ? 'active' : ''}`}
                      onClick={() => setMentalHealthStatus('good')}
                    >
                      良好
                    </button>
                    <button
                      className={`profile-screen-option-button ${mentalHealthStatus === 'moderate' ? 'active' : ''}`}
                      onClick={() => setMentalHealthStatus('moderate')}
                    >
                      中程度
                    </button>
                    <button
                      className={`profile-screen-option-button ${mentalHealthStatus === 'poor' ? 'active' : ''}`}
                      onClick={() => setMentalHealthStatus('poor')}
                    >
                      不良
                    </button>
                  </div>
                </div>

                {/* サプリメント摂取状況 */}
                <div className="profile-screen-input-group" style={{ marginBottom: '1.5rem' }}>
                  <div className="profile-screen-field-header">
                    <span className="profile-screen-field-label">サプリメント摂取状況</span>
                    <span className="profile-screen-priority-badge profile-screen-priority-optional">
                      任意
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="profile-screen-switch-row">
                      <div className="profile-screen-switch-label-group">
                        <label className="profile-screen-switch-label">マグネシウム</label>
                      </div>
                      <label className="profile-screen-switch">
                        <input
                          type="checkbox"
                          checked={supplementMagnesium}
                          onChange={(e) => setSupplementMagnesium(e.target.checked)}
                        />
                        <span className="profile-screen-switch-slider"></span>
                      </label>
                    </div>
                    <div className="profile-screen-switch-row">
                      <div className="profile-screen-switch-label-group">
                        <label className="profile-screen-switch-label">ビタミンD</label>
                      </div>
                      <label className="profile-screen-switch">
                        <input
                          type="checkbox"
                          checked={supplementVitaminD}
                          onChange={(e) => setSupplementVitaminD(e.target.checked)}
                        />
                        <span className="profile-screen-switch-slider"></span>
                      </label>
                    </div>
                    <div className="profile-screen-switch-row">
                      <div className="profile-screen-switch-label-group">
                        <label className="profile-screen-switch-label">ヨウ素</label>
                      </div>
                      <label className="profile-screen-switch">
                        <input
                          type="checkbox"
                          checked={supplementIodine}
                          onChange={(e) => setSupplementIodine(e.target.checked)}
                        />
                        <span className="profile-screen-switch-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* アルコール摂取頻度 */}
                <div className="profile-screen-input-group" style={{ marginBottom: '1.5rem' }}>
                  <div className="profile-screen-field-header">
                    <span className="profile-screen-field-label">アルコール摂取頻度</span>
                    <span className="profile-screen-priority-badge profile-screen-priority-optional">
                      任意
                    </span>
                  </div>
                  <div className="profile-screen-button-row">
                    <button
                      className={`profile-screen-option-button ${alcoholFrequency === 'none' ? 'active' : ''}`}
                      onClick={() => setAlcoholFrequency('none')}
                    >
                      なし
                    </button>
                    <button
                      className={`profile-screen-option-button ${alcoholFrequency === 'rare' ? 'active' : ''}`}
                      onClick={() => setAlcoholFrequency('rare')}
                    >
                      まれ
                    </button>
                    <button
                      className={`profile-screen-option-button ${alcoholFrequency === 'weekly' ? 'active' : ''}`}
                      onClick={() => setAlcoholFrequency('weekly')}
                    >
                      週に数回
                    </button>
                    <button
                      className={`profile-screen-option-button ${alcoholFrequency === 'daily' ? 'active' : ''}`}
                      onClick={() => setAlcoholFrequency('daily')}
                    >
                      毎日
                    </button>
                  </div>
                </div>

                {/* カフェイン摂取量 */}
                <div className="profile-screen-input-group" style={{ marginBottom: '1.5rem' }}>
                  <div className="profile-screen-field-header">
                    <span className="profile-screen-field-label">カフェイン摂取量</span>
                    <span className="profile-screen-priority-badge profile-screen-priority-optional">
                      任意
                    </span>
                  </div>
                  <div className="profile-screen-button-row">
                    <button
                      className={`profile-screen-option-button ${caffeineIntake === 'none' ? 'active' : ''}`}
                      onClick={() => setCaffeineIntake('none')}
                    >
                      なし
                    </button>
                    <button
                      className={`profile-screen-option-button ${caffeineIntake === 'low' ? 'active' : ''}`}
                      onClick={() => setCaffeineIntake('low')}
                    >
                      低い
                    </button>
                    <button
                      className={`profile-screen-option-button ${caffeineIntake === 'moderate' ? 'active' : ''}`}
                      onClick={() => setCaffeineIntake('moderate')}
                    >
                      中程度
                    </button>
                    <button
                      className={`profile-screen-option-button ${caffeineIntake === 'high' ? 'active' : ''}`}
                      onClick={() => setCaffeineIntake('high')}
                    >
                      高い
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Phase 4: 代謝ストレス指標 */}
        <div className="profile-screen-section">
          <div
            className="profile-screen-section-header"
            onClick={() => toggleSectionCollapse('metabolicStress')}
          >
            <h2 className="profile-screen-section-title">代謝ストレス指標（Phase 4）</h2>
            <div className="profile-screen-section-toggle">
              <span
                className="profile-screen-section-visibility-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSectionVisibility('metabolicStress');
                }}
                title="このセクションを非表示にする"
              >
                非表示
              </span>
              <span
                className={`profile-screen-collapse-icon ${collapsedSections.metabolicStress ? 'collapsed' : ''}`}
              >
                ▼
              </span>
            </div>
          </div>
          {!collapsedSections.metabolicStress && !hiddenSections.metabolicStress && (
            <div className="profile-screen-section-content">
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                該当する項目を選択すると、栄養素目標値が自動調整されます
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  {
                    id: 'morning_fatigue',
                    label: '朝起きるのが辛い / 疲労感が抜けない',
                    adjustment: 'ナトリウム +1500mg（副腎疲労疑い）',
                  },
                  {
                    id: 'night_wake',
                    label: '睡眠中に目が覚める / 悪夢を見る',
                    adjustment: 'マグネシウム +200mg、夕食の脂質推奨（夜間低血糖疑い）',
                  },
                  {
                    id: 'postmeal_sleepy',
                    label: '食後に眠くなる',
                    adjustment: 'インスリン抵抗性あり（フラグ保存）',
                  },
                  {
                    id: 'coffee_high',
                    label: 'コーヒーを毎日2杯以上飲む',
                    adjustment: 'ナトリウム +500mg（Na排出増）',
                    inputType: 'coffee' as const,
                  },
                ].map((indicator) => {
                  const isCoffeeIndicator = indicator.id === 'coffee_high';
                  const isChecked = metabolicStressIndicators.includes(indicator.id);

                  return (
                    <div key={indicator.id} className="info-card">
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setMetabolicStressIndicators([
                                ...metabolicStressIndicators,
                                indicator.id,
                              ]);
                            } else {
                              setMetabolicStressIndicators(
                                metabolicStressIndicators.filter((id) => id !== indicator.id)
                              );
                              if (isCoffeeIndicator) {
                                setCoffeeInput('');
                              }
                            }
                          }}
                          style={{ marginTop: '0.25rem' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                            {indicator.label}
                          </div>
                          <div
                            style={{
                              fontSize: '0.85rem',
                              color: '#666',
                              marginBottom: isCoffeeIndicator && isChecked ? '0.75rem' : '0',
                            }}
                          >
                            {indicator.adjustment}
                          </div>
                          {isCoffeeIndicator && isChecked && (
                            <div style={{ marginTop: '0.75rem' }}>
                              <label
                                style={{
                                  fontSize: '14px',
                                  color: '#374151',
                                  display: 'block',
                                  marginBottom: '0.5rem',
                                }}
                              >
                                コーヒー入力（例:
                                スタバのコーヒーShort、コーヒー2杯、コーヒー300ml）
                              </label>
                              <input
                                type="text"
                                value={coffeeInput}
                                onChange={(e) => setCoffeeInput(e.target.value)}
                                placeholder="例: スタバのコーヒーShort、コーヒー2杯、コーヒー300ml"
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '4px',
                                  fontSize: '14px',
                                }}
                              />
                              {coffeeInput && (
                                <div
                                  style={{
                                    marginTop: '0.5rem',
                                    fontSize: '0.85rem',
                                    color: '#666',
                                  }}
                                >
                                  {(() => {
                                    try {
                                      const result = calculateCaffeineFromCoffee(coffeeInput);
                                      return `カフェイン量: ${result.description}`;
                                    } catch {
                                      return `コーヒー入力: ${coffeeInput}`;
                                    }
                                  })()}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Phase 5: 栄養素目標値のカスタマイズ（遷移式） */}
        <div className="profile-screen-section">
          <div
            className="nav-item"
            role="button"
            tabIndex={0}
            aria-label="栄養素目標値のカスタマイズ画面に遷移"
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent('navigateToScreen', { detail: 'nutrientCustom' })
              );
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.dispatchEvent(
                  new CustomEvent('navigateToScreen', { detail: 'nutrientCustom' })
                );
              }
            }}
          >
            <div className="nav-item-content">
              <h2 className="nav-item-title">栄養素目標値のカスタマイズ（Phase 5）</h2>
              <p className="nav-item-description">
                各栄養素の目標値を「推奨値（Auto）」か「手動入力（Manual）」かを選択できます
              </p>
            </div>
            <span className="nav-item-arrow">→</span>
          </div>
        </div>

        {/* 旧コード（コメントアウト） */}
        {/* <div className="profile-screen-section">
          <div className="profile-screen-section-header" onClick={() => toggleSectionCollapse('nutrientCustom')}>
            <h2 className="profile-screen-section-title">栄養素目標値のカスタマイズ（Phase 5）</h2>
            <div className="profile-screen-section-toggle">
              <span 
                className="profile-screen-section-visibility-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSectionVisibility('nutrientCustom');
                }}
                title="このセクションを非表示にする"
              >
                非表示
              </span>
              <span className={`profile-screen-collapse-icon ${collapsedSections.nutrientCustom ? 'collapsed' : ''}`}>
                ▼
              </span>
            </div>
          </div>
          {!collapsedSections.nutrientCustom && !hiddenSections.nutrientCustom && (
            <div className="profile-screen-section-content">
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                各栄養素の目標値を「推奨値（Auto）」か「手動入力（Manual）」かを選択できます
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['protein', 'fat', 'sodium', 'magnesium', 'potassium', 'zinc', 'iron', 'vitaminA', 'vitaminD', 'vitaminK2'].map((nutrient) => {
                  const current = customNutrientTargets[nutrient] || { mode: 'auto' };
                  const previewTargets = getCarnivoreTargets(
                    gender as 'male' | 'female', age ? parseFloat(age) : undefined, activityLevel, isPregnant, isBreastfeeding, isPostMenopause,
                    stressLevel, sleepHours ? Number(sleepHours) : undefined, exerciseIntensity, exerciseFrequency, thyroidFunction,
                    sunExposureFrequency, digestiveIssues, inflammationLevel, mentalHealthStatus,
                    supplementMagnesium, supplementVitaminD, supplementIodine, alcoholFrequency,
                    caffeineIntake, undefined, undefined, undefined, bodyComposition, weight ? parseFloat(weight) : undefined
                  );
                  const autoValue = (previewTargets as Record<string, number>)[nutrient] || 0;
                  
                  return (
                    <div key={nutrient} className="info-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>
                            {nutrient === 'protein' ? 'タンパク質' :
                             nutrient === 'fat' ? '脂質' :
                             nutrient === 'sodium' ? 'ナトリウム' :
                             nutrient === 'magnesium' ? 'マグネシウム' :
                             nutrient === 'potassium' ? 'カリウム' :
                             nutrient === 'zinc' ? '亜鉛' :
                             nutrient === 'iron' ? '鉄分' :
                             nutrient === 'vitaminA' ? 'ビタミンA' :
                             nutrient === 'vitaminD' ? 'ビタミンD' :
                             nutrient === 'vitaminK2' ? 'ビタミンK2' : nutrient}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                            推奨値: {autoValue}{nutrient === 'protein' || nutrient === 'fat' ? 'g' : nutrient === 'sodium' || nutrient === 'magnesium' || nutrient === 'potassium' || nutrient === 'zinc' || nutrient === 'iron' ? 'mg' : nutrient === 'vitaminA' || nutrient === 'vitaminD' ? 'IU' : 'μg'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => {
                              const newTargets = { ...customNutrientTargets };
                              if (current.mode === 'auto') {
                                delete newTargets[nutrient];
                              } else {
                                newTargets[nutrient] = { mode: 'auto' };
                              }
                              setCustomNutrientTargets(newTargets);
                            }}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: current.mode === 'auto' ? '#f43f5e' : '#f3f4f6',
                              color: current.mode === 'auto' ? 'white' : '#374151',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '14px',
                            }}
                          >
                            Auto
                          </button>
                          <button
                            onClick={() => {
                              setCustomNutrientTargets({
                                ...customNutrientTargets,
                                [nutrient]: { mode: 'manual', value: autoValue },
                              });
                            }}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: current.mode === 'manual' ? '#f43f5e' : '#f3f4f6',
                              color: current.mode === 'manual' ? 'white' : '#374151',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '14px',
                            }}
                          >
                            Manual
                          </button>
                        </div>
                      </div>
                      {current.mode === 'manual' && (
                        <div style={{ marginTop: '0.75rem' }}>
                          <label style={{ fontSize: '14px', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                            手動目標値
                          </label>
                          <div className="profile-screen-number-input-row">
                            <input
                              type="number"
                              className="profile-screen-number-input"
                              value={current.value || ''}
                              onChange={(e) => {
                                const value = e.target.value ? parseFloat(e.target.value) : undefined;
                                setCustomNutrientTargets({
                                  ...customNutrientTargets,
                                  [nutrient]: { mode: 'manual', value },
                                });
                              }}
                              placeholder={autoValue.toString()}
                              min="0"
                              step={nutrient === 'protein' || nutrient === 'fat' ? '1' : '0.1'}
                            />
                            <span className="profile-screen-unit">
                              {nutrient === 'protein' || nutrient === 'fat' ? 'g' :
                               nutrient === 'sodium' || nutrient === 'magnesium' || nutrient === 'potassium' || nutrient === 'zinc' || nutrient === 'iron' ? 'mg' :
                               nutrient === 'vitaminA' || nutrient === 'vitaminD' ? 'IU' : 'μg'}
                            </span>
                          </div>
                        </div>
                      )}
                      {current.mode === 'manual' && (
                        <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '0.5rem' }}>✏️</span>
                      )}
                    </div>
                  );
                })}
              </div>
              {Object.keys(customNutrientTargets).length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('全てのカスタム目標値をリセットして、推奨値（Auto）に戻しますか？')) {
                      setCustomNutrientTargets({});
                    }
                  }}
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  全てリセット（Autoに戻す）
                </button>
              )}
            </div>
          )}
        </div>

        {/* プレビューボタン */}
        <div className="profile-screen-section">
          <button
            onClick={() => setShowPreview(!showPreview)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f43f5e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500',
              width: '100%',
            }}
          >
            {showPreview ? '📊 プレビューを閉じる' : '📊 栄養素目標値のプレビュー'}
          </button>

          {showPreview && (
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                現在の設定による栄養素目標値
              </h3>
              {(() => {
                const explanations = getAllNutrientExplanations({
                  gender,
                  age: age ? Number(age) : undefined,
                  activityLevel,
                  isPregnant,
                  isBreastfeeding,
                  isPostMenopause,
                  stressLevel,
                  sleepHours: sleepHours ? Number(sleepHours) : undefined,
                  exerciseIntensity,
                  exerciseFrequency,
                  thyroidFunction,
                  sunExposureFrequency,
                  supplementMagnesium,
                  supplementVitaminD,
                });

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {explanations.map((explanation, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '0.75rem',
                          backgroundColor: 'var(--color-bg-primary)',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '0.5rem',
                          }}
                        >
                          <span style={{ fontWeight: '600' }}>{explanation.nutrient}:</span>
                          <strong style={{ fontSize: '1.1rem' }}>
                            {explanation.value}
                            {explanation.unit}
                          </strong>
                        </div>
                        <div
                          style={{
                            fontSize: '14px',
                            color: '#666',
                            lineHeight: '1.6',
                            marginTop: '0.5rem',
                          }}
                        >
                          <p style={{ margin: '0 0 0.5rem 0' }}>{explanation.humanExplanation}</p>
                          {explanation.adjustments.length > 0 && (
                            <div
                              style={{
                                marginTop: '0.5rem',
                                paddingTop: '0.5rem',
                                borderTop: '1px solid #e5e7eb',
                              }}
                            >
                              <div
                                style={{ fontSize: '12px', color: '#888', marginBottom: '0.25rem' }}
                              >
                                調整内容:
                              </div>
                              {explanation.adjustments.map((adj, i) => (
                                <div
                                  key={i}
                                  style={{
                                    fontSize: '13px',
                                    marginLeft: '0.5rem',
                                    marginBottom: '0.25rem',
                                  }}
                                >
                                  • {adj.reason}: {adj.impact}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Phase 6: 栄養素表示設定 */}
        <div className="profile-screen-section section-container">
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: 'var(--color-text-primary)',
            }}
          >
            栄養素表示設定
          </h2>
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--color-text-secondary)',
              marginBottom: '1rem',
            }}
          >
            各栄養素の表示/非表示を切り替えられます。デフォルトは全部表示です。
          </p>

          {/* 全選択/全解除 */}
          <div className="button-group" style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={() => {
                setAllNutrientsVisible(true);
                setNutrientDisplaySettings(getNutrientDisplaySettings());
              }}
              className="toggle-button active"
            >
              全て表示
            </button>
            <button
              onClick={() => {
                setAllNutrientsVisible(false);
                setNutrientDisplaySettings(getNutrientDisplaySettings());
              }}
              className="toggle-button"
            >
              全て非表示
            </button>
          </div>

          {/* カテゴリごとの表示 */}
          {(
            [
              'macro',
              'mineral',
              'fatSolubleVitamin',
              'waterSolubleVitamin',
              'other',
              'ratio',
              'antiNutrient',
              'avoid',
            ] as const
          ).map((category) => {
            const categoryConfigs = ALL_NUTRIENT_DISPLAY_CONFIGS.filter(
              (config) => config.category === category
            );
            if (categoryConfigs.length === 0) return null;

            const categoryLabels: Record<typeof category, string> = {
              macro: 'マクロ栄養素',
              mineral: 'ミネラル',
              fatSolubleVitamin: '脂溶性ビタミン',
              waterSolubleVitamin: '水溶性ビタミン',
              other: 'その他',
              ratio: '比率',
              antiNutrient: '抗栄養素',
              avoid: '避けるべき食品',
            };

            const allVisible = categoryConfigs.every(
              (config) => nutrientDisplaySettings[config.key]
            );
            const allHidden = categoryConfigs.every(
              (config) => !nutrientDisplaySettings[config.key]
            );

            return (
              <div key={category} style={{ marginBottom: '1.5rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                  }}
                >
                  <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>
                    {categoryLabels[category]}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        toggleCategoryVisibility(category, true);
                        setNutrientDisplaySettings(getNutrientDisplaySettings());
                      }}
                      disabled={allVisible}
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: allVisible ? '#d1d5db' : '#f43f5e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: allVisible ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      全て表示
                    </button>
                    <button
                      onClick={() => {
                        toggleCategoryVisibility(category, false);
                        setNutrientDisplaySettings(getNutrientDisplaySettings());
                      }}
                      disabled={allHidden}
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: allHidden ? '#d1d5db' : '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: allHidden ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      全て非表示
                    </button>
                  </div>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '0.5rem',
                  }}
                >
                  {categoryConfigs.map((config) => {
                    const isVisible = nutrientDisplaySettings[config.key];
                    return (
                      <label
                        key={config.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem',
                          backgroundColor: isVisible ? '#f0f9ff' : '#f9fafb',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          border: `1px solid ${isVisible ? '#f43f5e' : '#e5e7eb'}`,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={nutrientDisplaySettings[config.key]}
                          onChange={() => {
                            toggleNutrientVisibility(config.key);
                            setNutrientDisplaySettings(getNutrientDisplaySettings());
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        <span
                          style={{
                            fontSize: '14px',
                            color: nutrientDisplaySettings[config.key] ? '#1e40af' : '#6b7280',
                          }}
                        >
                          {config.label} {config.unit && `(${config.unit})`}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 機能表示設定（あらゆる機能のON/OFF） */}
        <div className="profile-screen-section section-container">
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: 'var(--color-text-primary)',
            }}
          >
            機能表示設定
          </h2>
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--color-text-secondary)',
              marginBottom: '1rem',
            }}
          >
            あらゆる機能の表示/非表示を切り替えられます。デフォルトは全部表示です。
          </p>

          {/* 全選択/全解除 */}
          <div className="button-group" style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={() => {
                setAllFeaturesVisible(true);
                setFeatureDisplaySettings(getFeatureDisplaySettings());
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f43f5e',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              全て表示
            </button>
            <button
              onClick={() => {
                setAllFeaturesVisible(false);
                setFeatureDisplaySettings(getFeatureDisplaySettings());
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              全て非表示
            </button>
          </div>

          {/* カテゴリごとの表示 */}
          {(['screenElement', 'analysis', 'notification', 'other'] as const).map((category) => {
            const categoryConfigs = ALL_FEATURE_DISPLAY_CONFIGS.filter(
              (config) => config.category === category
            );
            if (categoryConfigs.length === 0) return null;

            const categoryLabels: Record<typeof category, string> = {
              screenElement: '画面要素',
              analysis: '分析機能',
              notification: '通知設定',
              other: 'その他',
            };

            const allVisible = categoryConfigs.every(
              (config) => featureDisplaySettings[config.key]
            );
            const allHidden = categoryConfigs.every(
              (config) => !featureDisplaySettings[config.key]
            );

            return (
              <div key={category} style={{ marginBottom: '1.5rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                  }}
                >
                  <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>
                    {categoryLabels[category]}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        toggleFeatureCategoryVisibility(category, true);
                        setFeatureDisplaySettings(getFeatureDisplaySettings());
                      }}
                      disabled={allVisible}
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: allVisible ? '#d1d5db' : '#f43f5e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: allVisible ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      全て表示
                    </button>
                    <button
                      onClick={() => {
                        toggleFeatureCategoryVisibility(category, false);
                        setFeatureDisplaySettings(getFeatureDisplaySettings());
                      }}
                      disabled={allHidden}
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: allHidden ? '#d1d5db' : '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: allHidden ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      全て非表示
                    </button>
                  </div>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '0.5rem',
                  }}
                >
                  {categoryConfigs.map((config) => {
                    const isVisible = featureDisplaySettings[config.key];
                    return (
                      <label
                        key={config.key}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.5rem',
                          padding: '0.5rem',
                          backgroundColor: isVisible ? '#f0f9ff' : '#f9fafb',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          border: `1px solid ${isVisible ? '#f43f5e' : '#e5e7eb'}`,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={() => {
                            toggleFeatureVisibilityUtil(config.key);
                            setFeatureDisplaySettings(getFeatureDisplaySettings());
                          }}
                          style={{ cursor: 'pointer', marginTop: '0.25rem' }}
                        />
                        <div style={{ flex: 1 }}>
                          <span
                            style={{
                              fontSize: '14px',
                              color: isVisible ? '#1e40af' : '#6b7280',
                              fontWeight: '500',
                            }}
                          >
                            {config.label}
                          </span>
                          {config.description && (
                            <div
                              style={{ fontSize: '12px', color: '#9ca3af', marginTop: '0.25rem' }}
                            >
                              {config.description}
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 保存ボタン（常時表示） */}
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'var(--color-bg-primary)',
            padding: '1rem',
            borderTop: '1px solid #e5e7eb',
            zIndex: 100,
            marginTop: '2rem',
          }}
        >
          <button
            onClick={handleSave}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#b91c1c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
