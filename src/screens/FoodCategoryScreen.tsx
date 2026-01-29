/**
 * Primal Logic - Food Category Screen
 *
 * 巨大アイコン5つ（牛・豚・鶏・卵・魚）で食品を選択
 */

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { searchFoodsByCategory, type FoodData } from '../data/foodsDatabase';
import './FoodCategoryScreen.css';

type Category = 'beef' | 'pork' | 'chicken' | 'egg' | 'fish';

interface CategoryInfo {
  id: Category;
  name: string;
  emoji: string;
  color: string;
}

const CATEGORIES: CategoryInfo[] = [
  { id: 'beef', name: '牛肉', emoji: '🐄', color: '#8B4513' },
  { id: 'pork', name: '豚肉', emoji: '🐷', color: '#FFB6C1' },
  { id: 'chicken', name: '鶏肉', emoji: '🐔', color: '#FFD700' },
  { id: 'egg', name: '卵', emoji: '🥚', color: '#FFF8DC' },
  { id: 'fish', name: '魚', emoji: '🐟', color: '#4682B4' },
];

export default function FoodCategoryScreen() {
  const { addFood } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodData | null>(null);
  const [amount, setAmount] = useState('300'); // カーニボアサイズのデフォルト
  const [unit, setUnit] = useState<'g' | '個'>('g');

  const foods = selectedCategory ? searchFoodsByCategory(selectedCategory) : [];

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedFood(null);
    setAmount('300'); // カーニボアサイズのデフォルト
    setUnit('g');
  };

  const handleFoodSelect = (food: FoodData) => {
    setSelectedFood(food);
    // 食品に応じてデフォルト値を設定
    if (food.preferredUnit === 'piece' && food.pieceWeight) {
      setAmount('1');
      setUnit('個');
    } else {
      // カーニボアサイズのデフォルト（ステーキは300g、ひき肉は450gなど）
      if (food.id.includes('ribeye') || food.id.includes('sirloin')) {
        setAmount('300');
      } else if (food.id.includes('ground')) {
        setAmount('450'); // 1ポンド
      } else {
        setAmount('300');
      }
      setUnit('g');
    }
  };

  const handleAddFood = () => {
    if (!selectedFood) return;

    const inputAmount = Number(amount) || (unit === '個' ? 1 : 300);
    let actualAmount: number;
    let displayUnit: 'g' | '個';

    if (unit === '個' && selectedFood.pieceWeight) {
      actualAmount = inputAmount * selectedFood.pieceWeight;
      displayUnit = '個';
    } else {
      actualAmount = inputAmount;
      displayUnit = 'g';
    }

    const ratio = actualAmount / 100;
    const foodItem = {
      item: selectedFood.name,
      amount: unit === '個' ? inputAmount : actualAmount,
      unit: displayUnit,
      type: selectedFood.type,
      nutrients: {
        protein: (selectedFood.nutrientsRaw.protein || 0) * ratio,
        fat: (selectedFood.nutrientsRaw.fat || 0) * ratio,
        carbs: (selectedFood.nutrientsRaw.carbs || 0) * ratio,
        netCarbs:
          ((selectedFood.nutrientsRaw.carbs || 0) - (selectedFood.nutrientsRaw.fiber || 0)) * ratio,
        fiber: (selectedFood.nutrientsRaw.fiber || 0) * ratio,
        hemeIron: (selectedFood.nutrientsRaw.hemeIron || 0) * ratio,
        nonHemeIron: (selectedFood.nutrientsRaw.nonHemeIron || 0) * ratio,
        vitaminA: (selectedFood.nutrientsRaw.vitaminA || 0) * ratio,
        vitaminC: (selectedFood.nutrientsRaw.vitaminC || 0) * ratio,
        vitaminK: (selectedFood.nutrientsRaw.vitaminK || 0) * ratio,
        zinc: (selectedFood.nutrientsRaw.zinc || 0) * ratio,
        sodium: (selectedFood.nutrientsRaw.sodium || 0) * ratio,
        magnesium: (selectedFood.nutrientsRaw.magnesium || 0) * ratio,
        vitaminB1: (selectedFood.nutrientsRaw.vitaminB1 || 0) * ratio,
        vitaminB2: (selectedFood.nutrientsRaw.vitaminB2 || 0) * ratio,
        vitaminB3: (selectedFood.nutrientsRaw.vitaminB3 || 0) * ratio,
        vitaminB6: (selectedFood.nutrientsRaw.vitaminB6 || 0) * ratio,
        vitaminB12: (selectedFood.nutrientsRaw.vitaminB12 || 0) * ratio,
        vitaminE: (selectedFood.nutrientsRaw.vitaminE || 0) * ratio,
        calcium: (selectedFood.nutrientsRaw.calcium || 0) * ratio,
        phosphorus: (selectedFood.nutrientsRaw.phosphorus || 0) * ratio,
        selenium: (selectedFood.nutrientsRaw.selenium || 0) * ratio,
        copper: (selectedFood.nutrientsRaw.copper || 0) * ratio,
        manganese: (selectedFood.nutrientsRaw.manganese || 0) * ratio,
      },
    };

    addFood(foodItem);
    // リセット
    setSelectedCategory(null);
    setSelectedFood(null);
    setAmount('300');
    setUnit('g');
  };

  if (!selectedCategory) {
    return (
      <div className="food-category-screen">
        <div className="food-category-grid">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              className="food-category-button"
              onClick={() => handleCategorySelect(category.id)}
              style={{ backgroundColor: category.color }}
            >
              <span className="food-category-emoji">{category.emoji}</span>
              <span className="food-category-name">{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="food-category-screen">
      <button
        className="food-category-back"
        onClick={() => {
          setSelectedCategory(null);
          setSelectedFood(null);
        }}
      >
        ← 戻る
      </button>
      <h2 className="food-category-title">
        {CATEGORIES.find((c) => c.id === selectedCategory)?.name}を選択
      </h2>
      <div className="food-category-list">
        {foods.map((food) => (
          <button
            key={food.id}
            className={`food-item-button ${selectedFood?.id === food.id ? 'active' : ''}`}
            onClick={() => handleFoodSelect(food)}
          >
            <span className="food-item-name">{food.name}</span>
            <span className="food-item-type">{food.type}</span>
          </button>
        ))}
      </div>
      {selectedFood && (
        <div className="food-category-input">
          <div className="food-category-amount-row">
            <input
              type="number"
              className="food-category-amount-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step={unit === '個' ? '1' : '1'}
            />
            <select
              className="food-category-unit-select"
              value={unit}
              onChange={(e) => {
                const newUnit = e.target.value as 'g' | '個';
                setUnit(newUnit);
                if (newUnit === '個') {
                  setAmount('1');
                } else {
                  setAmount('300');
                }
              }}
            >
              <option value="g">g</option>
              <option value="個">個</option>
            </select>
          </div>
          <button className="food-category-add-button" onClick={handleAddFood}>
            追加
          </button>
        </div>
      )}
    </div>
  );
}
