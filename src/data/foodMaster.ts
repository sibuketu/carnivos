/**
 * Fuzzy Data Master - 栄養素の「幅」を持つマスターデータ
 *
 * 栄養素は「100~130g」のような幅（Range）として保持するが、
 * メイン画面では中央値のみシンプルに表示する。
 */

/**
 * 栄養素の幅（Fuzzy Data）
 */
export type FuzzyNutrient = {
  value: number; // UI表示用（中央値）
  min: number; // 最小値
  max: number; // 最大値
};

/**
 * 食品マスターデータの型
 */
export interface FoodMasterItem {
  id: string;
  name: string; // 英語名
  name_ja: string; // 日本語名
  name_fr?: string; // フランス語名（オプション）
  name_de?: string; // ドイツ語名（オプション）
  protein: FuzzyNutrient; // per 100g
  fat: FuzzyNutrient; // per 100g
  carbs: FuzzyNutrient; // per 100g
  default_unit: number; // デフォルトの量（g）
  // 追加栄養素（オプション）
  saturated_fat?: FuzzyNutrient;
  omega_6?: FuzzyNutrient;
  zinc?: FuzzyNutrient;
  vitamin_b12?: FuzzyNutrient;
  iron?: FuzzyNutrient;
  sodium?: FuzzyNutrient;
  magnesium?: FuzzyNutrient;
  potassium?: FuzzyNutrient; // mg
  // 脂溶性ビタミン（カーニボア重要）
  vitamin_a?: FuzzyNutrient; // IU
  vitamin_d?: FuzzyNutrient; // IU
  vitamin_k2?: FuzzyNutrient; // μg (MK-4)
  omega_3?: FuzzyNutrient; // g
  choline?: FuzzyNutrient; // mg
  vitamin_b7?: FuzzyNutrient; // μg (ビオチン)
  iodine?: FuzzyNutrient; // μg (ヨウ素)
  calcium?: FuzzyNutrient; // mg (カルシウム)
  phosphorus?: FuzzyNutrient; // mg (リン)
  glycine?: FuzzyNutrient; // g (グリシン、コラーゲン、皮、骨、軟骨由来)
  methionine?: FuzzyNutrient; // g (メチオニン、筋肉由来)
  // 食物繊維（Avoid Zone用）
  fiber?: FuzzyNutrient; // g (食物繊維)
  // 抗栄養素（植物性食品のみ、カーニボア重要）
  phytates?: FuzzyNutrient; // mg (フィチン酸)
  polyphenols?: FuzzyNutrient; // mg (ポリフェノール)
  flavonoids?: FuzzyNutrient; // mg (フラボノイド)
  oxalates?: FuzzyNutrient; // mg (シュウ酸)
  lectins?: FuzzyNutrient; // mg (レクチン)
  saponins?: FuzzyNutrient; // mg (サポニン)
  goitrogens?: FuzzyNutrient; // mg (ゴイトロゲン)
  tannins?: FuzzyNutrient; // mg (タンニン)
}

/**
 * 動物タイプごとの食品マスター
 */
export type FoodMaster = {
  beef: Record<string, FoodMasterItem>;
  pork: Record<string, FoodMasterItem>;
  chicken: Record<string, FoodMasterItem>;
  egg: Record<string, FoodMasterItem>;
  fish: Record<string, FoodMasterItem>;
  dairy: Record<string, FoodMasterItem>;
  fat: Record<string, FoodMasterItem>;
  plant?: Record<string, FoodMasterItem>; // 植物性食品（Avoid Zone用）
};

/**
 * 食品マスターデータ
 */
