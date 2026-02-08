/**
 * CarnivOS - Debug Data Generator
 *
 * デバッグ用の仮データを生成
 */

import type { DailyLog, FoodItem, UserProfile } from '../types';
import { calculateAllMetrics } from './nutrientCalculator';
import { getFoodMasterItem } from '../data/foodMaster';
import { getLanguage } from './i18n';

/**
 * デバッグ用の仮データを生成（30日分）
 * シード値を固定して、毎回同じデータを生成する
 */
export function generateDebugData(seed: number = 12345): DailyLog[] {
  const logs: DailyLog[] = [];
  const today = new Date();

  // シード値でランダム生成を固定
  let seedValue = seed;
  const random = () => {
    seedValue = (seedValue * 9301 + 49297) % 233280;
    return seedValue / 233280;
  };

  // 食品の定義（foodMasterから取得可能なもの）
  const foodConfigs = [
    { animal: 'beef' as const, part: 'ribeye', amount: 300, unit: 'g' as const },
    { animal: 'beef' as const, part: 'brisket', amount: 250, unit: 'g' as const },
    { animal: 'egg' as const, part: 'whole', amount: 4, unit: '個' as const },
    { animal: 'fish' as const, part: 'salmon', amount: 200, unit: 'g' as const },
    { animal: 'dairy' as const, part: 'butter', amount: 50, unit: 'g' as const },
  ];

  // 30日分のデータを生成（今日を含む過去30日）
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    // ランダムな食品データを生成
    const foods: FoodItem[] = [];

    // 1日あたり2-4品目をランダムに選択（シード固定）
    const numFoods = Math.floor(random() * 3) + 2;
    const selectedConfigs = [];
    for (let j = 0; j < numFoods; j++) {
      const config = foodConfigs[Math.floor(random() * foodConfigs.length)];
      selectedConfigs.push(config);
    }

    // 重複を除去
    const uniqueConfigs = Array.from(
      new Map(selectedConfigs.map((c) => [`${c.animal}_${c.part}`, c])).values()
    );

    uniqueConfigs.forEach((config) => {
      const masterItem = getFoodMasterItem(config.animal, config.part);
      if (masterItem) {
        // FoodMasterItemからFoodItemに変換
        const multiplier =
          config.unit === '個' && config.animal === 'egg'
            ? config.amount / 1 // 卵の場合は個数
            : config.amount / 100; // 100gあたりの値

        const nutrients: Record<string, number> = {
          protein: masterItem.protein.value * multiplier,
          fat: masterItem.fat.value * multiplier,
          carbs: masterItem.carbs.value * multiplier,
        };

        if (masterItem.saturated_fat) {
          nutrients.saturatedFat = masterItem.saturated_fat.value * multiplier;
        }
        if (masterItem.omega_6) {
          nutrients.omega6 = masterItem.omega_6.value * multiplier;
        }
        if (masterItem.omega_3) {
          nutrients.omega3 = masterItem.omega_3.value * multiplier;
        }
        if (masterItem.zinc) {
          nutrients.zinc = masterItem.zinc.value * multiplier;
        }
        if (masterItem.iron) {
          nutrients.iron = masterItem.iron.value * multiplier;
        }
        if (masterItem.sodium) {
          nutrients.sodium = masterItem.sodium.value * multiplier;
        }
        if (masterItem.magnesium) {
          nutrients.magnesium = masterItem.magnesium.value * multiplier;
        }
        if (masterItem.potassium) {
          nutrients.potassium = masterItem.potassium.value * multiplier;
        }
        if (masterItem.vitamin_a) {
          nutrients.vitaminA = masterItem.vitamin_a.value * multiplier;
        }
        if (masterItem.vitamin_d) {
          nutrients.vitaminD = masterItem.vitamin_d.value * multiplier;
        }
        if (masterItem.vitamin_k2) {
          nutrients.vitaminK2 = masterItem.vitamin_k2.value * multiplier;
        }
        if (masterItem.vitamin_b12) {
          nutrients.vitaminB12 = masterItem.vitamin_b12.value * multiplier;
        }
        if (masterItem.choline) {
          nutrients.choline = masterItem.choline.value * multiplier;
        }
        if (masterItem.glycine) {
          nutrients.glycine = masterItem.glycine.value * multiplier;
        }
        if (masterItem.methionine) {
          nutrients.methionine = masterItem.methionine.value * multiplier;
        }
        if (masterItem.calcium) {
          nutrients.calcium = masterItem.calcium.value * multiplier;
        }
        if (masterItem.phosphorus) {
          nutrients.phosphorus = masterItem.phosphorus.value * multiplier;
        }
        if (masterItem.iodine) {
          nutrients.iodine = masterItem.iodine.value * multiplier;
        }

        // typeを決定
        let type: 'animal' | 'plant' | 'trash' | 'ruminant' | 'dairy' = 'animal';
        if (config.animal === 'beef') {
          type = 'ruminant';
        } else if (config.animal === 'dairy' || config.animal === 'egg') {
          type = 'dairy';
        } else if (config.animal === 'fish') {
          type = 'animal';
        }

        // 現在の言語に応じた食品名を取得
        const currentLang = getLanguage();
        const getFoodName = (): string => {
          if (currentLang === 'ja') return masterItem.name_ja;
          if (currentLang === 'fr') return masterItem.name_fr || masterItem.name;
          if (currentLang === 'de') return masterItem.name_de || masterItem.name;
          if (currentLang === 'zh') return masterItem.name_ja; // 中国語は日本語名を使用（将来的に追加可能）
          return masterItem.name; // 英語（デフォルト）
        };

        foods.push({
          item: getFoodName(),
          amount: config.amount,
          unit: config.unit,
          type,
          nutrients,
        });
      }
    });

    // 栄養素を計算
    const calculatedMetrics = calculateAllMetrics(foods, {
      gender: 'male',
      weight: 70,
      height: 175,
      age: 35,
      activityLevel: 'moderate',
      goal: 'healing',
      metabolicStatus: 'adapted',
      mode: 'strict_carnivore',
    });

    // 22日連続にするため、最初の8日は違反あり、残り22日は違反なし
    // i=0が今日、i=29が30日前
    // 最初の8日（i=22〜29、つまり30日前から9日前まで）は違反あり
    // 残り22日（i=0〜21、つまり8日前から今日まで）は違反なし = 22日連続
    const isInFirst8Days = i >= 22; // 30日前から9日前まで（最初の8日）
    const hasViolation = isInFirst8Days; // 最初の8日は全て違反あり
    if (hasViolation) {
      calculatedMetrics.hasViolation = true;
      calculatedMetrics.violationTypes = ['sugar_carbs'];
    }

    // 日記データを追加（30%の確率で日記あり、症状や体調に関する記録）
    const diaryEntries = [
      '今日は調子がいい。肉が美味しかった。',
      'うんこが硬い。もっと脂質を増やそう。',
      '頭痛がする。塩分を増やしたほうがいいかも。',
      '疲れやすい。睡眠不足かもしれない。',
      '関節痛がある。炎症が起きているかも。',
      '今日は快便だった。体調が良い。',
      'こむら返りがあった。マグネシウムが必要かも。',
      'よく眠れた。調子がいい。',
    ];
    const hasDiary = random() < 0.3;
    const diary = hasDiary ? diaryEntries[Math.floor(random() * diaryEntries.length)] : undefined;

    // 体重データを生成（70kgを基準に±5kgの範囲で変動、徐々に減少傾向）
    const baseWeight = 70;
    const weightVariation = (random() - 0.5) * 5; // -2.5kg ～ +2.5kg
    const weightTrend = (29 - i) * 0.1; // 過去から現在に向かって徐々に減少（最大2.9kg減少）
    const weight = Math.round((baseWeight + weightVariation - weightTrend) * 10) / 10; // 小数点第1位まで

    // 体脂肪率データを生成（15%を基準に±3%の範囲で変動）
    const baseBodyFat = 15;
    const bodyFatVariation = (random() - 0.5) * 3; // -1.5% ～ +1.5%
    const bodyFatPercentage = Math.round((baseBodyFat + bodyFatVariation) * 10) / 10; // 小数点第1位まで

    // 睡眠時間データを生成（7時間を基準に±2時間の範囲で変動）
    const baseSleepHours = 7;
    const sleepHoursVariation = (random() - 0.5) * 2; // -1時間 ～ +1時間
    const sleepHours = Math.round((baseSleepHours + sleepHoursVariation) * 10) / 10; // 小数点第1位まで

    logs.push({
      date: dateString,
      status: {
        sleepScore: Math.floor(random() * 30) + 70, // 70-100
        sleepHours: sleepHours, // 睡眠時間（5.5-8.5時間の範囲）
        sunMinutes: Math.floor(random() * 60) + 10, // 10-70
        activityLevel: ['low', 'moderate', 'high'][Math.floor(random() * 3)] as
          | 'high'
          | 'low'
          | 'moderate',
        stressLevel: ['low', 'medium', 'high'][Math.floor(random() * 3)] as
          | 'low'
          | 'medium'
          | 'high',
      },
      fuel: foods,
      calculatedMetrics,
      diary,
      weight: weight, // 体重データ（67-72kgの範囲、徐々に減少傾向）
      bodyFatPercentage: bodyFatPercentage, // 体脂肪率データ（13.5-16.5%の範囲）
      recoveryProtocol: hasViolation
        ? (() => {
            const currentLang = getLanguage();
            return {
              violationType: 'sugar_carbs',
              isActive: true,
              fastingTargetHours: 16,
              activities:
                currentLang === 'ja'
                  ? ['軽い散歩']
                  : currentLang === 'fr'
                    ? ['Marche légère']
                    : currentLang === 'de'
                      ? ['Leichter Spaziergang']
                      : currentLang === 'zh'
                        ? ['轻散步']
                        : ['Light walk'],
              dietRecommendations:
                currentLang === 'ja'
                  ? ['脂質を増やす']
                  : currentLang === 'fr'
                    ? ['Augmenter les graisses']
                    : currentLang === 'de'
                      ? ['Fett erhöhen']
                      : currentLang === 'zh'
                        ? ['增加脂肪']
                        : ['Increase fat'],
              supplements: [],
              warnings: [],
              protocolId: 'default',
              targetFastEnd: new Date(date.getTime() + 16 * 60 * 60 * 1000).toISOString(),
            };
          })()
        : undefined,
    });
  }

  return logs;
}

