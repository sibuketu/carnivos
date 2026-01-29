/**
 * Stats Screen - 統計・グラフ表示画面
 *
 * 栄養素の推移グラフ、体重推移グラフを表示
 */

import { useState, useEffect, useMemo } from 'react';
import { getDailyLogs } from '../utils/storage';
import { useApp } from '../context/AppContext';
import NutrientTrendChart from '../components/charts/NutrientTrendChart';
import WeightTrendChart from '../components/charts/WeightTrendChart';
import { getCarnivoreTargets } from '../data/carnivoreTargets';
import type { DailyLog } from '../types';
import './StatsScreen.css';

export default function StatsScreen() {
  const { userProfile } = useApp();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [selectedNutrient, setSelectedNutrient] = useState<string>('proteinTotal');
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [activeTab, setActiveTab] = useState<'nutrients' | 'weight'>('nutrients');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const allLogs = await getDailyLogs();
    const sorted = allLogs.sort((a, b) => a.date.localeCompare(b.date));
    setLogs(sorted);
  };

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
          <h1 className="stats-screen-title">統計・グラフ</h1>
        </div>

        {/* タブ切り替え */}
        <div className="stats-screen-tabs">
          <button
            className={`stats-screen-tab ${activeTab === 'nutrients' ? 'active' : ''}`}
            onClick={() => setActiveTab('nutrients')}
          >
            栄養素
          </button>
          <button
            className={`stats-screen-tab ${activeTab === 'weight' ? 'active' : ''}`}
            onClick={() => setActiveTab('weight')}
          >
            体重
          </button>
        </div>

        {/* 期間選択 */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1rem',
          }}
        >
          {(
            [
              { key: 'daily', label: '日次' },
              { key: 'weekly', label: '週次' },
              { key: 'monthly', label: '月次' },
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
                栄養素を選択
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
                  {selectedNutrientOption.label}の推移
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
                color: '#06b6d4',
                textShadow: '0 0 5px rgba(6, 182, 212, 0.4)',
              }}
            >
              体重の推移
            </h2>
            <WeightTrendChart logs={logs} period={selectedPeriod} />
          </div>
        )}
      </div>
    </div>
  );
}
