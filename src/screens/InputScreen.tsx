/**
 * CarnivOS - Input Screen (Web版)
 *
 * Status & Fuel の入力画面
 * Phase 1: Status (The Machine) + Fuel (The Input)
 */

import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { detectViolationType } from '../utils/recoveryAlgorithm';
import { searchFoods, getFoodById, type FoodData } from '../data/foodsDatabase';
import { calculateVitaminDSynthesis } from '../utils/vitaminDCalculator';
import { calculateAllMetrics } from '../utils/nutrientCalculator';
import { getArgumentCardByNutrient } from '../data/argumentCards';
import ArgumentCard from '../components/ArgumentCard';
import {
  getWeatherData,
  getWeatherVitaminDFactor,
  type WeatherData,
} from '../utils/weatherService';
import { useTranslation } from '../utils/i18n';
import { VoiceInputManager, type VoiceInputResult } from '../utils/voiceInput';
import { getFastingDefaultHours, FASTING_TEMPLATES } from '../utils/fastingDefaults';
import type { FoodItem, CalculatedMetrics } from '../types';
import './InputScreen.css';

interface InputScreenProps {
  onClose?: () => void;
}

export default function InputScreen({ onClose }: InputScreenProps = {}) {
  const { t } = useTranslation();
  const {
    addFood,
    removeFood,
    updateFood,
    updateStatus,
    updateDiary,
    updateWeight,
    updateWaterIntake,
    dailyLog,
    userProfile,
  } = useApp();
  const [sleepScore, setSleepScore] = useState(dailyLog?.status.sleepScore || 80);
  const [sleepHours, setSleepHours] = useState<string>(
    dailyLog?.status.sleepHours?.toString() || ''
  );
  const [sunMinutes, setSunMinutes] = useState(dailyLog?.status.sunMinutes || 30);
  const [isSunny, setIsSunny] = useState(true);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [activityLevel, setActivityLevel] = useState<'high' | 'low' | 'moderate'>(
    dailyLog?.status.activityLevel || 'moderate'
  );
  const [diary, setDiary] = useState(dailyLog?.diary || '');
  const [weight, setWeight] = useState<string>(dailyLog?.weight?.toString() || '');
  const [bodyFatPercentage, setBodyFatPercentage] = useState<string>(
    dailyLog?.bodyFatPercentage?.toString() || ''
  );
  const [bowelMovement, setBowelMovement] = useState<{
    status: 'normal' | 'constipated' | 'loose' | 'watery';
    bristolScale?: number;
    notes?: string;
  }>(dailyLog?.status?.bowelMovement || { status: 'normal' });

  // Fasting timer state
  const [fastingEndTime, setFastingEndTime] = useState<string | null>(() => {
    return localStorage.getItem('primal_logic_fasting_timer_end');
  });
  const [fastingRemainingTime, setFastingRemainingTime] = useState<string>('');

  // Update fasting remaining time every second
  useEffect(() => {
    if (!fastingEndTime) {
      setFastingRemainingTime('');
      return;
    }

    const updateTime = () => {
      const now = Date.now();
      const end = new Date(fastingEndTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setFastingRemainingTime('完了');
        setFastingEndTime(null);
        localStorage.removeItem('primal_logic_fasting_timer_end');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setFastingRemainingTime(`${hours}時間${minutes}分`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [fastingEndTime]);

  const startFasting = (hours: number) => {
    const endAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
    localStorage.setItem('primal_logic_fasting_timer_end', endAt);
    setFastingEndTime(endAt);
  };

  const stopFasting = () => {
    localStorage.removeItem('primal_logic_fasting_timer_end');
    setFastingEndTime(null);
    setFastingRemainingTime('');
  };

  // dailyLogが変更されたら日記・体重・睡眠時間も更新
  useEffect(() => {
    if (dailyLog?.diary !== undefined) {
      setDiary(dailyLog.diary);
    }
    if (dailyLog?.weight !== undefined) {
      setWeight(dailyLog.weight.toString());
    }
    if (dailyLog?.bodyFatPercentage !== undefined) {
      setBodyFatPercentage(dailyLog.bodyFatPercentage.toString());
    }
    if (dailyLog?.status?.sleepHours !== undefined) {
      setSleepHours(dailyLog.status.sleepHours.toString());
    }
    if (dailyLog?.status?.bowelMovement) {
      setBowelMovement(dailyLog.status.bowelMovement);
    }
  }, [
    dailyLog?.diary,
    dailyLog?.weight,
    dailyLog?.bodyFatPercentage,
    dailyLog?.status?.sleepHours,
    dailyLog?.status?.bowelMovement,
  ]);

  const currentWaterMl = dailyLog?.waterIntake ?? 0;

  const [foodInput, setFoodInput] = useState('');
  const [foodAmount, setFoodAmount] = useState('300'); // カーニボアサイズのデフォルト（300g）
  const [foodUnit, setFoodUnit] = useState<'g' | 'piece' | '個'>('g');
  const [showFoodSuggestions, setShowFoodSuggestions] = useState(false);
  const [selectedFoodData, setSelectedFoodData] = useState<FoodData | null>(null);
  const [showArgumentCard, setShowArgumentCard] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewAmount, setPreviewAmount] = useState('300');
  const [previewUnit, setPreviewUnit] = useState<'g' | '個'>('g');

  const [isListening, setIsListening] = useState(false);

  // Initialize VoiceInputManager
  const voiceInputManager = useMemo(() => {
    return new VoiceInputManager({
      language: 'ja-JP',
      continuous: false,
      interimResults: true,
    });
  }, []);

  useEffect(() => {
    // Setup voice input callbacks
    voiceInputManager.onResult((result: VoiceInputResult) => {
      // Interim feedback
      if (!result.isFinal) {
        setFoodInput(result.text);
        return;
      }

      // Final processing
      setIsListening(false);
      const text = result.text;

      // Smart Parser (Regex)
      let parsedAmount = '';
      let parsedUnit = 'g';
      let parsedFoodName = text;

      // Regex for "200g Steak" or "Steak 200g"
      // Supports: g, kg, pieces, 個
      const amountUnitMatch = text.match(/(\d+)\s*(g|kg|ml|oz|lb|grams|gram|个|個|pieces|piece)/i);

      if (amountUnitMatch) {
        parsedAmount = amountUnitMatch[1];
        const unitStr = amountUnitMatch[2].toLowerCase();

        if (['个', '個', 'piece', 'pieces'].includes(unitStr)) {
          parsedUnit = '個';
        } else {
          parsedUnit = 'g'; // Default to grams for weight units
        }

        // Remove the amount string from food name
        parsedFoodName = text.replace(amountUnitMatch[0], '').trim();
      } else {
        // Heuristic: "200 Steak" -> 200g Steak
        const startNumberMatch = text.match(/^(\d+)\s+(.+)/);
        if (startNumberMatch) {
          parsedAmount = startNumberMatch[1];
          parsedFoodName = startNumberMatch[2];
        }
      }

      setFoodInput(parsedFoodName);
      if (parsedAmount) {
        setFoodAmount(parsedAmount);
        setFoodUnit(parsedUnit as 'g' | 'oz' | '個');
      }

      // Auto-search
      setShowFoodSuggestions(true);
      const found = searchFoods(parsedFoodName);
      if (found.length > 0) {
        setSelectedFoodData(found[0]);
      } else {
        // If strict match fails, try searching the original text just in case
        const foundFallback = searchFoods(text);
        if (foundFallback.length > 0) {
          setSelectedFoodData(foundFallback[0]);
          setFoodInput(text); // Revert to full text if parsing failed to find food
        }
      }
    });

    voiceInputManager.onError((error: string) => {
      console.error('Voice input error:', error);
      setIsListening(false);
    });

    voiceInputManager.onEnd(() => {
      setIsListening(false);
    });

    return () => {
      voiceInputManager.stop();
    };
  }, [voiceInputManager]);

  const toggleVoiceInput = () => {
    if (isListening) {
      voiceInputManager.stop();
    } else {
      setFoodInput(''); // Clear input before starting
      voiceInputManager.start();
      setIsListening(true);
    }
  };

  // Search foods as user types
  const foodSuggestions = useMemo(() => {
    if (foodInput.length < 1) return [];
    return searchFoods(foodInput);
  }, [foodInput]);

  // 天気情報を自動取得（初回ロード時）
  useEffect(() => {
    const loadWeather = async () => {
      setIsLoadingWeather(true);
      try {
        const weather = await getWeatherData();
        if (weather) {
          setWeatherData(weather);
          // 天気情報に基づいてisSunnyを自動設定
          setIsSunny(weather.condition === 'sunny' || weather.condition === 'partly-cloudy');
        }
      } catch {
        // エラーは無視（手動入力にフォールバック）
        if (import.meta.env.DEV) {
          void 0;
        }
      } finally {
        setIsLoadingWeather(false);
      }
    };
    loadWeather();
  }, []);

  // Calculate Vitamin D synthesis（天気情報を考慮）
  const vitaminD = useMemo(() => {
    const weatherFactor = weatherData ? getWeatherVitaminDFactor(weatherData) : undefined;
    return calculateVitaminDSynthesis({
      minutes: sunMinutes,
      isSunny,
      exposureArea: 'partial',
      weatherFactor,
      uvIndex: weatherData?.uvIndex,
      cloudCover: weatherData?.cloudCover,
    });
  }, [sunMinutes, isSunny, weatherData]);

  const handleAddFood = () => {
    if (!foodInput.trim()) {
      return; // アラートを削除
    }

    const inputAmount = Number(foodAmount) || (foodUnit === '個' ? 1 : 100);

    if (inputAmount <= 0) {
      return; // アラートを削除
    }

    // Try to find food in database
    let foodData: FoodData | undefined;
    // まず、サジェストから完全一致を探す
    const foundFood = foodSuggestions.find(
      (f) => f.name.toLowerCase() === foodInput.toLowerCase().trim()
    );
    if (foundFood) {
      foodData = foundFood;
    } else {
      // IDまたは名前で直接検索（日本語名対応）
      foodData = getFoodById(foodInput.trim());
      // それでも見つからない場合、サジェストの最初の候補を使用
      if (!foodData && foodSuggestions.length > 0) {
        foodData = foodSuggestions[0];
      }
    }

    // Detect violation type
    const violationType = detectViolationType(foodInput);

    // Create food item from database or fallback
    let foodItem: FoodItem;
    if (foodData) {
      // 個数入力の場合、グラムに変換
      let actualAmount: number;
      let displayUnit: 'g' | '個';

      if (foodUnit === '個' && foodData.pieceWeight) {
        actualAmount = Number(inputAmount) * Number(foodData.pieceWeight); // 個数 × 1個あたりの重量
        displayUnit = '個';
      } else {
        actualAmount = Number(inputAmount);
        displayUnit = 'g';
      }

      const ratio = actualAmount / 100; // Convert to per-100g ratio

      foodItem = {
        item: foodData.name,
        amount: foodUnit === '個' ? inputAmount : actualAmount,
        unit: displayUnit,
        type: foodData.type,
        nutrients: {
          protein: (foodData.nutrientsRaw.protein || 0) * ratio,
          fat: (foodData.nutrientsRaw.fat || 0) * ratio,
          carbs: (foodData.nutrientsRaw.carbs || 0) * ratio,
          netCarbs:
            ((foodData.nutrientsRaw.carbs || 0) - (foodData.nutrientsRaw.fiber || 0)) * ratio,
          fiber: (foodData.nutrientsRaw.fiber || 0) * ratio,
          hemeIron: (foodData.nutrientsRaw.hemeIron || 0) * ratio,
          nonHemeIron: (foodData.nutrientsRaw.nonHemeIron || 0) * ratio,
          vitaminA: (foodData.nutrientsRaw.vitaminA || 0) * ratio,
          vitaminC: (foodData.nutrientsRaw.vitaminC || 0) * ratio,
          vitaminK: (foodData.nutrientsRaw.vitaminK || 0) * ratio,
          vitaminB1: (foodData.nutrientsRaw.vitaminB1 || 0) * ratio,
          vitaminB2: (foodData.nutrientsRaw.vitaminB2 || 0) * ratio,
          vitaminB3: (foodData.nutrientsRaw.vitaminB3 || 0) * ratio,
          vitaminB6: (foodData.nutrientsRaw.vitaminB6 || 0) * ratio,
          vitaminB12: (foodData.nutrientsRaw.vitaminB12 || 0) * ratio,
          vitaminE: (foodData.nutrientsRaw.vitaminE || 0) * ratio,
          zinc: (foodData.nutrientsRaw.zinc || 0) * ratio,
          sodium: (foodData.nutrientsRaw.sodium || 0) * ratio,
          magnesium: (foodData.nutrientsRaw.magnesium || 0) * ratio,
          calcium: (foodData.nutrientsRaw.calcium || 0) * ratio,
          phosphorus: (foodData.nutrientsRaw.phosphorus || 0) * ratio,
          selenium: (foodData.nutrientsRaw.selenium || 0) * ratio,
          copper: (foodData.nutrientsRaw.copper || 0) * ratio,
          manganese: (foodData.nutrientsRaw.manganese || 0) * ratio,
        },
      };
    } else {
      // Fallback: create from input (すべての栄養素を含める)
      const fallbackAmount = foodUnit === '個' ? inputAmount * 50 : inputAmount; // 個数の場合は50g/個と仮定
      const ratio = fallbackAmount / 100;
      foodItem = {
        item: foodInput,
        amount: foodUnit === '個' ? inputAmount : fallbackAmount,
        unit: foodUnit === '個' ? '個' : 'g',
        type: violationType ? 'trash' : 'animal',
        nutrients: {
          protein: 20 * ratio,
          fat: 15 * ratio,
          carbs: violationType ? 30 * ratio : 0,
          netCarbs: violationType ? 30 * ratio : 0,
          fiber: violationType ? 2 * ratio : 0,
          hemeIron: violationType ? 0 : 1.0 * ratio,
          nonHemeIron: violationType ? 1.0 * ratio : 0,
          vitaminA: violationType ? 0 : 10 * ratio,
          vitaminC: violationType ? 5 * ratio : 0,
          vitaminK: violationType ? 0 : 1.0 * ratio,
          zinc: violationType ? 0.5 * ratio : 2.0 * ratio,
          sodium: violationType ? 500 * ratio : 50 * ratio,
          magnesium: violationType ? 10 * ratio : 20 * ratio,
        },
      };
    }

    addFood(foodItem);

    // アラートを削除 - 非同期で処理を続行
    setFoodInput('');
    setFoodAmount(foodUnit === '個' ? '1' : '300'); // カーニボアサイズのデフォルト
    setFoodUnit('g');
    setShowFoodSuggestions(false);
    setSelectedFoodData(null); // 追加後に選択をクリア
  };

  const handleSaveStatus = () => {
    updateStatus({
      sleepScore,
      sleepHours: sleepHours ? Number(sleepHours) : undefined,
      sunMinutes,
      activityLevel,
      bowelMovement,
    });
    // 保存後に閉じる
    if (onClose) onClose();
  };

  return (
    <div className="input-screen-container">
      <div className="input-screen-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="input-screen-title">{t('input.dailyInput')}</h1>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                fontSize: '1.5rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Section B: Fuel (The Input) - 先に表示 */}
        <div className="input-screen-section">
          <h2 className="input-screen-section-title">{t('input.fuelSection')}</h2>

          <div className="input-screen-input-group">
            <label className="input-screen-label">{t('input.foodLabel')}</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                className="input-screen-text-input"
                value={foodInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setFoodInput(value);
                  setShowFoodSuggestions(value.length >= 1); // 1文字以上で候補表示
                  // 入力に基づいて食品データを検索
                  if (value.length >= 1) {
                    const found = searchFoods(value);
                    if (found.length > 0) {
                      setSelectedFoodData(found[0]); // 最初の候補を自動選択
                    } else {
                      setSelectedFoodData(null);
                    }
                  } else {
                    setSelectedFoodData(null);
                  }
                }}
                placeholder={t('input.foodPlaceholder')}
                onFocus={() => setShowFoodSuggestions(foodInput.length >= 1)}
                style={{ flex: 1 }}
              />
              <button
                onClick={toggleVoiceInput}
                className={`voice-input-button ${isListening ? 'listening' : ''}`}
                style={{
                  padding: '0.75rem',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: isListening ? '#ef4444' : '#f3f4f6',
                  color: isListening ? 'white' : '#6b7280',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: isListening ? '0 0 0 3px rgba(239, 68, 68, 0.3)' : 'none',
                }}
                title={isListening ? t('input.voiceStop') : t('input.voiceStart')}
              >
                {isListening ? (
                  <span style={{ fontSize: '1.2rem', animation: 'pulse 1.5s infinite' }}>⏹️</span>
                ) : (
                  <span style={{ fontSize: '1.2rem' }}>🎤</span>
                )}
              </button>
            </div>

            {/* Food Suggestions */}
            {showFoodSuggestions && foodSuggestions.length > 0 && (
              <div className="input-screen-suggestions">
                {foodSuggestions.slice(0, 10).map((item) => (
                  <div
                    key={item.id}
                    className="input-screen-suggestion-item"
                    onClick={() => {
                      setFoodInput(item.name);
                      setSelectedFoodData(item); // 選択した食品データを保存
                      // 食品を選択したら、推奨単位を自動設定
                      if (item.preferredUnit) {
                        setFoodUnit(item.preferredUnit === 'piece' ? '個' : 'g');
                        // 個数入力の場合、デフォルト値を設定
                        if (item.preferredUnit === 'piece' && item.pieceWeight) {
                          setFoodAmount('1');
                        }
                      }
                      setShowFoodSuggestions(false);
                    }}
                  >
                    <span className="input-screen-suggestion-text">{item.name}</span>
                    <span className="input-screen-suggestion-type">{item.type}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 入力前にも栄養情報を表示 */}
            {selectedFoodData && (
              <div className="food-info-display">
                <h4 className="food-info-title">{t('input.selectedFood')} {selectedFoodData.name}</h4>
                <div className="food-info-grid">
                  <div>{t('input.nutrient.protein')}: {selectedFoodData.nutrientsRaw.protein || 0}g/100g</div>
                  <div>{t('input.nutrient.fat')}: {selectedFoodData.nutrientsRaw.fat || 0}g/100g</div>
                  {selectedFoodData.nutrientsRaw.vitaminB12 && (
                    <div>{t('input.nutrient.vitaminB12')}: {selectedFoodData.nutrientsRaw.vitaminB12}μg/100g</div>
                  )}
                  {selectedFoodData.nutrientsRaw.vitaminB1 && (
                    <div>{t('input.nutrient.vitaminB1')}: {selectedFoodData.nutrientsRaw.vitaminB1}mg/100g</div>
                  )}
                  {selectedFoodData.nutrientsRaw.vitaminB2 && (
                    <div>{t('input.nutrient.vitaminB2')}: {selectedFoodData.nutrientsRaw.vitaminB2}mg/100g</div>
                  )}
                  {selectedFoodData.nutrientsRaw.vitaminB3 && (
                    <div>{t('input.nutrient.vitaminB3')}: {selectedFoodData.nutrientsRaw.vitaminB3}mg/100g</div>
                  )}
                  {selectedFoodData.nutrientsRaw.vitaminB6 && (
                    <div>{t('input.nutrient.vitaminB6')}: {selectedFoodData.nutrientsRaw.vitaminB6}mg/100g</div>
                  )}
                  {selectedFoodData.nutrientsRaw.vitaminA && (
                    <div>{t('input.nutrient.vitaminA')}: {selectedFoodData.nutrientsRaw.vitaminA}μg/100g</div>
                  )}
                  {selectedFoodData.nutrientsRaw.vitaminC && (
                    <div>{t('input.nutrient.vitaminC')}: {selectedFoodData.nutrientsRaw.vitaminC}mg/100g</div>
                  )}
                  {selectedFoodData.nutrientsRaw.vitaminK && (
                    <div>{t('input.nutrient.vitaminK')}: {selectedFoodData.nutrientsRaw.vitaminK}μg/100g</div>
                  )}
                  {selectedFoodData.nutrientsRaw.vitaminE && (
                    <div>{t('input.nutrient.vitaminE')}: {selectedFoodData.nutrientsRaw.vitaminE}mg/100g</div>
                  )}
                  {selectedFoodData.nutrientsRaw.hemeIron && (
                    <div>{t('input.nutrient.hemeIron')}: {selectedFoodData.nutrientsRaw.hemeIron}mg/100g</div>
                  )}
                  {selectedFoodData.nutrientsRaw.nonHemeIron && (
                    <div>{t('input.nutrient.nonHemeIron')}: {selectedFoodData.nutrientsRaw.nonHemeIron}mg/100g</div>
                  )}
                  {selectedFoodData.nutrientsRaw.zinc && (
                    <div>{t('input.nutrient.zinc')}: {selectedFoodData.nutrientsRaw.zinc}mg/100g</div>
                  )}
                  {selectedFoodData.nutrientsRaw.sodium && (
                    <div>{t('input.nutrient.sodium')}: {selectedFoodData.nutrientsRaw.sodium}mg/100g</div>
                  )}
                  {selectedFoodData.nutrientsRaw.magnesium && (
                    <div>{t('input.nutrient.magnesium')}: {selectedFoodData.nutrientsRaw.magnesium}mg/100g</div>
                  )}
                  {selectedFoodData.nutrientsRaw.calcium && (
                    <div>{t('input.nutrient.calcium')}: {selectedFoodData.nutrientsRaw.calcium}mg/100g</div>
                  )}
                  {selectedFoodData.nutrientsRaw.phosphorus && (
                    <div>{t('input.nutrient.phosphorus')}: {selectedFoodData.nutrientsRaw.phosphorus}mg/100g</div>
                  )}
                  {selectedFoodData.nutrientsRaw.selenium && (
                    <div>{t('input.nutrient.selenium')}: {selectedFoodData.nutrientsRaw.selenium}μg/100g</div>
                  )}
                  {selectedFoodData.nutrientsRaw.copper && (
                    <div>{t('input.nutrient.copper')}: {selectedFoodData.nutrientsRaw.copper}mg/100g</div>
                  )}
                  {selectedFoodData.nutrientsRaw.manganese && (
                    <div>{t('input.nutrient.manganese')}: {selectedFoodData.nutrientsRaw.manganese}mg/100g</div>
                  )}
                  {selectedFoodData.nutrientsRaw.carbs && (
                    <div>{t('input.nutrient.carbs')}: {selectedFoodData.nutrientsRaw.carbs}g/100g</div>
                  )}
                  {selectedFoodData.nutrientsRaw.fiber && (
                    <div>{t('input.nutrient.fiber')}: {selectedFoodData.nutrientsRaw.fiber}g/100g</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setShowPreview(true)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#34C759',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    {t('input.preview')}
                  </button>
                  <button
                    onClick={() => {
                      // 主要な栄養素のArgument Cardを表示
                      const nutrients = ['protein', 'fat', 'vitaminC', 'iron', 'zinc'];
                      for (const nutrient of nutrients) {
                        const card = getArgumentCardByNutrient(nutrient);
                        if (card) {
                          setShowArgumentCard(nutrient);
                          break;
                        }
                      }
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#007AFF',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    {t('input.viewNutrientInfo')}
                  </button>
                </div>
              </div>
            )}

            <div className="input-screen-amount-row">
              <label className="input-screen-label">{t('input.amountLabel')}</label>
              <div className="input-screen-amount-input-group">
                <input
                  type="number"
                  className="input-screen-text-input input-screen-amount-input"
                  value={foodAmount}
                  onChange={(e) => setFoodAmount(e.target.value)}
                  placeholder={foodUnit === '個' ? '1' : '100'}
                  min="0"
                  step={foodUnit === '個' ? '1' : '1'}
                />
                <select
                  className="input-screen-unit-select"
                  value={foodUnit}
                  onChange={(e) => {
                    const newUnit = e.target.value as 'g' | '個';
                    setFoodUnit(newUnit);
                    // 単位変更時にデフォルト値を設定
                    if (newUnit === '個') {
                      setFoodAmount('1');
                    } else {
                      setFoodAmount('300'); // カーニボアサイズのデフォルト
                    }
                  }}
                >
                  <option value="g">g</option>
                  <option value="個">{t('input.unitPiece')}</option>
                </select>
              </div>
            </div>

            <button
              className="input-screen-add-button"
              onClick={handleAddFood}
              style={{ marginTop: '1rem' }}
            >
              {t('input.addFood')}
            </button>
          </div>
        </div>

        {/* Section A: Status (The Machine) - 後で表示 */}
        <div className="input-screen-section">
          <h2 className="input-screen-section-title">{t('input.statusSection')}</h2>

          <div className="input-screen-input-group">
            <label className="input-screen-label">{t('input.sleepQuality')} {sleepScore}</label>
            <div className="input-screen-slider-container">
              <input
                type="range"
                min="0"
                max="100"
                value={sleepScore}
                onChange={(e) => setSleepScore(Number(e.target.value))}
                step="1"
                className="input-screen-slider"
              />
              <div className="input-screen-slider-hint">
                {t('input.sleepQualityHint')}
              </div>
            </div>
          </div>

          <div className="input-screen-input-group">
            <label className="input-screen-label">{t('input.sleepHoursLabel')}</label>
            <div className="input-screen-solar-charge-row">
              <input
                type="number"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                placeholder="例: 7.5"
                step="0.5"
                min="0"
                max="24"
                className="input-screen-text-input input-screen-solar-charge-input"
              />
              <span className="input-screen-unit">{t('input.sleepHoursUnit')}</span>
            </div>
            <div className="input-screen-slider-hint">{t('input.sleepHoursHint')}</div>
          </div>

          <div className="input-screen-input-group">
            <label className="input-screen-label">{t('input.sunExposure')}</label>
            <div className="input-screen-solar-charge-row">
              <input
                type="number"
                value={sunMinutes.toString()}
                onChange={(e) => setSunMinutes(Number(e.target.value) || 0)}
                placeholder="30"
                className="input-screen-text-input input-screen-solar-charge-input"
              />
              <span className="input-screen-unit">{t('input.sunUnit')}</span>
              <div className="input-screen-weather-buttons">
                <button
                  className={`input-screen-weather-button ${isSunny ? 'active' : ''}`}
                  onClick={() => setIsSunny(true)}
                >
                  ☀️ Sunny
                </button>
                <button
                  className={`input-screen-weather-button ${!isSunny ? 'active' : ''}`}
                  onClick={() => setIsSunny(false)}
                >
                  ☁️ Cloudy
                </button>
                <button
                  className="input-screen-weather-button"
                  onClick={async () => {
                    setIsLoadingWeather(true);
                    try {
                      const weather = await getWeatherData();
                      if (weather) {
                        setWeatherData(weather);
                        setIsSunny(
                          weather.condition === 'sunny' || weather.condition === 'partly-cloudy'
                        );
                      }
                    } catch {
                      // エラーは無視
                    } finally {
                      setIsLoadingWeather(false);
                    }
                  }}
                  disabled={isLoadingWeather}
                  title={t('input.weatherAutoTitle')}
                >
                  {isLoadingWeather ? '⏳' : '🌤️'}
                </button>
              </div>
            </div>
            {weatherData && (
              <div
                className="input-screen-weather-info"
                style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}
              >
                {weatherData.location && `${weatherData.location} - `}
                {weatherData.condition === 'sunny'
                  ? t('input.weatherSunny')
                  : weatherData.condition === 'partly-cloudy'
                    ? t('input.weatherPartlyCloudy')
                    : weatherData.condition === 'cloudy'
                      ? t('input.weatherCloudy')
                      : weatherData.condition === 'rainy'
                        ? t('input.weatherRainy')
                        : t('input.weatherSnowy')}
                {weatherData.temperature > 0 && ` ${Math.round(weatherData.temperature)}℃`}
                {weatherData.uvIndex > 0 && ` UV: ${weatherData.uvIndex}`}
              </div>
            )}
            {vitaminD > 0 && (
              <div className="input-screen-vitamin-d">
                Estimated Vitamin D: ~{vitaminD.toLocaleString()} IU
                {weatherData && weatherData.uvIndex > 0 && (
                  <span style={{ fontSize: '0.75rem', color: '#666', marginLeft: '0.5rem' }}>
                    {t('input.weatherConsidered')}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="input-screen-input-group">
            <label className="input-screen-label">{t('input.bowelLabel')}</label>
            <div className="input-screen-button-row">
              <button
                className={`input-screen-level-button ${bowelMovement.status === 'normal' ? 'active' : ''}`}
                onClick={() => setBowelMovement({ ...bowelMovement, status: 'normal' })}
              >
                {t('input.bowelNormal')}
              </button>
              <button
                className={`input-screen-level-button ${bowelMovement.status === 'constipated' ? 'active' : ''}`}
                onClick={() => setBowelMovement({ ...bowelMovement, status: 'constipated' })}
              >
                {t('input.bowelHard')}
              </button>
              <button
                className={`input-screen-level-button ${bowelMovement.status === 'loose' ? 'active' : ''}`}
                onClick={() => setBowelMovement({ ...bowelMovement, status: 'loose' })}
              >
                {t('input.bowelLoose')}
              </button>
              <button
                className={`input-screen-level-button ${bowelMovement.status === 'watery' ? 'active' : ''}`}
                onClick={() => setBowelMovement({ ...bowelMovement, status: 'watery' })}
              >
                {t('input.bowelWatery')}
              </button>
            </div>
            <div className="input-screen-slider-hint">
              {t('input.bowelHint')}
            </div>
          </div>

          <div className="input-screen-input-group">
            <label className="input-screen-label">{t('input.activityLabel')}</label>
            <div className="input-screen-button-row">
              {(['high', 'moderate', 'low'] as const).map((level) => (
                <button
                  key={level}
                  className={`input-screen-level-button ${activityLevel === level ? 'active' : ''}`}
                  onClick={() => setActivityLevel(level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 体重・体組成セクション */}
        <div className="input-screen-section">
          <h2 className="input-screen-section-title">{t('input.bodySection')}</h2>

          <div className="input-screen-input-group">
            <label className="input-screen-label">{t('input.weightLabel')}</label>
            <div className="input-screen-solar-charge-row">
              <input
                type="number"
                value={weight}
                onChange={(e) => {
                  const value = e.target.value;
                  setWeight(value);
                  const numValue = value === '' ? undefined : Number(value);
                  updateWeight(
                    numValue,
                    bodyFatPercentage === '' ? undefined : Number(bodyFatPercentage) || undefined
                  );
                }}
                placeholder="例: 70.5"
                step="0.1"
                min="0"
                className="input-screen-text-input input-screen-solar-charge-input"
              />
              <span className="input-screen-unit">kg</span>
            </div>
          </div>

          <div className="input-screen-input-group">
            <label className="input-screen-label">{t('input.bodyFatLabel')}</label>
            <div className="input-screen-solar-charge-row">
              <input
                type="number"
                value={bodyFatPercentage}
                onChange={(e) => {
                  const value = e.target.value;
                  setBodyFatPercentage(value);
                  const numValue = value === '' ? undefined : Number(value);
                  updateWeight(weight === '' ? undefined : Number(weight) || undefined, numValue);
                }}
                placeholder="例: 15.0"
                step="0.1"
                min="0"
                max="100"
                className="input-screen-text-input input-screen-solar-charge-input"
              />
              <span className="input-screen-unit">%</span>
            </div>
          </div>

          {/* BMI計算表示 */}
          {weight && userProfile?.height && (
            <div
              className="input-screen-input-group"
              style={{
                marginTop: '1rem',
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
              }}
            >
              <div style={{ fontSize: '14px', color: '#78716c' }}>
                <strong>BMI:</strong>{' '}
                {(Number(weight) / (userProfile.height / 100) ** 2).toFixed(1)}
                {userProfile.height && (
                  <span style={{ marginLeft: '1rem', fontSize: '12px' }}>
                    ({t('input.heightLabel')} {userProfile.height}cm)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 水分セクション */}
        <div className="input-screen-section">
          <h2 className="input-screen-section-title">{t('input.waterSection')}</h2>
          <div className="input-screen-input-group">
            <div style={{ marginBottom: '0.5rem', fontSize: '14px', color: '#78716c' }}>
              {t('input.waterToday')} {currentWaterMl}ml
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[100, 200, 500, 1000].map((ml) => (
                <button
                  key={ml}
                  onClick={() => updateWaterIntake(ml)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #d6d3d1',
                    backgroundColor: '#fafaf9',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  +{ml}ml
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 断食タイマーセクション */}
        <div className="input-screen-section">
          <h2 className="input-screen-section-title">{t('input.fastingSection')}</h2>
          <div className="input-screen-input-group">
            {fastingEndTime ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    backgroundColor: '#fef3c7',
                    border: '2px solid #f59e0b',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>
                    {fastingRemainingTime}
                  </div>
                  <div style={{ fontSize: '14px', color: '#78716c', marginTop: '0.25rem' }}>
                    {t('input.fastingRemaining')}
                  </div>
                </div>
                <button
                  onClick={stopFasting}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #d6d3d1',
                    backgroundColor: '#fafaf9',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {t('input.fastingStop')}
                </button>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '1rem', fontSize: '14px', color: '#78716c' }}>
                  {t('input.fastingSelectHint')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {Object.entries(FASTING_TEMPLATES).map(([key, { name, hours }]) => (
                    <button
                      key={key}
                      onClick={() => startFasting(hours)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '2px solid #f59e0b',
                        backgroundColor: '#fffbeb',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <div style={{ fontWeight: 'bold', color: '#92400e' }}>{name}</div>
                      <div style={{ fontSize: '12px', color: '#78716c' }}>{hours}{t('input.fastingHours')}</div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const customHours = getFastingDefaultHours();
                    startFasting(customHours);
                  }}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #d6d3d1',
                    backgroundColor: '#fafaf9',
                    cursor: 'pointer',
                    fontSize: '14px',
                    width: '100%',
                  }}
                >
                  {t('input.fastingCustom')} ({getFastingDefaultHours()}{t('input.fastingHours')})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 日記セクション */}
        <div className="input-screen-section">
          <h2 className="input-screen-section-title">{t('input.diarySection')}</h2>
          <div className="input-screen-input-group">
            <label className="input-screen-label">
              {t('input.diaryLabel')}
            </label>
            <textarea
              className="input-screen-text-input"
              value={diary}
              onChange={(e) => {
                setDiary(e.target.value);
                updateDiary(e.target.value);
              }}
              placeholder={t('input.diaryPlaceholder')}
              rows={5}
              style={{
                resize: 'vertical',
                minHeight: '100px',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        <button className="input-screen-save-button" onClick={handleSaveStatus}>
          {t('input.saveStatus')}
        </button>

        {/* Added Foods List */}
        {dailyLog && dailyLog.fuel.length > 0 && (
          <div className="input-screen-added-foods">
            <h3 className="input-screen-section-title">{t('input.todayFoods')}</h3>
            {dailyLog.fuel.map((food, index) => (
              <div
                key={index}
                className="input-screen-added-food-item"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                }}
              >
                <div>
                  <strong>{food.item}</strong> - {food.amount}
                  {food.unit}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      const newAmount = prompt(
                        t('input.editAmountPrompt'),
                        food.amount.toString()
                      );
                      if (newAmount && !isNaN(Number(newAmount))) {
                        const ratio = Number(newAmount) / food.amount;
                        const updatedFood: FoodItem = {
                          ...food,
                          amount: Number(newAmount),
                          nutrients: Object.fromEntries(
                            Object.entries(food.nutrients || {}).map(([key, value]) => [
                              key,
                              (value || 0) * ratio,
                            ])
                          ) as FoodItem['nutrients'],
                        };
                        updateFood(index, updatedFood);
                      }
                    }}
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.8rem',
                      backgroundColor: '#007AFF',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {t('input.editButton')}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`${food.item}${t('input.deleteConfirm')}`)) {
                        removeFood(index);
                      }
                    }}
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.8rem',
                      backgroundColor: '#FF3B30',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {t('input.deleteButton')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Argument Card Modal */}
        {showArgumentCard && (
          <ArgumentCard
            card={getArgumentCardByNutrient(showArgumentCard)!}
            onClose={() => setShowArgumentCard(null)}
          />
        )}

        {/* Preview Modal */}
        {showPreview && selectedFoodData && dailyLog && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowPreview(false)}
          >
            <div
              style={{
                backgroundColor: 'var(--color-bg-primary)',
                padding: '2rem',
                borderRadius: '8px',
                maxWidth: '90%',
                maxHeight: '90%',
                overflow: 'auto',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
              <h2 style={{ marginBottom: '1rem' }}>
                {t('input.previewTitle')} {selectedFoodData.name} ({previewAmount}
                {previewUnit} {t('input.previewAdded')})
              </h2>
              <div
                style={{
                  marginBottom: '1rem',
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                }}
              >
                <label>{t('input.amountLabel')}</label>
                <input
                  type="number"
                  value={previewAmount}
                  onChange={(e) => setPreviewAmount(e.target.value)}
                  style={{
                    width: '100px',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                  min="0"
                  step={previewUnit === '個' ? '1' : '1'}
                />
                <select
                  value={previewUnit}
                  onChange={(e) => {
                    const newUnit = e.target.value as 'g' | '個';
                    setPreviewUnit(newUnit);
                    if (newUnit === '個') {
                      setPreviewAmount('1');
                    } else {
                      setPreviewAmount('300');
                    }
                  }}
                  style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="g">g</option>
                  <option value="個">{t('input.unitPiece')}</option>
                </select>
              </div>
              {(() => {
                // プレビュー用のFoodItemを作成（previewAmountとpreviewUnitを使用）
                const inputAmount = Number(previewAmount) || (previewUnit === '個' ? 1 : 300);
                let actualAmount: number;
                if (previewUnit === '個' && selectedFoodData.pieceWeight) {
                  actualAmount = inputAmount * selectedFoodData.pieceWeight;
                } else {
                  actualAmount = inputAmount;
                }
                const ratio = actualAmount / 100;
                const previewFood: FoodItem = {
                  item: selectedFoodData.name,
                  amount: previewUnit === '個' ? inputAmount : actualAmount,
                  unit: previewUnit === '個' ? '個' : 'g',
                  type: selectedFoodData.type,
                  nutrients: {
                    protein: (selectedFoodData.nutrientsRaw.protein || 0) * ratio,
                    fat: (selectedFoodData.nutrientsRaw.fat || 0) * ratio,
                    carbs: (selectedFoodData.nutrientsRaw.carbs || 0) * ratio,
                    netCarbs:
                      ((selectedFoodData.nutrientsRaw.carbs || 0) -
                        (selectedFoodData.nutrientsRaw.fiber || 0)) *
                      ratio,
                    fiber: (selectedFoodData.nutrientsRaw.fiber || 0) * ratio,
                    hemeIron: (selectedFoodData.nutrientsRaw.hemeIron || 0) * ratio,
                    nonHemeIron: (selectedFoodData.nutrientsRaw.nonHemeIron || 0) * ratio,
                    vitaminA: (selectedFoodData.nutrientsRaw.vitaminA || 0) * ratio,
                    vitaminC: (selectedFoodData.nutrientsRaw.vitaminC || 0) * ratio,
                    vitaminK: (selectedFoodData.nutrientsRaw.vitaminK || 0) * ratio,
                    vitaminB1: (selectedFoodData.nutrientsRaw.vitaminB1 || 0) * ratio,
                    vitaminB2: (selectedFoodData.nutrientsRaw.vitaminB2 || 0) * ratio,
                    vitaminB3: (selectedFoodData.nutrientsRaw.vitaminB3 || 0) * ratio,
                    vitaminB6: (selectedFoodData.nutrientsRaw.vitaminB6 || 0) * ratio,
                    vitaminB12: (selectedFoodData.nutrientsRaw.vitaminB12 || 0) * ratio,
                    vitaminE: (selectedFoodData.nutrientsRaw.vitaminE || 0) * ratio,
                    zinc: (selectedFoodData.nutrientsRaw.zinc || 0) * ratio,
                    sodium: (selectedFoodData.nutrientsRaw.sodium || 0) * ratio,
                    magnesium: (selectedFoodData.nutrientsRaw.magnesium || 0) * ratio,
                    calcium: (selectedFoodData.nutrientsRaw.calcium || 0) * ratio,
                    phosphorus: (selectedFoodData.nutrientsRaw.phosphorus || 0) * ratio,
                    selenium: (selectedFoodData.nutrientsRaw.selenium || 0) * ratio,
                    copper: (selectedFoodData.nutrientsRaw.copper || 0) * ratio,
                    manganese: (selectedFoodData.nutrientsRaw.manganese || 0) * ratio,
                  },
                };

                // 現在のメトリクス
                const currentMetrics: Partial<CalculatedMetrics> =
                  dailyLog?.calculatedMetrics || {
                    effectiveProtein: 0,
                    fatTotal: 0,
                    vitaminB12Total: 0,
                    effectiveIron: 0,
                    effectiveZinc: 0,
                  };

                // プレビュー用のメトリクス（この食品を追加した場合）
                const currentFuel = dailyLog?.fuel || [];
                const previewMetrics = calculateAllMetrics(
                  [...currentFuel, previewFood],
                  userProfile
                );

                return (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>現在の値</h3>
                      <div>タンパク質（有効）: {currentMetrics.effectiveProtein.toFixed(1)}g</div>
                      <div>脂質: {currentMetrics.fatTotal.toFixed(1)}g</div>
                      <div>
                        ビタミンB12: {currentMetrics.vitaminB12Total?.toFixed(1) || '0.0'}μg
                      </div>
                      <div>鉄分（有効）: {currentMetrics.effectiveIron.toFixed(1)}mg</div>
                      <div>亜鉛（有効）: {currentMetrics.effectiveZinc.toFixed(1)}mg</div>
                    </div>
                    <div>
                      <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>追加後の値</h3>
                      <div>
                        タンパク質（有効）: {previewMetrics.effectiveProtein.toFixed(1)}g{' '}
                        <span style={{ color: '#34C759' }}>
                          (+
                          {(
                            previewMetrics.effectiveProtein - currentMetrics.effectiveProtein
                          ).toFixed(1)}
                          g)
                        </span>
                      </div>
                      <div>
                        脂質: {previewMetrics.fatTotal.toFixed(1)}g{' '}
                        <span style={{ color: '#34C759' }}>
                          (+{(previewMetrics.fatTotal - currentMetrics.fatTotal).toFixed(1)}g)
                        </span>
                      </div>
                      <div>
                        ビタミンB12: {previewMetrics.vitaminB12Total?.toFixed(1) || '0.0'}μg{' '}
                        <span style={{ color: '#34C759' }}>
                          (+
                          {(
                            (previewMetrics.vitaminB12Total || 0) -
                            (currentMetrics.vitaminB12Total || 0)
                          ).toFixed(1)}
                          μg)
                        </span>
                      </div>
                      <div>
                        鉄分（有効）: {previewMetrics.effectiveIron.toFixed(1)}mg{' '}
                        <span style={{ color: '#34C759' }}>
                          (+
                          {(previewMetrics.effectiveIron - currentMetrics.effectiveIron).toFixed(1)}
                          mg)
                        </span>
                      </div>
                      <div>
                        亜鉛（有効）: {previewMetrics.effectiveZinc.toFixed(1)}mg{' '}
                        <span style={{ color: '#34C759' }}>
                          (+
                          {(previewMetrics.effectiveZinc - currentMetrics.effectiveZinc).toFixed(1)}
                          mg)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
