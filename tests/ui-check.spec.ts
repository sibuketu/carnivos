import { test, expect } from '@playwright/test';

/** 同意・オンボーディング完了・ゲストでホームを表示し、オーバーレイを閉じる */
async function ensureHomeScreen(page: import('@playwright/test').Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('primal_logic_consent_accepted', 'true');
    localStorage.setItem('primal_logic_onboarding_completed', 'true');
    localStorage.setItem('primal_logic_guest_mode', 'true');
    localStorage.setItem('primal_logic_feedback_dismissed', 'true');
    localStorage.setItem('primal_logic_ai_onboarding_dismissed', 'true');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  const guestBtn = page.getByRole('button', { name: /ゲスト|Guest|続ける|Continue/ });
  if (await guestBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await guestBtn.click();
    await page.waitForTimeout(1000);
  }
  await expect(page.getByTestId('nav-home')).toBeVisible({ timeout: 30000 });
  // AIオンボーディングの「スキップ」を先に閉じる（最前面にあるため）
  const skipBtn = page.getByRole('button', { name: /スキップ|Skip/ });
  if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await skipBtn.click({ force: true });
    await page.waitForTimeout(500);
  }
  // フィードバックバナーを閉じる
  const closeBtn = page.getByRole('button', { name: /Close|閉じる|Don't show/ });
  if (await closeBtn.first().isVisible({ timeout: 2000 }).catch(() => false)) {
    await closeBtn.first().click({ force: true });
    await page.waitForTimeout(500);
  }
}

test.describe('Primal Logic UI Tests', () => {
  test.setTimeout(60000);

  test('PRO/FATゲージと通知設定がホーム画面に表示される', async ({ page }) => {
    await ensureHomeScreen(page);
    
    // PRO/FATゲージが表示されていることを確認
    await expect(page.getByText('PRO')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('FAT')).toBeVisible({ timeout: 10000 });
    
    // 通知設定ボタンが表示されていることを確認
    await expect(page.getByText(/通知設定|Notification/i).first()).toBeVisible({ timeout: 10000 });
    
    // 食品追加ボタンが表示されていることを確認
    await expect(page.getByTestId('add-food')).toBeVisible({ timeout: 10000 });
    
    // スクリーンショットを撮る
    await page.screenshot({ path: 'tests/screenshots/zones.png', fullPage: true, timeout: 10000 }).catch(() => {});
  });

  test('食品追加ボタンがホーム画面に存在する', async ({ page }) => {
    await ensureHomeScreen(page);
    
    // 食品追加ボタンが表示されていることを確認
    const addFoodButton = page.getByTestId('add-food');
    await expect(addFoodButton).toBeVisible({ timeout: 10000 });
    
    // 水分摂取ボタンが表示されていることを確認
    await expect(page.getByText(/\+250ml|\+500ml/).first()).toBeVisible({ timeout: 10000 });
    
    // スクリーンショットを撮る
    await page.screenshot({ path: 'tests/screenshots/home-buttons.png', fullPage: true, timeout: 10000 }).catch(() => {});
  });

  test('ナビゲーション3タブが表示される', async ({ page }) => {
    await ensureHomeScreen(page);
    
    // ナビゲーション3タブが表示されていることを確認
    await expect(page.getByTestId('nav-home')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('nav-history')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('nav-others')).toBeVisible({ timeout: 10000 });
    
    // Historyタブをクリックして画面が切り替わることを確認
    await page.getByTestId('nav-history').click({ force: true });
    await page.waitForTimeout(1500);
    await expect(page.getByText(/History|履歴|No data|データ/).first()).toBeVisible({ timeout: 15000 });
    
    // スクリーンショットを撮る
    await page.screenshot({ path: 'tests/screenshots/navigation-check.png', fullPage: true, timeout: 10000 }).catch(() => {});
  });
});
