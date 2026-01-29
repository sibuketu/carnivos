/**
 * Primal Logic - Foods Database
 *
 * 食品データベース: 栄養素データ、フラグ、バイオアベイラビリティ係数
 * 技術仕様書: @Primal_Logic_Technical_Spec.md 参照
 */

export interface FoodData {
  id: string;
  name: string;
  type: 'animal' | 'plant' | 'trash' | 'ruminant' | 'dairy';
  flags?: string[]; // e.g., ['high_oxalate', 'seed_oil', 'high_sugar']
  // 個数入力対応: 1個あたりの重量（g）。個数で入力する食品の場合に使用
  pieceWeight?: number; // g per piece
  // 推奨単位: この食品に適した入力単位
  preferredUnit?: 'g' | 'piece' | 'serving';
  nutrientsRaw: {
    protein?: number; // g per 100g
    fat?: number; // g per 100g
    carbs?: number; // g per 100g
    fiber?: number; // g per 100g
    hemeIron?: number; // mg per 100g
    nonHemeIron?: number; // mg per 100g
    vitaminA?: number; // μg per 100g (as retinol or carotenoids)
    vitaminC?: number; // mg per 100g
    vitaminK?: number; // μg per 100g (as K1 or MK-4)
    vitaminB1?: number; // mg per 100g (チアミン)
    vitaminB2?: number; // mg per 100g (リボフラビン)
    vitaminB3?: number; // mg per 100g (ナイアシン)
    vitaminB6?: number; // mg per 100g
    vitaminB12?: number; // μg per 100g (カーニボア重要)
    vitaminE?: number; // mg per 100g
    zinc?: number; // mg per 100g
    sodium?: number; // mg per 100g
    magnesium?: number; // mg per 100g
    calcium?: number; // mg per 100g
    phosphorus?: number; // mg per 100g (リン)
    selenium?: number; // μg per 100g (セレン)
    copper?: number; // mg per 100g (銅)
    manganese?: number; // mg per 100g (マンガン)
    // 脂肪酸詳細（Tier 2）
    saturatedFat?: number; // g per 100g (飽和脂肪酸)
    omega3?: number; // g per 100g (オメガ3)
    omega6?: number; // g per 100g (オメガ6)
    // 電解質（Tier 2）
    potassium?: number; // mg per 100g (カリウム)
  };
  bioCoefficients?: {
    // Pre-calculated bioavailability adjustments
    protein?: number;
    iron?: number;
    vitaminA?: number;
    vitaminK?: number;
    zinc?: number;
  };
}

/**
 * Foods Database (Global Master)
 *
 * Note: This is a simplified version. In production, this would be stored
 * in Firestore/Supabase and fetched dynamically.
 */