export const FOOD_MASTER: FoodMaster = {
  beef: {
    ribeye: {
      id: 'beef_ribeye',
      name: 'Ribeye Steak',
      name_ja: '牛リブアイ',
      name_fr: 'Entrecôte',
      name_de: 'Rippensteak',
      protein: { value: 20, min: 18, max: 22 }, // per 100g
      fat: { value: 22, min: 18, max: 28 },
      carbs: { value: 0, min: 0, max: 0.5 },
      default_unit: 300, // g
      saturated_fat: { value: 9, min: 7, max: 11 },
      omega_6: { value: 0.4, min: 0.2, max: 0.6 },
      zinc: { value: 4.5, min: 3.5, max: 5.5 },
      vitamin_b12: { value: 2.8, min: 2.0, max: 3.5 },
      iron: { value: 2.5, min: 2.0, max: 3.0 },
      sodium: { value: 50, min: 30, max: 70 },
      magnesium: { value: 20, min: 15, max: 25 },
      potassium: { value: 350, min: 300, max: 400 }, // mg/100g
      vitamin_a: { value: 0, min: 0, max: 0 }, // IU/100g（赤身肉には少ない）
      vitamin_d: { value: 0.1, min: 0.05, max: 0.2 }, // IU/100g（微量、USDAデータ）
      vitamin_k2: { value: 1.5, min: 1.0, max: 2.0 }, // μg/100g（脂肪分由来の微量値）
      omega_3: { value: 0.05, min: 0.03, max: 0.08 }, // g/100g（牧草牛はより高い）
      choline: { value: 80, min: 70, max: 90 }, // mg/100g
      // グリシン:メチオニン比（筋肉肉はメチオニンが多い）
      glycine: { value: 0.8, min: 0.7, max: 0.9 }, // g/100g（筋肉肉には少ない）
      methionine: { value: 0.5, min: 0.45, max: 0.55 }, // g/100g（筋肉肉には多い）
    },
    lamb_chops: {
      id: 'beef_lamb_chops',
      name: 'Lamb Chops',
      name_ja: 'ラムチョップ',
      protein: { value: 25, min: 23, max: 27 },
      fat: { value: 14, min: 10, max: 18 },
      carbs: { value: 0, min: 0, max: 0 },
      default_unit: 200,
      saturated_fat: { value: 6, min: 4, max: 8 },
      omega_6: { value: 0.8, min: 0.5, max: 1.1 },
      zinc: { value: 4.5, min: 3.5, max: 5.5 },
      vitamin_b12: { value: 2.6, min: 2.0, max: 3.2 },
      iron: { value: 1.7, min: 1.3, max: 2.1 },
      sodium: { value: 65, min: 50, max: 80 },
      magnesium: { value: 23, min: 19, max: 27 },
      potassium: { value: 310, min: 280, max: 340 },
      vitamin_a: { value: 0, min: 0, max: 0 },
      vitamin_d: { value: 0.1, min: 0, max: 0.2 },
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.15, min: 0.1, max: 0.2 },
      choline: { value: 70, min: 60, max: 80 },
    },
    short_ribs: {
      id: 'beef_short_ribs',
      name: 'Short Ribs',
      name_ja: 'ショートリブ',
      protein: { value: 15, min: 13, max: 17 },
      fat: { value: 25, min: 20, max: 30 },
      carbs: { value: 0, min: 0, max: 0 },
      default_unit: 300,
      saturated_fat: { value: 10, min: 8, max: 12 },
      omega_6: { value: 0.4, min: 0.2, max: 0.6 },
      zinc: { value: 5.5, min: 4.5, max: 6.5 },
      vitamin_b12: { value: 2.6, min: 2.0, max: 3.2 },
      iron: { value: 2.4, min: 2.0, max: 2.8 },
      sodium: { value: 50, min: 35, max: 65 },
      magnesium: { value: 17, min: 14, max: 20 },
      potassium: { value: 260, min: 230, max: 290 },
      vitamin_a: { value: 0, min: 0, max: 0 },
      vitamin_d: { value: 0, min: 0, max: 0 },
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.05, min: 0.03, max: 0.08 },
      choline: { value: 65, min: 55, max: 75 },
    },
    bison: {
      id: 'beef_bison',
      name: 'Bison / Venison',
      name_ja: 'バイソン / 鹿肉',
      protein: { value: 22, min: 20, max: 24 },
      fat: { value: 2.4, min: 1.5, max: 3.5 },
      carbs: { value: 0, min: 0, max: 0 },
      default_unit: 300,
      saturated_fat: { value: 1.0, min: 0.7, max: 1.5 },
      omega_6: { value: 0.15, min: 0.1, max: 0.2 },
      zinc: { value: 4.6, min: 3.8, max: 5.4 },
      vitamin_b12: { value: 2.8, min: 2.2, max: 3.4 },
      iron: { value: 3.4, min: 2.8, max: 4.0 },
      sodium: { value: 54, min: 40, max: 68 },
      magnesium: { value: 23, min: 19, max: 27 },
      potassium: { value: 350, min: 310, max: 390 },
      vitamin_a: { value: 0, min: 0, max: 0 },
      vitamin_d: { value: 0, min: 0, max: 0 },
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.08, min: 0.05, max: 0.12 },
      choline: { value: 85, min: 75, max: 95 },
    },
    heart: {
      id: 'beef_heart',
      name: 'Beef Heart',
      name_ja: '牛ハツ',
      protein: { value: 17, min: 15, max: 19 },
      fat: { value: 4, min: 3, max: 5 },
      carbs: { value: 0.1, min: 0, max: 0.3 },
      default_unit: 200,
      saturated_fat: { value: 1.4, min: 1.0, max: 1.8 },
      omega_6: { value: 0.3, min: 0.2, max: 0.4 },
      zinc: { value: 1.7, min: 1.3, max: 2.1 },
      vitamin_b12: { value: 8.6, min: 7.0, max: 10.0 },
      iron: { value: 4.3, min: 3.5, max: 5.1 },
      sodium: { value: 98, min: 80, max: 116 },
      magnesium: { value: 21, min: 18, max: 24 },
      potassium: { value: 287, min: 260, max: 315 },
      vitamin_a: { value: 0, min: 0, max: 0 },
      vitamin_d: { value: 0, min: 0, max: 0 },
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.05, min: 0.03, max: 0.08 },
      choline: { value: 190, min: 170, max: 210 },
    },
    tongue: {
      id: 'beef_tongue',
      name: 'Beef Tongue',
      name_ja: '牛タン',
      protein: { value: 16, min: 14, max: 18 },
      fat: { value: 16, min: 13, max: 19 },
      carbs: { value: 3, min: 2, max: 4 },
      default_unit: 200,
      saturated_fat: { value: 7, min: 5, max: 9 },
      omega_6: { value: 0.5, min: 0.3, max: 0.7 },
      zinc: { value: 2.9, min: 2.3, max: 3.5 },
      vitamin_b12: { value: 3.8, min: 3.0, max: 4.6 },
      iron: { value: 2.5, min: 2.0, max: 3.0 },
      sodium: { value: 69, min: 55, max: 83 },
      magnesium: { value: 16, min: 13, max: 19 },
      potassium: { value: 315, min: 280, max: 350 },
      vitamin_a: { value: 0, min: 0, max: 0 },
      vitamin_d: { value: 0, min: 0, max: 0 },
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.05, min: 0.03, max: 0.08 },
      choline: { value: 120, min: 100, max: 140 },
    },
    bone_marrow: {
      id: 'beef_bone_marrow',
      name: 'Bone Marrow',
      name_ja: '骨髄',
      protein: { value: 7, min: 5, max: 9 },
      fat: { value: 84, min: 80, max: 88 },
      carbs: { value: 0, min: 0, max: 0 },
      default_unit: 50,
      saturated_fat: { value: 35, min: 30, max: 40 },
      omega_6: { value: 0.5, min: 0.3, max: 0.7 },
      zinc: { value: 0.1, min: 0, max: 0.2 },
      vitamin_b12: { value: 0.1, min: 0, max: 0.2 },
      iron: { value: 0.3, min: 0.1, max: 0.5 },
      sodium: { value: 10, min: 5, max: 15 },
      magnesium: { value: 2, min: 1, max: 3 },
      potassium: { value: 7, min: 5, max: 10 },
      vitamin_a: { value: 0, min: 0, max: 0 },
      vitamin_d: { value: 0, min: 0, max: 0 },
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.1, min: 0.05, max: 0.15 },
      choline: { value: 10, min: 5, max: 15 },
    },
    beef_jerky: {
      id: 'beef_jerky',
      name: 'Beef Jerky / Biltong',
      name_ja: 'ビーフジャーキー',
      protein: { value: 33, min: 30, max: 36 },
      fat: { value: 3, min: 2, max: 5 },
      carbs: { value: 3, min: 1, max: 5 },
      default_unit: 50,
      zinc: { value: 5.0, min: 4.0, max: 6.0 },
      vitamin_b12: { value: 1.3, min: 1.0, max: 1.6 },
      iron: { value: 4.3, min: 3.5, max: 5.0 },
      sodium: { value: 2081, min: 1800, max: 2400 },
      magnesium: { value: 27, min: 22, max: 32 },
      potassium: { value: 370, min: 330, max: 410 },
    },
    pemmican: {
      id: 'beef_pemmican',
      name: 'Pemmican',
      name_ja: 'ペミカン',
      protein: { value: 20, min: 17, max: 23 },
      fat: { value: 55, min: 50, max: 60 },
      carbs: { value: 0, min: 0, max: 1 },
      default_unit: 50,
      zinc: { value: 3.0, min: 2.5, max: 3.5 },
      vitamin_b12: { value: 1.5, min: 1.0, max: 2.0 },
      iron: { value: 2.5, min: 2.0, max: 3.0 },
      sodium: { value: 500, min: 400, max: 600 },
      magnesium: { value: 15, min: 12, max: 18 },
      potassium: { value: 200, min: 170, max: 230 },
    },
    bone_broth: {
      id: 'beef_bone_broth',
      name: 'Bone Broth',
      name_ja: 'ボーンブロス',
      protein: { value: 5, min: 3, max: 7 },
      fat: { value: 0.5, min: 0.2, max: 1.0 },
      carbs: { value: 0, min: 0, max: 0.5 },
      default_unit: 250,
      sodium: { value: 400, min: 300, max: 500 },
      magnesium: { value: 5, min: 3, max: 7 },
      potassium: { value: 150, min: 120, max: 180 },
      glycine: { value: 1.2, min: 0.9, max: 1.5 },
      calcium: { value: 15, min: 10, max: 20 },
      phosphorus: { value: 30, min: 20, max: 40 },
    },
    sirloin: {
      id: 'beef_sirloin',
      name: 'Sirloin Steak',
      name_ja: '牛サーロイン',
      name_fr: 'Faux-filet',
      name_de: 'Rinderfilet',
      protein: { value: 22, min: 20, max: 24 },
      fat: { value: 12, min: 8, max: 16 },
      carbs: { value: 0, min: 0, max: 0.5 },
      default_unit: 300,
      saturated_fat: { value: 5, min: 3, max: 7 },
      omega_6: { value: 0.3, min: 0.2, max: 0.5 },
      zinc: { value: 4.0, min: 3.0, max: 5.0 },
      vitamin_b12: { value: 2.5, min: 2.0, max: 3.0 },
      iron: { value: 2.3, min: 2.0, max: 2.8 },
      sodium: { value: 45, min: 30, max: 60 },
      magnesium: { value: 22, min: 18, max: 26 },
      potassium: { value: 360, min: 320, max: 400 }, // mg/100g
      vitamin_a: { value: 0, min: 0, max: 0 },
      vitamin_d: { value: 0, min: 0, max: 0 },
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.05, min: 0.03, max: 0.08 },
      choline: { value: 85, min: 75, max: 95 }, // mg/100g
    },
    ground: {
      id: 'beef_ground',
      name: 'Ground Beef',
      name_ja: '牛ひき肉',
      name_fr: 'Bœuf haché',
      name_de: 'Rinderhackfleisch',
      protein: { value: 18, min: 16, max: 20 },
      fat: { value: 20, min: 15, max: 25 },
      carbs: { value: 0, min: 0, max: 0.5 },
      default_unit: 450, // 1 pound = 450g
      saturated_fat: { value: 8, min: 6, max: 10 },
      omega_6: { value: 0.5, min: 0.3, max: 0.7 },
      zinc: { value: 4.2, min: 3.5, max: 5.0 },
      vitamin_b12: { value: 2.2, min: 1.8, max: 2.6 },
      iron: { value: 2.0, min: 1.5, max: 2.5 },
      sodium: { value: 60, min: 40, max: 80 },
      magnesium: { value: 18, min: 15, max: 21 },
      potassium: { value: 340, min: 300, max: 380 }, // mg/100g
      vitamin_a: { value: 0, min: 0, max: 0 },
      vitamin_d: { value: 0.1, min: 0.05, max: 0.2 }, // IU/100g（微量、USDAデータ）
      vitamin_k2: { value: 1.5, min: 1.0, max: 2.0 }, // μg/100g（脂肪分由来の微量値）
      omega_3: { value: 0.05, min: 0.03, max: 0.08 },
      choline: { value: 75, min: 65, max: 85 }, // mg/100g
    },
    brisket: {
      id: 'beef_brisket',
      name: 'Brisket',
      name_ja: '牛バラ / ブリスケット',
      name_fr: 'Poitrine de bœuf',
      name_de: 'Rinderbrust',
      protein: { value: 14, min: 12, max: 16 },
      fat: { value: 35, min: 30, max: 40 },
      carbs: { value: 0.1, min: 0, max: 0.3 },
      default_unit: 300,
      saturated_fat: { value: 15, min: 12, max: 18 },
      omega_6: { value: 0.8, min: 0.5, max: 1.0 },
      zinc: { value: 3.2, min: 2.5, max: 4.0 },
      vitamin_b12: { value: 2.0, min: 1.5, max: 2.5 },
      iron: { value: 1.8, min: 1.5, max: 2.2 },
      sodium: { value: 55, min: 40, max: 70 },
      magnesium: { value: 15, min: 12, max: 18 },
      potassium: { value: 320, min: 280, max: 360 }, // mg/100g
      vitamin_a: { value: 0, min: 0, max: 0 },
      vitamin_d: { value: 0.1, min: 0.05, max: 0.2 }, // IU/100g（微量、USDAデータ）
      vitamin_k2: { value: 2.0, min: 1.5, max: 2.5 }, // μg/100g（脂肪分由来の微量値、バラはより高い）
      omega_3: { value: 0.05, min: 0.03, max: 0.08 },
      choline: { value: 70, min: 60, max: 80 }, // mg/100g
    },
    chuck: {
      id: 'beef_chuck',
      name: 'Chuck Roast',
      name_ja: '牛肩ロース',
      name_fr: 'Palette de bœuf',
      name_de: 'Rinderschulter',
      protein: { value: 19, min: 17, max: 21 },
      fat: { value: 16, min: 12, max: 20 },
      carbs: { value: 0, min: 0, max: 0.5 },
      default_unit: 300,
      saturated_fat: { value: 7, min: 5, max: 9 },
      omega_6: { value: 0.5, min: 0.3, max: 0.7 },
      zinc: { value: 3.8, min: 3.0, max: 4.5 },
      vitamin_b12: { value: 2.3, min: 1.8, max: 2.8 },
      iron: { value: 2.2, min: 1.8, max: 2.6 },
      sodium: { value: 50, min: 35, max: 65 },
      magnesium: { value: 19, min: 16, max: 22 },
      potassium: { value: 355, min: 320, max: 390 }, // mg/100g
      vitamin_a: { value: 0, min: 0, max: 0 },
      vitamin_d: { value: 0.1, min: 0.05, max: 0.2 }, // IU/100g（微量、USDAデータ）
      vitamin_k2: { value: 1.2, min: 0.8, max: 1.6 }, // μg/100g（脂肪分由来の微量値）
      omega_3: { value: 0.05, min: 0.03, max: 0.08 },
      choline: { value: 82, min: 72, max: 92 }, // mg/100g
    },
    liver: {
      id: 'beef_liver',
      name: 'Beef Liver',
      name_ja: '牛レバー',
      name_fr: 'Foie de bœuf',
      name_de: 'Rinderleber',
      protein: { value: 20, min: 18, max: 22 },
      fat: { value: 3.6, min: 2.5, max: 5.0 },
      carbs: { value: 3.9, min: 3.0, max: 5.0 },
      default_unit: 100, // レバーは少量
      saturated_fat: { value: 1.5, min: 1.0, max: 2.0 },
      omega_6: { value: 0.2, min: 0.1, max: 0.3 },
      zinc: { value: 4.0, min: 3.5, max: 4.5 },
      vitamin_b12: { value: 59.3, min: 50, max: 70 }, // 非常に高い
      iron: { value: 6.2, min: 5.0, max: 7.5 },
      sodium: { value: 70, min: 50, max: 90 },
      magnesium: { value: 18, min: 15, max: 21 },
      // レバーは脂溶性ビタミンの宝庫
      vitamin_a: { value: 49678, min: 45000, max: 55000 }, // IU/100g（非常に高い）
      vitamin_d: { value: 49, min: 40, max: 60 }, // IU/100g
      vitamin_k2: { value: 0, min: 0, max: 0 }, // レバーにはK1はあるがK2は少ない
      omega_3: { value: 0.1, min: 0.05, max: 0.15 },
      // レバーはCholineが非常に豊富
      choline: { value: 350, min: 320, max: 380 }, // mg/100g
    },
  },
  pork: {
    belly: {
      id: 'pork_belly',
      name: 'Pork Belly',
      name_ja: '豚バラ',
      name_fr: 'Poitrine de porc',
      name_de: 'Schweinebauch',
      protein: { value: 14.2, min: 12, max: 16 },
      fat: { value: 34.6, min: 30, max: 40 },
      carbs: { value: 0.1, min: 0, max: 0.3 },
      default_unit: 300,
      saturated_fat: { value: 11, min: 9, max: 13 },
      omega_6: { value: 3.5, min: 2.5, max: 4.5 }, // 高い
      zinc: { value: 1.5, min: 1.0, max: 2.0 },
      vitamin_b12: { value: 0.6, min: 0.4, max: 0.8 },
      iron: { value: 0.8, min: 0.5, max: 1.2 },
      sodium: { value: 50, min: 30, max: 70 },
      magnesium: { value: 15, min: 12, max: 18 },
      potassium: { value: 200, min: 180, max: 220 }, // mg/100g
      // 豚バラは脂溶性ビタミンを含む（ラード由来）
      vitamin_a: { value: 0, min: 0, max: 0 }, // 豚バラにはビタミンAはほとんど含まれない
      vitamin_d: { value: 2.5, min: 2.0, max: 3.0 }, // IU/100g（ラード由来の微量値）
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.2, min: 0.15, max: 0.25 },
      choline: { value: 60, min: 50, max: 70 }, // mg/100g
    },
    loin: {
      id: 'pork_loin',
      name: 'Pork Loin',
      name_ja: '豚ロース',
      name_fr: 'Longe de porc',
      name_de: 'Schweinelende',
      protein: { value: 22, min: 20, max: 24 },
      fat: { value: 10, min: 7, max: 13 },
      carbs: { value: 0, min: 0, max: 0.5 },
      default_unit: 300,
      saturated_fat: { value: 3.5, min: 2.5, max: 4.5 },
      omega_6: { value: 1.8, min: 1.2, max: 2.4 },
      zinc: { value: 2.0, min: 1.5, max: 2.5 },
      vitamin_b12: { value: 0.7, min: 0.5, max: 0.9 },
      iron: { value: 0.9, min: 0.7, max: 1.2 },
      sodium: { value: 55, min: 40, max: 70 },
      magnesium: { value: 20, min: 17, max: 23 },
      potassium: { value: 300, min: 270, max: 330 }, // mg/100g
      vitamin_a: { value: 0, min: 0, max: 0 },
      vitamin_d: { value: 0.5, min: 0.3, max: 0.7 }, // IU/100g（ラード由来の微量値）
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.1, min: 0.05, max: 0.15 },
      choline: { value: 75, min: 65, max: 85 }, // mg/100g
    },
    shoulder: {
      id: 'pork_shoulder',
      name: 'Pork Shoulder',
      name_ja: '豚肩ロース',
      name_fr: 'Épaule de porc',
      name_de: 'Schweineschulter',
      protein: { value: 18, min: 16, max: 20 },
      fat: { value: 20, min: 16, max: 24 },
      carbs: { value: 0, min: 0, max: 0.5 },
      default_unit: 300,
      saturated_fat: { value: 7, min: 5, max: 9 },
      omega_6: { value: 2.5, min: 1.8, max: 3.2 },
      zinc: { value: 1.8, min: 1.3, max: 2.3 },
      vitamin_b12: { value: 0.65, min: 0.5, max: 0.8 },
      iron: { value: 0.85, min: 0.6, max: 1.1 },
      sodium: { value: 52, min: 38, max: 66 },
      magnesium: { value: 18, min: 15, max: 21 },
      potassium: { value: 290, min: 260, max: 320 }, // mg/100g
      vitamin_a: { value: 0, min: 0, max: 0 },
      vitamin_d: { value: 0.6, min: 0.4, max: 0.8 }, // IU/100g（ラード由来の微量値）
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.1, min: 0.05, max: 0.15 },
      choline: { value: 70, min: 60, max: 80 }, // mg/100g
    },
    ribs: {
      id: 'pork_ribs',
      name: 'Pork Ribs',
      name_ja: '豚スペアリブ',
      name_fr: 'Côtes de porc',
      name_de: 'Schweinerippchen',
      protein: { value: 16, min: 14, max: 18 },
      fat: { value: 28, min: 24, max: 32 },
      carbs: { value: 0, min: 0, max: 0.5 },
      default_unit: 300,
      saturated_fat: { value: 9, min: 7, max: 11 },
      omega_6: { value: 3.0, min: 2.2, max: 3.8 },
      zinc: { value: 1.6, min: 1.2, max: 2.0 },
      vitamin_b12: { value: 0.6, min: 0.4, max: 0.8 },
      iron: { value: 0.8, min: 0.6, max: 1.0 },
      sodium: { value: 48, min: 35, max: 65 },
      magnesium: { value: 16, min: 13, max: 19 },
      potassium: { value: 275, min: 245, max: 305 }, // mg/100g
      vitamin_a: { value: 0, min: 0, max: 0 },
      vitamin_d: { value: 0.7, min: 0.5, max: 0.9 }, // IU/100g（ラード由来の微量値）
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.1, min: 0.05, max: 0.15 },
      choline: { value: 65, min: 55, max: 75 }, // mg/100g
    },
    liver: {
      id: 'pork_liver',
      name: 'Pork Liver',
      name_ja: '豚レバー',
      name_fr: 'Foie de porc',
      name_de: 'Schweineleber',
      protein: { value: 20, min: 18, max: 22 },
      fat: { value: 4.0, min: 3.0, max: 5.5 },
      carbs: { value: 3.0, min: 2.0, max: 4.0 },
      default_unit: 100,
      saturated_fat: { value: 1.5, min: 1.0, max: 2.0 },
      omega_6: { value: 0.5, min: 0.3, max: 0.7 },
      zinc: { value: 3.0, min: 2.5, max: 3.5 },
      vitamin_b12: { value: 26.0, min: 22, max: 30 },
      iron: { value: 15.0, min: 12, max: 18 }, // 非常に高い
      sodium: { value: 75, min: 55, max: 95 },
      magnesium: { value: 17, min: 14, max: 20 },
      potassium: { value: 230, min: 200, max: 260 }, // mg/100g
      // 豚レバーも脂溶性ビタミンが豊富（牛レバーよりやや低い）
      vitamin_a: { value: 32976, min: 30000, max: 36000 }, // IU/100g（非常に高い）
      vitamin_d: { value: 23, min: 20, max: 26 }, // IU/100g
      vitamin_k2: { value: 0, min: 0, max: 0 }, // レバーにはK1はあるがK2は少ない
      omega_3: { value: 0.15, min: 0.1, max: 0.2 },
      choline: { value: 320, min: 290, max: 350 }, // mg/100g（非常に高い）
    },
    bacon: {
      id: 'pork_bacon',
      name: 'Bacon (Sugar-Free)',
      name_ja: 'ベーコン（砂糖不使用）',
      protein: { value: 12, min: 10, max: 14 },
      fat: { value: 45, min: 40, max: 50 },
      carbs: { value: 0, min: 0, max: 0.5 },
      default_unit: 100,
      saturated_fat: { value: 15, min: 13, max: 17 },
      omega_6: { value: 3.5, min: 2.5, max: 4.5 },
      zinc: { value: 1.4, min: 1.0, max: 1.8 },
      vitamin_b12: { value: 0.5, min: 0.3, max: 0.7 },
      iron: { value: 0.5, min: 0.3, max: 0.7 },
      sodium: { value: 1200, min: 1000, max: 1400 },
      magnesium: { value: 12, min: 9, max: 15 },
      potassium: { value: 200, min: 170, max: 230 },
      vitamin_a: { value: 0, min: 0, max: 0 },
      vitamin_d: { value: 0, min: 0, max: 0 },
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.1, min: 0.05, max: 0.15 },
      choline: { value: 45, min: 35, max: 55 },
    },
    chops: {
      id: 'pork_chops',
      name: 'Pork Chops',
      name_ja: 'ポークチョップ',
      protein: { value: 21, min: 19, max: 23 },
      fat: { value: 10, min: 7, max: 13 },
      carbs: { value: 0, min: 0, max: 0 },
      default_unit: 200,
      saturated_fat: { value: 3.5, min: 2.5, max: 4.5 },
      omega_6: { value: 1.0, min: 0.7, max: 1.3 },
      zinc: { value: 1.8, min: 1.4, max: 2.2 },
      vitamin_b12: { value: 0.6, min: 0.4, max: 0.8 },
      iron: { value: 0.7, min: 0.5, max: 0.9 },
      sodium: { value: 50, min: 35, max: 65 },
      magnesium: { value: 25, min: 21, max: 29 },
      potassium: { value: 370, min: 330, max: 410 },
      vitamin_a: { value: 0, min: 0, max: 0 },
      vitamin_d: { value: 0.5, min: 0.3, max: 0.7 },
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.05, min: 0.03, max: 0.08 },
      choline: { value: 75, min: 65, max: 85 },
    },
    sausage: {
      id: 'pork_sausage',
      name: 'Sausage (Clean)',
      name_ja: 'ソーセージ（無添加）',
      protein: { value: 13, min: 11, max: 15 },
      fat: { value: 25, min: 22, max: 28 },
      carbs: { value: 1, min: 0, max: 2 },
      default_unit: 150,
      saturated_fat: { value: 9, min: 7, max: 11 },
      omega_6: { value: 2.5, min: 2.0, max: 3.0 },
      zinc: { value: 2.0, min: 1.6, max: 2.4 },
      vitamin_b12: { value: 0.8, min: 0.6, max: 1.0 },
      iron: { value: 1.0, min: 0.7, max: 1.3 },
      sodium: { value: 700, min: 600, max: 800 },
      magnesium: { value: 15, min: 12, max: 18 },
      potassium: { value: 250, min: 220, max: 280 },
      vitamin_a: { value: 0, min: 0, max: 0 },
      vitamin_d: { value: 0, min: 0, max: 0 },
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.05, min: 0.03, max: 0.08 },
      choline: { value: 50, min: 40, max: 60 },
    },
    pork_rinds: {
      id: 'pork_rinds',
      name: 'Pork Rinds',
      name_ja: 'ポークリンド',
      protein: { value: 61, min: 58, max: 64 },
      fat: { value: 31, min: 28, max: 34 },
      carbs: { value: 0, min: 0, max: 0 },
      default_unit: 50,
      saturated_fat: { value: 11, min: 9, max: 13 },
      omega_6: { value: 3.0, min: 2.5, max: 3.5 },
      zinc: { value: 1.5, min: 1.0, max: 2.0 },
      vitamin_b12: { value: 0.3, min: 0.2, max: 0.4 },
      iron: { value: 0.6, min: 0.4, max: 0.8 },
      sodium: { value: 700, min: 600, max: 800 },
      magnesium: { value: 5, min: 3, max: 7 },
      potassium: { value: 50, min: 35, max: 65 },
      glycine: { value: 11.0, min: 9.5, max: 12.5 },
      choline: { value: 20, min: 15, max: 25 },
    },
  },
  chicken: {
    breast: {
      id: 'chicken_breast',
      name: 'Chicken Breast',
      name_ja: '鶏胸肉',
      name_fr: 'Blanc de poulet',
      name_de: 'Hähnchenbrust',
      protein: { value: 31, min: 29, max: 33 },
      fat: { value: 3.6, min: 2.5, max: 5.0 },
      carbs: { value: 0, min: 0, max: 0.5 },
      default_unit: 200,
      saturated_fat: { value: 1.0, min: 0.7, max: 1.5 },
      omega_6: { value: 0.6, min: 0.4, max: 0.8 },
      zinc: { value: 0.9, min: 0.7, max: 1.2 },
      vitamin_b12: { value: 0.3, min: 0.2, max: 0.4 },
      iron: { value: 0.7, min: 0.5, max: 0.9 },
      sodium: { value: 70, min: 50, max: 90 },
      magnesium: { value: 28, min: 24, max: 32 },
      potassium: { value: 220, min: 200, max: 240 }, // mg/100g
      vitamin_a: { value: 0, min: 0, max: 0 },
      vitamin_d: { value: 0, min: 0, max: 0 },
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.05, min: 0.03, max: 0.08 },
      choline: { value: 65, min: 55, max: 75 }, // mg/100g
    },
    thigh: {
      id: 'chicken_thigh',
      name: 'Chicken Thigh',
      name_ja: '鶏もも肉',
      name_fr: 'Cuisse de poulet',
      name_de: 'Hähnchenschenkel',
      protein: { value: 20, min: 18, max: 22 },
      fat: { value: 15, min: 12, max: 18 },
      carbs: { value: 0, min: 0, max: 0.5 },
      default_unit: 200,
      saturated_fat: { value: 4.0, min: 3.0, max: 5.0 },
      omega_6: { value: 2.5, min: 2.0, max: 3.0 },
      zinc: { value: 1.5, min: 1.2, max: 1.8 },
      vitamin_b12: { value: 0.4, min: 0.3, max: 0.5 },
      iron: { value: 0.9, min: 0.7, max: 1.2 },
      sodium: { value: 75, min: 55, max: 95 },
      magnesium: { value: 20, min: 17, max: 23 },
      potassium: { value: 240, min: 210, max: 270 }, // mg/100g
      vitamin_a: { value: 0, min: 0, max: 0 },
      vitamin_d: { value: 0, min: 0, max: 0 },
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.05, min: 0.03, max: 0.08 },
      choline: { value: 70, min: 60, max: 80 }, // mg/100g
    },
    wing: {
      id: 'chicken_wing',
      name: 'Chicken Wing',
      name_ja: '鶏手羽',
      name_fr: 'Aile de poulet',
      name_de: 'Hähnchenflügel',
      protein: { value: 20, min: 18, max: 22 },
      fat: { value: 15, min: 12, max: 18 },
      carbs: { value: 0, min: 0, max: 0.5 },
      default_unit: 150,
      saturated_fat: { value: 4.0, min: 3.0, max: 5.0 },
      omega_6: { value: 2.5, min: 2.0, max: 3.0 },
      zinc: { value: 1.5, min: 1.2, max: 1.8 },
      vitamin_b12: { value: 0.4, min: 0.3, max: 0.5 },
      iron: { value: 0.9, min: 0.7, max: 1.2 },
      sodium: { value: 75, min: 55, max: 95 },
      magnesium: { value: 20, min: 17, max: 23 },
      potassium: { value: 240, min: 210, max: 270 }, // mg/100g
      vitamin_a: { value: 0, min: 0, max: 0 },
      vitamin_d: { value: 0, min: 0, max: 0 },
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.05, min: 0.03, max: 0.08 },
      choline: { value: 70, min: 60, max: 80 }, // mg/100g
    },
    liver: {
      id: 'chicken_liver',
      name: 'Chicken Liver',
      name_ja: '鶏レバー',
      name_fr: 'Foie de poulet',
      name_de: 'Hähnchenleber',
      protein: { value: 18.9, min: 17, max: 21 },
      fat: { value: 3.1, min: 2.0, max: 4.5 },
      carbs: { value: 0.6, min: 0.3, max: 1.0 },
      default_unit: 100,
      saturated_fat: { value: 1.0, min: 0.7, max: 1.5 },
      omega_6: { value: 0.5, min: 0.3, max: 0.7 },
      zinc: { value: 3.3, min: 2.8, max: 3.8 },
      vitamin_b12: { value: 44.4, min: 38, max: 50 }, // 非常に高い
      iron: { value: 9.0, min: 7.5, max: 11.0 },
      sodium: { value: 80, min: 60, max: 100 },
      magnesium: { value: 16, min: 13, max: 19 },
      // 鶏レバーも脂溶性ビタミンが豊富
      vitamin_a: { value: 32976, min: 30000, max: 36000 }, // IU/100g（非常に高い）
      vitamin_d: { value: 49, min: 40, max: 60 }, // IU/100g
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.1, min: 0.05, max: 0.15 },
      // 鶏レバーもCholineが豊富
      choline: { value: 290, min: 270, max: 310 }, // mg/100g
    },
    whole: {
      id: 'chicken_whole',
      name: 'Whole Chicken',
      name_ja: '鶏丸ごと',
      name_fr: 'Poulet entier',
      name_de: 'Ganzes Hähnchen',
      protein: { value: 20, min: 18, max: 22 },
      fat: { value: 12, min: 9, max: 15 },
      carbs: { value: 0, min: 0, max: 0.5 },
      default_unit: 1000, // 1kg
      saturated_fat: { value: 3.5, min: 2.5, max: 4.5 },
      omega_6: { value: 2.0, min: 1.5, max: 2.5 },
      zinc: { value: 1.2, min: 1.0, max: 1.5 },
      vitamin_b12: { value: 0.35, min: 0.25, max: 0.45 },
      iron: { value: 0.8, min: 0.6, max: 1.0 },
      sodium: { value: 72, min: 52, max: 92 },
      magnesium: { value: 19, min: 16, max: 22 },
      potassium: { value: 248, min: 220, max: 275 }, // mg/100g
      vitamin_a: { value: 0, min: 0, max: 0 },
      vitamin_d: { value: 0, min: 0, max: 0 },
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.05, min: 0.03, max: 0.08 },
      choline: { value: 68, min: 58, max: 78 }, // mg/100g
    },
    hearts: {
      id: 'chicken_hearts',
      name: 'Chicken Hearts',
      name_ja: '鶏ハツ',
      protein: { value: 15, min: 13, max: 17 },
      fat: { value: 9, min: 7, max: 11 },
      carbs: { value: 0.1, min: 0, max: 0.3 },
      default_unit: 150,
      saturated_fat: { value: 2.5, min: 2.0, max: 3.0 },
      omega_6: { value: 0.8, min: 0.6, max: 1.0 },
      zinc: { value: 6.6, min: 5.5, max: 7.7 },
      vitamin_b12: { value: 7.3, min: 6.0, max: 8.6 },
      iron: { value: 5.3, min: 4.5, max: 6.1 },
      sodium: { value: 74, min: 60, max: 88 },
      magnesium: { value: 15, min: 12, max: 18 },
      potassium: { value: 176, min: 155, max: 197 },
      vitamin_a: { value: 17, min: 10, max: 25 },
      vitamin_d: { value: 0, min: 0, max: 0 },
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.05, min: 0.03, max: 0.08 },
      choline: { value: 130, min: 110, max: 150 },
    },
  },
  egg: {
    whole: {
      id: 'egg_whole',
      name: 'Whole Egg',
      name_ja: '卵（全卵）',
      name_fr: 'Œuf entier',
      name_de: 'Volles Ei',
      protein: { value: 12.5, min: 11, max: 14 },
      fat: { value: 10.0, min: 8, max: 12 },
      carbs: { value: 0.7, min: 0.5, max: 1.0 },
      default_unit: 50, // 1個 = 50g
      saturated_fat: { value: 3.1, min: 2.5, max: 3.7 },
      omega_6: { value: 1.2, min: 1.0, max: 1.5 },
      zinc: { value: 1.0, min: 0.8, max: 1.2 },
      vitamin_b12: { value: 0.9, min: 0.7, max: 1.1 },
      iron: { value: 1.5, min: 1.2, max: 1.8 },
      sodium: { value: 140, min: 120, max: 160 },
      magnesium: { value: 10, min: 8, max: 12 },
      potassium: { value: 138, min: 120, max: 155 }, // mg/100g
      // 卵は脂溶性ビタミンの宝庫（特に卵黄）
      vitamin_a: { value: 540, min: 480, max: 600 }, // IU/100g（卵黄由来）
      vitamin_d: { value: 87, min: 80, max: 95 }, // IU/100g（卵黄由来）
      vitamin_k2: { value: 5.4, min: 4.8, max: 6.0 }, // μg/100g（MK-4、卵黄由来）
      omega_3: { value: 0.2, min: 0.15, max: 0.25 }, // g（放牧卵はより高い）
      choline: { value: 251, min: 230, max: 270 }, // mg/100g（非常に高い）
      vitamin_b7: { value: 20, min: 18, max: 22 }, // μg/100g（ビオチン、卵黄に豊富）
    },
    yolk: {
      id: 'egg_yolk',
      name: 'Egg Yolk',
      name_ja: '卵黄',
      name_fr: "Jaune d'œuf",
      name_de: 'Eigelb',
      protein: { value: 16.0, min: 14, max: 18 },
      fat: { value: 26.5, min: 24, max: 29 },
      carbs: { value: 0.3, min: 0.2, max: 0.5 },
      default_unit: 17, // 1個の卵黄 = 17g
      saturated_fat: { value: 9.5, min: 8, max: 11 },
      omega_6: { value: 1.8, min: 1.5, max: 2.1 },
      zinc: { value: 2.3, min: 2.0, max: 2.6 },
      vitamin_b12: { value: 1.8, min: 1.5, max: 2.1 },
      iron: { value: 2.7, min: 2.3, max: 3.1 },
      sodium: { value: 8, min: 6, max: 10 },
      magnesium: { value: 5, min: 4, max: 6 },
      // 卵黄は脂溶性ビタミンの宝庫
      vitamin_a: { value: 1442, min: 1300, max: 1600 }, // IU/100g（非常に高い）
      vitamin_d: { value: 218, min: 200, max: 240 }, // IU/100g（非常に高い）
      vitamin_k2: { value: 15.5, min: 14, max: 17 }, // μg/100g（MK-4）
      omega_3: { value: 0.5, min: 0.4, max: 0.6 }, // g（放牧卵はより高い）
      // 卵黄はCholineが非常に豊富
      choline: { value: 680, min: 650, max: 710 }, // mg/100g（非常に高い）
      vitamin_b7: { value: 50, min: 45, max: 55 }, // μg/100g（ビオチン、卵黄に非常に豊富）
    },
    white: {
      id: 'egg_white',
      name: 'Egg White',
      name_ja: '卵白',
      name_fr: "Blanc d'œuf",
      name_de: 'Eiweiß',
      protein: { value: 10.9, min: 9.5, max: 12 },
      fat: { value: 0.2, min: 0.1, max: 0.3 },
      carbs: { value: 0.7, min: 0.5, max: 1.0 },
      default_unit: 33, // 1個の卵白 = 33g
      saturated_fat: { value: 0, min: 0, max: 0.1 },
      omega_6: { value: 0, min: 0, max: 0.1 },
      zinc: { value: 0.1, min: 0.05, max: 0.15 },
      vitamin_b12: { value: 0.1, min: 0.05, max: 0.15 },
      iron: { value: 0.1, min: 0.05, max: 0.15 },
      sodium: { value: 166, min: 150, max: 180 },
      magnesium: { value: 11, min: 9, max: 13 },
      potassium: { value: 163, min: 150, max: 175 }, // mg/100g
      vitamin_a: { value: 0, min: 0, max: 0 }, // 卵白にはビタミンAは含まれない
      vitamin_d: { value: 0, min: 0, max: 0 }, // 卵白にはビタミンDは含まれない
      vitamin_k2: { value: 0, min: 0, max: 0 }, // 卵白にはビタミンK2は含まれない
      omega_3: { value: 0, min: 0, max: 0 },
      choline: { value: 0.4, min: 0.3, max: 0.5 }, // mg/100g（非常に少ない）
      vitamin_b7: { value: 0, min: 0, max: 0 }, // μg/100g（卵白にはビオチンは含まれない、アビジンが含まれる）
    },
    duck: {
      id: 'egg_duck',
      name: 'Duck Eggs',
      name_ja: 'アヒルの卵',
      protein: { value: 13, min: 11, max: 15 },
      fat: { value: 14, min: 12, max: 16 },
      carbs: { value: 1, min: 0.5, max: 1.5 },
      default_unit: 70,
      saturated_fat: { value: 3.7, min: 3.2, max: 4.2 },
      omega_6: { value: 1.2, min: 1.0, max: 1.5 },
      zinc: { value: 1.4, min: 1.1, max: 1.7 },
      vitamin_b12: { value: 5.4, min: 4.5, max: 6.3 },
      iron: { value: 2.7, min: 2.2, max: 3.2 },
      sodium: { value: 146, min: 130, max: 162 },
      magnesium: { value: 17, min: 14, max: 20 },
      potassium: { value: 222, min: 200, max: 245 },
      vitamin_a: { value: 674, min: 600, max: 750 },
      vitamin_d: { value: 69, min: 60, max: 78 },
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.1, min: 0.07, max: 0.13 },
      choline: { value: 263, min: 240, max: 285 },
      vitamin_b7: { value: 25, min: 22, max: 28 },
    },
  },
  fish: {
    salmon: {
      id: 'fish_salmon',
      name: 'Salmon',
      name_ja: 'サーモン',
      name_fr: 'Saumon',
      name_de: 'Lachs',
      protein: { value: 20, min: 18, max: 22 },
      fat: { value: 12, min: 10, max: 14 },
      carbs: { value: 0, min: 0, max: 0.5 },
      default_unit: 200,
      saturated_fat: { value: 2.5, min: 2.0, max: 3.0 },
      omega_6: { value: 0.2, min: 0.1, max: 0.3 },
      zinc: { value: 0.5, min: 0.4, max: 0.6 },
      vitamin_b12: { value: 4.9, min: 4.0, max: 5.8 },
      iron: { value: 0.8, min: 0.6, max: 1.0 },
      sodium: { value: 44, min: 35, max: 55 },
      magnesium: { value: 27, min: 23, max: 31 },
      potassium: { value: 363, min: 330, max: 395 }, // mg/100g
      // サーモンはビタミンDが非常に豊富
      vitamin_a: { value: 58, min: 50, max: 65 }, // IU/100g（微量）
      vitamin_d: { value: 988, min: 900, max: 1100 }, // IU/100g（非常に高い）
      vitamin_k2: { value: 0.5, min: 0.3, max: 0.7 }, // μg/100g（微量）
      omega_3: { value: 2.3, min: 2.0, max: 2.6 }, // g（非常に高い）
      choline: { value: 75, min: 65, max: 85 }, // mg/100g
      iodine: { value: 35, min: 30, max: 40 }, // μg/100g（サーモンはヨウ素が豊富）
    },
    tuna: {
      id: 'fish_tuna',
      name: 'Tuna',
      name_ja: 'マグロ',
      name_fr: 'Thon',
      name_de: 'Thunfisch',
      protein: { value: 24, min: 22, max: 26 },
      fat: { value: 1.0, min: 0.5, max: 1.5 },
      carbs: { value: 0, min: 0, max: 0.5 },
      default_unit: 200,
      saturated_fat: { value: 0.3, min: 0.2, max: 0.4 },
      omega_6: { value: 0.1, min: 0.05, max: 0.15 },
      zinc: { value: 0.8, min: 0.6, max: 1.0 },
      vitamin_b12: { value: 9.0, min: 7.5, max: 10.5 },
      iron: { value: 1.0, min: 0.8, max: 1.2 },
      sodium: { value: 37, min: 30, max: 45 },
      magnesium: { value: 30, min: 25, max: 35 },
      potassium: { value: 323, min: 290, max: 355 }, // mg/100g
      vitamin_a: { value: 60, min: 50, max: 70 }, // IU/100g（微量）
      vitamin_d: { value: 227, min: 200, max: 250 }, // IU/100g（高い）
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.2, min: 0.15, max: 0.25 }, // g
      choline: { value: 65, min: 55, max: 75 }, // mg/100g
      iodine: { value: 50, min: 45, max: 55 }, // μg/100g（マグロはヨウ素が非常に豊富）
    },
    mackerel: {
      id: 'fish_mackerel',
      name: 'Mackerel',
      name_ja: 'サバ',
      name_fr: 'Maquereau',
      name_de: 'Makrele',
      protein: { value: 19, min: 17, max: 21 },
      fat: { value: 12.6, min: 11, max: 14 },
      carbs: { value: 0, min: 0, max: 0.5 },
      default_unit: 200,
      saturated_fat: { value: 3.3, min: 2.8, max: 3.8 },
      omega_6: { value: 0.2, min: 0.15, max: 0.25 },
      zinc: { value: 0.6, min: 0.5, max: 0.7 },
      vitamin_b12: { value: 8.7, min: 7.5, max: 10 },
      iron: { value: 1.6, min: 1.3, max: 1.9 },
      sodium: { value: 63, min: 50, max: 75 },
      magnesium: { value: 25, min: 21, max: 29 },
      potassium: { value: 314, min: 280, max: 350 }, // mg/100g
      vitamin_a: { value: 50, min: 40, max: 60 }, // IU/100g（微量）
      vitamin_d: { value: 360, min: 320, max: 400 }, // IU/100g（高い）
      vitamin_k2: { value: 0.1, min: 0, max: 0.2 }, // μg/100g（微量）
      omega_3: { value: 2.6, min: 2.3, max: 2.9 }, // g（非常に高い）
      choline: { value: 65, min: 55, max: 75 }, // mg/100g
      iodine: { value: 25, min: 20, max: 30 }, // μg/100g（サバはヨウ素が豊富）
    },
    sardines: {
      id: 'fish_sardines',
      name: 'Sardines (Canned)',
      name_ja: 'オイルサーディン（缶詰）',
      protein: { value: 25, min: 23, max: 27 },
      fat: { value: 11, min: 9, max: 13 },
      carbs: { value: 0, min: 0, max: 0 },
      default_unit: 125,
      saturated_fat: { value: 1.5, min: 1.2, max: 1.8 },
      omega_6: { value: 3.5, min: 3.0, max: 4.0 },
      zinc: { value: 1.3, min: 1.0, max: 1.6 },
      vitamin_b12: { value: 8.9, min: 7.5, max: 10.3 },
      iron: { value: 2.9, min: 2.4, max: 3.4 },
      sodium: { value: 505, min: 450, max: 560 },
      magnesium: { value: 39, min: 33, max: 45 },
      potassium: { value: 397, min: 360, max: 435 },
      vitamin_a: { value: 32, min: 25, max: 40 },
      vitamin_d: { value: 272, min: 240, max: 300 },
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 1.5, min: 1.2, max: 1.8 },
      choline: { value: 75, min: 65, max: 85 },
      calcium: { value: 382, min: 350, max: 415 },
      iodine: { value: 35, min: 30, max: 40 },
    },
    shrimp: {
      id: 'fish_shrimp',
      name: 'Shrimp',
      name_ja: 'エビ',
      protein: { value: 24, min: 22, max: 26 },
      fat: { value: 0.3, min: 0.1, max: 0.5 },
      carbs: { value: 0.2, min: 0, max: 0.5 },
      default_unit: 150,
      saturated_fat: { value: 0.06, min: 0.03, max: 0.1 },
      omega_6: { value: 0.02, min: 0.01, max: 0.03 },
      zinc: { value: 1.6, min: 1.3, max: 1.9 },
      vitamin_b12: { value: 1.1, min: 0.9, max: 1.3 },
      iron: { value: 2.4, min: 2.0, max: 2.8 },
      sodium: { value: 566, min: 500, max: 630 },
      magnesium: { value: 37, min: 32, max: 42 },
      potassium: { value: 264, min: 235, max: 293 },
      vitamin_a: { value: 0, min: 0, max: 0 },
      vitamin_d: { value: 0, min: 0, max: 0 },
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.5, min: 0.4, max: 0.6 },
      choline: { value: 80, min: 70, max: 90 },
      iodine: { value: 35, min: 30, max: 40 },
    },
    oysters: {
      id: 'fish_oysters',
      name: 'Oysters',
      name_ja: '牡蠣',
      protein: { value: 9, min: 7, max: 11 },
      fat: { value: 2, min: 1, max: 3 },
      carbs: { value: 5, min: 3, max: 7 },
      default_unit: 100,
      saturated_fat: { value: 0.5, min: 0.3, max: 0.7 },
      omega_6: { value: 0.03, min: 0.02, max: 0.05 },
      zinc: { value: 78.6, min: 70, max: 87 },
      vitamin_b12: { value: 16.0, min: 14.0, max: 18.0 },
      iron: { value: 5.1, min: 4.3, max: 5.9 },
      sodium: { value: 106, min: 90, max: 122 },
      magnesium: { value: 47, min: 40, max: 54 },
      potassium: { value: 168, min: 150, max: 186 },
      vitamin_a: { value: 81, min: 70, max: 92 },
      vitamin_d: { value: 320, min: 280, max: 360 },
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.7, min: 0.5, max: 0.9 },
      choline: { value: 65, min: 55, max: 75 },
      iodine: { value: 160, min: 140, max: 180 },
    },
    scallops: {
      id: 'fish_scallops',
      name: 'Scallops',
      name_ja: 'ホタテ',
      protein: { value: 17, min: 15, max: 19 },
      fat: { value: 0.5, min: 0.3, max: 0.7 },
      carbs: { value: 3, min: 2, max: 4 },
      default_unit: 150,
      saturated_fat: { value: 0.1, min: 0.05, max: 0.15 },
      omega_6: { value: 0.01, min: 0, max: 0.02 },
      zinc: { value: 1.0, min: 0.8, max: 1.2 },
      vitamin_b12: { value: 1.4, min: 1.1, max: 1.7 },
      iron: { value: 0.4, min: 0.3, max: 0.5 },
      sodium: { value: 392, min: 350, max: 435 },
      magnesium: { value: 22, min: 18, max: 26 },
      potassium: { value: 205, min: 185, max: 225 },
      vitamin_a: { value: 3, min: 1, max: 5 },
      vitamin_d: { value: 0, min: 0, max: 0 },
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.2, min: 0.15, max: 0.25 },
      choline: { value: 65, min: 55, max: 75 },
    },
    cod: {
      id: 'fish_cod',
      name: 'Cod / White Fish',
      name_ja: 'タラ / 白身魚',
      protein: { value: 18, min: 16, max: 20 },
      fat: { value: 0.7, min: 0.4, max: 1.0 },
      carbs: { value: 0, min: 0, max: 0 },
      default_unit: 200,
      saturated_fat: { value: 0.1, min: 0.05, max: 0.2 },
      omega_6: { value: 0.01, min: 0, max: 0.02 },
      zinc: { value: 0.4, min: 0.3, max: 0.5 },
      vitamin_b12: { value: 0.9, min: 0.7, max: 1.1 },
      iron: { value: 0.4, min: 0.3, max: 0.5 },
      sodium: { value: 54, min: 40, max: 68 },
      magnesium: { value: 32, min: 27, max: 37 },
      potassium: { value: 413, min: 380, max: 450 },
      vitamin_a: { value: 12, min: 8, max: 16 },
      vitamin_d: { value: 36, min: 30, max: 42 },
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.15, min: 0.1, max: 0.2 },
      choline: { value: 65, min: 55, max: 75 },
      iodine: { value: 170, min: 150, max: 190 },
    },
    salmon_roe: {
      id: 'fish_salmon_roe',
      name: 'Salmon Roe',
      name_ja: 'いくら',
      protein: { value: 29, min: 26, max: 32 },
      fat: { value: 14, min: 12, max: 16 },
      carbs: { value: 3, min: 2, max: 4 },
      default_unit: 50,
      saturated_fat: { value: 3.0, min: 2.5, max: 3.5 },
      omega_6: { value: 0.1, min: 0.05, max: 0.15 },
      zinc: { value: 0.9, min: 0.7, max: 1.1 },
      vitamin_b12: { value: 20.0, min: 17.0, max: 23.0 },
      iron: { value: 2.7, min: 2.2, max: 3.2 },
      sodium: { value: 1500, min: 1300, max: 1700 },
      magnesium: { value: 15, min: 12, max: 18 },
      potassium: { value: 181, min: 160, max: 200 },
      vitamin_a: { value: 271, min: 240, max: 300 },
      vitamin_d: { value: 232, min: 210, max: 255 },
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 3.5, min: 3.0, max: 4.0 },
      choline: { value: 335, min: 300, max: 370 },
    },
    cod_liver: {
      id: 'fish_cod_liver',
      name: 'Cod Liver (Canned)',
      name_ja: 'タラの肝（缶詰）',
      protein: { value: 4, min: 3, max: 5 },
      fat: { value: 66, min: 60, max: 72 },
      carbs: { value: 0, min: 0, max: 0 },
      default_unit: 30,
      saturated_fat: { value: 15, min: 13, max: 17 },
      omega_6: { value: 0.5, min: 0.3, max: 0.7 },
      zinc: { value: 0.5, min: 0.3, max: 0.7 },
      vitamin_b12: { value: 8.0, min: 6.5, max: 9.5 },
      iron: { value: 1.5, min: 1.0, max: 2.0 },
      sodium: { value: 600, min: 500, max: 700 },
      magnesium: { value: 5, min: 3, max: 7 },
      potassium: { value: 110, min: 90, max: 130 },
      vitamin_a: { value: 30000, min: 25000, max: 35000 },
      vitamin_d: { value: 10000, min: 8500, max: 11500 },
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 20.0, min: 18.0, max: 22.0 },
      choline: { value: 65, min: 55, max: 75 },
    },
  },
  dairy: {
    egg: {
      id: 'dairy_egg',
      name: 'Egg (Whole)',
      name_ja: '卵（全卵）',
      protein: { value: 12.3, min: 11.5, max: 13.0 },
      fat: { value: 10.6, min: 9.5, max: 11.5 },
      carbs: { value: 0.7, min: 0.5, max: 1.0 },
      default_unit: 50, // 1個 = 50g
      saturated_fat: { value: 3.3, min: 3.0, max: 3.6 },
      omega_6: { value: 1.4, min: 1.2, max: 1.6 },
      zinc: { value: 1.1, min: 0.9, max: 1.3 },
      vitamin_b12: { value: 0.9, min: 0.7, max: 1.1 },
      iron: { value: 1.8, min: 1.5, max: 2.1 },
      sodium: { value: 140, min: 130, max: 150 },
      magnesium: { value: 12, min: 10, max: 14 },
      // 卵（全卵）は脂溶性ビタミンが豊富
      vitamin_a: { value: 540, min: 480, max: 600 }, // IU/100g
      vitamin_d: { value: 87, min: 80, max: 95 }, // IU/100g
      vitamin_k2: { value: 31.4, min: 28, max: 35 }, // μg/100g（MK-4）
      omega_3: { value: 0.3, min: 0.2, max: 0.4 }, // g（放牧卵はより高い）
      // 卵はCholineが豊富
      choline: { value: 150, min: 140, max: 160 }, // mg/100g
      // カリウム
      potassium: { value: 138, min: 120, max: 155 }, // mg/100g
      // ビタミンB7（ビオチン）
      vitamin_b7: { value: 20, min: 18, max: 22 }, // μg/100g（ビオチン、卵黄に豊富）
      // ヨウ素
      iodine: { value: 25, min: 20, max: 30 }, // μg/100g（卵はヨウ素が豊富）
      // カルシウム、リン
      calcium: { value: 56, min: 50, max: 60 }, // mg/100g（卵はカルシウムが豊富）
      phosphorus: { value: 198, min: 180, max: 210 }, // mg/100g（卵はリンが豊富）
      // グリシン:メチオニン比（卵はバランスが良い）
      glycine: { value: 0.4, min: 0.35, max: 0.45 }, // g/100g
      methionine: { value: 0.4, min: 0.35, max: 0.45 }, // g/100g（卵は1:1に近い）
    },
    cheese: {
      id: 'dairy_cheese',
      name: 'Cheese',
      name_ja: 'チーズ',
      name_fr: 'Fromage',
      name_de: 'Käse',
      protein: { value: 25, min: 23, max: 27 },
      fat: { value: 33, min: 30, max: 36 },
      carbs: { value: 1, min: 0.5, max: 2 },
      default_unit: 100,
      saturated_fat: { value: 21, min: 19, max: 23 },
      omega_6: { value: 0.8, min: 0.6, max: 1.0 },
      zinc: { value: 3.1, min: 2.8, max: 3.5 },
      vitamin_b12: { value: 0.8, min: 0.6, max: 1.0 },
      iron: { value: 0.7, min: 0.5, max: 0.9 },
      sodium: { value: 650, min: 600, max: 700 },
      magnesium: { value: 25, min: 22, max: 28 },
      potassium: { value: 98, min: 85, max: 110 }, // mg/100g
      // チーズは脂溶性ビタミンを含む（特にビタミンK2）
      vitamin_a: { value: 1002, min: 900, max: 1100 }, // IU/100g（高い）
      vitamin_d: { value: 24, min: 20, max: 28 }, // IU/100g
      vitamin_k2: { value: 76, min: 70, max: 82 }, // μg/100g（MK-4、非常に高い）
      omega_3: { value: 0.1, min: 0.05, max: 0.15 },
      choline: { value: 15, min: 12, max: 18 }, // mg/100g
    },
    heavy_cream: {
      id: 'dairy_heavy_cream',
      name: 'Heavy Cream',
      name_ja: '生クリーム',
      name_fr: 'Crème épaisse',
      name_de: 'Schlagsahne',
      protein: { value: 2.8, min: 2.5, max: 3.0 },
      fat: { value: 37, min: 35, max: 40 },
      carbs: { value: 2.8, min: 2.5, max: 3.0 },
      default_unit: 100,
      saturated_fat: { value: 23, min: 21, max: 25 },
      omega_6: { value: 0.6, min: 0.5, max: 0.7 },
      zinc: { value: 0.2, min: 0.15, max: 0.25 },
      vitamin_b12: { value: 0.2, min: 0.15, max: 0.25 },
      iron: { value: 0.03, min: 0.02, max: 0.04 },
      sodium: { value: 27, min: 25, max: 30 },
      magnesium: { value: 7, min: 6, max: 8 },
      potassium: { value: 132, min: 120, max: 145 }, // mg/100g
      vitamin_a: { value: 1387, min: 1300, max: 1500 }, // IU/100g（高い）
      vitamin_d: { value: 7, min: 5, max: 9 }, // IU/100g（微量）
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.1, min: 0.05, max: 0.15 },
      choline: { value: 19, min: 17, max: 21 }, // mg/100g
    },
    butter: {
      id: 'dairy_butter',
      name: 'Butter',
      name_ja: 'バター',
      name_fr: 'Beurre',
      name_de: 'Butter',
      protein: { value: 0.9, min: 0.7, max: 1.1 },
      fat: { value: 81, min: 80, max: 82 },
      carbs: { value: 0.1, min: 0, max: 0.2 },
      default_unit: 100,
      saturated_fat: { value: 51, min: 50, max: 52 },
      omega_6: { value: 2.7, min: 2.5, max: 3.0 },
      zinc: { value: 0.1, min: 0.05, max: 0.15 },
      vitamin_b12: { value: 0.2, min: 0.15, max: 0.25 },
      iron: { value: 0.02, min: 0.01, max: 0.03 },
      sodium: { value: 11, min: 10, max: 12 },
      magnesium: { value: 2, min: 1.5, max: 2.5 },
      potassium: { value: 24, min: 20, max: 28 }, // mg/100g
      // バターは脂溶性ビタミンを含む
      vitamin_a: { value: 2499, min: 2300, max: 2700 }, // IU/100g（非常に高い）
      vitamin_d: { value: 60, min: 50, max: 70 }, // IU/100g
      vitamin_k2: { value: 15, min: 12, max: 18 }, // μg/100g（MK-4）
      omega_3: { value: 0.3, min: 0.2, max: 0.4 },
      choline: { value: 19, min: 17, max: 21 }, // mg/100g
    },
    cream_cheese: {
      id: 'dairy_cream_cheese',
      name: 'Cream Cheese',
      name_ja: 'クリームチーズ',
      protein: { value: 6, min: 5, max: 7 },
      fat: { value: 34, min: 31, max: 37 },
      carbs: { value: 4, min: 3, max: 5 },
      default_unit: 30,
      saturated_fat: { value: 19, min: 17, max: 21 },
      omega_6: { value: 0.8, min: 0.6, max: 1.0 },
      zinc: { value: 0.5, min: 0.4, max: 0.6 },
      vitamin_b12: { value: 0.2, min: 0.15, max: 0.25 },
      iron: { value: 0.4, min: 0.3, max: 0.5 },
      sodium: { value: 321, min: 290, max: 350 },
      magnesium: { value: 9, min: 7, max: 11 },
      potassium: { value: 138, min: 120, max: 155 },
      vitamin_a: { value: 1111, min: 1000, max: 1220 },
      vitamin_d: { value: 10, min: 8, max: 12 },
      vitamin_k2: { value: 3, min: 2, max: 4 },
      omega_3: { value: 0.1, min: 0.05, max: 0.15 },
      choline: { value: 15, min: 12, max: 18 },
      calcium: { value: 97, min: 85, max: 110 },
    },
  },
  fat: {
    tallow: {
      id: 'fat_tallow',
      name: 'Beef Tallow',
      name_ja: '牛脂',
      name_fr: 'Suif de bœuf',
      name_de: 'Rindertalg',
      protein: { value: 0, min: 0, max: 0 },
      fat: { value: 100, min: 99, max: 100 },
      carbs: { value: 0, min: 0, max: 0 },
      default_unit: 100,
      saturated_fat: { value: 50, min: 48, max: 52 },
      omega_6: { value: 0.5, min: 0.4, max: 0.6 },
      zinc: { value: 0, min: 0, max: 0 },
      vitamin_b12: { value: 0, min: 0, max: 0 },
      iron: { value: 0, min: 0, max: 0 },
      sodium: { value: 0, min: 0, max: 0 },
      magnesium: { value: 0, min: 0, max: 0 },
      // 牛脂は脂溶性ビタミンの宝庫（特にビタミンDが豊富）
      vitamin_a: { value: 0, min: 0, max: 0 }, // 牛脂自体には含まれないが、加熱時に溶出
      vitamin_d: { value: 101, min: 90, max: 112 }, // IU/100g（牧草牛の脂は特に高い）
      vitamin_k2: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.3, min: 0.2, max: 0.4 }, // g（牧草牛の脂にはオメガ3が含まれる）
    },
    ghee: {
      id: 'fat_ghee',
      name: 'Ghee',
      name_ja: 'ギー',
      name_fr: 'Ghee',
      name_de: 'Ghee',
      protein: { value: 0, min: 0, max: 0 },
      fat: { value: 100, min: 99, max: 100 },
      carbs: { value: 0, min: 0, max: 0 },
      default_unit: 100,
      saturated_fat: { value: 65, min: 63, max: 67 },
      omega_6: { value: 2.9, min: 2.7, max: 3.1 },
      zinc: { value: 0, min: 0, max: 0 },
      vitamin_b12: { value: 0, min: 0, max: 0 },
      iron: { value: 0, min: 0, max: 0 },
      sodium: { value: 0, min: 0, max: 0 },
      magnesium: { value: 0, min: 0, max: 0 },
      potassium: { value: 0, min: 0, max: 0 },
      // ギーはバターを精製したものなので、バターよりビタミン含有量は低い
      vitamin_a: { value: 3069, min: 2800, max: 3300 }, // IU/100g（高い、バターよりやや高い）
      vitamin_d: { value: 0, min: 0, max: 0 }, // ギーにはビタミンDは含まれない（精製過程で失われる）
      vitamin_k2: { value: 0, min: 0, max: 0 }, // ギーにはビタミンK2は含まれない
      omega_3: { value: 0.3, min: 0.2, max: 0.4 },
      choline: { value: 0, min: 0, max: 0 },
    },
    salt: {
      id: 'fat_salt',
      name: 'Salt',
      name_ja: '塩',
      name_fr: 'Sel',
      name_de: 'Salz',
      protein: { value: 0, min: 0, max: 0 },
      fat: { value: 0, min: 0, max: 0 },
      carbs: { value: 0, min: 0, max: 0 },
      default_unit: 5, // デフォルト5g
      saturated_fat: { value: 0, min: 0, max: 0 },
      omega_6: { value: 0, min: 0, max: 0 },
      zinc: { value: 0, min: 0, max: 0 },
      vitamin_b12: { value: 0, min: 0, max: 0 },
      iron: { value: 0, min: 0, max: 0 },
      sodium: { value: 38758, min: 38500, max: 39000 }, // 塩5g = 約1940mg Na
      magnesium: { value: 2, min: 1.5, max: 2.5 },
      // ぬちまーす（沖縄の塩）はヨウ素が豊富（通常の食塩より高い）
      iodine: { value: 200, min: 180, max: 220 }, // μg/100g（ぬちまーすは特に高い、通常の食塩は0-10μg/100g）
      potassium: { value: 0, min: 0, max: 0 },
    },
    bacon_grease: {
      id: 'fat_bacon_grease',
      name: 'Bacon Grease',
      name_ja: 'ベーコングリース',
      protein: { value: 0, min: 0, max: 0 },
      fat: { value: 100, min: 99, max: 100 },
      carbs: { value: 0, min: 0, max: 0 },
      default_unit: 15,
      saturated_fat: { value: 40, min: 38, max: 42 },
      omega_6: { value: 10.0, min: 8.5, max: 11.5 },
      zinc: { value: 0, min: 0, max: 0 },
      vitamin_b12: { value: 0, min: 0, max: 0 },
      iron: { value: 0, min: 0, max: 0 },
      sodium: { value: 0, min: 0, max: 0 },
      magnesium: { value: 0, min: 0, max: 0 },
      potassium: { value: 0, min: 0, max: 0 },
      omega_3: { value: 0.1, min: 0.05, max: 0.15 },
    },
    suet: {
      id: 'fat_suet',
      name: 'Suet / Tallow (Raw)',
      name_ja: 'スエット（生牛脂）',
      protein: { value: 1.5, min: 1.0, max: 2.0 },
      fat: { value: 94, min: 92, max: 96 },
      carbs: { value: 0, min: 0, max: 0 },
      default_unit: 30,
      saturated_fat: { value: 52, min: 50, max: 54 },
      omega_6: { value: 0.4, min: 0.3, max: 0.5 },
      zinc: { value: 0, min: 0, max: 0 },
      vitamin_b12: { value: 0, min: 0, max: 0 },
      iron: { value: 0, min: 0, max: 0 },
      sodium: { value: 0, min: 0, max: 0 },
      magnesium: { value: 0, min: 0, max: 0 },
      potassium: { value: 0, min: 0, max: 0 },
      vitamin_d: { value: 101, min: 90, max: 112 },
      omega_3: { value: 0.3, min: 0.2, max: 0.4 },
    },
  },
  plant: {
    // 植物性食品（Avoid Zone用、抗栄養素データ含む）
    soybean: {
      id: 'plant_soybean',
      name: 'Soybean',
      name_ja: '大豆',
      protein: { value: 35.0, min: 33.0, max: 37.0 },
      fat: { value: 19.9, min: 18.0, max: 21.8 },
      carbs: { value: 30.2, min: 28.0, max: 32.4 },
      default_unit: 100,
      fiber: { value: 15.7, min: 14.0, max: 17.4 },
      // 抗栄養素
      phytates: { value: 1500, min: 1200, max: 1800 }, // mg/100g（フィチン酸）
      lectins: { value: 200, min: 150, max: 250 }, // mg/100g（レクチン）
      saponins: { value: 500, min: 400, max: 600 }, // mg/100g（サポニン）
      oxalates: { value: 200, min: 150, max: 250 }, // mg/100g（シュウ酸）
    },
    tofu: {
      id: 'plant_tofu',
      name: 'Tofu',
      name_ja: '豆腐',
      protein: { value: 8.1, min: 7.5, max: 8.7 },
      fat: { value: 4.8, min: 4.2, max: 5.4 },
      carbs: { value: 1.9, min: 1.5, max: 2.3 },
      default_unit: 100,
      fiber: { value: 0.4, min: 0.2, max: 0.6 },
      // 抗栄養素（加工により減少）
      phytates: { value: 500, min: 300, max: 700 }, // mg/100g（フィチン酸、加工により減少）
      lectins: { value: 50, min: 30, max: 70 }, // mg/100g（レクチン、加工により減少）
      saponins: { value: 100, min: 50, max: 150 }, // mg/100g（サポニン、加工により減少）
    },
    spinach: {
      id: 'plant_spinach',
      name: 'Spinach',
      name_ja: 'ほうれん草',
      protein: { value: 2.9, min: 2.5, max: 3.3 },
      fat: { value: 0.4, min: 0.3, max: 0.5 },
      carbs: { value: 3.6, min: 3.0, max: 4.2 },
      default_unit: 100,
      fiber: { value: 2.2, min: 2.0, max: 2.4 },
      // 抗栄養素
      oxalates: { value: 970, min: 800, max: 1140 }, // mg/100g（シュウ酸、非常に高い）
      goitrogens: { value: 200, min: 150, max: 250 }, // mg/100g（ゴイトロゲン）
      tannins: { value: 50, min: 30, max: 70 }, // mg/100g（タンニン）
    },
    nuts: {
      id: 'plant_nuts',
      name: 'Nuts',
      name_ja: 'ナッツ類',
      protein: { value: 20.0, min: 18.0, max: 22.0 },
      fat: { value: 50.0, min: 45.0, max: 55.0 },
      carbs: { value: 20.0, min: 18.0, max: 22.0 },
      default_unit: 30,
      fiber: { value: 10.0, min: 8.0, max: 12.0 },
      // 抗栄養素
      phytates: { value: 2000, min: 1500, max: 2500 }, // mg/100g（フィチン酸、非常に高い）
      lectins: { value: 300, min: 200, max: 400 }, // mg/100g（レクチン）
      tannins: { value: 100, min: 50, max: 150 }, // mg/100g（タンニン）
    },
    grain: {
      id: 'plant_grain',
      name: 'Grain',
      name_ja: '穀物',
      protein: { value: 12.0, min: 10.0, max: 14.0 },
      fat: { value: 2.0, min: 1.5, max: 2.5 },
      carbs: { value: 72.0, min: 70.0, max: 74.0 },
      default_unit: 100,
      fiber: { value: 12.0, min: 10.0, max: 14.0 },
      // 抗栄養素
      phytates: { value: 3000, min: 2500, max: 3500 }, // mg/100g（フィチン酸、非常に高い）
      lectins: { value: 500, min: 400, max: 600 }, // mg/100g（レクチン、特に全粒穀物）
      saponins: { value: 200, min: 150, max: 250 }, // mg/100g（サポニン）
    },
  },
};

