import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getDailyLogs, getDailyLogByDate, saveDailyLog } from '../utils/storage';
import { calculateAllMetrics } from '../utils/nutrientCalculator';
import { useTranslation } from '../utils/i18n';
import { logError, getUserFriendlyErrorMessage } from '../utils/errorHandler';
import type { DailyLog, DailyStatus } from '../types';
import './DiaryScreen.css';

type DiaryScreenProps = {
  onBack: () => void;
};

type MetricCategory = 'favorites' | 'all' | 'physical' | 'mental' | 'sleep' | 'social' | 'environment';

interface MetricDefinition {
  id: keyof DailyStatus | string; // string for nested paths
  label: string;
  type: 'number' | 'slider' | 'select' | 'boolean' | 'time' | 'text';
  category: MetricCategory;
  options?: string[]; // For select
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  connectable?: boolean; // If true, shows "Connect" button
}

const METRICS: MetricDefinition[] = [
  // Physical
  { id: 'weight', label: '体重', type: 'number', unit: 'kg', category: 'physical', connectable: true },
  { id: 'bodyFatPercentage', label: '体脂肪率', type: 'number', unit: '%', category: 'physical', connectable: true },
  { id: 'bodyTemperature', label: '体温', type: 'number', unit: '℃', category: 'physical', step: 0.1, connectable: true },
  { id: 'heartRate', label: '安静時心拍数', type: 'number', unit: 'bpm', category: 'physical', connectable: true },
  { id: 'energyLevel', label: 'エネルギーレベル', type: 'slider', min: 1, max: 10, category: 'physical' },
  { id: 'physicalFatigue', label: '身体的疲労感', type: 'slider', min: 1, max: 10, category: 'physical' },
  { id: 'muscleSoreness', label: '筋肉痛', type: 'slider', min: 1, max: 10, category: 'physical' },
  { id: 'bowelMovement.status', label: '便通', type: 'select', options: ['normal', 'constipated', 'loose', 'watery'], category: 'physical' },
  { id: 'libido', label: '性欲', type: 'slider', min: 1, max: 10, category: 'physical' },

  // Mental
  { id: 'mood', label: '気分', type: 'select', options: ['great', 'good', 'neutral', 'bad', 'terrible'], category: 'mental' },
  { id: 'focus', label: '集中力', type: 'slider', min: 1, max: 10, category: 'mental' },
  { id: 'anxiety', label: '不安', type: 'slider', min: 1, max: 10, category: 'mental' },
  { id: 'motivation', label: 'やる気', type: 'slider', min: 1, max: 10, category: 'mental' },
  { id: 'brainFog', label: 'ブレインフォグ', type: 'slider', min: 1, max: 10, category: 'mental' },
  { id: 'stressLevel', label: 'ストレスレベル', type: 'select', options: ['low', 'medium', 'high'], category: 'mental', connectable: true },

  // Sleep
  { id: 'sleepScore', label: '睡眠スコア', type: 'slider', min: 0, max: 100, category: 'sleep', connectable: true },
  { id: 'sleepHours', label: '睡眠時間', type: 'number', unit: 'h', category: 'sleep', step: 0.5, connectable: true },
  { id: 'bedTime', label: '就床時刻', type: 'time', category: 'sleep', connectable: true },
  { id: 'wakeTime', label: '起床時刻', type: 'time', category: 'sleep', connectable: true },
  { id: 'deepSleep', label: '深い睡眠', type: 'number', unit: 'min', category: 'sleep', connectable: true },
  { id: 'snoring', label: 'いびき', type: 'boolean', category: 'sleep', connectable: true },

  // Social
  { id: 'socialInteractions', label: '社交頻度', type: 'slider', min: 0, max: 10, category: 'social' },
  { id: 'loneliness', label: '孤独感', type: 'slider', min: 1, max: 10, category: 'social' },
  { id: 'socialSatisfaction', label: '社交満足度', type: 'slider', min: 1, max: 10, category: 'social' },
  { id: 'sharedMeal', label: '誰かと食事', type: 'boolean', category: 'social' },
  { id: 'partnerIntimacy', label: 'パートナーとの時間', type: 'boolean', category: 'social' },

  // Environment
  { id: 'weather', label: '天気', type: 'select', options: ['sunny', 'cloudy', 'rainy', 'snowy'], category: 'environment', connectable: true },
  { id: 'sunMinutes', label: '日光浴', type: 'number', unit: 'min', category: 'environment' },
  { id: 'coldExposureMinutes', label: '寒冷暴露', type: 'number', unit: 'min', category: 'environment' },
  { id: 'saunaMinutes', label: 'サウナ', type: 'number', unit: 'min', category: 'environment' },
  { id: 'meditationMinutes', label: '瞑想', type: 'number', unit: 'min', category: 'environment' },
];

