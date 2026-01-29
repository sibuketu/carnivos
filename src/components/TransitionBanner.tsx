/**
 * Primal Logic - Transition Banner Component
 *
 * Phase 1: 移行期間サポート - 移行期間バナー
 * 移行期間中（開始から30日間）のみ表示されるバナー
 */

import React from 'react';

interface TransitionBannerProps {
  daysInTransition: number; // 移行期間中の日数（0-30）
  totalDays: number; // 移行期間の総日数（30）
  onPress: () => void; // バナーをタップした時のコールバック
}

export default function TransitionBanner({
  daysInTransition,
  totalDays,
  onPress,
}: TransitionBannerProps) {
  const progress = Math.min((daysInTransition / totalDays) * 100, 100);
  const remainingDays = totalDays - daysInTransition;

  return (
    <div
      onClick={onPress}
      style={{
        backgroundColor: '#3b82f6',
        color: 'white',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      <span style={{ fontSize: '1.5rem' }}>ℹ️</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '0.25rem' }}>
          移行期間: {daysInTransition}/{totalDays}日（{Math.round(progress)}%）
        </div>
        <div style={{ fontSize: '12px', opacity: 0.9 }}>適応モード: 塩分目標を増量中</div>
        {remainingDays > 0 && (
          <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '0.25rem' }}>
            あと{remainingDays}日で移行期間終了
          </div>
        )}
      </div>
    </div>
  );
}
