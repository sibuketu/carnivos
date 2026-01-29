/**
 * 栄養素目標値に影響を与える要因を計算するヘルパー関数
 * 影響度順に並べ替え、各要因の変化量を表示
 */

import type { UserProfile } from '../types';
import { getCarnivoreTargets } from '../data/carnivoreTargets';

export interface NutrientImpactFactor {
  id: number;
  category: 'profile' | 'activity' | 'health' | 'supplement' | 'lifestyle' | 'other';
  factor: string; // 要因名（例：「年齢が50歳のため」）
  impact: number; // 影響量（変化量）
  impactText: string; // 影響量のテキスト（例：「+10g」）
  reason: string; // 理由（例：「高齢者の筋肉量維持のため」）
  source: 'profile' | 'research' | 'standard';
  priority: number; // 優先度（影響度の大きさ、絶対値）
}

export type SortOrder = 'impact' | 'alphabetical' | 'category';

/**
 * 栄養素の目標値に影響を与える要因を全て計算
 */
export function calculateNutrientImpactFactors(
  nutrient:
    | 'protein'
    | 'fat'
    | 'iron'
    | 'magnesium'
    | 'vitamin_d'
    | 'sodium'
    | 'potassium'
    | 'zinc'
    | 'vitamin_c'
    | 'vitamin_a'
    | 'vitamin_k2'
    | 'vitamin_b12'
    | 'choline',
  profile: Partial<UserProfile>
): NutrientImpactFactor[] {
  const factors: NutrientImpactFactor[] = [];
  let id = 1;

  // 基準値を計算（全てデフォルト値）
  const baseTargets = getCarnivoreTargets(
    profile.gender,
    undefined, // 年齢なし
    'moderate', // 活動量: 中程度
    false, // 妊娠中: なし
    false, // 授乳中: なし
    false, // 閉経後: なし
    'moderate', // ストレス: 中程度
    undefined, // 睡眠時間
    'none', // 運動強度: なし
    'none', // 運動頻度: なし
    'normal', // 甲状腺機能: 正常
    'occasional', // 日光暴露: 時々
    false, // 消化器系の問題: なし
    'low', // 炎症レベル: 低
    'good', // メンタルヘルス: 良好
    false, // マグネシウムサプリメント: なし
    false, // ビタミンDサプリメント: なし
    false, // ヨウ素サプリメント: なし
    'none', // アルコール: なし
    'none', // カフェイン: なし
    undefined, // daysOnCarnivore
    undefined, // carnivoreStartDate
    undefined, // forceAdaptationMode
    undefined, // bodyComposition
    undefined, // weight
    undefined, // metabolicStressIndicators
    undefined // customNutrientTargets
  );

  // 現在の目標値を計算
  const currentTargets = getCarnivoreTargets(
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
    profile.caffeineIntake,
    profile.daysOnCarnivore,
    profile.carnivoreStartDate,
    profile.forceAdaptationMode,
    profile.bodyComposition,
    profile.weight,
    profile.metabolicStressIndicators,
    profile.customNutrientTargets
      ? Object.fromEntries(
          Object.entries(profile.customNutrientTargets).map(([key, value]) => [
            key,
            typeof value === 'number' ? { mode: 'manual' as const, value } : value,
          ])
        )
      : undefined
  );

  const baseValue = baseTargets[nutrient as keyof typeof baseTargets] as number | undefined;
  const currentValue = currentTargets[nutrient as keyof typeof currentTargets] as
    | number
    | undefined;

  if (baseValue === undefined || currentValue === undefined) {
    return factors;
  }

  const unit = getNutrientUnit(nutrient);
  const nutrientName = getNutrientName(nutrient);

  // 各要因を個別に計算
  // 1. 性別による影響
  if (profile.gender === 'female' && nutrient === 'iron') {
    const femaleTargets = getCarnivoreTargets(
      'female',
      undefined,
      'moderate',
      false,
      false,
      false,
      'moderate'
    );
    const maleTargets = getCarnivoreTargets(
      'male',
      undefined,
      'moderate',
      false,
      false,
      false,
      'moderate'
    );
    const femaleValue = femaleTargets[nutrient as keyof typeof femaleTargets] as number;
    const maleValue = maleTargets[nutrient as keyof typeof maleTargets] as number;
    const impact = femaleValue - maleValue;
    if (impact !== 0) {
      factors.push({
        id: id++,
        category: 'profile',
        factor: '性別が女性のため',
        impact,
        impactText: formatImpact(impact, unit),
        reason: '月経による鉄分損失を考慮',
        source: 'standard',
        priority: Math.abs(impact),
      });
    }
  }

  // 2. 年齢による影響
  if (profile.age && profile.age > 50) {
    const ageTargets = getCarnivoreTargets(
      profile.gender,
      profile.age,
      'moderate',
      false,
      false,
      false,
      'moderate'
    );
    const noAgeTargets = getCarnivoreTargets(
      profile.gender,
      undefined,
      'moderate',
      false,
      false,
      false,
      'moderate'
    );
    const ageValue = ageTargets[nutrient as keyof typeof ageTargets] as number;
    const noAgeValue = noAgeTargets[nutrient as keyof typeof noAgeTargets] as number;
    const impact = ageValue - noAgeValue;
    if (impact !== 0) {
      factors.push({
        id: id++,
        category: 'profile',
        factor: `年齢が${profile.age}歳のため`,
        impact,
        impactText: formatImpact(impact, unit),
        reason:
          nutrient === 'protein'
            ? '高齢者の筋肉量維持のため'
            : nutrient === 'vitamin_d'
              ? '高齢者のビタミンD合成能力低下のため'
              : '年齢による必要量の変化',
        source: 'research',
        priority: Math.abs(impact),
      });
    }
  }

  // 3. 活動量による影響
  if (profile.activityLevel === 'active') {
    const activeTargets = getCarnivoreTargets(
      profile.gender,
      profile.age,
      'active',
      profile.isPregnant,
      profile.isBreastfeeding,
      profile.isPostMenopause,
      profile.stressLevel
    );
    const moderateTargets = getCarnivoreTargets(
      profile.gender,
      profile.age,
      'moderate',
      profile.isPregnant,
      profile.isBreastfeeding,
      profile.isPostMenopause,
      profile.stressLevel
    );
    const activeValue = activeTargets[nutrient as keyof typeof activeTargets] as number;
    const moderateValue = moderateTargets[nutrient as keyof typeof moderateTargets] as number;
    const impact = activeValue - moderateValue;
    if (impact !== 0) {
      factors.push({
        id: id++,
        category: 'activity',
        factor: '活動量が高いため',
        impact,
        impactText: formatImpact(impact, unit),
        reason: '高い活動量による栄養素必要量の増加',
        source: 'research',
        priority: Math.abs(impact),
      });
    }
  }

  // 4. 妊娠中による影響
  if (profile.isPregnant) {
    const pregnantTargets = getCarnivoreTargets(
      profile.gender,
      profile.age,
      profile.activityLevel,
      true,
      false,
      false,
      profile.stressLevel
    );
    const notPregnantTargets = getCarnivoreTargets(
      profile.gender,
      profile.age,
      profile.activityLevel,
      false,
      false,
      false,
      profile.stressLevel
    );
    const pregnantValue = pregnantTargets[nutrient as keyof typeof pregnantTargets] as number;
    const notPregnantValue = notPregnantTargets[
      nutrient as keyof typeof notPregnantTargets
    ] as number;
    const impact = pregnantValue - notPregnantValue;
    if (impact !== 0) {
      factors.push({
        id: id++,
        category: 'health',
        factor: '妊娠中のため',
        impact,
        impactText: formatImpact(impact, unit),
        reason: '胎児の成長と母体の健康維持のため',
        source: 'research',
        priority: Math.abs(impact),
      });
    }
  }

  // 5. 授乳中による影響
  if (profile.isBreastfeeding) {
    const breastfeedingTargets = getCarnivoreTargets(
      profile.gender,
      profile.age,
      profile.activityLevel,
      profile.isPregnant,
      true,
      profile.isPostMenopause,
      profile.stressLevel
    );
    const notBreastfeedingTargets = getCarnivoreTargets(
      profile.gender,
      profile.age,
      profile.activityLevel,
      profile.isPregnant,
      false,
      profile.isPostMenopause,
      profile.stressLevel
    );
    const breastfeedingValue = breastfeedingTargets[
      nutrient as keyof typeof breastfeedingTargets
    ] as number;
    const notBreastfeedingValue = notBreastfeedingTargets[
      nutrient as keyof typeof notBreastfeedingTargets
    ] as number;
    const impact = breastfeedingValue - notBreastfeedingValue;
    if (impact !== 0) {
      factors.push({
        id: id++,
        category: 'health',
        factor: '授乳中のため',
        impact,
        impactText: formatImpact(impact, unit),
        reason: '母乳生成と母体の健康維持のため',
        source: 'research',
        priority: Math.abs(impact),
      });
    }
  }

  // 6. 閉経後による影響
  if (profile.isPostMenopause && nutrient === 'iron') {
    const postMenopauseTargets = getCarnivoreTargets(
      profile.gender,
      profile.age,
      profile.activityLevel,
      profile.isPregnant,
      profile.isBreastfeeding,
      true,
      profile.stressLevel
    );
    const preMenopauseTargets = getCarnivoreTargets(
      profile.gender,
      profile.age,
      profile.activityLevel,
      profile.isPregnant,
      profile.isBreastfeeding,
      false,
      profile.stressLevel
    );
    const postMenopauseValue = postMenopauseTargets[
      nutrient as keyof typeof postMenopauseTargets
    ] as number;
    const preMenopauseValue = preMenopauseTargets[
      nutrient as keyof typeof preMenopauseTargets
    ] as number;
    const impact = postMenopauseValue - preMenopauseValue;
    if (impact !== 0) {
      factors.push({
        id: id++,
        category: 'health',
        factor: '閉経後のため',
        impact,
        impactText: formatImpact(impact, unit),
        reason: '月経がないため鉄分必要量が減少',
        source: 'standard',
        priority: Math.abs(impact),
      });
    }
  }

  // 7. ストレスレベルによる影響
  if (profile.stressLevel === 'high' && nutrient === 'magnesium') {
    const highStressTargets = getCarnivoreTargets(
      profile.gender,
      profile.age,
      profile.activityLevel,
      profile.isPregnant,
      profile.isBreastfeeding,
      profile.isPostMenopause,
      'high'
    );
    const moderateStressTargets = getCarnivoreTargets(
      profile.gender,
      profile.age,
      profile.activityLevel,
      profile.isPregnant,
      profile.isBreastfeeding,
      profile.isPostMenopause,
      'moderate'
    );
    const highStressValue = highStressTargets[nutrient as keyof typeof highStressTargets] as number;
    const moderateStressValue = moderateStressTargets[
      nutrient as keyof typeof moderateStressTargets
    ] as number;
    const impact = highStressValue - moderateStressValue;
    if (impact !== 0) {
      factors.push({
        id: id++,
        category: 'lifestyle',
        factor: '高ストレス状態のため',
        impact,
        impactText: formatImpact(impact, unit),
        reason: 'ストレスによるマグネシウム消費量の増加',
        source: 'research',
        priority: Math.abs(impact),
      });
    }
  }

  // 8. 運動強度による影響
  if (profile.exerciseIntensity === 'intense' || profile.exerciseFrequency === '5+') {
    const intenseTargets = getCarnivoreTargets(
      profile.gender,
      profile.age,
      profile.activityLevel,
      profile.isPregnant,
      profile.isBreastfeeding,
      profile.isPostMenopause,
      profile.stressLevel,
      profile.sleepHours,
      'intense',
      '5+'
    );
    const noExerciseTargets = getCarnivoreTargets(
      profile.gender,
      profile.age,
      profile.activityLevel,
      profile.isPregnant,
      profile.isBreastfeeding,
      profile.isPostMenopause,
      profile.stressLevel,
      profile.sleepHours,
      'none',
      'none'
    );
    const intenseValue = intenseTargets[nutrient as keyof typeof intenseTargets] as number;
    const noExerciseValue = noExerciseTargets[nutrient as keyof typeof noExerciseTargets] as number;
    const impact = intenseValue - noExerciseValue;
    if (impact !== 0) {
      factors.push({
        id: id++,
        category: 'activity',
        factor: '激しい運動をしているため',
        impact,
        impactText: formatImpact(impact, unit),
        reason: '激しい運動による栄養素必要量の増加',
        source: 'research',
        priority: Math.abs(impact),
      });
    }
  }

  // 9. 日光暴露による影響
  if (profile.sunExposureFrequency === 'none' || profile.sunExposureFrequency === 'rare') {
    if (nutrient === 'vitamin_d' && !profile.supplementVitaminD) {
      const noSunTargets = getCarnivoreTargets(
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
        'none'
      );
      const dailySunTargets = getCarnivoreTargets(
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
        'daily'
      );
      const noSunValue = noSunTargets[nutrient as keyof typeof noSunTargets] as number;
      const dailySunValue = dailySunTargets[nutrient as keyof typeof dailySunTargets] as number;
      const impact = noSunValue - dailySunValue;
      if (impact !== 0) {
        factors.push({
          id: id++,
          category: 'lifestyle',
          factor: '日光暴露が少ないため',
          impact,
          impactText: formatImpact(impact, unit),
          reason: 'ビタミンD合成が不足するため、食事からの摂取量を増やす必要がある',
          source: 'research',
          priority: Math.abs(impact),
        });
      }
    }
  }

  // 10. サプリメント摂取による影響
  if (profile.supplementMagnesium && nutrient === 'magnesium') {
    // サプリメントを摂取している場合、目標値は変わらないが、実際の必要量は減る
    // ただし、ここでは目標値の変化のみを計算するため、この要因は除外
    // （実際には「サプリメントを摂取しているため、食事からの目標値は-200mg」という表示は別途実装）
  }

  if (profile.supplementVitaminD && nutrient === 'vitamin_d') {
    // 同様に、サプリメントを摂取している場合の処理
  }

  // 11. アルコール摂取による影響
  if (
    (profile.alcoholFrequency === 'daily' || profile.alcoholFrequency === 'weekly') &&
    (nutrient === 'magnesium' || nutrient === 'vitamin_b12')
  ) {
    const alcoholTargets = getCarnivoreTargets(
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
      'daily'
    );
    const noAlcoholTargets = getCarnivoreTargets(
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
      'none'
    );
    const alcoholValue = alcoholTargets[nutrient as keyof typeof alcoholTargets] as number;
    const noAlcoholValue = noAlcoholTargets[nutrient as keyof typeof noAlcoholTargets] as number;
    const impact = alcoholValue - noAlcoholValue;
    if (impact !== 0) {
      factors.push({
        id: id++,
        category: 'lifestyle',
        factor: 'アルコールを摂取しているため',
        impact,
        impactText: formatImpact(impact, unit),
        reason: 'アルコールによる栄養素の消費・排出量の増加',
        source: 'research',
        priority: Math.abs(impact),
      });
    }
  }

  // 12. カフェイン摂取による影響
  if (profile.caffeineIntake === 'high' && nutrient === 'magnesium') {
    const highCaffeineTargets = getCarnivoreTargets(
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
      'high'
    );
    const noCaffeineTargets = getCarnivoreTargets(
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
      'none'
    );
    const highCaffeineValue = highCaffeineTargets[
      nutrient as keyof typeof highCaffeineTargets
    ] as number;
    const noCaffeineValue = noCaffeineTargets[nutrient as keyof typeof noCaffeineTargets] as number;
    const impact = highCaffeineValue - noCaffeineValue;
    if (impact !== 0) {
      factors.push({
        id: id++,
        category: 'lifestyle',
        factor: '高カフェイン摂取のため',
        impact,
        impactText: formatImpact(impact, unit),
        reason: 'カフェインによるマグネシウム排出量の増加',
        source: 'research',
        priority: Math.abs(impact),
      });
    }
  }

  // 13. 睡眠時間による影響
  if (profile.sleepHours && profile.sleepHours < 7 && nutrient === 'magnesium') {
    const lowSleepTargets = getCarnivoreTargets(
      profile.gender,
      profile.age,
      profile.activityLevel,
      profile.isPregnant,
      profile.isBreastfeeding,
      profile.isPostMenopause,
      profile.stressLevel,
      6
    );
    const normalSleepTargets = getCarnivoreTargets(
      profile.gender,
      profile.age,
      profile.activityLevel,
      profile.isPregnant,
      profile.isBreastfeeding,
      profile.isPostMenopause,
      profile.stressLevel,
      8
    );
    const lowSleepValue = lowSleepTargets[nutrient as keyof typeof lowSleepTargets] as number;
    const normalSleepValue = normalSleepTargets[
      nutrient as keyof typeof normalSleepTargets
    ] as number;
    const impact = lowSleepValue - normalSleepValue;
    if (impact !== 0) {
      factors.push({
        id: id++,
        category: 'lifestyle',
        factor: `睡眠時間が${profile.sleepHours}時間のため`,
        impact,
        impactText: formatImpact(impact, unit),
        reason: '睡眠不足によるマグネシウム消費量の増加',
        source: 'research',
        priority: Math.abs(impact),
      });
    }
  }

  // 14. 移行期間による影響
  if (profile.daysOnCarnivore !== undefined && profile.daysOnCarnivore < 30) {
    const adaptationTargets = getCarnivoreTargets(
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
      profile.caffeineIntake,
      profile.daysOnCarnivore
    );
    const adaptedTargets = getCarnivoreTargets(
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
      profile.caffeineIntake,
      30
    );
    const adaptationValue = adaptationTargets[nutrient as keyof typeof adaptationTargets] as number;
    const adaptedValue = adaptedTargets[nutrient as keyof typeof adaptedTargets] as number;
    const impact = adaptationValue - adaptedValue;
    if (
      impact !== 0 &&
      (nutrient === 'sodium' || nutrient === 'magnesium' || nutrient === 'potassium')
    ) {
      factors.push({
        id: id++,
        category: 'health',
        factor: 'カーニボア移行期間中のため',
        impact,
        impactText: formatImpact(impact, unit),
        reason: '移行期間中の電解質バランス調整のため',
        source: 'research',
        priority: Math.abs(impact),
      });
    }
  }

  // 15. 代謝ストレス指標による影響
  if (profile.metabolicStressIndicators && profile.metabolicStressIndicators.length > 0) {
    const withIndicatorsTargets = getCarnivoreTargets(
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
      profile.caffeineIntake,
      profile.daysOnCarnivore,
      profile.carnivoreStartDate,
      profile.forceAdaptationMode,
      profile.bodyComposition,
      profile.weight,
      profile.metabolicStressIndicators
    );
    const withoutIndicatorsTargets = getCarnivoreTargets(
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
      profile.caffeineIntake,
      profile.daysOnCarnivore,
      profile.carnivoreStartDate,
      profile.forceAdaptationMode,
      profile.bodyComposition,
      profile.weight,
      []
    );
    const withIndicatorsValue = withIndicatorsTargets[
      nutrient as keyof typeof withIndicatorsTargets
    ] as number;
    const withoutIndicatorsValue = withoutIndicatorsTargets[
      nutrient as keyof typeof withoutIndicatorsTargets
    ] as number;
    const impact = withIndicatorsValue - withoutIndicatorsValue;
    if (impact !== 0) {
      const indicatorNames = profile.metabolicStressIndicators
        .map((ind) => {
          if (ind === 'morning_fatigue') return '朝の疲労感';
          if (ind === 'night_wake') return '夜間覚醒';
          if (ind === 'coffee_high') return '高カフェイン摂取';
          return ind;
        })
        .join('、');
      factors.push({
        id: id++,
        category: 'health',
        factor: `代謝ストレス指標（${indicatorNames}）のため`,
        impact,
        impactText: formatImpact(impact, unit),
        reason: '代謝ストレスによる栄養素必要量の増加',
        source: 'research',
        priority: Math.abs(impact),
      });
    }
  }

  return factors;
}