/**
 * 動物タイプと部位名から食品マスターデータを取得
 */
export function getFoodMasterItem(
  animal: 'beef' | 'pork' | 'chicken' | 'egg' | 'fish' | 'dairy' | 'fat' | 'plant',
  part: string
): FoodMasterItem | undefined {
  return FOOD_MASTER[animal]?.[part];
}

/**
 * 食品IDから食品マスターデータを取得
 */
export function getFoodMasterItemById(id: string): FoodMasterItem | undefined {
  for (const animal of Object.keys(FOOD_MASTER) as Array<keyof FoodMaster>) {
    const animalData = FOOD_MASTER[animal];
    if (!animalData) continue;
    for (const part of Object.keys(animalData)) {
      if (animalData[part]?.id === id) {
        return animalData[part];
      }
    }
  }
  return undefined;
}

/**
 * 動物タイプごとの部位リストを取得
 */
export function getPartsByAnimal(
  animal: 'beef' | 'pork' | 'chicken' | 'egg' | 'fish' | 'dairy' | 'fat' | 'plant'
): string[] {
  return Object.keys(FOOD_MASTER[animal] || {});
}

/**
 * 食品名（日本語・英語対応）から食品マスターデータを検索
 * 部分一致で検索し、最も一致度の高いものを返す
 *
 * 検索優先順位:
 * 1. 完全一致（英語名・日本語名）
 * 2. キーワードマッピング（日本語・英語）
 * 3. 部分一致（英語名・日本語名）
 * 4. 単語単位の部分一致（英語名・日本語名）
 */
