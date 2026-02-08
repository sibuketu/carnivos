/**
 * CarnivOS - Nutrient Gauge Component (Web版)
 *
 * 栄養素ゲージの表示（Anxiety-Free Gauges）
 * Phase 2: シンプルなバー表示、タップでArgument Cardを表示
 */

import React from 'react';
import './NutrientGauge.css';

interface NutrientGaugeProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  status?: 'optimal' | 'low' | 'warning';
  nutrient?: string; // For Argument Card lookup (e.g., 'vitaminC', 'fiber', 'iron')
  onPress?: () => void;
}

function NutrientGauge({
  label,
  current,
  target,
  unit,
  status: _status = 'optimal',
  nutrient: _nutrient,
  onPress,
}: NutrientGaugeProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 200) : 0; // 200%まで表示可能
  const isSufficient = current >= target;

  // 4ゾーンのグラデーション色を生成する関数（MiniNutrientGaugeと同じロジック）
  const getZoneGradient = (percent: number): string => {
    // 4ゾーンのグラデーション（段階的に色が変わる）
    // 0-50%: 赤系、50-100%: オレンジ系、100-120%: 緑系、120%以上: 紫系
    if (percent < 50) {
      // 0-50%: 赤からオレンジへのグラデーション
      const ratio = percent / 50;
      return `linear-gradient(to right, #ef4444 0%, #f97316 ${ratio * 100}%)`;
    } else if (percent < 100) {
      // 50-100%: オレンジから緑へのグラデーション
      const ratio = (percent - 50) / 50;
      return `linear-gradient(to right, #f97316 0%, #f43f5e ${ratio * 100}%)`;
    } else if (percent < 120) {
      // 100-120%: 緑から紫へのグラデーション
      const ratio = (percent - 100) / 20;
      return `linear-gradient(to right, #f43f5e 0%, #f43f5e ${ratio * 100}%)`;
    } else {
      // 120%以上: 紫
      return '#f43f5e';
    }
  };

  return (
    <div
      className="nutrient-gauge-container"
      onClick={onPress}
      style={{ cursor: onPress ? 'pointer' : 'default' }}
    >
      <div className="nutrient-gauge-header">
        <span className="nutrient-gauge-label">{label}</span>
        <span className="nutrient-gauge-value">
          {current.toFixed(1)} / {target.toFixed(1)} {unit}
        </span>
      </div>
      <div
        className="nutrient-gauge-bar-container"
        style={{
          position: 'relative',
          width: '100%',
          height: '10px',
          backgroundColor: '#e5e7eb',
          borderRadius: '9999px',
          overflow: 'hidden',
        }}
      >
        <div
          className="nutrient-gauge-bar"
          style={{
            position: 'absolute',
            left: 0,
            width: `${Math.min(percentage, 200)}%`,
            height: '100%',
            background: getZoneGradient(percentage),
            borderRadius: '9999px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      {isSufficient && (
        <div className="nutrient-gauge-status">✅ Sufficient for YOUR metabolism</div>
      )}
    </div>
  );
}

export default React.memo(NutrientGauge);
