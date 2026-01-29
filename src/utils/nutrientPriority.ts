/**
 * CarnivoreOS - Nutrient Priority System
 *
 * 【暫定的なTier分類 - 要Discord/Reddit分析で検証】
 * 
 * 現在の根拠：カーニボア専門家の見解 + 科学的重要度
 * 検証待ち：Discord/Reddit分析による実際の質問頻度
 * 
 * Tier 1: 科学的重要度★★★★★（低インスリン状態で必須）
 * Tier 2: 科学的重要度★★★☆☆以上（個人差あり、一部根拠薄い）
 * Tier 3: その他全て（詳細データ確認用）
 */

import { logError } from './errorHandler';

/**
 * 栄養素の表示モード（debugモード削除：detailedと重複のため）
 * - simple: シンプルモード（電解質+脂質のみ）- カーニボア実践者向け
 * - standard: 標準モード（重要な栄養素10項目）- 初心者向け
 * - detailed: 詳細モード（全栄養素60項目以上）- データ重視ユーザー向け
 */
export type NutrientDisplayMode = 'simple' | 'standard' | 'detailed';

/**
 * 栄養素のTier分類（アプリ表示順）
 * 
 * 【暫定的】科学的重要度ベース、Discord/Reddit検証待ち
 */
export const NUTRIENT_TIERS = {
  /**
   * Tier 1: 常に表示（科学的重要度★★★★★）
   * 低インスリン状態で必須、カーニボア実践者の基本
   */
  tier1: [
    'fat',        // 脂質：主要エネルギー源（P:F比率 1:1.2-1.5推奨）
    'protein',    // タンパク質：必須アミノ酸供給、筋肉・臓器・ホルモン
    'sodium',     // ナトリウム：低インスリン→腎臓排出増加（移行期7000mg）
    'potassium',  // カリウム：電解質バランス（Naと拮抗）
    'magnesium',  // マグネシウム：300以上の酵素反応、筋肉・神経
  ] as const,

  /**
   * Tier 2: 開閉式で表示（科学的重要度★★★☆☆以上）
   * 
   * 【要検証】以下の栄養素はDiscord質問頻度が低い可能性：
   * - glycineMethionineRatio（専門的すぎ？）
   * - calciumPhosphorusRatio（専門的すぎ？）
   * - vitaminB12（肉で十分摂取可能？）
   * - choline（レバー・卵で十分？）
   */
  tier2: [
    'omegaRatio',               // オメガ3/6比率：炎症管理（1:4以下推奨）- 重要度★★★★
    'iron',                     // 鉄分（ヘム鉄）：女性は特に重要 - 重要度★★★★
    'zinc',                     // 亜鉛：免疫・タンパク質合成 - 重要度★★★
    'vitaminD',                 // ビタミンD：骨・免疫（太陽光連携）- 重要度★★★★
    'vitaminA',                 // ビタミンA（レチノール）：視力・皮膚 - 重要度★★★
    'vitaminK2',                // ビタミンK2（MK-4）：骨の健康 - 重要度★★★
    'vitaminB12',               // ビタミンB12：神経機能（肉で十分？）- 重要度★★
    'choline',                  // コリン：脳の健康（レバー・卵で十分？）- 重要度★★
    'glycineMethionineRatio',   // グリシン:メチオニン比：コラーゲン・睡眠 - 重要度★★
    'calciumPhosphorusRatio',   // カルシウム:リン比率：骨（肉のリン多い懸念）- 重要度★★
  ] as const,

  /**
   * Tier 3: デバッグモード・詳細モードで表示（その他全て）
   * 一般的には必要ないが、詳細なデータを見たいユーザー向け
   */
  tier3: [
    // マクロ栄養素
    'carbs',
    'netCarbs',
    'fiber',

    // その他のミネラル
    'calcium',
    'phosphorus',
    'selenium',
    'copper',
    'manganese',
    'iodine',
    'chromium',
    'molybdenum',
    'fluoride',
    'chloride',
    'boron',
    'nickel',
    'silicon',
    'vanadium',

    // その他の脂溶性ビタミン
    'vitaminK',
    'vitaminE',

    // 水溶性ビタミン
    'vitaminC',
    'vitaminB1',
    'vitaminB2',
    'vitaminB3',
    'vitaminB5',
    'vitaminB6',
    'vitaminB7',
    'vitaminB9',

    // その他
    'taurine',
    'omega3',
    'omega6',
    'pfRatio',

    // 抗栄養素（Avoid Zone）
    'phytates',
    'polyphenols',
    'flavonoids',
    'anthocyanins',
    'oxalates',
    'lectins',
    'saponins',
    'goitrogens',
    'tannins',
    'trypsinInhibitors',
    'proteaseInhibitors',
    'cyanogenicGlycosides',
    'solanine',
    'chaconine',

    // 植物性食品（Avoid Zone）
    'plantProtein',
    'vegetableOil',
  ] as const,
} as const;

