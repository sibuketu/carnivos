import React from 'react';
import { getNutrientColor } from '../utils/gaugeUtils';

interface StorageNutrientGaugeProps {
  label: string;
  currentStorage: number; // 0 to 100 (percentage)
  nutrientKey: string;
}

const StorageNutrientGauge: React.FC<StorageNutrientGaugeProps> = ({
  label,
  currentStorage,
  nutrientKey,
}) => {
  const color = getNutrientColor(nutrientKey) || '#f59e0b'; // Default to orange/amber if not found

  return (
    <div style={{
      border: '2px solid #f97316', // Orange border to distinguish
      borderRadius: '8px',
      padding: '0.5rem',
      backgroundColor: '#fff7ed', // Light orange bg
      marginBottom: '0.5rem',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', color: '#9a3412', marginBottom: '4px' }}>
        <span>{label}</span>
        <span>{Math.round(currentStorage)}%</span>
      </div>

      {/* Gauge Bar */}
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#fed7aa',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div
          style={{
            width: `${Math.min(100, Math.max(0, currentStorage))}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: '4px',
            transition: 'width 0.5s ease-out',
          }}
        />
      </div>

      <div style={{ fontSize: '10px', color: '#c2410c', marginTop: '2px', textAlign: 'right' }}>
        Requires Refill (Decay: -14%/week)
      </div>
    </div>
  );
};

export default StorageNutrientGauge;
