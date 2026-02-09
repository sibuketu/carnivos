import React, { useState, useEffect } from 'react';
import type { FoodItem } from '../types';
import { refineFoodAnalysis } from '../services/aiService';
import MiniNutrientGauge from './MiniNutrientGauge';
import type { CarnivoreTarget } from '../data/carnivoreTargets';
import { getSequentialTip, type Tip, saveTip, unsaveTip, isTipSaved } from '../data/tips';
import { useNutrition } from '../hooks/useNutrition';
import { useTranslation } from '../utils/i18n';

interface PhotoAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisResult: {
    foodName: string;
    estimatedWeight: number;
    type?: string;
    nutrients?: Record<string, number>;
    followupQuestions?: string[];
  };
  onConfirm: (foodItem: FoodItem) => void;
  // ゲージ表示に必要な目標値（CarnivoreTarget型を使用）
  dynamicTargets: CarnivoreTarget;
}

export default function PhotoAnalysisModal({
  isOpen,
  onClose,
  analysisResult,
  onConfirm,
  dynamicTargets,
}: PhotoAnalysisModalProps) {
  const { t } = useTranslation();
  // ローカルステートで編集内容を管理
  const [currentResult, setCurrentResult] = useState(analysisResult);
  const [followupAnswers, setFollowupAnswers] = useState<Record<string, string>>({});
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [loadingTip, setLoadingTip] = useState<Tip | null>(null); // ローディング中のTips
  const [isTipSavedState, setIsTipSavedState] = useState(false); // Tipsの保存状態
  const [showChargeAnim, setShowChargeAnim] = useState(false);
  const { todayLog } = useNutrition();

  // 現在の摂取合計を計算
  const currentDailyTotals = {
    protein: todayLog?.calculatedMetrics?.effectiveProtein || 0,
    fat: todayLog?.calculatedMetrics?.fatTotal || 0,
    sodium: todayLog?.calculatedMetrics?.sodiumTotal || 0,
    magnesium: todayLog?.calculatedMetrics?.magnesiumTotal || 0,
    potassium: todayLog?.calculatedMetrics?.potassiumTotal || 0,
    zinc: todayLog?.calculatedMetrics?.effectiveZinc || 0,
    iron: todayLog?.calculatedMetrics?.effectiveIron || 0,
    vitaminD: todayLog?.calculatedMetrics?.vitaminDTotal || 0,
  };

  // analysisResultが更新されたらローカルも更新（初期化）
  useEffect(() => {
    setCurrentResult(analysisResult);
    setFollowupAnswers({});
    // 写真解析中にTipsを1つ表示（順番表示）
    if (isOpen && !loadingTip) {
      const { tip } = getSequentialTip();
      setLoadingTip(tip);
      setIsTipSavedState(isTipSaved(tip.id));
    }
  }, [analysisResult, isOpen, loadingTip]);

  if (!isOpen || !currentResult) return null;

  const handleAccept = () => {
    // Show charge animation before closing or adding
    setShowChargeAnim(true);

    setTimeout(() => {
      const ratio = currentResult.estimatedWeight / 100;
      const nutrients: Record<string, number> = {};
      if (currentResult.nutrients) {
        Object.entries(currentResult.nutrients).forEach(([key, value]) => {
          nutrients[key] = (value as number) * ratio;
        });
      }
      const foodItem: FoodItem = {
        item: currentResult.foodName,
        amount: currentResult.estimatedWeight,
        unit: 'g' as const,
        type: (currentResult.type as 'animal' | 'dairy' | 'fish' | undefined) || 'animal',
        nutrients: Object.keys(nutrients).length > 0 ? nutrients : undefined,
      };
      onConfirm(foodItem);
      setShowChargeAnim(false);
    }, 1500); // Wait for animation
  };

  if (showChargeAnim) {
    return (
      <div className="fixed inset-0 z-10000 bg-black flex flex-col items-center justify-center">
        <div className="text-6xl mb-6 animate-bounce">⚡</div>
        <div className="text-3xl font-bold text-rose-500 font-mono tracking-widest animate-pulse">
          NUTRIENT CHARGED
        </div>
        <div className="w-64 h-4 bg-stone-800 rounded-full mt-6 overflow-hidden border border-rose-900">
          <div className="h-full bg-rose-500 animate-[fillBar_1s_ease-out_forwards]" style={{ width: '100%', transition: 'width 1s ease-out' }} />
        </div>
        <style>{`
          @keyframes fillBar {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    );
  }
  const ratio = currentResult.estimatedWeight / 100;
  const nutrients = currentResult.nutrients || {};

  // 各栄養素の値を計算
  const p = (nutrients.protein || 0) * ratio;
  const f = (nutrients.fat || 0) * ratio;
  const sodium = (nutrients.sodium || 0) * ratio;
  const magnesium = (nutrients.magnesium || 0) * ratio;
  const potassium = (nutrients.potassium || 0) * ratio;
  const zinc = (nutrients.zinc || 0) * ratio;
  const iron = (nutrients.iron || 0) * ratio;
  const vitaminD = (nutrients.vitaminD || 0) * ratio;

  // 目標値を取得
  const pTarget = dynamicTargets.protein || 100;
  const fTarget = dynamicTargets.fat || 100;
  const sodiumTarget = dynamicTargets.sodium || 5000;
  const magnesiumTarget = dynamicTargets.magnesium || 600;
  const potassiumTarget = dynamicTargets.potassium || 4500;
  const zincTarget = dynamicTargets.zinc || 11;
  const ironTarget = dynamicTargets.iron || 8;
  const vitaminDTarget = dynamicTargets.vitamin_d || 2000;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(5px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#1f2937',
          color: '#f9fafb',
          borderRadius: '16px',
          padding: '1.5rem',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          border: '1px solid #374151',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #374151',
            paddingBottom: '0.75rem',
          }}
        >
          📸 解析結果・調整
        </h2>

        <div
          style={{
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* 食品名入力と再検索 */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                fontSize: '14px',
                color: '#9ca3af',
              }}
            >
              食品名（変更して検索可能）
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={currentResult.foodName}
                onChange={(e) => setCurrentResult({ ...currentResult, foodName: e.target.value })}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#111827',
                  border: '1px solid #4b5563',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '16px',
                }}
              />
              <button
                onClick={async () => {
                  if (!currentResult.foodName || isAIProcessing) return;
                  setIsAIProcessing(true);
                  try {
                    const { analyzeFoodName } = await import('../services/aiService');
                    const result = await analyzeFoodName(currentResult.foodName);
                    setCurrentResult((prev) => ({
                      ...prev,
                      nutrients: result.nutrients,
                      type: result.type,
                    }));
                  } catch {
                    (window as unknown as { showToast?: (msg: string) => void }).showToast?.('検索に失敗しました');
                  } finally {
                    setIsAIProcessing(false);
                  }
                }}
                disabled={isAIProcessing}
                style={{
                  padding: '0 1rem',
                  backgroundColor: '#374151',
                  color: 'white',
                  border: '1px solid #4b5563',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '20px',
                }}
              >
                🔍
              </button>
            </div>
          </div>

          {/* 量の調整とゲージプレビュー */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#111827',
              borderRadius: '12px',
              border: '1px solid #374151',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <label style={{ fontWeight: '600', color: '#e5e7eb' }}>{t('photoAnalysis.eatAmount')}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number"
                  value={currentResult.estimatedWeight}
                  onChange={(e) =>
                    setCurrentResult({
                      ...currentResult,
                      estimatedWeight: Math.max(0, Number(e.target.value)),
                    })
                  }
                  style={{
                    width: '80px',
                    padding: '0.5rem',
                    textAlign: 'right',
                    backgroundColor: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
                <span style={{ color: '#9ca3af' }}>g</span>
              </div>
            </div>

            {/* スライダー */}
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={currentResult.estimatedWeight}
              onChange={(e) =>
                setCurrentResult({ ...currentResult, estimatedWeight: Number(e.target.value) })
              }
              style={{
                width: '100%',
                marginBottom: '1.5rem',
                accentColor: '#dc2626',
                cursor: 'pointer',
              }}
            />

            {/* リアルタイム栄養素ゲージ */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <MiniNutrientGauge
                label="タンパク質"
                currentDailyTotal={currentDailyTotals.protein}
                previewAmount={p}
                target={pTarget}
                unit="g"
                color="#ef4444"
                nutrientKey="protein"
              />
              <MiniNutrientGauge
                label="脂質"
                currentDailyTotal={currentDailyTotals.fat}
                previewAmount={f}
                target={fTarget}
                unit="g"
                color="#f43f5e"
                nutrientKey="fat"
              />
              {/* 電解質（重要） */}
              {(sodium > 0 || nutrients.sodium) && (
                <MiniNutrientGauge
                  label="ナトリウム"
                  currentDailyTotal={currentDailyTotals.sodium}
                  previewAmount={sodium}
                  target={sodiumTarget}
                  unit="mg"
                  color="#f43f5e"
                  nutrientKey="sodium"
                />
              )}
              {(magnesium > 0 || nutrients.magnesium) && (
                <MiniNutrientGauge
                  label="マグネシウム"
                  currentDailyTotal={currentDailyTotals.magnesium}
                  previewAmount={magnesium}
                  target={magnesiumTarget}
                  unit="mg"
                  color="#8b5cf6"
                  nutrientKey="magnesium"
                />
              )}
              {(potassium > 0 || nutrients.potassium) && (
                <MiniNutrientGauge
                  label="カリウム"
                  currentDailyTotal={currentDailyTotals.potassium}
                  previewAmount={potassium}
                  target={potassiumTarget}
                  unit="mg"
                  color="#f43f5e"
                  nutrientKey="potassium"
                />
              )}
              {/* ミネラル */}
              {(zinc > 0 || nutrients.zinc) && (
                <MiniNutrientGauge
                  label="亜鉛"
                  currentDailyTotal={currentDailyTotals.zinc}
                  previewAmount={zinc}
                  target={zincTarget}
                  unit="mg"
                  color="#f59e0b"
                  nutrientKey="zinc"
                />
              )}
              {(iron > 0 || nutrients.iron) && (
                <MiniNutrientGauge
                  label="鉄分"
                  currentDailyTotal={currentDailyTotals.iron}
                  previewAmount={iron}
                  target={ironTarget}
                  unit="mg"
                  color="#dc2626"
                  nutrientKey="iron"
                />
              )}
              {/* ビタミン */}
              {(vitaminD > 0 || nutrients.vitaminD) && (
                <MiniNutrientGauge
                  label="ビタミンD"
                  currentDailyTotal={currentDailyTotals.vitaminD}
                  previewAmount={vitaminD}
                  target={vitaminDTarget}
                  unit="IU"
                  color="#f97316"
                  nutrientKey="vitamin_d"
                />
              )}
            </div>
          </div>

          {/* Tips表示（写真解析中） */}
          {loadingTip && (
            <div
              style={{
                marginTop: '0.5rem',
                padding: '1rem',
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                border: '1px solid #fbbf24',
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
                <h3
                  style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#92400e',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  💡 {loadingTip.title}
                </h3>
                <button
                  onClick={() => {
                    if (isTipSavedState) {
                      unsaveTip(loadingTip.id);
                      setIsTipSavedState(false);
                    } else {
                      saveTip(loadingTip);
                      setIsTipSavedState(true);
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '0',
                    color: isTipSavedState ? '#fbbf24' : '#d1d5db',
                  }}
                >
                  {isTipSavedState ? '⭐' : '☆'}
                </button>
              </div>
              <p style={{ fontSize: '13px', color: '#78350f', lineHeight: '1.6', margin: 0 }}>
                {loadingTip.content}
              </p>
            </div>
          )}

          {/* AIからの質問 */}
          {currentResult.followupQuestions && currentResult.followupQuestions.length > 0 && (
            <div
              style={{
                marginTop: '0.5rem',
                padding: '1rem',
                backgroundColor: '#374151',
                borderRadius: '8px',
                borderLeft: '4px solid #f59e0b',
              }}
            >
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#fcd34d',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                🤔 AIが気になっていること
              </h3>
              {currentResult.followupQuestions.map((question, index) => (
                <div key={index} style={{ marginBottom: '1rem' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '14px',
                      color: '#e5e7eb',
                    }}
                  >
                    {question}
                  </label>
                  <input
                    type="text"
                    placeholder="回答を入力..."
                    value={followupAnswers[question] || ''}
                    onChange={(e) =>
                      setFollowupAnswers({ ...followupAnswers, [question]: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      backgroundColor: '#1f2937',
                      border: '1px solid #4b5563',
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                </div>
              ))}

              <button
                onClick={async () => {
                  if (isAIProcessing) return;
                  try {
                    setIsAIProcessing(true);
                    const refined = await refineFoodAnalysis(
                      {
                        foodName: currentResult.foodName,
                        estimatedWeight: currentResult.estimatedWeight,
                        type: currentResult.type,
                      },
                      followupAnswers
                    );
                    setCurrentResult({ ...refined, followupQuestions: [] });
                  } catch {
                    (window as unknown as { showToast?: (msg: string) => void }).showToast?.('再計算に失敗しました');
                  } finally {
                    setIsAIProcessing(false);
                  }
                }}
                disabled={isAIProcessing || Object.keys(followupAnswers).length === 0}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: isAIProcessing ? '#4b5563' : '#f59e0b',
                  color: isAIProcessing ? '#9ca3af' : '#1f2937',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: isAIProcessing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '14px',
                }}
              >
                {isAIProcessing ? '計算中...' : '✨ 回答を反映して栄養素を更新'}
              </button>
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #374151',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              color: '#9ca3af',
              border: '1px solid #4b5563',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            キャンセル
          </button>
          <button
            onClick={handleAccept}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#16a34a', // Green-600
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 0 15px rgba(22, 163, 74, 0.5)', // Neon glow
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>⚡</span> CHARGE
          </button>
        </div>
      </div>
    </div>
  );
}
