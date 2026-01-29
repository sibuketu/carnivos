/**
 * Primal Logic - Nutrient Calculator Engine
 *
 * 栄養素計算エンジン: Vitamin C動的計算、Vitamin K変換、電解質ロジック
 * 技術仕様書: @Primal_Logic_Technical_Spec.md 参照
 */

import {
  BIOAVAILABILITY_COEFFICIENTS,
  DYNAMIC_REQUIREMENTS,
  FIBER_TARGET,
  FIBER_WARNING_THRESHOLD,
  ELECTROLYTE_THRESHOLDS,
} from '../constants/carnivore_constants';
import type { FoodItem, CalculatedMetrics, UserProfile } from '../types';

/**
 * Calculate dynamic Vitamin C requirement based on carb intake
 *
 * カーニボアロジック: 糖質ゼロ環境下ではビタミンC必要量が大幅に減少
 * - グルコース・アスコルビン酸拮抗作用により、新鮮な肉に含まれる微量（DHAA）で十分
 * - 肉食のみでも1日約30mgを摂取可能なため、「ビタミンは肉で足りる」
 * - 壊血病を防ぐために必要な最小量は約10mg（RDA基準の90mgは不要）
 * - ただし、炭水化物を摂取している場合は動的に計算
 *
 * Formula:
 * - If carbs < 20g (strict carnivore): 10mg（カーニボアロジック: 最小必要量）
 * - If carbs > 100g: 100mg（標準RDA）
 * - Otherwise: 10 + (carbs * 0.4)（炭水化物摂取量に応じて増加）
 */
export function calculateVitaminCRequirement(netCarbs: number): number {
  const { base, carbPenalty, highCarbThreshold, highCarbRequirement } =
    DYNAMIC_REQUIREMENTS.vitaminC;

  // Gemini提案: Glucose-Ascorbate Antagonism理論
  // 計算式: requiredVitC = Min(100, NetCarbs * 1.5 + 10)
  // 例: 糖質0gなら必要量10mg。糖質20gなら必要量40mg。
  // 上限キャップ: 100mg（炭水化物を大量に摂った場合でも1000mgなどにならないよう）
  const calculated = base + netCarbs * carbPenalty;
  return Math.min(calculated, highCarbRequirement); // 100mgでキャップ
}

/**
 * Calculate effective Vitamin C intake
 * (Currently assumes all Vit C sources are equivalent - may need adjustment)
 */
export function calculateEffectiveVitaminC(foods: FoodItem[]): number {
  return (
    foods.reduce((sum, food) => {
      return sum + (food.nutrients?.vitaminC || 0);
    }, 0) * 1.0 // Animal sources are 100% bioavailable
  );
}

/**
 * Calculate effective Vitamin K (K1 conversion + MK-4)
 *
 * Formula: (K1 * 0.1) + (MK-4 * 1.0)
 */
export function calculateEffectiveVitaminK(foods: FoodItem[]): number {
  // Note: This is a simplified version. In reality, we'd need to know
  // which foods contain K1 vs MK-4. For now, we'll assume:
  // - Animal foods: MK-4 (100% bioavailability)
  // - Plant foods: K1 (10% bioavailability)

  return foods.reduce((sum, food) => {
    const vitK = food.nutrients?.vitaminK || 0;
    const coefficient =
      food.type === 'animal' || food.type === 'ruminant' || food.type === 'dairy'
        ? BIOAVAILABILITY_COEFFICIENTS.vitaminK.mk4
        : BIOAVAILABILITY_COEFFICIENTS.vitaminK.k1;
    return sum + vitK * coefficient;
  }, 0);
}

/**
 * Calculate effective Iron (Heme vs Non-Heme)
 *
 * Formula: (Heme * 1.0) + (Non-Heme * 0.1)
 */
