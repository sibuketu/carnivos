/**
 * 栄養ゲージ完全動的化: DailyStatus からその日ごとの栄養目標値を動的計算
 * UserProfile の静的設定 + その日の DailyStatus で係数を適用
 */

import type { DailyStatus, UserProfile } from '../types';
import type { CarnivoreTarget } from './carnivoreTargets';
import { getCarnivoreTargets } from './carnivoreTargets';

const FACTOR_CAP = 2.0;

function capFactor(f: number): number {
  return Math.min(Math.max(f, 0.1), FACTOR_CAP);
}

/**
 * UserProfile と DailyStatus から動的に栄養目標値を計算する。
 * dailyStatus が null/undefined の場合は UserProfile のみで計算（後方互換）。
 */
export function getDynamicNutrientTargets(
  userProfile: UserProfile | null | undefined,
  dailyStatus: DailyStatus | null | undefined
): CarnivoreTarget {
  const weight = dailyStatus?.weight ?? userProfile?.weight ?? 70;
  const baseTargets = getCarnivoreTargets(
    userProfile?.gender,
    userProfile?.age,
    userProfile?.activityLevel,
    userProfile?.isPregnant,
    userProfile?.isBreastfeeding,
    userProfile?.isPostMenopause,
    userProfile?.stressLevel,
    userProfile?.sleepHours,
    userProfile?.exerciseIntensity,
    userProfile?.exerciseFrequency,
    userProfile?.thyroidFunction,
    userProfile?.sunExposureFrequency,
    userProfile?.digestiveIssues,
    userProfile?.inflammationLevel,
    userProfile?.mentalHealthStatus,
    userProfile?.supplementMagnesium,
    userProfile?.supplementVitaminD,
    userProfile?.supplementIodine,
    userProfile?.alcoholFrequency,
    userProfile?.caffeineIntake,
    userProfile?.bodyComposition,
    weight,
    userProfile?.metabolicStressIndicators,
    userProfile?.customNutrientTargets
  );

  if (!dailyStatus) {
    return baseTargets;
  }

  let magnesiumFactor = 1;
  let proteinFactor = 1;
  let fatFactor = 1;
  let sodiumFactor = 1;
  let potassiumFactor = 1;
  let zincFactor = 1;
  let ironFactor = 1;
  let vitaminDFactor = 1;
  let vitaminAFactor = 1;
  const _digestiveIssuesFlag = false; // Future use
  let proteinMinFromLbm: number | null = null;

  // 1. 睡眠の質 → マグネシウム・ビタミンD
  if (dailyStatus.sleepScore != null) {
    if (dailyStatus.sleepScore < 50) magnesiumFactor *= 1.4;
    else if (dailyStatus.sleepScore < 70) magnesiumFactor *= 1.2;
  }
  if ((dailyStatus.deepSleep ?? 0) < 60) magnesiumFactor *= 1.3;
  if ((dailyStatus.awakeCount ?? 0) > 3) magnesiumFactor *= 1.2;
  if ((dailyStatus.sleepLatency ?? 0) > 30) magnesiumFactor *= 1.15;

  // 2. 頭痛・筋肉痛・関節痛 → マグネシウム・タンパク質
  if ((dailyStatus.headache ?? 0) >= 7) magnesiumFactor *= 1.5;
  else if ((dailyStatus.headache ?? 0) >= 4) magnesiumFactor *= 1.3;

  if ((dailyStatus.jointPain ?? 0) >= 7) {
    magnesiumFactor *= 1.2;
  } else if ((dailyStatus.jointPain ?? 0) >= 4) {
    magnesiumFactor *= 1.1;
  }

  if ((dailyStatus.muscleSoreness ?? 0) >= 7) {
    proteinFactor *= 1.3;
    magnesiumFactor *= 1.2;
  } else if ((dailyStatus.muscleSoreness ?? 0) >= 4) {
    proteinFactor *= 1.15;
  }

  // 3. メンタル状態 → マグネシウム・ビタミンD
  if ((dailyStatus.anxiety ?? 0) >= 7 || (dailyStatus.depression ?? 0) >= 7) {
    magnesiumFactor *= 1.4;
    vitaminDFactor *= 1.2;
  } else if ((dailyStatus.anxiety ?? 0) >= 4 || (dailyStatus.depression ?? 0) >= 4) {
    magnesiumFactor *= 1.2;
    vitaminDFactor *= 1.1;
  }
  if ((dailyStatus.brainFog ?? 0) >= 7 || ((dailyStatus.focus ?? 10) <= 3)) {
    proteinFactor *= 1.1;
  }

  // 4. エネルギー・疲労 → タンパク質・脂質・鉄分
  if ((dailyStatus.energyLevel ?? 10) <= 3) {
    proteinFactor *= 1.2;
    fatFactor *= 1.2;
    ironFactor *= 1.3;
    magnesiumFactor *= 1.3;
  } else if ((dailyStatus.energyLevel ?? 10) <= 5) {
    proteinFactor *= 1.1;
    ironFactor *= 1.15;
  }
  if ((dailyStatus.physicalFatigue ?? 0) >= 7) {
    proteinFactor *= 1.2;
    ironFactor *= 1.3;
  }

  // 5. 排便状態 → 電解質
  const bm = dailyStatus.bowelMovement;
  if (bm) {
    if (bm.status === 'constipated') {
      magnesiumFactor *= 1.4;
      potassiumFactor *= 1.2;
    } else if (bm.status === 'watery' || bm.status === 'loose') {
      sodiumFactor *= 1.4;
      potassiumFactor *= 1.3;
      zincFactor *= 1.3;
      ironFactor *= 1.3;
    }
  }
  if ((dailyStatus.bloating ?? 0) >= 7) {
    zincFactor *= 1.2;
  }

  // 6. 体重・体組成（日次）→ ベースは既に getCarnivoreTargets(weight) で反映済み。LBM 補正のみ
  if (dailyStatus.bodyFatPercentage != null && dailyStatus.bodyFatPercentage > 0) {
    const currentWeight = dailyStatus.weight ?? userProfile?.weight ?? 70;
    const leanBodyMass = currentWeight * (1 - dailyStatus.bodyFatPercentage / 100);
    const lbmProtein = Math.round(leanBodyMass * 2.0);
    proteinMinFromLbm = lbmProtein;
    if (lbmProtein > baseTargets.protein) {
      proteinFactor *= lbmProtein / baseTargets.protein;
    }
  }

  // 7. 心拍・血圧 → 電解質
  const hr = dailyStatus.heartRate;
  if (hr != null && hr > 80) {
    magnesiumFactor *= 1.3;
    potassiumFactor *= 1.2;
  }
  const sys = dailyStatus.systolicBloodPressure;
  const dia = dailyStatus.diastolicBloodPressure;
  if (sys != null && dia != null) {
    if (sys > 140 || dia > 90) {
      sodiumFactor *= 0.9;
      potassiumFactor *= 1.3;
      magnesiumFactor *= 1.3;
    } else if (sys < 100) {
      sodiumFactor *= 1.3;
    }
  }

  // 8. 天気・日光 → ビタミンD（係数で補正）
  const weather = dailyStatus.weather;
  const sunMin = dailyStatus.sunMinutes ?? 0;
  if (weather === 'sunny' && sunMin >= 30) vitaminDFactor *= 0.5;
  else if (weather === 'cloudy' && sunMin >= 20) vitaminDFactor *= 0.8;
  else if (weather === 'rainy' || weather === 'snowy' || sunMin < 10) vitaminDFactor *= 1.5;

  // 9. 冷水・サウナ・瞑想
  if ((dailyStatus.coldExposureMinutes ?? 0) >= 10) {
    proteinFactor *= 1.1;
    fatFactor *= 1.15;
  }
  if ((dailyStatus.saunaMinutes ?? 0) >= 20) {
    sodiumFactor *= 1.3;
    magnesiumFactor *= 1.2;
  }

  // 10. 断食・血糖・ケトン
  if ((dailyStatus.fastingHours ?? 0) >= 16) {
    sodiumFactor *= 1.3;
    potassiumFactor *= 1.2;
  }
  const glucose = dailyStatus.glucose;
  if (glucose != null) {
    if (glucose > 100) magnesiumFactor *= 1.3;
    else if (glucose < 70) sodiumFactor *= 1.4;
  }
  if ((dailyStatus.ketones ?? 0) >= 1.5) {
    sodiumFactor *= 1.3;
    magnesiumFactor *= 1.2;
  }

  // 11. 肌・リビドー
  const skin = dailyStatus.skinCondition;
  if (skin === 'acne' || skin === 'rash') {
    vitaminAFactor *= 1.3;
    zincFactor *= 1.3;
  } else if (skin === 'dry') {
    fatFactor *= 1.2;
  }
  if ((dailyStatus.libido ?? 10) <= 3) {
    zincFactor *= 1.4;
    proteinFactor *= 1.2;
    fatFactor *= 1.2;
  }

  // 12. 社交・孤独感
  if ((dailyStatus.loneliness ?? 0) >= 7 || ((dailyStatus.socialSatisfaction ?? 10) <= 3)) {
    magnesiumFactor *= 1.2;
    vitaminDFactor *= 1.15;
  }

  // 日次運動 → タンパク質・脂質・ナトリウム（DailyStatus の運動で上乗せ）
  const dayExerciseIntensity = dailyStatus.exerciseIntensity;
  const dayExerciseMin = dailyStatus.exerciseMinutes ?? 0;
  if (dayExerciseIntensity === 'intense' && dayExerciseMin >= 30) {
    proteinFactor *= 1.2;
    fatFactor *= 1.15;
    sodiumFactor *= 1.2;
  } else if (dayExerciseIntensity === 'moderate' && dayExerciseMin >= 20) {
    proteinFactor *= 1.1;
    sodiumFactor *= 1.1;
  }

  // 係数キャップ適用
  magnesiumFactor = capFactor(magnesiumFactor);
  proteinFactor = capFactor(proteinFactor);
  fatFactor = capFactor(fatFactor);
  sodiumFactor = capFactor(sodiumFactor);
  potassiumFactor = capFactor(potassiumFactor);
  zincFactor = capFactor(zincFactor);
  ironFactor = capFactor(ironFactor);
  vitaminDFactor = capFactor(vitaminDFactor);
  vitaminAFactor = capFactor(vitaminAFactor);

  const proteinFinal = Math.round(baseTargets.protein * proteinFactor);
  const proteinWithLbm =
    proteinMinFromLbm != null ? Math.max(proteinFinal, proteinMinFromLbm) : proteinFinal;

  return {
    ...baseTargets,
    protein: proteinWithLbm,
    fat: Math.round(baseTargets.fat * fatFactor),
    magnesium: Math.round(baseTargets.magnesium * magnesiumFactor),
    sodium: Math.round(baseTargets.sodium * sodiumFactor),
    potassium: Math.round(baseTargets.potassium * potassiumFactor),
    zinc: Math.round(baseTargets.zinc * zincFactor),
    iron: Math.round(baseTargets.iron * ironFactor),
    vitamin_d: Math.round(baseTargets.vitamin_d * vitaminDFactor),
    vitamin_a: Math.round(baseTargets.vitamin_a * vitaminAFactor),
  };
}
