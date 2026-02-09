/**
 * Stats Screen - 統計・グラフ表示画面
 *
 * 栄養素の推移グラフ、体重推移グラフ、習慣トラッカー（連続記録）を表示
 */

import { useState, useEffect, useMemo } from 'react';
import { getDailyLogs } from '../utils/storage';
import { useApp } from '../context/AppContext';
import { calculateStreak, type StreakData } from '../utils/streakCalculator';
import NutrientTrendChart from '../components/charts/NutrientTrendChart';
import WeightTrendChart from '../components/charts/WeightTrendChart';
import StreakCalendar from '../components/StreakCalendar';
import { getCarnivoreTargets } from '../data/carnivoreTargets';
import type { DailyLog } from '../types';
import './StatsScreen.css';

type StatsScreenProps = { initialTab?: 'nutrients' | 'weight' | 'streak' };

export default function StatsScreen({ initialTab }: StatsScreenProps) {
  const { userProfile } = useApp();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [selectedNutrient, setSelectedNutrient] = useState<string>('proteinTotal');
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [activeTab, setActiveTab] = useState<'nutrients' | 'weight' | 'streak'>(initialTab ?? 'nutrients');

  const loadLogs = async () => {
    const allLogs = await getDailyLogs();
    const sorted = allLogs.sort((a, b) => a.date.localeCompare(b.date));
    setLogs(sorted);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    if (activeTab === 'streak') {
      calculateStreak().then(setStreakData);
    }
  }, [activeTab]);

  // 動的目標値を取得
  const targets = useMemo(() => {
    if (!userProfile) return null;
    return getCarnivoreTargets(
      userProfile.gender,
      userProfile.age,
      userProfile.activityLevel,
      userProfile.isPregnant,
      userProfile.isBreastfeeding,
      userProfile.isPostMenopause,
      userProfile.stressLevel,
      userProfile.sleepHours,
      userProfile.exerciseIntensity,
      userProfile.exerciseFrequency,
      userProfile.thyroidFunction,
      userProfile.sunExposureFrequency,
      userProfile.digestiveIssues,
      userProfile.inflammationLevel,
      userProfile.mentalHealthStatus,
      userProfile.supplementMagnesium,
      userProfile.supplementVitaminD,
      userProfile.supplementIodine,
      userProfile.alcoholFrequency,
      userProfile.caffeineIntake
    );
  }, [userProfile]);

  // 栄養素の選択肢
  const nutrientOptions = [
    { key: 'proteinTotal', label: 'タンパク質', unit: 'g', target: targets?.protein },
    { key: 'fatTotal', label: '脂質', unit: 'g', target: targets?.fat },
    { key: 'sodiumTotal', label: 'ナトリウム', unit: 'mg', target: targets?.sodium },
    { key: 'magnesiumTotal', label: 'マグネシウム', unit: 'mg', target: targets?.magnesium },
    { key: 'effectiveIron', label: '鉄分', unit: 'mg', target: targets?.iron },
    { key: 'effectiveZinc', label: '亜鉛', unit: 'mg', target: targets?.zinc },
    { key: 'effectiveVitC', label: 'ビタミンC', unit: 'mg', target: undefined },
    { key: 'effectiveVitK', label: 'ビタミンK', unit: 'μg', target: undefined },
  ];

  const selectedNutrientOption = nutrientOptions.find((opt) => opt.key === selectedNutrient);

  return (
    <div className="stats-screen-container">
      <div className="stats-screen-content">
        <div className="stats-screen-header">
          <h1 className="stats-screen-title">{t('stats.title')}</h1>
        </div>

        {/* タブ切り替え */}
        <div className="stats-screen-tabs">
          <button
            className={`stats-screen-tab ${activeTab === 'nutrients' ? 'active' : ''}`}
            onClick={() => setActiveTab('nutrients')}
          >
            {t('stats.nutrients')}
          </button>
          <button
            className={`stats-screen-tab ${activeTab === 'weight' ? 'active' : ''}`}
            onClick={() => setActiveTab('weight')}
          >
            {t('stats.weight')}
          </button>
          <button
            className={`stats-screen-tab ${activeTab === 'streak' ? 'active' : ''}`}
            onClick={() => setActiveTab('streak')}
          >
            {t('stats.habits')}
          </button>
        </div>

        {/* 期間選択（栄養素・体重タブのみ） */}
        {activeTab !== 'streak' && (
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1rem',
          }}
        >
          {(
            [
              { key: 'daily', label: t('stats.daily') },
              { key: 'weekly', label: t('stats.weekly') },
              { key: 'monthly', label: t('stats.monthly') },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedPeriod(key)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: selectedPeriod === key ? 'rgba(244, 63, 94, 0.2)' : '#18181b',
                color: selectedPeriod === key ? '#f43f5e' : '#a1a1aa',
                border: '1px solid',
                borderColor: selectedPeriod === key ? '#f43f5e' : '#27272a',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'all 0.2s',
                boxShadow: selectedPeriod === key ? '0 0 8px rgba(244, 63, 94, 0.3)' : 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        )}

        {/* 栄養素グラフ */}
        {activeTab === 'nutrients' && (
          <div className="stats-screen-nutrient-section">
            {/* 栄養素選択 */}
            <div className="stats-screen-nutrient-selector">
              <label
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  display: 'block',
                  color: '#e4e4e7',
                }}
              >
                {t('stats.selectNutrient')}
              </label>
              <select
                value={selectedNutrient}
                onChange={(e) => setSelectedNutrient(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#18181b',
                  color: '#e4e4e7',
                }}
              >
                {nutrientOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* グラフ表示 */}
            {selectedNutrientOption && (
              <div className="stats-screen-chart-container">
                <h2
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                    color: '#f43f5e',
                    textShadow: '0 0 5px rgba(244, 63, 94, 0.4)',
                  }}
                >
                  {selectedNutrientOption.label}{t('stats.trend')}
                </h2>
                <NutrientTrendChart
                  logs={logs}
                  nutrientKey={selectedNutrientOption.key}
                  nutrientLabel={selectedNutrientOption.label}
                  unit={selectedNutrientOption.unit}
                  targetValue={selectedNutrientOption.target}
                  period={selectedPeriod}
                />
              </div>
            )}
          </div>
        )}

        {/* 体重グラフ */}
        {activeTab === 'weight' && (
          <div className="stats-screen-weight-section">
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '1rem',
                color: '#f43f5e',
                textShadow: '0 0 5px rgba(244, 63, 94, 0.4)',
              }}
            >
              {t('stats.weightTrend')}
            </h2>
            <WeightTrendChart logs={logs} period={selectedPeriod} />
          </div>
        )}

        {/* 習慣トラッカー（連続記録） */}
        {activeTab === 'streak' && (
          <div className="stats-screen-streak-section" style={{ marginTop: '1rem' }}>
            {streakData === null ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#a1a1aa' }}>{t('stats.loading')}</div>
            ) : (
              <>
                <div
                  style={{
                    textAlign: 'center',
                    marginBottom: '1.5rem',
                    padding: '1.5rem',
                    backgroundColor: 'rgba(244, 63, 94, 0.1)',
                    borderRadius: '16px',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                  }}
                >
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f43f5e', marginBottom: '0.25rem' }}>
                    {streakData.currentStreak}
                  </div>
                  <div style={{ fontSize: '14px', color: '#a1a1aa' }}>{t('stats.consecutiveDays')}</div>
                  {streakData.longestStreak > 0 && (
                    <div style={{ marginTop: '0.75rem', fontSize: '13px', color: '#71717a' }}>
                      {t('stats.longestRecord')} {streakData.longestStreak}{t('stats.days')}
                    </div>
                  )}
                </div>
                <StreakCalendar
                  logs={logs}
                  onDayClick={() => {
                    window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'history' }));
                  }}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
