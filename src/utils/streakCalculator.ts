/**
 * Primal Logic - Streak Calculator
 *
 * ストリーク（継続日数）とフェーズ（称号）を計算するユーティリティ
 */

import { getDailyLogs } from './storage';
import { supabase, isSupabaseAvailable } from '../lib/supabaseClient';
import type { StreakRow } from '../types/supabase';
import { logError } from './errorHandler';

// 匿名ユーザーIDを取得
function getUserId(): string {
  let userId = localStorage.getItem('primal_logic_user_id');
  if (!userId) {
    userId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('primal_logic_user_id', userId);
  }
  return userId;
}

export interface StreakData {
  currentStreak: number; // 現在の連続日数
  longestStreak: number; // 最長連続日数
}

/**
 * フェーズ（称号）の定義
 */


/**
 * 日付文字列を比較する（YYYY-MM-DD形式）
 */
function compareDates(date1: string, date2: string): number {
  return date1.localeCompare(date2);
}

/**
 * 日付文字列に1日を加算する
 */
function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * 今日の日付をYYYY-MM-DD形式で取得
 */
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * ストリークデータを計算
 */
export async function calculateStreak(): Promise<StreakData> {
  try {
    // Supabaseからストリークデータを取得（利用可能な場合）
    if (isSupabaseAvailable() && supabase) {
      const userId = getUserId();
      try {
        const { data, error } = await supabase
          .from('streaks')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!error && data) {
          const streakRow = data as StreakRow;
          return {
            currentStreak: streakRow.current_streak,
            longestStreak: streakRow.longest_streak,
          };
        }
      } catch (err) {
        logError(err, {
          component: 'streakCalculator',
          action: 'calculateStreak',
          step: 'supabase',
        });
        // フォールバック: ログから計算
      }
    }

    // localStorageからログを取得して計算
    const logs = await getDailyLogs();

    if (logs.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
      };
    }

    // 日付でソート（新しい順）
    const sortedLogs = [...logs].sort((a, b) => compareDates(b.date, a.date));

    const today = getTodayString();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: string | null = null;

    // 今日または昨日から連続日数を計算
    // 違反がない日のログのみをフィルタリング
    const validLogs = sortedLogs.filter((log) => !log.calculatedMetrics?.hasViolation);

    if (validLogs.length === 0) {
      currentStreak = 0;
    } else {
      // 最新のログの日付を確認
      const latestLogDate = validLogs[0].date;
      const daysDiff = Math.floor(
        (new Date(today).getTime() - new Date(latestLogDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      // 今日または昨日に記録がある場合のみ、連続日数を計算
      if (daysDiff <= 1) {
        // 連続日数を計算（違反日は除外）
        let expectedDate: string;

        // 今日または昨日から開始
        if (latestLogDate === today) {
          currentStreak = 1;
          expectedDate = addDays(today, -1);
        } else if (latestLogDate === addDays(today, -1)) {
          currentStreak = 1;
          expectedDate = addDays(today, -2);
        } else {
          // 2日以上前の記録のみの場合、ストリークは0
          currentStreak = 0;
          expectedDate = '';
        }

        // 連続日数を計算（違反日は除外）
        if (currentStreak > 0) {
          for (let i = 1; i < validLogs.length; i++) {
            const log = validLogs[i];
            if (log.date === expectedDate) {
              currentStreak++;
              expectedDate = addDays(expectedDate, -1);
            } else if (log.date < expectedDate) {
              // 期待する日付より前のログは無視（連続が途切れている）
              break;
            }
          }
        }
      } else {
        // 2日以上前の記録のみの場合、ストリークは0
        currentStreak = 0;
      }
    }

    // 最長連続日数を計算（違反日は除外）
    for (let i = 0; i < sortedLogs.length; i++) {
      const log = sortedLogs[i];
      // 違反日はストリークをリセット
      if (log.calculatedMetrics?.hasViolation) {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
        lastDate = null;
        continue;
      }

      if (lastDate === null) {
        tempStreak = 1;
        lastDate = log.date;
      } else {
        const daysBetween = Math.floor(
          (new Date(lastDate).getTime() - new Date(log.date).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysBetween === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
        lastDate = log.date;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      currentStreak,
      longestStreak,
    };
  } catch (error) {
    logError(error, { component: 'streakCalculator', action: 'calculateStreak' });
    return {
      currentStreak: 0,
      longestStreak: 0,
    };
  }
}
