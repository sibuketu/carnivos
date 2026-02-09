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
      name: t('salt.tableSalt'),
      description: t('salt.tableSaltDesc'),
    },
    {
      code: 'sea_salt' as const,
      name: t('salt.seaSalt'),
      description: t('salt.seaSaltDesc'),
    },
    {
      code: 'himalayan_salt' as const,
      name: t('salt.himalayanSalt'),
      description: t('salt.himalayanSaltDesc'),
    },
    {
      code: 'celtic_salt' as const,
      name: t('salt.celticSalt'),
      description: t('salt.celticSaltDesc'),
    },
  ];

  return (
    <div className="salt-settings-screen-container">
      <div className="salt-settings-screen-content">
        <div className="screen-header">
          <button className="back-button" onClick={onBack} aria-label={t('common.backAriaLabel')}>
            ←
          </button>
          <h1 className="screen-header-title">{t('salt.title')}</h1>
        </div>

        <div className="salt-settings-screen-section">
          <h2 className="salt-settings-screen-section-title">
            {t('salt.saltType')}
            <HelpTooltip text={t('salt.saltTypeTooltip')} />
          </h2>
          <div className="salt-settings-screen-button-group">
            {saltTypes.map((type) => (
              <button
                key={type.code}
                className={`salt-settings-screen-button ${saltType === type.code ? 'active' : ''}`}
                onClick={() => handleSaltTypeChange(type.code)}
                aria-label={type.name}
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
            {t('salt.grindAmount')}
            <HelpTooltip text={t('salt.grindAmountTooltip')} />
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
              aria-label={t('salt.grindAmountAriaLabel')}
            />
            <span className="salt-settings-screen-input-unit">g</span>
          </div>
          <p className="salt-settings-screen-hint">{t('salt.defaultHint')}</p>
          <button
            className="salt-settings-screen-reset-button"
            onClick={() => handleUnitWeightChange(0.5)}
          >
            {t('salt.resetDefault')}
          </button>
        </div>
      </div>
    </div>
  );
}