/**
 * Tier 1の栄養素を電解質とマクロ栄養素に分類
 */
export const TIER1_CATEGORIES = {
  electrolytes: ['sodium', 'potassium', 'magnesium'] as const,
  macros: ['fat', 'protein'] as const,
} as const;

/**
 * 栄養素の表示モードに応じて表示する栄養素を取得
 */
export function getNutrientsForMode(mode: NutrientDisplayMode): readonly string[] {
  switch (mode) {
    case 'simple':
      return NUTRIENT_TIERS.tier1;
    case 'standard':
      return [...NUTRIENT_TIERS.tier1, ...NUTRIENT_TIERS.tier2];
    case 'detailed':
      return [...NUTRIENT_TIERS.tier1, ...NUTRIENT_TIERS.tier2, ...NUTRIENT_TIERS.tier3];
    default:
      return NUTRIENT_TIERS.tier1;
  }
}

/**
 * 栄養素のTierを取得
 */
export function getNutrientTier(nutrientKey: string): 1 | 2 | 3 | null {
  if (NUTRIENT_TIERS.tier1.includes(nutrientKey as any)) return 1;
  if (NUTRIENT_TIERS.tier2.includes(nutrientKey as any)) return 2;
  if (NUTRIENT_TIERS.tier3.includes(nutrientKey as any)) return 3;
  return null;
}

/**
 * 栄養素が特定のモードで表示されるかチェック
 */
export function isNutrientVisibleInMode(
  nutrientKey: string,
  mode: NutrientDisplayMode
): boolean {
  const nutrients = getNutrientsForMode(mode);
  return nutrients.includes(nutrientKey);
}

/**
 * LocalStorageキー
 */
const STORAGE_KEY = 'primal_logic_nutrient_display_mode';

/**
 * 栄養素表示モードを取得
 */
export function getNutrientDisplayMode(): NutrientDisplayMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    // debugモードは削除済み（detailedに統合）
    if (saved === 'debug') return 'detailed';
    if (saved && ['simple', 'standard', 'detailed'].includes(saved)) {
      return saved as NutrientDisplayMode;
    }
  } catch (error) {
    logError(error, { component: 'nutrientPriority', action: 'getNutrientDisplayMode' });
  }
  // デフォルトは標準モード（初心者に優しい）
  return 'standard';
}

/**
 * 栄養素表示モードを保存
 */
export function saveNutrientDisplayMode(mode: NutrientDisplayMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch (error) {
    logError(error, { component: 'nutrientPriority', action: 'saveNutrientDisplayMode' });
  }
}

/**
 * 表示モードの説明を取得
 */
export function getNutrientDisplayModeDescription(mode: NutrientDisplayMode): string {
  switch (mode) {
    case 'simple':
      return 'カーニボア実践者向け。電解質と脂質のみ表示。「数値管理」から「身体感覚」への回帰。';
    case 'standard':
      return '初心者向け。重要な栄養素10項目を表示。安心感のある情報量。';
    case 'detailed':
      return 'データ重視ユーザー向け。全ての栄養素（60項目以上）を表示。';
    default:
      return '';
  }
}

/**
 * ペルソナ別のデフォルトモードを取得
 * @param persona - 'carnivore_practitioner' | 'beginner' | 'data_focused'
 */
export function getDefaultModeForPersona(
  persona: 'carnivore_practitioner' | 'beginner' | 'data_focused'
): NutrientDisplayMode {
  switch (persona) {
    case 'carnivore_practitioner':
      return 'simple'; // カーニボア実践者：シンプル
    case 'beginner':
      return 'standard'; // 初心者：標準
    case 'data_focused':
      return 'detailed'; // データ重視：詳細
    default:
      return 'standard';
  }
}
