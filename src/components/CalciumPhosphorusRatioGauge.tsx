/**
 * Calcium:Phosphorus Ratio Gauge
 *
 * カルシウム:リン比率を表示
 * カーニボア重要：骨代謝に影響
 */

import './NutrientGauge.css';

interface CalciumPhosphorusRatioGaugeProps {
  calcium: number; // mg
  phosphorus: number; // mg
  previewCalcium?: number; // mg（プレビュー）
  previewPhosphorus?: number; // mg（プレビュー）
  onPress?: () => void;
}

export default function CalciumPhosphorusRatioGauge({
  calcium,
  phosphorus,
  previewCalcium = 0,
  previewPhosphorus = 0,
  onPress,
}: CalciumPhosphorusRatioGaugeProps) {
  const totalCalcium = calcium + previewCalcium;
  const totalPhosphorus = phosphorus + previewPhosphorus;

  // 比率計算（Ca:P = ?:1）
  const ratio =
    totalPhosphorus > 0 ? totalCalcium / totalPhosphorus : totalCalcium > 0 ? Infinity : 0;

  // 推奨比率: 1:1以上（Dr. Paul Mason）
  const optimalRatioMin = 1.0;

  // ステータス判定
  const getStatus = (): 'optimal' | 'warning' | 'low' => {
    if (totalCalcium === 0 && totalPhosphorus === 0) return 'low';
    if (ratio >= optimalRatioMin) return 'optimal';
    return 'warning'; // リン過多（骨代謝に悪影響）
  };

  const status = getStatus();

  const getStatusColor = () => {
    if (status === 'optimal') return '#34C759';
    if (status === 'warning') return '#FF3B30';
    return '#FF9500';
  };

  return (
    <div
      className="nutrient-gauge-container"
      onClick={onPress}
      style={{ cursor: onPress ? 'pointer' : 'default' }}
    >
      <div className="nutrient-gauge-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span className="nutrient-gauge-label">カルシウム:リン比率</span>
          <span style={{ fontSize: '10px', color: '#78716c' }}>
            骨代謝に重要（推奨: 1:1以上）。リン過多は骨密度低下のリスクがあります。
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span className="nutrient-gauge-value">
            {totalCalcium > 0 && totalPhosphorus > 0 ? (
              <>
                {ratio.toFixed(2)}:1 (Ca:P)
                {(previewCalcium > 0 || previewPhosphorus > 0) && (
                  <span style={{ color: '#3b82f6', marginLeft: '8px', fontSize: '0.9em' }}>
                    ({calcium.toFixed(0)}mg / {phosphorus.toFixed(0)}mg)
                  </span>
                )}
              </>
            ) : (
              <>
                {totalCalcium.toFixed(0)}mg / {totalPhosphorus.toFixed(0)}mg
                {(previewCalcium > 0 || previewPhosphorus > 0) && (
                  <span style={{ color: '#3b82f6', marginLeft: '8px', fontSize: '0.9em' }}>
                    (+{previewCalcium.toFixed(0)}mg / +{previewPhosphorus.toFixed(0)}mg)
                  </span>
                )}
              </>
            )}
          </span>
          {status === 'warning' && (
            <span
              style={{
                fontSize: '12px',
                cursor: 'pointer',
                color: '#FF3B30',
              }}
              title="リン過多は骨代謝に悪影響があります。乳製品や骨粉、卵殻の摂取を推奨します。"
            >
              ⚠️
            </span>
          )}
        </div>
      </div>
      <div className="nutrient-gauge-bar-container" style={{ position: 'relative' }}>
        <div
          className="nutrient-gauge-bar"
          style={{
            width: `${Math.min((ratio / optimalRatioMin) * 100, 100)}%`,
            backgroundColor: getStatusColor(),
            position: 'relative',
            zIndex: 2,
          }}
        />
      </div>
      {status === 'optimal' && ratio > 0 && (
        <div className="nutrient-gauge-status" style={{ color: '#34C759' }}>
          ✅ 推奨比率範囲内（1:1以上）
        </div>
      )}
      {status === 'warning' && (
        <div className="nutrient-gauge-status" style={{ color: '#FF3B30' }}>
          ⚠️ リン過多（骨代謝に悪影響）
        </div>
      )}
    </div>
  );
}