/**
 * 影響度順に並べ替え
 */
export function sortFactorsByImpact(factors: NutrientImpactFactor[]): NutrientImpactFactor[] {
  return [...factors].sort((a, b) => b.priority - a.priority);
}

/**
 * アルファベット順に並べ替え
 */
export function sortFactorsAlphabetically(factors: NutrientImpactFactor[]): NutrientImpactFactor[] {
  return [...factors].sort((a, b) => a.factor.localeCompare(b.factor, 'ja'));
}

/**
 * カテゴリ順に並べ替え
 */
export function sortFactorsByCategory(factors: NutrientImpactFactor[]): NutrientImpactFactor[] {
  const categoryOrder: NutrientImpactFactor['category'][] = [
    'profile',
    'activity',
    'health',
    'lifestyle',
    'supplement',
    'other',
  ];
  return [...factors].sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a.category);
    const bIndex = categoryOrder.indexOf(b.category);
    if (aIndex !== bIndex) {
      return aIndex - bIndex;
    }
    return b.priority - a.priority; // 同じカテゴリ内は影響度順
  });
}

/**
 * 並び順を適用
 */
export function applySortOrder(
  factors: NutrientImpactFactor[],
  sortOrder: SortOrder
): NutrientImpactFactor[] {
  switch (sortOrder) {
    case 'impact':
      return sortFactorsByImpact(factors);
    case 'alphabetical':
      return sortFactorsAlphabetically(factors);
    case 'category':
      return sortFactorsByCategory(factors);
    default:
      return sortFactorsByImpact(factors);
  }
}

