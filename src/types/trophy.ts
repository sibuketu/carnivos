/**
 * トロフィーシステムの型定義
 */

export interface Trophy {
  id: string;
  title: string; // 例: "🦁 ハンター"
  label: string; // 例: "あなたは本能に従う人"
  description: string; // 達成条件
  hint?: string; // 達成方法のヒント（未達成時に表示）
  condition: {
    type: 'count' | 'streak' | 'threshold';
    target: number;
  };
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface TrophyProgress {
  [trophyId: string]: {
    unlocked: boolean;
    unlockedAt?: string;
    progress: number;
  };
}
