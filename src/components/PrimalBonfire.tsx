import React, { useMemo } from 'react';
import './PrimalBonfire.css';

interface PrimalBonfireProps {
  score: number; // 0 to 100
  label?: string;
}

export default function PrimalBonfire({ score, label }: PrimalBonfireProps) {
  // スコアに基づいて強度クラスを決定
  const intensityClass = useMemo(() => {
    if (score < 30) return 'intensity-low';
    if (score < 70) return 'intensity-medium';
    return 'intensity-high';
  }, [score]);

  // スパークの数を決定
  const sparks = useMemo(() => {
    const count = score < 30 ? 2 : score < 70 ? 5 : 8;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${20 + Math.random() * 60}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${2 + Math.random() * 2}s`,
    }));
  }, [score]);

  return (
    <div className="primal-bonfire-container">
      <div className={`bonfire-wrapper ${intensityClass}`}>
        {/* 炎メイン */}
        <div className="fire-base">
          <div className="flame outer"></div>
          <div className="flame main"></div>
          <div className="flame inner"></div>
        </div>

        {/* 火の粉 */}
        {sparks.map((spark) => (
          <div
            key={spark.id}
            className="spark"
            style={{
              left: spark.left,
              animationDelay: spark.delay,
              animationDuration: spark.duration,
            }}
          />
        ))}

        {/* 煙（スコアが低い時のみ） */}
        {score < 40 && (
          <>
            <div className="smoke" style={{ animationDelay: '0s' }}></div>
            <div className="smoke" style={{ animationDelay: '1s', left: '45%' }}></div>
          </>
        )}

        {/* 薪 */}
        <div className="logs-container">
          <div className="log left"></div>
          <div className="log right"></div>
          <div className="log center"></div>
        </div>
      </div>

      {/* ラベル表示 */}
      {label && (
        <div
          style={{
            position: 'absolute',
            bottom: '-30px',
            width: '100%',
            textAlign: 'center',
            color: '#8B4513',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            textShadow: '0 1px 2px rgba(255,255,255,0.8)',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
