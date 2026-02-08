/**
 * CarnivOS - Debug Data Generator
 *
 * テスト用に30日分のダミーデータを生成
 */

import type { DailyLog, DailyStatus, FoodItem } from '../types';
import { saveDailyLog } from './storage';
import { calculateAllMetrics } from './nutrientCalculator';

/** ランダムな整数を生成 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** ランダムな浮動小数点数を生成 */
function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/** ランダムな配列要素を選択 */
function randomChoice<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

/** 日付文字列を生成 (YYYY-MM-DD) */
function getDateString(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

/** カーニボア食品リスト */
const CARNIVORE_FOODS: Array<{ item: string; amount: number; type: FoodItem['type'] }> = [
  { item: 'ビーフステーキ', amount: 200, type: 'ruminant' },
  { item: 'ビーフリブロース', amount: 250, type: 'ruminant' },
  { item: 'ビーフヒレ', amount: 150, type: 'ruminant' },
  { item: 'ラムチョップ', amount: 180, type: 'ruminant' },
  { item: '牛レバー', amount: 100, type: 'ruminant' },
  { item: '牛ハツ', amount: 120, type: 'ruminant' },
  { item: '豚バラ', amount: 200, type: 'animal' },
  { item: '豚ロース', amount: 180, type: 'animal' },
  { item: '鶏もも肉', amount: 200, type: 'animal' },
  { item: '鶏胸肉', amount: 180, type: 'animal' },
  { item: '卵', amount: 100, type: 'eggs_fats' },
  { item: 'サーモン', amount: 200, type: 'animal' },
  { item: 'マグロ', amount: 150, type: 'animal' },
  { item: 'バター', amount: 20, type: 'eggs_fats' },
  { item: 'チーズ', amount: 50, type: 'dairy' },
];

/** ランダムな食事を生成 */
function generateRandomMeal(): FoodItem[] {
  const mealSize = randomInt(2, 4); // 1食で2-4品
  const foods: FoodItem[] = [];

  for (let i = 0; i < mealSize; i++) {
    const food = randomChoice(CARNIVORE_FOODS);
    foods.push({
      item: food.item,
      amount: food.amount + randomInt(-30, 30),
      unit: 'g',
      type: food.type,
    });
  }

  return foods;
}

/** ランダムなステータスを生成 */
function generateRandomStatus(): Partial<DailyStatus> {
  return {
    weight: randomFloat(65, 75),
    energyLevel: randomInt(6, 10),
    mood: randomChoice(['great', 'good', 'neutral'] as const),
    sleepScore: randomInt(70, 95),
    sleepHours: randomFloat(6.5, 8.5),
    exerciseMinutes: randomInt(0, 60),
    exerciseIntensity: randomChoice(['none', 'light', 'moderate'] as const),
    focus: randomInt(7, 10),
    stressLevel: randomChoice(['low', 'medium'] as const),
  };
}

/** 30日分のデバッグデータを生成 */
export async function generateDebugData(days: number = 30): Promise<void> {
  console.log(`Generating ${days} days of debug data...`);

  for (let i = days - 1; i >= 0; i--) {
    const date = getDateString(i);

    // 1日の食事（2-3食）
    const mealsPerDay = randomInt(2, 3);
    const fuel: FoodItem[] = [];

    for (let meal = 0; meal < mealsPerDay; meal++) {
      fuel.push(...generateRandomMeal());
    }

    // 水分摂取
    const waterIntake = randomInt(1500, 3000);

    // ステータス
    const status: DailyStatus = {
      sleepScore: randomInt(70, 95),
      sunMinutes: randomInt(10, 60),
      activityLevel: randomChoice(['sedentary', 'moderate', 'active'] as const),
      ...generateRandomStatus(),
    } as DailyStatus;

    // 日記（時々書く）
    const diary = Math.random() > 0.7
      ? randomChoice([
          '今日は調子が良かった。エネルギーレベルが高い。',
          '少し疲れを感じる。睡眠を増やすべきかも。',
          '完璧なカーニボアデー！気分最高。',
          '集中力が素晴らしい。仕事が捗った。',
          '体が軽い。この食事法は自分に合ってる。',
        ])
      : '';

    // 栄養計算
    const calculatedMetrics = calculateAllMetrics(fuel);

    const dailyLog: DailyLog = {
      date,
      fuel,
      waterIntake,
      status,
      diary,
      calculatedMetrics,
    };

    await saveDailyLog(dailyLog);
  }

  console.log(`✅ ${days} days of debug data generated successfully!`);
}

/** デバッグデータを削除 */
export async function clearDebugData(days: number = 30): Promise<void> {
  console.log(`Clearing ${days} days of debug data...`);

  for (let i = 0; i < days; i++) {
    const date = getDateString(i);
    localStorage.removeItem(`primal_logic_daily_log_${date}`);
  }

  console.log(`✅ ${days} days of debug data cleared!`);
}

/** デバッグコマンド: ブラウザコンソールで使用可能 */
if (typeof window !== 'undefined') {
  (window as Window & { generateDebugData: typeof generateDebugData; clearDebugData: typeof clearDebugData }).generateDebugData = generateDebugData;
  (window as Window & { generateDebugData: typeof generateDebugData; clearDebugData: typeof clearDebugData }).clearDebugData = clearDebugData;
}
