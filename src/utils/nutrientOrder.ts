/**
 * Primal Logic - Nutrient Order Management
 *
 * 栄養素の表示順序と並び替え機能
 */

import { logError } from './errorHandler';

export type NutrientKey =
  | 'vitaminC'
  | 'vitaminK'
  | 'iron'
  | 'sodium'
  | 'fiber'
  | 'zinc'
  | 'magnesium'
  | 'netCarbs'
  | 'protein'
  | 'fat'
  | 'vitaminA'
  | 'vitaminD'
  | 'vitaminK2'
  | 'choline'
  | 'potassium'
  | 'vitaminB12'
  | 'vitaminB7'
  | 'omegaRatio'
  | 'iodine'
  | 'calciumPhosphorusRatio'
  | 'glycineMethionineRatio';

export interface NutrientOrderConfig {
  key: NutrientKey;
  label: string;
  priority: number; // 低いほど優先度高
}

export const DEFAULT_NUTRIENT_ORDER: NutrientOrderConfig[] = [
  // 電解質（最優先：カーニボア導入期〜維持期の体調不良の9割はこれらが原因）
  { key: 'sodium', label: 'ナトリウム', priority: 1 },
  { key: 'potassium', label: 'カリウム', priority: 2 },
  { key: 'magnesium', label: 'マグネシウム', priority: 3 },
  // 必須エネルギー（脂質:タンパク質比率は後で追加）
  { key: 'fat', label: '脂質', priority: 4 },
  { key: 'protein', label: 'タンパク質（有効）', priority: 5 },
  // カーニボアクオリティ（炎症管理）
  { key: 'omegaRatio', label: 'オメガ3/6比率', priority: 6 },
  // 重要ミネラル
  // ヨウ素はButcherSelectのみで表示（HomeScreenから削除）
  { key: 'calciumPhosphorusRatio', label: 'カルシウム:リン比率', priority: 7 },
  { key: 'glycineMethionineRatio', label: 'グリシン:メチオニン比', priority: 8 },
  // 特殊ビタミン
  { key: 'vitaminA', label: 'ビタミンA', priority: 9 },
  { key: 'vitaminD', label: 'ビタミンD', priority: 10 },
  // ビタミンK2はButcherSelectのみで表示（HomeScreenから削除）
  { key: 'vitaminB12', label: 'ビタミンB12', priority: 11 },
  { key: 'vitaminB7', label: 'ビタミンB7（ビオチン）', priority: 12 },
  { key: 'choline', label: 'コリン', priority: 13 },
  { key: 'vitaminC', label: 'ビタミンC', priority: 14 },
  { key: 'vitaminK', label: 'ビタミンK（有効）', priority: 15 },
  // 重要ミネラル
  { key: 'iron', label: '鉄分（有効）', priority: 16 },
  { key: 'zinc', label: '亜鉛（有効）', priority: 17 },
  // その他
  { key: 'netCarbs', label: '正味炭水化物', priority: 20 },
  { key: 'fiber', label: '食物繊維', priority: 21 },
];

const STORAGE_KEY = 'primal-logic-nutrient-order';

/**
 * Get nutrient order from localStorage
 */
export function getNutrientOrder(): NutrientOrderConfig[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // 新しい栄養素（glycineMethionineRatio等）が含まれているか確認
      const hasNewNutrients = parsed.some(
        (item: NutrientOrderConfig) =>
          item.key === 'glycineMethionineRatio' || item.key === 'calciumPhosphorusRatio'
      );
      // 新しい栄養素が含まれていない場合は、デフォルト順序を使用
      if (!hasNewNutrients) {
        if (import.meta.env.DEV) {
          console.log(
            '[nutrientOrder] 新しい栄養素が含まれていないため、デフォルト順序を使用します'
          );
        }
        return DEFAULT_NUTRIENT_ORDER;
      }
      return parsed;
    }
  } catch (error) {
    logError(error, { component: 'nutrientOrder', action: 'loadNutrientOrder' });
  }
  return DEFAULT_NUTRIENT_ORDER;
}

/**
 * Save nutrient order to localStorage
 */
export function saveNutrientOrder(order: NutrientOrderConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  } catch (error) {
    logError(error, { component: 'nutrientOrder', action: 'saveNutrientOrder' });
  }
}

/**
 * Move nutrient up in order
 */
export function moveNutrientUp(
  order: NutrientOrderConfig[],
  key: NutrientKey
): NutrientOrderConfig[] {
  const index = order.findIndex((item) => item.key === key);
  if (index <= 0) return order;

  const newOrder = [...order];
  [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
  return newOrder;
}

/**
 * Move nutrient down in order
 */
export function moveNutrientDown(
  order: NutrientOrderConfig[],
  key: NutrientKey
): NutrientOrderConfig[] {
  const index = order.findIndex((item) => item.key === key);
  if (index < 0 || index >= order.length - 1) return order;

  const newOrder = [...order];
  [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
  return newOrder;
}
