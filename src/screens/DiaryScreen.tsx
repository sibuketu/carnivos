import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getDailyLogByDate, saveDailyLog } from '../utils/storage';
import { calculateAllMetrics } from '../utils/nutrientCalculator';
import { useTranslation } from '../utils/i18n';
import { logError } from '../utils/errorHandler';
import { useTrophyProgress } from '../hooks/useTrophyProgress';
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
  { id: 'weight', label: 'Weight', labelKey: 'diary.metric.weight', type: 'number', unit: 'kg', category: 'physical', connectable: true },
  { id: 'bodyFatPercentage', label: 'Body fat %', type: 'number', unit: '%', category: 'physical', connectable: true },
  { id: 'bodyTemperature', label: 'Body temp', type: 'number', unit: '℃', category: 'physical', step: 0.1, connectable: true },
  { id: 'heartRate', label: 'Resting HR', type: 'number', unit: 'bpm', category: 'physical', connectable: true },
  { id: 'systolicBloodPressure', label: 'Blood pressure (systolic)', type: 'number', unit: 'mmHg', category: 'physical', connectable: true },
  { id: 'diastolicBloodPressure', label: 'Blood pressure (diastolic)', type: 'number', unit: 'mmHg', category: 'physical', connectable: true },
  { id: 'energyLevel', label: 'Energy level', type: 'slider', min: 1, max: 10, category: 'physical' },
  { id: 'physicalFatigue', label: 'Physical fatigue', type: 'slider', min: 1, max: 10, category: 'physical' },
  { id: 'muscleSoreness', label: 'Muscle soreness', type: 'slider', min: 1, max: 10, category: 'physical' },
  { id: 'jointPain', label: 'Joint pain', type: 'slider', min: 1, max: 10, category: 'physical' },
  { id: 'headache', label: 'Headache', type: 'slider', min: 1, max: 10, category: 'physical' },
  { id: 'exerciseMinutes', label: 'Exercise time', type: 'number', unit: 'min', category: 'physical' },
  { id: 'exerciseIntensity', label: 'Exercise intensity', type: 'select', options: ['none', 'light', 'moderate', 'intense'], category: 'physical' },
  { id: 'bowelMovement.status', label: 'Bowel movement', type: 'select', options: ['normal', 'constipated', 'loose', 'watery'], category: 'physical' },
  { id: 'skinCondition', label: 'Skin condition', type: 'select', options: ['good', 'dry', 'oily', 'acne', 'rash'], category: 'physical' },
  { id: 'libido', label: 'Libido', type: 'slider', min: 1, max: 10, category: 'physical' },

  // Mental
  { id: 'mood', label: 'Mood', type: 'select', options: ['great', 'good', 'neutral', 'bad', 'terrible'], category: 'mental' },
  { id: 'focus', label: 'Focus', type: 'slider', min: 1, max: 10, category: 'mental' },
  { id: 'anxiety', label: 'Anxiety', type: 'slider', min: 1, max: 10, category: 'mental' },
  { id: 'depression', label: 'Depression', type: 'slider', min: 1, max: 10, category: 'mental' },
  { id: 'motivation', label: 'Motivation', type: 'slider', min: 1, max: 10, category: 'mental' },
  { id: 'brainFog', label: 'Brain fog', type: 'slider', min: 1, max: 10, category: 'mental' },
  { id: 'stressLevel', label: 'Stress level', type: 'select', options: ['low', 'medium', 'high'], category: 'mental', connectable: true },

  // Sleep
  { id: 'sleepScore', label: 'Sleep score', type: 'slider', min: 0, max: 100, category: 'sleep', connectable: true },
  { id: 'sleepHours', label: 'Sleep hours', type: 'number', unit: 'h', category: 'sleep', step: 0.5, connectable: true },
  { id: 'bedTime', label: 'Bedtime', type: 'time', category: 'sleep', connectable: true },
  { id: 'wakeTime', label: 'Wake time', type: 'time', category: 'sleep', connectable: true },
  { id: 'deepSleep', label: 'Deep sleep', type: 'number', unit: 'min', category: 'sleep', connectable: true },
  { id: 'sleepLatency', label: 'Sleep latency', type: 'number', unit: 'min', category: 'sleep', connectable: true },
  { id: 'awakeCount', label: 'Night awakenings', type: 'number', unit: 'times', category: 'sleep', connectable: true },
  { id: 'snoring', label: 'Snoring', type: 'boolean', category: 'sleep', connectable: true },

  // Social
  { id: 'socialInteractions', label: 'Social interactions', type: 'slider', min: 0, max: 10, category: 'social' },
  { id: 'loneliness', label: 'Loneliness', type: 'slider', min: 1, max: 10, category: 'social' },
  { id: 'socialSatisfaction', label: 'Social satisfaction', type: 'slider', min: 1, max: 10, category: 'social' },
  { id: 'sharedMeal', label: 'Shared meal', type: 'boolean', category: 'social' },
  { id: 'partnerIntimacy', label: 'Partner intimacy', type: 'boolean', category: 'social' },

  // Environment
  { id: 'weather', label: 'Weather', type: 'select', options: ['sunny', 'cloudy', 'rainy', 'snowy'], category: 'environment', connectable: true },
  { id: 'sunMinutes', label: 'Sun exposure', type: 'number', unit: 'min', category: 'environment' },
  { id: 'temperature', label: 'Room temp', type: 'number', unit: '℃', category: 'environment', step: 0.5 },
  { id: 'humidity', label: 'Humidity', type: 'number', unit: '%', category: 'environment' },
  { id: 'coldExposureMinutes', label: 'Cold exposure', type: 'number', unit: 'min', category: 'environment' },
  { id: 'saunaMinutes', label: 'Sauna', type: 'number', unit: 'min', category: 'environment' },
  { id: 'meditationMinutes', label: 'Meditation', type: 'number', unit: 'min', category: 'environment' },

  // Other
  { id: 'fastingHours', label: 'Fasting hours', type: 'number', unit: 'h', category: 'physical', step: 0.5 },
  { id: 'glucose', label: 'Blood glucose', type: 'number', unit: 'mg/dL', category: 'physical', connectable: true },
];

