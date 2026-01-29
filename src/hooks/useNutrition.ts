/**
 * useNutrition Hook - 栄養素プレビュー管理
 *
 * 食品を入力確定する前に、その食品がP:Fゲージに与える影響を視覚的にプレビューするためのState管理
 * 微量栄養素（Zinc, Magnesium, Iron, B12, Sodium等）も管理
 *
 * Phase 2: LocalStorageとの連携機能を追加
 *
 * Note: 栄養目標値は `src/data/carnivoreTargets.ts` の `CARNIVORE_NUTRIENT_TARGETS` および
 * `DEFAULT_CARNIVORE_TARGETS` を使用してください。USDA基準値やハードコードされた目標値は使用しないでください。
 *
 * 特に注意:
 * - ビタミンC: 目標値は0mg（糖質ゼロ環境下では不要）
 * - ナトリウム: 目標値は5000mg以上（低インスリン状態では高用量が必要）
 * - マグネシウム: 目標値は600mg（土壌枯渇により肉のみでは不足しがち）
 * - カリウム: 目標値は4500mg（ナトリウム摂取増に対応）
 */

import { useState, useCallback, useEffect } from 'react';
import { getTodayLog, getDailyLogs } from '../utils/storage';
import type { DailyLog } from '../types';
import { logError } from '../utils/errorHandler';

export interface PreviewData {
  protein: number; // g
  fat: number; // g
  // 微量栄養素（オプション）
  zinc?: number; // mg
  magnesium?: number; // mg
  iron?: number; // mg
  vitamin_b12?: number; // μg
  vitaminC?: number; // mg
  vitaminK?: number; // μg
  sodium?: number; // mg
  // 脂溶性ビタミン（カーニボア重要）
  vitamin_a?: number; // IU
  vitamin_d?: number; // IU
  vitamin_k2?: number; // μg
  // その他
  choline?: number; // mg
  potassium?: number; // mg
  // ビタミンB7（ビオチン）
  vitamin_b7?: number; // μg
  // オメガ3/6（カーニボア重要：炎症管理）
  omega_3?: number; // g
  omega_6?: number; // g
  // ヨウ素（カーニボア重要：甲状腺機能）
  iodine?: number; // μg
  // カルシウム:リン比率（カーニボア重要：骨代謝）
  calcium?: number; // mg
  phosphorus?: number; // mg
  // グリシン:メチオニン比（カーニボア重要：長寿の視点）
  glycine?: number; // g
  methionine?: number; // g
}

export function useNutrition() {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);

  // アプリ起動時に今日のログを読み込む
  useEffect(() => {
    loadTodayLog();
  }, []);

  // 今日のログを読み込む
  const loadTodayLog = useCallback(async () => {
    try {
      const log = await getTodayLog();
      if (log) {
        setTodayLog(log);
      } else {
        setTodayLog(null);
      }
    } catch (error) {
      logError(error, { component: 'useNutrition', action: 'loadTodayLog' });
    }
  }, []);

  // 全ログを取得（デバッグ用）
  const loadAllLogs = useCallback(async () => {
    try {
      const logs = await getDailyLogs();
      return logs;
    } catch (error) {
      logError(error, { component: 'useNutrition', action: 'loadAllLogs' });
      return [];
    }
  }, []);

  const setPreview = useCallback((data: PreviewData) => {
    setPreviewData(data);
  }, []);

  const updatePreview = useCallback((updates: Partial<PreviewData>) => {
    setPreviewData((prev) => {
      if (!prev) {
        return { protein: 0, fat: 0, ...updates };
      }
      return { ...prev, ...updates };
    });
  }, []);

  const addToPreview = useCallback((additions: Partial<PreviewData>) => {
    setPreviewData((prev) => {
      if (!prev) {
        return { protein: 0, fat: 0, ...additions };
      }
      return {
        ...prev,
        protein: (prev.protein || 0) + (additions.protein || 0),
        fat: (prev.fat || 0) + (additions.fat || 0),
        zinc: (prev.zinc || 0) + (additions.zinc || 0),
        magnesium: (prev.magnesium || 0) + (additions.magnesium || 0),
        iron: (prev.iron || 0) + (additions.iron || 0),
        vitamin_b12: (prev.vitamin_b12 || 0) + (additions.vitamin_b12 || 0),
        vitaminC: (prev.vitaminC || 0) + (additions.vitaminC || 0),
        vitaminK: (prev.vitaminK || 0) + (additions.vitaminK || 0),
        sodium: (prev.sodium || 0) + (additions.sodium || 0),
      };
    });
  }, []);

  const clearPreview = useCallback(() => {
    setPreviewData(null);
  }, []);

  return {
    previewData,
    todayLog,
    setPreview,
    updatePreview,
    addToPreview,
    clearPreview,
    loadTodayLog,
    loadAllLogs,
  };
}
