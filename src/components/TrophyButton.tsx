/**
 * トロフィーボタン - HomeScreenに配置
 */

import React from 'react';

interface TrophyButtonProps {
  unlockedCount: number;
  totalCount: number;
  onClick: () => void;
  showTooltip?: boolean;
}

export default function TrophyButton({
  unlockedCount,
  totalCount,
  onClick,
  showTooltip = false,
}: TrophyButtonProps) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={onClick}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          border: '2px solid #f43f5e',
          backgroundColor: '#fce7f3',
          color: '#f43f5e',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        🏆 <span>{unlockedCount}/{totalCount}</span>
      </button>

      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '0.5rem',
            backgroundColor: '#1f2937',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 1000,
          }}
        >
          このアプリの使い方はここ！ 👆
        </div>
      )}
    </div>
  );
}