export default function DiaryScreen({ onBack }: DiaryScreenProps) {
  const { t } = useTranslation();
  const { userProfile, loadTodayLog } = useApp();
  const { updateProgress: updateTrophyProgress } = useTrophyProgress();
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

  const handleMetricChange = (id: string, value: number | string | boolean) => {
    setMetrics((prev) => {
      if (id.includes('.')) {
        const [parent, child] = id.split('.');
        const parentObj = prev[parent as keyof DailyStatus];
        const base = (parentObj && typeof parentObj === 'object' ? parentObj as Record<string, unknown> : {}) as Record<string, unknown>;
        return {
          ...prev,
          [parent]: {
            ...base,
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

      // 内省家トロフィー進捗更新（Diaryに3回書き込み）
      if (diary.trim().length > 0) {
        updateTrophyProgress('reflector');
      }

      if (selectedDate === today) {
        await loadTodayLog();
        window.dispatchEvent(new CustomEvent('dailyLogUpdated'));
      }
    } catch (error) {
      logError(error, { component: 'DiaryScreen', action: 'handleSave' });
      (window as unknown as { showToast?: (msg: string) => void }).showToast?.(t('diary.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const getMetricValue = (id: string) => {
    if (id.includes('.')) {
      const [parent, child] = id.split('.');
      const parentVal = metrics[parent as keyof DailyStatus];
      return (parentVal && typeof parentVal === 'object' && parentVal !== null && child in parentVal)
        ? (parentVal as Record<string, unknown>)[child]
        : undefined;
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
            <span className="metric-label">{t('diary.metric.' + String(metric.id).split('.')[0])}</span>
            {metric.connectable && (
              <button
                type="button"
                className="connect-button"
                title="デバイス連携"
                onClick={() => window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'healthDevice' }))}
              >
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
              <option value="">{t('diary.selectPlaceholder')}</option>
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
        <h1 className="diary-screen-title">{t('diary.screenTitle')}</h1>
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
              {activeTab === 'favorites' ? t('diary.emptyFavorites') : t('diary.emptyItems')}
            </div>
          )}
        </div>

        <div className="diary-text-section">
          <h3>{t('diary.freeFormTitle')}</h3>
          <textarea
            value={diary}
            onChange={(e) => setDiary(e.target.value)}
            placeholder={t('diary.freeFormPlaceholder')}
            rows={6}
            className="diary-textarea"
          />
        </div>

        <button onClick={handleSave} className="save-log-button" disabled={isSaving}>
          {isSaving ? t('diary.saving') : t('diary.saveRecord')}
        </button>
      </div>
    </div>
  );
}
