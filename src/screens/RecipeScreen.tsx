/**
 * Primal Logic - Recipe Screen
 *
 * レシピ登録・保存画面（CustomFoodScreenをベースに実装）
 * 2段階UI: 材料登録 → レシピ登録
 */

import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  getRecipes,
  saveRecipe,
  updateRecipe,
  deleteRecipe,
  type Recipe,
} from '../utils/recipeStorage';
import { analyzeFoodName } from '../services/aiService';
import { getRandomTip, getRandomTipExcluding, type Tip } from '../data/tips';
import { saveTip, unsaveTip, isTipSaved } from '../utils/savedTips';
import { logError } from '../utils/errorHandler';
import { useTranslation } from '../utils/i18n';
import MiniNutrientGauge from '../components/MiniNutrientGauge';
import { calculateAllMetrics } from '../utils/nutrientCalculator';
import { getCarnivoreTargets } from '../data/carnivoreTargets';
import type { FoodItem } from '../types';
import './RecipeScreen.css';

interface RecipeScreenProps {
  onBack: () => void;
}

// 材料登録用の状態
interface IngredientState {
  foodName: string;
  displayName: string;
  type: 'animal' | 'trash' | 'ruminant' | 'dairy';
  amount: number;
  unit: 'g' | '個';
  nutrients: Record<string, number>;
  isAnalyzing: boolean;
  error: string | null;
  showAdvancedNutrients: boolean;
  aiFollowupQuestions: string[];
  showFollowupInput: boolean;
  followupAnswers: Record<string, string>;
  loadingTip: Tip | null;
  isTipSavedState: boolean;
}

