/**
 * Primal Logic - Nutrient Display Settings
 *
 * 栄養素の表示/非表示を管理するユーティリティ
 * デフォルトは全部表示
 */

import { logError } from './errorHandler';

export type NutrientKey =
  // マクロ栄養素
  | 'protein'
  | 'fat'
  | 'carbs'
  | 'netCarbs'
  | 'fiber'
  // ミネラル
  | 'sodium'
  | 'magnesium'
  | 'potassium'
  | 'zinc'
  | 'iron'
  | 'calcium'
  | 'phosphorus'
  | 'selenium'
  | 'copper'
  | 'manganese'
  | 'iodine'
  | 'chromium'
  | 'molybdenum'
  | 'fluoride'
  | 'chloride'
  | 'boron'
  | 'nickel'
  | 'silicon'
  | 'vanadium'
  // 脂溶性ビタミン
  | 'vitaminA'
  | 'vitaminD'
  | 'vitaminK'
  | 'vitaminK2'
  | 'vitaminE'
  // 水溶性ビタミン
  | 'vitaminC'
  | 'vitaminB1'
  | 'vitaminB2'
  | 'vitaminB3'
  | 'vitaminB5'
  | 'vitaminB6'
  | 'vitaminB7'
  | 'vitaminB9'
  | 'vitaminB12'
  // その他
  | 'choline'
  | 'taurine'
  | 'omega3'
  | 'omega6'
  | 'omegaRatio'
  | 'vitaminB5'
  | 'vitaminB9'
  // 比率
  | 'calciumPhosphorusRatio'
  | 'glycineMethionineRatio'
  | 'pfRatio'
  // 抗栄養素（Avoid Zone）
  | 'phytates'
  | 'polyphenols'
  | 'flavonoids'
  | 'anthocyanins'
  | 'oxalates'
  | 'lectins'
  | 'saponins'
  | 'goitrogens'
  | 'tannins'
  | 'trypsinInhibitors'
  | 'proteaseInhibitors'
  | 'cyanogenicGlycosides'
  | 'solanine'
  | 'chaconine'
  // 植物性食品（Avoid Zone）
  | 'plantProtein'
  | 'vegetableOil';

export interface NutrientDisplayConfig {
  key: NutrientKey;
  label: string;
  unit: string;
  category:
    | 'macro'
    | 'mineral'
    | 'fatSolubleVitamin'
    | 'waterSolubleVitamin'
    | 'other'
    | 'ratio'
    | 'antiNutrient'
    | 'avoid';
  defaultVisible: boolean; // デフォルトは全部表示
}

/**
 * 全栄養素の表示設定（デフォルト全部表示）
 */
