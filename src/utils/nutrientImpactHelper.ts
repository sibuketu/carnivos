/**
 * 栄養素変動の説明を生成するヘルパー関数
 */

import type { UserProfile } from '../types';
import { getCarnivoreTargets } from '../data/carnivoreTargets';

export interface NutrientImpact {
  nutrient: string;
  before: number;
  after: number;
  unit: string;
  description: string;
}

/**
 * 設定変更による栄養素の変動を計算
 */
export function calculateNutrientImpact(
  currentProfile: Partial<UserProfile>,
  changedField: keyof UserProfile,
  newValue: UserProfile[keyof UserProfile]
): NutrientImpact[] {
  const impacts: NutrientImpact[] = [];

  // 変更前の目標値を計算
  const beforeTargets = getCarnivoreTargets(
    currentProfile.gender,
    currentProfile.age,
    currentProfile.activityLevel,
    currentProfile.isPregnant,
    currentProfile.isBreastfeeding,
    currentProfile.isPostMenopause,
    currentProfile.stressLevel
  );

  // 変更後のプロファイルを作成
  const afterProfile = { ...currentProfile, [changedField]: newValue };

  // 変更後の目標値を計算
  const afterTargets = getCarnivoreTargets(
    afterProfile.gender,
    afterProfile.age,
    afterProfile.activityLevel,
    afterProfile.isPregnant,
    afterProfile.isBreastfeeding,
    afterProfile.isPostMenopause,
    afterProfile.stressLevel
  );

  // 変動した栄養素を検出
  const nutrients: Array<{ key: keyof typeof beforeTargets; name: string; unit: string }> = [
    { key: 'protein', name: 'タンパク質', unit: 'g' },
    { key: 'fat', name: '脂質', unit: 'g' },
    { key: 'iron', name: '鉄分', unit: 'mg' },
    { key: 'magnesium', name: 'マグネシウム', unit: 'mg' },
    { key: 'vitamin_d', name: 'ビタミンD', unit: 'IU' },
  ];

  nutrients.forEach(({ key, name, unit }) => {
    const before = beforeTargets[key];
    const after = afterTargets[key];
    if (before !== undefined && after !== undefined && before !== after) {
      impacts.push({
        nutrient: name,
        before,
        after,
        unit,
        description: `${name}が${before}${unit} → ${after}${unit}に${after > before ? '増加' : '減少'}します`,
      });
    }
  });

  return impacts;
}

/**
 * フィールドごとの栄養素変動説明を取得
 */
export function getFieldImpactDescription(
  field: keyof UserProfile,
  value: UserProfile[keyof UserProfile]
): string {
  const descriptions: Record<string, string | Record<string, string>> = {
    age:
      typeof value === 'number' && value > 50
        ? '高齢者はビタミンDとタンパク質の必要量が増加します'
        : '',
    activityLevel: {
      active: '活動的な人はタンパク質・脂質・マグネシウムの必要量が増加します',
      moderate: '中程度の活動量では、タンパク質と脂質がやや増加します',
      sedentary: '低活動量では、標準的な必要量が適用されます',
    },
    isPregnant:
      typeof value === 'boolean' && value
        ? '妊娠中はタンパク質・鉄分・マグネシウムの必要量が増加します'
        : '',
    isBreastfeeding:
      typeof value === 'boolean' && value
        ? '授乳中はタンパク質・マグネシウムの必要量が増加します'
        : '',
    isPostMenopause:
      typeof value === 'boolean' && value
        ? '閉経後は鉄分の必要量が8mgに減少します（月経がないため）'
        : '',
    stressLevel: {
      high: '高ストレス時はマグネシウムの必要量が増加します',
      moderate: '中程度のストレスでは、標準的な必要量が適用されます',
      low: '低ストレスでは、標準的な必要量が適用されます',
    },
    sleepHours:
      typeof value === 'number' && value < 7
        ? '睡眠不足はマグネシウムとコルチゾールに影響します'
        : '',
    exerciseIntensity: {
      intense: '激しい運動ではタンパク質・脂質・マグネシウムの必要量が増加します',
      moderate: '中程度の運動では、タンパク質と脂質がやや増加します',
      light: '軽い運動では、標準的な必要量が適用されます',
      none: '運動なしでは、標準的な必要量が適用されます',
    },
    thyroidFunction: {
      hypothyroid: '甲状腺機能低下症ではヨウ素とセレンの必要量が増加します',
      hyperthyroid: '甲状腺機能亢進症ではヨウ素とセレンの必要量が増加します',
      normal: '',
    },
    sunExposureFrequency: {
      none: '日光暴露なしではビタミンDサプリメントが必要になる可能性があります',
      rare: 'まれな日光暴露ではビタミンDの必要量が増加します',
      occasional: '時々の日光暴露では、標準的な必要量が適用されます',
      daily: '毎日の日光暴露では、ビタミンD合成が十分な可能性があります',
    },
  };

  const desc = descriptions[field];
  if (typeof desc === 'string') {
    return desc;
  }
  if (typeof desc === 'object' && desc !== null && typeof value === 'string') {
    return (desc as Record<string, string>)[value] || '';
  }
  return '';
}