/**
 * カテゴリ名を取得
 */
export function getCategoryName(category: NutrientImpactFactor['category']): string {
  const names: Record<NutrientImpactFactor['category'], string> = {
    profile: 'プロファイル',
    activity: '活動',
    health: '健康状態',
    supplement: 'サプリメント',
    lifestyle: 'ライフスタイル',
    other: 'その他',
  };
  return names[category];
}

/**
 * 栄養素名を取得
 */
function getNutrientName(nutrient: string): string {
  const names: Record<string, string> = {
    protein: 'タンパク質',
    fat: '脂質',
    iron: '鉄分',
    magnesium: 'マグネシウム',
    vitamin_d: 'ビタミンD',
    sodium: 'ナトリウム',
    potassium: 'カリウム',
    zinc: '亜鉛',
    vitamin_c: 'ビタミンC',
    vitamin_a: 'ビタミンA',
    vitamin_k2: 'ビタミンK2',
    vitamin_b12: 'ビタミンB12',
    choline: 'コリン',
  };
  return names[nutrient] || nutrient;
}

/**
 * 栄養素の単位を取得
 */
function getNutrientUnit(nutrient: string): string {
  const units: Record<string, string> = {
    protein: 'g',
    fat: 'g',
    iron: 'mg',
    magnesium: 'mg',
    vitamin_d: 'IU',
    sodium: 'mg',
    potassium: 'mg',
    zinc: 'mg',
    vitamin_c: 'mg',
    vitamin_a: 'IU',
    vitamin_k2: 'μg',
    vitamin_b12: 'μg',
    choline: 'mg',
  };
  return units[nutrient] || '';
}

/**
 * 影響量をフォーマット
 */
function formatImpact(impact: number, unit: string): string {
  if (impact > 0) {
    return `+${impact}${unit}`;
  } else if (impact < 0) {
    return `${impact}${unit}`;
  } else {
    return `±0${unit}`;
  }
}