export default function RecipeScreen({ onBack }: RecipeScreenProps) {
  const { t } = useTranslation();
  const { addFood, userProfile } = useApp();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // レシピ情報
  const [recipeName, setRecipeName] = useState('');
  const [recipeDescription, setRecipeDescription] = useState('');
  const [recipeFoods, setRecipeFoods] = useState<FoodItem[]>([]);

  // 材料登録モード（true: 材料登録中, false: レシピ登録中）
  const [isIngredientMode, setIsIngredientMode] = useState(true);

  // 現在の材料登録状態
  const [currentIngredient, setCurrentIngredient] = useState<IngredientState>({
    foodName: '',
    displayName: '',
    type: 'animal',
    amount: 100,
    unit: 'g',
    nutrients: {},
    isAnalyzing: false,
    error: null,
    showAdvancedNutrients: false,
    aiFollowupQuestions: [],
    showFollowupInput: false,
    followupAnswers: {},
    loadingTip: null,
    isTipSavedState: false,
  });

  // 抗栄養素詳細表示用の状態
  const [showAdvancedAntiNutrients, setShowAdvancedAntiNutrients] = useState(false);

  // Tips履歴管理
  const [previousTips, setPreviousTips] = useState<Tip[]>([]);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = () => {
    const allRecipes = getRecipes();
    setRecipes(allRecipes);
  };

  const handleCreateRecipe = () => {
    setRecipeName('');
    setRecipeDescription('');
    setRecipeFoods([]);
    setIsIngredientMode(true);
    setPreviousTips([]);
    setCurrentIngredient({
      foodName: '',
      displayName: '',
      type: 'animal',
      amount: 100,
      unit: 'g',
      nutrients: {},
      isAnalyzing: false,
      error: null,
      showAdvancedNutrients: false,
      aiFollowupQuestions: [],
      showFollowupInput: false,
      followupAnswers: {},
      loadingTip: null,
      isTipSavedState: false,
    });
    setShowCreateModal(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setRecipeName(recipe.name);
    setRecipeDescription(recipe.description || '');
    setRecipeFoods([...recipe.foods]);
    setIsIngredientMode(true);
    setPreviousTips([]);
    setCurrentIngredient({
      foodName: '',
      displayName: '',
      type: 'animal',
      amount: 100,
      unit: 'g',
      nutrients: {},
      isAnalyzing: false,
      error: null,
      showAdvancedNutrients: false,
      aiFollowupQuestions: [],
      showFollowupInput: false,
      followupAnswers: {},
      loadingTip: null,
      isTipSavedState: false,
    });
    setShowEditModal(true);
  };

  // 食品名から栄養素を推測（CustomFoodScreenと同じ）
  const handleAnalyze = async () => {
    if (!currentIngredient.foodName.trim()) {
      setCurrentIngredient((prev) => ({ ...prev, error: t('customFood.enterFoodName') }));
      return;
    }

    setCurrentIngredient((prev) => ({ ...prev, isAnalyzing: true, error: null }));

    // ローディング中のTipsを表示
    const randomTip = currentIngredient.loadingTip
      ? getRandomTipExcluding(currentIngredient.loadingTip.id)
      : getRandomTip();
    setCurrentIngredient((prev) => ({
      ...prev,
      loadingTip: randomTip,
      isTipSavedState: isTipSaved(randomTip.id),
    }));

    try {
      const result = await analyzeFoodName(
        currentIngredient.foodName,
        Object.keys(currentIngredient.followupAnswers).length > 0
          ? currentIngredient.followupAnswers
          : undefined
      );

      const ratio = currentIngredient.amount / 100;
      const nutrients: Record<string, number> = {};
      if (result.nutrients) {
        Object.entries(result.nutrients).forEach(([key, value]) => {
          nutrients[key] = (value as number) * ratio;
        });
      }

      setCurrentIngredient((prev) => ({
        ...prev,
        foodName: result.foodName,
        displayName: result.foodName,
        type: (result.type === 'plant' ? 'animal' : result.type) as
          | 'animal'
          | 'trash'
          | 'ruminant'
          | 'dairy',
        nutrients,
        aiFollowupQuestions: result.followupQuestions || [],
        showFollowupInput:
          (result.followupQuestions && result.followupQuestions.length > 0) || false,
        loadingTip: null,
      }));
    } catch (err) {
      setCurrentIngredient((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : t('customFood.analyzeFailed'),
      }));
    } finally {
      setCurrentIngredient((prev) => ({ ...prev, isAnalyzing: false }));
    }
  };

  // 材料を追加（連続登録可能）
  const handleAddIngredient = () => {
    if (!currentIngredient.foodName.trim()) {
      setCurrentIngredient((prev) => ({ ...prev, error: t('customFood.enterFoodName') }));
      return;
    }

    const ratio = currentIngredient.amount / 100;
    const food: FoodItem = {
      item: currentIngredient.displayName || currentIngredient.foodName,
      amount: currentIngredient.amount,
      unit: currentIngredient.unit,
      type: currentIngredient.type,
      nutrients: Object.fromEntries(
        Object.entries(currentIngredient.nutrients).map(([key, value]) => [
          key,
          (value || 0) * ratio,
        ])
      ) as FoodItem['nutrients'],
    };

    setRecipeFoods([...recipeFoods, food]);

    // 材料登録状態をリセット（連続登録のため）
    setCurrentIngredient({
      foodName: '',
      displayName: '',
      type: 'animal',
      amount: 100,
      unit: 'g',
      nutrients: {},
      isAnalyzing: false,
      error: null,
      showAdvancedNutrients: false,
      aiFollowupQuestions: [],
      showFollowupInput: false,
      followupAnswers: {},
      loadingTip: null,
      isTipSavedState: false,
    });
  };

  // 材料登録を完了してレシピ登録モードに移行
  const handleFinishIngredients = () => {
    if (recipeFoods.length === 0) {
      alert(t('recipe.addFood'));
      return;
    }
    setIsIngredientMode(false);
  };

  // レシピを保存
  const handleSaveRecipe = () => {
    if (!recipeName.trim()) {
      alert(t('recipe.nameRequired'));
      return;
    }

    if (recipeFoods.length === 0) {
      alert(t('recipe.addFood'));
      return;
    }

    try {
      if (showEditModal && selectedRecipe) {
        updateRecipe(selectedRecipe.id, {
          name: recipeName,
          description: recipeDescription,
          foods: recipeFoods,
        });
      } else {
        saveRecipe({
          name: recipeName,
          description: recipeDescription,
          foods: recipeFoods,
        });
      }
      loadRecipes();
      setShowCreateModal(false);
      setShowEditModal(false);
      setSelectedRecipe(null);
      setIsIngredientMode(true);
    } catch (error) {
      logError(error, { component: 'RecipeScreen', action: 'handleSaveRecipe' });
      alert(t('recipe.saveFailed'));
    }
  };

  const handleDeleteRecipe = (id: string) => {
    if (!window.confirm(t('recipe.deleteConfirm'))) {
      return;
    }

    try {
      deleteRecipe(id);
      loadRecipes();
    } catch (error) {
      logError(error, { component: 'RecipeScreen', action: 'handleDeleteRecipe' });
      alert(t('recipe.deleteFailed'));
    }
  };

  const handleUseRecipe = (recipe: Recipe) => {
    recipe.foods.forEach((food) => {
      addFood(food);
    });
    alert(t('recipe.added', { name: recipe.name }));
    onBack();
  };

  // 栄養素の値を更新
  const updateNutrient = (key: string, value: number | undefined) => {
    setCurrentIngredient((prev) => ({
      ...prev,
      nutrients: {
        ...prev.nutrients,
        [key]: value === undefined || value === 0 ? undefined : value,
      },
    }));
  };

  // レシピの栄養素を計算
  const recipeMetrics = useMemo(() => {
    if (recipeFoods.length === 0) return null;
    return calculateAllMetrics(recipeFoods, userProfile);
  }, [recipeFoods, userProfile]);

  // 動的目標値を取得
  const dynamicTargets = useMemo(() => {
    return getCarnivoreTargets(
      userProfile?.gender,
      userProfile?.age,
      userProfile?.activityLevel,
      userProfile?.isPregnant,
      userProfile?.isBreastfeeding,
      userProfile?.isPostMenopause,
      userProfile?.stressLevel,
      userProfile?.sleepHours,
      userProfile?.exerciseIntensity,
      userProfile?.exerciseFrequency,
      userProfile?.thyroidFunction,
      userProfile?.sunExposureFrequency,
      userProfile?.digestiveIssues,
      userProfile?.inflammationLevel,
      userProfile?.mentalHealthStatus,
      userProfile?.supplementMagnesium,
      userProfile?.supplementVitaminD,
      userProfile?.supplementIodine,
      userProfile?.alcoholFrequency,
      userProfile?.caffeineIntake,
      userProfile?.daysOnCarnivore,
      userProfile?.carnivoreStartDate,
      userProfile?.forceAdaptationMode,
      userProfile?.bodyComposition,
      userProfile?.weight,
      userProfile?.metabolicStressIndicators,
      userProfile?.customNutrientTargets
        ? Object.fromEntries(
            Object.entries(userProfile.customNutrientTargets).map(([key, value]) => [
              key,
              typeof value === 'number' ? { mode: 'manual' as const, value } : value,
            ])
          )
        : undefined
    );
  }, [userProfile]);

  // 栄養素ゲージの設定
  const nutrientGauges = useMemo(() => {
    if (!recipeMetrics || !dynamicTargets) return [];

    const getNutrientColor = (key: string): string => {
      const colors: Record<string, string> = {
        protein: '#ef4444',
        fat: '#f97316',
        iron: '#dc2626',
        magnesium: '#f43f5e',
        vitamin_d: '#fbbf24',
        sodium: '#f43f5e',
        potassium: '#8b5cf6',
        zinc: '#6366f1',
      };
      return colors[key] || '#78716c';
    };

    return [
      {
        key: 'protein',
        label: 'タンパク質',
        current: recipeMetrics.effectiveProtein || 0,
        target: dynamicTargets.protein,
        unit: 'g',
        color: getNutrientColor('protein'),
      },
      {
        key: 'fat',
        label: '脂質',
        current: recipeMetrics.fatTotal || 0,
        target: dynamicTargets.fat,
        unit: 'g',
        color: getNutrientColor('fat'),
      },
      {
        key: 'iron',
        label: '鉄分',
        current: recipeMetrics.effectiveIron || 0,
        target: dynamicTargets.iron,
        unit: 'mg',
        color: getNutrientColor('iron'),
      },
      {
        key: 'magnesium',
        label: 'マグネシウム',
        current: recipeMetrics.magnesiumTotal || 0,
        target: dynamicTargets.magnesium,
        unit: 'mg',
        color: getNutrientColor('magnesium'),
      },
      {
        key: 'sodium',
        label: 'ナトリウム',
        current: recipeMetrics.sodiumTotal || 0,
        target: dynamicTargets.sodium || 5000,
        unit: 'mg',
        color: getNutrientColor('sodium'),
      },
      {
        key: 'potassium',
        label: 'カリウム',
        current: recipeMetrics.potassiumTotal || 0,
        target: dynamicTargets.potassium,
        unit: 'mg',
        color: getNutrientColor('potassium'),
      },
    ].filter((config) => config.target > 0);
  }, [recipeMetrics, dynamicTargets]);

  const handleRemoveFoodFromRecipe = (index: number) => {
    const newFoods = recipeFoods.filter((_, i) => i !== index);
    setRecipeFoods(newFoods);
  };

  return (
    <div className="recipe-screen-container">
      <div className="recipe-screen-content">
        <div className="recipe-screen-header">
          <button onClick={onBack} className="recipe-screen-back-button">
            {t('recipe.back')}
          </button>
          <h1 className="recipe-screen-title">{t('recipe.title')}</h1>
        </div>

        <button onClick={handleCreateRecipe} className="recipe-screen-create-button">
          {t('recipe.createNew')}
        </button>

        <div className="recipe-screen-list">
          {recipes.length === 0 ? (
            <div className="recipe-screen-empty">
              <p>{t('recipe.noRecipes')}</p>
              <p style={{ fontSize: '14px', color: '#78716c', marginTop: '0.5rem' }}>
                {t('recipe.noRecipesDescription')}
              </p>
            </div>
          ) : (
            recipes.map((recipe) => (
              <div key={recipe.id} className="recipe-screen-item">
                <div className="recipe-screen-item-header">
                  <h3 className="recipe-screen-item-name">{recipe.name}</h3>
                  <div className="recipe-screen-item-actions">
                    <button
                      onClick={() => handleUseRecipe(recipe)}
                      className="recipe-screen-item-button recipe-screen-item-use"
                    >
                      {t('recipe.use')}
                    </button>
                    <button
                      onClick={() => handleEditRecipe(recipe)}
                      className="recipe-screen-item-button recipe-screen-item-edit"
                    >
                      {t('recipe.edit')}
                    </button>
                    <button
                      onClick={() => handleDeleteRecipe(recipe.id)}
                      className="recipe-screen-item-button recipe-screen-item-delete"
                    >
                      {t('recipe.delete')}
                    </button>
                  </div>
                </div>
                {recipe.description && (
                  <p className="recipe-screen-item-description">{recipe.description}</p>
                )}
                <div className="recipe-screen-item-foods">
                  <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem' }}>
                    {t('recipe.containsFoods')}
                  </p>
                  <ul>
                    {recipe.foods.map((food, index) => (
                      <li key={index} style={{ fontSize: '14px', marginBottom: '0.25rem' }}>
                        {food.item} - {food.amount}
                        {food.unit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 作成/編集モーダル */}
        {(showCreateModal || showEditModal) && (
          <div
            className="recipe-screen-modal-overlay"
            onClick={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
              setIsIngredientMode(true);
            }}
          >
            <div className="recipe-screen-modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="recipe-screen-modal-title">
                {isIngredientMode
                  ? showEditModal
                    ? t('recipe.editTitle')
                    : t('recipe.createTitle')
                  : showEditModal
                    ? t('recipe.editTitle')
                    : t('recipe.createTitle')}
              </h2>

              {isIngredientMode ? (
                /* 材料登録モード */
                <div className="recipe-screen-modal-form">
                  <div
                    style={{
                      marginBottom: '1rem',
                      padding: '0.75rem',
                      backgroundColor: '#eff6ff',
                      borderRadius: '8px',
                      border: '1px solid #f43f5e',
                    }}
                  >
                    <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem' }}>
                      📝 材料登録モード（{recipeFoods.length}個の材料を登録済み）
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>
                      材料を追加したら「材料登録を完了」ボタンを押して、レシピ情報を入力してください。
                    </p>
                  </div>

                  {currentIngredient.error && (
                    <div
                      className="error-message"
                      style={{
                        color: '#dc2626',
                        padding: '0.75rem',
                        marginBottom: '1rem',
                        backgroundColor: '#fef2f2',
                        borderRadius: '8px',
                      }}
                    >
                      {currentIngredient.error}
                    </div>
                  )}

                  {/* 食品名入力とAI推測（CustomFoodScreenと同じ） */}
                  <div className="custom-food-section">
                    <label>
                      <strong>{t('customFood.foodName')}</strong>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginTop: '0.25rem',
                          marginBottom: '0.5rem',
                        }}
                      >
                        {t('customFood.foodNameDescription')}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <input
                          type="text"
                          value={currentIngredient.foodName}
                          onChange={(e) => {
                            const newFoodName = e.target.value;
                            setCurrentIngredient((prev) => ({
                              ...prev,
                              foodName: newFoodName,
                              displayName: newFoodName,
                            }));
                          }}
                          placeholder={t('customFood.foodNamePlaceholder')}
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                          }}
                        />
                        <button
                          onClick={handleAnalyze}
                          disabled={
                            currentIngredient.isAnalyzing || !currentIngredient.foodName.trim()
                          }
                          style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: currentIngredient.isAnalyzing ? '#9ca3af' : '#f43f5e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: currentIngredient.isAnalyzing ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                          }}
                        >
                          {currentIngredient.isAnalyzing
                            ? t('customFood.analyzing')
                            : t('customFood.aiSuggest')}
                        </button>
                      </div>
                    </label>

                    <label style={{ marginTop: '1rem', display: 'block' }}>
                      <strong>{t('customFood.displayName')}</strong>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginTop: '0.25rem',
                          marginBottom: '0.5rem',
                        }}
                      >
                        {t('customFood.displayNameDescription')}
                      </div>
                      <input
                        type="text"
                        value={currentIngredient.displayName}
                        onChange={(e) =>
                          setCurrentIngredient((prev) => ({ ...prev, displayName: e.target.value }))
                        }
                        placeholder={
                          currentIngredient.foodName || t('customFood.displayNamePlaceholder')
                        }
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          marginTop: '0.5rem',
                        }}
                      />
                    </label>

                    {/* 数量入力 */}
                    <label style={{ marginTop: '1rem', display: 'block' }}>
                      <strong>数量</strong>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          marginTop: '0.5rem',
                          alignItems: 'center',
                        }}
                      >
                        <input
                          type="number"
                          value={currentIngredient.amount}
                          onChange={(e) =>
                            setCurrentIngredient((prev) => ({
                              ...prev,
                              amount: Number(e.target.value),
                            }))
                          }
                          min="0"
                          step="10"
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                          }}
                        />
                        <select
                          value={currentIngredient.unit}
                          onChange={(e) =>
                            setCurrentIngredient((prev) => ({
                              ...prev,
                              unit: e.target.value as 'g' | '個',
                            }))
                          }
                          style={{
                            padding: '0.75rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                          }}
                        >
                          <option value="g">g</option>
                          <option value="個">個</option>
                        </select>
                      </div>
                    </label>

                    {/* AIローディング中のTips表示 */}
                    {currentIngredient.isAnalyzing && currentIngredient.loadingTip && (
                      <div
                        style={{
                          marginTop: '1rem',
                          padding: '1rem',
                          backgroundColor: '#fef3c7',
                          border: '1px solid #fbbf24',
                          borderRadius: '8px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '0.5rem',
                          }}
                        >
                          <div style={{ fontWeight: '600', color: '#92400e', flex: 1 }}>
                            💡 {currentIngredient.loadingTip.title}
                          </div>
                          <button
                            onClick={() => {
                              if (currentIngredient.isTipSavedState) {
                                unsaveTip(currentIngredient.loadingTip!.id);
                              } else {
                                saveTip(currentIngredient.loadingTip!.id);
                              }
                              setCurrentIngredient((prev) => ({
                                ...prev,
                                isTipSavedState: !prev.isTipSavedState,
                              }));
                            }}
                            style={{
                              background: currentIngredient.isTipSavedState ? '#fef3c7' : 'none',
                              border: currentIngredient.isTipSavedState
                                ? '1px solid #f59e0b'
                                : '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '16px',
                              cursor: 'pointer',
                              color: currentIngredient.isTipSavedState ? '#f59e0b' : '#6b7280',
                              padding: '0.25rem 0.5rem',
                              minWidth: '32px',
                              height: '32px',
                            }}
                          >
                            ⭐
                          </button>
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#78350f',
                            lineHeight: '1.5',
                            marginBottom: '0.5rem',
                          }}
                        >
                          {currentIngredient.loadingTip.content.substring(0, 150)}...
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          {previousTips.length > 0 && (
                            <button
                              onClick={() => {
                                const prevTip = previousTips[previousTips.length - 1];
                                setPreviousTips((prev) => prev.slice(0, -1));
                                setCurrentIngredient((prev) => ({
                                  ...prev,
                                  loadingTip: prevTip,
                                  isTipSavedState: isTipSaved(prevTip.id),
                                }));
                              }}
                              style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#f3f4f6',
                                color: '#374151',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              戻る
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (currentIngredient.loadingTip) {
                                setPreviousTips((prev) => [...prev, currentIngredient.loadingTip!]);
                              }
                              const nextTip = getRandomTipExcluding(
                                currentIngredient.loadingTip!.id
                              );
                              setCurrentIngredient((prev) => ({
                                ...prev,
                                loadingTip: nextTip,
                                isTipSavedState: isTipSaved(nextTip.id),
                              }));
                            }}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                          >
                            {t('customFood.nextTip')}
                          </button>
                        </div>
                        <div style={{ clear: 'both' }} />
                      </div>
                    )}
                  </div>

                  {/* 食品タイプ */}
                  <div
                    className="custom-food-section"
                    style={{
                      backgroundColor: '#f9fafb',
                      padding: '1rem',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: '#f43f5e',
                          color: 'white',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 'bold',
                        }}
                      >
                        2
                      </span>
                      <strong style={{ fontSize: '16px' }}>{t('customFood.foodType')}</strong>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginTop: '0.5rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      {(['animal', 'trash'] as const).map((foodType) => (
                        <button
                          key={foodType}
                          onClick={() =>
                            setCurrentIngredient((prev) => ({ ...prev, type: foodType }))
                          }
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor:
                              currentIngredient.type === foodType ? '#f43f5e' : '#f3f4f6',
                            color: currentIngredient.type === foodType ? 'white' : '#374151',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                          }}
                        >
                          {foodType === 'animal'
                            ? t('customFood.foodTypeAnimal')
                            : t('customFood.foodTypeTrash')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ステップ3: 栄養素（必須） */}
                  <div
                    className="custom-food-section"
                    style={{
                      backgroundColor: '#f9fafb',
                      padding: '1rem',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: '#f43f5e',
                          color: 'white',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 'bold',
                        }}
                      >
                        3
                      </span>
                      <strong style={{ fontSize: '16px' }}>
                        {t('customFood.nutrientsRequired')}
                      </strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '0.75rem' }}>
                      {t('customFood.nutrientsPer100g')}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        padding: '1rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                      }}
                    >
                      {/* タンパク質 */}
                      <div>
                        <MiniNutrientGauge
                          label={t('customFood.protein')}
                          currentDailyTotal={currentIngredient.nutrients?.protein || 0}
                          previewAmount={0}
                          target={100}
                          color="#64748b"
                          unit="g/100g"
                          nutrientKey="protein"
                        />
                        <input
                          type="number"
                          value={currentIngredient.nutrients?.protein || ''}
                          onChange={(e) =>
                            updateNutrient(
                              'protein',
                              e.target.value ? parseFloat(e.target.value) : undefined
                            )
                          }
                          placeholder="0"
                          step="0.1"
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            marginTop: '0.5rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                          }}
                        />
                      </div>

                      {/* 脂質 */}
                      <div>
                        <MiniNutrientGauge
                          label={t('customFood.fat')}
                          currentDailyTotal={currentIngredient.nutrients?.fat || 0}
                          previewAmount={0}
                          target={100}
                          color="#64748b"
                          unit="g/100g"
                          nutrientKey="fat"
                        />
                        <input
                          type="number"
                          value={currentIngredient.nutrients?.fat || ''}
                          onChange={(e) =>
                            updateNutrient(
                              'fat',
                              e.target.value ? parseFloat(e.target.value) : undefined
                            )
                          }
                          placeholder="0"
                          step="0.1"
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            marginTop: '0.5rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                          }}
                        />
                      </div>

                      {/* 炭水化物 */}
                      <div>
                        <MiniNutrientGauge
                          label={t('customFood.carbs')}
                          currentDailyTotal={currentIngredient.nutrients?.carbs || 0}
                          previewAmount={0}
                          target={100}
                          color="#64748b"
                          unit="g/100g"
                        />
                        <input
                          type="number"
                          value={currentIngredient.nutrients?.carbs || ''}
                          onChange={(e) =>
                            updateNutrient(
                              'carbs',
                              e.target.value ? parseFloat(e.target.value) : undefined
                            )
                          }
                          placeholder="0"
                          step="0.1"
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            marginTop: '0.5rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ステップ4: 栄養素（詳細） */}
                  <div
                    className="custom-food-section"
                    style={{
                      backgroundColor: '#f9fafb',
                      padding: '1rem',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          style={{
                            backgroundColor: '#f43f5e',
                            color: 'white',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 'bold',
                          }}
                        >
                          4
                        </span>
                        <strong style={{ fontSize: '16px' }}>
                          {t('customFood.nutrientsDetailed')}
                        </strong>
                      </div>
                      <button
                        onClick={() =>
                          setCurrentIngredient((prev) => ({
                            ...prev,
                            showAdvancedNutrients: !prev.showAdvancedNutrients,
                          }))
                        }
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: currentIngredient.showAdvancedNutrients
                            ? '#f43f5e'
                            : '#f3f4f6',
                          color: currentIngredient.showAdvancedNutrients ? 'white' : '#374151',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                        }}
                      >
                        {currentIngredient.showAdvancedNutrients
                          ? t('customFood.hideDetails')
                          : t('customFood.showDetails')}
                      </button>
                    </div>
                    {currentIngredient.showAdvancedNutrients && (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '1rem',
                        }}
                      >
                        {/* CustomFoodScreenと同じ詳細栄養素フィールドを追加 */}
                        <label>
                          {t('customFood.sodium')} (mg/100g)
                          <MiniNutrientGauge
                            label={t('customFood.sodium')}
                            currentDailyTotal={currentIngredient.nutrients?.sodium || 0}
                            previewAmount={0}
                            target={5000}
                            color="#64748b"
                            unit="mg/100g"
                            nutrientKey="sodium"
                          />
                          <input
                            type="number"
                            value={currentIngredient.nutrients?.sodium || ''}
                            onChange={(e) =>
                              updateNutrient(
                                'sodium',
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
                            }
                            placeholder="0"
                            step="0.1"
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              marginTop: '0.25rem',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                            }}
                          />
                        </label>
                        <label>
                          {t('customFood.magnesium')} (mg/100g)
                          <MiniNutrientGauge
                            label={t('customFood.magnesium')}
                            currentDailyTotal={currentIngredient.nutrients?.magnesium || 0}
                            previewAmount={0}
                            target={600}
                            color="#64748b"
                            unit="mg/100g"
                            nutrientKey="magnesium"
                          />
                          <input
                            type="number"
                            value={currentIngredient.nutrients?.magnesium || ''}
                            onChange={(e) =>
                              updateNutrient(
                                'magnesium',
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
                            }
                            placeholder="0"
                            step="0.1"
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              marginTop: '0.25rem',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                            }}
                          />
                        </label>
                        <label>
                          {t('customFood.potassium')} (mg/100g)
                          <MiniNutrientGauge
                            label={t('customFood.potassium')}
                            currentDailyTotal={currentIngredient.nutrients?.potassium || 0}
                            previewAmount={0}
                            target={4500}
                            color="#64748b"
                            unit="mg/100g"
                            nutrientKey="potassium"
                          />
                          <input
                            type="number"
                            value={currentIngredient.nutrients?.potassium || ''}
                            onChange={(e) =>
                              updateNutrient(
                                'potassium',
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
                            }
                            placeholder="0"
                            step="0.1"
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              marginTop: '0.25rem',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                            }}
                          />
                        </label>
                        <label>
                          {t('customFood.zinc')} (mg/100g)
                          <MiniNutrientGauge
                            label={t('customFood.zinc')}
                            currentDailyTotal={currentIngredient.nutrients?.zinc || 0}
                            previewAmount={0}
                            target={11}
                            color="#64748b"
                            unit="mg/100g"
                            nutrientKey="zinc"
                          />
                          <input
                            type="number"
                            value={currentIngredient.nutrients?.zinc || ''}
                            onChange={(e) =>
                              updateNutrient(
                                'zinc',
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
                            }
                            placeholder="0"
                            step="0.01"
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              marginTop: '0.25rem',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                            }}
                          />
                        </label>
                        <label>
                          {t('customFood.iron')} (mg/100g)
                          <MiniNutrientGauge
                            label={t('customFood.iron')}
                            currentDailyTotal={
                              (currentIngredient.nutrients?.hemeIron || 0) +
                              (currentIngredient.nutrients?.nonHemeIron || 0)
                            }
                            previewAmount={0}
                            target={8}
                            color="#64748b"
                            unit="mg/100g"
                            nutrientKey="iron"
                          />
                          <input
                            type="number"
                            value={
                              (currentIngredient.nutrients?.hemeIron || 0) +
                                (currentIngredient.nutrients?.nonHemeIron || 0) || ''
                            }
                            onChange={(e) => {
                              const totalIron = e.target.value ? parseFloat(e.target.value) : 0;
                              updateNutrient('hemeIron', totalIron);
                              updateNutrient('nonHemeIron', 0);
                            }}
                            placeholder="0"
                            step="0.01"
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              marginTop: '0.25rem',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                            }}
                          />
                        </label>
                        <label>
                          {t('customFood.vitaminA')} (IU/100g)
                          <MiniNutrientGauge
                            label={t('customFood.vitaminA')}
                            currentDailyTotal={currentIngredient.nutrients?.vitaminA || 0}
                            previewAmount={0}
                            target={5000}
                            color="#64748b"
                            unit="IU/100g"
                            nutrientKey="vitamin_a"
                          />
                          <input
                            type="number"
                            value={currentIngredient.nutrients?.vitaminA || ''}
                            onChange={(e) =>
                              updateNutrient(
                                'vitaminA',
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
                            }
                            placeholder="0"
                            step="1"
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              marginTop: '0.25rem',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                            }}
                          />
                        </label>
                        <label>
                          {t('customFood.vitaminD')} (IU/100g)
                          <MiniNutrientGauge
                            label={t('customFood.vitaminD')}
                            currentDailyTotal={currentIngredient.nutrients?.vitaminD || 0}
                            previewAmount={0}
                            target={2000}
                            color="#64748b"
                            unit="IU/100g"
                            nutrientKey="vitamin_d"
                          />
                          <input
                            type="number"
                            value={currentIngredient.nutrients?.vitaminD || ''}
                            onChange={(e) =>
                              updateNutrient(
                                'vitaminD',
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
                            }
                            placeholder="0"
                            step="0.1"
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              marginTop: '0.25rem',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                            }}
                          />
                        </label>
                        <label>
                          {t('customFood.vitaminK2')} (μg/100g)
                          <MiniNutrientGauge
                            label={t('customFood.vitaminK2')}
                            currentDailyTotal={currentIngredient.nutrients?.vitaminK2 || 0}
                            previewAmount={0}
                            target={200}
                            color="#64748b"
                            unit="μg/100g"
                            nutrientKey="vitamin_k2"
                          />
                          <input
                            type="number"
                            value={currentIngredient.nutrients?.vitaminK2 || ''}
                            onChange={(e) =>
                              updateNutrient(
                                'vitaminK2',
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
                            }
                            placeholder="0"
                            step="0.1"
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              marginTop: '0.25rem',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                            }}
                          />
                        </label>
                        <label>
                          {t('customFood.vitaminB12')} (μg/100g)
                          <MiniNutrientGauge
                            label={t('customFood.vitaminB12')}
                            currentDailyTotal={currentIngredient.nutrients?.vitaminB12 || 0}
                            previewAmount={0}
                            target={2.4}
                            color="#64748b"
                            unit="μg/100g"
                            nutrientKey="vitamin_b12"
                          />
                          <input
                            type="number"
                            value={currentIngredient.nutrients?.vitaminB12 || ''}
                            onChange={(e) =>
                              updateNutrient(
                                'vitaminB12',
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
                            }
                            placeholder="0"
                            step="0.01"
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              marginTop: '0.25rem',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                            }}
                          />
                        </label>
                        <label>
                          {t('customFood.omega3')} (g/100g)
                          <MiniNutrientGauge
                            label={t('customFood.omega3')}
                            currentDailyTotal={currentIngredient.nutrients?.omega3 || 0}
                            previewAmount={0}
                            target={2}
                            color="#64748b"
                            unit="g/100g"
                            nutrientKey="omega3"
                          />
                          <input
                            type="number"
                            value={currentIngredient.nutrients?.omega3 || ''}
                            onChange={(e) =>
                              updateNutrient(
                                'omega3',
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
                            }
                            placeholder="0"
                            step="0.01"
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              marginTop: '0.25rem',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                            }}
                          />
                        </label>
                        <label>
                          {t('customFood.omega6')} (g/100g)
                          <MiniNutrientGauge
                            label={t('customFood.omega6')}
                            currentDailyTotal={currentIngredient.nutrients?.omega6 || 0}
                            previewAmount={0}
                            target={5}
                            color="#64748b"
                            unit="g/100g"
                            nutrientKey="omega6"
                          />
                          <input
                            type="number"
                            value={currentIngredient.nutrients?.omega6 || ''}
                            onChange={(e) =>
                              updateNutrient(
                                'omega6',
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
                            }
                            placeholder="0"
                            step="0.01"
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              marginTop: '0.25rem',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                            }}
                          />
                        </label>
                        <label>
                          {t('customFood.calcium')} (mg/100g)
                          <MiniNutrientGauge
                            label={t('customFood.calcium')}
                            currentDailyTotal={currentIngredient.nutrients?.calcium || 0}
                            previewAmount={0}
                            target={1000}
                            color="#64748b"
                            unit="mg/100g"
                            nutrientKey="calcium"
                          />
                          <input
                            type="number"
                            value={currentIngredient.nutrients?.calcium || ''}
                            onChange={(e) =>
                              updateNutrient(
                                'calcium',
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
                            }
                            placeholder="0"
                            step="0.1"
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              marginTop: '0.25rem',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                            }}
                          />
                        </label>
                        <label>
                          {t('customFood.phosphorus')} (mg/100g)
                          <MiniNutrientGauge
                            label={t('customFood.phosphorus')}
                            currentDailyTotal={currentIngredient.nutrients?.phosphorus || 0}
                            previewAmount={0}
                            target={700}
                            color="#64748b"
                            unit="mg/100g"
                            nutrientKey="phosphorus"
                          />
                          <input
                            type="number"
                            value={currentIngredient.nutrients?.phosphorus || ''}
                            onChange={(e) =>
                              updateNutrient(
                                'phosphorus',
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
                            }
                            placeholder="0"
                            step="0.1"
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              marginTop: '0.25rem',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                            }}
                          />
                        </label>
                        <label>
                          {t('customFood.glycine')} (g/100g)
                          <MiniNutrientGauge
                            label={t('customFood.glycine')}
                            currentDailyTotal={currentIngredient.nutrients?.glycine || 0}
                            previewAmount={0}
                            target={10}
                            color="#64748b"
                            unit="g/100g"
                            nutrientKey="glycine"
                          />
                          <input
                            type="number"
                            value={currentIngredient.nutrients?.glycine || ''}
                            onChange={(e) =>
                              updateNutrient(
                                'glycine',
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
                            }
                            placeholder="0"
                            step="0.01"
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              marginTop: '0.25rem',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                            }}
                          />
                        </label>
                        <label>
                          {t('customFood.methionine')} (g/100g)
                          <MiniNutrientGauge
                            label={t('customFood.methionine')}
                            currentDailyTotal={currentIngredient.nutrients?.methionine || 0}
                            previewAmount={0}
                            target={2}
                            color="#64748b"
                            unit="g/100g"
                            nutrientKey="methionine"
                          />
                          <input
                            type="number"
                            value={currentIngredient.nutrients?.methionine || ''}
                            onChange={(e) =>
                              updateNutrient(
                                'methionine',
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
                            }
                            placeholder="0"
                            step="0.01"
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              marginTop: '0.25rem',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                            }}
                          />
                        </label>
                        <label>
                          {t('customFood.taurine')} (mg/100g)
                          <MiniNutrientGauge
                            label={t('customFood.taurine')}
                            currentDailyTotal={currentIngredient.nutrients?.taurine || 0}
                            previewAmount={0}
                            target={500}
                            color="#64748b"
                            unit="mg/100g"
                            nutrientKey="taurine"
                          />
                          <input
                            type="number"
                            value={currentIngredient.nutrients?.taurine || ''}
                            onChange={(e) =>
                              updateNutrient(
                                'taurine',
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
                            }
                            placeholder="0"
                            step="0.1"
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              marginTop: '0.25rem',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* ステップ5: 抗栄養素 */}
                  {
                    <div
                      className="custom-food-section"
                      style={{
                        backgroundColor: '#f9fafb',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: '#f43f5e',
                            color: 'white',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 'bold',
                          }}
                        >
                          5
                        </span>
                        <strong style={{ fontSize: '16px' }}>
                          {t('customFood.antiNutrients')}
                        </strong>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '0.5rem',
                        }}
                      >
                        <label>
                          {t('customFood.phytates')} (mg/100g)
                          <MiniNutrientGauge
                            label={t('customFood.phytates')}
                            currentDailyTotal={currentIngredient.nutrients?.phytates || 0}
                            previewAmount={0}
                            target={0}
                            color="#ef4444"
                            unit="mg/100g"
                            nutrientKey="phytates"
                          />
                          <input
                            type="number"
                            value={currentIngredient.nutrients?.phytates || ''}
                            onChange={(e) =>
                              updateNutrient(
                                'phytates',
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
                            }
                            placeholder="0"
                            step="0.1"
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              marginTop: '0.25rem',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                            }}
                          />
                        </label>
                        <label>
                          {t('customFood.oxalates')} (mg/100g)
                          <MiniNutrientGauge
                            label={t('customFood.oxalates')}
                            currentDailyTotal={currentIngredient.nutrients?.oxalates || 0}
                            previewAmount={0}
                            target={0}
                            color="#ef4444"
                            unit="mg/100g"
                            nutrientKey="oxalates"
                          />
                          <input
                            type="number"
                            value={currentIngredient.nutrients?.oxalates || ''}
                            onChange={(e) =>
                              updateNutrient(
                                'oxalates',
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
                            }
                            placeholder="0"
                            step="0.1"
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              marginTop: '0.25rem',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                            }}
                          />
                        </label>
                        <label>
                          {t('customFood.lectins')} (mg/100g)
                          <MiniNutrientGauge
                            label={t('customFood.lectins')}
                            currentDailyTotal={currentIngredient.nutrients?.lectins || 0}
                            previewAmount={0}
                            target={0}
                            color="#ef4444"
                            unit="mg/100g"
                            nutrientKey="lectins"
                          />
                          <input
                            type="number"
                            value={currentIngredient.nutrients?.lectins || ''}
                            onChange={(e) =>
                              updateNutrient(
                                'lectins',
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
                            }
                            placeholder="0"
                            step="0.1"
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              marginTop: '0.25rem',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  }

                  {/* ステップ6: 抗栄養素（詳細） */}
                  {
                    <div
                      className="custom-food-section"
                      style={{
                        backgroundColor: '#f9fafb',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span
                            style={{
                              backgroundColor: '#f43f5e',
                              color: 'white',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              fontWeight: 'bold',
                            }}
                          >
                            6
                          </span>
                          <strong style={{ fontSize: '16px' }}>抗栄養素（詳細）</strong>
                        </div>
                        <button
                          onClick={() => setShowAdvancedAntiNutrients(!showAdvancedAntiNutrients)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: showAdvancedAntiNutrients ? '#f43f5e' : '#f3f4f6',
                            color: showAdvancedAntiNutrients ? 'white' : '#374151',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                          }}
                        >
                          {showAdvancedAntiNutrients ? '詳細を非表示' : '詳細を表示'}
                        </button>
                      </div>
                      {showAdvancedAntiNutrients && (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem',
                          }}
                        >
                          <label>
                            {t('customFood.polyphenols')} (mg/100g)
                            <input
                              type="number"
                              value={currentIngredient.nutrients?.polyphenols || ''}
                              onChange={(e) =>
                                updateNutrient(
                                  'polyphenols',
                                  e.target.value ? parseFloat(e.target.value) : undefined
                                )
                              }
                              placeholder="0"
                              step="0.1"
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                marginTop: '0.25rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '4px',
                              }}
                            />
                          </label>
                          <label>
                            {t('customFood.flavonoids')} (mg/100g)
                            <input
                              type="number"
                              value={currentIngredient.nutrients?.flavonoids || ''}
                              onChange={(e) =>
                                updateNutrient(
                                  'flavonoids',
                                  e.target.value ? parseFloat(e.target.value) : undefined
                                )
                              }
                              placeholder="0"
                              step="0.1"
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                marginTop: '0.25rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '4px',
                              }}
                            />
                          </label>
                          <label>
                            {t('customFood.saponins')} (mg/100g)
                            <input
                              type="number"
                              value={currentIngredient.nutrients?.saponins || ''}
                              onChange={(e) =>
                                updateNutrient(
                                  'saponins',
                                  e.target.value ? parseFloat(e.target.value) : undefined
                                )
                              }
                              placeholder="0"
                              step="0.1"
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                marginTop: '0.25rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '4px',
                              }}
                            />
                          </label>
                          <label>
                            {t('customFood.goitrogens')} (mg/100g)
                            <input
                              type="number"
                              value={currentIngredient.nutrients?.goitrogens || ''}
                              onChange={(e) =>
                                updateNutrient(
                                  'goitrogens',
                                  e.target.value ? parseFloat(e.target.value) : undefined
                                )
                              }
                              placeholder="0"
                              step="0.1"
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                marginTop: '0.25rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '4px',
                              }}
                            />
                          </label>
                          <label>
                            {t('customFood.tannins')} (mg/100g)
                            <input
                              type="number"
                              value={currentIngredient.nutrients?.tannins || ''}
                              onChange={(e) =>
                                updateNutrient(
                                  'tannins',
                                  e.target.value ? parseFloat(e.target.value) : undefined
                                )
                              }
                              placeholder="0"
                              step="0.1"
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                marginTop: '0.25rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '4px',
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  }

                  {/* 登録済み材料一覧 */}
                  {recipeFoods.length > 0 && (
                    <div
                      style={{
                        marginBottom: '1rem',
                        padding: '1rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                      }}
                    >
                      <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem' }}>
                        登録済み材料 ({recipeFoods.length}個)
                      </p>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {recipeFoods.map((food, index) => (
                          <li
                            key={index}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '0.5rem',
                              marginBottom: '0.25rem',
                              backgroundColor: 'white',
                              borderRadius: '4px',
                            }}
                          >
                            <span style={{ fontSize: '14px' }}>
                              {food.item} - {food.amount}
                              {food.unit}
                            </span>
                            <button
                              onClick={() => handleRemoveFoodFromRecipe(index)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#dc2626',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                              }}
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ボタン */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      marginTop: '2rem',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setShowEditModal(false);
                        setIsIngredientMode(true);
                      }}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                      }}
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={handleAddIngredient}
                      disabled={!currentIngredient.foodName.trim()}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: !currentIngredient.foodName.trim() ? '#9ca3af' : '#f43f5e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: !currentIngredient.foodName.trim() ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                      }}
                    >
                      材料を追加
                    </button>
                    <button
                      onClick={handleFinishIngredients}
                      disabled={recipeFoods.length === 0}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: recipeFoods.length === 0 ? '#9ca3af' : '#f43f5e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: recipeFoods.length === 0 ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                      }}
                    >
                      材料登録を完了
                    </button>
                  </div>
                </div>
              ) : (
                /* レシピ登録モード */
                <div className="recipe-screen-modal-form">
                  <div
                    style={{
                      marginBottom: '1rem',
                      padding: '0.75rem',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '8px',
                      border: '1px solid #f43f5e',
                    }}
                  >
                    <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem' }}>
                      ✅ レシピ登録モード（{recipeFoods.length}個の材料を登録済み）
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>
                      レシピ名と説明を入力して、レシピを保存してください。
                    </p>
                  </div>

                  <label className="recipe-screen-modal-label">
                    {t('recipe.name')} *
                    <input
                      type="text"
                      value={recipeName}
                      onChange={(e) => setRecipeName(e.target.value)}
                      className="recipe-screen-modal-input"
                      placeholder={t('recipe.namePlaceholder')}
                    />
                  </label>
                  <label className="recipe-screen-modal-label">
                    {t('recipe.description')}
                    <textarea
                      value={recipeDescription}
                      onChange={(e) => setRecipeDescription(e.target.value)}
                      className="recipe-screen-modal-textarea"
                      placeholder={t('recipe.descriptionPlaceholder')}
                      rows={3}
                    />
                  </label>

                  {/* 登録済み材料一覧 */}
                  <div
                    style={{
                      marginBottom: '1rem',
                      padding: '1rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                    }}
                  >
                    <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem' }}>
                      {t('recipe.containsFoods')} ({recipeFoods.length}個)
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {recipeFoods.map((food, index) => (
                        <li
                          key={index}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.5rem',
                            marginBottom: '0.25rem',
                            backgroundColor: 'white',
                            borderRadius: '4px',
                          }}
                        >
                          <span style={{ fontSize: '14px' }}>
                            {food.item} - {food.amount}
                            {food.unit}
                          </span>
                          <button
                            onClick={() => handleRemoveFoodFromRecipe(index)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              backgroundColor: '#dc2626',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 栄養素ゲージ */}
                  {nutrientGauges.length > 0 && (
                    <div
                      style={{
                        marginBottom: '16px',
                        padding: '12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                      }}
                    >
                      <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        栄養素プレビュー
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {nutrientGauges.map((config) => (
                          <MiniNutrientGauge
                            key={config.key}
                            label={config.label}
                            currentDailyTotal={config.current}
                            previewAmount={0}
                            target={config.target}
                            color={config.color}
                            unit={config.unit}
                            nutrientKey={config.key}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ボタン */}
                  <div className="recipe-screen-modal-actions">
                    <button
                      onClick={() => setIsIngredientMode(true)}
                      className="recipe-screen-modal-cancel"
                    >
                      材料に戻る
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setShowEditModal(false);
                        setIsIngredientMode(true);
                      }}
                      className="recipe-screen-modal-cancel"
                    >
                      {t('recipe.cancel')}
                    </button>
                    <button onClick={handleSaveRecipe} className="recipe-screen-modal-save">
                      {t('recipe.save')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