export function calculateEffectiveIron(foods: FoodItem[]): number {
  return foods.reduce((sum, food) => {
    const hemeIron = food.nutrients?.hemeIron || 0;
    const nonHemeIron = food.nutrients?.nonHemeIron || 0;

    const effectiveHeme = hemeIron * BIOAVAILABILITY_COEFFICIENTS.iron.heme;
    const effectiveNonHeme = nonHemeIron * BIOAVAILABILITY_COEFFICIENTS.iron.nonHeme;

    return sum + effectiveHeme + effectiveNonHeme;
  }, 0);
}

/**
 * Calculate effective Zinc (Animal vs Plant)
 */
export function calculateEffectiveZinc(foods: FoodItem[]): number {
  return foods.reduce((sum, food) => {
    const zinc = food.nutrients?.zinc || 0;
    const coefficient =
      food.type === 'animal' || food.type === 'ruminant' || food.type === 'dairy'
        ? BIOAVAILABILITY_COEFFICIENTS.zinc.animal
        : BIOAVAILABILITY_COEFFICIENTS.zinc.plant;
    return sum + zinc * coefficient;
  }, 0);
}

/**
 * Calculate effective Vitamin A (Retinol vs Carotenoids)
 * Gemini提案: 植物性のβカロテンは変換効率が極端に低い（0〜50%）ため、係数0.05
 */
export function calculateEffectiveVitaminA(foods: FoodItem[]): number {
  return foods.reduce((sum, food) => {
    const vitA = food.nutrients?.vitaminA || 0;
    const coefficient =
      food.type === 'animal' || food.type === 'ruminant' || food.type === 'dairy'
        ? BIOAVAILABILITY_COEFFICIENTS.vitaminA.retinol
        : BIOAVAILABILITY_COEFFICIENTS.vitaminA.carotenoids;
    return sum + vitA * coefficient;
  }, 0);
}

/**
 * Calculate total net carbs
 */
export function calculateNetCarbs(foods: FoodItem[]): number {
  return foods.reduce((sum, food) => {
    return sum + (food.nutrients?.netCarbs || food.nutrients?.carbs || 0);
  }, 0);
}

/**
 * Calculate total fiber
 */
export function calculateFiber(foods: FoodItem[]): number {
  return foods.reduce((sum, food) => {
    return sum + (food.nutrients?.fiber || 0);
  }, 0);
}

/**
 * Calculate total sodium
 */
export function calculateSodium(foods: FoodItem[]): number {
  return foods.reduce((sum, food) => {
    return sum + (food.nutrients?.sodium || 0);
  }, 0);
}

/**
 * Calculate total magnesium
 */
export function calculateMagnesium(foods: FoodItem[]): number {
  return foods.reduce((sum, food) => {
    return sum + (food.nutrients?.magnesium || 0);
  }, 0);
}

/**
 * Calculate total fat
 */
export function calculateFat(foods: FoodItem[]): number {
  return foods.reduce((sum, food) => {
    return sum + (food.nutrients?.fat || 0);
  }, 0);
}

/**
 * Calculate iron requirement based on gender
 */
export function calculateIronRequirement(gender?: 'male' | 'female'): number {
  if (!gender) {
    return DYNAMIC_REQUIREMENTS.iron.male.base; // デフォルトは男性
  }

  if (gender === 'male') {
    return DYNAMIC_REQUIREMENTS.iron.male.base;
  }

  // 女性の場合（月経がある場合を想定）
  return DYNAMIC_REQUIREMENTS.iron.female.base;
}

/**
 * Calculate effective protein intake (with bioavailability)
 * 卵の調理法による吸収率補正を適用
 */
