import React from 'react';
import { useApp } from '../../context/AppContext';

export default function BioHackDashboard() {
  const { dailyLog, userProfile } = useApp();

  // dailyLogから栄養素を計算
  const metrics = dailyLog?.calculatedMetrics || {
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
    netCarbs: 0,
    sodium: 0,
    potassium: 0,
    magnesium: 0,
    iron: 0,
    zinc: 0,
    vitaminA: 0,
    vitaminD: 0,
    vitaminK: 0,
    vitaminB12: 0,
    vitaminC: 0,
    choline: 0,
    effectiveProtein: 0,
    effectiveIron: 0,
    effectiveZinc: 0,
    effectiveVitaminK: 0,
    effectiveVitaminC: 0,
    pRatio: 0,
    fRatio: 0,
    pfRatio: 0,
    omega3: 0,
    omega6: 0,
    omegaRatio: 0,
  };

  // 目標値（プロファイルがない場合はデフォルト値）
  const proteinTarget = userProfile?.weight ? userProfile.weight * 1.6 : 110;
  const fatTarget = proteinTarget * 1.2; // 1.2:1 ratio default

  // 達成率（NaNを防ぐ）
  const proteinCurrent = metrics.effectiveProtein || metrics.protein || 0;
  const fatCurrent = metrics.fatTotal || metrics.fat || 0;
  const proteinPercent =
    proteinTarget > 0 ? Math.min((proteinCurrent / proteinTarget) * 100, 150) : 0;
  const fatPercent = fatTarget > 0 ? Math.min((fatCurrent / fatTarget) * 100, 150) : 0;

  // 円形ゲージの描画ヘルパー
  const renderGauge = (
    title: string,
    current: number,
    target: number,
    percent: number,
    color: string,
    icon: string
  ) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
      <div
        style={{
          position: 'relative',
          width: '120px',
          height: '140px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
          {/* 背景サークル */}
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            style={{ transform: 'rotate(-90deg)' }}
          >
            <circle cx="60" cy="60" r={radius} stroke="#1f2937" strokeWidth="8" fill="none" />
            {/* プログレスサークル */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 4px ${color})`,
                transition: 'stroke-dashoffset 1s ease-in-out',
              }}
            />
          </svg>
          {/* 中央アイコンと% */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: 'white',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{icon}</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', textShadow: `0 0 10px ${color}` }}>
              {Math.round(percent)}%
            </div>
          </div>
        </div>
        <div style={{ marginTop: '4px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 'bold' }}>{title}</div>
          <div style={{ fontSize: '10px', color: '#6b7280' }}>
            {Math.round(current)}g / {Math.round(target)}g
          </div>
        </div>
      </div>
    );
  };

  // 六角形ステータス描画ヘルパー
  const renderHex = (label: string, value: string, color: string, subLabel?: string) => (
    <div
      style={{
        width: '80px',
        height: '70px',
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        border: `2px solid ${color}`, // clip-pathでborderは効かないため、擬似要素やドロップシャドウで代用するが、簡易版としてbox-shadowを使う
        position: 'relative',
        marginBottom: '8px',
        marginLeft: '4px',
        marginRight: '4px',
        boxShadow: `0 0 5px ${color} inset`,
      }}
    >
      {/* 枠線風の装飾 (SVG overlay could be better, simplified here) */}
      <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '600' }}>{label}</div>
      <div
        style={{
          fontSize: '14px',
          color: color,
          fontWeight: 'bold',
          textShadow: `0 0 5px ${color}`,
        }}
      >
        {value}
      </div>
      {subLabel && <div style={{ fontSize: '8px', color: '#6b7280' }}>{subLabel}</div>}
    </div>
  );

  return (
    <div
      className="bio-hack-dashboard"
      style={{
        padding: '16px',
        backgroundColor: '#030712', // Very dark background
        borderRadius: '16px',
        border: '1px solid #1f2937',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
        fontFamily: '"Orbitron", "Roboto", sans-serif', // Tech font if available
        position: 'relative',
        overflow: 'hidden',
        color: 'white',
        marginBottom: 0,
      }}
    >
      {/* 背景グリッド装飾 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            'linear-gradient(rgba(31, 41, 55, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(31, 41, 55, 0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* ヘッダー */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          borderBottom: '1px solid #374151',
          paddingBottom: '8px',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: '14px',
            color: '#ef4444',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '16px' }}>🧬</span> BIO-HACK TERMINAL
        </h2>
        <span style={{ fontSize: '10px', color: '#6b7280', fontFamily: 'monospace' }}>V.4.0.1</span>
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '16px',
        }}
      >
        {/* 左カラム: マクロゲージ */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            flex: '1 1 120px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {renderGauge(
            'DAILY PROTEIN',
            proteinCurrent,
            proteinTarget,
            proteinPercent,
            '#ef4444',
            '🥩'
          )}
          {renderGauge('DAILY FAT', fatCurrent, fatTarget, fatPercent, '#f43f5e', '💧')}
        </div>

        {/* 中央カラム: 心臓/コア */}
        <div
          style={{
            flex: '1 1 140px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
          }}
        >
          <div
            style={{
              fontSize: '10px',
              color: '#9ca3af',
              marginBottom: '8px',
              letterSpacing: '2px',
            }}
          >
            METABOLIC STATE
          </div>

          {/* 心臓/エンジンのビジュアル（CSSアニメーション） */}
          <div
            style={{
              width: '100px',
              height: '100px',
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(239,68,68,0.2) 0%, rgba(0,0,0,0) 70%)',
                animation: 'pulse 2s infinite',
              }}
            />
            <span style={{ fontSize: '60px', filter: 'drop-shadow(0 0 10px #ef4444)' }}>🫀</span>
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'white',
                textShadow: '0 0 8px rgba(255,255,255,0.5)',
              }}
            >
              KETOGENIC
            </div>
            <div style={{ fontSize: '10px', color: '#f43f5e' }}>FAT ADAPTATION: 92%</div>
            <div style={{ fontSize: '10px', color: '#f43f5e', marginTop: '4px' }}>
              CELLULAR REPAIR: OPTIMAL
            </div>
          </div>
        </div>

        {/* 右カラム: マイクロ六角形 */}
        <div
          style={{
            flex: '1 1 120px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px' }}>
            {/* ヘックスグリッド配置 */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {renderHex('B12', '120%', '#ef4444', 'STATUS')}
              {renderHex('IRON', '95%', '#ef4444', 'HEME')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: '35px' }}>
              {renderHex('ZINC', '88%', '#f43f5e', 'COMPLETE')}
              {renderHex('Vit-A', '105%', '#f43f5e', 'RETINOL')}
            </div>
          </div>
        </div>
      </div>

      {/* フッター情報 */}
      <div
        style={{
          marginTop: '20px',
          borderTop: '1px solid #374151',
          paddingTop: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '10px',
          color: '#6b7280',
          fontFamily: 'monospace',
        }}
      >
        <span>BLOOD GLUCOSE: 85 mg/dL</span>
        <span>KETONES: 2.8 mmol/L</span>
        <span style={{ color: '#ef4444', animation: 'blink 1s infinite' }}>● LIVE</span>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
