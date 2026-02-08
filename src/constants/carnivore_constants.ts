/**
 * CarnivOS - Carnivore Diet Constants
 *
 * バイオアベイラビリティ係数と動的必要量の定義
 * 技術仕様書: @Primal_Logic_Technical_Spec.md 参照
 */

/**
 * Bioavailability Coefficients (吸収率デバフ)
 * 植物性栄養素に対して適用する係数
 */
export const BIOAVAILABILITY_COEFFICIENTS = {
  protein: {
    animal: 1.0,
    plant: 0.6,
  },
  iron: {
    heme: 1.0,
    nonHeme: 0.1, // Gemini提案: 植物性は0.1（植酸・シュウ酸による阻害）
  },
  vitaminA: {
    retinol: 1.0,
    carotenoids: 0.05, // Gemini提案: 0.05（Dr. Bart Kay理論。遺伝子により変換効率が0〜50%のため、カーニボアアプリでは0.05）
  },
  vitaminK: {
    mk4: 1.0,
    k1: 0.1,
  },
  zinc: {
    animal: 1.0,
    plant: 0.3, // Gemini提案: 0.3（植酸によるキレート）
  },
} as const;

/**
 * Dynamic Requirements (変動する必要量)
 * ユーザーの状態変数によってゴールラインを動かすロジック
 */
export const DYNAMIC_REQUIREMENTS = {
  vitaminC: {
    base: 10, // mg (カーニボアロジック: 糖質ゼロ環境下では最小必要量10mg。肉食のみでも1日約30mgを摂取可能なため、肉で十分足りる。RDA基準の90mgは不要)
    carbPenalty: 1.5, // Gemini提案: NetCarbs * 1.5 + 10（糖質20gなら必要量40mg）
    highCarbThreshold: 50, // Gemini提案: 50g以上で100mg
    highCarbRequirement: 100, // mg (when carbs > 50g)
  },
  sodium: {
    lowInsulin: 5000, // mg (keto/carnivore)
    highInsulin: 2500, // mg (standard)
  },
  iron: {
    // 性別による必要量の違い
    male: {
      base: 8, // mg/day
    },
    female: {
      base: 18, // mg/day (月経がある場合)
      postMenopause: 8, // mg/day (閉経後)
    },
  },
  magnesium: {
    highStress: 600, // mg
    normal: 400, // mg
  },
} as const;

/**
 * Fiber Logic (The "Irritant" Meter)
 */
export const FIBER_TARGET = 0; // g (optimal)
export const FIBER_WARNING_THRESHOLD = 15; // g

/**
 * Electrolyte Thresholds
 */
export const ELECTROLYTE_THRESHOLDS = {
  sodium: {
    minimum: 3000, // mg (below this: Keto Flu / Headache risk)
    optimal: 5000, // mg (carnivore/keto)
  },
} as const;

/**
 * Food Type Flags
 */
export const FOOD_FLAGS = {
  TRASH: 'trash',
  ANIMAL: 'animal',
  PLANT: 'plant',
  RUMINANT: 'ruminant',
  DAIRY: 'dairy',
} as const;

/**
 * Violation Types for Recovery Protocol
 */
export const VIOLATION_TYPES = {
  SUGAR_CARBS: 'sugar_carbs',
  SEED_OILS: 'seed_oils',
  ALCOHOL: 'alcohol',
  OXALATES: 'oxalates',
} as const;

/**
 * Metabolic Status
 */
export const METABOLIC_STATUS = {
  ADAPTED: 'adapted',
  TRANSITIONING: 'transitioning',
} as const;

/**
 * User Goals
 */
export const USER_GOALS = {
  HEALING: 'healing',
  PERFORMANCE: 'performance',
  WEIGHT_LOSS: 'weight_loss',
  AUTOIMMUNE_HEALING: 'autoimmune_healing',
} as const;

/**
 * Diet Modes
 */
export const DIET_MODES = {
  STRICT_CARNIVORE: 'strict_carnivore',
  KETOVORE: 'ketovore',
  LION_DIET: 'lion_diet',
} as const;
