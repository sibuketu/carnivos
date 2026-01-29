/**
 * Omega 3/6 Ratio Gauge
 *
 * オメガ3/6比率をシーソー表示で表示
 * カーニボア重要：炎症管理のための最重要指標
 */

import './NutrientGauge.css';

interface OmegaRatioGaugeProps {
  omega3: number; // g
  omega6: number; // g
  previewOmega3?: number; // g（プレビュー）
  previewOmega6?: number; // g（プレビュー）
  onPress?: () => void;
}

export default function OmegaRatioGauge({
  omega3,
  omega6,
  previewOmega3 = 0,
  previewOmega6 = 0,
  onPress,
}: OmegaRatioGaugeProps) {
  const totalOmega3 = omega3 + previewOmega3;
  const totalOmega6 = omega6 + previewOmega6;

  // 比率計算（6:3 = ?:1）
  const ratio = totalOmega3 > 0 ? totalOmega6 / totalOmega3 : totalOmega6 > 0 ? Infinity : 0;

  // 推奨比率: 1:1 〜 1:4（カーニボア推奨）
  const optimalRatioMin = 1;
  const optimalRatioMax = 4;

  // ステータス判定
  const getStatus = (): 'optimal' | 'warning' | 'low' => {
    if (totalOmega3 === 0 && totalOmega6 === 0) return 'low';
    if (ratio === 0) return 'optimal'; // オメガ3のみ（理想的）
    if (ratio >= optimalRatioMin && ratio <= optimalRatioMax) return 'optimal';
    if (ratio > optimalRatioMax) return 'warning'; // オメガ6過多（炎症リスク）
    return 'low'; // オメガ3過多（問題なしだが表示用）
  };

  const status = getStatus();

  const getStatusColor = () => {
    if (status === 'optimal') return '#34C759';
    if (status === 'warning') return '#FF3B30';
    return '#FF9500';
  };

  // シーソー表示用のパーセンテージ
  const total = totalOmega3 + totalOmega6;
  const omega3Percent = total > 0 ? (totalOmega3 / total) * 100 : 0;
  const omega6Percent = total > 0 ? (totalOmega6 / total) * 100 : 0;

  return (
    <div
      className="nutrient-gauge-container"
      onClick={onPress}
      style={{ cursor: onPress ? 'pointer' : 'default' }}
    >
      <div className="nutrient-gauge-header">
        <span className="nutrient-gauge-label">オメガ3/6比率</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span className="nutrient-gauge-value">
            {totalOmega3 > 0 && totalOmega6 > 0 ? (
              <>
                {ratio.toFixed(2)}:1 (Ω6:Ω3)
                {(previewOmega3 > 0 || previewOmega6 > 0) && (
                  <span style={{ color: '#3b82f6', marginLeft: '8px', fontSize: '0.9em' }}>
                    ({totalOmega3.toFixed(2)}g / {totalOmega6.toFixed(2)}g)
                  </span>
                )}
              </>
            ) : (
              <>
                {totalOmega3.toFixed(2)}g / {totalOmega6.toFixed(2)}g
                {(previewOmega3 > 0 || previewOmega6 > 0) && (
                  <span style={{ color: '#3b82f6', marginLeft: '8px', fontSize: '0.9em' }}>
                    (+{previewOmega3.toFixed(2)}g / +{previewOmega6.toFixed(2)}g)
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
              title="オメガ6過多は炎症の原因になります。牧草牛や魚介類を増やすことを推奨します。"
            >
              ⚠️
            </span>
          )}
        </div>
      </div>
      {/* シーソー表示 */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '24px',
          borderRadius: '4px',
          overflow: 'hidden',
          marginTop: '8px',
        }}
      >
        {/* オメガ3（左側、緑） */}
        <div
          style={{
            width: `${omega3Percent}%`,
            backgroundColor: '#34C759',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          {omega3Percent > 10 && 'Ω3'}
        </div>
        {/* オメガ6（右側、赤） */}
        <div
          style={{
            width: `${omega6Percent}%`,
            backgroundColor: status === 'warning' ? '#FF3B30' : '#FF9500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          {omega6Percent > 10 && 'Ω6'}
        </div>
      </div>
      {status === 'optimal' && ratio > 0 && (
        <div className="nutrient-gauge-status" style={{ color: '#34C759' }}>
          ✅ 推奨比率範囲内（1:1 〜 1:4）
        </div>
      )}
      {status === 'warning' && (
        <div className="nutrient-gauge-status" style={{ color: '#FF3B30' }}>
          ⚠️ オメガ6過多（炎症リスク）
        </div>
      )}
    </div>
  );
}
