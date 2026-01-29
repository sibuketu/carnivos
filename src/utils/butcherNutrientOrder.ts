/**
 * ButcherSelect専用の栄養素並び順管理
 *
 * Nutrients Breakdownセクションの栄養素の表示順序と並び替え機能
 */

import { logError } from './errorHandler';

export type ButcherNutrientKey =
  | 'protein'
  | 'fat'
  | 'zinc'
  | 'magnesium'
  | 'iron'
  | 'potassium'
  | 'sodium'
  | 'vitaminA'
  | 'vitaminD'
  | 'vitaminK2'
  | 'vitaminB12'
  | 'vitaminB7'
  | 'choline'
  | 'iodine'
  | 'calcium'
  | 'phosphorus'
  | 'glycine'
  | 'methionine'
  | 'omegaRatio';

export interface ButcherNutrientOrderConfig {
  key: ButcherNutrientKey;
  label: string;
  priority: number;
}

export const DEFAULT_BUTCHER_NUTRIENT_ORDER: ButcherNutrientOrderConfig[] = [
  { key: 'protein', label: 'タンパク質', priority: 1 },
  { key: 'fat', label: '脂質', priority: 2 },
  { key: 'zinc', label: '亜鉛', priority: 3 },
  { key: 'magnesium', label: 'マグネシウム', priority: 4 },
  { key: 'iron', label: '鉄分', priority: 5 },
  { key: 'potassium', label: 'カリウム', priority: 6 },
  { key: 'sodium', label: 'ナトリウム', priority: 7 },
  { key: 'vitaminA', label: 'ビタミンA', priority: 8 },
  { key: 'vitaminD', label: 'ビタミンD', priority: 9 },
  { key: 'vitaminK2', label: 'ビタミンK2', priority: 10 },
  { key: 'vitaminB12', label: 'ビタミンB12', priority: 11 },
  { key: 'vitaminB7', label: 'ビタミンB7（ビオチン）', priority: 12 },
  { key: 'choline', label: 'コリン', priority: 13 },
  { key: 'iodine', label: 'ヨウ素', priority: 14 },
  { key: 'calcium', label: 'カルシウム', priority: 15 },
  { key: 'phosphorus', label: 'リン', priority: 16 },
  { key: 'glycine', label: 'グリシン', priority: 17 },
  { key: 'methionine', label: 'メチオニン', priority: 18 },
  { key: 'omegaRatio', label: 'オメガ3/6比率', priority: 19 },
];

const STORAGE_KEY = 'primal-logic-butcher-nutrient-order';

export function getButcherNutrientOrder(): ButcherNutrientOrderConfig[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    logError(error, { component: 'butcherNutrientOrder', action: 'getButcherNutrientOrder' });
  }
  return DEFAULT_BUTCHER_NUTRIENT_ORDER;
}

export function saveButcherNutrientOrder(order: ButcherNutrientOrderConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  } catch (error) {
    logError(error, { component: 'butcherNutrientOrder', action: 'saveButcherNutrientOrder' });
  }
}

export function moveButcherNutrientUp(
  order: ButcherNutrientOrderConfig[],
  key: ButcherNutrientKey
): ButcherNutrientOrderConfig[] {
  const index = order.findIndex((item) => item.key === key);
  if (index <= 0) return order;

  const newOrder = [...order];
  [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
  return newOrder;
}

export function moveButcherNutrientDown(
  order: ButcherNutrientOrderConfig[],
  key: ButcherNutrientKey
): ButcherNutrientOrderConfig[] {
  const index = order.findIndex((item) => item.key === key);
  if (index < 0 || index >= order.length - 1) return order;

  const newOrder = [...order];
  [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
  return newOrder;
}

export type SortMode = 'default' | 'deficiency'; // 優先度順 | 不足順

export function sortNutrientsByMode(
  order: ButcherNutrientOrderConfig[],
  mode: SortMode,
  nutrientDataMap: Record<
    ButcherNutrientKey,
    { currentDailyTotal: number; previewAmount: number; target: number }
  >
): ButcherNutrientOrderConfig[] {
  if (mode === 'default') {
    // 優先度順（priority順）でソート
    return [...order].sort((a, b) => a.priority - b.priority);
  } else if (mode === 'deficiency') {
    // 達成率が低い順（不足順）
    return [...order].sort((a, b) => {
      const dataA = nutrientDataMap[a.key];
      const dataB = nutrientDataMap[b.key];

      if (!dataA || !dataB) return 0;

      // targetが0以下の場合は除外（最後に配置）
      if (dataA.target <= 0 && dataB.target <= 0) return 0;
      if (dataA.target <= 0) return 1; // Aを後ろに
      if (dataB.target <= 0) return -1; // Bを後ろに

      // 合計値（currentDailyTotal + previewAmount）で達成率を計算
      const totalA = dataA.currentDailyTotal + dataA.previewAmount;
      const totalB = dataB.currentDailyTotal + dataB.previewAmount;

      const ratioA = totalA / dataA.target;
      const ratioB = totalB / dataB.target;

      return ratioA - ratioB; // 小さい順（不足している順）
    });
  }

  return order;
}