export function calculateEffectiveProtein(foods: FoodItem[]): number {
  return foods.reduce((sum, food) => {
    const protein = food.nutrients?.protein || 0;

    // 卵の調理法による吸収率補正
    let absorptionCoefficient = 1.0;
    if (food.type === 'dairy' && food.item.toLowerCase().includes('egg')) {
      if (food.eggCookingMethod === 'raw') {
        absorptionCoefficient = 0.513; // 生卵: 51.3%の吸収率
      } else if (food.eggCookingMethod === 'cooked') {
        absorptionCoefficient = 0.909; // 加熱卵: 90.9%の吸収率
      }
    }

    const bioavailabilityCoefficient =
      food.type === 'animal' || food.type === 'ruminant' || food.type === 'dairy'
        ? BIOAVAILABILITY_COEFFICIENTS.protein.animal
        : BIOAVAILABILITY_COEFFICIENTS.protein.plant;

    return sum + protein * bioavailabilityCoefficient * absorptionCoefficient;
  }, 0);
}

/**
 * Calculate total protein intake (all sources)
 */
export function calculateTotalProtein(foods: FoodItem[]): number {
  return foods.reduce((sum, food) => {
    return sum + (food.nutrients?.protein || 0);
  }, 0);
}

/**
 * Calculate animal protein intake only (excluding plant protein)
 */
export function calculateAnimalProtein(foods: FoodItem[]): number {
  return foods
    .filter((food) => food.type === 'animal' || food.type === 'ruminant' || food.type === 'dairy')
    .reduce((sum, food) => {
      const protein = food.nutrients?.protein || 0;
      const bioavailabilityCoefficient =
        food.type === 'animal' || food.type === 'ruminant' || food.type === 'dairy'
          ? BIOAVAILABILITY_COEFFICIENTS.protein.animal
          : BIOAVAILABILITY_COEFFICIENTS.protein.plant;

      // 吸収率補正（卵の調理法など）
      let absorptionCoefficient = 1.0;
      if (food.type === 'dairy' && food.eggCookingMethod === 'raw') {
        // 生卵の場合はタンパク質吸収率が低い
        absorptionCoefficient = 0.5; // 50%の吸収率
      }

      return sum + protein * bioavailabilityCoefficient * absorptionCoefficient;
    }, 0);
}

/**
 * Calculate protein requirement based on body weight
 * Default: 1.5g per kg body weight (carnivore diet recommendation)
 */
export function calculateProteinRequirement(weight?: number): number {
  if (!weight || weight <= 0) {
    // Default to 100g if weight not provided (average for 70kg person)
    return 100;
  }
  // Carnivore diet: 1.5-2.0g per kg body weight
  // Using 1.5g as baseline
  return weight * 1.5;
}

/**
 * Calculate all metrics for a given set of foods
 */
