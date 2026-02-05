/**
 * 断食タイマー終了時のブラウザ通知
 */

const STORAGE_KEY = 'primal_logic_fasting_timer_end';
const CHECK_INTERVAL_MS = 60 * 1000; // 1分ごと

let intervalId: ReturnType<typeof setInterval> | null = null;

function checkAndNotify(): void {
  try {
    const endStr = localStorage.getItem(STORAGE_KEY);
    if (!endStr) return;
    const endTime = new Date(endStr).getTime();
    if (Number.isNaN(endTime)) return;
    const now = Date.now();
    if (now >= endTime) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('断食タイマー終了', {
          body: '断食が完了しました！',
          icon: '/icon.png',
        });
      }
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    void 0;
  }
}

export function startFastingTimerWatcher(): () => void {
  if (intervalId) return () => {};
  intervalId = setInterval(checkAndNotify, CHECK_INTERVAL_MS);
  checkAndNotify(); // 即時1回チェック
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}
