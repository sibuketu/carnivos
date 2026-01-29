/**
 * Weight Trend Chart Component
 *
 * 体重の推移グラフを表示するコンポーネント
 * rechartsを使用して日次・週次・月次の推移を表示
 */

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DailyLog } from '../../types';

interface WeightTrendChartProps {
  logs: DailyLog[];
  period: 'daily' | 'weekly' | 'monthly'; // 表示期間
}

export default function WeightTrendChart({ logs, period = 'daily' }: WeightTrendChartProps) {
  // データを期間ごとに集計
  const chartData = useMemo(() => {
    if (logs.length === 0) return [];

    // 体重データがあるログのみをフィルタ
    const weightLogs = logs.filter((log) => log.weight !== undefined && log.weight !== null);
    if (weightLogs.length === 0) return [];

    // 日付順にソート（古い順）
    const sortedLogs = [...weightLogs].sort((a, b) => a.date.localeCompare(b.date));

    if (period === 'daily') {
      // 日次データ（最大30日分）
      const recentLogs = sortedLogs.slice(-30);
      return recentLogs.map((log) => ({
        date: log.date.split('T')[0].split('-').slice(1).join('/'), // MM/DD形式
        weight: Math.round((log.weight || 0) * 10) / 10, // 小数点第1位まで
      }));
    } else if (period === 'weekly') {
      // 週次データ（最大12週分）
      const weeklyData: Record<string, { total: number; count: number }> = {};

      sortedLogs.forEach((log) => {
        const date = new Date(log.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // 週の開始日（日曜日）
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { total: 0, count: 0 };
        }

        weeklyData[weekKey].total += log.weight || 0;
        weeklyData[weekKey].count += 1;
      });

      return Object.entries(weeklyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([weekKey, data]) => {
          const weekStart = new Date(weekKey);
          return {
            date: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
            weight: Math.round((data.total / data.count) * 10) / 10,
          };
        });
    } else {
      // 月次データ（最大12ヶ月分）
      const monthlyData: Record<string, { total: number; count: number }> = {};

      sortedLogs.forEach((log) => {
        const date = new Date(log.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { total: 0, count: 0 };
        }

        monthlyData[monthKey].total += log.weight || 0;
        monthlyData[monthKey].count += 1;
      });

      return Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([monthKey, data]) => {
          const [year, month] = monthKey.split('-');
          return {
            date: `${year}/${month}`,
            weight: Math.round((data.total / data.count) * 10) / 10,
          };
        });
    }
  }, [logs, period]);

  if (chartData.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#78716c' }}>
        体重データがありません
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '300px', marginTop: '1rem' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="date"
            stroke="#71717a"
            tick={{ fill: '#a1a1aa' }}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#71717a"
            tick={{ fill: '#a1a1aa' }}
            style={{ fontSize: '12px' }}
            label={{
              value: '体重 (kg)',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: '12px', fill: '#a1a1aa' },
            }}
          />
          <Tooltip
            formatter={(value: number | undefined) =>
              value !== undefined ? [`${value}kg`, '体重'] : ['', '']
            }
            labelFormatter={(label) => `日付: ${label}`}
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '8px',
              color: '#e4e4e7',
            }}
            itemStyle={{ color: '#06b6d4' }}
            labelStyle={{ color: '#a1a1aa' }}
          />
          <Legend wrapperStyle={{ color: '#a1a1aa' }} />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#06b6d4" /* Neon Cyan */
            strokeWidth={3}
            name="体重"
            dot={{ r: 4, fill: '#09090b', stroke: '#06b6d4', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#06b6d4', stroke: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
