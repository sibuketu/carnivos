/**
 * Primal Logic - Accessibility Utilities
 *
 * アクセシビリティ関連のユーティリティ関数
 */

/**
 * キーボードナビゲーション用のイベントハンドラー
 * EnterキーまたはSpaceキーでクリックと同じ動作を実行
 */
export function handleKeyboardNavigation(e: React.KeyboardEvent, callback: () => void): void {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    callback();
  }
}

/**
 * ARIAラベルを生成
 */
export function getAriaLabel(screen: string): string {
  const labels: Record<string, string> = {
    home: 'ホーム画面',
    history: '履歴画面',
    labs: 'その他画面',
    profile: '設定画面',
    settings: 'UI設定画面',
    userSettings: 'ユーザー設定画面',
  };
  return labels[screen] || screen;
}
