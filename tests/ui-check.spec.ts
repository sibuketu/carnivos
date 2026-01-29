import { test, expect } from '@playwright/test';

test.describe('Primal Logic UI Tests', () => {
  test('Zone 1とZone 2が正しく表示される', async ({ page }) => {
    await page.goto('/');
    
    // ページが読み込まれるまで待つ
    await page.waitForLoadState('networkidle');
    
    // キャッチフレーズバナーが表示されていないことを確認
    const catchphraseBanner = page.locator('.catchphrase-banner');
    await expect(catchphraseBanner).toHaveCount(0);
    
    // Zone 1が表示されていることを確認（Zone 1というテキストがない場合は、栄養素ゲージで確認）
    await expect(page.getByText('ナトリウム')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('カリウム')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('マグネシウム')).toBeVisible({ timeout: 10000 });
    
    // Zone 2が表示されていることを確認（Zone 2というテキストがない場合は、栄養素ゲージで確認）
    await expect(page.getByText('タンパク質', { exact: false }).first()).toBeVisible({ timeout: 10000 });
    // 「脂質」は複数箇所にあるため、Zone 2内の特定の要素を確認
    await expect(page.getByText('脂質', { exact: true }).first()).toBeVisible({ timeout: 10000 });
    
    // スクリーンショットを撮る
    await page.screenshot({ path: 'tests/screenshots/zones.png', fullPage: true });
  });

  test('ButcherSelectのNutrients Breakdownにグリシンなどが表示される', async ({ page }) => {
    await page.goto('/');
    // networkidleの代わりに、より具体的な要素を待つ
    await page.waitForSelector('.app-navigation, [class*="home"], [class*="Home"]', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(500);
    
    // 食品追加ボタンをクリック
    const addFoodButton = page.getByText(/\+.*食品を追加|\+.*Add Food/i);
    await expect(addFoodButton).toBeVisible({ timeout: 10000 });
    await addFoodButton.click();
    await page.waitForTimeout(2000);
    
    // ButcherSelectが表示されるまで待つ（動物タブ🐄を探す）
    const beefTab = page.locator('button').filter({ hasText: /🐄|牛肉/ });
    await expect(beefTab.first()).toBeVisible({ timeout: 15000 });
    
    // 牛肉のRibeyeを選択
    const ribeyeButton = page.getByText('Ribeye');
    await expect(ribeyeButton).toBeVisible({ timeout: 10000 });
    await ribeyeButton.click();
    
    // 数量入力が表示されるまで待つ
    await page.waitForSelector('text=QUANTITY', { timeout: 10000 });
    
    // Nutrients Breakdownが表示されるまで待つ
    await page.waitForSelector('text=Nutrients Breakdown', { timeout: 10000 });
    
    // グリシン、メチオニン、カルシウム、リン、ヨウ素が表示されていることを確認
    await expect(page.getByText('グリシン', { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('メチオニン', { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('カルシウム', { exact: true })).toBeVisible({ timeout: 10000 });
    // 「リン」は「コリン」と区別するため、exact: trueを使用
    await expect(page.getByText('リン', { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('ヨウ素', { exact: true })).toBeVisible({ timeout: 10000 });
    
    // スクリーンショットを撮る
    await page.screenshot({ path: 'tests/screenshots/nutrients-breakdown.png', fullPage: true });
  });

  test('オメガ3/6比率が正しく表示される', async ({ page }) => {
    await page.goto('/');
    // networkidleの代わりに、より具体的な要素を待つ
    await page.waitForSelector('.app-navigation, [class*="home"], [class*="Home"]', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(500);
    
    // 食品追加ボタンをクリック
    const addFoodButton = page.getByText(/\+.*食品を追加|\+.*Add Food/i);
    await expect(addFoodButton).toBeVisible({ timeout: 10000 });
    await addFoodButton.click();
    await page.waitForTimeout(2000);
    
    // ButcherSelectが表示されるまで待つ（動物タブ🐄を探す）
    const beefTab = page.locator('button').filter({ hasText: /🐄|牛肉/ });
    await expect(beefTab.first()).toBeVisible({ timeout: 15000 });
    
    // 牛肉のRibeyeを選択
    const ribeyeButton = page.getByText('Ribeye');
    await expect(ribeyeButton).toBeVisible({ timeout: 10000 });
    await ribeyeButton.click();
    
    // 数量入力が表示されるまで待つ
    await page.waitForSelector('text=QUANTITY', { timeout: 10000 });
    
    // Nutrients Breakdownが表示されるまで待つ
    await page.waitForSelector('text=Nutrients Breakdown', { timeout: 10000 });
    
    // オメガ3/6比率が表示されるまで待つ（テキストが含まれる要素を探す）
    // OmegaRatioDisplayコンポーネントが表示するテキストを確認
    const omegaRatioText = page.getByText(/オメガ|Omega|Ω/, { exact: false });
    await expect(omegaRatioText.first()).toBeVisible({ timeout: 10000 });
    
    // スクリーンショットを撮る
    await page.screenshot({ path: 'tests/screenshots/omega-ratio.png', fullPage: true });
  });
});

