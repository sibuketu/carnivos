/**
 * CarnivOS - Salt Settings Screen
 *
 * 塩ミル設定画面
 */

import { useState, useEffect } from 'react';
import { useUserConfig } from '../hooks/useUserConfig';
import HelpTooltip from '../components/common/HelpTooltip';
import { useTranslation } from '../utils/i18n';
import './SaltSettingsScreen.css';

interface SaltSettingsScreenProps {
  onBack: () => void;
}

export default function SaltSettingsScreen({ onBack }: SaltSettingsScreenProps) {
  const { t } = useTranslation();
  const { config, updateConfig } = useUserConfig();
  const [saltType, setSaltType] = useState<
    'table_salt' | 'sea_salt' | 'himalayan_salt' | 'celtic_salt'
  >(config.saltType || 'table_salt');
  const [saltUnitWeight, setSaltUnitWeight] = useState<number>(config.saltUnitWeight || 0.5);

  useEffect(() => {
    setSaltType(config.saltType || 'table_salt');
    setSaltUnitWeight(config.saltUnitWeight || 0.5);
  }, [config]);

  const handleSaltTypeChange = (
    type: 'table_salt' | 'sea_salt' | 'himalayan_salt' | 'celtic_salt'
  ) => {
    setSaltType(type);
    updateConfig({ saltType: type });
  };

  const handleUnitWeightChange = (value: number) => {
    const newValue = Math.max(0.1, Math.min(10, value));
    setSaltUnitWeight(newValue);
    updateConfig({ saltUnitWeight: newValue });
  };

  const saltTypes = [
    {
      code: 'table_salt' as const,
      name: '食卓塩',
      description: '一般的な精製塩。ナトリウム含有量が高い。',
    },
    {
      code: 'sea_salt' as const,
      name: '海塩',
      description: '海水から作られた塩。ミネラルが豊富。',
    },
    {
      code: 'himalayan_salt' as const,
      name: 'ヒマラヤ塩',
      description: 'ヒマラヤ山脈の岩塩。84種類のミネラルを含む。',
    },
    {
      code: 'celtic_salt' as const,
      name: 'ケルト塩',
      description: 'フランスのケルト地方の海塩。マグネシウムが豊富。',
    },
  ];

  return (
    <div className="salt-settings-screen-container">
      <div className="salt-settings-screen-content">
        <div className="screen-header">
          <button className="back-button" onClick={onBack} aria-label={t('common.backAriaLabel')}>
            ←
          </button>
          <h1 className="screen-header-title">塩ミル設定</h1>
        </div>

        <div className="salt-settings-screen-section">
          <h2 className="salt-settings-screen-section-title">
            塩の種類
            <HelpTooltip text="塩の種類によってナトリウム含有量が異なります。正確な栄養素計算のため、使用している塩の種類を選択してください。" />
          </h2>
          <div className="salt-settings-screen-button-group">
            {saltTypes.map((type) => (
              <button
                key={type.code}
                className={`salt-settings-screen-button ${saltType === type.code ? 'active' : ''}`}
                onClick={() => handleSaltTypeChange(type.code)}
                aria-label={`${type.name}を選択`}
                aria-current={saltType === type.code ? 'true' : 'false'}
              >
                <div className="salt-settings-screen-button-name">{type.name}</div>
                <div className="salt-settings-screen-button-description">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="salt-settings-screen-section">
          <h2 className="salt-settings-screen-section-title">
            1削りあたりの量 (g)
            <HelpTooltip text="塩ミルを1回回したときの塩の重量（g）を設定します。デフォルトは0.5gです。" />
          </h2>
          <div className="salt-settings-screen-input-group">
            <input
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              value={saltUnitWeight}
              onChange={(e) => handleUnitWeightChange(parseFloat(e.target.value) || 0.5)}
              className="salt-settings-screen-input"
              aria-label="1削りあたりの塩の重量"
            />
            <span className="salt-settings-screen-input-unit">g</span>
          </div>
          <p className="salt-settings-screen-hint">デフォルト: 0.5g/削り</p>
          <button
            className="salt-settings-screen-reset-button"
            onClick={() => handleUnitWeightChange(0.5)}
          >
            デフォルトに戻す
          </button>
        </div>
      </div>
    </div>
  );
}
