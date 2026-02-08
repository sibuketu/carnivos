/**
 * Streak Calendar Component
 *
 * 習慣トラッカーのカレンダー表示
 * - 月表示
 * - ログがある日をハイライト（違反なし = 緑、違反あり = 赤）
 * - 連続日数を線でつなぐ
 */

import React, { useState, useMemo } from 'react';
import type { DailyLog } from '../types';
import './StreakCalendar.css';

interface StreakCalendarProps {
  logs: DailyLog[];
  onDayClick?: (date: string) => void;
}

function StreakCalendar({ logs, onDayClick }: StreakCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // 現在の月の開始日と終了日を取得
  const { startDate, endDate: _endDate, daysInMonth } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    return {
      startDate: start,
      endDate: end,
      daysInMonth: end.getDate(),
    };
  }, [currentDate]);

  // 月の最初の日の曜日を取得（0 = 日曜日）
  const firstDayOfWeek = startDate.getDay();

  // 日付に1日を加算
  const addDays = (dateStr: string, days: number): string => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  // 日付文字列をキーとしてログをマッピング
  const logsByDate = useMemo(() => {
    const map = new Map<string, DailyLog>();
    logs.forEach((log) => {
      map.set(log.date, log);
    });
    return map;
  }, [logs]);

  // 連続日数を計算（違反日を除外）
  const getStreakDays = useMemo(() => {
    const streakDays = new Set<string>();
    const sortedLogs = [...logs]
      .filter((log) => !log.calculatedMetrics?.hasViolation)
      .sort((a, b) => b.date.localeCompare(a.date));

    if (sortedLogs.length === 0) return streakDays;

    const today = new Date().toISOString().split('T')[0];
    let expectedDate =
      sortedLogs[0].date === today || sortedLogs[0].date === addDays(today, -1)
        ? sortedLogs[0].date
        : null;

    if (expectedDate) {
      for (const log of sortedLogs) {
        if (log.date === expectedDate) {
          streakDays.add(log.date);
          expectedDate = addDays(expectedDate, -1);
        } else {
          break;
        }
      }
    }

    return streakDays;
  }, [logs]);

  // 前月へ
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // 翌月へ
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // 日付の状態を判定
  const getDayStatus = (day: number): 'normal' | 'hasLog' | 'hasViolation' | 'inStreak' => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    const log = logsByDate.get(dateStr);

    if (getStreakDays.has(dateStr)) {
      return 'inStreak';
    }

    if (log) {
      return log.calculatedMetrics?.hasViolation ? 'hasViolation' : 'hasLog';
    }

    return 'normal';
  };

  // 連続しているかチェック
  const isPartOfStreak = (day: number): boolean => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    return getStreakDays.has(dateStr);
  };

  const monthNames = [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ];
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  // 空白セルを生成（月初めの空白）
  const emptyCells = Array.from({ length: firstDayOfWeek }, (_, i) => (
    <div key={`empty-${i}`} className="streak-calendar-day empty" />
  ));

  return (
    <div className="streak-calendar-container">
      {/* 月ナビゲーション */}
      <div className="streak-calendar-header">
        <button onClick={goToPreviousMonth} className="streak-calendar-nav-button">
          ←
        </button>
        <h3 className="streak-calendar-month-title">
          {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
        </h3>
        <button onClick={goToNextMonth} className="streak-calendar-nav-button">
          →
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="streak-calendar-weekdays">
        {dayNames.map((day) => (
          <div key={day} className="streak-calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="streak-calendar-grid-wrapper">
        <div className="streak-calendar-grid">
          {emptyCells}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const status = getDayStatus(day);
            const inStreak = isPartOfStreak(day);
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dateStr = date.toISOString().split('T')[0];

            // 前日・翌日が連続しているかチェック
            const prevDateStr = addDays(dateStr, -1);
            const nextDateStr = addDays(dateStr, 1);
            const prevInStreak = getStreakDays.has(prevDateStr);
            const nextInStreak = getStreakDays.has(nextDateStr);

            const hasLog = logsByDate.has(dateStr);

            return (
              <div
                key={day}
                className={`streak-calendar-day ${status} ${inStreak ? 'streak' : ''}`}
                data-date={dateStr}
                data-day={day}
                onClick={() => {
                  if (hasLog && onDayClick) {
                    onDayClick(dateStr);
                  }
                }}
                style={{
                  cursor: hasLog && onDayClick ? 'pointer' : 'default',
                }}
              >
                <span className="streak-calendar-day-number">{day}</span>
                {/* 連続線の表示（横のみ、隙間にのみ描画） */}
                {inStreak && (
                  <>
                    {/* 左への線（前日が連続している場合） */}
                    {prevInStreak && (
                      <div
                        className="streak-line streak-line-left"
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '-0.5rem',
                          transform: 'translateY(-50%)',
                          width: '0.5rem',
                          height: '3px',
                          backgroundColor: '#059669',
                          zIndex: 1,
                        }}
                      />
                    )}
                    {/* 右への線（翌日が連続している場合） */}
                    {nextInStreak && (
                      <div
                        className="streak-line streak-line-right"
                        style={{
                          position: 'absolute',
                          top: '50%',
                          right: '-0.5rem',
                          transform: 'translateY(-50%)',
                          width: '0.5rem',
                          height: '3px',
                          backgroundColor: '#059669',
                          zIndex: 1,
                        }}
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 凡例 */}
      <div className="streak-calendar-legend">
        <div className="streak-calendar-legend-item">
          <div className="streak-calendar-legend-color" style={{ backgroundColor: '#f43f5e' }} />
          <span>連続記録中</span>
        </div>
        <div className="streak-calendar-legend-item">
          <div
            className="streak-calendar-legend-color"
            style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
          />
          <span>記録なし</span>
        </div>
        <div className="streak-calendar-legend-item">
          <div className="streak-calendar-legend-color" style={{ backgroundColor: '#dc2626' }} />
          <span>違反あり</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(StreakCalendar);
