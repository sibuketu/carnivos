/**
 * Streak Tracker Screen - 習慣トラッカー画面
 *
 * 連続記録日数の詳細を表示
 */

import { useState, useEffect } from 'react';
import { calculateStreak, type StreakData } from '../utils/streakCalculator';
import { getDailyLogs } from '../utils/storage';
import StreakCalendar from '../components/StreakCalendar';
import { useTranslation } from '../utils/i18n';
import type { DailyLog } from '../types';
import './StreakTrackerScreen.css';

type StreakTrackerScreenProps = {
  onBack: () => void;
};

export default function StreakTrackerScreen({ onBack }: StreakTrackerScreenProps) {
  const { t } = useTranslation();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [streak, dailyLogs] = await Promise.all([calculateStreak(), getDailyLogs()]);
      setStreakData(streak);
      setLogs(dailyLogs);
    };
    loadData();

    // データ更新・画面遷移を監視
    const handleDataUpdate = () => {
      loadData();
    };
    window.addEventListener('dailyLogUpdated', handleDataUpdate);
    window.addEventListener('screenChanged', handleDataUpdate);

    return () => {
      window.removeEventListener('dailyLogUpdated', handleDataUpdate);
      window.removeEventListener('screenChanged', handleDataUpdate);
    };
  }, []);

  if (!streakData) {
    return (
      <div className="streak-tracker-screen-container">
        <div className="streak-tracker-screen-content">
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              marginBottom: '1rem',
            }}
          >
            ← {t('common.back')}
          </button>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '16px', color: '#6b7280' }}>{t('common.loading')}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="streak-tracker-screen-container">
      <div className="streak-tracker-screen-content">
        {/* ヘッダー */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '2rem',
            gap: '1rem',
          }}
        >
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
            }}
          >
            ←
          </button>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            🔥 {t('streak.title')}
          </h1>
        </div>

        {/* 現在の連続日数（コンパクト版） */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '2rem',
            padding: '1.5rem',
            backgroundColor: 'var(--color-bg-primary)',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: '#dc2626',
              marginBottom: '0.5rem',
            }}
          >
            {streakData.currentStreak}
          </div>
          <div style={{ fontSize: '16px', color: '#6b7280', marginBottom: '1rem' }}>日連続</div>

          {/* 最長連続日数 */}
          {streakData.longestStreak > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                marginTop: '1rem',
              }}
            >
              <span style={{ fontSize: '14px', color: '#6b7280' }}>最長記録</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                {streakData.longestStreak}日
              </span>
            </div>
          )}
        </div>

        {/* カレンダー表示 */}
        <div
          style={{
            marginTop: '2rem',
          }}
        >
          <StreakCalendar
            logs={logs}
            onDayClick={(_date) => {
              // 履歴画面に遷移
              const event = new CustomEvent('navigateToScreen', { detail: 'history' });
              window.dispatchEvent(event);
              // 履歴画面で該当日付を展開するためのイベント（HistoryScreenで実装が必要な場合）
              // 現在は履歴画面に遷移するだけ
            }}
          />
        </div>
      </div>
    </div>
  );
}
