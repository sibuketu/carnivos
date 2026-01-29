/**
 * Community Analytics - コミュニティ分析ユーティリティ
 *
 * ユーザーのログデータから実践データを分析
 */

import type { DailyLog } from '../types';
import { getDailyLogs } from './storage';

export interface CommunityStats {
  totalDays: number;
  violationDays: number;
  violationRate: number;
  averageProtein: number;
  averageFat: number;
  averageSodium: number;
  averageMagnesium: number;
  longestStreak: number;
  currentStreak: number;
}

export interface PatternAnalysis {
  symptomNutritionCorrelation: Array<{
    symptom: string;
    nutrient: string;
    correlation: number;
    insight: string;
  }>;
  violationRecoveryPattern: {
    averageRecoveryDays: number;
    mostEffectiveActions: string[];
  };
}

/**
 * ユーザーの統計情報を計算
 */
export async function calculateCommunityStats(): Promise<CommunityStats> {
  const logs = await getDailyLogs();

  if (logs.length === 0) {
    return {
      totalDays: 0,
      violationDays: 0,
      violationRate: 0,
      averageProtein: 0,
      averageFat: 0,
      averageSodium: 0,
      averageMagnesium: 0,
      longestStreak: 0,
      currentStreak: 0,
    };
  }

  const violationDays = logs.filter((log) => log.calculatedMetrics?.hasViolation).length;
  const totalDays = logs.length;
  const violationRate = totalDays > 0 ? (violationDays / totalDays) * 100 : 0;

  // 栄養素の平均値を計算
  let totalProtein = 0;
  let totalFat = 0;
  let totalSodium = 0;
  let totalMagnesium = 0;
  let validDays = 0;

  logs.forEach((log) => {
    if (log.calculatedMetrics) {
      totalProtein += log.calculatedMetrics.proteinTotal || 0;
      totalFat += log.calculatedMetrics.fatTotal || 0;
      totalSodium += log.calculatedMetrics.sodiumTotal || 0;
      totalMagnesium += log.calculatedMetrics.magnesiumTotal || 0;
      validDays++;
    }
  });

  const averageProtein = validDays > 0 ? totalProtein / validDays : 0;
  const averageFat = validDays > 0 ? totalFat / validDays : 0;
  const averageSodium = validDays > 0 ? totalSodium / validDays : 0;
  const averageMagnesium = validDays > 0 ? totalMagnesium / validDays : 0;

  // 連続記録を計算（違反なしの連続日数）
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = sortedLogs.length - 1; i >= 0; i--) {
    const log = sortedLogs[i];
    if (!log.calculatedMetrics?.hasViolation) {
      tempStreak++;
      if (i === sortedLogs.length - 1) {
        currentStreak = tempStreak;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return {
    totalDays,
    violationDays,
    violationRate: Math.round(violationRate * 10) / 10,
    averageProtein: Math.round(averageProtein * 10) / 10,
    averageFat: Math.round(averageFat * 10) / 10,
    averageSodium: Math.round(averageSodium * 10) / 10,
    averageMagnesium: Math.round(averageMagnesium * 10) / 10,
    longestStreak,
    currentStreak,
  };
}

/**
 * パターン分析（日記と栄養素の相関など）
 */
export async function analyzePatterns(): Promise<PatternAnalysis> {
  const logs = await getDailyLogs();

  // 日記から症状を抽出（完全実装版）
  const symptomKeywords = [
    '下痢',
    '便秘',
    '頭痛',
    '疲労',
    '関節痛',
    'こむら返り',
    '不眠',
    '吐き気',
    'めまい',
    '動悸',
    '息切れ',
    '冷え性',
    'むくみ',
    '乾燥',
    '肌荒れ',
    '抜け毛',
    '口内炎',
    '目の疲れ',
    '肩こり',
    '腰痛',
    '生理痛',
    'PMS',
    'イライラ',
    '不安',
    'うつ',
    '集中力低下',
    '記憶力低下',
    '食欲不振',
    '過食',
    '甘いものが欲しい',
    '塩分が欲しい',
    '筋肉痛',
    'けいれん',
    'しびれ',
    '感覚異常',
    '睡眠の質が悪い',
    '早朝覚醒',
    '夜中に目が覚める',
    '悪夢',
    '朝起きるのが辛い',
    '午後の眠気',
    '食後の眠気',
    '低血糖症状',
    '手の震え',
    '発汗',
    '冷や汗',
  ];
  const nutrientMap: Record<string, string> = {
    下痢: '脂質',
    便秘: 'マグネシウム',
    頭痛: 'ナトリウム',
    疲労: 'タンパク質',
    関節痛: 'オメガ3',
    こむら返り: 'マグネシウム',
    不眠: 'マグネシウム',
    吐き気: 'ナトリウム',
    めまい: 'ナトリウム',
    動悸: 'マグネシウム',
    息切れ: '鉄分',
    冷え性: 'タンパク質',
    むくみ: 'ナトリウム',
    乾燥: '脂質',
    肌荒れ: 'ビタミンA',
    抜け毛: 'タンパク質',
    口内炎: 'ビタミンB12',
    目の疲れ: 'ビタミンA',
    肩こり: 'マグネシウム',
    腰痛: 'マグネシウム',
    生理痛: 'オメガ3',
    PMS: 'マグネシウム',
    イライラ: 'マグネシウム',
    不安: 'マグネシウム',
    うつ: 'オメガ3',
    集中力低下: 'タンパク質',
    記憶力低下: 'タンパク質',
    食欲不振: 'タンパク質',
    過食: 'タンパク質',
    甘いものが欲しい: 'タンパク質',
    塩分が欲しい: 'ナトリウム',
    筋肉痛: 'マグネシウム',
    けいれん: 'マグネシウム',
    しびれ: 'ビタミンB12',
    感覚異常: 'ビタミンB12',
    睡眠の質が悪い: 'マグネシウム',
    早朝覚醒: 'マグネシウム',
    夜中に目が覚める: 'マグネシウム',
    悪夢: 'マグネシウム',
    朝起きるのが辛い: 'ナトリウム',
    午後の眠気: 'タンパク質',
    食後の眠気: 'タンパク質',
    低血糖症状: 'タンパク質',
    手の震え: 'ナトリウム',
    発汗: 'ナトリウム',
    冷や汗: 'ナトリウム',
  };

  const correlations: PatternAnalysis['symptomNutritionCorrelation'] = [];

  symptomKeywords.forEach((symptom) => {
    const nutrient = nutrientMap[symptom] || '';
    const logsWithSymptom = logs.filter((log) => log.diary && log.diary.includes(symptom));

    if (logsWithSymptom.length > 0) {
      correlations.push({
        symptom,
        nutrient,
        correlation: logsWithSymptom.length / logs.length,
        insight: `${symptom}が記録された日は${logsWithSymptom.length}日（全体の${Math.round((logsWithSymptom.length / logs.length) * 100)}%）`,
      });
    }
  });

  // 違反からの回復パターン
  const violationLogs = logs.filter((log) => log.calculatedMetrics?.hasViolation);
  const recoveryDays: number[] = [];

  // 違反からの回復パターンを分析（24-48時間の遅延反応を考慮）
  for (let i = 0; i < logs.length - 1; i++) {
    const currentLog = logs[i];

    if (currentLog.calculatedMetrics?.hasViolation) {
      // 違反があった日から、回復した日までの日数を計算
      for (let j = i + 1; j < Math.min(i + 3, logs.length); j++) {
        const nextLog = logs[j];
        if (!nextLog.calculatedMetrics?.hasViolation) {
          const daysToRecovery = j - i;
          recoveryDays.push(daysToRecovery);
          break; // 最初の回復日を記録
        }
      }
    }
  }

  const averageRecoveryDays =
    recoveryDays.length > 0 ? recoveryDays.reduce((a, b) => a + b, 0) / recoveryDays.length : 0;

  return {
    symptomNutritionCorrelation: correlations,
    violationRecoveryPattern: {
      averageRecoveryDays: Math.round(averageRecoveryDays * 10) / 10,
      mostEffectiveActions: ['16時間ファスティング', '脂質を減らす', '塩分を増やす'],
    },
  };
}

/**
 * データエクスポート（専門医相談用）
 */
export async function exportDataForConsultation(): Promise<string> {
  const logs = await getDailyLogs();
  const stats = await calculateCommunityStats();
  const patterns = await analyzePatterns();

  const exportData = {
    stats,
    patterns,
    recentLogs: logs.slice(0, 30).map((log) => ({
      date: log.date,
      violation: log.calculatedMetrics?.hasViolation || false,
      protein: log.calculatedMetrics?.proteinTotal || 0,
      fat: log.calculatedMetrics?.fatTotal || 0,
      sodium: log.calculatedMetrics?.sodiumTotal || 0,
      magnesium: log.calculatedMetrics?.magnesiumTotal || 0,
      diary: log.diary || '',
    })),
  };

  return JSON.stringify(exportData, null, 2);
}