export function calculateAllMetrics(
  foods: FoodItem[],
  userProfile?: UserProfile | null
): CalculatedMetrics {
  const netCarbs = calculateNetCarbs(foods);
  const effectiveVitC = calculateEffectiveVitaminC(foods);
  const vitCRequirement = calculateVitaminCRequirement(netCarbs);
  const effectiveVitK = calculateEffectiveVitaminK(foods);
  const effectiveIron = calculateEffectiveIron(foods);
  const ironRequirement = calculateIronRequirement(userProfile?.gender);
  const effectiveZinc = calculateEffectiveZinc(foods);
  const fiberTotal = calculateFiber(foods);
  const sodiumTotal = calculateSodium(foods);
  const magnesiumTotal = calculateMagnesium(foods);
  const effectiveProtein = calculateEffectiveProtein(foods);
  const animalEffectiveProtein = calculateAnimalProtein(foods); // 動物性タンパク質のみ（有効タンパク質）
  const proteinTotal = calculateTotalProtein(foods);
  const proteinRequirement = calculateProteinRequirement(userProfile?.weight);
  const fatTotal = calculateFat(foods);

  // 追加栄養素の計算
  const vitaminB12Total = foods.reduce((sum, food) => sum + (food.nutrients?.vitaminB12 || 0), 0);
  const vitaminB1Total = foods.reduce((sum, food) => sum + (food.nutrients?.vitaminB1 || 0), 0);
  const vitaminB2Total = foods.reduce((sum, food) => sum + (food.nutrients?.vitaminB2 || 0), 0);
  const vitaminB3Total = foods.reduce((sum, food) => sum + (food.nutrients?.vitaminB3 || 0), 0);
  const vitaminB6Total = foods.reduce((sum, food) => sum + (food.nutrients?.vitaminB6 || 0), 0);
  const vitaminETotal = foods.reduce((sum, food) => sum + (food.nutrients?.vitaminE || 0), 0);
  const calciumTotal = foods.reduce((sum, food) => sum + (food.nutrients?.calcium || 0), 0);
  const phosphorusTotal = foods.reduce((sum, food) => sum + (food.nutrients?.phosphorus || 0), 0);
  const seleniumTotal = foods.reduce((sum, food) => sum + (food.nutrients?.selenium || 0), 0);
  const copperTotal = foods.reduce((sum, food) => sum + (food.nutrients?.copper || 0), 0);
  const manganeseTotal = foods.reduce((sum, food) => sum + (food.nutrients?.manganese || 0), 0);
  // 脂溶性ビタミン（カーニボア重要）
  const effectiveVitaminA = calculateEffectiveVitaminA(foods); // Gemini提案: バイオアベイラビリティを考慮
  const vitaminATotal = foods.reduce((sum, food) => sum + (food.nutrients?.vitaminA || 0), 0);
  const vitaminDTotal = foods.reduce((sum, food) => sum + (food.nutrients?.vitaminD || 0), 0);
  const vitaminK2Total = foods.reduce((sum, food) => sum + (food.nutrients?.vitaminK2 || 0), 0);
  // その他
  const cholineTotal = foods.reduce((sum, food) => sum + (food.nutrients?.choline || 0), 0);
  const potassiumTotal = foods.reduce((sum, food) => sum + (food.nutrients?.potassium || 0), 0);
  // オメガ3/6（カーニボア重要：炎症管理）
  const omega3Total = foods.reduce((sum, food) => sum + (food.nutrients?.omega3 || 0), 0);
  const omega6Total = foods.reduce((sum, food) => sum + (food.nutrients?.omega6 || 0), 0);
  // Gemini提案: オメガ比率と炎症スコアの計算
  const omegaRatioData = calculateOmegaRatio(omega6Total, omega3Total);
  // Gemini提案: 有効脂質の計算（オメガ6ペナルティ適用）
  const effectiveFat = calculateEffectiveFat(foods);
  // ヨウ素（カーニボア重要：甲状腺機能）
  const iodineTotal = foods.reduce((sum, food) => sum + (food.nutrients?.iodine || 0), 0);
  // 比率計算（カーニボア重要）
  const calciumPhosphorusRatio = phosphorusTotal > 0 ? calciumTotal / phosphorusTotal : 0; // カルシウム:リン比率（推奨: 1:1以上）
  // Gemini提案: 有効カルシウムの計算（ビタミンD考慮）
  const effectiveCalcium = calculateEffectiveCalcium(calciumTotal, vitaminDTotal);
  // グリシン:メチオニン比（カーニボア重要：長寿の視点）
  const glycineTotal = foods.reduce((sum, food) => sum + (food.nutrients?.glycine || 0), 0);
  const methionineTotal = foods.reduce((sum, food) => sum + (food.nutrients?.methionine || 0), 0);
  const glycineMethionineRatio = methionineTotal > 0 ? glycineTotal / methionineTotal : 0; // グリシン:メチオニン比率（推奨: 1:1以上）
  // Gemini提案: 電解質バランスのチェック
  const electrolyteBalance = checkElectrolyteBalance(sodiumTotal, magnesiumTotal);
  // ビタミンB7（ビオチン）
  const vitaminB7Total = foods.reduce((sum, food) => sum + (food.nutrients?.vitaminB7 || 0), 0);
  // ビタミンB7（ビオチン）の吸収阻害フラグ（生卵を含む場合）
  const biotinBlocked = foods.some((food) => food.biotinBlocked === true);
  // タウリン（カーニボア重要：内臓・魚・肉に豊富）
  const taurineTotal = foods.reduce((sum, food) => sum + (food.nutrients?.taurine || 0), 0);
  // その他のビタミン・ミネラル（余計なくらい大量に）
  const vitaminB5Total = foods.reduce((sum, food) => sum + (food.nutrients?.vitaminB5 || 0), 0);
  const vitaminB9Total = foods.reduce((sum, food) => sum + (food.nutrients?.vitaminB9 || 0), 0);
  const chromiumTotal = foods.reduce((sum, food) => sum + (food.nutrients?.chromium || 0), 0);
  const molybdenumTotal = foods.reduce((sum, food) => sum + (food.nutrients?.molybdenum || 0), 0);
  const fluorideTotal = foods.reduce((sum, food) => sum + (food.nutrients?.fluoride || 0), 0);
  const chlorideTotal = foods.reduce((sum, food) => sum + (food.nutrients?.chloride || 0), 0);
  const boronTotal = foods.reduce((sum, food) => sum + (food.nutrients?.boron || 0), 0);
  const nickelTotal = foods.reduce((sum, food) => sum + (food.nutrients?.nickel || 0), 0);
  const siliconTotal = foods.reduce((sum, food) => sum + (food.nutrients?.silicon || 0), 0);
  const vanadiumTotal = foods.reduce((sum, food) => sum + (food.nutrients?.vanadium || 0), 0);
  // 抗栄養素（植物性食品のみ）
  const phytatesTotal = foods.reduce((sum, food) => sum + (food.nutrients?.phytates || 0), 0);
  const polyphenolsTotal = foods.reduce((sum, food) => sum + (food.nutrients?.polyphenols || 0), 0);
  const flavonoidsTotal = foods.reduce((sum, food) => sum + (food.nutrients?.flavonoids || 0), 0);
  const anthocyaninsTotal = foods.reduce(
    (sum, food) => sum + (food.nutrients?.anthocyanins || 0),
    0
  );
  const oxalatesTotal = foods.reduce((sum, food) => sum + (food.nutrients?.oxalates || 0), 0);
  const lectinsTotal = foods.reduce((sum, food) => sum + (food.nutrients?.lectins || 0), 0);
  const saponinsTotal = foods.reduce((sum, food) => sum + (food.nutrients?.saponins || 0), 0);
  const goitrogensTotal = foods.reduce((sum, food) => sum + (food.nutrients?.goitrogens || 0), 0);
  const tanninsTotal = foods.reduce((sum, food) => sum + (food.nutrients?.tannins || 0), 0);
  const trypsinInhibitorsTotal = foods.reduce(
    (sum, food) => sum + (food.nutrients?.trypsinInhibitors || 0),
    0
  );
  const proteaseInhibitorsTotal = foods.reduce(
    (sum, food) => sum + (food.nutrients?.proteaseInhibitors || 0),
    0
  );
  const cyanogenicGlycosidesTotal = foods.reduce(
    (sum, food) => sum + (food.nutrients?.cyanogenicGlycosides || 0),
    0
  );
  const solanineTotal = foods.reduce((sum, food) => sum + (food.nutrients?.solanine || 0), 0);
  const chaconineTotal = foods.reduce((sum, food) => sum + (food.nutrients?.chaconine || 0), 0);
  // 植物性タンパク質・植物油（Avoid Zone用）
  const plantProteinTotal = foods
    .filter((food) => food.type === 'plant')
    .reduce((sum, food) => sum + (food.nutrients?.protein || 0), 0);
  const vegetableOilTotal = foods
    .filter((food) => food.type === 'plant')
    .reduce((sum, food) => sum + (food.nutrients?.fat || 0), 0);

  // 違反検出（カーニボア違反があるかどうか）
  const violationTypes: string[] = [];
  if (plantProteinTotal > 0 || fiberTotal > 0 || foods.some((food) => food.type === 'plant')) {
    violationTypes.push('plant_food');
  }
  if (netCarbs > 20) {
    // デフォルト: 20g以上で違反（設定可能）
    violationTypes.push('high_carbs');
  }
  const hasViolation = violationTypes.length > 0;

  return {
    netCarbs,
    effectiveVitC,
    vitCRequirement,
    effectiveVitK,
    effectiveIron,
    ironRequirement,
    effectiveZinc,
    fiberTotal,
    sodiumTotal,
    magnesiumTotal,
    effectiveProtein, // 後方互換性のため残す（動物性+植物性）
    animalEffectiveProtein, // 動物性タンパク質のみ（有効タンパク質）
    proteinTotal,
    proteinRequirement,
    fatTotal,
    effectiveFat, // Gemini提案: 有効脂質
    effectiveVitaminA, // Gemini提案: 有効ビタミンA
    effectiveCalcium, // Gemini提案: 有効カルシウム
    omegaRatio: omegaRatioData.ratio, // Gemini提案: オメガ6:3比率
    omegaRatioStatus: omegaRatioData.status, // Gemini提案: オメガ比率の状態
    inflammationScore: omegaRatioData.inflammationScore, // Gemini提案: 炎症スコア
    electrolyteBalance, // Gemini提案: 電解質バランス
    // 追加栄養素
    vitaminB12Total,
    vitaminB1Total,
    vitaminB2Total,
    vitaminB3Total,
    vitaminB6Total,
    vitaminETotal,
    calciumTotal,
    phosphorusTotal,
    seleniumTotal,
    copperTotal,
    manganeseTotal,
    // 脂溶性ビタミン（カーニボア重要）
    vitaminATotal,
    vitaminDTotal,
    vitaminK2Total,
    // その他
    cholineTotal,
    potassiumTotal,
    // オメガ3/6（カーニボア重要：炎症管理）
    omega3Total,
    omega6Total,
    // ヨウ素（カーニボア重要：甲状腺機能）
    iodineTotal,
    // 比率（カーニボア重要）
    calciumPhosphorusRatio,
    // グリシン:メチオニン比（カーニボア重要：長寿の視点）
    glycineTotal,
    methionineTotal,
    glycineMethionineRatio,
    // ビタミンB7（ビオチン）
    vitaminB7Total,
    biotinBlocked,
    // タウリン（カーニボア重要：内臓・魚・肉に豊富）
    taurineTotal,
    // その他のビタミン・ミネラル（余計なくらい大量に）
    vitaminB5Total,
    vitaminB9Total,
    chromiumTotal,
    molybdenumTotal,
    fluorideTotal,
    chlorideTotal,
    boronTotal,
    nickelTotal,
    siliconTotal,
    vanadiumTotal,
    // 抗栄養素（カーニボア重要：植物性食品の避けるべき理由）
    phytatesTotal,
    polyphenolsTotal,
    flavonoidsTotal,
    anthocyaninsTotal,
    oxalatesTotal,
    lectinsTotal,
    saponinsTotal,
    goitrogensTotal,
    tanninsTotal,
    trypsinInhibitorsTotal,
    proteaseInhibitorsTotal,
    cyanogenicGlycosidesTotal,
    solanineTotal,
    chaconineTotal,
    // 植物性タンパク質・植物油（Avoid Zone用）
    plantProteinTotal,
    vegetableOilTotal,
    // 違反検出
    hasViolation,
    violationTypes,
  };
}

