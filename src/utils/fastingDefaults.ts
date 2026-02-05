/** 断食タイマーのデフォルト時間（時間） */
const STORAGE_KEY = 'primal_logic_fasting_default_hours';

export const FASTING_TEMPLATES = {
  sugar_violation: { name: '糖質違反用', hours: 24 },
  light_recovery: { name: '軽いリカバリー用', hours: 16 },
  deep_recovery: { name: '深いリカバリー用', hours: 48 },
  daily: { name: '日常用', hours: 14 },
} as const;

export function getFastingDefaultHours(): number {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    const n = v ? parseInt(v, 10) : NaN;
    return Number.isFinite(n) && n >= 1 && n <= 72 ? n : 16;
  } catch {
    return 16;
  }
}

export function setFastingDefaultHours(hours: number): void {
  localStorage.setItem(STORAGE_KEY, String(Math.round(hours)));
}