export const ALL_NUTRIENT_DISPLAY_CONFIGS: NutrientDisplayConfig[] = [
  // マクロ栄養素
  {
    key: 'protein',
    label: 'タンパク質（有効）',
    unit: 'g',
    category: 'macro',
    defaultVisible: true,
  },
  { key: 'fat', label: '脂質', unit: 'g', category: 'macro', defaultVisible: true },
  { key: 'carbs', label: '炭水化物', unit: 'g', category: 'macro', defaultVisible: true },
  { key: 'netCarbs', label: '正味炭水化物', unit: 'g', category: 'macro', defaultVisible: true },
  { key: 'fiber', label: '食物繊維', unit: 'g', category: 'macro', defaultVisible: true },

  // ミネラル
  { key: 'sodium', label: 'ナトリウム', unit: 'mg', category: 'mineral', defaultVisible: true },
  {
    key: 'magnesium',
    label: 'マグネシウム',
    unit: 'mg',
    category: 'mineral',
    defaultVisible: true,
  },
  { key: 'potassium', label: 'カリウム', unit: 'mg', category: 'mineral', defaultVisible: true },
  { key: 'zinc', label: '亜鉛（有効）', unit: 'mg', category: 'mineral', defaultVisible: true },
  { key: 'iron', label: '鉄分（有効）', unit: 'mg', category: 'mineral', defaultVisible: true },
  { key: 'calcium', label: 'カルシウム', unit: 'mg', category: 'mineral', defaultVisible: true },
  { key: 'phosphorus', label: 'リン', unit: 'mg', category: 'mineral', defaultVisible: true },
  { key: 'selenium', label: 'セレン', unit: 'μg', category: 'mineral', defaultVisible: true },
  { key: 'copper', label: '銅', unit: 'mg', category: 'mineral', defaultVisible: true },
  { key: 'manganese', label: 'マンガン', unit: 'mg', category: 'mineral', defaultVisible: true },
  { key: 'iodine', label: 'ヨウ素', unit: 'μg', category: 'mineral', defaultVisible: true },
  { key: 'chromium', label: 'クロム', unit: 'μg', category: 'mineral', defaultVisible: true },
  { key: 'molybdenum', label: 'モリブデン', unit: 'μg', category: 'mineral', defaultVisible: true },
  { key: 'fluoride', label: 'フッ素', unit: 'mg', category: 'mineral', defaultVisible: true },
  { key: 'chloride', label: '塩素', unit: 'mg', category: 'mineral', defaultVisible: true },
  { key: 'boron', label: 'ホウ素', unit: 'mg', category: 'mineral', defaultVisible: true },
  { key: 'nickel', label: 'ニッケル', unit: 'mg', category: 'mineral', defaultVisible: true },
  { key: 'silicon', label: 'ケイ素', unit: 'mg', category: 'mineral', defaultVisible: true },
  { key: 'vanadium', label: 'バナジウム', unit: 'μg', category: 'mineral', defaultVisible: true },

  // 脂溶性ビタミン
  {
    key: 'vitaminA',
    label: 'ビタミンA',
    unit: 'IU',
    category: 'fatSolubleVitamin',
    defaultVisible: true,
  },
  {
    key: 'vitaminD',
    label: 'ビタミンD',
    unit: 'IU',
    category: 'fatSolubleVitamin',
    defaultVisible: true,
  },
  {
    key: 'vitaminK',
    label: 'ビタミンK（有効）',
    unit: 'μg',
    category: 'fatSolubleVitamin',
    defaultVisible: true,
  },
  {
    key: 'vitaminK2',
    label: 'ビタミンK2',
    unit: 'μg',
    category: 'fatSolubleVitamin',
    defaultVisible: true,
  },
  {
    key: 'vitaminE',
    label: 'ビタミンE',
    unit: 'mg',
    category: 'fatSolubleVitamin',
    defaultVisible: true,
  },

  // 水溶性ビタミン
  {
    key: 'vitaminC',
    label: 'ビタミンC',
    unit: 'mg',
    category: 'waterSolubleVitamin',
    defaultVisible: true,
  },
  {
    key: 'vitaminB1',
    label: 'ビタミンB1',
    unit: 'mg',
    category: 'waterSolubleVitamin',
    defaultVisible: true,
  },
  {
    key: 'vitaminB2',
    label: 'ビタミンB2',
    unit: 'mg',
    category: 'waterSolubleVitamin',
    defaultVisible: true,
  },
  {
    key: 'vitaminB3',
    label: 'ビタミンB3',
    unit: 'mg',
    category: 'waterSolubleVitamin',
    defaultVisible: true,
  },
  {
    key: 'vitaminB6',
    label: 'ビタミンB6',
    unit: 'mg',
    category: 'waterSolubleVitamin',
    defaultVisible: true,
  },
  {
    key: 'vitaminB7',
    label: 'ビタミンB7（ビオチン）',
    unit: 'μg',
    category: 'waterSolubleVitamin',
    defaultVisible: true,
  },
  {
    key: 'vitaminB9',
    label: 'ビタミンB9（葉酸）',
    unit: 'μg',
    category: 'waterSolubleVitamin',
    defaultVisible: true,
  },
  {
    key: 'vitaminB12',
    label: 'ビタミンB12',
    unit: 'μg',
    category: 'waterSolubleVitamin',
    defaultVisible: true,
  },
  {
    key: 'vitaminB5',
    label: 'ビタミンB5（パントテン酸）',
    unit: 'mg',
    category: 'waterSolubleVitamin',
    defaultVisible: true,
  },

  // その他
  { key: 'choline', label: 'コリン', unit: 'mg', category: 'other', defaultVisible: true },
  { key: 'taurine', label: 'タウリン', unit: 'mg', category: 'other', defaultVisible: true },
  { key: 'omega3', label: 'オメガ3', unit: 'g', category: 'other', defaultVisible: true },
  { key: 'omega6', label: 'オメガ6', unit: 'g', category: 'other', defaultVisible: true },
  { key: 'omegaRatio', label: 'オメガ6:3比率', unit: '', category: 'other', defaultVisible: true },

  // 比率
  {
    key: 'calciumPhosphorusRatio',
    label: 'カルシウム:リン比率',
    unit: '',
    category: 'ratio',
    defaultVisible: true,
  },
  {
    key: 'glycineMethionineRatio',
    label: 'グリシン:メチオニン比率',
    unit: '',
    category: 'ratio',
    defaultVisible: true,
  },
  { key: 'pfRatio', label: 'P:F比率', unit: '', category: 'ratio', defaultVisible: true },

  // 抗栄養素（Avoid Zone）
  {
    key: 'phytates',
    label: 'フィチン酸',
    unit: 'mg',
    category: 'antiNutrient',
    defaultVisible: true,
  },
  {
    key: 'polyphenols',
    label: 'ポリフェノール',
    unit: 'mg',
    category: 'antiNutrient',
    defaultVisible: true,
  },
  {
    key: 'flavonoids',
    label: 'フラボノイド',
    unit: 'mg',
    category: 'antiNutrient',
    defaultVisible: true,
  },
  {
    key: 'anthocyanins',
    label: 'アントシアニン',
    unit: 'mg',
    category: 'antiNutrient',
    defaultVisible: true,
  },
  {
    key: 'oxalates',
    label: 'シュウ酸',
    unit: 'mg',
    category: 'antiNutrient',
    defaultVisible: true,
  },
  { key: 'lectins', label: 'レクチン', unit: 'mg', category: 'antiNutrient', defaultVisible: true },
  {
    key: 'saponins',
    label: 'サポニン',
    unit: 'mg',
    category: 'antiNutrient',
    defaultVisible: true,
  },
  {
    key: 'goitrogens',
    label: 'ゴイトロゲン',
    unit: 'mg',
    category: 'antiNutrient',
    defaultVisible: true,
  },
  { key: 'tannins', label: 'タンニン', unit: 'mg', category: 'antiNutrient', defaultVisible: true },
  {
    key: 'trypsinInhibitors',
    label: 'トリプシン阻害物質',
    unit: 'mg',
    category: 'antiNutrient',
    defaultVisible: true,
  },
  {
    key: 'proteaseInhibitors',
    label: 'プロテアーゼ阻害物質',
    unit: 'mg',
    category: 'antiNutrient',
    defaultVisible: true,
  },
  {
    key: 'cyanogenicGlycosides',
    label: 'シアノグリコシド',
    unit: 'mg',
    category: 'antiNutrient',
    defaultVisible: true,
  },
  {
    key: 'solanine',
    label: 'ソラニン',
    unit: 'mg',
    category: 'antiNutrient',
    defaultVisible: true,
  },
  {
    key: 'chaconine',
    label: 'チャコニン',
    unit: 'mg',
    category: 'antiNutrient',
    defaultVisible: true,
  },

  // 植物性食品（Avoid Zone）
  {
    key: 'plantProtein',
    label: '植物性タンパク質',
    unit: 'g',
    category: 'avoid',
    defaultVisible: true,
  },
  { key: 'vegetableOil', label: '植物油', unit: 'g', category: 'avoid', defaultVisible: true },
];

