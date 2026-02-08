/**
 * CarnivOS - Food History Utility
 *
 * ヒストリーレコメンド: 過去の入力履歴からデフォルト値を取得
 */

import { getDailyLogs } from './storage';
import { logError } from './errorHandler';

interface FoodHistoryEntry {
  foodName: string;
  amount: number;
  unit: 'g' | '個';
  count: number; // 入力回数
}

/**
 * 食品名と部位から過去の入力履歴を取得
 */
export async function getFoodHistory(foodName: string): Promise<FoodHistoryEntry | null> {
  try {
    const logs = await getDailyLogs();
    const history: Record<string, { amount: number; unit: 'g' | '個'; count: number }> = {};

    // すべてのログから該当する食品を集計
    logs.forEach((log) => {
      log.fuel.forEach((food) => {
        if (
          food.item === foodName ||
          food.item.includes(foodName) ||
          foodName.includes(food.item)
        ) {
          const key = `${food.amount}${food.unit}`;
          if (!history[key]) {
            // unitを'g' | '個'に変換（'serving'や'piece'の場合は'g'に変換）
            const unit: 'g' | '個' = food.unit === 'g' || food.unit === '個' ? food.unit : 'g';
            history[key] = { amount: food.amount, unit, count: 0 };
          }
          history[key].count++;
        }
      });
    });

    // 最も入力回数が多いものを返す
    const entries = Object.values(history);
    if (entries.length === 0) return null;

    const mostUsed = entries.reduce((prev, current) =>
      current.count > prev.count ? current : prev
    );

    return {
      foodName,
      amount: mostUsed.amount,
      unit: mostUsed.unit,
      count: mostUsed.count,
    };
  } catch (error) {
    logError(error, { component: 'foodHistory', action: 'getFoodHistory', foodName });
    return null;
  }
}

/**
 * 部位から推奨数量を取得（過去の履歴 + デフォルト値）
 */
export async function getRecommendedAmount(
  foodName: string,
  partLocation: string,
  animalType: string
): Promise<{ amount: number; unit: 'g' | '個' }> {
  // まず過去の履歴を確認
  const history = await getFoodHistory(foodName);
  if (history && history.count >= 2) {
    // 2回以上入力されていれば、それを推奨
    return { amount: history.amount, unit: history.unit };
  }

  // 履歴がない場合は、部位と動物タイプに応じたデフォルト値を返す
  if (animalType === 'egg') {
    return { amount: 3, unit: '個' };
  }

  if (partLocation === 'internal') {
    // 内臓は少量
    return { amount: 100, unit: 'g' };
  }

  // 通常の肉類
  return { amount: 300, unit: 'g' };
}

/**
 * すべての食品履歴を取得し、入力回数順にソート（「いつもの」タブ用）
 * Master Specification準拠: History Copy機能
 */
export async function getAllFoodHistory(): Promise<FoodHistoryEntry[]> {
  try {
    const logs = await getDailyLogs();
    const foodMap: Record<string, { amount: number; unit: 'g' | '個'; count: number }> = {};

    // すべてのログから食品を集計
    logs.forEach((log) => {
      log.fuel.forEach((food) => {
        const foodName = food.item;
        // 同じ食品名で、同じ量・単位の組み合わせを集計
        const key = `${foodName}_${food.amount}_${food.unit}`;

        if (!foodMap[key]) {
          const unit: 'g' | '個' = food.unit === 'g' || food.unit === '個' ? food.unit : 'g';
          foodMap[key] = {
            amount: food.amount,
            unit,
            count: 0,
          };
        }
        foodMap[key].count++;
      });
    });

    // FoodHistoryEntry形式に変換
    const entries: FoodHistoryEntry[] = Object.entries(foodMap).map(([key, data]) => {
      const [foodName] = key.split('_');
      return {
        foodName,
        amount: data.amount,
        unit: data.unit,
        count: data.count,
      };
    });

    // 「不明な食品」を除外
    const filteredEntries = entries.filter((entry) => entry.foodName !== '不明な食品');

    // 入力回数順にソート（多い順）
    return filteredEntries.sort((a, b) => b.count - a.count);
  } catch (error) {
    logError(error, { component: 'foodHistory', action: 'getAllFoodHistory' });
    return [];
  }
}
