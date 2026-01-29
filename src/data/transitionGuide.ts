/**
 * Primal Logic - Transition Guide Data
 *
 * Phase 1: 移行期間サポート - 症状と対処法のデータ構造
 */

export interface TransitionSymptom {
  id: string;
  name: string;
  description: string;
  remedies: {
    nutrient: 'sodium' | 'magnesium' | 'potassium' | 'fat' | 'water';
    adjustment: number; // 調整値（+2000mgなど）
    explanation: string; // 説明文
  }[];
  recommendedFoods: string[]; // 推奨食品リスト
}

export const TRANSITION_SYMPTOMS: TransitionSymptom[] = [
  {
    id: 'headache',
    name: '頭痛',
    description: '移行期間中によくある症状',
    remedies: [
      {
        nutrient: 'sodium',
        adjustment: 2000,
        explanation: 'ナトリウムを+2000mg増やすことで、電解質バランスが改善されます',
      },
    ],
    recommendedFoods: ['塩', '肉汁', '骨スープ'],
  },
  {
    id: 'cramp',
    name: 'こむら返り',
    description: 'マグネシウム不足の可能性があります',
    remedies: [
      {
        nutrient: 'magnesium',
        adjustment: 200,
        explanation: 'マグネシウムを+200mg増やすことで、筋肉のけいれんが改善されます',
      },
    ],
    recommendedFoods: ['マグネシウムサプリメント', '骨スープ'],
  },
  {
    id: 'fatigue',
    name: '疲労感',
    description: 'エネルギー不足の可能性があります',
    remedies: [
      {
        nutrient: 'fat',
        adjustment: 50,
        explanation: '脂質を増やすことで、エネルギー供給が改善されます',
      },
      {
        nutrient: 'sodium',
        adjustment: 1000,
        explanation: '塩分を増やすことで、電解質バランスが改善されます',
      },
    ],
    recommendedFoods: ['脂身の多い肉（リブアイ、バラ肉）', 'バター', '卵黄'],
  },
  {
    id: 'constipation',
    name: '便秘',
    description: 'マグネシウムと水分不足の可能性があります',
    remedies: [
      {
        nutrient: 'magnesium',
        adjustment: 200,
        explanation: 'マグネシウムを+200mg増やすことで、便通が改善されます',
      },
      {
        nutrient: 'water',
        adjustment: 1,
        explanation: '水分を1L増やすことで、便通が改善されます',
      },
    ],
    recommendedFoods: ['マグネシウムサプリメント', '骨スープ'],
  },
  {
    id: 'diarrhea',
    name: '下痢',
    description: '脂質の摂取量を調整する必要があります',
    remedies: [
      {
        nutrient: 'fat',
        adjustment: -30,
        explanation: '脂質を減らすことで、消化器系への負担が軽減されます',
      },
    ],
    recommendedFoods: ['消化の良い肉（鶏胸肉、魚）', '卵'],
  },
];

export interface TransitionProgress {
  daysInTransition: number; // 移行期間中の日数（0-30）
  totalDays: number; // 移行期間の総日数（30）
  progress: number; // 進捗率（0-100）
  remainingDays: number; // 残り日数
}

/**
 * 移行期間の進捗を計算
 */
export function calculateTransitionProgress(
  daysOnCarnivore?: number,
  carnivoreStartDate?: string
): TransitionProgress | null {
  let daysInTransition = 0;

  if (daysOnCarnivore !== undefined) {
    daysInTransition = daysOnCarnivore;
  } else if (carnivoreStartDate) {
    const startDate = new Date(carnivoreStartDate);
    const today = new Date();
    daysInTransition = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  } else {
    return null;
  }

  const totalDays = 30;
  const progress = Math.min((daysInTransition / totalDays) * 100, 100);
  const remainingDays = Math.max(totalDays - daysInTransition, 0);

  // 移行期間中（30日未満）の場合のみ返す
  if (daysInTransition >= totalDays) {
    return null;
  }

  return {
    daysInTransition,
    totalDays,
    progress,
    remainingDays,
  };
}
