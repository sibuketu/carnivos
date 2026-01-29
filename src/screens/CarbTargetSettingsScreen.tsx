/**
 * Primal Logic - Carbohydrate Target Settings Screen
 *
 * 炭水化物ターゲット設定画面
 */

import { useState, useEffect } from 'react';
import { useUserConfig } from '../hooks/useUserConfig';
import HelpTooltip from '../components/common/HelpTooltip';
import { useTranslation } from '../utils/i18n';
import './CarbTargetSettingsScreen.css';

interface CarbTargetSettingsScreenProps {
  onBack: () => void;
}

export default function CarbTargetSettingsScreen({ onBack }: CarbTargetSettingsScreenProps) {
  const { t } = useTranslation();
  const { config, updateConfig } = useUserConfig();
  const [targetCarbs, setTargetCarbs] = useState<number>(config.targetCarbs || 0);

  useEffect(() => {
    setTargetCarbs(config.targetCarbs || 0);
  }, [config]);

  const handleTargetCarbsChange = (value: number) => {
    const newValue = Math.max(0, Math.min(100, value));
    setTargetCarbs(newValue);
    updateConfig({ targetCarbs: newValue });
  };

  const presetValues = [0, 20, 50, 100];

  return (
    <div className="carb-target-settings-screen-container">
      <div className="carb-target-settings-screen-content">
        <div className="screen-header">
          <button className="back-button" onClick={onBack} aria-label={t('common.backAriaLabel')}>
            ←
          </button>
          <h1 className="screen-header-title">炭水化物ターゲット設定</h1>
        </div>

        <div className="carb-target-settings-screen-section">
          <h2 className="carb-target-settings-screen-section-title">
            1日の炭水化物目標値 (g)
            <HelpTooltip text="カーニボアダイエットでは通常0gを目標としますが、ケトボアや移行期間中は20-50g程度を許可することもあります。厳格なカーニボアの場合は0gに設定してください。" />
          </h2>
          <p className="carb-target-settings-screen-description">
            カーニボアダイエットでは通常0gを目標とします。ケトボアや移行期間中は20-50g程度を許可することもあります。
          </p>

          <div className="carb-target-settings-screen-input-group">
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={targetCarbs}
              onChange={(e) => handleTargetCarbsChange(parseFloat(e.target.value) || 0)}
              className="carb-target-settings-screen-input"
              aria-label="1日の炭水化物目標値"
            />
            <span className="carb-target-settings-screen-input-unit">g</span>
          </div>

          <div className="carb-target-settings-screen-presets">
            <p className="carb-target-settings-screen-presets-label">プリセット:</p>
            <div className="carb-target-settings-screen-preset-buttons">
              {presetValues.map((value) => (
                <button
                  key={value}
                  className={`carb-target-settings-screen-preset-button ${
                    targetCarbs === value ? 'active' : ''
                  }`}
                  onClick={() => handleTargetCarbsChange(value)}
                  aria-label={`${value}gを選択`}
                >
                  {value}g
                </button>
              ))}
            </div>
          </div>

          <div className="carb-target-settings-screen-info">
            {targetCarbs === 0 ? (
              <div className="carb-target-settings-screen-info-item">
                <span className="carb-target-settings-screen-info-icon">🥩</span>
                <span>厳格なカーニボアモード: 炭水化物は0gを目標とします。</span>
              </div>
            ) : targetCarbs <= 20 ? (
              <div className="carb-target-settings-screen-info-item">
                <span className="carb-target-settings-screen-info-icon">🌿</span>
                <span>ケトボアモード: 少量の低炭水化物植物を許可します。</span>
              </div>
            ) : (
              <div className="carb-target-settings-screen-info-item">
                <span className="carb-target-settings-screen-info-icon">🔄</span>
                <span>移行期間モード: 炭水化物を段階的に減らしていきます。</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
