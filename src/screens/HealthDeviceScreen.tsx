/**
 * Primal Logic - Health Device Screen
 *
 * ウェアラブルデバイス連携画面
 *
 * 注意: Webアプリでは直接的な連携は難しいため、手動入力機能を提供
 */

import { useState, useEffect } from 'react';
import { saveHealthData, getHealthData, type HealthData } from '../utils/healthDeviceSync';
import { getGoogleFitData, type GoogleFitData } from '../utils/googleFitService';
import { useTranslation } from '../utils/i18n';
import { logError } from '../utils/errorHandler';
import './HealthDeviceScreen.css';

interface HealthDeviceScreenProps {
  onBack: () => void;
}

export default function HealthDeviceScreen({ onBack }: HealthDeviceScreenProps) {
  const { t } = useTranslation();
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
      } catch (error) {
        // エラーは無視（手動入力にフォールバック）
        if (import.meta.env.DEV) {
          console.log('Google Fit data fetch failed:', error);
        }
      } finally {
        setIsLoadingGoogleFit(false);
      }
    };
    loadGoogleFitData();
  }, [today]);

  const handleSave = () => {
    try {
      saveHealthData(healthData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      logError(error, { component: 'HealthDeviceScreen', action: 'handleSave' });
      alert('データの保存に失敗しました');
    }
  };

  return (
    <div className="health-device-screen">
      <div className="health-device-container">
        <button onClick={onBack} className="health-device-back-button">
          ← 戻る
        </button>
        <h1 className="health-device-title">健康デバイス連携</h1>
        <p className="health-device-description">
          Webアプリでは直接的な連携は難しいため、手動で入力できます。
          将来的にモバイルアプリ（Expo）でApple Health、Google Fitとの連携を実装予定です。
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
              } catch (error) {
                // エラーは無視
              } finally {
                setIsLoadingGoogleFit(false);
              }
            }}
            disabled={isLoadingGoogleFit}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isLoadingGoogleFit ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
            }}
          >
            {isLoadingGoogleFit ? '読み込み中...' : '🔄 Google Fitから取得'}
          </button>
          {googleFitData && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
              Google Fitデータを取得しました
            </div>
          )}
        </div>

        <div className="health-device-form">
          <div className="health-device-input-group">
            <label className="health-device-label">
              歩数
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
              心拍数 (bpm)
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
              活動時間 (分)
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
              消費カロリー (kcal)
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

          <button onClick={handleSave} className="health-device-save-button">
            {saved ? '✓ 保存しました' : '保存'}
          </button>
        </div>

        <div className="health-device-info">
          <h3>将来実装予定</h3>
          <ul>
            <li>Apple Health連携（iOS）</li>
            <li>Google Fit連携（Android）</li>
            <li>自動データ同期</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