export default function DiaryScreen({ onBack }: DiaryScreenProps) {
  const { t } = useTranslation();
  const { userProfile, loadTodayLog } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const [diary, setDiary] = useState('');
  const [selectedDate, setSelectedDate] = useState(today);
  const [metrics, setMetrics] = useState<Partial<DailyStatus>>({});
  const [activeTab, setActiveTab] = useState<MetricCategory>('favorites');
  const [favorites, setFavorites] = useState<string[]>([
    'weight', 'sleepScore', 'mood', 'energyLevel', 'bowelMovement.status'
  ]);
  const [isSaving, setIsSaving] = useState(false);

  // Load favorites from local storage
  useEffect(() => {
    const savedFavs = localStorage.getItem('primal_logic_metric_favorites');
    if (savedFavs) {
      setFavorites(JSON.parse(savedFavs));
    }
  }, []);

  const loadDateLog = async () => {
    try {
      const log = await getDailyLogByDate(selectedDate);
      if (log) {
        setDiary(log.diary || '');
        setMetrics(log.status || {});
      } else {
        setDiary('');
        setMetrics({});
      }
    } catch (error) {
      logError(error, { component: 'DiaryScreen', action: 'loadDateLog' });
    }
  };

  useEffect(() => {
    loadDateLog();
  }, [selectedDate]);

  const handleMetricChange = (id: string, value: any) => {
    setMetrics((prev) => {
      if (id.includes('.')) {
        const [parent, child] = id.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof DailyStatus] as any || {}),
            [child]: value,
          },
        };
      }
      return { ...prev, [id]: value };
    });
  };

  const toggleFavorite = (id: string) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(newFavorites);
    localStorage.setItem('primal_logic_metric_favorites', JSON.stringify(newFavorites));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const existingLog = await getDailyLogByDate(selectedDate);

      // マージロジック
      const baseStatus = existingLog?.status || {
        sleepScore: 0,
        sunMinutes: 0,
        activityLevel: 'moderate',
      };

      const updatedStatus: DailyStatus = {
        ...baseStatus,
        ...metrics,
      } as DailyStatus; // 強制キャスト (PartialをDailyStatusに)

      const logToSave: DailyLog = existingLog ? {
        ...existingLog,
        diary: diary.trim(),
        status: updatedStatus,
      } : {
        date: selectedDate,
        status: updatedStatus,
        fuel: [],
        calculatedMetrics: calculateAllMetrics([], userProfile || undefined),
        diary: diary.trim(),
      };

      await saveDailyLog(logToSave);

      if (selectedDate === today) {
        await loadTodayLog();
        window.dispatchEvent(new CustomEvent('dailyLogUpdated'));
      }
    } catch (error) {
      logError(error, { component: 'DiaryScreen', action: 'handleSave' });
      alert(t('diary.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const getMetricValue = (id: string) => {
    if (id.includes('.')) {
      const [parent, child] = id.split('.');
      return (metrics[parent as keyof DailyStatus] as any)?.[child];
    }
    return metrics[id as keyof DailyStatus];
  };

  const renderMetricInput = (metric: MetricDefinition) => {
    const value = getMetricValue(metric.id);
    const isFav = favorites.includes(metric.id);

    return (
      <div key={metric.id} className="metric-item">
        <div className="metric-row">
          <div className="metric-label-group">
            <span className="metric-label">{metric.label}</span>
            {metric.connectable && (
              <button className="connect-button" title="デバイス連携 (未実装)">
                🔗
              </button>
            )}
          </div>

          <button
            className={`favorite-toggle ${isFav ? 'active' : ''}`}
            onClick={() => toggleFavorite(metric.id)}
          >
            ★
          </button>
        </div>

        <div className="metric-input-container">
          {metric.type === 'slider' && (
            <div className="slider-wrapper">
              <input
                type="range"
                min={metric.min}
                max={metric.max}
                value={value || metric.min}
                onChange={(e) => handleMetricChange(metric.id, Number(e.target.value))}
                className="metric-slider"
              />
              <span className="slider-value">{value || '-'}</span>
            </div>
          )}

          {metric.type === 'number' && (
            <div className="number-wrapper">
              <input
                type="number"
                step={metric.step || 1}
                value={value || ''}
                onChange={(e) => handleMetricChange(metric.id, Number(e.target.value))}
                className="metric-number-input"
              />
              <span className="metric-unit">{metric.unit}</span>
            </div>
          )}

          {metric.type === 'select' && (
            <select
              value={value || ''}
              onChange={(e) => handleMetricChange(metric.id, e.target.value)}
              className="metric-select"
            >
              <option value="">選択</option>
              {metric.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}

          {metric.type === 'boolean' && (
            <div className="toggle-wrapper">
              <button
                className={`toggle-btn ${value === true ? 'active' : ''}`}
                onClick={() => handleMetricChange(metric.id, !value)}
              >
                {value ? 'YES' : 'NO'}
              </button>
            </div>
          )}

          {metric.type === 'time' && (
            <input
              type="time"
              value={value || ''}
              onChange={(e) => handleMetricChange(metric.id, e.target.value)}
              className="metric-time-input"
            />
          )}
        </div>
      </div>
    );
  };

  const displayedMetrics = activeTab === 'all'
    ? METRICS
    : activeTab === 'favorites'
      ? METRICS.filter(m => favorites.includes(m.id))
      : METRICS.filter(m => m.category === activeTab);

  return (
    <div className="diary-screen-container">
      <div className="diary-screen-header">
        <button onClick={onBack} className="back-button">←</button>
        <h1 className="diary-screen-title">Daily Log</h1>
        <div className="date-selector">
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </div>
      </div>

      <div className="diary-tabs">
        <button className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => setActiveTab('favorites')}>★ お気に入り</button>
        <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>すべて</button>
        <button className={`tab-btn ${activeTab === 'physical' ? 'active' : ''}`} onClick={() => setActiveTab('physical')}>身体</button>
        <button className={`tab-btn ${activeTab === 'mental' ? 'active' : ''}`} onClick={() => setActiveTab('mental')}>メンタル</button>
        <button className={`tab-btn ${activeTab === 'sleep' ? 'active' : ''}`} onClick={() => setActiveTab('sleep')}>睡眠</button>
        <button className={`tab-btn ${activeTab === 'social' ? 'active' : ''}`} onClick={() => setActiveTab('social')}>社交</button>
        <button className={`tab-btn ${activeTab === 'environment' ? 'active' : ''}`} onClick={() => setActiveTab('environment')}>環境</button>
      </div>

      <div className="diary-content-scroll">
        <div className="metrics-grid">
          {displayedMetrics.length > 0 ? (
            displayedMetrics.map(renderMetricInput)
          ) : (
            <div className="empty-state">
              {activeTab === 'favorites' ? 'お気に入りが登録されていません。★を押して追加してください。' : '項目がありません'}
            </div>
          )}
        </div>

        <div className="diary-text-section">
          <h3>自由記述日記</h3>
          <textarea
            value={diary}
            onChange={(e) => setDiary(e.target.value)}
            placeholder="今日の出来事、体調詳細、食べたものの感想など..."
            rows={6}
            className="diary-textarea"
          />
        </div>

        <button onClick={handleSave} className="save-log-button" disabled={isSaving}>
          {isSaving ? '保存中...' : '記録を保存'}
        </button>
      </div>
    </div>
  );
}
