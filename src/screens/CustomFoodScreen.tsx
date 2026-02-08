import { useState, useEffect, useMemo } from 'react';
import { analyzeFoodName } from '../services/aiService';
import {
  addCustomFood,
  updateCustomFood,
  getCustomFoodById,
  type MyFoodItem,
} from '../utils/myFoodsStorage';
import { getRandomTip, getRandomTipExcluding, type Tip } from '../data/tips';
import { saveTip, unsaveTip, isTipSaved } from '../utils/savedTips';
import { useTranslation } from '../utils/i18n';
import { useApp } from '../context/AppContext';
import MiniNutrientGauge from '../components/MiniNutrientGauge';
import { getNutrientColor, NUTRIENT_GROUPS } from '../utils/gaugeUtils';
import { VoiceInputManager, type VoiceInputResult } from '../utils/voiceInput';
import type { FoodItem } from '../types';
import './CustomFoodScreen.css';

interface CustomFoodScreenProps {
  foodId?: string; // 編集モードの場合
  onClose: () => void;
  onSave?: () => void;
}

export default function CustomFoodScreen({ foodId, onClose, onSave }: CustomFoodScreenProps) {
  const { t } = useTranslation();
  const { addFood } = useApp();
  const [foodName, setFoodName] = useState('');
  const [displayName, setDisplayName] = useState(''); // 登録名
  const [type, setType] = useState<'animal' | 'trash' | 'ruminant' | 'dairy'>('animal');
  const [nutrients, setNutrients] = useState<MyFoodItem['nutrients']>({});
  const [isLoading, _setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAdvancedNutrients, setShowAdvancedNutrients] = useState(false); // UI表示ON/OFF（デフォルトOFF）
  const [showAdvancedAntiNutrients, setShowAdvancedAntiNutrients] = useState(false); // 抗栄養素詳細表示ON/OFF（デフォルトOFF）
  const [aiFollowupQuestions, setAiFollowupQuestions] = useState<string[]>([]); // AI追加質問
  const [showFollowupInput, setShowFollowupInput] = useState(false); // 追加質問入力表示
  const [followupAnswers, setFollowupAnswers] = useState<Record<string, string>>({}); // 追加質問への回答
  const [loadingTip, setLoadingTip] = useState<Tip | null>(null); // ローディング中のTips
  const [isTipSavedState, setIsTipSavedState] = useState(false); // Tipsの保存状態
  const [addToTodayLog, setAddToTodayLog] = useState(false); // 今日のログに追加するかどうか
  const [previousTips, setPreviousTips] = useState<Tip[]>([]); // Tips履歴管理

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
      setFoodName(result.text);
      setDisplayName(result.text); // Sync display name
      if (result.isFinal) {
        setIsListening(false);
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
      setFoodName(''); // Clear input before starting
      voiceInputManager.start();
      setIsListening(true);
    }
  };

  // 編集モードの場合、既存データを読み込む
  useEffect(() => {
    if (foodId) {
      const existingFood = getCustomFoodById(foodId);
      if (existingFood) {
        setFoodName(existingFood.foodName);
        setDisplayName(existingFood.displayName || existingFood.foodName);
        setType((existingFood.type === 'plant' ? 'animal' : existingFood.type) || 'animal');
        setNutrients(existingFood.nutrients || {});
      }
    } else {
      // 検索から遷移した場合、初期名を設定
      const initialName = localStorage.getItem('@carnivos:custom_food_initial_name');
      if (initialName) {
        setFoodName(initialName);
        setDisplayName(initialName);
        localStorage.removeItem('@carnivos:custom_food_initial_name');
      }
    }
  }, [foodId]);

  // 食品名から栄養素を推測（半自動）
  const handleAnalyze = async () => {
    if (!foodName.trim()) {
      setError(t('customFood.enterFoodName'));
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    // ローディング中のTipsを表示
    // 現在のTipsを履歴に追加（戻るボタン用）
    if (loadingTip) {
      setPreviousTips((prev) => [...prev, loadingTip]);
    }
    const randomTip = loadingTip ? getRandomTipExcluding(loadingTip.id) : getRandomTip();
    setLoadingTip(randomTip);
    setIsTipSavedState(isTipSaved(randomTip.id));

    try {
      const result = await analyzeFoodName(
        foodName,
        Object.keys(followupAnswers).length > 0 ? followupAnswers : undefined
      );
      setFoodName(result.foodName);
      setType(result.type === 'plant' ? 'animal' : result.type);
      setNutrients(result.nutrients || {});

      // 追加質問がある場合は表示
      if (result.followupQuestions && result.followupQuestions.length > 0) {
        setAiFollowupQuestions(result.followupQuestions);
        setShowFollowupInput(true);
      } else {
        setAiFollowupQuestions([]);
        setShowFollowupInput(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('customFood.analyzeFailed'));
    } finally {
      setIsAnalyzing(false);
      setLoadingTip(null); // ローディング終了時にTipsを非表示
    }
  };

  // 保存
  const handleSave = () => {
    if (!foodName.trim()) {
      setError(t('customFood.enterFoodName'));
      return;
    }

    try {
      const customFood: MyFoodItem = {
        foodName,
        displayName: displayName || foodName, // 登録名が空の場合は食品名を使用
        amount: 100, // デフォルト値（100gあたりの栄養素データ）
        unit: 'g',
        type,
        nutrients,
      };

      if (foodId) {
        // 更新
        updateCustomFood(foodId, customFood);
      } else {
        // 新規追加
        addCustomFood(customFood);
      }

      // 今日のログに追加する場合
      if (addToTodayLog) {
        const foodItem: FoodItem = {
          item: displayName || foodName,
          amount: 100, // デフォルト100g
          unit: 'g',
          type,
          nutrients: nutrients as FoodItem['nutrients'],
        };
        addFood(foodItem);
        // 履歴更新を確実にするため、少し遅延させてからイベントを発火
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('dailyLogUpdated'));
        }, 200);
      }

      onSave?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('customFood.saveFailed'));
    }
  };

  // 栄養素の値を更新
  const updateNutrient = (
    key: keyof NonNullable<MyFoodItem['nutrients']>,
    value: number | undefined
  ) => {
    setNutrients((prev) => ({
      ...prev,
      [key]: value === undefined || value === 0 ? undefined : value,
    }));
  };

  return (
    <div className="custom-food-screen">
      <div className="custom-food-content">
        <div className="custom-food-header">
          <h2>{foodId ? t('customFood.edit') : t('customFood.add')}</h2>
          <button
            onClick={onClose}
            className="close-button"
            style={{ fontSize: '1.5rem', padding: '0.5rem 1rem' }}
          >
            ←
          </button>
        </div>

        {error && (
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
            {error}
          </div>
        )}

        {/* 食品名入力とAI推測 */}
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
              <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => {
                    const newFoodName = e.target.value;
                    setFoodName(newFoodName);
                    // 食品名と登録名を常に同期
                    setDisplayName(newFoodName);
                  }}
                  placeholder={t('customFood.foodNamePlaceholder')}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: '3rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <button
                  onClick={toggleVoiceInput}
                  className={`voice-input-button ${isListening ? 'listening' : ''}`}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    padding: '0.4rem',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: isListening ? '#ef4444' : 'transparent',
                    color: isListening ? 'white' : '#9ca3af',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  title={isListening ? '音声入力を停止' : '音声で入力'}
                >
                  {isListening ? (
                    <span style={{ fontSize: '1.2rem', animation: 'pulse 1.5s infinite' }}>⏹️</span>
                  ) : (
                    <span style={{ fontSize: '1.2rem' }}>🎤</span>
                  )}
                </button>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !foodName.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: isAnalyzing ? '#9ca3af' : '#b91c1c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                }}
              >
                {isAnalyzing ? t('customFood.analyzing') : t('customFood.aiSuggest')}
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
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={foodName || t('customFood.displayNamePlaceholder')}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                marginTop: '0.5rem',
              }}
            />
          </label>

          {/* AIローディング中のTips表示 */}
          {isAnalyzing && loadingTip && (
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
                  💡 {loadingTip.title}
                </div>
                <button
                  onClick={() => {
                    if (isTipSavedState) {
                      unsaveTip(loadingTip.id);
                    } else {
                      saveTip(loadingTip.id);
                    }
                    setIsTipSavedState(!isTipSavedState);
                  }}
                  style={{
                    background: isTipSavedState ? '#fef3c7' : 'none',
                    border: isTipSavedState ? '1px solid #f59e0b' : '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    color: isTipSavedState ? '#f59e0b' : '#6b7280',
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
                {loadingTip.content.substring(0, 150)}...
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                {previousTips.length > 0 && (
                  <button
                    onClick={() => {
                      const prevTip = previousTips[previousTips.length - 1];
                      setPreviousTips((prev) => prev.slice(0, -1));
                      setLoadingTip(prevTip);
                      setIsTipSavedState(isTipSaved(prevTip.id));
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
                    if (loadingTip) {
                      setPreviousTips((prev) => [...prev, loadingTip]);
                    }
                    const nextTip = getRandomTipExcluding(loadingTip.id);
                    setLoadingTip(nextTip);
                    setIsTipSavedState(isTipSaved(nextTip.id));
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

        {/* AI追加質問（食品名だけでは推測が難しい場合） */}
        {showFollowupInput && aiFollowupQuestions.length > 0 && (
          <div
            className="custom-food-section"
            style={{
              backgroundColor: '#fef3c7',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              border: '1px solid #fbbf24',
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
                  backgroundColor: '#f59e0b',
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
                ?
              </span>
              <strong style={{ fontSize: '16px' }}>{t('customFood.additionalInfoNeeded')}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {aiFollowupQuestions.map((question, index) => (
                <div key={index}>
                  <label
                    style={{
                      fontSize: '14px',
                      color: '#374151',
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: '500',
                    }}
                  >
                    {question}
                  </label>
                  <input
                    type="text"
                    value={followupAnswers[question] || ''}
                    onChange={(e) =>
                      setFollowupAnswers({ ...followupAnswers, [question]: e.target.value })
                    }
                    placeholder={t('customFood.answerPlaceholder')}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                  />
                </div>
              ))}
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: isAnalyzing ? '#9ca3af' : '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                }}
              >
                {isAnalyzing ? t('customFood.reanalyzing') : t('customFood.reanalyzeWithAnswer')}
              </button>
            </div>
          </div>
        )}

        {/* ステップ2: 食品タイプ */}
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
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            {(['animal', 'trash'] as const).map((foodType) => (
              <button
                key={foodType}
                onClick={() => setType(foodType)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: type === foodType ? '#b91c1c' : '#f3f4f6',
                  color: type === foodType ? 'white' : '#374151',
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
            <strong style={{ fontSize: '16px' }}>{t('customFood.nutrientsRequired')}</strong>
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '0.75rem' }}>
            100gあたりの値
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '0.5rem',
              backgroundColor: 'transparent',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}
          >
            {/* タンパク質 */}
            <div>
              <div>
                <MiniNutrientGauge
                  label=""
                  currentDailyTotal={nutrients?.protein || 0}
                  previewAmount={0}
                  target={100}
                  color={getNutrientColor('protein')}
                  unit="g"
                />
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: 0 }}>
                  {t('customFood.protein')}
                </div>
              </div>
              <input
                type="number"
                value={nutrients?.protein || ''}
                onChange={(e) =>
                  updateNutrient('protein', e.target.value ? parseFloat(e.target.value) : undefined)
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
              <div>
                <MiniNutrientGauge
                  label=""
                  currentDailyTotal={nutrients?.fat || 0}
                  previewAmount={0}
                  target={100}
                  color={getNutrientColor('fat')}
                  unit="g"
                />
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: 0 }}>
                  {t('customFood.fat')}
                </div>
              </div>
              <input
                type="number"
                value={nutrients?.fat || ''}
                onChange={(e) =>
                  updateNutrient('fat', e.target.value ? parseFloat(e.target.value) : undefined)
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
              <div>
                <MiniNutrientGauge
                  label=""
                  currentDailyTotal={nutrients?.carbs || 0}
                  previewAmount={0}
                  target={100}
                  color="#64748b"
                  unit="g"
                />
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: 0 }}>
                  {t('customFood.carbs')}
                </div>
              </div>
              <input
                type="number"
                value={nutrients?.carbs || ''}
                onChange={(e) =>
                  updateNutrient('carbs', e.target.value ? parseFloat(e.target.value) : undefined)
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
              <strong style={{ fontSize: '16px' }}>{t('customFood.nutrientsDetailed')}</strong>
            </div>
            <button
              onClick={() => setShowAdvancedNutrients(!showAdvancedNutrients)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: showAdvancedNutrients ? '#b91c1c' : '#f3f4f6',
                color: showAdvancedNutrients ? 'white' : '#374151',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              {showAdvancedNutrients ? t('customFood.hideDetails') : t('customFood.showDetails')}
            </button>
          </div>
          {showAdvancedNutrients && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}
            >
              {(() => {
                // Adjust CustomFoodScreen targets to match what was hardcoded or standard
                interface NutrientInputConfig {
                  key: string;
                  label: string;
                  target: number;
                  unit: string;
                  step: string;
                  nutrientKey: string; // for MiniNutrientGauge color lookup
                }

                const electrolyteConfigs: NutrientInputConfig[] = [
                  { key: 'sodium', label: t('customFood.sodium'), target: 5000, unit: 'mg', step: '0.1', nutrientKey: 'sodium' },
                  { key: 'potassium', label: t('customFood.potassium'), target: 4500, unit: 'mg', step: '0.1', nutrientKey: 'potassium' },
                  { key: 'magnesium', label: t('customFood.magnesium'), target: 600, unit: 'mg', step: '0.1', nutrientKey: 'magnesium' },
                ];

                const otherConfigs: NutrientInputConfig[] = [
                  { key: 'zinc', label: t('customFood.zinc'), target: 11, unit: 'mg', step: '0.01', nutrientKey: 'zinc' },
                  { key: 'iron', label: t('customFood.iron'), target: 8, unit: 'mg', step: '0.01', nutrientKey: 'iron' },
                  { key: 'vitaminA', label: `${t('customFood.vitaminA')} (IU/100g)`, target: 5000, unit: 'IU', step: '1', nutrientKey: 'vitamin_a' },
                  { key: 'vitaminD', label: `${t('customFood.vitaminD')} (IU/100g)`, target: 2000, unit: 'IU', step: '0.1', nutrientKey: 'vitamin_d' },
                  { key: 'vitaminK2', label: t('customFood.vitaminK2'), target: 200, unit: 'μg', step: '0.1', nutrientKey: 'vitamin_k2' },
                  { key: 'vitaminB12', label: t('customFood.vitaminB12'), target: 2.4, unit: 'μg', step: '0.01', nutrientKey: 'vitamin_b12' },
                  { key: 'omega3', label: t('customFood.omega3'), target: 2, unit: 'g', step: '0.01', nutrientKey: 'omega3' },
                  { key: 'omega6', label: t('customFood.omega6'), target: 5, unit: 'g', step: '0.01', nutrientKey: 'omega6' },
                  { key: 'calcium', label: t('customFood.calcium'), target: 1000, unit: 'mg', step: '0.1', nutrientKey: 'calcium' },
                  { key: 'phosphorus', label: t('customFood.phosphorus'), target: 700, unit: 'mg', step: '0.1', nutrientKey: 'phosphorus' },
                  { key: 'glycine', label: t('customFood.glycine'), target: 10, unit: 'g', step: '0.01', nutrientKey: 'glycine' },
                  { key: 'methionine', label: t('customFood.methionine'), target: 2, unit: 'g', step: '0.01', nutrientKey: 'methionine' },
                  { key: 'taurine', label: t('customFood.taurine'), target: 500, unit: 'mg', step: '0.1', nutrientKey: 'taurine' },
                  { key: 'vitaminB5', label: t('customFood.vitaminB5'), target: 0, unit: '', step: '0.01', nutrientKey: 'vitamin_b5' }, // Target 0/Empty unit in original?
                  { key: 'vitaminB9', label: t('customFood.vitaminB9'), target: 0, unit: '', step: '0.1', nutrientKey: 'vitamin_b9' },
                  { key: 'chromium', label: t('customFood.chromium'), target: 0, unit: '', step: '0.1', nutrientKey: 'chromium' },
                  { key: 'molybdenum', label: t('customFood.molybdenum'), target: 0, unit: '', step: '0.1', nutrientKey: 'molybdenum' },
                  { key: 'fluoride', label: t('customFood.fluoride'), target: 0, unit: '', step: '0.01', nutrientKey: 'fluoride' },
                  { key: 'chloride', label: t('customFood.chloride'), target: 0, unit: '', step: '0.1', nutrientKey: 'chloride' },
                  { key: 'boron', label: t('customFood.boron'), target: 0, unit: '', step: '0.01', nutrientKey: 'boron' },
                  { key: 'nickel', label: t('customFood.nickel'), target: 0, unit: '', step: '0.01', nutrientKey: 'nickel' },
                  { key: 'silicon', label: t('customFood.silicon'), target: 0, unit: '', step: '0.1', nutrientKey: 'silicon' },
                  { key: 'vanadium', label: t('customFood.vanadium'), target: 0, unit: '', step: '0.1', nutrientKey: 'vanadium' },
                ];

                const renderInput = (config: NutrientInputConfig) => (
                  <div key={config.key}>
                    <div>
                      {config.target > 0 && (
                        <MiniNutrientGauge
                          label=""
                          currentDailyTotal={(nutrients as Record<string, number>)?.[config.key] || 0}
                          previewAmount={0}
                          target={config.target}
                          color={getNutrientColor(config.nutrientKey)}
                          unit={config.unit}
                          nutrientKey={config.nutrientKey}
                        />
                      )}
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: 0 }}>
                        {config.label}
                      </div>
                    </div>
                    <input
                      type="number"
                      value={(nutrients as Record<string, number>)?.[config.key] || ''}
                      onChange={(e) =>
                        updateNutrient(
                          config.key,
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                      placeholder="0"
                      step={config.step}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        marginTop: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                );

                const renderSection = (label: string, configs: NutrientInputConfig[]) => (
                  <div>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#4b5563',
                      marginBottom: '1rem',
                      borderBottom: '1px solid #e5e7eb',
                      paddingBottom: '0.5rem'
                    }}>
                      {label}
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                    }}>
                      {configs.map(renderInput)}
                    </div>
                  </div>
                );

                return (
                  <>
                    {renderSection(NUTRIENT_GROUPS.electrolytes.label, electrolyteConfigs)}
                    {renderSection(NUTRIENT_GROUPS.other.label, otherConfigs)}
                  </>
                );
              })()}
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
              <strong style={{ fontSize: '16px' }}>{t('customFood.antiNutrients')}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <div>
                  <MiniNutrientGauge
                    label=""
                    currentDailyTotal={nutrients?.phytates || 0}
                    previewAmount={0}
                    target={0}
                    color="#ef4444"
                    unit="mg"
                    nutrientKey="phytates"
                  />
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: 0 }}>
                    {t('customFood.phytates')}
                  </div>
                </div>
                <input
                  type="number"
                  value={nutrients?.phytates || ''}
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
                    marginTop: '0.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                  }}
                />
              </div>
              <div>
                <div>
                  <MiniNutrientGauge
                    label=""
                    currentDailyTotal={nutrients?.oxalates || 0}
                    previewAmount={0}
                    target={0}
                    color="#ef4444"
                    unit="mg"
                    nutrientKey="oxalates"
                  />
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: 0 }}>
                    {t('customFood.oxalates')}
                  </div>
                </div>
                <input
                  type="number"
                  value={nutrients?.oxalates || ''}
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
                    marginTop: '0.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                  }}
                />
              </div>
              <div>
                <div>
                  <MiniNutrientGauge
                    label=""
                    currentDailyTotal={nutrients?.lectins || 0}
                    previewAmount={0}
                    target={0}
                    color="#ef4444"
                    unit="mg"
                    nutrientKey="lectins"
                  />
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: 0 }}>
                    {t('customFood.lectins')}
                  </div>
                </div>
                <input
                  type="number"
                  value={nutrients?.lectins || ''}
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
                    marginTop: '0.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                  }}
                />
              </div>
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
                <strong style={{ fontSize: '16px' }}>
                  {t('customFood.antiNutrientsDetailed')}
                </strong>
              </div>
              <button
                onClick={() => setShowAdvancedAntiNutrients(!showAdvancedAntiNutrients)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: showAdvancedAntiNutrients ? '#b91c1c' : '#f3f4f6',
                  color: showAdvancedAntiNutrients ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                {showAdvancedAntiNutrients
                  ? t('customFood.hideDetails')
                  : t('customFood.showDetails')}
              </button>
            </div>
            {showAdvancedAntiNutrients && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <div>
                    <MiniNutrientGauge
                      label=""
                      currentDailyTotal={nutrients?.polyphenols || 0}
                      previewAmount={0}
                      target={0}
                      color="#ef4444"
                      unit="mg"
                      nutrientKey="polyphenols"
                    />
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: 0 }}>
                      {t('customFood.polyphenols')}
                    </div>
                  </div>
                  <input
                    type="number"
                    value={nutrients?.polyphenols || ''}
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
                      marginTop: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <div>
                  <div>
                    <MiniNutrientGauge
                      label=""
                      currentDailyTotal={nutrients?.flavonoids || 0}
                      previewAmount={0}
                      target={0}
                      color="#ef4444"
                      unit="mg"
                      nutrientKey="flavonoids"
                    />
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: 0 }}>
                      {t('customFood.flavonoids')}
                    </div>
                  </div>
                  <input
                    type="number"
                    value={nutrients?.flavonoids || ''}
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
                      marginTop: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <div>
                  <div>
                    <MiniNutrientGauge
                      label=""
                      currentDailyTotal={nutrients?.saponins || 0}
                      previewAmount={0}
                      target={0}
                      color="#ef4444"
                      unit="mg"
                      nutrientKey="saponins"
                    />
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: 0 }}>
                      {t('customFood.saponins')}
                    </div>
                  </div>
                  <input
                    type="number"
                    value={nutrients?.saponins || ''}
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
                      marginTop: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <div>
                  <div>
                    <MiniNutrientGauge
                      label=""
                      currentDailyTotal={nutrients?.goitrogens || 0}
                      previewAmount={0}
                      target={0}
                      color="#ef4444"
                      unit="mg"
                      nutrientKey="goitrogens"
                    />
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: 0 }}>
                      {t('customFood.goitrogens')}
                    </div>
                  </div>
                  <input
                    type="number"
                    value={nutrients?.goitrogens || ''}
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
                      marginTop: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <div>
                  <div>
                    <MiniNutrientGauge
                      label=""
                      currentDailyTotal={nutrients?.tannins || 0}
                      previewAmount={0}
                      target={0}
                      color="#ef4444"
                      unit="mg"
                      nutrientKey="tannins"
                    />
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: 0 }}>
                      {t('customFood.tannins')}
                    </div>
                  </div>
                  <input
                    type="number"
                    value={nutrients?.tannins || ''}
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
                      marginTop: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        }

        {/* 今日のログに追加するオプション */}
        {!foodId && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
            }}
          >
            <label
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
            >
              <input
                type="checkbox"
                checked={addToTodayLog}
                onChange={(e) => setAddToTodayLog(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px', color: '#374151' }}>
                {t('customFood.addToTodayLog')}
              </span>
            </label>
          </div>
        )}

        {/* 保存ボタン */}
        <div
          style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}
        >
          <button
            onClick={onClose}
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
            onClick={handleSave}
            disabled={isLoading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: isLoading ? '#9ca3af' : '#b91c1c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
            }}
          >
            {isLoading ? t('customFood.saving') : t('customFood.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
