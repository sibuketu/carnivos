/**
 * CarnivOS - Butcher Chart Component
 *
 * ビジュアル（解剖図）選択: 牛・豚・鶏の部位をクリックで選択
 * 数量入力: スマートプリセット + Pack & Portion スライダー
 */

import React, { useState, useEffect } from 'react';
import {
  getFoodsByPart,
  type AnimalType,
  type PartLocation,
  type DeepFoodItem,
} from '../data/deepNutritionData';
import { getRecommendedAmount } from '../utils/foodHistory';
import './ButcherChart.css';

interface ButcherChartProps {
  animalType: AnimalType;
  onFoodSelect: (food: DeepFoodItem, amount: number, unit: 'g' | '個') => void;
  onBack: () => void;
}

// 部位の定義（SVG座標またはクリッカブルマップ用）
const PART_AREAS: Record<
  AnimalType,
  Array<{ location: PartLocation; label: string; foods: string[] }>
> = {
  beef: [
    { location: 'rib', label: '背中', foods: ['beef_ribeye'] },
    { location: 'belly', label: 'お腹', foods: ['beef_belly'] },
    { location: 'leg', label: 'もも', foods: [] },
    { location: 'internal', label: '内臓', foods: [] },
  ],
  pork: [
    { location: 'rib', label: 'ロース', foods: [] },
    { location: 'belly', label: 'バラ', foods: ['pork_belly'] },
    { location: 'leg', label: 'もも', foods: [] },
    { location: 'internal', label: '内臓', foods: [] },
  ],
  chicken: [
    { location: 'body', label: '胸肉', foods: [] },
    { location: 'leg', label: 'もも', foods: [] },
    { location: 'internal', label: '内臓', foods: ['chicken_liver'] },
    { location: 'whole', label: '丸ごと', foods: [] },
  ],
  egg: [{ location: 'whole', label: '全卵', foods: [] }],
  fish: [
    { location: 'body', label: '身', foods: ['salmon'] },
    { location: 'internal', label: '内臓', foods: [] },
  ],
  lamb: [
    { location: 'rib', label: 'ラムチョップ', foods: [] },
    { location: 'leg', label: 'もも', foods: [] },
    { location: 'internal', label: '内臓', foods: [] },
  ],
  duck: [
    { location: 'body', label: '胸肉', foods: [] },
    { location: 'leg', label: 'もも', foods: [] },
    { location: 'internal', label: '内臓', foods: [] },
  ],
  game: [
    { location: 'body', label: '肉', foods: [] },
    { location: 'leg', label: 'もも', foods: [] },
    { location: 'internal', label: '内臓', foods: [] },
  ],
};

