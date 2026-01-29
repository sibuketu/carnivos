/**
 * Primal Logic - Mini Nutrient Gauge Component
 *
 * ButcherSelectで使用されている栄養素ゲージコンポーネントを共通化
 * 4-Zone Gradientスタイルで、摂取基準との距離を視覚的に表示
 */

import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  calculateNutrientImpactFactors,
  applySortOrder,
  getCategoryName,
  type SortOrder,
  type NutrientImpactFactor,
} from '../utils/nutrientImpactFactors';
import { useTranslation } from '../utils/i18n';
import { getNutrientExplanation } from '../utils/nutrientExplanationHelper';
import { CARNIVORE_NUTRIENT_TARGETS, getCarnivoreTargets } from '../data/carnivoreTargets';

interface MiniNutrientGaugeProps {
  label: string;
  currentDailyTotal?: number; // Layer 1: Base
  previewAmount?: number; // Layer 2: Preview
  target: number;
  color: string;
  unit?: string;
  logic?: string; // Logic Armor: 栄養目標値の根拠を表示するための準備
  hint?: string; // 不足時の提案テキスト
  showLowIsOk?: boolean; // Vitamin Cなど、低くてもOKな場合
  nutrientKey?: string; // 栄養素キー（例: 'protein', 'iron', 'magnesium'）
  hideTarget?: boolean; // カスタム食品画面用: targetを表示しない
}

