/**
 * CarnivOS - 電解質バランス表示（Na / K / Mg）
 * カーニボアでは電解質バランスが重要。ナトリウム・カリウム・マグネシウムの達成率を視覚化。
 */

import React from 'react';

export interface ElectrolyteBalanceProps {
  consumed: { sodium: number; potassium: number; magnesium: number };
  targets: { sodium: number; potassium: number; magnesium: number };
}

const electrolytes = [
  { key: 'sodium' as const, label: 'Na', color: '#10b981' },
  { key: 'potassium' as const, label: 'K', color: '#f59e0b' },
  { key: 'magnesium' as const, label: 'Mg', color: '#06b6d4' },
];

export default function ElectrolyteBalance({ consumed, targets }: ElectrolyteBalanceProps) {
  const getBalanceStatus = () => {
    const naRatio = targets.sodium > 0 ? consumed.sodium / targets.sodium : 0;
    const kRatio = targets.potassium > 0 ? consumed.potassium / targets.potassium : 0;
    const mgRatio = targets.magnesium > 0 ? consumed.magnesium / targets.magnesium : 0;

    if (naRatio >= 0.8 && kRatio >= 0.8 && mgRatio >= 0.8) {
      return { status: 'Good', color: '#10b981', icon: '✓' };
    }
    if (naRatio < 0.5 || kRatio < 0.5 || mgRatio < 0.5) {
      return { status: 'Critical', color: '#ef4444', icon: '!' };
    }
    return { status: 'Caution', color: '#f59e0b', icon: '⚠' };
  };

  const balance = getBalanceStatus();

  return (
    <div
      style={{
        margin: '0.5rem 1rem',
        padding: '0.75rem 1rem',
        backgroundColor: '#1f2937',
        borderRadius: '8px',
        border: '1px solid #374151',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
        }}
      >
        <span style={{ fontWeight: 700, color: '#f9fafb', fontSize: '14px' }}>
          ⚡ 電解質バランス
        </span>
        <span style={{ fontSize: '13px', fontWeight: 700, color: balance.color }}>
          {balance.icon} {balance.status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
        {electrolytes.map((e) => {
          const target = targets[e.key] || 1;
          const current = consumed[e.key] || 0;
          const ratio = target > 0 ? current / target : 0;
          const percentage = Math.min(Math.round(ratio * 100), 100);

          return (
            <div key={e.key} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  marginBottom: '0.25rem',
                  color: e.color,
                }}
              >
                {e.label}
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '0.25rem' }}>
                {current}
                <span style={{ fontSize: '11px', marginLeft: '2px' }}>/ {target}</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: '#374151',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: e.color,
                    borderRadius: '9999px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {balance.status === 'Critical' && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.5rem 0.75rem',
            backgroundColor: 'rgba(127, 29, 29, 0.3)',
            border: '1px solid #ef4444',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#fca5a5',
          }}
        >
          ⚠️ 電解質が不足気味です。塩分や電解質サプリの追加を検討してください。
        </div>
      )}
      {balance.status === 'Caution' && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.5rem 0.75rem',
            backgroundColor: 'rgba(113, 63, 18, 0.3)',
            border: '1px solid #f59e0b',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#fde68a',
          }}
        >
          ⚡ 電解質を少し多めに意識してみてください。
        </div>
      )}
    </div>
  );
}
