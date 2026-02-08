/**
 * CarnivOS - Saved Tips (お気に入りTips)
 *
 * ユーザーが星で保存したTipsを管理
 */

import { logError } from './errorHandler';

const STORAGE_KEY = 'primal_logic_saved_tips';

/**
 * 保存されたTipsのIDリストを取得
 */
export function getSavedTipIds(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  } catch (error) {
    logError(error, { component: 'savedTips', action: 'getSavedTipIds' });
    return [];
  }
}

/**
 * Tipsを保存（お気に入りに追加）
 */
export function saveTip(tipId: string): void {
  try {
    const saved = getSavedTipIds();
    if (!saved.includes(tipId)) {
      saved.push(tipId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    }
  } catch (error) {
    logError(error, { component: 'savedTips', action: 'saveTip', tipId });
  }
}

/**
 * Tipsの保存を解除（お気に入りから削除）
 */
export function unsaveTip(tipId: string): void {
  try {
    const saved = getSavedTipIds();
    const filtered = saved.filter((id) => id !== tipId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    logError(error, { component: 'savedTips', action: 'unsaveTip', tipId });
  }
}

/**
 * Tipsが保存されているかチェック
 */
export function isTipSaved(tipId: string): boolean {
  const saved = getSavedTipIds();
  return saved.includes(tipId);
}