export function searchFoodMasterByName(foodName: string): FoodMasterItem | undefined {
  const lowerName = foodName.toLowerCase().trim();
  if (lowerName.length === 0) return undefined;

  // キーワードマッピング（日本語・英語対応）
  const keywordMap: Record<string, { animal: keyof FoodMaster; part: string }> = {
    // 牛肉（日本語）
    リブアイ: { animal: 'beef', part: 'ribeye' },
    リブ: { animal: 'beef', part: 'ribeye' },
    サーロイン: { animal: 'beef', part: 'sirloin' },
    ステーキ: { animal: 'beef', part: 'ribeye' },
    牛: { animal: 'beef', part: 'ribeye' },
    牛肉: { animal: 'beef', part: 'ribeye' },
    ひき肉: { animal: 'beef', part: 'ground' },
    牛肉バラ: { animal: 'beef', part: 'brisket' },
    ブリスケット: { animal: 'beef', part: 'brisket' },
    牛肉肩ロース: { animal: 'beef', part: 'chuck' },
    レバー: { animal: 'beef', part: 'liver' },
    // 牛肉（英語）
    ribeye: { animal: 'beef', part: 'ribeye' },
    rib: { animal: 'beef', part: 'ribeye' },
    sirloin: { animal: 'beef', part: 'sirloin' },
    steak: { animal: 'beef', part: 'ribeye' },
    beef: { animal: 'beef', part: 'ribeye' },
    ground: { animal: 'beef', part: 'ground' },
    brisket: { animal: 'beef', part: 'brisket' },
    chuck: { animal: 'beef', part: 'chuck' },
    liver: { animal: 'beef', part: 'liver' },
    // 牛肉（フランス語）
    entrecôte: { animal: 'beef', part: 'ribeye' },
    bœuf: { animal: 'beef', part: 'ribeye' },
    foie: { animal: 'beef', part: 'liver' },
    // 牛肉（ドイツ語）
    rippensteak: { animal: 'beef', part: 'ribeye' },
    rindfleisch: { animal: 'beef', part: 'ribeye' },
    leber: { animal: 'beef', part: 'liver' },
    // 豚肉（日本語）
    豚バラ: { animal: 'pork', part: 'belly' },
    バラ: { animal: 'pork', part: 'belly' },
    豚: { animal: 'pork', part: 'belly' },
    豚肉: { animal: 'pork', part: 'belly' },
    ロース: { animal: 'pork', part: 'loin' },
    肩ロース: { animal: 'pork', part: 'shoulder' },
    スペアリブ: { animal: 'pork', part: 'ribs' },
    豚レバー: { animal: 'pork', part: 'liver' },
    // 豚肉（英語）
    pork: { animal: 'pork', part: 'belly' },
    belly: { animal: 'pork', part: 'belly' },
    loin: { animal: 'pork', part: 'loin' },
    shoulder: { animal: 'pork', part: 'shoulder' },
    ribs: { animal: 'pork', part: 'ribs' },
    // 豚肉（フランス語）
    porc: { animal: 'pork', part: 'belly' },
    ventre: { animal: 'pork', part: 'belly' },
    // 豚肉（ドイツ語）
    schweinefleisch: { animal: 'pork', part: 'belly' },
    bauch: { animal: 'pork', part: 'belly' },
    // 鶏肉（日本語）
    鶏もも: { animal: 'chicken', part: 'thigh' },
    もも: { animal: 'chicken', part: 'thigh' },
    鶏: { animal: 'chicken', part: 'thigh' },
    鶏肉: { animal: 'chicken', part: 'thigh' },
    胸肉: { animal: 'chicken', part: 'breast' },
    手羽: { animal: 'chicken', part: 'wing' },
    鶏レバー: { animal: 'chicken', part: 'liver' },
    丸ごと: { animal: 'chicken', part: 'whole' },
    // 鶏肉（英語）
    chicken: { animal: 'chicken', part: 'thigh' },
    thigh: { animal: 'chicken', part: 'thigh' },
    breast: { animal: 'chicken', part: 'breast' },
    wing: { animal: 'chicken', part: 'wing' },
    whole: { animal: 'chicken', part: 'whole' },
    // 鶏肉（フランス語）
    poulet: { animal: 'chicken', part: 'thigh' },
    cuisse: { animal: 'chicken', part: 'thigh' },
    blanc_poulet: { animal: 'chicken', part: 'breast' },
    // 鶏肉（ドイツ語）
    huhn: { animal: 'chicken', part: 'thigh' },
    hähnchen: { animal: 'chicken', part: 'thigh' },
    schenkel: { animal: 'chicken', part: 'thigh' },
    brust: { animal: 'chicken', part: 'breast' },
    // 魚（日本語）
    サーモン: { animal: 'fish', part: 'salmon' },
    サケ: { animal: 'fish', part: 'salmon' },
    マグロ: { animal: 'fish', part: 'tuna' },
    サバ: { animal: 'fish', part: 'mackerel' },
    // 魚（英語）
    salmon: { animal: 'fish', part: 'salmon' },
    tuna: { animal: 'fish', part: 'tuna' },
    mackerel: { animal: 'fish', part: 'mackerel' },
    fish: { animal: 'fish', part: 'salmon' },
    // 魚（フランス語）
    saumon: { animal: 'fish', part: 'salmon' },
    thon: { animal: 'fish', part: 'tuna' },
    maquereau: { animal: 'fish', part: 'mackerel' },
    poisson: { animal: 'fish', part: 'salmon' },
    // 魚（ドイツ語）
    lachs: { animal: 'fish', part: 'salmon' },
    thunfisch: { animal: 'fish', part: 'tuna' },
    makrele: { animal: 'fish', part: 'mackerel' },
    fisch: { animal: 'fish', part: 'salmon' },
    // 卵（日本語）
    卵: { animal: 'egg', part: 'whole' },
    たまご: { animal: 'egg', part: 'whole' },
    全卵: { animal: 'egg', part: 'whole' },
    卵黄: { animal: 'egg', part: 'yolk' },
    卵白: { animal: 'egg', part: 'white' },
    // 卵（英語）
    egg: { animal: 'egg', part: 'whole' },
    yolk: { animal: 'egg', part: 'yolk' },
    white: { animal: 'egg', part: 'white' },
    // 卵（フランス語）
    œuf: { animal: 'egg', part: 'whole' },
    oeuf: { animal: 'egg', part: 'whole' },
    jaune: { animal: 'egg', part: 'yolk' },
    blanc: { animal: 'egg', part: 'white' },
    // 卵（ドイツ語）
    ei: { animal: 'egg', part: 'whole' },
    eigelb: { animal: 'egg', part: 'yolk' },
    eiweiß: { animal: 'egg', part: 'white' },
    // 乳製品（日本語）
    チーズ: { animal: 'dairy', part: 'cheese' },
    生クリーム: { animal: 'dairy', part: 'heavy_cream' },
    バター: { animal: 'dairy', part: 'butter' },
    // 乳製品（英語）
    cheese: { animal: 'dairy', part: 'cheese' },
    cream: { animal: 'dairy', part: 'heavy_cream' },
    butter: { animal: 'dairy', part: 'butter' },
    // 乳製品（フランス語）
    fromage: { animal: 'dairy', part: 'cheese' },
    crème: { animal: 'dairy', part: 'heavy_cream' },
    beurre: { animal: 'dairy', part: 'butter' },
    // 乳製品（ドイツ語）
    käse: { animal: 'dairy', part: 'cheese' },
    sahne: { animal: 'dairy', part: 'heavy_cream' },
    // 脂質（日本語）
    牛脂: { animal: 'fat', part: 'tallow' },
    ギー: { animal: 'fat', part: 'ghee' },
    塩: { animal: 'fat', part: 'salt' },
    // 脂質（英語）
    tallow: { animal: 'fat', part: 'tallow' },
    ghee: { animal: 'fat', part: 'ghee' },
    salt: { animal: 'fat', part: 'salt' },
  };

  // 1. 完全一致検索（優先度最高）
  for (const animal of Object.keys(FOOD_MASTER) as Array<keyof FoodMaster>) {
    const animalData = FOOD_MASTER[animal];
    if (!animalData) continue;
    for (const part of Object.keys(animalData)) {
      const item = animalData[part];
      if (!item) continue;

      // 英語名・日本語名・フランス語名・ドイツ語名の完全一致
      if (
        item.name.toLowerCase() === lowerName ||
        item.name_ja.toLowerCase() === lowerName ||
        item.id.toLowerCase() === lowerName ||
        (item.name_fr && item.name_fr.toLowerCase() === lowerName) ||
        (item.name_de && item.name_de.toLowerCase() === lowerName)
      ) {
        return item;
      }
    }
  }

  // 2. キーワードマッピングで検索
  for (const [keyword, mapping] of Object.entries(keywordMap)) {
    if (lowerName.includes(keyword) || keyword.includes(lowerName)) {
      const item = getFoodMasterItem(mapping.animal, mapping.part);
      if (item) return item;
    }
  }

  // 3. 部分一致検索（英語名・日本語名）
  let bestMatch: FoodMasterItem | undefined;
  let bestScore = 0;

  for (const animal of Object.keys(FOOD_MASTER) as Array<keyof FoodMaster>) {
    const animalData = FOOD_MASTER[animal];
    if (!animalData) continue;
    for (const part of Object.keys(animalData)) {
      const item = animalData[part];
      if (!item) continue;

      const nameLower = item.name.toLowerCase();
      const nameJaLower = item.name_ja.toLowerCase();
      const nameFrLower = item.name_fr?.toLowerCase() || '';
      const nameDeLower = item.name_de?.toLowerCase() || '';
      const idLower = item.id.toLowerCase();

      // スコアリングシステム: 検索語と食品名の一致度を数値化し、最も一致度の高い食品を返す
      // スコアが高いほど、検索語と食品名の一致度が高いことを意味する
      let score = 0;

      // 完全一致（最高スコア: 100点）
      if (
        nameLower === lowerName ||
        nameJaLower === lowerName ||
        idLower === lowerName ||
        nameFrLower === lowerName ||
        nameDeLower === lowerName
      ) {
        score = 100;
      }
      // 前方一致（80点）
      else if (
        nameLower.startsWith(lowerName) ||
        nameJaLower.startsWith(lowerName) ||
        nameFrLower.startsWith(lowerName) ||
        nameDeLower.startsWith(lowerName)
      ) {
        score = 80;
      }
      // 後方一致（70点）
      else if (
        nameLower.endsWith(lowerName) ||
        nameJaLower.endsWith(lowerName) ||
        nameFrLower.endsWith(lowerName) ||
        nameDeLower.endsWith(lowerName)
      ) {
        score = 70;
      }
      // 部分一致（60点）
      else if (
        nameLower.includes(lowerName) ||
        nameJaLower.includes(lowerName) ||
        nameFrLower.includes(lowerName) ||
        nameDeLower.includes(lowerName)
      ) {
        score = 60;
      }
      // 逆方向の部分一致（検索語が食品名を含む、50点）
      else if (
        lowerName.includes(nameLower) ||
        lowerName.includes(nameJaLower) ||
        lowerName.includes(nameFrLower) ||
        lowerName.includes(nameDeLower)
      ) {
        score = 50;
      }
      // 単語単位の部分一致（30点/単語）
      else {
        const nameWords = nameLower.split(/[\s\-_]+/);
        const nameJaWords = nameJaLower.split(/[\s\-_]+/);
        const nameFrWords = nameFrLower.split(/[\s\-_]+/);
        const nameDeWords = nameDeLower.split(/[\s\-_]+/);
        const searchWords = lowerName.split(/[\s\-_]+/);

        for (const searchWord of searchWords) {
          if (nameWords.some((w) => w.includes(searchWord) || searchWord.includes(w))) {
            score += 30;
          }
          if (nameJaWords.some((w) => w.includes(searchWord) || searchWord.includes(w))) {
            score += 30;
          }
          if (nameFrWords.some((w) => w.includes(searchWord) || searchWord.includes(w))) {
            score += 30;
          }
          if (nameDeWords.some((w) => w.includes(searchWord) || searchWord.includes(w))) {
            score += 30;
          }
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    }
  }

  return bestMatch;
}

/**
 * 検索語に一致する食品をリストで返す（スコア順）
 */
export function searchFoodMasterItems(query: string): FoodMasterItem[] {
  if (!query) return [];

  const lowerName = query.toLowerCase().trim();
  const results: { item: FoodMasterItem; score: number }[] = [];

  for (const animal of Object.keys(FOOD_MASTER) as Array<keyof FoodMaster>) {
    const animalData = FOOD_MASTER[animal];
    if (!animalData) continue;
    for (const part of Object.keys(animalData)) {
      const item = animalData[part];
      if (!item) continue;

      const nameLower = item.name.toLowerCase();
      const nameJaLower = item.name_ja.toLowerCase();
      const nameFrLower = item.name_fr?.toLowerCase() || '';
      const nameDeLower = item.name_de?.toLowerCase() || '';
      const idLower = item.id.toLowerCase();

      let score = 0;

      // 完全一致（最高スコア: 100点）
      if (
        nameLower === lowerName ||
        nameJaLower === lowerName ||
        idLower === lowerName ||
        nameFrLower === lowerName ||
        nameDeLower === lowerName
      ) {
        score = 100;
      }
      // 前方一致（80点）
      else if (
        nameLower.startsWith(lowerName) ||
        nameJaLower.startsWith(lowerName) ||
        nameFrLower.startsWith(lowerName) ||
        nameDeLower.startsWith(lowerName)
      ) {
        score = 80;
      }
      // 後方一致（70点）
      else if (
        nameLower.endsWith(lowerName) ||
        nameJaLower.endsWith(lowerName) ||
        nameFrLower.endsWith(lowerName) ||
        nameDeLower.endsWith(lowerName)
      ) {
        score = 70;
      }
      // 部分一致（60点）
      else if (
        nameLower.includes(lowerName) ||
        nameJaLower.includes(lowerName) ||
        nameFrLower.includes(lowerName) ||
        nameDeLower.includes(lowerName)
      ) {
        score = 60;
      }
      // 単語単位の部分一致（30点/単語）
      else {
        const nameWords = nameLower.split(/[\s\-_]+/);
        const nameJaWords = nameJaLower.split(/[\s\-_]+/);
        const searchWords = lowerName.split(/[\s\-_]+/);

        for (const searchWord of searchWords) {
          if (nameWords.some((w) => w.includes(searchWord) || searchWord.includes(w))) {
            score += 30;
          }
          if (nameJaWords.some((w) => w.includes(searchWord) || searchWord.includes(w))) {
            score += 30;
          }
        }
      }

      if (score > 0) {
        results.push({ item, score });
      }
    }
  }

  // スコアの降順でソート
  return results.sort((a, b) => b.score - a.score).map((r) => r.item);
}
