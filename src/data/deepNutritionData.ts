/**
 * CarnivOS - Deep Nutrition Data (Seed Data)
 *
 * カーニボアにとっての「Tier 1（最重要）」データ
 * APIを使用せず、ローカルのマスターデータとして保持
 */

export type NutritionTier = 'Tier 1' | 'Tier 2' | 'Tier 3';
export type AnimalType = 'beef' | 'pork' | 'chicken' | 'egg' | 'fish' | 'lamb' | 'duck' | 'game' | 'ruminant' | 'pork_poultry' | 'seafood' | 'eggs_fats' | 'organs';
export type PartLocation = 'rib' | 'belly' | 'leg' | 'internal' | 'body' | 'whole';

export interface DeepFoodItem {
  id: string;
  name_ja: string; // 日本語名
  part_location: PartLocation; // UI上の部位
  animal_type: AnimalType;

  // マクロ (100gあたり)
  protein: number;
  fat: number;
  carbs: number;

  // Primal Metrics (詳細データ)
  saturated_fat: number; // 重要なエネルギー源
  omega_6: number; // 低いほど良い
  zinc: number; // 亜鉛 (mg)
  vitamin_b12: number; // B12 (μg)

  // UI用メッセージ
  primal_verdict: string; // 一言コメント

  // 追加栄養素（既存システムとの互換性のため）
  hemeIron?: number;
  vitaminC?: number;
  vitaminK?: number;
  sodium?: number;
  magnesium?: number;
  potassium?: number;
  // 脂溶性ビタミン（カーニボア重要：牛脂・卵黄・レバー等）
  vitamin_a?: number; // IU
  vitamin_d?: number; // IU
  vitamin_k2?: number; // μg (MK-4)
  omega_3?: number; // g
  choline?: number; // mg
}

// 初期マスターデータ
export const MASTER_FOODS: DeepFoodItem[] = [
  {
    id: 'beef_ribeye',
    name_ja: '牛リブアイ (牧草牛想定)',
    part_location: 'rib',
    animal_type: 'beef',
    protein: 22.0,
    fat: 16.0,
    carbs: 0,
    saturated_fat: 7.5,
    omega_6: 0.4,
    zinc: 4.5,
    vitamin_b12: 2.8,
    primal_verdict: 'カーニボアの王様。脂質とタンパク質のバランスが神。',
    hemeIron: 2.3,
    vitaminC: 0,
    vitaminK: 1.1,
    sodium: 54,
    magnesium: 20,
    potassium: 250,
  },
  {
    id: 'beef_belly',
    name_ja: '牛バラ / ブリスケット',
    part_location: 'belly',
    animal_type: 'beef',
    protein: 14.0,
    fat: 35.0,
    carbs: 0.1,
    saturated_fat: 15.0,
    omega_6: 0.8,
    zinc: 3.2,
    vitamin_b12: 2.0,
    primal_verdict: '強力なエネルギー源。塩を多めに振ること。',
    hemeIron: 2.0,
    vitaminC: 0,
    vitaminK: 1.0,
    sodium: 50,
    magnesium: 15,
    potassium: 200,
  },
  {
    id: 'pork_belly',
    name_ja: '豚バラ (通常肥育)',
    part_location: 'belly',
    animal_type: 'pork',
    protein: 14.2,
    fat: 34.6,
    carbs: 0.1,
    saturated_fat: 11.0,
    omega_6: 3.5, // ※ここが高いのが豚の特徴
    zinc: 1.5,
    vitamin_b12: 0.6,
    primal_verdict: '美味しいがオメガ6が高め。食べ過ぎたら魚でバランスを。',
    hemeIron: 0.7,
    vitaminC: 0,
    vitaminK: 0,
    sodium: 50,
    magnesium: 15,
    potassium: 180,
  },
  {
    id: 'chicken_liver',
    name_ja: '鶏レバー',
    part_location: 'internal',
    animal_type: 'chicken',
    protein: 18.9,
    fat: 3.1,
    carbs: 0.6,
    saturated_fat: 1.0,
    omega_6: 0.5,
    zinc: 3.3,
    vitamin_b12: 44.4, // ※爆発的に高い
    primal_verdict: '天然のマルチビタミン。週に数回で十分。',
    hemeIron: 9.0,
    vitaminC: 13.0,
    vitaminK: 0,
    sodium: 69,
    magnesium: 18,
    potassium: 220,
    // レバーは脂溶性ビタミンの宝庫
    vitamin_a: 49678, // IU/100g（非常に高い）
    vitamin_d: 49, // IU/100g
    vitamin_k2: 0, // レバーにはK1はあるがK2は少ない
    omega_3: 0.1,
  },
  {
    id: 'salmon',
    name_ja: 'サーモン (アトランティック)',
    part_location: 'body',
    animal_type: 'fish',
    protein: 20.0,
    fat: 13.0,
    carbs: 0,
    saturated_fat: 3.1,
    omega_6: 0.1,
    zinc: 0.5,
    vitamin_b12: 3.2,
    primal_verdict: 'オメガ3の宝庫。豚肉を食べた日の調整役に最適。',
    hemeIron: 0.8,
    vitaminC: 0,
    vitaminK: 0.1,
    sodium: 44,
    magnesium: 30,
    potassium: 363,
  },
];

/**
 * 部位で食品を検索
 */
export function getFoodsByPart(animalType: AnimalType, partLocation: PartLocation): DeepFoodItem[] {
  return MASTER_FOODS.filter(
    (food) => food.animal_type === animalType && food.part_location === partLocation
  );
}

/**
 * 動物タイプで食品を検索
 */
export function getFoodsByAnimal(animalType: AnimalType): DeepFoodItem[] {
  return MASTER_FOODS.filter((food) => food.animal_type === animalType);
}

/**
 * IDで食品を取得
 */
export function getDeepFoodById(id: string): DeepFoodItem | undefined {
  return MASTER_FOODS.find((food) => food.id === id);
}
