/**
 * トロフィー進捗管理hook
 */

import { useState, useEffect } from 'react';
import type { TrophyProgress } from '../types/trophy';
import { TROPHIES } from '../data/trophies';

const STORAGE_KEY = '@carnivos:trophy_progress';

/**
 * LocalStorageから進捗を読み込み
 */
function loadProgress(): TrophyProgress {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load trophy progress:', error);
  }

  // 初期状態
  const initial: TrophyProgress = {};
  TROPHIES.forEach((trophy) => {
    initial[trophy.id] = {
      unlocked: false,
      progress: 0,
    };
  });
  return initial;
}

/**
 * LocalStorageに進捗を保存
 */
function saveProgress(progress: TrophyProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save trophy progress:', error);
  }
}

export function useTrophyProgress() {
  const [progress, setProgress] = useState<TrophyProgress>(loadProgress());

  // 進捗を更新
  const updateProgress = (trophyId: string, increment: number = 1) => {
    setProgress((prev) => {
      const current = prev[trophyId] || { unlocked: false, progress: 0 };
      if (current.unlocked) return prev; // 既に達成済み

      const trophy = TROPHIES.find((t) => t.id === trophyId);
      if (!trophy) return prev;

      const newProgress = current.progress + increment;
      const shouldUnlock = newProgress >= trophy.condition.target;

      const updated = {
        ...prev,
        [trophyId]: {
          unlocked: shouldUnlock,
          unlockedAt: shouldUnlock ? new Date().toISOString() : undefined,
          progress: newProgress,
        },
      };

      saveProgress(updated);
      return updated;
    });
  };

  // 解除されたトロフィー数
  const unlockedCount = Object.values(progress).filter((p) => p.unlocked).length;

  return { progress, updateProgress, unlockedCount };
}
