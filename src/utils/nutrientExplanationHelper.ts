/**
 * 栄養素の数値がなぜその値になったかを説明するヘルパー関数
 */

import type { UserProfile } from '../types';
import { getCarnivoreTargets } from '../data/carnivoreTargets';

export interface NutrientExplanation {
  nutrient: string;
  value: number;
  unit: string;
  baseValue: number;
  adjustments: Array<{
    reason: string;
    impact: string;
    source: 'profile' | 'research' | 'standard';
  }>;
  humanExplanation: string; // 人間が読める自然な説明
}

/**
 * 各栄養素の数値がなぜその値になったかを説明
 */
export function getNutrientExplanation(
  nutrient: 'protein' | 'fat' | 'iron' | 'magnesium' | 'vitamin_d',
  profile: Partial<UserProfile>
): NutrientExplanation {
  const targets = getCarnivoreTargets(
    profile.gender,
    profile.age,
    profile.activityLevel,
    profile.isPregnant,
    profile.isBreastfeeding,
    profile.isPostMenopause,
    profile.stressLevel,
    profile.sleepHours,
    profile.exerciseIntensity,
    profile.exerciseFrequency,
    profile.thyroidFunction,
    profile.sunExposureFrequency,
    profile.digestiveIssues,
    profile.inflammationLevel,
    profile.mentalHealthStatus,
    profile.supplementMagnesium,
    profile.supplementVitaminD,
    profile.supplementIodine,
    profile.alcoholFrequency,
    profile.caffeineIntake
  );

  const baseTargets = getCarnivoreTargets(
    profile.gender,
    undefined,
    'moderate',
    false,
    false,
    false,
    'moderate'
  );

  const adjustments: Array<{
    reason: string;
    impact: string;
    source: 'profile' | 'research' | 'standard';
  }> = [];
  let humanExplanation = '';

  const nutrientNames: Record<typeof nutrient, { name: string; unit: string }> = {
    protein: { name: 'タンパク質', unit: 'g' },
    fat: { name: '脂質', unit: 'g' },
    iron: { name: '鉄分', unit: 'mg' },
    magnesium: { name: 'マグネシウム', unit: 'mg' },
    vitamin_d: { name: 'ビタミンD', unit: 'IU' },
  };

  const { name, unit } = nutrientNames[nutrient];
  const value = targets[nutrient];
  const baseValue = baseTargets[nutrient];

  // 年齢による調整
  if (profile.age && Number(profile.age) > 50) {
    if (nutrient === 'protein' || nutrient === 'vitamin_d') {
      adjustments.push({
        reason: `年齢が${profile.age}歳のため`,
        impact: nutrient === 'protein' ? 'タンパク質 +10g' : 'ビタミンD +400IU',
        source: 'research',
      });
    }
  }

  // 活動量による調整
  if (profile.activityLevel === 'active') {
    if (nutrient === 'protein' || nutrient === 'fat' || nutrient === 'magnesium') {
      adjustments.push({
        reason: '活動量が高いため',
        impact:
          nutrient === 'protein'
            ? 'タンパク質 +20g'
            : nutrient === 'fat'
              ? '脂質 +30g'
              : 'マグネシウム +100mg',
        source: 'research',
      });
    }
  }

  // 妊娠中
  if (profile.isPregnant) {
    if (nutrient === 'protein' || nutrient === 'iron' || nutrient === 'magnesium') {
      adjustments.push({
        reason: '妊娠中のため',
        impact:
          nutrient === 'protein'
            ? 'タンパク質 +25g'
            : nutrient === 'iron'
              ? '鉄分 +9mg'
              : 'マグネシウム +50mg',
        source: 'research',
      });
    }
  }

  // 授乳中
  if (profile.isBreastfeeding) {
    if (nutrient === 'protein' || nutrient === 'magnesium') {
      adjustments.push({
        reason: '授乳中のため',
        impact: nutrient === 'protein' ? 'タンパク質 +25g' : 'マグネシウム +50mg',
        source: 'research',
      });
    }
  }

  // 閉経後
  if (profile.isPostMenopause && nutrient === 'iron') {
    adjustments.push({
      reason: '閉経後のため（月経がないため）',
      impact: '鉄分 -10mg',
      source: 'standard',
    });
  }

  // ストレスレベル
  if (profile.stressLevel === 'high' && nutrient === 'magnesium') {
    adjustments.push({
      reason: '高ストレス状態のため',
      impact: 'マグネシウム +100mg',
      source: 'research',
    });
  }

  // 運動強度
  if (profile.exerciseIntensity === 'intense') {
    if (nutrient === 'protein' || nutrient === 'fat' || nutrient === 'magnesium') {
      adjustments.push({
        reason: '激しい運動をしているため',
        impact:
          nutrient === 'protein'
            ? 'タンパク質 +20g'
            : nutrient === 'fat'
              ? '脂質 +30g'
              : 'マグネシウム +100mg',
        source: 'research',
      });
    }
  }

  // 日光暴露
  if (profile.sunExposureFrequency === 'none' && nutrient === 'vitamin_d') {
    adjustments.push({
      reason: '日光暴露がないため',
      impact: 'ビタミンD +1000IU（サプリメント推奨）',
      source: 'research',
    });
  }

  // サプリメント摂取
  if (profile.supplementMagnesium && nutrient === 'magnesium') {
    adjustments.push({
      reason: 'マグネシウムサプリメントを摂取しているため',
      impact: 'マグネシウム目標値 -200mg（サプリメント分を考慮）',
      source: 'profile',
    });
  }

  if (profile.supplementVitaminD && nutrient === 'vitamin_d') {
    adjustments.push({
      reason: 'ビタミンDサプリメントを摂取しているため',
      impact: 'ビタミンD目標値 -1000IU（サプリメント分を考慮）',
      source: 'profile',
    });
  }

  // 各栄養素のデフォルト説明（なぜその栄養素が重要なのか、カーニボアダイエットにおける役割）
  const defaultExplanations: Record<typeof nutrient, string> = {
    protein: `タンパク質は筋肉、臓器、ホルモン、酵素などの構成要素として必要不可欠です。カーニボアダイエットでは、体重1kgあたり約1.6gが推奨されており、標準的な目標値は${baseValue}${unit}です。肉、魚、卵、内臓などから十分に摂取できます。`,
    fat: `脂質はカーニボアダイエットの主要なエネルギー源です。タンパク質の約1.4倍が推奨され、標準的な目標値は${baseValue}${unit}です。脂質が不足するとエネルギー不足やホルモン産生の低下につながる可能性があります。脂身の多い肉を中心に摂取することを推奨します。`,
    iron: `鉄分は赤血球の生成や酸素運搬に必要です。カーニボアダイエットでは、赤身肉や内臓（特にレバー）から十分に摂取できます。標準的な目標値は${baseValue}${unit}です。女性は月経による損失があるため、より多くの摂取が推奨されます。`,
    magnesium: `マグネシウムは300以上の酵素反応に関与し、筋肉の収縮、神経伝達、エネルギー産生に重要です。カーニボアダイエットでは、肉からある程度摂取できますが、ストレスや運動によって需要が増加します。標準的な目標値は${baseValue}${unit}です。`,
    vitamin_d: `ビタミンDは骨の健康、免疫機能、ホルモン産生に重要です。日光暴露により体内で生成されますが、不足する場合はサプリメントも検討できます。標準的な目標値は${baseValue}${unit}です。`,
  };

  // 人間が読める自然な説明を生成
  if (adjustments.length === 0) {
    humanExplanation = defaultExplanations[nutrient];
  } else {
    const reasons = adjustments.map((a) => a.reason).join('、');
    const impacts = adjustments.map((a) => a.impact).join('、');
    const baseExplanation = defaultExplanations[nutrient].replace(
      `標準的な目標値は${baseValue}${unit}です。`,
      ''
    );
    humanExplanation = `${baseExplanation}標準値（${baseValue}${unit}）から、${reasons}により${impacts}の調整を行いました。現在の目標値は${value}${unit}です。`;
  }

  return {
    nutrient: name,
    value,
    unit,
    baseValue,
    adjustments,
    humanExplanation,
  };
}

/**
 * 全ての栄養素の説明を取得
 */
export function getAllNutrientExplanations(profile: Partial<UserProfile>): NutrientExplanation[] {
  return [
    getNutrientExplanation('protein', profile),
    getNutrientExplanation('fat', profile),
    getNutrientExplanation('iron', profile),
    getNutrientExplanation('magnesium', profile),
    getNutrientExplanation('vitamin_d', profile),
  ];
}