/**
 * Check if fiber is above warning threshold
 */
export function isFiberAboveThreshold(fiberTotal: number): boolean {
  return fiberTotal > FIBER_WARNING_THRESHOLD;
}

/**
 * Check if sodium is below minimum threshold (Keto Flu risk)
 */
export function isSodiumBelowMinimum(sodiumTotal: number): boolean {
  return sodiumTotal < ELECTROLYTE_THRESHOLDS.sodium.minimum;
}

/**
 * Get sodium status message
 */
export function getSodiumStatus(sodiumTotal: number): {
  status: 'optimal' | 'low' | 'warning';
  message: string;
} {
  if (sodiumTotal < ELECTROLYTE_THRESHOLDS.sodium.minimum) {
    return {
      status: 'warning',
      message: 'Keto Flu / Headache risk: Sodium is below minimum threshold',
    };
  }
  if (sodiumTotal >= ELECTROLYTE_THRESHOLDS.sodium.optimal) {
    return {
      status: 'optimal',
      message: 'Sodium levels are optimal for carnivore/keto metabolism',
    };
  }
  return {
    status: 'low',
    message: 'Consider increasing sodium intake',
  };
}

/**
 * Calculate Omega 6:3 ratio and inflammation score
 * Gemini提案: 比率を計算し、炎症リスクを評価
 */