export default function MiniNutrientGauge({
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
}: MiniNutrientGaugeProps) {
  const { userProfile } = useApp();
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showModal, setShowModal] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('impact');
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
      const factors = calculateNutrientImpactFactors(inferredNutrientKey as any, userProfile);
      return applySortOrder(factors, sortOrder);
    } catch (error) {
      console.error('Error calculating impact factors:', error);
      return [];
    }
  }, [inferredNutrientKey, userProfile, sortOrder]);

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
      return '#22c55e'; // 緑（適切）
    } else {
      return '#a855f7'; // 紫（過剰）
    }
  };

  const isPastFood = currentDailyTotal > 0; // 過去に追加した食品かどうか

  // Logic Armor: ロジックがある場合はコンソールに出力（将来はツールチップで表示）
  useEffect(() => {
    if (logic && import.meta.env.DEV) {
      console.log(`[Logic Armor] ${label}: ${logic}`);
    }
  }, [label, logic]);

  // 各栄養素のデフォルト説明（nutrientExplanationが取得できない場合に使用）
  const getDefaultExplanation = (
    nutrientKey: string | null,
    targetValue: number,
    unit: string
  ): string | null => {
    if (!nutrientKey) return null;
    const defaultExplanations: Record<string, string> = {
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
    return defaultExplanations[nutrientKey] || null;
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
    if (validKeys.includes(inferredNutrientKey as any)) {
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
      alert(`${label}の目標値の根拠:\n\n${logic}`);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        position: 'relative',
        cursor: logic ? 'pointer' : 'default',
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
                `${displayValue} / ${displayTarget} ${unit}`}
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
                  Low is OK (カーニボアロジック)
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
                        border: '1px solid #3b82f6',
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
                                          ? '#22c55e'
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
                            let formula = `【基本値】\n体重(${weight}kg) × 1.6g/kg = ${base.toFixed(1)}g/日`;
                            let current = base;
                            let adjustments: Array<{
                              name: string;
                              target: number;
                              applied: boolean;
                            }> = [];

                            // 妊娠中・授乳中の調整（最優先）
                            if (profile?.isPregnant) {
                              adjustments.push({ name: '妊娠中', target: 120, applied: false });
                            }
                            if (profile?.isBreastfeeding) {
                              adjustments.push({ name: '授乳中', target: 130, applied: false });
                            }

                            // 運動強度・頻度による調整
                            if (
                              profile?.exerciseIntensity === 'intense' ||
                              profile?.exerciseFrequency === '5+'
                            ) {
                              adjustments.push({ name: '激しい運動', target: 130, applied: false });
                            } else if (
                              profile?.exerciseIntensity === 'moderate' ||
                              profile?.exerciseFrequency === '3-4'
                            ) {
                              adjustments.push({
                                name: '中程度の運動',
                                target: 115,
                                applied: false,
                              });
                            }

                            // 活動量による調整
                            if (profile?.activityLevel === 'active') {
                              adjustments.push({ name: '活動的', target: 120, applied: false });
                            } else if (profile?.activityLevel === 'moderate') {
                              adjustments.push({
                                name: '中程度の活動量',
                                target: 110,
                                applied: false,
                              });
                            }

                            // 年齢による調整
                            if (profile?.age && profile.age > 50) {
                              adjustments.push({ name: '50歳以上', target: 110, applied: false });
                            }

                            // 消化器系の問題による調整
                            if (profile?.digestiveIssues) {
                              adjustments.push({
                                name: '消化器系の問題',
                                target: 110,
                                applied: false,
                              });
                            }

                            // 調整をtarget値の高い順にソート
                            adjustments.sort((a, b) => b.target - a.target);

                            // 各調整を適用して表示
                            if (adjustments.length > 0) {
                              formula += `\n\n【プロファイル設定による調整】`;
                              for (const adj of adjustments) {
                                const prevCurrent = current;
                                const newCurrent = Math.max(current, adj.target);
                                const actualIncrement = newCurrent - prevCurrent;
                                if (actualIncrement > 0) {
                                  current = newCurrent;
                                  formula += `\n${adj.name}: 最低${adj.target}g（+${actualIncrement.toFixed(1)}g） → ${current.toFixed(1)}g`;
                                }
                              }
                            } else {
                              formula += `\n\n（プロファイル設定による追加調整はありません）`;
                            }

                            // カスタム目標値の手動設定（最後に適用：全ての調整を上書き）
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += `\n\n【手動設定による上書き】`;
                              formula += `\nカスタム目標値: ${manualValue}g（自動計算を上書き）`;
                              current = manualValue;
                            } else {
                              formula += `\n\n【最終目標値】`;
                              formula += `\n${current.toFixed(1)}g/日`;
                            }

                            // 実際の目標値を使用（計算式と表示を一致させる）
                            // getCarnivoreTargetsで計算された実際の目標値を使用
                            if (Math.abs(current - currentTarget) > 0.1) {
                              // 実際の目標値を使用して計算式を修正
                              current = currentTarget;
                              // 計算式の最終目標値を実際の目標値に更新
                              formula = formula.replace(
                                /【最終目標値】\n.*$/,
                                `【最終目標値】\n${currentTarget.toFixed(1)}g/日`
                              );
                            }

                            return formula;
                          } else if (nutrient === 'fat') {
                            let formula = `【基本値】\n150g/日`;
                            let current = 150;
                            let adjustments: Array<{
                              name: string;
                              target: number;
                              applied: boolean;
                            }> = [];

                            // 運動強度・頻度による調整
                            if (
                              profile?.exerciseIntensity === 'intense' ||
                              profile?.exerciseFrequency === '5+'
                            ) {
                              adjustments.push({ name: '激しい運動', target: 190, applied: false });
                            } else if (
                              profile?.exerciseIntensity === 'moderate' ||
                              profile?.exerciseFrequency === '3-4'
                            ) {
                              adjustments.push({
                                name: '中程度の運動',
                                target: 170,
                                applied: false,
                              });
                            }

                            // 活動量による調整
                            if (profile?.activityLevel === 'active') {
                              adjustments.push({ name: '活動的', target: 180, applied: false });
                            } else if (profile?.activityLevel === 'moderate') {
                              adjustments.push({
                                name: '中程度の活動量',
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
                              formula += `\n\n【プロファイル設定による調整】`;
                              for (const adj of adjustments) {
                                const prevCurrent = current;
                                const newCurrent = Math.max(current, adj.target);
                                const actualIncrement = newCurrent - prevCurrent;
                                if (actualIncrement > 0) {
                                  current = newCurrent;
                                  formula += `\n${adj.name}: 最低${adj.target}g（+${actualIncrement.toFixed(1)}g） → ${current.toFixed(1)}g`;
                                }
                              }
                            }

                            // 移行期間中の調整（1.5倍、最後に適用）
                            if (isAdaptationPhase) {
                              const prevCurrent = current;
                              current = Math.max(current, prevCurrent * 1.5);
                              const actualIncrement = current - prevCurrent;
                              if (actualIncrement > 0) {
                                formula += `\n移行期間中: ${prevCurrent.toFixed(1)}g × 1.5倍（+${actualIncrement.toFixed(1)}g） → ${current.toFixed(1)}g`;
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
                                profile?.daysOnCarnivore,
                                profile?.carnivoreStartDate,
                                profile?.forceAdaptationMode,
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
                                formula += `\nタンパク質比: タンパク質目標値(${actualProteinTarget.toFixed(1)}g) × 1.2倍（+${actualIncrement.toFixed(1)}g） → ${current.toFixed(1)}g`;
                              }
                            } catch (error) {
                              console.error(
                                'Error calculating protein target for fat formula:',
                                error
                              );
                            }

                            if (adjustments.length === 0 && !isAdaptationPhase) {
                              formula += `\n\n（プロファイル設定による追加調整はありません）`;
                            }

                            // カスタム目標値の手動設定（最後に適用：全ての調整を上書き）
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += `\n\n【手動設定による上書き】`;
                              formula += `\nカスタム目標値: ${manualValue}g（自動計算を上書き）`;
                            } else {
                              formula += `\n\n【最終目標値】`;
                              formula += `\n${currentTarget.toFixed(1)}g/日`;
                            }
                            return formula;
                          } else if (nutrient === 'magnesium') {
                            let formula = '【基本値】\n600mg/日';
                            let current = 600;
                            let adjustments: Array<{
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
                                name: '移行期間中',
                                target: 800,
                                increment: 200,
                                applied: false,
                              });
                            }

                            // ストレスレベルによる調整
                            if (profile?.stressLevel === 'high') {
                              adjustments.push({
                                name: '高ストレス',
                                target: 700,
                                increment: 100,
                                applied: false,
                              });
                            }

                            // 活動量による調整
                            if (profile?.activityLevel === 'active') {
                              adjustments.push({
                                name: '活動的',
                                target: 700,
                                increment: 100,
                                applied: false,
                              });
                            }

                            // 睡眠時間による調整
                            if (profile?.sleepHours && profile.sleepHours < 7) {
                              adjustments.push({
                                name: '睡眠不足（7時間未満）',
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
                                name: '激しい運動',
                                target: 750,
                                increment: 150,
                                applied: false,
                              });
                            } else if (
                              profile?.exerciseIntensity === 'moderate' ||
                              profile?.exerciseFrequency === '3-4'
                            ) {
                              adjustments.push({
                                name: '中程度の運動',
                                target: 650,
                                increment: 50,
                                applied: false,
                              });
                            }

                            // 妊娠中・授乳中の調整
                            if (profile?.isPregnant) {
                              adjustments.push({
                                name: '妊娠中',
                                target: 700,
                                increment: 100,
                                applied: false,
                              });
                            }
                            if (profile?.isBreastfeeding) {
                              adjustments.push({
                                name: '授乳中',
                                target: 700,
                                increment: 100,
                                applied: false,
                              });
                            }

                            // 炎症レベルによる調整
                            if (profile?.inflammationLevel === 'high') {
                              adjustments.push({
                                name: '高炎症',
                                target: 650,
                                increment: 50,
                                applied: false,
                              });
                            }

                            // メンタルヘルス状態による調整
                            if (profile?.mentalHealthStatus === 'poor') {
                              adjustments.push({
                                name: 'メンタルヘルス不良',
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
                                name: 'アルコール摂取',
                                target: 700,
                                increment: 100,
                                applied: false,
                              });
                            }

                            // カフェイン摂取量による調整
                            if (profile?.caffeineIntake === 'high') {
                              if (profile?.stressLevel === 'high') {
                                adjustments.push({
                                  name: '高カフェイン+高ストレス',
                                  target: 750,
                                  increment: 150,
                                  applied: false,
                                });
                              } else {
                                adjustments.push({
                                  name: '高カフェイン',
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
                              formula += `\n\n【プロファイル設定による調整】`;

                              // 各調整を順番に適用し、実際に値が変わる場合のみ表示
                              // 調整をtarget値の高い順にソートして適用
                              adjustments.sort((a, b) => b.target - a.target);

                              for (const adj of adjustments) {
                                const prevCurrent = current;
                                const newCurrent = Math.max(current, adj.target);
                                const actualIncrement = newCurrent - prevCurrent;
                                if (actualIncrement > 0) {
                                  current = newCurrent;
                                  formula += `\n${adj.name}: 最低${adj.target}mg（+${actualIncrement}mg） → ${current}mg`;
                                }
                              }

                              // 代謝ストレス指標による累積的な増分（最後に適用）
                              if (metabolicIncrement > 0) {
                                const prevCurrent = current;
                                current = current + metabolicIncrement;
                                formula += `\n代謝ストレス（夜間低血糖疑い）: +${metabolicIncrement}mg（累積増分） → ${current}mg`;
                              }
                            } else {
                              formula += `\n\n（プロファイル設定による追加調整はありません）`;
                            }

                            // サプリメント摂取による調整
                            if (profile?.supplementMagnesium) {
                              const prevCurrent = current;
                              current = Math.max(0, current - 200);
                              formula += `\n\n【サプリメント調整】`;
                              formula += `\nマグネシウムサプリメント摂取中: -200mg（サプリメント分を考慮） → ${current}mg`;
                            }

                            // カスタム目標値の手動設定（最後に適用：全ての調整を上書き）
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += `\n\n【手動設定による上書き】`;
                              formula += `\nカスタム目標値: ${manualValue}mg（自動計算を上書き）`;
                              current = manualValue;
                            } else {
                              formula += `\n\n【最終目標値】`;
                              formula += `\n${currentTarget.toFixed(1)}mg/日`;
                            }
                            return formula;
                          } else if (nutrient === 'iron') {
                            let formula = `【基本値】\n8mg/日（男性）`;
                            let current = 8;

                            // 性別による調整
                            if (profile?.gender === 'female') {
                              if (profile?.isPostMenopause) {
                                // 閉経後は8mg（変更なし）
                                formula += `\n\n【性別調整】`;
                                formula += `\n女性（閉経後）: 8mg（月経がないため男性と同値）`;
                              } else {
                                const prevCurrent = current;
                                current = 18;
                                formula += `\n\n【性別調整】`;
                                formula += `\n女性（月経あり）: 18mg（+${(current - prevCurrent).toFixed(1)}mg） → ${current}mg`;
                              }
                            }

                            // 妊娠中・授乳中の調整
                            if (profile?.isPregnant) {
                              const prevCurrent = current;
                              current = Math.max(current, 27);
                              const actualIncrement = current - prevCurrent;
                              if (actualIncrement > 0) {
                                if (!formula.includes('【プロファイル設定による調整】')) {
                                  formula += `\n\n【プロファイル設定による調整】`;
                                }
                                formula += `\n妊娠中: 最低27mg（+${actualIncrement.toFixed(1)}mg） → ${current}mg`;
                              }
                            }
                            if (profile?.isBreastfeeding) {
                              const prevCurrent = current;
                              current = Math.max(current, 9);
                              const actualIncrement = current - prevCurrent;
                              if (actualIncrement > 0 || current < prevCurrent) {
                                if (!formula.includes('【プロファイル設定による調整】')) {
                                  formula += `\n\n【プロファイル設定による調整】`;
                                }
                                if (current < prevCurrent) {
                                  formula += `\n授乳中: 9mg（月経がないため） → ${current}mg`;
                                } else {
                                  formula += `\n授乳中: 最低9mg（+${actualIncrement.toFixed(1)}mg） → ${current}mg`;
                                }
                              }
                            }

                            if (
                              !formula.includes('【プロファイル設定による調整】') &&
                              !profile?.isPregnant &&
                              !profile?.isBreastfeeding
                            ) {
                              formula += `\n\n（プロファイル設定による追加調整はありません）`;
                            }

                            // カスタム目標値の手動設定（最後に適用：全ての調整を上書き）
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += `\n\n【手動設定による上書き】`;
                              formula += `\nカスタム目標値: ${manualValue}mg（自動計算を上書き）`;
                            } else {
                              formula += `\n\n【最終目標値】`;
                              formula += `\n${currentTarget.toFixed(1)}mg/日`;
                            }
                            return formula;
                          } else if (nutrient === 'vitamin_d') {
                            let formula = `【基本値】\n2000IU/日`;
                            let current = 2000;
                            let adjustments: Array<{
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
                                  name: '日光暴露なし（サプリメントなし）',
                                  target: 4000,
                                  applied: false,
                                });
                              }
                            }

                            // 年齢による調整
                            if (profile?.age && profile.age > 50) {
                              adjustments.push({ name: '50歳以上', target: 3000, applied: false });
                            }

                            // メンタルヘルス状態による調整
                            if (profile?.mentalHealthStatus === 'poor') {
                              if (!profile?.supplementVitaminD) {
                                adjustments.push({
                                  name: 'メンタルヘルス不良（サプリメントなし）',
                                  target: 3000,
                                  applied: false,
                                });
                              }
                            }

                            // 調整をtarget値の高い順にソート
                            adjustments.sort((a, b) => b.target - a.target);

                            // 各調整を適用して表示
                            if (adjustments.length > 0) {
                              formula += `\n\n【プロファイル設定による調整】`;
                              for (const adj of adjustments) {
                                const prevCurrent = current;
                                const newCurrent = Math.max(current, adj.target);
                                const actualIncrement = newCurrent - prevCurrent;
                                if (actualIncrement > 0) {
                                  current = newCurrent;
                                  formula += `\n${adj.name}: 最低${adj.target}IU（+${actualIncrement.toFixed(0)}IU） → ${current.toFixed(0)}IU`;
                                }
                              }
                            } else {
                              formula += `\n\n（プロファイル設定による追加調整はありません）`;
                            }

                            // サプリメント摂取による調整
                            if (profile?.supplementVitaminD) {
                              const prevCurrent = current;
                              current = Math.max(0, current - 1000);
                              formula += `\n\n【サプリメント調整】`;
                              formula += `\nビタミンDサプリメント摂取中: -1000IU（サプリメント分を考慮） → ${current.toFixed(0)}IU`;
                            }

                            // カスタム目標値の手動設定（最後に適用：全ての調整を上書き）
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += `\n\n【手動設定による上書き】`;
                              formula += `\nカスタム目標値: ${manualValue}IU（自動計算を上書き）`;
                            } else {
                              formula += `\n\n【最終目標値】`;
                              formula += `\n${currentTarget.toFixed(0)}IU/日`;
                            }
                            return formula;
                          } else if (nutrient === 'sodium') {
                            let formula = `【基本値】\n5000mg/日`;
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
                                formula += `\n\n【プロファイル設定による調整】`;
                                formula += `\n移行期間中: 最低7000mg（+${actualIncrement.toFixed(0)}mg） → ${current.toFixed(0)}mg`;
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
                                  formula += `\n\n【プロファイル設定による調整】`;
                                  hasAdjustment = true;
                                }
                                formula += `\n活動的: +1000mg（汗をかくため、累積増分） → ${current.toFixed(0)}mg`;
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
                                  formula += `\n\n【プロファイル設定による調整】`;
                                  hasAdjustment = true;
                                }
                                formula += `\n代謝ストレス（朝起きるのが辛い/疲労感）: +1500mg（副腎疲労疑い、累積増分） → ${current.toFixed(0)}mg`;
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
                                  formula += `\n\n【プロファイル設定による調整】`;
                                  hasAdjustment = true;
                                }
                                formula += `\n代謝ストレス（コーヒー毎日2杯以上）: +500mg（ナトリウム排出増、累積増分） → ${current.toFixed(0)}mg`;
                              }
                            }

                            if (!hasAdjustment) {
                              formula += `\n\n（プロファイル設定による追加調整はありません）`;
                            }

                            // カスタム目標値の手動設定（最後に適用：全ての調整を上書き）
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += `\n\n【手動設定による上書き】`;
                              formula += `\nカスタム目標値: ${manualValue}mg（自動計算を上書き）`;
                            } else {
                              formula += `\n\n【最終目標値】`;
                              formula += `\n${currentTarget.toFixed(0)}mg/日`;
                            }
                            return formula;
                          } else if (nutrient === 'potassium') {
                            let formula = `【基本値】\n4500mg/日（カーニボアロジック）`;
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
                                formula += `\n\n【プロファイル設定による調整】`;
                                formula += `\n移行期間中: 最低5000mg（+${actualIncrement.toFixed(0)}mg） → ${current.toFixed(0)}mg`;
                                hasAdjustment = true;
                              }
                            }

                            if (!hasAdjustment) {
                              formula += `\n\n（プロファイル設定による追加調整はありません）`;
                            }

                            // カスタム目標値の手動設定（最後に適用：全ての調整を上書き）
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += `\n\n【手動設定による上書き】`;
                              formula += `\nカスタム目標値: ${manualValue}mg（自動計算を上書き）`;
                            } else {
                              formula += `\n\n【最終目標値】`;
                              formula += `\n${currentTarget.toFixed(0)}mg/日`;
                            }
                            return formula;
                          } else if (nutrient === 'zinc') {
                            let formula = `【基本値】\n11mg/日（RDA基準、男性）`;
                            let current = 11;

                            formula += `\n\n（プロファイル設定による追加調整はありません）`;

                            // カスタム目標値の手動設定（最後に適用：全ての調整を上書き）
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += `\n\n【手動設定による上書き】`;
                              formula += `\nカスタム目標値: ${manualValue}mg（自動計算を上書き）`;
                            } else {
                              formula += `\n\n【最終目標値】`;
                              formula += `\n${currentTarget.toFixed(1)}mg/日`;
                            }
                            return formula;
                          } else if (nutrient === 'vitamin_c') {
                            let formula = `【基本値】\n10mg/日（カーニボアロジック）`;
                            let current = 10;

                            formula += `\n\n（プロファイル設定による追加調整はありません）`;

                            // カスタム目標値の手動設定（最後に適用：全ての調整を上書き）
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += `\n\n【手動設定による上書き】`;
                              formula += `\nカスタム目標値: ${manualValue}mg（自動計算を上書き）`;
                            } else {
                              formula += `\n\n【最終目標値】`;
                              formula += `\n${currentTarget.toFixed(1)}mg/日`;
                            }
                            return formula;
                          } else if (nutrient === 'vitamin_a') {
                            let formula = `【基本値】\n5000IU/日（レチノール、活性型ビタミンA）`;
                            let current = 5000;

                            formula += `\n\n（プロファイル設定による追加調整はありません）`;

                            // カスタム目標値の手動設定（最後に適用：全ての調整を上書き）
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += `\n\n【手動設定による上書き】`;
                              formula += `\nカスタム目標値: ${manualValue}IU（自動計算を上書き）`;
                            } else {
                              formula += `\n\n【最終目標値】`;
                              formula += `\n${currentTarget.toFixed(0)}IU/日`;
                            }
                            return formula;
                          } else if (nutrient === 'vitamin_k2') {
                            let formula = `【基本値】\n200μg/日（MK-4、メナキノン-4）`;
                            let current = 200;

                            formula += `\n\n（プロファイル設定による追加調整はありません）`;

                            // カスタム目標値の手動設定（最後に適用：全ての調整を上書き）
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += `\n\n【手動設定による上書き】`;
                              formula += `\nカスタム目標値: ${manualValue}μg（自動計算を上書き）`;
                            } else {
                              formula += `\n\n【最終目標値】`;
                              formula += `\n${currentTarget.toFixed(0)}μg/日`;
                            }
                            return formula;
                          } else if (nutrient === 'vitamin_b12') {
                            let formula = `【基本値】\n2.4μg/日（RDA基準）`;
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
                                formula += `\n\n【プロファイル設定による調整】`;
                                formula += `\nアルコール摂取: 最低3.0μg（+${actualIncrement.toFixed(1)}μg） → ${current.toFixed(1)}μg`;
                                hasAdjustment = true;
                              }
                            }

                            if (!hasAdjustment) {
                              formula += `\n\n（プロファイル設定による追加調整はありません）`;
                            }

                            // カスタム目標値の手動設定（最後に適用：全ての調整を上書き）
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += `\n\n【手動設定による上書き】`;
                              formula += `\nカスタム目標値: ${manualValue}μg（自動計算を上書き）`;
                            } else {
                              formula += `\n\n【最終目標値】`;
                              formula += `\n${currentTarget.toFixed(1)}μg/日`;
                            }
                            return formula;
                          } else if (nutrient === 'choline') {
                            let formula = `【基本値】\n450mg/日（RDA基準、男性）`;
                            let current = 450;

                            formula += `\n\n（プロファイル設定による追加調整はありません）`;

                            // カスタム目標値の手動設定（最後に適用：全ての調整を上書き）
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += `\n\n【手動設定による上書き】`;
                              formula += `\nカスタム目標値: ${manualValue}mg（自動計算を上書き）`;
                            } else {
                              formula += `\n\n【最終目標値】`;
                              formula += `\n${currentTarget.toFixed(0)}mg/日`;
                            }
                            return formula;
                          } else if (nutrient === 'iron') {
                            // 鉄分の計算式
                            let formula = `【基本値】\n`;
                            let current = 8; // 男性の基本値
                            let hasAdjustment = false;

                            // 性別による調整
                            if (profile?.gender === 'female') {
                              if (profile?.isPostMenopause) {
                                current = 8; // 閉経後は8mg（男性と同じ）
                                formula += `8mg/日（女性・閉経後）`;
                              } else {
                                current = 18; // 女性は18mg推奨（月経がある場合）
                                formula += `18mg/日（女性・月経あり）`;
                                hasAdjustment = true;
                              }
                            } else {
                              formula += `8mg/日（男性）`;
                            }

                            // 妊娠中・授乳中の調整
                            if (profile?.isPregnant) {
                              const prevCurrent = current;
                              current = Math.max(current, 27);
                              const actualIncrement = current - prevCurrent;
                              if (actualIncrement > 0) {
                                if (!hasAdjustment) {
                                  formula += `\n\n【プロファイル設定による調整】`;
                                  hasAdjustment = true;
                                }
                                formula += `\n妊娠中: 最低27mg（+${actualIncrement.toFixed(0)}mg） → ${current.toFixed(0)}mg`;
                              }
                            }
                            if (profile?.isBreastfeeding) {
                              const prevCurrent = current;
                              current = Math.max(current, 9);
                              const actualIncrement = current - prevCurrent;
                              if (actualIncrement > 0) {
                                if (!hasAdjustment) {
                                  formula += `\n\n【プロファイル設定による調整】`;
                                  hasAdjustment = true;
                                }
                                formula += `\n授乳中: 最低9mg（+${actualIncrement.toFixed(0)}mg） → ${current.toFixed(0)}mg`;
                              }
                            }

                            if (!hasAdjustment) {
                              formula += `\n\n（プロファイル設定による追加調整はありません）`;
                            }

                            // カスタム目標値の手動設定（最後に適用：全ての調整を上書き）
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += `\n\n【手動設定による上書き】`;
                              formula += `\nカスタム目標値: ${manualValue}mg（自動計算を上書き）`;
                            } else {
                              formula += `\n\n【最終目標値】`;
                              formula += `\n${currentTarget.toFixed(0)}mg/日`;
                            }
                            return formula;
                          } else if (
                            nutrient === 'phosphorus' ||
                            nutrientKey === 'phosphorus' ||
                            labelLower.includes('リン') ||
                            labelLower.includes('phosphorus')
                          ) {
                            // リン（phosphorus）の計算式
                            let formula = `【基本値】\n700mg/日（RDA基準）`;
                            let current = 700;

                            formula += `\n\n（プロファイル設定による追加調整はありません）`;

                            // カスタム目標値の手動設定（最後に適用：全ての調整を上書き）
                            if (
                              profile?.customNutrientTargets?.[nutrient]?.mode === 'manual' &&
                              profile.customNutrientTargets[nutrient].value !== undefined
                            ) {
                              const manualValue = profile.customNutrientTargets[nutrient].value!;
                              formula += `\n\n【手動設定による上書き】`;
                              formula += `\nカスタム目標値: ${manualValue}mg（自動計算を上書き）`;
                            } else {
                              formula += `\n\n【最終目標値】`;
                              formula += `\n${currentTarget.toFixed(0)}mg/日`;
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
                            userProfile?.daysOnCarnivore,
                            userProfile?.carnivoreStartDate,
                            userProfile?.forceAdaptationMode,
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
                            phosphorus: 'phosphorus' as any,
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
                                border: '1px solid #3b82f6',
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
                                  border: '1px solid #3b82f6',
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
