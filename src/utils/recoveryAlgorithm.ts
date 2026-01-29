/**
 * Primal Logic - Recovery Algorithm
 *
 * 違反タイプ別の処方箋生成ロジック
 * 技術仕様書: @Primal_Logic_Technical_Spec.md 参照
 */

import { VIOLATION_TYPES } from '../constants/carnivore_constants';
import type { ViolationType, RecoveryProtocol } from '../types';

/**
 * Generate recovery protocol based on violation type
 *
 * Violation Types:
 * - SUGAR_CARBS: Insulin spike, glycogen refill
 * - SEED_OILS: Inflammation, oxidative stress
 * - ALCOHOL: Liver stress, dehydration
 * - OXALATES: Crystal formation, mineral binding
 */
export function generateRecoveryProtocol(violationType: ViolationType): RecoveryProtocol {
  const baseProtocol: Omit<RecoveryProtocol, 'violationType'> = {
    isActive: true,
    fastingTargetHours: 16,
    activities: [],
    dietRecommendations: [],
    supplements: [],
    warnings: [],
  };

  switch (violationType) {
    case VIOLATION_TYPES.SUGAR_CARBS:
      return {
        ...baseProtocol,
        violationType,
        fastingTargetHours: 18,
        activities: ['Sprint/HIIT (Force glycogen burn)'],
        dietRecommendations: ['Zero Carb / High Fat next day', 'Focus on ruminant meat'],
        protocolId: 'sugar_carbs_detox_18h',
      };

    case VIOLATION_TYPES.SEED_OILS:
      return {
        ...baseProtocol,
        violationType,
        fastingTargetHours: 20,
        activities: [],
        dietRecommendations: [
          'Ruminant Fat only (No chicken/pork for 2 days)',
          'Focus on beef tallow, lamb fat',
        ],
        supplements: ['Vitamin E (optional) - to protect cell membranes'],
        protocolId: 'oil_detox_18h',
      };

    case VIOLATION_TYPES.ALCOHOL:
      return {
        ...baseProtocol,
        violationType,
        fastingTargetHours: 12, // Shorter fast to prioritize nutrient repair
        activities: [],
        dietRecommendations: [
          'Bone Broth (Glycine) for liver support',
          'Eggs (Choline) for liver support',
        ],
        supplements: [],
        warnings: ['Keep fasting short (12-14h) to prioritize nutrient repair'],
        protocolId: 'alcohol_recovery_12h',
      };

    case VIOLATION_TYPES.OXALATES:
      return {
        ...baseProtocol,
        violationType,
        fastingTargetHours: 14,
        activities: [],
        dietRecommendations: [
          'Add Calcium (Cheese/Bone powder) to bind oxalate in gut',
          'Citric acid (Lemon water) - helps prevent stones',
        ],
        supplements: [],
        warnings: ['Do NOT fast too long (promotes oxalate dumping)'],
        protocolId: 'oxalate_mitigation_14h',
      };

    default:
      return {
        ...baseProtocol,
        violationType,
        protocolId: 'generic_recovery',
      };
  }
}

/**
 * Detect violation type from food item
 *
 * This is a simplified version. In production, you'd want:
 * - A food database with flags (seed_oil, high_oxalate, etc.)
 * - More sophisticated detection logic
 */
export function detectViolationType(foodName: string): ViolationType | null {
  const lowerName = foodName.toLowerCase();

  // Seed oils detection
  if (
    lowerName.includes('tempura') ||
    lowerName.includes('fried') ||
    lowerName.includes('dressing') ||
    lowerName.includes('mayonnaise') ||
    lowerName.includes('vegetable oil') ||
    lowerName.includes('canola') ||
    lowerName.includes('soybean oil')
  ) {
    return VIOLATION_TYPES.SEED_OILS;
  }

  // Sugar/Carbs detection
  if (
    lowerName.includes('bread') ||
    lowerName.includes('rice') ||
    lowerName.includes('pasta') ||
    lowerName.includes('sugar') ||
    lowerName.includes('cake') ||
    lowerName.includes('cookie') ||
    lowerName.includes('fruit') ||
    lowerName.includes('candy')
  ) {
    return VIOLATION_TYPES.SUGAR_CARBS;
  }

  // Oxalates detection
  if (
    lowerName.includes('spinach') ||
    lowerName.includes('almond') ||
    lowerName.includes('cashew') ||
    lowerName.includes('rhubarb') ||
    lowerName.includes('beet')
  ) {
    return VIOLATION_TYPES.OXALATES;
  }

  // Alcohol detection
  if (
    lowerName.includes('alcohol') ||
    lowerName.includes('beer') ||
    lowerName.includes('wine') ||
    lowerName.includes('sake') ||
    lowerName.includes('whiskey')
  ) {
    return VIOLATION_TYPES.ALCOHOL;
  }

  return null;
}

/**
 * Calculate target fast end time
 */
export function calculateTargetFastEnd(fastingHours: number, startTime?: Date): string {
  const start = startTime || new Date();
  const end = new Date(start.getTime() + fastingHours * 60 * 60 * 1000);
  return end.toISOString();
}
