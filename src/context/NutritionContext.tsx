/**
 * Nutrition Context - 栄養素データのグローバル状態管理
 *
 * Geminiの提案に基づき、React Context APIを使用して
 * ButcherSelectでの変更をHomeScreenに即時反映させる
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { FoodItem } from '../types';
import type { PreviewData } from '../hooks/useNutrition';

interface NutritionContextType {
  // 選択中の食品リスト（プレビュー用）
  selectedFoods: FoodItem[];
  // 現在の栄養素計算結果
  currentNutrients: PreviewData | null;
  // 食品を追加（プレビュー用）
  addFood: (food: FoodItem) => void;
  // 食品を削除（プレビュー用）
  removeFood: (index: number) => void;
  // プレビューデータを更新
  updatePreview: (preview: PreviewData | null) => void;
  // プレビューをクリア
  clearPreview: () => void;
}

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

export function NutritionProvider({ children }: { children: ReactNode }) {
  const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>([]);
  const [currentNutrients, setCurrentNutrients] = useState<PreviewData | null>(null);

  const addFood = useCallback((food: FoodItem) => {
    setSelectedFoods((prev) => [...prev, food]);
  }, []);

  const removeFood = useCallback((index: number) => {
    setSelectedFoods((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updatePreview = useCallback((preview: PreviewData | null) => {
    setCurrentNutrients(preview);
  }, []);

  const clearPreview = useCallback(() => {
    setCurrentNutrients(null);
  }, []);

  return (
    <NutritionContext.Provider
      value={{
        selectedFoods,
        currentNutrients,
        addFood,
        removeFood,
        updatePreview,
        clearPreview,
      }}
    >
      {children}
    </NutritionContext.Provider>
  );
}

export function useNutritionContext() {
  const context = useContext(NutritionContext);
  if (!context) {
    throw new Error('useNutritionContext must be used within NutritionProvider');
  }
  return context;
}
