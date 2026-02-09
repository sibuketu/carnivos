/**
 * Glycine:Methionine Ratio Gauge
 *
 * グリシン:メチオニン比率を表示
 * カーニボア重要：長寿の視点（Nose to Tail理論）
 */

import { useTranslation } from '../utils/i18n';
import './NutrientGauge.css';

interface GlycineMethionineRatioGaugeProps {
  glycine: number; // g
  methionine: number; // g
  previewGlycine?: number; // g（プレビュー）
  previewMethionine?: number; // g（プレビュー）
  onPress?: () => void;
}

export default function GlycineMethionineRatioGauge({
  glycine,
  methionine,
  previewGlycine = 0,
  previewMethionine = 0,
  onPress,
}: GlycineMethionineRatioGaugeProps) {
  const { t } = useTranslation();
  const totalGlycine = glycine + previewGlycine;
  const totalMethionine = methionine + previewMethionine;

  // 比率計算（Gly:Met = ?:1）
  const ratio =
    totalMethionine > 0 ? totalGlycine / totalMethionine : totalGlycine > 0 ? Infinity : 0;

  // 推奨比率: 1:1以上（カーニボアロジック）
  const optimalRatioMin = 1.0;

  // ステータス判定
  const getStatus = (): 'optimal' | 'warning' | 'low' => {
    if (totalGlycine === 0 && totalMethionine === 0) return 'low';
    if (ratio >= optimalRatioMin) return 'optimal';
    return 'warning'; // メチオニン過多（炎症や老化のリスク）
  };

  const status = getStatus();

  const getStatusColor = () => {
    if (status === 'optimal') return '#34C759';
    if (status === 'warning') return '#FF3B30';
    return '#FF9500';
  };

  // ボーンブロス提案メッセージ
  const getBoneBrothMessage = () => {
    if (status === 'warning' && totalMethionine > 0) {
      const neededGlycine = totalMethionine - totalGlycine;
      if (neededGlycine > 0) {
        return `ボーンブロスを追加してグリシンを${neededGlycine.toFixed(1)}g摂取することを推奨します（コラーゲン、皮、骨、軟骨由来）。`;
      }
    }
    return null;
  };

  const boneBrothMessage = getBoneBrothMessage();

  return (
    <div
      className="nutrient-gauge-container"
      onClick={onPress}
      style={{ cursor: onPress ? 'pointer' : 'default' }}
    >
      <div className="nutrient-gauge-header">
        <span className="nutrient-gauge-label">{t('gauge.glycineMethionine')}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span className="nutrient-gauge-value">
            {totalGlycine > 0 && totalMethionine > 0 ? (
              <>
                {ratio.toFixed(2)}:1 (Gly:Met)
                {(previewGlycine > 0 || previewMethionine > 0) && (
                  <span style={{ color: '#f43f5e', marginLeft: '8px', fontSize: '0.9em' }}>
                    ({glycine.toFixed(1)}g / {methionine.toFixed(1)}g)
                  </span>
                )}
              </>
            ) : (
              <>
                {totalGlycine.toFixed(1)}g / {totalMethionine.toFixed(1)}g
                {(previewGlycine > 0 || previewMethionine > 0) && (
                  <span style={{ color: '#f43f5e', marginLeft: '8px', fontSize: '0.9em' }}>
                    (+{previewGlycine.toFixed(1)}g / +{previewMethionine.toFixed(1)}g)
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
              title="メチオニン過多は炎症や老化につながる可能性があります。コラーゲン（グリシン）を追加することを推奨します。"
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
          ⚠️ メチオニン過多（コラーゲンを追加推奨）
        </div>
      )}
      {boneBrothMessage && (
        <div
          className="nutrient-gauge-hint"
          style={{
            marginTop: '8px',
            padding: '8px',
            backgroundColor: '#FFF3CD',
            borderRadius: '4px',
            fontSize: '0.9em',
            color: '#856404',
          }}
        >
          💡 {boneBrothMessage}
        </div>
      )}
    </div>
  );
}