/**
 * デバッグ用のプロファイルを生成（全栄養素の計算式が動的に作用するように）
 * 様々な条件を満たすプロファイルを生成して、全栄養素の調整が適用されるようにする
 */
export function generateDebugProfile(): UserProfile {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 20); // 20日前から開始（移行期間中）

  const profile: UserProfile = {
    // 基本情報
    gender: 'male',
    age: 55, // 50歳以上（ビタミンD、タンパク質の調整）
    weight: 75,
    height: 175,

    // 活動量・運動（タンパク質、脂質、マグネシウムの調整）
    activityLevel: 'active', // 活動的な人（タンパク質120g、脂質180g、マグネシウム700mg）
    exerciseIntensity: 'intense', // 激しい運動（タンパク質130g、脂質190g、マグネシウム750mg）
    exerciseFrequency: '5+', // 週5回以上（タンパク質130g、脂質190g、マグネシウム750mg）

    // 移行期間（ナトリウム、マグネシウム、カリウムの調整）
    daysOnCarnivore: 20, // 20日（30日未満なので移行期間中）
    carnivoreStartDate: startDate.toISOString().split('T')[0],
    forceAdaptationMode: null, // 自動判定

    // ストレス・睡眠（マグネシウムの調整）
    stressLevel: 'high', // 高ストレス（マグネシウム700mg）
    sleepHours: 6, // 7時間未満（マグネシウム650mg）

    // 日光暴露（ビタミンDの調整）
    sunExposureFrequency: 'none', // 日光暴露なし（ビタミンD4000IU、サプリメントなしの場合）
    supplementVitaminD: false, // サプリメントなし

    // メンタルヘルス（マグネシウム、ビタミンDの調整）
    mentalHealthStatus: 'poor', // メンタルヘルス不良（マグネシウム700mg、ビタミンD3000IU）

    // アルコール・カフェイン（マグネシウム、ビタミンB12の調整）
    alcoholFrequency: 'weekly', // 週1回（マグネシウム700mg、ビタミンB12 3.0μg）
    caffeineIntake: 'high', // 高カフェイン摂取（マグネシウム700mg、高ストレス+高カフェインで750mg）

    // 消化器系（タンパク質の調整）
    digestiveIssues: true, // 消化器系の問題（タンパク質110g）

    // 炎症（マグネシウムの調整）
    inflammationLevel: 'high', // 炎症レベル高（マグネシウム650mg）

    // 代謝ストレス指標（ナトリウム、マグネシウムの調整）
    metabolicStressIndicators: [
      'morning_fatigue', // 朝起きるのが辛い（ナトリウム+1500mg）
      'night_wake', // 睡眠中に目が覚める（マグネシウム+200mg）
      'coffee_high', // コーヒー毎日2杯以上（ナトリウム+500mg）
    ],

    // サプリメント
    supplementMagnesium: false, // マグネシウムサプリメントなし
    supplementIodine: false, // ヨウ素サプリメントなし

    // その他
    goal: 'healing',
    metabolicStatus: 'adapted',
    mode: 'strict_carnivore',
    isPregnant: false,
    isBreastfeeding: false,
    isPostMenopause: false,
    thyroidFunction: 'normal',

    // カスタム栄養素目標値（テスト用）
    customNutrientTargets: {},
  };

  // デバッグプロファイルは保存しない（毎回生成されるため）
  return profile;
}
