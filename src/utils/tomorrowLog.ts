/**
 * Primal Logic - Tomorrow Log Utility
 *
 * 「明日のログに追加」機能: Phase 4の仕様
 * SET PROTOCOLボタンで明日のログにRecovery Protocolと推奨食品を追加
 */

import type { DailyLog, RecoveryProtocol, FoodItem } from '../types';
import { calculateAllMetrics } from './nutrientCalculator';
import { saveDailyLog, getDailyLogByDate } from './storage';

/**
 * Get tomorrow's date string (YYYY-MM-DD)
 */
export function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

/**
 * Create or update tomorrow's log with recovery protocol
 *
 * Phase 4仕様:
 * - Adds menu to tomorrow's log
 * - Sets a "Defrost Reminder" for tonight
 */
export async function addProtocolToTomorrowLog(protocol: RecoveryProtocol): Promise<DailyLog> {
  const tomorrowDate = getTomorrowDate();

  // Get existing tomorrow's log or create new one
  let tomorrowLog = await getDailyLogByDate(tomorrowDate);

  if (!tomorrowLog) {
    // Create new log for tomorrow
    tomorrowLog = {
      date: tomorrowDate,
      status: {
        sleepScore: 80, // Default
        sunMinutes: 30, // Default
        activityLevel: 'moderate', // Default
      },
      fuel: [],
      calculatedMetrics: calculateAllMetrics([]),
    };
  }

  // Add recovery protocol
  tomorrowLog.recoveryProtocol = protocol;

  // Add recommended foods from diet recommendations
  // Extract food items from diet recommendations
  const recommendedFoods: FoodItem[] = [];

  if (protocol.dietRecommendations) {
    protocol.dietRecommendations.forEach((rec) => {
      // Simple parsing - in production, use more sophisticated logic
      const lowerRec = rec.toLowerCase();

      if (lowerRec.includes('ribeye') || lowerRec.includes('beef')) {
        recommendedFoods.push({
          item: 'Beef Ribeye',
          amount: 400,
          unit: 'g',
          type: 'ruminant',
          nutrients: {
            protein: 80,
            fat: 80,
            carbs: 0,
            netCarbs: 0,
            hemeIron: 9.2,
            vitaminK: 4.4,
            zinc: 17.2,
            sodium: 216,
            magnesium: 80,
          },
        });
      } else if (lowerRec.includes('lamb')) {
        recommendedFoods.push({
          item: 'Lamb Chop',
          amount: 300,
          unit: 'g',
          type: 'ruminant',
          nutrients: {
            protein: 75,
            fat: 63,
            carbs: 0,
            netCarbs: 0,
            hemeIron: 5.4,
            vitaminK: 3.6,
            zinc: 13.5,
            sodium: 195,
            magnesium: 66,
          },
        });
      } else if (lowerRec.includes('bone broth')) {
        recommendedFoods.push({
          item: 'Bone Broth',
          amount: 500,
          unit: 'g', // 'ml'は型に含まれていないため'g'に変更（500ml ≈ 500g）
          type: 'animal',
          nutrients: {
            protein: 10,
            fat: 2,
            carbs: 0,
            netCarbs: 0,
            sodium: 500,
            magnesium: 20,
          },
        });
      } else if (lowerRec.includes('egg')) {
        recommendedFoods.push({
          item: 'Eggs',
          amount: 200,
          unit: 'g',
          type: 'animal',
          nutrients: {
            protein: 26,
            fat: 22,
            carbs: 2.2,
            netCarbs: 2.2,
            hemeIron: 3.6,
            vitaminA: 320,
            vitaminK: 0.6,
            zinc: 2.2,
            sodium: 280,
            magnesium: 24,
          },
        });
      }
    });
  }

  // Add recommended foods to tomorrow's log
  if (recommendedFoods.length > 0) {
    tomorrowLog.fuel = [...(tomorrowLog.fuel || []), ...recommendedFoods];
    tomorrowLog.calculatedMetrics = calculateAllMetrics(tomorrowLog.fuel);
  }

  // Save tomorrow's log
  await saveDailyLog(tomorrowLog);

  return tomorrowLog;
}