export const FOODS_DATABASE: Record<string, FoodData> = {
  // Ruminant Meats
  beef_ribeye: {
    id: 'beef_ribeye',
    name: 'Beef Ribeye',
    type: 'ruminant',
    nutrientsRaw: {
      protein: 20,
      fat: 20,
      carbs: 0,
      fiber: 0,
      hemeIron: 2.3,
      vitaminA: 0, // Retinol
      vitaminC: 0,
      vitaminK: 1.1, // MK-4
      zinc: 4.3,
      sodium: 54,
      magnesium: 20,
    },
    bioCoefficients: {
      protein: 1.0,
      iron: 1.0,
      vitaminA: 1.0,
      vitaminK: 1.0,
      zinc: 1.0,
    },
  },
  beef_ground: {
    id: 'beef_ground',
    name: 'Ground Beef (80/20)',
    type: 'ruminant',
    nutrientsRaw: {
      protein: 20,
      fat: 20,
      carbs: 0,
      fiber: 0,
      hemeIron: 2.3,
      vitaminA: 0,
      vitaminC: 0,
      vitaminK: 1.1,
      zinc: 4.3,
      sodium: 75,
      magnesium: 18,
    },
    bioCoefficients: {
      protein: 1.0,
      iron: 1.0,
      vitaminA: 1.0,
      vitaminK: 1.0,
      zinc: 1.0,
    },
  },
  lamb_chop: {
    id: 'lamb_chop',
    name: 'Lamb Chop',
    type: 'ruminant',
    nutrientsRaw: {
      protein: 25,
      fat: 21,
      carbs: 0,
      fiber: 0,
      hemeIron: 1.8,
      vitaminA: 0,
      vitaminC: 0,
      vitaminK: 1.2,
      zinc: 4.5,
      sodium: 65,
      magnesium: 22,
    },
    bioCoefficients: {
      protein: 1.0,
      iron: 1.0,
      vitaminA: 1.0,
      vitaminK: 1.0,
      zinc: 1.0,
    },
  },

  // Other Animal Foods
  eggs: {
    id: 'eggs',
    name: 'Eggs (whole)',
    type: 'animal',
    pieceWeight: 50, // 1個 = 50g (Mサイズ)
    preferredUnit: 'piece',
    nutrientsRaw: {
      protein: 13,
      fat: 11,
      carbs: 1.1,
      fiber: 0,
      hemeIron: 1.8,
      vitaminA: 160, // Retinol
      vitaminC: 0,
      vitaminK: 0.3, // MK-4
      zinc: 1.1,
      sodium: 140,
      magnesium: 12,
    },
    bioCoefficients: {
      protein: 1.0,
      iron: 1.0,
      vitaminA: 1.0,
      vitaminK: 1.0,
      zinc: 1.0,
    },
  },
  salmon: {
    id: 'salmon',
    name: 'Salmon',
    type: 'animal',
    nutrientsRaw: {
      protein: 20,
      fat: 13,
      carbs: 0,
      fiber: 0,
      hemeIron: 0.8,
      vitaminA: 12,
      vitaminC: 0,
      vitaminK: 0.1,
      zinc: 0.6,
      sodium: 44,
      magnesium: 30,
    },
    bioCoefficients: {
      protein: 1.0,
      iron: 1.0,
      vitaminA: 1.0,
      vitaminK: 1.0,
      zinc: 1.0,
    },
  },
  butter: {
    id: 'butter',
    name: 'Butter',
    type: 'dairy',
    nutrientsRaw: {
      protein: 0.9,
      fat: 81,
      carbs: 0.1,
      fiber: 0,
      hemeIron: 0,
      vitaminA: 684, // Retinol
      vitaminC: 0,
      vitaminK: 7.0, // MK-4
      zinc: 0.1,
      sodium: 11,
      magnesium: 2,
    },
    bioCoefficients: {
      protein: 1.0,
      iron: 1.0,
      vitaminA: 1.0,
      vitaminK: 1.0,
      zinc: 1.0,
    },
  },
  cheese_cheddar: {
    id: 'cheese_cheddar',
    name: 'Cheddar Cheese',
    type: 'dairy',
    nutrientsRaw: {
      protein: 25,
      fat: 33,
      carbs: 1.3,
      fiber: 0,
      hemeIron: 0.7,
      vitaminA: 265, // Retinol
      vitaminC: 0,
      vitaminK: 2.8, // MK-4
      zinc: 3.1,
      sodium: 621,
      magnesium: 27,
      calcium: 721,
    },
    bioCoefficients: {
      protein: 1.0,
      iron: 1.0,
      vitaminA: 1.0,
      vitaminK: 1.0,
      zinc: 1.0,
    },
  },

  // Plant Foods (with penalties)
  spinach: {
    id: 'spinach',
    name: 'Spinach (raw)',
    type: 'plant',
    flags: ['high_oxalate'],
    nutrientsRaw: {
      protein: 2.9,
      fat: 0.4,
      carbs: 3.6,
      fiber: 2.2,
      nonHemeIron: 2.7,
      vitaminA: 9377, // Carotenoids (beta-carotene)
      vitaminC: 28.1,
      vitaminK: 482.9, // K1
      zinc: 0.5,
      sodium: 79,
      magnesium: 79,
      calcium: 99,
    },
    bioCoefficients: {
      protein: 0.6,
      iron: 0.1,
      vitaminA: 0.03, // Poor conversion
      vitaminK: 0.1, // Poor conversion to MK-4
      zinc: 0.2,
    },
  },

  // Trash Foods
  tempura: {
    id: 'tempura',
    name: 'Tempura',
    type: 'trash',
    flags: ['seed_oil', 'high_carb'],
    nutrientsRaw: {
      protein: 6,
      fat: 18,
      carbs: 25,
      fiber: 1.5,
      nonHemeIron: 1.2,
      vitaminA: 0,
      vitaminC: 0,
      vitaminK: 0,
      zinc: 0.5,
      sodium: 400,
      magnesium: 15,
    },
    bioCoefficients: {
      protein: 0.6,
      iron: 0.1,
      vitaminA: 0,
      vitaminK: 0,
      zinc: 0.2,
    },
  },
  // Pork (部位別)
  pork_belly: {
    id: 'pork_belly',
    name: '豚バラ',
    type: 'animal',
    nutrientsRaw: {
      protein: 14,
      fat: 50,
      carbs: 0,
      fiber: 0,
      hemeIron: 0.8,
      vitaminA: 0,
      vitaminC: 0,
      vitaminK: 0,
      zinc: 1.9,
      sodium: 50,
      magnesium: 15,
    },
    bioCoefficients: {
      protein: 1.0,
      iron: 1.0,
      vitaminA: 1.0,
      vitaminK: 1.0,
      zinc: 1.0,
    },
  },
  pork_loin: {
    id: 'pork_loin',
    name: '豚ロース',
    type: 'animal',
    nutrientsRaw: {
      protein: 22,
      fat: 10,
      carbs: 0,
      fiber: 0,
      hemeIron: 0.9,
      vitaminA: 0,
      vitaminC: 0,
      vitaminK: 0,
      zinc: 2.2,
      sodium: 60,
      magnesium: 20,
    },
    bioCoefficients: {
      protein: 1.0,
      iron: 1.0,
      vitaminA: 1.0,
      vitaminK: 1.0,
      zinc: 1.0,
    },
  },
  pork_shoulder: {
    id: 'pork_shoulder',
    name: '豚肩ロース',
    type: 'animal',
    nutrientsRaw: {
      protein: 20,
      fat: 15,
      carbs: 0,
      fiber: 0,
      hemeIron: 0.9,
      vitaminA: 0,
      vitaminC: 0,
      vitaminK: 0,
      zinc: 2.1,
      sodium: 55,
      magnesium: 18,
    },
    bioCoefficients: {
      protein: 1.0,
      iron: 1.0,
      vitaminA: 1.0,
      vitaminK: 1.0,
      zinc: 1.0,
    },
  },
  pork_ribs: {
    id: 'pork_ribs',
    name: '豚スペアリブ',
    type: 'animal',
    nutrientsRaw: {
      protein: 18,
      fat: 25,
      carbs: 0,
      fiber: 0,
      hemeIron: 0.8,
      vitaminA: 0,
      vitaminC: 0,
      vitaminK: 0,
      zinc: 2.0,
      sodium: 70,
      magnesium: 16,
    },
    bioCoefficients: {
      protein: 1.0,
      iron: 1.0,
      vitaminA: 1.0,
      vitaminK: 1.0,
      zinc: 1.0,
    },
  },
  pork_ground: {
    id: 'pork_ground',
    name: '豚ひき肉',
    type: 'animal',
    nutrientsRaw: {
      protein: 16,
      fat: 30,
      carbs: 0,
      fiber: 0,
      hemeIron: 0.7,
      vitaminA: 0,
      vitaminC: 0,
      vitaminK: 0,
      zinc: 1.8,
      sodium: 65,
      magnesium: 14,
    },
    bioCoefficients: {
      protein: 1.0,
      iron: 1.0,
      vitaminA: 1.0,
      vitaminK: 1.0,
      zinc: 1.0,
    },
  },
  // Beef (部位別追加)
  beef_sirloin: {
    id: 'beef_sirloin',
    name: 'Beef Sirloin',
    type: 'ruminant',
    nutrientsRaw: {
      protein: 22,
      fat: 8,
      carbs: 0,
      fiber: 0,
      hemeIron: 2.5,
      vitaminA: 0,
      vitaminC: 0,
      vitaminK: 1.0,
      zinc: 4.5,
      sodium: 50,
      magnesium: 22,
    },
    bioCoefficients: {
      protein: 1.0,
      iron: 1.0,
      vitaminA: 1.0,
      vitaminK: 1.0,
      zinc: 1.0,
    },
  },
  beef_chuck: {
    id: 'beef_chuck',
    name: 'Beef Chuck',
    type: 'ruminant',
    nutrientsRaw: {
      protein: 19,
      fat: 15,
      carbs: 0,
      fiber: 0,
      hemeIron: 2.2,
      vitaminA: 0,
      vitaminC: 0,
      vitaminK: 1.0,
      zinc: 4.2,
      sodium: 60,
      magnesium: 20,
    },
    bioCoefficients: {
      protein: 1.0,
      iron: 1.0,
      vitaminA: 1.0,
      vitaminK: 1.0,
      zinc: 1.0,
    },
  },
  bread: {
    id: 'bread',
    name: 'Bread (white)',
    type: 'trash',
    flags: ['high_carb', 'wheat'],
    nutrientsRaw: {
      protein: 9,
      fat: 3.2,
      carbs: 49,
      fiber: 2.7,
      nonHemeIron: 3.6,
      vitaminA: 0,
      vitaminC: 0,
      vitaminK: 0.2, // K1
      zinc: 0.7,
      sodium: 681,
      magnesium: 22,
    },
    bioCoefficients: {
      protein: 0.6,
      iron: 0.1,
      vitaminA: 0,
      vitaminK: 0.1,
      zinc: 0.2,
    },
  },
  rice: {
    id: 'rice',
    name: 'Rice (white, cooked)',
    type: 'trash',
    flags: ['high_carb'],
    nutrientsRaw: {
      protein: 2.7,
      fat: 0.3,
      carbs: 28,
      fiber: 0.4,
      nonHemeIron: 0.8,
      vitaminA: 0,
      vitaminC: 0,
      vitaminK: 0,
      zinc: 0.6,
      sodium: 1,
      magnesium: 13,
    },
    bioCoefficients: {
      protein: 0.6,
      iron: 0.1,
      vitaminA: 0,
      vitaminK: 0,
      zinc: 0.2,
    },
  },

  // Organs (内臓肉 - Nose-to-Tail Superfoods)
  beef_liver: {
    id: 'beef_liver',
    name: '牛レバー',
    type: 'ruminant',
    flags: ['organ', 'high_vitamin_a'],
    nutrientsRaw: {
      protein: 20,
      fat: 3.6,
      carbs: 3.9,
      fiber: 0,
      hemeIron: 6.5, // 非常に高い
      vitaminA: 16898, // レチノール - 爆弾級
      vitaminC: 1.3,
      vitaminK: 3.1,
      vitaminB1: 0.2,
      vitaminB2: 3.4,
      vitaminB3: 17.5,
      vitaminB6: 1.0,
      vitaminB12: 59.3, // カーニボア重要 - 非常に高い
      vitaminE: 0.5,
      zinc: 4.0,
      sodium: 69,
      magnesium: 18,
      calcium: 5,
      phosphorus: 387,
      selenium: 39.7, // 高い
      copper: 14.6, // 非常に高い（レバーの特徴）
      manganese: 0.3,
    },
    bioCoefficients: {
      protein: 1.0,
      iron: 1.0,
      vitaminA: 1.0,
      vitaminK: 1.0,
      zinc: 1.0,
    },
  },
  beef_heart: {
    id: 'beef_heart',
    name: '牛ハツ',
    type: 'ruminant',
    flags: ['organ', 'high_coq10'],
    nutrientsRaw: {
      protein: 17,
      fat: 3.9,
      carbs: 0.1,
      fiber: 0,
      hemeIron: 4.3,
      vitaminA: 0,
      vitaminC: 2.0,
      vitaminK: 0,
      vitaminB1: 0.3,
      vitaminB2: 0.7,
      vitaminB3: 7.3,
      vitaminB6: 0.3,
      vitaminB12: 10.2,
      vitaminE: 0.2,
      zinc: 2.3,
      sodium: 98,
      magnesium: 20,
      calcium: 5,
      phosphorus: 212,
      selenium: 21.8,
      copper: 0.4,
      manganese: 0.1,
    },
    bioCoefficients: {
      protein: 1.0,
      iron: 1.0,
      vitaminA: 1.0,
      vitaminK: 1.0,
      zinc: 1.0,
    },
  },
  beef_kidney: {
    id: 'beef_kidney',
    name: '牛腎臓',
    type: 'ruminant',
    flags: ['organ', 'high_selenium'],
    nutrientsRaw: {
      protein: 17,
      fat: 3.1,
      carbs: 0.3,
      fiber: 0,
      hemeIron: 4.6,
      vitaminA: 157,
      vitaminC: 9.4,
      vitaminK: 0,
      vitaminB1: 0.4,
      vitaminB2: 2.8,
      vitaminB3: 7.7,
      vitaminB6: 0.3,
      vitaminB12: 27.5,
      vitaminE: 0.2,
      zinc: 1.9,
      sodium: 182,
      magnesium: 17,
      calcium: 13,
      phosphorus: 257,
      selenium: 141, // 非常に高い（腎臓の特徴）
      copper: 0.4,
      manganese: 0.1,
    },
    bioCoefficients: {
      protein: 1.0,
      iron: 1.0,
      vitaminA: 1.0,
      vitaminK: 1.0,
      zinc: 1.0,
    },
  },
  beef_spleen: {
    id: 'beef_spleen',
    name: '牛脾臓',
    type: 'ruminant',
    flags: ['organ', 'high_iron'],
    nutrientsRaw: {
      protein: 17,
      fat: 3.0,
      carbs: 0,
      fiber: 0,
      hemeIron: 44.6, // 爆弾級（脾臓の特徴）
      vitaminA: 0,
      vitaminC: 46.0, // 高い
      vitaminK: 0,
      vitaminB1: 0.1,
      vitaminB2: 0.3,
      vitaminB3: 4.6,
      vitaminB6: 0.1,
      vitaminB12: 4.5,
      vitaminE: 0.1,
      zinc: 2.7,
      sodium: 126,
      magnesium: 20,
      calcium: 10,
      phosphorus: 277,
      selenium: 28.4,
      copper: 0.2,
      manganese: 0.1,
    },
    bioCoefficients: {
      protein: 1.0,
      iron: 1.0,
      vitaminA: 1.0,
      vitaminK: 1.0,
      zinc: 1.0,
    },
  },
  beef_brain: {
    id: 'beef_brain',
    name: '牛脳',
    type: 'ruminant',
    flags: ['organ', 'high_dha'],
    nutrientsRaw: {
      protein: 10,
      fat: 10.3,
      carbs: 1.1,
      fiber: 0,
      hemeIron: 4.6,
      vitaminA: 0,
      vitaminC: 0,
      vitaminK: 0,
      vitaminB1: 0.1,
      vitaminB2: 0.2,
      vitaminB3: 4.2,
      vitaminB6: 0.1,
      vitaminB12: 10.1,
      vitaminE: 1.0,
      zinc: 1.1,
      sodium: 126,
      magnesium: 12,
      calcium: 12,
      phosphorus: 335,
      selenium: 21.1,
      copper: 0.2,
      manganese: 0.1,
    },
    bioCoefficients: {
      protein: 1.0,
      iron: 1.0,
      vitaminA: 1.0,
      vitaminK: 1.0,
      zinc: 1.0,
    },
  },
  beef_tallow: {
    id: 'beef_tallow',
    name: '牛脂（スエット）',
    type: 'ruminant',
    flags: ['fat', 'pure_fat'],
    nutrientsRaw: {
      protein: 0,
      fat: 100,
      carbs: 0,
      fiber: 0,
      hemeIron: 0,
      vitaminA: 0,
      vitaminC: 0,
      vitaminK: 0,
      vitaminB1: 0,
      vitaminB2: 0,
      vitaminB3: 0,
      vitaminB6: 0,
      vitaminB12: 0,
      vitaminE: 2.7,
      zinc: 0,
      sodium: 0,
      magnesium: 0,
      calcium: 0,
      phosphorus: 0,
      selenium: 0,
      copper: 0,
      manganese: 0,
    },
    bioCoefficients: {
      protein: 1.0,
      iron: 1.0,
      vitaminA: 1.0,
      vitaminK: 1.0,
      zinc: 1.0,
    },
  },
};

