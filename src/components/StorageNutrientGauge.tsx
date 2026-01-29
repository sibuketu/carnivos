/**
 * Storage Nutrient Gauge - 貯蔵可能な栄養素のゲージ
 *
 * 脂溶性ビタミン（A、D、K2、E）や一部のミネラル（カルシウム、リン）など、
 * 体内に貯蔵可能な栄養素を表示します。
 * 1日たつと他の栄養素はリセットされるが、貯蔵可能な栄養素は「ためてたやつが減る」感じ。
 */

interface StorageNutrientGaugeProps {
  label: string;
  currentStorage: number; // 現在の貯蔵量（%）
  dailyIntake: number; // 今日の摂取量
  dailyRequirement: number; // 1日の必要量
  unit: string;
  color?: string;
  onPress?: () => void;
}

export default function StorageNutrientGauge({
  label,
  currentStorage,
  dailyIntake,
  dailyRequirement,
  unit,
  color = '#a855f7',
  onPress,
}: StorageNutrientGaugeProps) {
  // 貯蔵量の計算：前日の貯蔵量 - 1日の消費量 + 今日の摂取量
  // 簡易版：現在の貯蔵量 + 今日の摂取量（1日の必要量に対する割合）
  const dailyIntakePercent = dailyRequirement > 0 ? (dailyIntake / dailyRequirement) * 100 : 0;
  const newStorage = Math.min(100, Math.max(0, currentStorage - 100 + dailyIntakePercent)); // 1日で100%消費、摂取分を追加

  // 貯蔵量の状態判定
  const getStorageStatus = (): 'optimal' | 'warning' | 'low' => {
    if (currentStorage >= 80) return 'optimal';
    if (currentStorage >= 50) return 'warning';
    return 'low';
  };

  const status = getStorageStatus();

  const getStatusColor = () => {
    if (status === 'optimal') return '#22c55e'; // 緑
    if (status === 'warning') return '#f59e0b'; // オレンジ
    return '#ef4444'; // 赤
  };

  const statusColor = getStatusColor();

  return (
    <div
      onClick={onPress}
      style={{
        padding: 0,
        backgroundColor: 'transparent',
        borderRadius: '4px',
        border: 'none',
        cursor: onPress ? 'pointer' : 'default',
        marginBottom: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 0,
        }}
      >
        <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '12px', color: '#374151', fontWeight: 600 }}>
            {currentStorage.toFixed(0)}%
          </span>
          {dailyIntake > 0 && (
            <span style={{ fontSize: '11px', color: '#3b82f6' }}>
              (+{dailyIntake.toFixed(1)}
              {unit})
            </span>
          )}
        </div>
      </div>

      {/* バッテリー表示（単色、ライン表示） */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '10px',
          backgroundColor: '#e5e7eb',
          borderRadius: '9999px',
          overflow: 'hidden',
        }}
      >
        {/* 現在の貯蔵量（単色） */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: `${currentStorage}%`,
            height: '100%',
            backgroundColor: statusColor,
            borderRadius: '9999px',
            transition: 'width 0.3s ease',
          }}
        />
        {/* 今日の摂取分（追加分） */}
        {dailyIntake > 0 && (
          <div
            style={{
              position: 'absolute',
              left: `${currentStorage}%`,
              width: `${Math.min(100 - currentStorage, dailyIntakePercent)}%`,
              height: '100%',
              backgroundColor: '#3b82f6',
              borderRadius: '9999px',
              opacity: 0.7,
            }}
          />
        )}
      </div>

      {/* 説明テキスト */}
      <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: 0 }}>
        {status === 'optimal' && '✅ 貯蔵量十分'}
        {status === 'warning' && '⚠️ 貯蔵量中程度'}
        {status === 'low' && '🔴 貯蔵量不足'}
      </div>
    </div>
  );
}
