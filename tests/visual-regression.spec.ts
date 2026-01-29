import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests - UIの見た目をテスト
 * 
 * スクリーンショットを比較して、UIの変更を検出します
 */

test.describe('Visual Regression Tests - UI見た目テスト', () => {
  
  // 同意・オンボーディングをスキップするヘルパー関数
  async function skipConsentAndOnboarding(page: any) {
    await page.evaluate(() => {
      localStorage.setItem('primal_logic_consent_accepted', 'true');
      localStorage.setItem('primal_logic_onboarding_completed', 'true');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    // networkidleの代わりに、より具体的な要素を待つ
    await page.waitForSelector('.app-navigation, [class*="home"], [class*="Home"]', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(500);
  }

  test('ホーム画面 - デスクトップ表示', async ({ page }) => {
    await page.goto('/');
    await skipConsentAndOnboarding(page);
    
    // ホーム画面が表示されるまで待つ
    await page.waitForSelector('.home-screen-container, [class*="home"]', { timeout: 10000 });
    await page.waitForTimeout(2000); // アニメーション待ち
    
    // スクリーンショットを撮影（デスクトップサイズ）
    await expect(page).toHaveScreenshot('home-screen-desktop.png', {
      fullPage: true,
      maxDiffPixels: 100, // 許容する差分ピクセル数
    });
  });

  test('ホーム画面 - モバイル表示（iPhone 12）', async ({ page }) => {
    // iPhone 12のビューポートサイズに設定
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await skipConsentAndOnboarding(page);
    
    await page.waitForSelector('.home-screen-container, [class*="home"]', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // スクリーンショットを撮影（モバイルサイズ）
    await expect(page).toHaveScreenshot('home-screen-mobile-iphone12.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('入力画面（ButcherSelect） - デスクトップ表示', async ({ page }) => {
    await page.goto('/');
    await skipConsentAndOnboarding(page);
    
    // 食品追加ボタンをクリック
    const addFoodButton = page.getByText(/\+.*食品を追加|\+.*Add Food/i);
    await expect(addFoodButton).toBeVisible({ timeout: 10000 });
    await addFoodButton.click();
    await page.waitForTimeout(2000);
    
    // ButcherSelectが表示されるまで待つ（動物タブ🐄を探す）
    const beefTab = page.locator('button').filter({ hasText: /🐄|牛肉/ });
    await expect(beefTab.first()).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // スクリーンショットを撮影
    await expect(page).toHaveScreenshot('butcher-select-desktop.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('入力画面（ButcherSelect） - モバイル表示', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await skipConsentAndOnboarding(page);
    
    const addFoodButton = page.getByText(/\+.*食品を追加|\+.*Add Food/i);
    await expect(addFoodButton).toBeVisible({ timeout: 10000 });
    await addFoodButton.click();
    await page.waitForTimeout(2000);
    
    // ButcherSelectが表示されるまで待つ（動物タブ🐄を探す）
    const beefTab = page.locator('button').filter({ hasText: /🐄|牛肉/ });
    await expect(beefTab.first()).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('butcher-select-mobile.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('履歴画面 - デスクトップ表示', async ({ page }) => {
    await page.goto('/');
    await skipConsentAndOnboarding(page);
    
    // 履歴タブをクリック
    const historyButton = page.locator('button.app-nav-button').filter({ hasText: /履歴|History|📊/ });
    await expect(historyButton).toBeVisible({ timeout: 10000 });
    await historyButton.click();
    await page.waitForTimeout(2000);
    
    await page.waitForSelector('.history-screen-container, [class*="history"]', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('history-screen-desktop.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('履歴画面 - モバイル表示', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await skipConsentAndOnboarding(page);
    
    const historyButton = page.locator('button.app-nav-button').filter({ hasText: /履歴|History|📊/ });
    await expect(historyButton).toBeVisible({ timeout: 10000 });
    await historyButton.click();
    await page.waitForTimeout(2000);
    
    await page.waitForSelector('.history-screen-container, [class*="history"]', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('history-screen-mobile.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('Labs画面 - デスクトップ表示', async ({ page }) => {
    await page.goto('/');
    await skipConsentAndOnboarding(page);
    
    const labsButton = page.locator('button.app-nav-button').filter({ hasText: /その他|🧪/ });
    await expect(labsButton).toBeVisible({ timeout: 10000 });
    await labsButton.click();
    await page.waitForTimeout(2000);
    
    await page.waitForSelector('.labs-screen-container, [class*="labs"], [class*="Labs"]', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('labs-screen-desktop.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('Labs画面 - モバイル表示', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await skipConsentAndOnboarding(page);
    
    const labsButton = page.locator('button.app-nav-button').filter({ hasText: /その他|🧪/ });
    await expect(labsButton).toBeVisible({ timeout: 10000 });
    await labsButton.click();
    await page.waitForTimeout(2000);
    
    await page.waitForSelector('.labs-screen-container, [class*="labs"], [class*="Labs"]', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('labs-screen-mobile.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('設定画面 - デスクトップ表示', async ({ page }) => {
    await page.goto('/');
    await skipConsentAndOnboarding(page);
    
    const settingsButton = page.locator('button.app-nav-button').filter({ hasText: /設定|Settings|⚙️/ });
    await expect(settingsButton).toBeVisible({ timeout: 10000 });
    await settingsButton.click();
    await page.waitForTimeout(2000);
    
    await page.waitForSelector('[class*="settings"], [class*="Settings"], [class*="profile"]', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('settings-screen-desktop.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('設定画面 - モバイル表示', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await skipConsentAndOnboarding(page);
    
    const settingsButton = page.locator('button.app-nav-button').filter({ hasText: /設定|Settings|⚙️/ });
    await expect(settingsButton).toBeVisible({ timeout: 10000 });
    await settingsButton.click();
    await page.waitForTimeout(2000);
    
    await page.waitForSelector('[class*="settings"], [class*="Settings"], [class*="profile"]', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('settings-screen-mobile.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('AIチャットモーダル - デスクトップ表示', async ({ page }) => {
    await page.goto('/');
    await skipConsentAndOnboarding(page);
    
    // AIチャットボタンをクリック
    const aiChatButton = page.locator('.ai-chat-fab-button');
    await expect(aiChatButton).toBeVisible({ timeout: 10000 });
    await aiChatButton.click();
    await page.waitForTimeout(2000);
    
    // チャットUIが表示されるまで待つ
    await page.waitForSelector('.ai-chat-modal, .ai-chat-bubble', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('ai-chat-modal-desktop.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('AIチャットモーダル - モバイル表示', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await skipConsentAndOnboarding(page);
    
    // AIチャットボタンをクリック
    const aiChatButton = page.locator('.ai-chat-fab-button');
    await expect(aiChatButton).toBeVisible({ timeout: 10000 });
    await aiChatButton.click();
    await page.waitForTimeout(2000);
    
    // チャットUIが表示されるまで待つ
    await page.waitForSelector('.ai-chat-modal, .ai-chat-bubble', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('ai-chat-modal-mobile.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('栄養素ゲージ - 詳細表示', async ({ page }) => {
    await page.goto('/');
    await skipConsentAndOnboarding(page);
    
    // 栄養素ゲージが表示されるまで待つ（ナトリウムのラベルを探す）
    const sodiumLabel = page.getByText(/ナトリウム|Sodium/i).first();
    await expect(sodiumLabel).toBeVisible({ timeout: 10000 }).catch(async () => {
      // ナトリウムが見つからない場合は、他の栄養素ゲージを探す
      const anyGauge = page.locator('[class*="gauge"], [class*="Gauge"]').first();
      await expect(anyGauge).toBeVisible({ timeout: 10000 });
      await page.waitForTimeout(2000);
      await expect(page).toHaveScreenshot('nutrient-gauge-section.png', {
        fullPage: true,
        maxDiffPixels: 100,
      });
    });
    
    if (await sodiumLabel.isVisible().catch(() => false)) {
      await page.waitForTimeout(2000);
      
      // 栄養素ゲージ部分のスクリーンショット（ナトリウムゲージを含むセクション）
      const gaugeSection = sodiumLabel.locator('..').locator('..').first();
      await expect(gaugeSection).toHaveScreenshot('nutrient-gauge-section.png', {
        maxDiffPixels: 100,
      });
    }
  });

  test('P:F比率ゲージ表示', async ({ page }) => {
    await page.goto('/');
    await skipConsentAndOnboarding(page);
    
    // P:F比率ゲージが表示されるまで待つ
    const pfGauge = page.locator('[class*="pf-ratio"], [class*="PFRatio"]').first();
    await expect(pfGauge).toBeVisible({ timeout: 10000 }).catch(() => {
      // P:F比率ゲージが見つからない場合は、テキストで探す
      return page.getByText(/P:F|P\/F|タンパク質.*脂質/i).first();
    });
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('pf-ratio-gauge.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('オメガ3/6比率ゲージ表示', async ({ page }) => {
    await page.goto('/');
    await skipConsentAndOnboarding(page);
    
    // オメガ比率ゲージが表示されるまで待つ
    const omegaGauge = page.locator('[class*="omega"], [class*="Omega"]').first();
    await expect(omegaGauge).toBeVisible({ timeout: 10000 }).catch(() => {
      // オメガ比率ゲージが見つからない場合は、テキストで探す
      return page.getByText(/オメガ|Omega|ω3.*ω6/i).first();
    });
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('omega-ratio-gauge.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('Argument Card表示', async ({ page }) => {
    await page.goto('/');
    await skipConsentAndOnboarding(page);
    
    // 栄養素ゲージをクリックしてArgument Cardを表示
    // まず、表示されている栄養素ゲージを探す（ナトリウム、亜鉛、マグネシウムなど）
    const nutrientLabels = [
      page.getByText(/ナトリウム|Sodium/i).first(),
      page.getByText(/亜鉛|Zinc/i).first(),
      page.getByText(/マグネシウム|Magnesium/i).first(),
      page.getByText(/鉄|Iron/i).first(),
    ];
    
    let clicked = false;
    for (const label of nutrientLabels) {
      if (await label.isVisible().catch(() => false)) {
        const gaugeContainer = label.locator('..').or(label.locator('../..'));
        await gaugeContainer.first().click();
        await page.waitForTimeout(2000);
        clicked = true;
        break;
      }
    }
    
    if (!clicked) {
      // 栄養素ゲージが見つからない場合は、ゲージコンテナを直接探す
      const gaugeContainer = page.locator('[class*="gauge"], [class*="Gauge"]').first();
      await expect(gaugeContainer).toBeVisible({ timeout: 10000 });
      await gaugeContainer.click();
      await page.waitForTimeout(2000);
    }
    
    // Argument Cardが表示されるまで待つ
    await page.waitForSelector('[class*="argument-card"], [class*="ArgumentCard"]', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('argument-card-desktop.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('Argument Card表示 - モバイル表示', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await skipConsentAndOnboarding(page);
    
    // 栄養素ゲージをクリックしてArgument Cardを表示
    const nutrientLabels = [
      page.getByText(/ナトリウム|Sodium/i).first(),
      page.getByText(/亜鉛|Zinc/i).first(),
      page.getByText(/マグネシウム|Magnesium/i).first(),
      page.getByText(/鉄|Iron/i).first(),
    ];
    
    let clicked = false;
    for (const label of nutrientLabels) {
      if (await label.isVisible().catch(() => false)) {
        const gaugeContainer = label.locator('..').or(label.locator('../..'));
        await gaugeContainer.first().click();
        await page.waitForTimeout(2000);
        clicked = true;
        break;
      }
    }
    
    if (!clicked) {
      const gaugeContainer = page.locator('[class*="gauge"], [class*="Gauge"]').first();
      await expect(gaugeContainer).toBeVisible({ timeout: 10000 });
      await gaugeContainer.click();
      await page.waitForTimeout(2000);
    }
    
    // Argument Cardが表示されるまで待つ
    await page.waitForSelector('[class*="argument-card"], [class*="ArgumentCard"]', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('argument-card-mobile.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('ButcherSelect - 部位選択状態', async ({ page }) => {
    await page.goto('/');
    await skipConsentAndOnboarding(page);
    
    // 食品追加ボタンをクリック
    const addFoodButton = page.getByText(/\+.*食品を追加|\+.*Add Food/i);
    await expect(addFoodButton).toBeVisible({ timeout: 10000 });
    await addFoodButton.click();
    await page.waitForTimeout(2000);
    
    // ButcherSelectが表示されるまで待つ
    const beefTab = page.locator('button').filter({ hasText: /🐄|牛肉/ });
    await expect(beefTab.first()).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1000);
    
    // 最初の部位を選択
    const firstPart = page.locator('button').filter({ hasText: /ロース|リブロース|サーロイン/i }).first();
    if (await firstPart.isVisible().catch(() => false)) {
      await firstPart.click();
      await page.waitForTimeout(2000);
    }
    
    await expect(page).toHaveScreenshot('butcher-select-part-selected.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });
});