/**
 * Search foods by name (case-insensitive, partial match)
 * 日本語名にも対応（例: 「豚バラ」で検索可能）
 */
export function searchFoods(query: string): FoodData[] {
  const lowerQuery = query.toLowerCase().trim();
  if (lowerQuery.length === 0) return [];

  return Object.values(FOODS_DATABASE).filter((food) => {
    const foodName = food.name.toLowerCase();
    const foodId = food.id.toLowerCase();
    // 名前またはIDで部分一致検索
    return foodName.includes(lowerQuery) || foodId.includes(lowerQuery);
  });
}

/**
 * Get food by ID (case-insensitive)
 * 日本語名にも対応（例: 「豚バラ」で検索可能）
 */
export function getFoodById(id: string): FoodData | undefined {
  const lowerId = id.toLowerCase().trim();
  // 直接IDで検索
  if (FOODS_DATABASE[lowerId]) {
    return FOODS_DATABASE[lowerId];
  }
  // 名前で検索（日本語名対応）
  return Object.values(FOODS_DATABASE).find(
    (food) => food.name.toLowerCase() === lowerId || food.id.toLowerCase() === lowerId
  );
}

/**
 * Get foods by type
 */
export function getFoodsByType(type: FoodData['type']): FoodData[] {
  return Object.values(FOODS_DATABASE).filter((food) => food.type === type);
}

/**
 * Get foods with specific flags
 */
export function getFoodsByFlag(flag: string): FoodData[] {
  return Object.values(FOODS_DATABASE).filter((food) => food.flags && food.flags.includes(flag));
}

/**
 * Search foods by category (beef, pork, chicken, egg, fish)
 */
export function searchFoodsByCategory(
  category: 'beef' | 'pork' | 'chicken' | 'egg' | 'fish'
): FoodData[] {
  const categoryMap: Record<string, string[]> = {
    beef: ['beef', 'ruminant'],
    pork: ['pork', 'pig'],
    chicken: ['chicken', 'poultry'],
    egg: ['egg', 'eggs'],
    fish: ['fish', 'salmon', 'tuna', 'sardine'],
  };

  const keywords = categoryMap[category] || [];
  return Object.values(FOODS_DATABASE).filter((food) => {
    const foodId = food.id.toLowerCase();
    const foodName = food.name.toLowerCase();
    return keywords.some((keyword) => foodId.includes(keyword) || foodName.includes(keyword));
  });
}
