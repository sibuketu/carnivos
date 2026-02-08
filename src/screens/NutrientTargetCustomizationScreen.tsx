/**
 * CarnivOS - Nutrient Target Customization Screen
 *
 * 栄養素目標値のカスタマイズ画面
 */

import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { saveUserProfile } from '../utils/storage';
import { getCarnivoreTargets } from '../data/carnivoreTargets';
import type { UserProfile } from '../types';
import { logError } from '../utils/errorHandler';
import { useTranslation } from '../utils/i18n';
import './NutrientTargetCustomizationScreen.css';

interface NutrientTargetCustomizationScreenProps {
  onBack: () => void;
}

const NUTRIENT_KEYS = [
  'protein',
  'fat',
  'sodium',
  'magnesium',
  'potassium',
  'zinc',
  'iron',
  'vitaminA',
  'vitaminD',
  'vitaminK2',
] as const;

const NUTRIENT_LABELS: Record<string, { name: string; unit: string }> = {
  protein: { name: 'タンパク質', unit: 'g' },
  fat: { name: '脂質', unit: 'g' },
  sodium: { name: 'ナトリウム', unit: 'mg' },
  magnesium: { name: 'マグネシウム', unit: 'mg' },
  potassium: { name: 'カリウム', unit: 'mg' },
  zinc: { name: '亜鉛', unit: 'mg' },
  iron: { name: '鉄分', unit: 'mg' },
  vitaminA: { name: 'ビタミンA', unit: 'IU' },
  vitaminD: { name: 'ビタミンD', unit: 'IU' },
  vitaminK2: { name: 'ビタミンK2', unit: 'μg' },
};