export function calculateOmegaRatio(
  omega6: number,
  omega3: number
): {
  ratio: number;
  status: 'excellent' | 'good' | 'warning' | 'danger';
  inflammationScore: number;
} {
  if (omega3 === 0) {
    return {
      ratio: 0,
      status: 'danger',
      inflammationScore: 100, // オメガ3がゼロは危険
    };
  }

  const ratio = omega6 / omega3;
  let status: 'excellent' | 'good' | 'warning' | 'danger';
  if (ratio < 2.0) {
    status = 'excellent';
  } else if (ratio < 4.0) {
    status = 'good';
  } else if (ratio < 10.0) {
    status = 'warning';
  } else {
    status = 'danger';
  }

  // Gemini提案: InflammationScore = (Omega6 / Omega3)
  const inflammationScore = ratio;

  return { ratio, status, inflammationScore };
}

/**
 * Calculate effective fat (considering omega-6 penalty)
 * Gemini提案: オメガ6過多の食品（豚、鶏、加工肉）は「代謝有効脂質」を20%減らす
 */
export function calculateEffectiveFat(foods: FoodItem[]): number {
  return foods.reduce((sum, food) => {
    const fat = food.nutrients?.fat || 0;
    const omega6 = food.nutrients?.omega6 || 0;
    const omega3 = food.nutrients?.omega3 || 0;

    // Gemini提案: オメガ6比率が高い食品は有効脂質を20%減らす
    // 判定: オメガ6がオメガ3の10倍以上の場合
    let effectiveFat = fat;
    if (omega3 > 0 && omega6 / omega3 > 10) {
      effectiveFat = fat * 0.8; // 20%減
    } else if (omega3 === 0 && omega6 > 0) {
      // オメガ3がゼロでオメガ6がある場合もペナルティ
      effectiveFat = fat * 0.8;
    }

    return sum + effectiveFat;
  }, 0);
}

/**
 * Check electrolyte balance (Na:Mg ratio)
 * Gemini提案: Na > 5000 && Mg < 300 の場合、警告を出す
 */
export function checkElectrolyteBalance(
  sodium: number,
  magnesium: number
): {
  isBalanced: boolean;
  warning?: string;
} {
  if (sodium > 5000 && magnesium < 300) {
    return {
      isBalanced: false,
      warning: '塩分に対してマグネシウムが足りません。むくみや頭痛のリスクがあります。',
    };
  }
  return { isBalanced: true };
}

/**
 * Calculate effective calcium absorption (considering Vitamin D)
 * Gemini提案: VitD < 1000IU の場合、Caの「有効吸収率」を50%に下げる
 */
export function calculateEffectiveCalcium(calcium: number, vitaminD: number): number {
  if (vitaminD < 1000) {
    return calcium * 0.5; // ビタミンD不足時は吸収率50%
  }
  return calcium; // ビタミンD充足時は100%
}