function ButcherChart({ animalType, onFoodSelect, onBack }: ButcherChartProps) {
  const [selectedPart, setSelectedPart] = useState<PartLocation | null>(null);
  const [selectedFood, setSelectedFood] = useState<DeepFoodItem | null>(null);
  const [amount, setAmount] = useState(300);
  const [unit, setUnit] = useState<'g' | '個'>('g');
  const [packSize, setPackSize] = useState(300); // パックの総量
  const [portion, setPortion] = useState<number | null>(null); // 割合（1/4, 1/2, 1, 2など）

  const parts = PART_AREAS[animalType] || [];
  const availableFoods = selectedPart ? getFoodsByPart(animalType, selectedPart) : [];

  // 食品選択時にヒストリーレコメンドを取得
  useEffect(() => {
    if (selectedFood) {
      getRecommendedAmount(
        selectedFood.name_ja,
        selectedFood.part_location,
        selectedFood.animal_type
      ).then((recommended) => {
        setAmount(recommended.amount);
        setUnit(recommended.unit);
        if (recommended.unit === 'g') {
          setPackSize(recommended.amount);
        }
      });
    }
  }, [selectedFood]);

  // 部位ごとのスマートプリセット
  const getSmartPresets = (): number[] => {
    if (animalType === 'egg') {
      return [2, 3, 5];
    }
    if (selectedPart === 'internal') {
      return [100, 150, 200];
    }
    return [200, 300, 450]; // 肉類の標準量
  };

  // Pack & Portion計算
  useEffect(() => {
    if (portion !== null && unit === 'g') {
      const calculatedAmount = Math.round(packSize * portion);
      setAmount(calculatedAmount);
    }
  }, [packSize, portion, unit]);

  const handlePartClick = (location: PartLocation) => {
    setSelectedPart(location);
  };

  const handleFoodClick = (food: DeepFoodItem) => {
    setSelectedFood(food);
    // 食品選択時は数量入力画面に移行（モーダルまたは下部パネル）
  };

  const handleConfirm = () => {
    if (selectedFood) {
      onFoodSelect(selectedFood, amount, unit);
    }
  };

  return (
    <div className="butcher-chart-container">
      <button className="butcher-chart-back" onClick={onBack}>
        ← 戻る
      </button>
      <h2 className="butcher-chart-title">
        {animalType === 'beef'
          ? '牛肉'
          : animalType === 'pork'
            ? '豚肉'
            : animalType === 'chicken'
              ? '鶏肉'
              : animalType === 'egg'
                ? '卵'
                : animalType === 'fish'
                  ? '魚'
                  : animalType === 'lamb'
                    ? '羊/山羊'
                    : animalType === 'duck'
                      ? '鳥類'
                      : animalType === 'game'
                        ? 'ゲーム'
                        : '動物'}
        の部位を選択
      </h2>

      {/* 簡易的な部位選択UI（将来的にSVGクリッカブルマップに置き換え） */}
      <div className="butcher-chart-parts-grid">
        {parts.map((part) => (
          <button
            key={part.location}
            className={`butcher-chart-part-button ${selectedPart === part.location ? 'active' : ''}`}
            onClick={() => handlePartClick(part.location)}
          >
            <div className="butcher-chart-part-label">{part.label}</div>
            {part.foods.length > 0 && (
              <div className="butcher-chart-part-count">{part.foods.length}種類</div>
            )}
          </button>
        ))}
      </div>

      {/* 選択した部位の食品リスト */}
      {selectedPart && availableFoods.length > 0 && !selectedFood && (
        <div className="butcher-chart-foods-list">
          <h3 className="butcher-chart-foods-title">選択可能な食品:</h3>
          {availableFoods.map((food) => (
            <button
              key={food.id}
              className="butcher-chart-food-button"
              onClick={() => handleFoodClick(food)}
            >
              <div className="butcher-chart-food-name">{food.name_ja}</div>
              <div className="butcher-chart-food-verdict">{food.primal_verdict}</div>
              <div className="butcher-chart-food-stats">
                <span>タンパク質: {food.protein}g</span>
                <span>脂質: {food.fat}g</span>
                <span>飽和脂肪酸（善）: {food.saturated_fat}g</span>
                <span>オメガ6（炎症注意）: {food.omega_6}g</span>
                <span>亜鉛: {food.zinc}mg</span>
                <span>ビタミンB12: {food.vitamin_b12}μg</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 数量入力UI（食品選択後） */}
      {selectedFood && (
        <div className="butcher-chart-quantity-panel">
          <div className="butcher-chart-quantity-header">
            <h3>{selectedFood.name_ja} の数量を選択</h3>
            <button className="butcher-chart-back-button" onClick={() => setSelectedFood(null)}>
              ← 戻る
            </button>
          </div>

          {/* A. スマートプリセット */}
          <div className="butcher-chart-presets">
            <h4>標準量:</h4>
            <div className="butcher-chart-preset-buttons">
              {getSmartPresets().map((preset) => (
                <button
                  key={preset}
                  className={`butcher-chart-preset-button ${amount === preset && unit === (animalType === 'egg' ? '個' : 'g') ? 'active' : ''}`}
                  onClick={() => {
                    setAmount(preset);
                    setUnit(animalType === 'egg' ? '個' : 'g');
                    setPortion(null);
                  }}
                >
                  {preset}
                  {animalType === 'egg' ? '個' : 'g'}
                </button>
              ))}
            </div>
          </div>

          {/* B. Pack & Portion スライダー（g単位の場合のみ） */}
          {unit === 'g' && (
            <div className="butcher-chart-pack-portion">
              <h4>パック & 割合:</h4>
              <div className="butcher-chart-pack-slider">
                <label>パックの総量: {packSize}g</label>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={packSize}
                  onChange={(e) => {
                    setPackSize(Number(e.target.value));
                    setPortion(null);
                  }}
                  className="butcher-chart-slider"
                />
              </div>
              <div className="butcher-chart-portion-buttons">
                <button
                  className={`butcher-chart-portion-button ${portion === 0.25 ? 'active' : ''}`}
                  onClick={() => setPortion(0.25)}
                >
                  1/4
                </button>
                <button
                  className={`butcher-chart-portion-button ${portion === 0.5 ? 'active' : ''}`}
                  onClick={() => setPortion(0.5)}
                >
                  Half
                </button>
                <button
                  className={`butcher-chart-portion-button ${portion === 1 ? 'active' : ''}`}
                  onClick={() => setPortion(1)}
                >
                  All (全部)
                </button>
                <button
                  className={`butcher-chart-portion-button ${portion === 2 ? 'active' : ''}`}
                  onClick={() => setPortion(2)}
                >
                  x2 (2パック)
                </button>
              </div>
              {portion !== null && (
                <div className="butcher-chart-calculated-amount">
                  計算結果: {Math.round(packSize * portion)}g
                </div>
              )}
            </div>
          )}

          {/* 個数入力（卵の場合） */}
          {unit === '個' && animalType === 'egg' && (
            <div className="butcher-chart-piece-input">
              <h4>個数:</h4>
              <div className="butcher-chart-piece-buttons">
                {[1, 2, 3, 4, 5, 6, 8, 10].map((count) => (
                  <button
                    key={count}
                    className={`butcher-chart-piece-button ${amount === count ? 'active' : ''}`}
                    onClick={() => setAmount(count)}
                  >
                    {count}個
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 確認ボタン */}
          <button className="butcher-chart-confirm-button" onClick={handleConfirm}>
            {selectedFood.name_ja} {amount}
            {unit} を追加
          </button>
        </div>
      )}

      {selectedPart && availableFoods.length === 0 && (
        <div className="butcher-chart-empty">この部位のデータはまだありません</div>
      )}
    </div>
  );
}

export default React.memo(ButcherChart);