export default function NutrientTargetCustomizationScreen({
  onBack,
}: NutrientTargetCustomizationScreenProps) {
  const { t } = useTranslation();
  const { userProfile, loadUserProfile } = useApp();
  const [customNutrientTargets, setCustomNutrientTargets] = useState<
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

  // 自動保存用のタイマー
  const saveTimerRef = useState<NodeJS.Timeout | null>(null)[0];

  useEffect(() => {
    if (userProfile?.customNutrientTargets) {
      setCustomNutrientTargets(
        Object.fromEntries(
          Object.entries(userProfile.customNutrientTargets).map(([key, value]) => [
            key,
            typeof value === 'number' ? { mode: 'manual' as const, value } : value,
          ])
        )
      );
    }
  }, [userProfile]);

  // AI提案（suggest_target）から遷移した場合、sessionStorage の値を初期値に反映
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('ai_suggest_target');
      if (!raw) return;
      const parsed = JSON.parse(raw) as { nutrientKey?: string; value?: number; unit?: string; reason?: string };
      sessionStorage.removeItem('ai_suggest_target');
      const key = parsed.nutrientKey;
      const value = parsed.value;
      if (!key || value == null || !NUTRIENT_KEYS.includes(key as typeof NUTRIENT_KEYS[number])) return;
      setCustomNutrientTargets((prev) => ({
        ...prev,
        [key]: { mode: 'manual', value: Number(value) },
      }));
    } catch {
      /* ignore parse/sessionStorage errors */
      void 0;
    }
  }, []);

  // 推奨値を計算
  const autoTargets = useMemo(() => {
    if (!userProfile) return {};
    return getCarnivoreTargets(
      userProfile.gender,
      userProfile.age,
      userProfile.activityLevel,
      userProfile.isPregnant,
      userProfile.isBreastfeeding,
      userProfile.isPostMenopause,
      userProfile.stressLevel,
      userProfile.sleepHours,
      userProfile.exerciseIntensity,
      userProfile.exerciseFrequency,
      userProfile.thyroidFunction,
      userProfile.sunExposureFrequency,
      userProfile.digestiveIssues,
      userProfile.inflammationLevel,
      userProfile.mentalHealthStatus,
      userProfile.supplementMagnesium,
      userProfile.supplementVitaminD,
      userProfile.supplementIodine,
      userProfile.alcoholFrequency,
      userProfile.caffeineIntake,
      userProfile.daysOnCarnivore,
      userProfile.carnivoreStartDate,
      userProfile.forceAdaptationMode,
      userProfile.bodyComposition,
      userProfile.weight,
      userProfile.metabolicStressIndicators,
      undefined // customNutrientTargetsは渡さない（推奨値を計算するため）
    );
  }, [userProfile]);

  // 自動保存
  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    const timer = setTimeout(async () => {
      if (userProfile) {
        const updatedProfile: UserProfile = {
          ...userProfile,
          customNutrientTargets:
            Object.keys(customNutrientTargets).length > 0
              ? Object.fromEntries(
                  Object.entries(customNutrientTargets).map(([key, value]) => [
                    key,
                    value.mode === 'auto'
                      ? { mode: 'auto' }
                      : { mode: 'manual', value: value.value },
                  ])
                )
              : undefined,
        };
        try {
          await saveUserProfile(updatedProfile);
          await loadUserProfile();
        } catch (error) {
          logError(error, { component: 'NutrientTargetCustomizationScreen', action: 'autoSave' });
        }
      }
    }, 1000);
    saveTimerRef.current = timer;
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [customNutrientTargets, userProfile, loadUserProfile]);

  const handleModeChange = (nutrient: string, mode: 'auto' | 'manual') => {
    const newTargets = { ...customNutrientTargets };
    if (mode === 'auto') {
      delete newTargets[nutrient];
    } else {
      const autoValue = (autoTargets as Record<string, number>)[nutrient] || 0;
      newTargets[nutrient] = { mode: 'manual', value: autoValue };
    }
    setCustomNutrientTargets(newTargets);
  };

  const handleValueChange = (nutrient: string, value: number | undefined) => {
    setCustomNutrientTargets({
      ...customNutrientTargets,
      [nutrient]: { mode: 'manual', value },
    });
  };

  return (
    <div className="nutrient-target-customization-screen-container">
      <div className="nutrient-target-customization-screen-content">
        <div className="screen-header">
          <button className="back-button" onClick={onBack} aria-label={t('common.backAriaLabel')}>
            ←
          </button>
          <h1 className="screen-header-title">栄養素目標値のカスタマイズ</h1>
        </div>

        <div className="nutrient-target-customization-screen-section">
          <p className="nutrient-target-customization-screen-description">
            各栄養素の目標値を「推奨値（Auto）」か「手動入力（Manual）」かを選択できます。
          </p>

          <div className="nutrient-target-customization-screen-list">
            {NUTRIENT_KEYS.map((nutrient) => {
              const current = customNutrientTargets[nutrient] || { mode: 'auto' };
              const autoValue = (autoTargets as Record<string, number>)[nutrient] || 0;
              const label = NUTRIENT_LABELS[nutrient];

              return (
                <div key={nutrient} className="nutrient-target-customization-screen-item">
                  <div className="nutrient-target-customization-screen-item-header">
                    <div className="nutrient-target-customization-screen-item-info">
                      <div className="nutrient-target-customization-screen-item-name">
                        {label.name}
                      </div>
                      <div className="nutrient-target-customization-screen-item-auto-value">
                        推奨値: {autoValue.toFixed(1)}
                        {label.unit}
                      </div>
                    </div>
                    <div className="nutrient-target-customization-screen-item-buttons">
                      <button
                        className={`nutrient-target-customization-screen-mode-button ${
                          current.mode === 'auto' ? 'active' : ''
                        }`}
                        onClick={() => handleModeChange(nutrient, 'auto')}
                        aria-label={`${label.name}を自動モードに設定`}
                      >
                        Auto
                      </button>
                      <button
                        className={`nutrient-target-customization-screen-mode-button ${
                          current.mode === 'manual' ? 'active' : ''
                        }`}
                        onClick={() => handleModeChange(nutrient, 'manual')}
                        aria-label={`${label.name}を手動モードに設定`}
                      >
                        Manual
                      </button>
                    </div>
                  </div>
                  {current.mode === 'manual' && (
                    <div className="nutrient-target-customization-screen-item-manual">
                      <label className="nutrient-target-customization-screen-item-manual-label">
                        手動目標値
                      </label>
                      <div className="nutrient-target-customization-screen-item-manual-input-group">
                        <input
                          type="number"
                          className="nutrient-target-customization-screen-item-manual-input"
                          value={current.value ?? autoValue}
                          onChange={(e) =>
                            handleValueChange(nutrient, parseFloat(e.target.value) || undefined)
                          }
                          placeholder={autoValue.toString()}
                          min="0"
                          step="0.1"
                          aria-label={`${label.name}の手動目標値`}
                        />
                        <span className="nutrient-target-customization-screen-item-manual-unit">
                          {label.unit}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
