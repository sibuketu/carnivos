/**
 * CarnivOS - Help Tooltip Component
 *
 * スマホ対応のツールチップコンポーネント
 */

import { useState } from 'react';
import './HelpTooltip.css';

interface HelpTooltipProps {
  text: string;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function HelpTooltip({ text, children, position = 'bottom' }: HelpTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltipPosition({ x: rect.left, y: rect.top });
    setShowTooltip(!showTooltip);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltipPosition({ x: rect.left, y: rect.top });
    setShowTooltip(true);
  };

  const handleEnter = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltipPosition({ x: rect.left, y: rect.top });
    setShowTooltip(true);
  };

  const getTooltipStyle = () => {
    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      left: `${tooltipPosition.x}px`,
      backgroundColor: '#1f2937',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      maxWidth: '250px',
      zIndex: 1000,
      pointerEvents: 'none',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      whiteSpace: 'pre-wrap',
    };

    switch (position) {
      case 'top':
        return { ...baseStyle, bottom: `${window.innerHeight - tooltipPosition.y + 20}px` };
      case 'bottom':
        return { ...baseStyle, top: `${tooltipPosition.y + 20}px` };
      case 'left':
        return {
          ...baseStyle,
          right: `${window.innerWidth - tooltipPosition.x + 20}px`,
          top: `${tooltipPosition.y}px`,
          left: 'auto',
        };
      case 'right':
        return { ...baseStyle, left: `${tooltipPosition.x + 20}px`, top: `${tooltipPosition.y}px` };
      default:
        return { ...baseStyle, top: `${tooltipPosition.y + 20}px` };
    }
  };

  return (
    <span
      className="help-tooltip-trigger"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onMouseEnter={handleEnter}
      onMouseLeave={() => setShowTooltip(false)}
      style={{ userSelect: 'none', WebkitTapHighlightColor: 'transparent' }}
    >
      {children || '💡'}
      {showTooltip && (
        <div className="help-tooltip-content" style={getTooltipStyle()}>
          {text}
        </div>
      )}
    </span>
  );
}
