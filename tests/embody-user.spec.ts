import { test, expect } from '@playwright/test';

/** 同意・オンボーディング完了・ゲストでホームを表示する */
async function ensureHomeScreen(page: import('@playwright/test').Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('primal_logic_consent_accepted', 'true');
    localStorage.setItem('primal_logic_onboarding_completed', 'true');
    localStorage.setItem('primal_logic_guest_mode', 'true');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  // 認証が未完了でAuth画面が出たら「ゲストで続ける」をクリック
  const guestBtn = page.getByRole('button', { name: /ゲスト|Guest|続ける|Continue/ });
  if (await guestBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await guestBtn.click();
    await page.waitForTimeout(1000);
  }
  // networkidle の代わりにナビゲーション要素の表示を待機
  await expect(page.getByTestId('nav-home')).toBeVisible({ timeout: 30000 });
}

/**
 * 一人のユーザーとしてアプリを体験するフロー。
 * 人間の代わりにクリック・遷移・表示確認を行い、アプリの動作を体現する。
 * 実行: npm run test:embody （開発サーバー起動済みなら npm run test -- tests/embody-user.spec.ts）
 */
test.describe('一人のユーザー体験フロー', () => {
  test.setTimeout(60000);

  test('ホーム → HISTORY → OTHER → HOME → 食品追加モーダル を体現する', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.dismiss());

    await ensureHomeScreen(page);

    // ホーム: ナビまたは栄養表示がいる
    await expect(page.getByTestId('nav-home')).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByText(/PRO|FAT|タンパク質|脂質|通知設定/, { exact: false }).first()
    ).toBeVisible({ timeout: 10000 });

    // HISTORY タブへ（オーバーレイを無視してクリック）
    await page.getByTestId('nav-history').click({ force: true });
    await page.waitForTimeout(1500);
    await expect(
      page.getByText(/履歴|History|日付|Date|No data|データがありません/, { exact: false }).first()
    ).toBeVisible({ timeout: 15000 });

    // OTHER タブへ
    await page.getByTestId('nav-others').click({ force: true });
    await page.waitForTimeout(1500);
    await expect(
      page.getByText(/その他|Other|Tips|ストリーク|設定/, { exact: false }).first()
    ).toBeVisible({ timeout: 15000 });

    // ホームへ戻る
    await page.getByTestId('nav-home').click({ force: true });
    await page.waitForTimeout(1500);
    await expect(
      page.getByText(/通知設定|PRO|FAT|タンパク質/, { exact: false }).first()
    ).toBeVisible({ timeout: 15000 });

    // 食品追加ボタンを押してモーダル/ButcherSelect を開く
    await page.getByTestId('add-food').click({ force: true });
    await page.waitForTimeout(1500);
    await expect(
      page.getByText(/牛肉|Ribeye|🐄|反芻|Butcher|食品/, { exact: false }).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('通知「有効にする」ボタンがクリックできる', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.dismiss());

    await ensureHomeScreen(page);

    const enableBtn = page.getByTestId('enable-notifications');
    await expect(enableBtn).toBeVisible({ timeout: 10000 });
    await expect(enableBtn).toHaveText('有効にする');

    await enableBtn.click({ force: true });
    await page.waitForTimeout(500);
    // クリック後はダイアログで閉じているのでそのまま次へ（許可しないので画面は変わらない想定）
  });
});
