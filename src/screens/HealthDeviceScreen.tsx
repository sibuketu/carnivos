/**
 * CarnivOS - Health Device Screen
 *
 * ウェアラブルデバイス連携画面
 *
 * 注意: Webアプリでは直接的な連携は難しいため、手動入力機能を提供
 */

import { useState, useEffect } from 'react';
import { saveHealthData, getHealthData, type HealthData } from '../utils/healthDeviceSync';
import { getDailyLogByDate, saveDailyLog } from '../utils/storage';
import { getGoogleFitData, type GoogleFitData } from '../utils/googleFitService';
import { useTranslation } from '../utils/i18n';
import { logError } from '../utils/errorHandler';
import './HealthDeviceScreen.css';

interface HealthDeviceScreenProps {
  onBack: () => void;
}

export default function HealthDeviceScreen({ onBack }: HealthDeviceScreenProps) {
  const { t: _t } = useTranslation();
  const today = new Date().toISOString().split('T')[0];
  const [healthData, setHealthData] = useState<HealthData>(() => {
    const todayData = getHealthData(today);
    return todayData[0] || { date: today };
  });
  const [saved, setSaved] = useState(false);
  const [isLoadingGoogleFit, setIsLoadingGoogleFit] = useState(false);
  const [googleFitData, setGoogleFitData] = useState<GoogleFitData | null>(null);

  useEffect(() => {
    const todayData = getHealthData(today);
    if (todayData[0]) {
      setHealthData(todayData[0]);
    }
  }, [today]);

  // Google Fitからデータを取得（初回ロード時）
  useEffect(() => {
    const loadGoogleFitData = async () => {
      setIsLoadingGoogleFit(true);
      try {
        const data = await getGoogleFitData(today);
        if (data) {
          setGoogleFitData(data);
          // Google FitデータをhealthDataに反映
          setHealthData((prev) => ({
            ...prev,
            steps: data.steps,
            heartRate: data.heartRate,
            activeMinutes: data.activeMinutes,
            caloriesBurned: data.caloriesBurned,
          }));
        }
      } catch {
        // エラーは無視（手動入力にフォールバック）
        if (import.meta.env.DEV) {
          // 開発時のみログ可能
        }
      } finally {
        setIsLoadingGoogleFit(false);
      }
    };
    loadGoogleFitData();
  }, [today]);

  const handleSave = async () => {
    try {
      saveHealthData(healthData);
      // 体重・体脂肪があれば今日の日記（DailyLog）にも反映
      if (healthData.weight != null || healthData.bodyFatPercentage != null) {
        const dayLog = await getDailyLogByDate(today);
        const baseStatus = dayLog?.status ?? { sleepScore: 0, sunMinutes: 0, activityLevel: 'moderate' as const };
        const nextStatus = {
          ...baseStatus,
          ...(healthData.weight != null && { weight: healthData.weight }),
          ...(healthData.bodyFatPercentage != null && { bodyFatPercentage: healthData.bodyFatPercentage }),
        };
        await saveDailyLog({
          date: today,
          status: nextStatus,
          fuel: dayLog?.fuel ?? [],
          weight: healthData.weight,
          bodyFatPercentage: healthData.bodyFatPercentage,
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      logError(error, { component: 'HealthDeviceScreen', action: 'handleSave' });
      (window as unknown as { showToast?: (msg: string) => void }).showToast?.(t('healthDevice.saveFailed'));
    }
  };

  return (
    <div className="health-device-screen">
      <div className="health-device-container">
        <button onClick={onBack} className="health-device-back-button">
          {t('healthDevice.back')}
        </button>
        <h1 className="health-device-title">{t('healthDevice.title')}</h1>
        <p className="health-device-description">
          {t('healthDevice.description')}
        </p>
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={async () => {
              setIsLoadingGoogleFit(true);
              try {
                const data = await getGoogleFitData(today);
                if (data) {
                  setGoogleFitData(data);
                  setHealthData({
                    steps: data.steps,
                    heartRate: data.heartRate,
                    activeMinutes: data.activeMinutes,
                    caloriesBurned: data.caloriesBurned,
                  });
                }
              } catch {
                // エラーは無視
              } finally {
                setIsLoadingGoogleFit(false);
              }
            }}
            disabled={isLoadingGoogleFit}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f43f5e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isLoadingGoogleFit ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
            }}
          >
            {isLoadingGoogleFit ? t('healthDevice.loading') : t('healthDevice.fetchGoogleFit')}
          </button>
          {googleFitData && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
              {t('healthDevice.googleFitFetched')}
            </div>
          )}
        </div>

        <div className="health-device-form">
          <div className="health-device-input-group">
            <label className="health-device-label">
              {t('healthDevice.steps')}
              <input
                type="number"
                value={healthData.steps || ''}
                onChange={(e) =>
                  setHealthData({
                    ...healthData,
                    steps: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="例: 10000"
                min="0"
                className="health-device-input"
              />
            </label>
          </div>

          <div className="health-device-input-group">
            <label className="health-device-label">
              {t('healthDevice.heartRate')}
              <input
                type="number"
                value={healthData.heartRate || ''}
                onChange={(e) =>
                  setHealthData({
                    ...healthData,
                    heartRate: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="例: 70"
                min="0"
                max="220"
                className="health-device-input"
              />
            </label>
          </div>

          <div className="health-device-input-group">
            <label className="health-device-label">
              {t('healthDevice.activeMinutes')}
              <input
                type="number"
                value={healthData.activeMinutes || ''}
                onChange={(e) =>
                  setHealthData({
                    ...healthData,
                    activeMinutes: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="例: 30"
                min="0"
                className="health-device-input"
              />
            </label>
          </div>

          <div className="health-device-input-group">
            <label className="health-device-label">
              {t('healthDevice.caloriesBurned')}
              <input
                type="number"
                value={healthData.caloriesBurned || ''}
                onChange={(e) =>
                  setHealthData({
                    ...healthData,
                    caloriesBurned: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="例: 200"
                min="0"
                className="health-device-input"
              />
            </label>
          </div>

          <div className="health-device-input-group">
            <label className="health-device-label">
              {t('healthDevice.weight')}
              <input
                type="number"
                value={healthData.weight ?? ''}
                onChange={(e) =>
                  setHealthData({
                    ...healthData,
                    weight: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="例: 70"
                min="0"
                step="0.1"
                className="health-device-input"
              />
            </label>
          </div>

          <div className="health-device-input-group">
            <label className="health-device-label">
              {t('healthDevice.bodyFat')}
              <input
                type="number"
                value={healthData.bodyFatPercentage ?? ''}
                onChange={(e) =>
                  setHealthData({
                    ...healthData,
                    bodyFatPercentage: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="例: 20"
                min="0"
                max="100"
                step="0.1"
                className="health-device-input"
              />
            </label>
          </div>

          <button onClick={handleSave} className="health-device-save-button">
            {saved ? t('healthDevice.saved') : t('healthDevice.save')}
          </button>
        </div>

        <div className="health-device-info">
          <h3>{t('healthDevice.aboutIntegration')}</h3>
          <ul>
            <li>{t('healthDevice.weightNote')}</li>
            <li>{t('healthDevice.deviceApiNote')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
