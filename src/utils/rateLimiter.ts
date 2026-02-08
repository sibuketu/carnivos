/**
 * AI API レートリミット
 * - 1日50回（通常目安）
 * - 1日100回超 → 警告
 * - 1日150回超 → ソフトブロック
 * - 1分10回、10秒3回
 */

const DAILY_WARN = 100;
const DAILY_BLOCK = 150;
const PER_MINUTE = 10;
const PER_10_SEC = 3;

const storageKey = 'carnivos_ai_rate_limit';

interface WindowCount {
  ts: number[];
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function load(): { daily: number; windows: WindowCount } {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { daily: 0, windows: { ts: [] } };
    const parsed = JSON.parse(raw) as { date: string; daily: number; ts: number[] };
    const today = getTodayKey();
    if (parsed.date !== today) return { daily: 0, windows: { ts: [] } };
    return { daily: parsed.daily ?? 0, windows: { ts: parsed.ts ?? [] } };
  } catch {
    return { daily: 0, windows: { ts: [] } };
  }
}

function save(daily: number, ts: number[]): void {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ date: getTodayKey(), daily, ts: ts.slice(-PER_MINUTE * 2) })
    );
  } catch {
    // ignore
  }
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
}

export function checkRateLimit(): RateLimitResult {
  const now = Date.now();
  const { daily, windows } = load();
  const ts = windows.ts.filter((t) => now - t < 60_000); // 1分以内
  const ts10 = ts.filter((t) => now - t < 10_000); // 10秒以内

  if (daily >= DAILY_BLOCK) {
    return {
      allowed: false,
      reason: '本日のAI利用回数が上限に達しました。明日またお試しください。',
    };
  }
  if (ts.length >= PER_MINUTE) {
    return {
      allowed: false,
      reason: '少し待ってからもう一度お試しください。（1分あたりの回数制限）',
    };
  }
  if (ts10.length >= PER_10_SEC) {
    return {
      allowed: false,
      reason: '連続での利用が多すぎます。少し待ってからお試しください。',
    };
  }
  if (daily >= DAILY_WARN) {
    return {
      allowed: true,
      reason: '本日のAI利用が平均の約10倍です。ご協力をお願いします。',
    };
  }
  return { allowed: true };
}

export function recordUsage(): void {
  const now = Date.now();
  const { daily, windows } = load();
  const ts = [...windows.ts.filter((t) => now - t < 60_000), now];
  save(daily + 1, ts);
}