const STORAGE_KEY = 'primal_logic_nutrient_display_settings';

/**
 * 栄養素の表示設定を取得（デフォルトは全部表示）
 */
export function getNutrientDisplaySettings(): Record<NutrientKey, boolean> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // デフォルト値とマージ（新しい栄養素が追加された場合も対応）
      const defaults = {} as Record<NutrientKey, boolean>;
      ALL_NUTRIENT_DISPLAY_CONFIGS.forEach((config) => {
        defaults[config.key] = config.defaultVisible;
      });
      return { ...defaults, ...parsed };
    }
    // デフォルトは全部表示
    const defaults = {} as Record<NutrientKey, boolean>;
    ALL_NUTRIENT_DISPLAY_CONFIGS.forEach((config) => {
      defaults[config.key] = config.defaultVisible;
    });
    return defaults;
  } catch (error) {
    logError(error, { component: 'nutrientDisplaySettings', action: 'getNutrientDisplaySettings' });
    // エラー時もデフォルトは全部表示
    const defaults = {} as Record<NutrientKey, boolean>;
    ALL_NUTRIENT_DISPLAY_CONFIGS.forEach((config) => {
      defaults[config.key] = config.defaultVisible;
    });
    return defaults;
  }
}

/**
 * 栄養素の表示設定を保存
 */
export function saveNutrientDisplaySettings(settings: Record<NutrientKey, boolean>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    logError(error, {
      component: 'nutrientDisplaySettings',
      action: 'saveNutrientDisplaySettings',
    });
  }
}

/**
 * 特定の栄養素の表示/非表示を切り替え
 */
export function toggleNutrientVisibility(key: NutrientKey): void {
  const settings = getNutrientDisplaySettings();
  settings[key] = !settings[key];
  saveNutrientDisplaySettings(settings);
}

/**
 * カテゴリごとに表示/非表示を切り替え
 */
export function toggleCategoryVisibility(
  category: NutrientDisplayConfig['category'],
  visible: boolean
): void {
  const settings = getNutrientDisplaySettings();
  ALL_NUTRIENT_DISPLAY_CONFIGS.filter((config) => config.category === category).forEach(
    (config) => {
      settings[config.key] = visible;
    }
  );
  saveNutrientDisplaySettings(settings);
}

/**
 * 全ての栄養素を表示/非表示
 */
export function setAllNutrientsVisible(visible: boolean): void {
  const settings = {} as Record<NutrientKey, boolean>;
  ALL_NUTRIENT_DISPLAY_CONFIGS.forEach((config) => {
    settings[config.key] = visible;
  });
  saveNutrientDisplaySettings(settings);
}
