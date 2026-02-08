/**
 * 共通ローディングスピナー（#f43f5e）
 * small / medium / large
 */

import React from 'react';

const SIZE_MAP = {
  small: 20,
  medium: 32,
  large: 48,
} as const;

export type LoadingSpinnerSize = keyof typeof SIZE_MAP;

interface LoadingSpinnerProps {
  size?: LoadingSpinnerSize;
  className?: string;
  style?: React.CSSProperties;
}

export default function LoadingSpinner({
  size = 'medium',
  className = '',
  style,
}: LoadingSpinnerProps) {
  const px = SIZE_MAP[size];
  return (
    <div
      className={className}
      style={{
        width: px,
        height: px,
        border: `3px solid rgba(244, 63, 94, 0.2)`,
        borderTopColor: '#f43f5e',
        borderRadius: '50%',
        animation: 'loading-spinner 0.8s linear infinite',
        ...style,
      }}
      role="status"
      aria-label="読み込み中"
    />
  );
}
