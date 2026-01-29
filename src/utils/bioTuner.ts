/**
 * Bio-Tuner: 排泄データに基づく脂質調整ロジック
 */

export interface BioTunerInput {
  previousDayFatTotal: number; // 前日の脂質摂取量(g)
  bowelMovementStatus: 'normal' | 'constipated' | 'loose' | 'watery';
}

export interface BioTunerOutput {
  recommendedFatTotal: number; // 推奨脂質摂取量(g)
  adjustmentPercentage: number; // 調整率(%)
  notification?: {
    message: string;
    priority: 'info' | 'warning' | 'important';
  };
}

/**
 * 脂質調整を計算
 */
export function calculateFatAdjustment(input: BioTunerInput): BioTunerOutput {
  const { previousDayFatTotal, bowelMovementStatus } = input;

  let adjustmentPercentage = 0;
  let notification: BioTunerOutput['notification'] | undefined;

  switch (bowelMovementStatus) {
    case 'constipated':
      // 便秘 → 脂質+10%
      adjustmentPercentage = 10;
      notification = {
        message: `前日の排泄が「硬い/出ない」でした。脂質目標を+10%に調整しました（${Math.round(previousDayFatTotal)}g → ${Math.round(previousDayFatTotal * 1.1)}g）`,
        priority: 'important',
      };
      break;

    case 'loose':
      // 緩い → 脂質-5%（便秘ほど大きく調整しない）
      adjustmentPercentage = -5;
      notification = {
        message: `前日の排泄が「緩い」でした。脂質目標を-5%に調整しました（${Math.round(previousDayFatTotal)}g → ${Math.round(previousDayFatTotal * 0.95)}g）`,
        priority: 'info',
      };
      break;

    case 'watery':
      // 水状 → 脂質-10%
      adjustmentPercentage = -10;
      notification = {
        message: `前日の排泄が「水状」でした。脂質目標を-10%に調整しました（${Math.round(previousDayFatTotal)}g → ${Math.round(previousDayFatTotal * 0.9)}g）`,
        priority: 'warning',
      };
      break;

    case 'normal':
    default:
      // 正常 → 調整なし
      adjustmentPercentage = 0;
      break;
  }

  const recommendedFatTotal = Math.round(previousDayFatTotal * (1 + adjustmentPercentage / 100));

  return {
    recommendedFatTotal,
    adjustmentPercentage,
    notification,
  };
}

/**
 * 前日のログから脂質調整を取得（HomeScreenで使用）
 */
export async function getFatAdjustmentForToday(): Promise<BioTunerOutput | null> {
  // 動的インポートで循環参照を回避
  const { getDailyLogs } = await import('./storage');
  const logs = await getDailyLogs();

  // 昨日の日付を取得
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const yesterdayLog = logs.find((log) => log.date === yesterdayStr);

  if (!yesterdayLog || !yesterdayLog.status.bowelMovement) {
    return null; // 前日の記録がない、または排泄記録がない場合
  }

  const fatTotal = yesterdayLog.calculatedMetrics.fatTotal || 0;

  return calculateFatAdjustment({
    previousDayFatTotal: fatTotal,
    bowelMovementStatus: yesterdayLog.status.bowelMovement.status,
  });
}
