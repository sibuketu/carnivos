/**
 * Primal Logic - Interactive Butcher Component
 *
 * クリッカブルSVG解剖図: 牛・豚・鶏などの部位を直接タップして選択
 */

import { useState, useEffect } from 'react';
import {
  getFoodsByPart,
  type AnimalType,
  type PartLocation,
  type DeepFoodItem,
} from '../data/deepNutritionData';
import { getRecommendedAmount } from '../utils/foodHistory';
import InteractiveChicken from './InteractiveChicken';
import './InteractiveButcher.css';

interface InteractiveButcherProps {
  animalType: AnimalType;
  onFoodSelect: (food: DeepFoodItem, amount: number, unit: 'g' | '個') => void;
  onBack: () => void;
}

// 部位のマッピング（SVGのpart名 → PartLocation）
const PART_MAPPING: Record<string, PartLocation> = {
  ribeye: 'rib',
  belly: 'belly',
  rump: 'leg',
  chuck: 'rib',
  internal: 'internal',
  body: 'body',
  whole: 'whole',
};

export default function InteractiveButcher({
  animalType,
  onFoodSelect,
  onBack,
}: InteractiveButcherProps) {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<DeepFoodItem | null>(null);
  const [amount, setAmount] = useState(300);
  const [unit, setUnit] = useState<'g' | '個'>('g');
  const [packSize, setPackSize] = useState(300);
  const [portion, setPortion] = useState<number | null>(null);

  const handlePartClick = (partName: string) => {
    setSelectedPart(partName);
    setSelectedFood(null);
  };

  const partLocation = selectedPart ? PART_MAPPING[selectedPart] : null;
  const availableFoods = partLocation ? getFoodsByPart(animalType, partLocation) : [];

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

  const handleFoodClick = (food: DeepFoodItem) => {
    setSelectedFood(food);
  };

  const handleConfirm = () => {
    if (selectedFood) {
      onFoodSelect(selectedFood, amount, unit);
    }
  };

  // 部位ごとのスマートプリセット
  const getSmartPresets = (): number[] => {
    if (animalType === 'egg') {
      return [2, 3, 5];
    }
    if (partLocation === 'internal') {
      return [100, 150, 200];
    }
    return [200, 300, 450];
  };

  // Pack & Portion計算
  useEffect(() => {
    if (portion !== null && unit === 'g') {
      const calculatedAmount = Math.round(packSize * portion);
      setAmount(calculatedAmount);
    }
  }, [packSize, portion, unit]);

  // 動物タイプに応じたSVGをレンダリング
  const renderSVG = () => {
    switch (animalType) {
      case 'beef':
        return <BeefSVG selectedPart={selectedPart} onSelectPart={handlePartClick} />;
      case 'pork':
        return <PorkSVG selectedPart={selectedPart} onSelectPart={handlePartClick} />;
      case 'chicken':
        return <ChickenSVG selectedPart={selectedPart} onSelectPart={handlePartClick} />;
      case 'egg':
        return <EggSVG selectedPart={selectedPart} onSelectPart={handlePartClick} />;
      case 'fish':
        return <FishSVG selectedPart={selectedPart} onSelectPart={handlePartClick} />;
      default:
        return <div>この動物タイプのSVGはまだ実装されていません</div>;
    }
  };

  return (
    <div className="interactive-butcher-container">
      <button className="interactive-butcher-back" onClick={onBack}>
        ← 戻る
      </button>

      <h2 className="interactive-butcher-title">
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

      {/* SVG解剖図 */}
      <div className="interactive-butcher-svg-container">
        {renderSVG()}
        <p className="interactive-butcher-hint">図の部位を直接タップして選択</p>
      </div>

      {/* 選択した部位の食品リスト */}
      {selectedPart && availableFoods.length > 0 && !selectedFood && (
        <div className="interactive-butcher-foods-list">
          <h3 className="interactive-butcher-foods-title">選択可能な食品:</h3>
          {availableFoods.map((food) => (
            <button
              key={food.id}
              className="interactive-butcher-food-button"
              onClick={() => handleFoodClick(food)}
            >
              <div className="interactive-butcher-food-name">{food.name_ja}</div>
              <div className="interactive-butcher-food-verdict">{food.primal_verdict}</div>
              <div className="interactive-butcher-food-stats">
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
        <div className="interactive-butcher-quantity-panel">
          <div className="interactive-butcher-quantity-header">
            <h3>{selectedFood.name_ja} の数量を選択</h3>
            <button
              className="interactive-butcher-back-button"
              onClick={() => setSelectedFood(null)}
            >
              ← 戻る
            </button>
          </div>

          {/* A. スマートプリセット */}
          <div className="interactive-butcher-presets">
            <h4>標準量:</h4>
            <div className="interactive-butcher-preset-buttons">
              {getSmartPresets().map((preset) => (
                <button
                  key={preset}
                  className={`interactive-butcher-preset-button ${amount === preset && unit === (animalType === 'egg' ? '個' : 'g') ? 'active' : ''}`}
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
            <div className="interactive-butcher-pack-portion">
              <h4>パック & 割合:</h4>
              <div className="interactive-butcher-pack-slider">
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
                  className="interactive-butcher-slider"
                />
              </div>
              <div className="interactive-butcher-portion-buttons">
                <button
                  className={`interactive-butcher-portion-button ${portion === 0.25 ? 'active' : ''}`}
                  onClick={() => setPortion(0.25)}
                >
                  1/4
                </button>
                <button
                  className={`interactive-butcher-portion-button ${portion === 0.5 ? 'active' : ''}`}
                  onClick={() => setPortion(0.5)}
                >
                  Half
                </button>
                <button
                  className={`interactive-butcher-portion-button ${portion === 1 ? 'active' : ''}`}
                  onClick={() => setPortion(1)}
                >
                  All (全部)
                </button>
                <button
                  className={`interactive-butcher-portion-button ${portion === 2 ? 'active' : ''}`}
                  onClick={() => setPortion(2)}
                >
                  x2 (2パック)
                </button>
              </div>
              {portion !== null && (
                <div className="interactive-butcher-calculated-amount">
                  計算結果: {Math.round(packSize * portion)}g
                </div>
              )}
            </div>
          )}

          {/* 個数入力（卵の場合） */}
          {unit === '個' && animalType === 'egg' && (
            <div className="interactive-butcher-piece-input">
              <h4>個数:</h4>
              <div className="interactive-butcher-piece-buttons">
                {[1, 2, 3, 4, 5, 6, 8, 10].map((count) => (
                  <button
                    key={count}
                    className={`interactive-butcher-piece-button ${amount === count ? 'active' : ''}`}
                    onClick={() => setAmount(count)}
                  >
                    {count}個
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 確認ボタン */}
          <button className="interactive-butcher-confirm-button" onClick={handleConfirm}>
            {selectedFood.name_ja} {amount}
            {unit} を追加
          </button>
        </div>
      )}

      {selectedPart && availableFoods.length === 0 && (
        <div className="interactive-butcher-empty">この部位のデータはまだありません</div>
      )}
    </div>
  );
}

// 牛のSVG
function BeefSVG({
  selectedPart,
  onSelectPart,
}: {
  selectedPart: string | null;
  onSelectPart: (part: string) => void;
}) {
  return (
    <svg viewBox="0 0 500 300" className="interactive-butcher-svg">
      <g stroke="white" strokeWidth="2">
        {/* 1. リブアイ / ロース (背中側) */}
        <path
          d="M120,60 Q200,50 300,60 L320,130 L120,130 Z"
          fill={selectedPart === 'ribeye' ? '#ff6b6b' : '#e11d48'}
          className="interactive-butcher-path"
          onClick={() => onSelectPart('ribeye')}
        />
        <text x="220" y="100" fill="white" fontSize="14" textAnchor="middle" pointerEvents="none">
          リブアイ
        </text>

        {/* 2. バラ / ブリスケット (お腹側) */}
        <path
          d="M130,132 L310,132 L300,200 Q200,210 140,200 Z"
          fill={selectedPart === 'belly' ? '#ff6b6b' : '#be123c'}
          className="interactive-butcher-path"
          onClick={() => onSelectPart('belly')}
        />
        <text x="220" y="170" fill="white" fontSize="14" textAnchor="middle" pointerEvents="none">
          バラ
        </text>

        {/* 3. もも / ランプ (お尻側) */}
        <path
          d="M302,60 Q380,65 420,100 L420,190 L312,130 L322,60 Z"
          fill={selectedPart === 'rump' ? '#ff6b6b' : '#9f1239'}
          className="interactive-butcher-path"
          onClick={() => onSelectPart('rump')}
        />
        <text x="370" y="120" fill="white" fontSize="14" textAnchor="middle" pointerEvents="none">
          もも
        </text>

        {/* 4. 肩 / チャック (首側) */}
        <path
          d="M40,90 Q80,50 118,60 L118,130 L128,132 L138,200 L50,180 Z"
          fill={selectedPart === 'chuck' ? '#ff6b6b' : '#881337'}
          className="interactive-butcher-path"
          onClick={() => onSelectPart('chuck')}
        />
        <text x="90" y="140" fill="white" fontSize="14" textAnchor="middle" pointerEvents="none">
          肩ロース
        </text>

        {/* 5. 内臓 */}
        <circle
          cx="220"
          cy="165"
          r="25"
          fill={selectedPart === 'internal' ? '#ff6b6b' : '#7f1d1d'}
          className="interactive-butcher-path"
          onClick={() => onSelectPart('internal')}
        />
        <text x="220" y="170" fill="white" fontSize="12" textAnchor="middle" pointerEvents="none">
          内臓
        </text>
      </g>
    </svg>
  );
}

// 豚のSVG
function PorkSVG({
  selectedPart,
  onSelectPart,
}: {
  selectedPart: string | null;
  onSelectPart: (part: string) => void;
}) {
  return (
    <svg viewBox="0 0 500 300" className="interactive-butcher-svg">
      <g stroke="white" strokeWidth="2">
        {/* ロース */}
        <path
          d="M120,60 Q200,50 300,60 L320,130 L120,130 Z"
          fill={selectedPart === 'ribeye' ? '#ffb3ba' : '#ff6b9d'}
          className="interactive-butcher-path"
          onClick={() => onSelectPart('ribeye')}
        />
        <text x="220" y="100" fill="white" fontSize="14" textAnchor="middle" pointerEvents="none">
          ロース
        </text>

        {/* バラ */}
        <path
          d="M130,132 L310,132 L300,200 Q200,210 140,200 Z"
          fill={selectedPart === 'belly' ? '#ffb3ba' : '#ff4d8a'}
          className="interactive-butcher-path"
          onClick={() => onSelectPart('belly')}
        />
        <text x="220" y="170" fill="white" fontSize="14" textAnchor="middle" pointerEvents="none">
          バラ
        </text>

        {/* もも */}
        <path
          d="M302,60 Q380,65 420,100 L420,190 L312,130 L322,60 Z"
          fill={selectedPart === 'rump' ? '#ffb3ba' : '#ff1f6b'}
          className="interactive-butcher-path"
          onClick={() => onSelectPart('rump')}
        />
        <text x="370" y="120" fill="white" fontSize="14" textAnchor="middle" pointerEvents="none">
          もも
        </text>

        {/* 内臓 */}
        <circle
          cx="220"
          cy="165"
          r="25"
          fill={selectedPart === 'internal' ? '#ffb3ba' : '#cc0052'}
          className="interactive-butcher-path"
          onClick={() => onSelectPart('internal')}
        />
        <text x="220" y="170" fill="white" fontSize="12" textAnchor="middle" pointerEvents="none">
          内臓
        </text>
      </g>
    </svg>
  );
}

// 鶏のSVG（InteractiveChicken.tsxを使用）
function ChickenSVG({
  selectedPart,
  onSelectPart,
}: {
  selectedPart: string | null;
  onSelectPart: (part: string) => void;
}) {
  // 部位名のマッピング（InteractiveChickenの部位名 → PartLocation）
  const handlePartSelect = (part: string) => {
    const partMapping: Record<string, string> = {
      breast: 'body',
      thigh: 'leg',
      wing: 'body',
      liver: 'internal',
    };
    onSelectPart(partMapping[part] || part);
  };

  return (
    <InteractiveChicken
      selectedPart={
        selectedPart === 'body'
          ? 'breast'
          : selectedPart === 'leg'
            ? 'thigh'
            : selectedPart === 'internal'
              ? 'liver'
              : selectedPart
      }
      onSelectPart={handlePartSelect}
    />
  );
}

// 卵のSVG
function EggSVG({
  selectedPart,
  onSelectPart,
}: {
  selectedPart: string | null;
  onSelectPart: (part: string) => void;
}) {
  return (
    <svg viewBox="0 0 500 300" className="interactive-butcher-svg">
      <g stroke="white" strokeWidth="2">
        {/* 全卵 */}
        <ellipse
          cx="250"
          cy="150"
          rx="80"
          ry="100"
          fill={selectedPart === 'whole' ? '#fff8dc' : '#f5deb3'}
          className="interactive-butcher-path"
          onClick={() => onSelectPart('whole')}
        />
        <text
          x="250"
          y="155"
          fill="#333"
          fontSize="16"
          textAnchor="middle"
          pointerEvents="none"
          fontWeight="bold"
        >
          全卵
        </text>
      </g>
    </svg>
  );
}

// 魚のSVG
function FishSVG({
  selectedPart,
  onSelectPart,
}: {
  selectedPart: string | null;
  onSelectPart: (part: string) => void;
}) {
  return (
    <svg viewBox="0 0 500 300" className="interactive-butcher-svg">
      <g stroke="white" strokeWidth="2">
        {/* 身 */}
        <path
          d="M100,150 Q200,100 300,150 Q200,200 100,150 Z"
          fill={selectedPart === 'body' ? '#87ceeb' : '#4682b4'}
          className="interactive-butcher-path"
          onClick={() => onSelectPart('body')}
        />
        <text x="200" y="150" fill="white" fontSize="14" textAnchor="middle" pointerEvents="none">
          身
        </text>

        {/* 内臓 */}
        <circle
          cx="200"
          cy="150"
          r="20"
          fill={selectedPart === 'internal' ? '#87ceeb' : '#2e5c8a'}
          className="interactive-butcher-path"
          onClick={() => onSelectPart('internal')}
        />
        <text x="200" y="155" fill="white" fontSize="12" textAnchor="middle" pointerEvents="none">
          内臓
        </text>
      </g>
    </svg>
  );
}
