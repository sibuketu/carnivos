/**
 * CarnivOS - Mini Nutrient Gauge Component
 *
 * ButcherSelectで使用されている栄養素ゲージコンポーネントを共通化
 * 4-Zone Gradientスタイルで、摂取基準との距離を視覚的に表示
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  calculateNutrientImpactFactors,
  applySortOrder,
  getCategoryName,
} from '../utils/nutrientImpactFactors';
import { getNutrientExplanation } from '../utils/nutrientExplanationHelper';
import { CARNIVORE_NUTRIENT_TARGETS, getCarnivoreTargets } from '../data/carnivoreTargets';
import { getLanguage } from '../utils/i18n';

interface MiniNutrientGaugeProps {
  label: string;
  currentDailyTotal?: number; // Layer 1: Base
  previewAmount?: number; // Layer 2: Preview
  target: number;
  color: string;
  unit?: string;
  logic?: string; // 栄養目標値の根拠表示用
  hint?: string; // 不足時の提案テキスト
  showLowIsOk?: boolean; // Vitamin Cなど、低くてもOKな場合
  nutrientKey?: string; // 栄養素キー（例: 'protein', 'iron', 'magnesium'）
  hideTarget?: boolean; // カスタム食品画面用: targetを表示しない
  onInfoClick?: () => void; // 💡アイコンクリック時のコールバック
}

function MiniNutrientGauge({
  label,
  currentDailyTotal = 0, // Layer 1: 今日すでに確定した摂取量
  previewAmount = 0, // Layer 2: 今選択している食材の増加分
  target,
  color,
  unit = '',
  logic,
  hint,
  showLowIsOk = false,
  nutrientKey,
  hideTarget = false, // カスタム食品画面用: targetを表示しない
  onInfoClick,
}: MiniNutrientGaugeProps) {
  const { userProfile } = useApp();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showModal, setShowModal] = useState(false);
  const [explanationMode, setExplanationMode] = useState<'simple' | 'detailed' | 'general'>(
    'simple'
  ); // 簡易/詳細/一般論表示モード

  // 栄養素キーを推測（labelから）
  const inferredNutrientKey = useMemo(() => {
    if (nutrientKey) return nutrientKey;
    const labelLower = label.toLowerCase();
    if (labelLower.includes('タンパク質') || labelLower.includes('protein')) return 'protein';
    if (labelLower.includes('脂質') || labelLower.includes('fat')) return 'fat';
    if (labelLower.includes('鉄') || labelLower.includes('iron')) return 'iron';
    if (labelLower.includes('マグネシウム') || labelLower.includes('magnesium')) return 'magnesium';
    if (labelLower.includes('ビタミンd') || labelLower.includes('vitamin d')) return 'vitamin_d';
    if (labelLower.includes('ナトリウム') || labelLower.includes('sodium')) return 'sodium';
    if (labelLower.includes('カリウム') || labelLower.includes('potassium')) return 'potassium';
    if (labelLower.includes('亜鉛') || labelLower.includes('zinc')) return 'zinc';
    if (labelLower.includes('ビタミンc') || labelLower.includes('vitamin c')) return 'vitamin_c';
    if (labelLower.includes('ビタミンa') || labelLower.includes('vitamin a')) return 'vitamin_a';
    if (labelLower.includes('ビタミンk') || labelLower.includes('vitamin k')) return 'vitamin_k2';
    if (labelLower.includes('ビタミンb12') || labelLower.includes('vitamin b12'))
      return 'vitamin_b12';
    if (labelLower.includes('コリン') || labelLower.includes('choline')) return 'choline';
    if (labelLower.includes('リン') || labelLower.includes('phosphorus')) return 'phosphorus';
    if (labelLower.includes('セレン') || labelLower.includes('selenium')) return 'selenium';
    if (labelLower.includes('カルシウム') || labelLower.includes('calcium')) return 'calcium';
    if (labelLower.includes('グリシン') || labelLower.includes('glycine')) return 'glycine';
    if (labelLower.includes('メチオニン') || labelLower.includes('methionine')) return 'methionine';
    if (labelLower.includes('タウリン') || labelLower.includes('taurine')) return 'taurine';
    return null;
  }, [label, nutrientKey]);

  // 影響要因を計算
  const impactFactors = useMemo(() => {
    if (!inferredNutrientKey || !userProfile) return [];
    try {
      const factors = calculateNutrientImpactFactors(inferredNutrientKey as keyof typeof CARNIVORE_NUTRIENT_TARGETS, userProfile);
      return applySortOrder(factors, 'impact');
    } catch (error) {
      console.error('Error calculating impact factors:', error);
      return [];
    }
  }, [inferredNutrientKey, userProfile]);

  const totalValue = currentDailyTotal + previewAmount;
  const basePercent = target > 0 ? Math.min((currentDailyTotal / target) * 100, 100) : 0;
  const previewPercent = target > 0 ? Math.min((previewAmount / target) * 100, 100) : 0;
  const totalPercent = target > 0 ? Math.min((totalValue / target) * 100, 200) : 0; // 200%まで表示可能

  const displayValue = totalValue.toFixed(1);
  const displayTarget = target.toFixed(1);
  const isLow = totalValue < target * 0.5; // 目標の50%未満を「低い」と判定

  // 自動ヒント生成（不足時）
  const autoHint = useMemo(() => {
    if (hint) return hint; // 既にhintがある場合はそれを使用
    if (impactFactors.length > 0) return null; // impactFactorsがある場合はモーダルで表示

    // 不足時の自動ヒント生成
    if (totalValue < target * 0.8) {
      const deficit = target - totalValue;
      if (inferredNutrientKey === 'sodium') {
        return `現状: 不足気味（${deficit.toFixed(0)}${unit}不足）。ミネラルウォーターや塩で補給可能`;
      } else if (inferredNutrientKey === 'magnesium') {
        return `現状: 不足気味（${deficit.toFixed(0)}${unit}不足）。ミネラルウォーターやサプリメントで補給可能`;
      } else if (inferredNutrientKey === 'potassium') {
        return `現状: 不足気味（${deficit.toFixed(0)}${unit}不足）。肉や魚を増やすことで補給可能`;
      } else if (inferredNutrientKey === 'protein') {
        return `現状: 不足気味（${deficit.toFixed(0)}${unit}不足）。肉や魚を増やすことで補給可能`;
      } else if (inferredNutrientKey === 'fat') {
        return `現状: 不足気味（${deficit.toFixed(0)}${unit}不足）。脂身の多い肉やバターを増やすことで補給可能`;
      } else if (inferredNutrientKey === 'iron') {
        return `現状: 不足気味（${deficit.toFixed(0)}${unit}不足）。赤身肉やレバーを増やすことで補給可能`;
      } else if (inferredNutrientKey === 'zinc') {
        return `現状: 不足気味（${deficit.toFixed(0)}${unit}不足）。赤身肉や内臓を増やすことで補給可能`;
      } else if (inferredNutrientKey === 'vitamin_b12') {
        return `現状: 不足気味（${deficit.toFixed(0)}${unit}不足）。肉や魚、内臓を増やすことで補給可能`;
      } else {
        return `現状: 不足気味（${deficit.toFixed(0)}${unit}不足）。食品を追加して補給してください`;
      }
    }
    return null;
  }, [hint, impactFactors.length, totalValue, target, unit, inferredNutrientKey]);

  // 単色を生成する関数（グラデーションなし）
  const getSingleColor = (percent: number, isPastFood: boolean): string => {
    // 過去に追加した食品は黒色
    if (isPastFood) {
      return '#1f2937'; // 黒色
    }

    // 単色（閾値に応じて色が変わる）
    if (percent < 50) {
      return '#ef4444'; // 赤（不足）
    } else if (percent < 100) {
      return '#f97316'; // オレンジ（やや不足）
    } else if (percent < 120) {
      return '#f43f5e'; // 緑（適切）
    } else {
      return '#f43f5e'; // 紫（過剰）
    }
  };



  // 根拠がある場合はコンソールに出力（将来はツールチップで表示）
  useEffect(() => {
    if (logic && import.meta.env.DEV) {
      console.log(`[MiniNutrientGauge] Logic for ${label}:`, logic);
    }
  }, [label, logic]);

  // 各栄養素のデフォルト説明（nutrientExplanationが取得できない場合に使用）
  const getDefaultExplanation = (
    nutrientKey: string | null,
    targetValue: number,
    unit: string
  ): string | null => {
    if (!nutrientKey) return null;
    const lang = getLanguage();
    const jaExplanations: Record<string, string> = {
      protein: `タンパク質は筋肉、臓器、ホルモン、酵素などの構成要素として必要不可欠です。カーニボアダイエットでは、体重1kgあたり約1.6gが推奨されており、標準的な目標値は${targetValue}${unit}です。肉、魚、卵、内臓などから十分に摂取できます。`,
      fat: `脂質はカーニボアダイエットの主要なエネルギー源です。タンパク質の約1.4倍が推奨され、標準的な目標値は${targetValue}${unit}です。脂質が不足するとエネルギー不足やホルモン産生の低下につながる可能性があります。脂身の多い肉を中心に摂取することを推奨します。`,
      iron: `鉄分は赤血球の生成や酸素運搬に必要です。カーニボアダイエットでは、赤身肉や内臓（特にレバー）から十分に摂取できます。標準的な目標値は${targetValue}${unit}です。女性は月経による損失があるため、より多くの摂取が推奨されます。`,
      magnesium: `マグネシウムは300以上の酵素反応に関与し、筋肉の収縮、神経伝達、エネルギー産生に重要です。カーニボアダイエットでは、肉からある程度摂取できますが、ストレスや運動によって需要が増加します。標準的な目標値は${targetValue}${unit}です。`,
      vitamin_d: `ビタミンDは骨の健康、免疫機能、ホルモン産生に重要です。日光暴露により体内で生成されますが、不足する場合はサプリメントも検討できます。標準的な目標値は${targetValue}${unit}です。`,
      sodium: `ナトリウムは電解質バランスの維持、水分保持、神経伝達に必要です。カーニボアダイエットでは低インスリン状態になるため、より多くのナトリウムが必要です。標準的な目標値は${targetValue}${unit}です。塩やミネラルウォーターで補給できます。`,
      potassium: `カリウムはナトリウムと共に電解質バランスを維持し、筋肉の収縮や神経伝達に重要です。カーニボアダイエットでは、肉や魚から十分に摂取できます。標準的な目標値は${targetValue}${unit}です。`,
      zinc: `亜鉛は免疫機能、タンパク質合成、傷の治癒に重要です。カーニボアダイエットでは、赤身肉や内臓から十分に摂取できます。ヘム鉄による吸収促進により、効率的に摂取できます。標準的な目標値は${targetValue}${unit}です。`,
      vitamin_c: `ビタミンCは低炭水化物状態では必要量が大幅に減少します（Glucose-Ascorbate Antagonism理論）。カーニボアダイエットでは、肉から約30mgを摂取可能で、必要最小量の約10mgを十分に満たします。標準的な目標値は${targetValue}${unit}です。`,
      vitamin_a: `ビタミンA（レチノール）は視力、免疫機能、皮膚の健康に重要です。カーニボアダイエットでは、レバーや内臓肉から十分に摂取できます。標準的な目標値は${targetValue}${unit}です。過剰摂取に注意が必要です。`,
      vitamin_k2: `ビタミンK2（MK-4）は骨の健康や血液凝固に重要です。カーニボアダイエットでは、内臓肉や発酵食品から十分に摂取できます。標準的な目標値は${targetValue}${unit}です。`,
      vitamin_b12: `ビタミンB12は赤血球の生成や神経機能に必要です。カーニボアダイエットでは、肉や魚、内臓から十分に摂取できます。標準的な目標値は${targetValue}${unit}です。`,
      choline: `コリンは脳の健康、記憶、学習に重要です。カーニボアダイエットでは、レバーや卵から十分に摂取できます。標準的な目標値は${targetValue}${unit}です。`,
      selenium: `セレンは抗酸化作用、甲状腺機能、免疫機能に重要です。カーニボアダイエットでは、肉や魚から十分に摂取できます。標準的な目標値は${targetValue}${unit}です。`,
      calcium: `カルシウムは骨の健康、筋肉の収縮、神経伝達に重要です。カーニボアダイエットでは、骨付き肉や骨スープから摂取できます。標準的な目標値は${targetValue}${unit}です。`,
      phosphorus: `リンは骨の健康、エネルギー産生、DNA合成に重要です。カーニボアダイエットでは、肉から十分に摂取できます。標準的な目標値は${targetValue}${unit}です。`,
      glycine: `グリシンはコラーゲンの構成要素、睡眠の質、炎症抑制に重要です。カーニボアダイエットでは、骨スープや皮付き肉から摂取できます。標準的な目標値は${targetValue}${unit}です。`,
      methionine: `メチオニンはタンパク質合成、解毒作用に重要です。カーニボアダイエットでは、肉から十分に摂取できます。標準的な目標値は${targetValue}${unit}です。`,
      taurine: `タウリンは心臓の健康、視力、抗酸化作用に重要です。カーニボアダイエットでは、肉や魚から十分に摂取できます。標準的な目標値は${targetValue}${unit}です。`,
    };
    const enExplanations: Record<string, string> = {
      protein: `Protein is essential for muscles, organs, hormones, and enzymes. On a carnivore diet, ~1.6g per kg body weight is recommended. Target: ${targetValue}${unit}. Easily obtained from meat, fish, eggs, and organs.`,
      fat: `Fat is the primary energy source on a carnivore diet. ~1.4x protein intake is recommended. Target: ${targetValue}${unit}. Insufficient fat can lead to low energy and hormonal issues. Prioritize fatty cuts of meat.`,
      iron: `Iron is needed for red blood cell production and oxygen transport. On a carnivore diet, red meat and organs (especially liver) provide ample iron. Target: ${targetValue}${unit}. Women may need more due to menstrual losses.`,
      magnesium: `Magnesium is involved in 300+ enzyme reactions, muscle contraction, and energy production. Stress and exercise increase demand. Target: ${targetValue}${unit}.`,
      vitamin_d: `Vitamin D is important for bone health, immunity, and hormone production. Produced via sun exposure; supplement if needed. Target: ${targetValue}${unit}.`,
      sodium: `Sodium maintains electrolyte balance and nerve function. Low insulin on carnivore increases sodium excretion, so higher intake is needed. Target: ${targetValue}${unit}. Use salt or mineral water.`,
      potassium: `Potassium works with sodium for electrolyte balance, muscle contraction, and nerve function. Meat and fish provide sufficient amounts. Target: ${targetValue}${unit}.`,
      zinc: `Zinc supports immunity, protein synthesis, and wound healing. Red meat and organs are excellent sources with high bioavailability. Target: ${targetValue}${unit}.`,
      vitamin_c: `Vitamin C requirements drop significantly on low-carb diets (Glucose-Ascorbate Antagonism). Meat provides ~30mg, well above the ~10mg minimum needed in ketosis. Target: ${targetValue}${unit}.`,
      vitamin_a: `Vitamin A (retinol) supports vision, immunity, and skin health. Liver and organ meats are excellent sources. Target: ${targetValue}${unit}. Be cautious of excess intake.`,
      vitamin_k2: `Vitamin K2 (MK-4) supports bone health and blood clotting. Organ meats and fermented foods are good sources. Target: ${targetValue}${unit}.`,
      vitamin_b12: `Vitamin B12 is essential for red blood cell production and nerve function. Meat, fish, and organs provide ample B12. Target: ${targetValue}${unit}.`,
      choline: `Choline supports brain health, memory, and learning. Liver and eggs are excellent sources. Target: ${targetValue}${unit}.`,
      selenium: `Selenium has antioxidant properties and supports thyroid and immune function. Meat and fish provide sufficient amounts. Target: ${targetValue}${unit}.`,
      calcium: `Calcium supports bone health, muscle contraction, and nerve function. Bone-in meat and bone broth are good sources. Target: ${targetValue}${unit}.`,
      phosphorus: `Phosphorus supports bone health, energy production, and DNA synthesis. Meat provides sufficient amounts. Target: ${targetValue}${unit}.`,
      glycine: `Glycine is a collagen building block, supports sleep quality and reduces inflammation. Bone broth and skin-on meat are good sources. Target: ${targetValue}${unit}.`,
      methionine: `Methionine supports protein synthesis and detoxification. Meat provides sufficient amounts. Target: ${targetValue}${unit}.`,
      taurine: `Taurine supports heart health, vision, and has antioxidant properties. Meat and fish provide sufficient amounts. Target: ${targetValue}${unit}.`,
    };
    const explanations = lang === 'ja' ? jaExplanations : enExplanations;
    return explanations[nutrientKey] || null;
  };

  // 栄養素説明を取得
  const nutrientExplanation = useMemo(() => {
    if (!inferredNutrientKey || !userProfile) return null;
    const validKeys: ('protein' | 'fat' | 'iron' | 'magnesium' | 'vitamin_d')[] = [
      'protein',
      'fat',
      'iron',
      'magnesium',
      'vitamin_d',
    ];
    if (validKeys.includes(inferredNutrientKey as (typeof validKeys)[number])) {
      try {
        return getNutrientExplanation(
          inferredNutrientKey as 'protein' | 'fat' | 'iron' | 'magnesium' | 'vitamin_d',
          userProfile
        );
      } catch (error) {
        console.error('Error getting nutrient explanation:', error);
        return null;
      }
    }
    return null;
  }, [inferredNutrientKey, userProfile]);

  // デフォルト説明を取得（nutrientExplanationが取得できない場合）
  const defaultExplanation = useMemo(() => {
    return getDefaultExplanation(inferredNutrientKey, target, unit);
  }, [inferredNutrientKey, target, unit]);

  // 栄養素のロジックを取得
  const nutrientLogic = useMemo(() => {
    if (!inferredNutrientKey) return logic || null;
    const targetKey = inferredNutrientKey === 'vitamin_d' ? 'vitamin_d' : inferredNutrientKey;
    const targetData = CARNIVORE_NUTRIENT_TARGETS[targetKey];
    return targetData?.logic || logic || null;
  }, [inferredNutrientKey, logic]);

  // ツールチップ表示用のハンドラ
  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 親要素のクリックイベントを防ぐ
    // 常にモーダルを表示（影響要因がある場合は影響要因モーダル、ない場合は「なぜこの数値なのか」説明モーダル）
    setShowModal(true);
    // トロフィー進捗トラッキング用コールバック
    if (onInfoClick) {
      onInfoClick();
    }
  };

  // ゲージ全体のクリックハンドラ（ロジック表示用）
  const handleGaugeClick = (e: React.MouseEvent) => {
    // ツールチップのクリックイベントを防ぐ
    const target = e.target as HTMLElement;
    // 💡アイコンをクリックした場合は処理しない
    if (
      target.closest('span[style*="cursor: pointer"]') ||
      target.textContent === '💡' ||
      target.closest('span[data-cursor-element-id]')
    ) {
      return;
    }
    if (
      target.closest('[style*="pointerEvents: none"]') ||
      target.closest('[style*="pointer-events: none"]')
    ) {
      return;
    }
    if (logic) {
      // ロジックをモーダルまたはアラートで表示（将来はArgument Cardに統合）
      (window as unknown as { showToast?: (msg: string) => void }).showToast?.(`${label}の目標値の根拠: ${logic}`);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        position: 'relative',
        cursor: 'pointer',
        userSelect: 'none',
        marginBottom: 0,
      }}
      onClick={handleGaugeClick}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#78716c' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '12px', color: color, fontWeight: '500' }}>
            {hideTarget
              ? // カスタム食品画面用: 100gは食品量なので、目標値として表示しない
              `${displayValue}${unit}`
              : // 通常の表示: 日次目標値との比較
              `${displayValue} / ${displayTarget} ${unit} (${Math.round(basePercent)}%)`}
          </span>
          {/* ヒントアイコン（ツールチップ表示） - 全てのゲージに常に表示 */}
          <span
            style={{ fontSize: '12px', cursor: 'pointer', position: 'relative', zIndex: 10 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleIconClick(e);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseEnter={(e) => {
              if (impactFactors.length === 0 && autoHint) {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltipPosition({ x: rect.left, y: rect.top });
                setShowTooltip(true);
              }
            }}
            onMouseLeave={() => {
              if (impactFactors.length === 0) {
                setShowTooltip(false);
              }
            }}
          >
            💡
            {showTooltip && impactFactors.length === 0 && autoHint && (
              <div
                style={{
                  position: 'fixed',
                  left: `${tooltipPosition.x}px`,
                  top: `${tooltipPosition.y + 20}px`,
                  backgroundColor: '#1f2937',
                  color: 'white',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  zIndex: 10005,
                  pointerEvents: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  maxWidth: '300px',
                  whiteSpace: 'normal',
                }}
              >
                {autoHint}
              </div>
            )}
          </span>
          {showLowIsOk && isLow && (
            <span
              style={{ fontSize: '12px', cursor: 'pointer', position: 'relative' }}
              onClick={handleIconClick}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltipPosition({ x: rect.left, y: rect.top });
                setShowTooltip(true);
              }}
              onMouseLeave={() => setShowTooltip(false)}
            >
              ℹ️
              {showTooltip && (
                <div
                  style={{
                    position: 'fixed',
                    left: `${tooltipPosition.x}px`,
                    top: `${tooltipPosition.y + 20}px`,
                    backgroundColor: '#1f2937',
                    color: 'white',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    whiteSpace: 'nowrap',
                    zIndex: 10005,
                    pointerEvents: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  {getLanguage() === 'ja' ? 'Low is OK (カーニボアロジック)' : 'Low is OK (Carnivore Logic)'}
                </div>
              )}
            </span>
          )}
        </div>
      </div>
      {/* Stacked Gauge with 4-Zone Colors */}
      <div
        style={{
          height: '10px',
          borderRadius: '9999px',
          overflow: 'hidden',
          position: 'relative',
          width: '100%',
          backgroundColor: '#e5e7eb', // 淡色背景に統一
        }}
      >
        {/* Layer 1: Base (currentDailyTotal) */}
        {basePercent > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              width: `${Math.min(basePercent, 200)}%`,
              background: getSingleColor(basePercent, false),
              height: '100%',
              borderRadius: '9999px',
              transition: 'width 0.3s ease',
              zIndex: 2,
            }}
          />
        )}

        {/* Layer 2: Preview (previewAmount) */}
        {previewPercent > 0 && (
          <div
            style={{
              position: 'absolute',
              left: `${Math.min(basePercent, 200)}%`,
              width: `${Math.min(previewPercent, Math.max(0, 200 - Math.min(basePercent, 200)))}%`,
              background: getSingleColor(totalPercent, false),
              height: '100%',
              borderRadius: '9999px',
              transition: 'width 0.3s ease',
              zIndex: 2,
              borderLeft: basePercent > 0 ? '1px solid rgba(255,255,255,0.3)' : 'none',
              opacity: 0.8,
            }}
          />
        )}
      </div>

      {/* 影響要因モーダル / なぜこの数値なのか説明モーダル */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10010,
            padding: '16px',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              borderRadius: '12px',
              padding: '16px',
              maxWidth: '85%',
              maxHeight: '70vh',
              overflow: 'auto',
              boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 閉じるボタン */}
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#78716c',
                padding: '4px 8px',
              }}
            >
              ×
            </button>

            {/* タイトル */}
            <h2
              style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '16px',
                color: '#1f2937',
              }}
            >
              {impactFactors.length > 0
                ? `${label}の目標値に影響する要因`
                : `【${label}: ${displayTarget}${unit}】なぜこの数値なのか`}
            </h2>

            {/* 簡易/詳細/一般論切り替えタブ */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <button
                onClick={() => setExplanationMode('simple')}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  background: explanationMode === 'simple' ? '#1f2937' : 'transparent',
                  color: explanationMode === 'simple' ? 'white' : '#78716c',
                  cursor: 'pointer',
                  borderRadius: '8px 8px 0 0',
                  fontSize: '14px',
                  fontWeight: explanationMode === 'simple' ? '600' : '400',
                }}
              >
                簡易
              </button>
              <button
                onClick={() => setExplanationMode('detailed')}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  background: explanationMode === 'detailed' ? '#1f2937' : 'transparent',
                  color: explanationMode === 'detailed' ? 'white' : '#78716c',
                  cursor: 'pointer',
                  borderRadius: '8px 8px 0 0',
                  fontSize: '14px',
                  fontWeight: explanationMode === 'detailed' ? '600' : '400',
                }}
              >
                詳細
              </button>
              {nutrientLogic && (
                <button
                  onClick={() => setExplanationMode('general')}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    background: explanationMode === 'general' ? '#1f2937' : 'transparent',
                    color: explanationMode === 'general' ? 'white' : '#78716c',
                    cursor: 'pointer',
                    borderRadius: '8px 8px 0 0',
                    fontSize: '14px',
                    fontWeight: explanationMode === 'general' ? '600' : '400',
                  }}
                >
                  一般論
                </button>
              )}
            </div>

            {/* 簡易表示：影響要因がある場合のみ表示 */}
            {impactFactors.length > 0 && explanationMode === 'simple' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {applySortOrder(impactFactors, 'impact')
                  .slice(0, 3)
                  .map((factor, index) => (
                    <div
                      key={factor.id}
                      style={{
                        padding: '12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#1f2937',
                          marginBottom: '4px',
                        }}
                      >
                        {index + 1}. {factor.factor}
                      </div>
                      <div style={{ fontSize: '13px', color: '#78716c' }}>{factor.reason}</div>
                    </div>
                  ))}
              </div>
            ) : (
              /* なぜこの数値なのか説明 */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {explanationMode === 'simple' ? (
                  /* 簡易表示 */
                  nutrientExplanation ? (
                    <div
                      style={{
                        padding: '12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      <p style={{ fontSize: '14px', color: '#1f2937', lineHeight: '1.6' }}>
                        {nutrientExplanation.humanExplanation}
                      </p>
                    </div>
                  ) : nutrientLogic ? (
                    <div
                      style={{
                        padding: '12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      <p style={{ fontSize: '14px', color: '#1f2937', lineHeight: '1.6' }}>
                        {nutrientLogic}
                      </p>
                    </div>
                  ) : defaultExplanation ? (
                    <div
                      style={{
                        padding: '12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      <p style={{ fontSize: '14px', color: '#1f2937', lineHeight: '1.6' }}>
                        {defaultExplanation}
                      </p>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      <p style={{ fontSize: '14px', color: '#78716c' }}>
                        標準的な目標値（{displayTarget}
                        {unit}）が適用されています。
                      </p>
                    </div>
                  )
                ) : explanationMode === 'general' ? (
                  /* 一般論表示（カーニボアロジック） */
                  nutrientLogic ? (
                    <div
                      style={{
                        padding: '16px',
                        backgroundColor: '#f0f9ff',
                        borderRadius: '8px',
                        border: '1px solid #f43f5e',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '15px',
                          color: '#1f2937',
                          lineHeight: '1.8',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {nutrientLogic}
                      </p>
                    </div>
                  ) : null
                ) : (
                  /* 詳細表示（影響要因 + 計算式） */
                  <>
                    {/* 影響要因がある場合は先に表示 */}
                    {impactFactors.length > 0 && (
                      <>
                        {/* 影響要因リスト（影響度順のみ） */}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            marginBottom: '24px',
                          }}
                        >
                          {applySortOrder(impactFactors, 'impact').map((factor, index) => (
                            <div
                              key={factor.id}
                              style={{
                                padding: '12px',
                                backgroundColor: '#f9fafb',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                              }}
                            >
                              <div
                                style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}
                              >
                                {/* ナンバリング */}
                                <div
                                  style={{
                                    minWidth: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    backgroundColor: '#1f2937',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    flexShrink: 0,
                                  }}
                                >
                                  {index + 1}
                                </div>

                                {/* 内容 */}
                                <div style={{ flex: 1 }}>
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      marginBottom: '4px',
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#1f2937',
                                      }}
                                    >
                                      {factor.factor}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: '12px',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: '#e5e7eb',
                                        color: '#78716c',
                                      }}
                                    >
                                      {getCategoryName(factor.category)}
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      fontSize: '13px',
                                      color: '#78716c',
                                      marginBottom: '4px',
                                    }}
                                  >
                                    {factor.reason}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: '14px',
                                      fontWeight: '600',
                                      color:
                                        factor.impact > 0
                                          ? '#f43f5e'
                                          : factor.impact < 0
                                            ? '#ef4444'
                                            : '#78716c',
                                    }}
                                  >
                                    {factor.impactText}の変化
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* 計算式を表示 */}
                    {inferredNutrientKey &&
                      userProfile &&
                      (() => {
                        // 計算式を生成
                        const getCalculationFormula = (
                          nutrient: string,
                          profile: typeof userProfile,
                          currentTarget: number,
                          labelText: string
                        ): string => {
                          const labelLower = labelText.toLowerCase();
                          if (nutrient === 'protein') {
                            const weight = profile?.weight || 70;
                            const base = weight * 1.6;
                            const _isJaP = getLanguage() === 'ja';
                            let formula = _isJaP
                              ? `【基本値】\n体重(${weight}kg) × 1.6g/kg = ${base.toFixed(1)}g/日`
                              : `Base:\nWeight(${weight}kg) × 1.6g/kg = ${base.toFixed(1)}g/day`;
                            let current = base;
                            const adjustments: Array<{
                              name: string;
                              target: number;
                              applied: boolean;
                            }> = [];

                            // 妊娠中・授乳中の調整（最優先）
                            if (profile?.isPregnant) {
                              adjustments.push({ name: getLanguage() === 'ja' ? '妊娠中' : 'Pregnant', target: 120, applied: false });
                            }
                            if (profile?.isBreastfeeding) {
                              adjustments.push({ name: getLanguage() === 'ja' ? '授乳中' : 'Breastfeeding', target: 130, applied: false });
                            }

                            // 運動強度・頻度による調整
                            if (
                              profile?.exerciseIntensity === 'intense' ||
                              profile?.exerciseFrequency === '5+'
                            ) {
                              adjustments.push({ name: getLanguage() === 'ja' ? '激しい運動' : 'Intense exercise', target: 130, applied: false });
                            } else if (
                              profile?.exerciseIntensity === 'moderate' ||
                              profile?.exerciseFrequency === '3-4'
                            ) {
                              adjustments.push({
                                name: getLanguage() === 'ja' ? '中程度の運動' : 'Moderate exercise',
                                target: 115,
                                applied: false,
                              });
                            }

                            // 活動量による調整
                            if (profile?.activityLevel === 'active') {
                              adjustments.push({ name: getLanguage() === 'ja' ? '活動的' : 'Active', target: 120, applied: false });
                            } else if (profile?.activityLevel === 'moderate') {
                              adjustments.push({
                                name: getLanguage() === 'ja' ? '中程度の活動量' : 'Moderate activity',
                                target: 110,
                                applied: false,
                              });
                            }

                            // 年齢による調整
                            if (profile?.age && profile.age > 50) {
                              adjustments.push({ name: getLanguage() === 'ja' ? '50歳以上' : 'Age 50+', target: 110, applied: false });
                            }

                            // 消化器系の問題による調整
                            if (profile?.digestiveIssues) {
                              adjustments.push({
                                name: getLanguage() === 'ja' ? '消化器系の問題' : 'Digestive issues',
                                target: 110,
                                applied: false,
                              });
                            }

                            // 調整をtarget値の高い順にソート
                            adjustments.sort((a, b) => b.target - a.target);

                            // 各調整を適用して表示
                            const isJa = getLanguage() === 'ja';
                            if (adjustments.length > 0) {
                              formula += isJa ? `\n\n【プロファイル設定による調整】` : `\n\nProfile Adjustments:`;
                              for (const adj of adjustments) {
                                const prevCurrent = current;
                                const newCurrent = Math.max(current, adj.target);
                                const actualIncrement = newCurrent - prevCurrent;
                                if (actualIncrement > 0) {
                                  current = newCurrent;
                                  formula += isJa
                                    ? `\n${adj.name}: 最低${adj.target}g（+${actualIncrement.toFixed(1)}g） → ${current.toFixed(1)}g`
                                    : `\n${adj.name}: min ${adj.target}g (+${actualIncrement.toFixed(1)}g) → ${current.toFixed(1)}g`;
                                }
                              }
                            } else {
                              formula += isJa ? `\n\n（プロファイル設定による追加調整はありません）` : `\n\n(No additional profile adjustments)`;
                            }

                            // カスタム目標値の手動設定（最後に適用：全ての調整を上書き）
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += isJa ? `\n\n【手動設定による上書き】` : `\n\nManual Override:`;
                              formula += isJa
                                ? `\nカスタム目標値: ${manualValue}g（自動計算を上書き）`
                                : `\nCustom target: ${manualValue}g (overrides auto-calculation)`;
                              current = manualValue;
                            } else {
                              formula += isJa ? `\n\n【最終目標値】` : `\n\nFinal Target:`;
                              formula += `\n${current.toFixed(1)}g/${isJa ? '日' : 'day'}`;
                            }

                            // 実際の目標値を使用（計算式と表示を一致させる）
                            // getCarnivoreTargetsで計算された実際の目標値を使用
                            if (Math.abs(current - currentTarget) > 0.1) {
                              // 実際の目標値を使用して計算式を修正
                              current = currentTarget;
                              // 計算式の最終目標値を実際の目標値に更新
                              formula = formula.replace(
                                /(?:【最終目標値】|Final Target:)\n.*$/,
                                `${isJa ? '【最終目標値】' : 'Final Target:'}\n${currentTarget.toFixed(1)}g/${isJa ? '日' : 'day'}`
                              );
                            }

                            return formula;
                          } else if (nutrient === 'fat') {
                            const _isJaF = getLanguage() === 'ja';
                            let formula = _isJaF ? `【基本値】\n150g/日` : `Base:\n150g/day`;
                            let current = 150;
                            const adjustments: Array<{
                              name: string;
                              target: number;
                              applied: boolean;
                            }> = [];

                            // 運動強度・頻度による調整
                            if (
                              profile?.exerciseIntensity === 'intense' ||
                              profile?.exerciseFrequency === '5+'
                            ) {
                              adjustments.push({ name: getLanguage() === 'ja' ? '激しい運動' : 'Intense exercise', target: 190, applied: false });
                            } else if (
                              profile?.exerciseIntensity === 'moderate' ||
                              profile?.exerciseFrequency === '3-4'
                            ) {
                              adjustments.push({
                                name: getLanguage() === 'ja' ? '中程度の運動' : 'Moderate exercise',
                                target: 170,
                                applied: false,
                              });
                            }

                            // 活動量による調整
                            if (profile?.activityLevel === 'active') {
                              adjustments.push({ name: getLanguage() === 'ja' ? '活動的' : 'Active', target: 180, applied: false });
                            } else if (profile?.activityLevel === 'moderate') {
                              adjustments.push({
                                name: getLanguage() === 'ja' ? '中程度の活動量' : 'Moderate activity',
                                target: 160,
                                applied: false,
                              });
                            }

                            // 移行期間中の調整（1.5倍）
                            const isAdaptationPhase =
                              profile?.forceAdaptationMode === true
                                ? true
                                : profile?.forceAdaptationMode === false
                                  ? false
                                  : profile?.daysOnCarnivore !== undefined
                                    ? profile.daysOnCarnivore < 30
                                    : profile?.carnivoreStartDate
                                      ? Math.floor(
                                        (new Date().getTime() -
                                          new Date(profile.carnivoreStartDate).getTime()) /
                                        (1000 * 60 * 60 * 24)
                                      ) < 30
                                      : false;

                            // 調整をtarget値の高い順にソート
                            adjustments.sort((a, b) => b.target - a.target);

                            // 各調整を適用して表示
                            if (adjustments.length > 0) {
                              formula += _isJaF ? `\n\n【プロファイル設定による調整】` : `\n\nProfile Adjustments:`;
                              for (const adj of adjustments) {
                                const prevCurrent = current;
                                const newCurrent = Math.max(current, adj.target);
                                const actualIncrement = newCurrent - prevCurrent;
                                if (actualIncrement > 0) {
                                  current = newCurrent;
                                  formula += _isJaF
                                    ? `\n${adj.name}: 最低${adj.target}g（+${actualIncrement.toFixed(1)}g） → ${current.toFixed(1)}g`
                                    : `\n${adj.name}: min ${adj.target}g (+${actualIncrement.toFixed(1)}g) → ${current.toFixed(1)}g`;
                                }
                              }
                            }

                            // 移行期間中の調整（1.5倍、最後に適用）
                            if (isAdaptationPhase) {
                              const prevCurrent = current;
                              current = Math.max(current, prevCurrent * 1.5);
                              const actualIncrement = current - prevCurrent;
                              if (actualIncrement > 0) {
                                formula += _isJaF
                                  ? `\n移行期間中: ${prevCurrent.toFixed(1)}g × 1.5倍（+${actualIncrement.toFixed(1)}g） → ${current.toFixed(1)}g`
                                  : `\nAdaptation phase: ${prevCurrent.toFixed(1)}g × 1.5x (+${actualIncrement.toFixed(1)}g) → ${current.toFixed(1)}g`;
                              }
                            }

                            // タンパク質比調整（1.2倍、最後に適用）
                            try {
                              const calculatedTargets = getCarnivoreTargets(
                                profile?.gender,
                                profile?.age,
                                profile?.activityLevel,
                                profile?.isPregnant,
                                profile?.isBreastfeeding,
                                profile?.isPostMenopause,
                                profile?.stressLevel,
                                profile?.sleepHours,
                                profile?.exerciseIntensity,
                                profile?.exerciseFrequency,
                                profile?.thyroidFunction,
                                profile?.sunExposureFrequency,
                                profile?.digestiveIssues,
                                profile?.inflammationLevel,
                                profile?.mentalHealthStatus,
                                profile?.supplementMagnesium,
                                profile?.supplementVitaminD,
                                profile?.supplementIodine,
                                profile?.alcoholFrequency,
                                profile?.caffeineIntake,
                                profile?.bodyComposition,
                                profile?.weight,
                                profile?.metabolicStressIndicators,
                                profile?.customNutrientTargets
                              );
                              const actualProteinTarget = calculatedTargets.protein;
                              const fatFromProtein = actualProteinTarget * 1.2;
                              if (fatFromProtein > current) {
                                const prevCurrent = current;
                                current = fatFromProtein;
                                const actualIncrement = current - prevCurrent;
                                formula += _isJaF
                                  ? `\nタンパク質比: タンパク質目標値(${actualProteinTarget.toFixed(1)}g) × 1.2倍（+${actualIncrement.toFixed(1)}g） → ${current.toFixed(1)}g`
                                  : `\nProtein ratio: protein target(${actualProteinTarget.toFixed(1)}g) × 1.2x (+${actualIncrement.toFixed(1)}g) → ${current.toFixed(1)}g`;
                              }
                            } catch (error) {
                              console.error(
                                'Error calculating protein target for fat formula:',
                                error
                              );
                            }

                            if (adjustments.length === 0 && !isAdaptationPhase) {
                              formula += _isJaF ? `\n\n（プロファイル設定による追加調整はありません）` : `\n\n(No additional profile adjustments)`;
                            }

                            // カスタム目標値の手動設定（最後に適用：全ての調整を上書き）
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += _isJaF ? `\n\n【手動設定による上書き】` : `\n\nManual Override:`;
                              formula += _isJaF
                                ? `\nカスタム目標値: ${manualValue}g（自動計算を上書き）`
                                : `\nCustom target: ${manualValue}g (overrides auto-calculation)`;
                            } else {
                              formula += _isJaF ? `\n\n【最終目標値】` : `\n\nFinal Target:`;
                              formula += `\n${currentTarget.toFixed(1)}g/${_isJaF ? '日' : 'day'}`;
                            }
                            return formula;
                          } else if (nutrient === 'magnesium') {
                            const _isJaM = getLanguage() === 'ja';
                            let formula = _isJaM ? '【基本値】\n600mg/日' : 'Base:\n600mg/day';
                            let current = 600;
                            const adjustments: Array<{
                              name: string;
                              target: number;
                              increment: number;
                              applied: boolean;
                            }> = [];

                            // 移行期間中の調整
                            const isAdaptationPhase =
                              profile?.forceAdaptationMode === true
                                ? true
                                : profile?.forceAdaptationMode === false
                                  ? false
                                  : profile?.daysOnCarnivore !== undefined
                                    ? profile.daysOnCarnivore < 30
                                    : profile?.carnivoreStartDate
                                      ? Math.floor(
                                        (new Date().getTime() -
                                          new Date(profile.carnivoreStartDate).getTime()) /
                                        (1000 * 60 * 60 * 24)
                                      ) < 30
                                      : false;
                            if (isAdaptationPhase) {
                              adjustments.push({
                                name: getLanguage() === 'ja' ? '移行期間中' : 'Adaptation phase',
                                target: 800,
                                increment: 200,
                                applied: false,
                              });
                            }

                            // ストレスレベルによる調整
                            if (profile?.stressLevel === 'high') {
                              adjustments.push({
                                name: getLanguage() === 'ja' ? '高ストレス' : 'High stress',
                                target: 700,
                                increment: 100,
                                applied: false,
                              });
                            }

                            // 活動量による調整
                            if (profile?.activityLevel === 'active') {
                              adjustments.push({
                                name: getLanguage() === 'ja' ? '活動的' : 'Active',
                                target: 700,
                                increment: 100,
                                applied: false,
                              });
                            }

                            // 睡眠時間による調整
                            if (profile?.sleepHours && profile.sleepHours < 7) {
                              adjustments.push({
                                name: getLanguage() === 'ja' ? '睡眠不足（7時間未満）' : 'Sleep deficit (<7h)',
                                target: 650,
                                increment: 50,
                                applied: false,
                              });
                            }

                            // 運動強度・頻度による調整
                            if (
                              profile?.exerciseIntensity === 'intense' ||
                              profile?.exerciseFrequency === '5+'
                            ) {
                              adjustments.push({
                                name: getLanguage() === 'ja' ? '激しい運動' : 'Intense exercise',
                                target: 750,
                                increment: 150,
                                applied: false,
                              });
                            } else if (
                              profile?.exerciseIntensity === 'moderate' ||
                              profile?.exerciseFrequency === '3-4'
                            ) {
                              adjustments.push({
                                name: getLanguage() === 'ja' ? '中程度の運動' : 'Moderate exercise',
                                target: 650,
                                increment: 50,
                                applied: false,
                              });
                            }

                            // 妊娠中・授乳中の調整
                            if (profile?.isPregnant) {
                              adjustments.push({
                                name: getLanguage() === 'ja' ? '妊娠中' : 'Pregnant',
                                target: 700,
                                increment: 100,
                                applied: false,
                              });
                            }
                            if (profile?.isBreastfeeding) {
                              adjustments.push({
                                name: getLanguage() === 'ja' ? '授乳中' : 'Breastfeeding',
                                target: 700,
                                increment: 100,
                                applied: false,
                              });
                            }

                            // 炎症レベルによる調整
                            if (profile?.inflammationLevel === 'high') {
                              adjustments.push({
                                name: getLanguage() === 'ja' ? '高炎症' : 'High inflammation',
                                target: 650,
                                increment: 50,
                                applied: false,
                              });
                            }

                            // メンタルヘルス状態による調整
                            if (profile?.mentalHealthStatus === 'poor') {
                              adjustments.push({
                                name: getLanguage() === 'ja' ? 'メンタルヘルス不良' : 'Poor mental health',
                                target: 700,
                                increment: 100,
                                applied: false,
                              });
                            }

                            // アルコール摂取頻度による調整
                            if (
                              profile?.alcoholFrequency === 'daily' ||
                              profile?.alcoholFrequency === 'weekly'
                            ) {
                              adjustments.push({
                                name: getLanguage() === 'ja' ? 'アルコール摂取' : 'Alcohol intake',
                                target: 700,
                                increment: 100,
                                applied: false,
                              });
                            }

                            // カフェイン摂取量による調整
                            if (profile?.caffeineIntake === 'high') {
                              if (profile?.stressLevel === 'high') {
                                adjustments.push({
                                  name: getLanguage() === 'ja' ? '高カフェイン+高ストレス' : 'High caffeine + high stress',
                                  target: 750,
                                  increment: 150,
                                  applied: false,
                                });
                              } else {
                                adjustments.push({
                                  name: getLanguage() === 'ja' ? '高カフェイン' : 'High caffeine',
                                  target: 700,
                                  increment: 100,
                                  applied: false,
                                });
                              }
                            }

                            // 代謝ストレス指標による調整（累積的な増分）
                            let metabolicIncrement = 0;
                            if (
                              profile?.metabolicStressIndicators &&
                              profile.metabolicStressIndicators.includes('night_wake')
                            ) {
                              metabolicIncrement = 200;
                            }

                            // 実際の計算ロジックに従って適用（getCarnivoreTargetsの順序を再現）
                            if (adjustments.length > 0 || metabolicIncrement > 0) {
                              formula += _isJaM ? `\n\n【プロファイル設定による調整】` : `\n\nProfile Adjustments:`;

                              // 各調整を順番に適用し、実際に値が変わる場合のみ表示
                              // 調整をtarget値の高い順にソートして適用
                              adjustments.sort((a, b) => b.target - a.target);

                              for (const adj of adjustments) {
                                const prevCurrent = current;
                                const newCurrent = Math.max(current, adj.target);
                                const actualIncrement = newCurrent - prevCurrent;
                                if (actualIncrement > 0) {
                                  current = newCurrent;
                                  formula += _isJaM
                                    ? `\n${adj.name}: 最低${adj.target}mg（+${actualIncrement}mg） → ${current}mg`
                                    : `\n${adj.name}: min ${adj.target}mg (+${actualIncrement}mg) → ${current}mg`;
                                }
                              }

                              // 代謝ストレス指標による累積的な増分（最後に適用）
                              if (metabolicIncrement > 0) {
                                current = current + metabolicIncrement;
                                formula += _isJaM
                                  ? `\n代謝ストレス（夜間低血糖疑い）: +${metabolicIncrement}mg（累積増分） → ${current}mg`
                                  : `\nMetabolic stress (suspected nocturnal hypoglycemia): +${metabolicIncrement}mg (cumulative) → ${current}mg`;
                              }
                            } else {
                              formula += _isJaM ? `\n\n（プロファイル設定による追加調整はありません）` : `\n\n(No additional profile adjustments)`;
                            }

                            // サプリメント摂取による調整
                            if (profile?.supplementMagnesium) {
                              current = Math.max(0, current - 200);
                              formula += _isJaM ? `\n\n【サプリメント調整】` : `\n\nSupplement Adjustment:`;
                              formula += _isJaM
                                ? `\nマグネシウムサプリメント摂取中: -200mg（サプリメント分を考慮） → ${current}mg`
                                : `\nMagnesium supplement: -200mg (supplement offset) → ${current}mg`;
                            }

                            // カスタム目標値の手動設定（最後に適用：全ての調整を上書き）
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += _isJaM ? `\n\n【手動設定による上書き】` : `\n\nManual Override:`;
                              formula += _isJaM
                                ? `\nカスタム目標値: ${manualValue}mg（自動計算を上書き）`
                                : `\nCustom target: ${manualValue}mg (overrides auto-calculation)`;
                              current = manualValue;
                            } else {
                              formula += _isJaM ? `\n\n【最終目標値】` : `\n\nFinal Target:`;
                              formula += `\n${currentTarget.toFixed(1)}mg/${_isJaM ? '日' : 'day'}`;
                            }
                            return formula;
                          } else if (nutrient === 'iron') {
                            const _isJaI = getLanguage() === 'ja';
                            let formula = _isJaI ? `【基本値】\n8mg/日（男性）` : `Base:\n8mg/day (male)`;
                            let current = 8;

                            // 性別による調整
                            if (profile?.gender === 'female') {
                              if (profile?.isPostMenopause) {
                                formula += _isJaI ? `\n\n【性別調整】` : `\n\nGender Adjustment:`;
                                formula += _isJaI
                                  ? `\n女性（閉経後）: 8mg（月経がないため男性と同値）`
                                  : `\nFemale (post-menopause): 8mg (same as male, no menstruation)`;
                              } else {
                                const prevCurrent = current;
                                current = 18;
                                formula += _isJaI ? `\n\n【性別調整】` : `\n\nGender Adjustment:`;
                                formula += _isJaI
                                  ? `\n女性（月経あり）: 18mg（+${(current - prevCurrent).toFixed(1)}mg） → ${current}mg`
                                  : `\nFemale (menstruating): 18mg (+${(current - prevCurrent).toFixed(1)}mg) → ${current}mg`;
                              }
                            }

                            // 妊娠中・授乳中の調整
                            const _profileAdj = _isJaI ? '【プロファイル設定による調整】' : 'Profile Adjustments:';
                            if (profile?.isPregnant) {
                              const prevCurrent = current;
                              current = Math.max(current, 27);
                              const actualIncrement = current - prevCurrent;
                              if (actualIncrement > 0) {
                                if (!formula.includes(_profileAdj)) {
                                  formula += `\n\n${_profileAdj}`;
                                }
                                formula += _isJaI
                                  ? `\n妊娠中: 最低27mg（+${actualIncrement.toFixed(1)}mg） → ${current}mg`
                                  : `\nPregnant: min 27mg (+${actualIncrement.toFixed(1)}mg) → ${current}mg`;
                              }
                            }
                            if (profile?.isBreastfeeding) {
                              const prevCurrent = current;
                              current = Math.max(current, 9);
                              const actualIncrement = current - prevCurrent;
                              if (actualIncrement > 0 || current < prevCurrent) {
                                if (!formula.includes(_profileAdj)) {
                                  formula += `\n\n${_profileAdj}`;
                                }
                                if (current < prevCurrent) {
                                  formula += _isJaI
                                    ? `\n授乳中: 9mg（月経がないため） → ${current}mg`
                                    : `\nBreastfeeding: 9mg (no menstruation) → ${current}mg`;
                                } else {
                                  formula += _isJaI
                                    ? `\n授乳中: 最低9mg（+${actualIncrement.toFixed(1)}mg） → ${current}mg`
                                    : `\nBreastfeeding: min 9mg (+${actualIncrement.toFixed(1)}mg) → ${current}mg`;
                                }
                              }
                            }

                            if (
                              !formula.includes(_profileAdj) &&
                              !profile?.isPregnant &&
                              !profile?.isBreastfeeding
                            ) {
                              formula += _isJaI ? `\n\n（プロファイル設定による追加調整はありません）` : `\n\n(No additional profile adjustments)`;
                            }

                            // カスタム目標値の手動設定（最後に適用：全ての調整を上書き）
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += _isJaI ? `\n\n【手動設定による上書き】` : `\n\nManual Override:`;
                              formula += _isJaI
                                ? `\nカスタム目標値: ${manualValue}mg（自動計算を上書き）`
                                : `\nCustom target: ${manualValue}mg (overrides auto-calculation)`;
                            } else {
                              formula += _isJaI ? `\n\n【最終目標値】` : `\n\nFinal Target:`;
                              formula += `\n${currentTarget.toFixed(1)}mg/${_isJaI ? '日' : 'day'}`;
                            }
                            return formula;
                          } else if (nutrient === 'vitamin_d') {
                            const _isJaD = getLanguage() === 'ja';
                            let formula = _isJaD ? `【基本値】\n2000IU/日` : `Base:\n2000IU/day`;
                            let current = 2000;
                            const adjustments: Array<{
                              name: string;
                              target: number;
                              applied: boolean;
                            }> = [];

                            // 日光暴露頻度による調整（最優先：最も高い値）
                            if (
                              profile?.sunExposureFrequency === 'none' ||
                              profile?.sunExposureFrequency === 'rare'
                            ) {
                              if (!profile?.supplementVitaminD) {
                                adjustments.push({
                                  name: getLanguage() === 'ja' ? '日光暴露なし（サプリメントなし）' : 'No sun exposure (no supplement)',
                                  target: 4000,
                                  applied: false,
                                });
                              }
                            }

                            // 年齢による調整
                            if (profile?.age && profile.age > 50) {
                              adjustments.push({ name: getLanguage() === 'ja' ? '50歳以上' : 'Age 50+', target: 3000, applied: false });
                            }

                            // メンタルヘルス状態による調整
                            if (profile?.mentalHealthStatus === 'poor') {
                              if (!profile?.supplementVitaminD) {
                                adjustments.push({
                                  name: getLanguage() === 'ja' ? 'メンタルヘルス不良（サプリメントなし）' : 'Poor mental health (no supplement)',
                                  target: 3000,
                                  applied: false,
                                });
                              }
                            }

                            // 調整をtarget値の高い順にソート
                            adjustments.sort((a, b) => b.target - a.target);

                            // 各調整を適用して表示
                            if (adjustments.length > 0) {
                              formula += _isJaD ? `\n\n【プロファイル設定による調整】` : `\n\nProfile Adjustments:`;
                              for (const adj of adjustments) {
                                const prevCurrent = current;
                                const newCurrent = Math.max(current, adj.target);
                                const actualIncrement = newCurrent - prevCurrent;
                                if (actualIncrement > 0) {
                                  current = newCurrent;
                                  formula += _isJaD
                                    ? `\n${adj.name}: 最低${adj.target}IU（+${actualIncrement.toFixed(0)}IU） → ${current.toFixed(0)}IU`
                                    : `\n${adj.name}: min ${adj.target}IU (+${actualIncrement.toFixed(0)}IU) → ${current.toFixed(0)}IU`;
                                }
                              }
                            } else {
                              formula += _isJaD ? `\n\n（プロファイル設定による追加調整はありません）` : `\n\n(No additional profile adjustments)`;
                            }

                            // サプリメント摂取による調整
                            if (profile?.supplementVitaminD) {
                              current = Math.max(0, current - 1000);
                              formula += _isJaD ? `\n\n【サプリメント調整】` : `\n\nSupplement Adjustment:`;
                              formula += _isJaD
                                ? `\nビタミンDサプリメント摂取中: -1000IU（サプリメント分を考慮） → ${current.toFixed(0)}IU`
                                : `\nVitamin D supplement: -1000IU (supplement offset) → ${current.toFixed(0)}IU`;
                            }

                            // カスタム目標値の手動設定（最後に適用：全ての調整を上書き）
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += _isJaD ? `\n\n【手動設定による上書き】` : `\n\nManual Override:`;
                              formula += _isJaD
                                ? `\nカスタム目標値: ${manualValue}IU（自動計算を上書き）`
                                : `\nCustom target: ${manualValue}IU (overrides auto-calculation)`;
                            } else {
                              formula += _isJaD ? `\n\n【最終目標値】` : `\n\nFinal Target:`;
                              formula += `\n${currentTarget.toFixed(0)}IU/${_isJaD ? '日' : 'day'}`;
                            }
                            return formula;
                          } else if (nutrient === 'sodium') {
                            const _isJaN = getLanguage() === 'ja';
                            let formula = _isJaN ? `【基本値】\n5000mg/日` : `Base:\n5000mg/day`;
                            let current = 5000;
                            let hasAdjustment = false;

                            // 移行期間中の調整
                            const isAdaptationPhase =
                              profile?.forceAdaptationMode === true
                                ? true
                                : profile?.forceAdaptationMode === false
                                  ? false
                                  : profile?.daysOnCarnivore !== undefined
                                    ? profile.daysOnCarnivore < 30
                                    : profile?.carnivoreStartDate
                                      ? Math.floor(
                                        (new Date().getTime() -
                                          new Date(profile.carnivoreStartDate).getTime()) /
                                        (1000 * 60 * 60 * 24)
                                      ) < 30
                                      : false;

                            if (isAdaptationPhase) {
                              const prevCurrent = current;
                              current = Math.max(current, 7000);
                              const actualIncrement = current - prevCurrent;
                              if (actualIncrement > 0) {
                                formula += _isJaN ? `\n\n【プロファイル設定による調整】` : `\n\nProfile Adjustments:`;
                                formula += _isJaN
                                  ? `\n移行期間中: 最低7000mg（+${actualIncrement.toFixed(0)}mg） → ${current.toFixed(0)}mg`
                                  : `\nAdaptation phase: min 7000mg (+${actualIncrement.toFixed(0)}mg) → ${current.toFixed(0)}mg`;
                                hasAdjustment = true;
                              }
                            }

                            // 活動量による調整（移行期間外のみ、累積増分）
                            if (profile?.activityLevel === 'active' && !isAdaptationPhase) {
                              const prevCurrent = current;
                              current = Math.max(current, current + 1000);
                              const actualIncrement = current - prevCurrent;
                              if (actualIncrement > 0) {
                                if (!hasAdjustment) {
                                  formula += _isJaN ? `\n\n【プロファイル設定による調整】` : `\n\nProfile Adjustments:`;
                                  hasAdjustment = true;
                                }
                                formula += _isJaN
                                  ? `\n活動的: +1000mg（汗をかくため、累積増分） → ${current.toFixed(0)}mg`
                                  : `\nActive: +1000mg (sweating, cumulative) → ${current.toFixed(0)}mg`;
                              }
                            }

                            // 代謝ストレス指標による調整（累積増分）
                            if (
                              profile?.metabolicStressIndicators &&
                              profile.metabolicStressIndicators.includes('morning_fatigue')
                            ) {
                              const prevCurrent = current;
                              current = Math.max(current, current + 1500);
                              const actualIncrement = current - prevCurrent;
                              if (actualIncrement > 0) {
                                if (!hasAdjustment) {
                                  formula += _isJaN ? `\n\n【プロファイル設定による調整】` : `\n\nProfile Adjustments:`;
                                  hasAdjustment = true;
                                }
                                formula += _isJaN
                                  ? `\n代謝ストレス（朝起きるのが辛い/疲労感）: +1500mg（副腎疲労疑い、累積増分） → ${current.toFixed(0)}mg`
                                  : `\nMetabolic stress (morning fatigue): +1500mg (suspected adrenal fatigue, cumulative) → ${current.toFixed(0)}mg`;
                              }
                            }
                            if (
                              profile?.metabolicStressIndicators &&
                              profile.metabolicStressIndicators.includes('coffee_high')
                            ) {
                              const prevCurrent = current;
                              current = Math.max(current, current + 500);
                              const actualIncrement = current - prevCurrent;
                              if (actualIncrement > 0) {
                                if (!hasAdjustment) {
                                  formula += _isJaN ? `\n\n【プロファイル設定による調整】` : `\n\nProfile Adjustments:`;
                                  hasAdjustment = true;
                                }
                                formula += _isJaN
                                  ? `\n代謝ストレス（コーヒー毎日2杯以上）: +500mg（ナトリウム排出増、累積増分） → ${current.toFixed(0)}mg`
                                  : `\nMetabolic stress (2+ coffees/day): +500mg (increased sodium excretion, cumulative) → ${current.toFixed(0)}mg`;
                              }
                            }

                            if (!hasAdjustment) {
                              formula += _isJaN ? `\n\n（プロファイル設定による追加調整はありません）` : `\n\n(No additional profile adjustments)`;
                            }

                            // カスタム目標値の手動設定（最後に適用：全ての調整を上書き）
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += _isJaN ? `\n\n【手動設定による上書き】` : `\n\nManual Override:`;
                              formula += _isJaN
                                ? `\nカスタム目標値: ${manualValue}mg（自動計算を上書き）`
                                : `\nCustom target: ${manualValue}mg (overrides auto-calculation)`;
                            } else {
                              formula += _isJaN ? `\n\n【最終目標値】` : `\n\nFinal Target:`;
                              formula += `\n${currentTarget.toFixed(0)}mg/${_isJaN ? '日' : 'day'}`;
                            }
                            return formula;
                          } else if (nutrient === 'potassium') {
                            const _isJaK = getLanguage() === 'ja';
                            let formula = _isJaK ? `【基本値】\n4500mg/日（カーニボアロジック）` : `Base:\n4500mg/day (Carnivore Logic)`;
                            let current = 4500;
                            let hasAdjustment = false;

                            // 移行期間中の調整
                            const isAdaptationPhase =
                              profile?.forceAdaptationMode === true
                                ? true
                                : profile?.forceAdaptationMode === false
                                  ? false
                                  : profile?.daysOnCarnivore !== undefined
                                    ? profile.daysOnCarnivore < 30
                                    : profile?.carnivoreStartDate
                                      ? Math.floor(
                                        (new Date().getTime() -
                                          new Date(profile.carnivoreStartDate).getTime()) /
                                        (1000 * 60 * 60 * 24)
                                      ) < 30
                                      : false;
                            if (isAdaptationPhase) {
                              const prevCurrent = current;
                              current = Math.max(current, 5000);
                              const actualIncrement = current - prevCurrent;
                              if (actualIncrement > 0) {
                                formula += _isJaK ? `\n\n【プロファイル設定による調整】` : `\n\nProfile Adjustments:`;
                                formula += _isJaK
                                  ? `\n移行期間中: 最低5000mg（+${actualIncrement.toFixed(0)}mg） → ${current.toFixed(0)}mg`
                                  : `\nAdaptation phase: min 5000mg (+${actualIncrement.toFixed(0)}mg) → ${current.toFixed(0)}mg`;
                                hasAdjustment = true;
                              }
                            }

                            if (!hasAdjustment) {
                              formula += _isJaK ? `\n\n（プロファイル設定による追加調整はありません）` : `\n\n(No additional profile adjustments)`;
                            }

                            // カスタム目標値の手動設定（最後に適用：全ての調整を上書き）
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += _isJaK ? `\n\n【手動設定による上書き】` : `\n\nManual Override:`;
                              formula += _isJaK
                                ? `\nカスタム目標値: ${manualValue}mg（自動計算を上書き）`
                                : `\nCustom target: ${manualValue}mg (overrides auto-calculation)`;
                            } else {
                              formula += _isJaK ? `\n\n【最終目標値】` : `\n\nFinal Target:`;
                              formula += `\n${currentTarget.toFixed(0)}mg/${_isJaK ? '日' : 'day'}`;
                            }
                            return formula;
                          } else if (nutrient === 'zinc') {
                            const _isJaZ = getLanguage() === 'ja';
                            let formula = _isJaZ ? `【基本値】\n11mg/日（RDA基準、男性）` : `Base:\n11mg/day (RDA, male)`;
                            formula += _isJaZ ? `\n\n（プロファイル設定による追加調整はありません）` : `\n\n(No additional profile adjustments)`;
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += _isJaZ ? `\n\n【手動設定による上書き】` : `\n\nManual Override:`;
                              formula += _isJaZ ? `\nカスタム目標値: ${manualValue}mg（自動計算を上書き）` : `\nCustom target: ${manualValue}mg (overrides auto-calculation)`;
                            } else {
                              formula += _isJaZ ? `\n\n【最終目標値】` : `\n\nFinal Target:`;
                              formula += `\n${currentTarget.toFixed(1)}mg/${_isJaZ ? '日' : 'day'}`;
                            }
                            return formula;
                          } else if (nutrient === 'vitamin_c') {
                            const _isJaC = getLanguage() === 'ja';
                            let formula = _isJaC ? `【基本値】\n10mg/日（カーニボアロジック）` : `Base:\n10mg/day (Carnivore Logic)`;
                            formula += _isJaC ? `\n\n（プロファイル設定による追加調整はありません）` : `\n\n(No additional profile adjustments)`;
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += _isJaC ? `\n\n【手動設定による上書き】` : `\n\nManual Override:`;
                              formula += _isJaC ? `\nカスタム目標値: ${manualValue}mg（自動計算を上書き）` : `\nCustom target: ${manualValue}mg (overrides auto-calculation)`;
                            } else {
                              formula += _isJaC ? `\n\n【最終目標値】` : `\n\nFinal Target:`;
                              formula += `\n${currentTarget.toFixed(1)}mg/${_isJaC ? '日' : 'day'}`;
                            }
                            return formula;
                          } else if (nutrient === 'vitamin_a') {
                            const _isJaA = getLanguage() === 'ja';
                            let formula = _isJaA ? `【基本値】\n5000IU/日（レチノール、活性型ビタミンA）` : `Base:\n5000IU/day (Retinol, active Vitamin A)`;
                            formula += _isJaA ? `\n\n（プロファイル設定による追加調整はありません）` : `\n\n(No additional profile adjustments)`;
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += _isJaA ? `\n\n【手動設定による上書き】` : `\n\nManual Override:`;
                              formula += _isJaA ? `\nカスタム目標値: ${manualValue}IU（自動計算を上書き）` : `\nCustom target: ${manualValue}IU (overrides auto-calculation)`;
                            } else {
                              formula += _isJaA ? `\n\n【最終目標値】` : `\n\nFinal Target:`;
                              formula += `\n${currentTarget.toFixed(0)}IU/${_isJaA ? '日' : 'day'}`;
                            }
                            return formula;
                          } else if (nutrient === 'vitamin_k2') {
                            const _isJaK2 = getLanguage() === 'ja';
                            let formula = _isJaK2 ? `【基本値】\n200μg/日（MK-4、メナキノン-4）` : `Base:\n200μg/day (MK-4, Menaquinone-4)`;
                            formula += _isJaK2 ? `\n\n（プロファイル設定による追加調整はありません）` : `\n\n(No additional profile adjustments)`;
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += _isJaK2 ? `\n\n【手動設定による上書き】` : `\n\nManual Override:`;
                              formula += _isJaK2 ? `\nカスタム目標値: ${manualValue}μg（自動計算を上書き）` : `\nCustom target: ${manualValue}μg (overrides auto-calculation)`;
                            } else {
                              formula += _isJaK2 ? `\n\n【最終目標値】` : `\n\nFinal Target:`;
                              formula += `\n${currentTarget.toFixed(0)}μg/${_isJaK2 ? '日' : 'day'}`;
                            }
                            return formula;
                          } else if (nutrient === 'vitamin_b12') {
                            const _isJaB12 = getLanguage() === 'ja';
                            let formula = _isJaB12 ? `【基本値】\n2.4μg/日（RDA基準）` : `Base:\n2.4μg/day (RDA)`;
                            let current = 2.4;
                            let hasAdjustment = false;

                            // アルコール摂取頻度による調整
                            if (
                              profile?.alcoholFrequency === 'daily' ||
                              profile?.alcoholFrequency === 'weekly'
                            ) {
                              const prevCurrent = current;
                              current = Math.max(current, 3.0);
                              const actualIncrement = current - prevCurrent;
                              if (actualIncrement > 0) {
                                formula += _isJaB12 ? `\n\n【プロファイル設定による調整】` : `\n\nProfile Adjustments:`;
                                formula += _isJaB12
                                  ? `\nアルコール摂取: 最低3.0μg（+${actualIncrement.toFixed(1)}μg） → ${current.toFixed(1)}μg`
                                  : `\nAlcohol intake: min 3.0μg (+${actualIncrement.toFixed(1)}μg) → ${current.toFixed(1)}μg`;
                                hasAdjustment = true;
                              }
                            }

                            if (!hasAdjustment) {
                              formula += _isJaB12 ? `\n\n（プロファイル設定による追加調整はありません）` : `\n\n(No additional profile adjustments)`;
                            }

                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += _isJaB12 ? `\n\n【手動設定による上書き】` : `\n\nManual Override:`;
                              formula += _isJaB12 ? `\nカスタム目標値: ${manualValue}μg（自動計算を上書き）` : `\nCustom target: ${manualValue}μg (overrides auto-calculation)`;
                            } else {
                              formula += _isJaB12 ? `\n\n【最終目標値】` : `\n\nFinal Target:`;
                              formula += `\n${currentTarget.toFixed(1)}μg/${_isJaB12 ? '日' : 'day'}`;
                            }
                            return formula;
                          } else if (nutrient === 'choline') {
                            const _isJaCh = getLanguage() === 'ja';
                            let formula = _isJaCh ? `【基本値】\n450mg/日（RDA基準、男性）` : `Base:\n450mg/day (RDA, male)`;
                            formula += _isJaCh ? `\n\n（プロファイル設定による追加調整はありません）` : `\n\n(No additional profile adjustments)`;
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += _isJaCh ? `\n\n【手動設定による上書き】` : `\n\nManual Override:`;
                              formula += _isJaCh ? `\nカスタム目標値: ${manualValue}mg（自動計算を上書き）` : `\nCustom target: ${manualValue}mg (overrides auto-calculation)`;
                            } else {
                              formula += _isJaCh ? `\n\n【最終目標値】` : `\n\nFinal Target:`;
                              formula += `\n${currentTarget.toFixed(0)}mg/${_isJaCh ? '日' : 'day'}`;
                            }
                            return formula;
                          } else if (
                            nutrient === 'phosphorus' ||
                            nutrientKey === 'phosphorus' ||
                            labelLower.includes('リン') ||
                            labelLower.includes('phosphorus')
                          ) {
                            const _isJaPh = getLanguage() === 'ja';
                            let formula = _isJaPh ? `【基本値】\n700mg/日（RDA基準）` : `Base:\n700mg/day (RDA)`;
                            formula += _isJaPh ? `\n\n（プロファイル設定による追加調整はありません）` : `\n\n(No additional profile adjustments)`;
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += _isJaPh ? `\n\n【手動設定による上書き】` : `\n\nManual Override:`;
                              formula += _isJaPh ? `\nカスタム目標値: ${manualValue}mg（自動計算を上書き）` : `\nCustom target: ${manualValue}mg (overrides auto-calculation)`;
                            } else {
                              formula += _isJaPh ? `\n\n【最終目標値】` : `\n\nFinal Target:`;
                              formula += `\n${currentTarget.toFixed(0)}mg/${_isJaPh ? '日' : 'day'}`;
                            }
                            return formula;
                          }
                          return '';
                        };
                        // 実際の目標値を計算して検証
                        let actualTarget = target;
                        try {
                          const calculatedTargets = getCarnivoreTargets(
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
                            userProfile?.bodyComposition,
                            userProfile?.weight,
                            userProfile?.metabolicStressIndicators,
                            userProfile?.customNutrientTargets
                          );
                          const nutrientKeyMap: Record<string, keyof typeof calculatedTargets> = {
                            protein: 'protein',
                            fat: 'fat',
                            iron: 'iron',
                            magnesium: 'magnesium',
                            vitamin_d: 'vitamin_d',
                            sodium: 'sodium',
                            potassium: 'potassium',
                            zinc: 'zinc',
                            vitamin_c: 'vitamin_c',
                            vitamin_a: 'vitamin_a',
                            vitamin_k2: 'vitamin_k2',
                            vitamin_b12: 'vitamin_b12',
                            choline: 'choline',
                            phosphorus: 'phosphorus' as keyof typeof calculatedTargets,
                          };
                          if (inferredNutrientKey && nutrientKeyMap[inferredNutrientKey]) {
                            actualTarget = calculatedTargets[nutrientKeyMap[inferredNutrientKey]];
                          }
                        } catch (error) {
                          console.error('Error calculating actual target:', error);
                        }

                        const formula = getCalculationFormula(
                          inferredNutrientKey,
                          userProfile,
                          actualTarget,
                          label
                        );

                        // 計算式がある場合に表示
                        if (formula) {
                          return (
                            <div
                              style={{
                                padding: '16px',
                                backgroundColor: '#f0f9ff',
                                borderRadius: '8px',
                                border: '1px solid #f43f5e',
                              }}
                            >
                              <p
                                style={{
                                  fontSize: '15px',
                                  fontWeight: '600',
                                  color: '#0369a1',
                                  marginBottom: '12px',
                                }}
                              >
                                計算式:
                              </p>
                              <p
                                style={{
                                  fontSize: '14px',
                                  color: '#0c4a6e',
                                  fontFamily: 'monospace',
                                  whiteSpace: 'pre-wrap',
                                  lineHeight: '1.8',
                                  backgroundColor: '#e0f2fe',
                                  padding: '16px',
                                  borderRadius: '6px',
                                }}
                              >
                                {formula}
                              </p>
                            </div>
                          );
                        }

                        // 計算式を生成できない場合でも、基本的な情報を表示
                        if (inferredNutrientKey) {
                          const defaultTargets = getCarnivoreTargets();
                          const nutrientKeyMap: Record<string, keyof typeof defaultTargets> = {
                            protein: 'protein',
                            fat: 'fat',
                            iron: 'iron',
                            magnesium: 'magnesium',
                            vitamin_d: 'vitamin_d',
                            sodium: 'sodium',
                            potassium: 'potassium',
                            zinc: 'zinc',
                            vitamin_c: 'vitamin_c',
                            vitamin_a: 'vitamin_a',
                            vitamin_k2: 'vitamin_k2',
                            vitamin_b12: 'vitamin_b12',
                            choline: 'choline',
                          };
                          const baseKey = nutrientKeyMap[inferredNutrientKey];
                          if (baseKey) {
                            const baseValue = defaultTargets[baseKey];
                            return (
                              <div
                                style={{
                                  padding: '16px',
                                  backgroundColor: '#f0f9ff',
                                  borderRadius: '8px',
                                  border: '1px solid #f43f5e',
                                }}
                              >
                                <p
                                  style={{
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    color: '#0369a1',
                                    marginBottom: '12px',
                                  }}
                                >
                                  計算式:
                                </p>
                                <p
                                  style={{
                                    fontSize: '14px',
                                    color: '#0c4a6e',
                                    fontFamily: 'monospace',
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: '1.8',
                                    backgroundColor: '#e0f2fe',
                                    padding: '16px',
                                    borderRadius: '6px',
                                  }}
                                >
                                  {`基本値: ${baseValue}${unit}\nプロファイル設定に基づいて動的に調整されます。\n\n現在の目標値: ${actualTarget.toFixed(1)}${unit}`}
                                </p>
                              </div>
                            );
                          }
                        }

                        return (
                          <div
                            style={{
                              padding: '16px',
                              backgroundColor: '#f9fafb',
                              borderRadius: '8px',
                              border: '1px solid #e5e7eb',
                            }}
                          >
                            <p style={{ fontSize: '14px', color: '#78716c' }}>
                              計算式を生成できませんでした。
                            </p>
                          </div>
                        );
                      })()}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(MiniNutrientGauge);
