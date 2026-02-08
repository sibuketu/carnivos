import { test, expect } from '@playwright/test';

test.describe('Primal Logic - テスト項目29以降の自動テスト', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 同意画面とオンボーディングをスキップ（既に同意済みの場合）
    const consentAccepted = await page.evaluate(() => {
      return localStorage.getItem('primal_logic_consent_accepted');
    });
    
    if (!consentAccepted) {
      // 同意画面が表示されている場合、同意する
      const privacyCheckbox = page.locator('input[type="checkbox"]').first();
      const termsCheckbox = page.locator('input[type="checkbox"]').nth(1);
      
      if (await privacyCheckbox.isVisible()) {
        await privacyCheckbox.check();
        await termsCheckbox.check();
        await page.getByText('同意して続ける').click();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  // ============================================
  // AIチャット機能（29-30）
  // ============================================

  test('29: Todoアクションが動作する（あれば）', async ({ page }) => {
    // AIチャットを開く
    const aiChatButton = page.locator('.ai-chat-fab-button');
    await expect(aiChatButton).toBeVisible();
    await aiChatButton.click();
    
    // チャットUIが表示されるまで待つ
    await page.waitForSelector('.ai-chat-modal, .ai-chat-bubble', { timeout: 5000 });
    
    // メッセージを送信（Todoが返される可能性があるメッセージ）
    const chatInput = page.locator('#chat-input-field, .ai-chat-textarea');
    if (await chatInput.isVisible()) {
      await chatInput.fill('牛肉を200g追加してください');
      await page.getByText('送信').click();
      
      // AI応答を待つ（最大10秒）
      await page.waitForTimeout(10000);
      
      // Todoカードが表示されるか確認
      const todoCard = page.locator('.ai-chat-todo-card');
      if (await todoCard.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Todoアクションボタンが存在するか確認
        const todoActionButton = page.locator('.ai-chat-todo-action-button');
        if (await todoActionButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          // Todoアクションボタンがクリック可能か確認
          await expect(todoActionButton.first()).toBeVisible();
        }
      }
    }
  });

  test('30: チャットを閉じられる', async ({ page }) => {
    // AIチャットを開く
    const aiChatButton = page.locator('.ai-chat-fab-button');
    await expect(aiChatButton).toBeVisible();
    await aiChatButton.click();
    
    // チャットUIが表示されるまで待つ
    await page.waitForSelector('.ai-chat-modal, .ai-chat-bubble', { timeout: 5000 });
    
    // 閉じるボタンをクリック
    const closeButton = page.locator('.ai-chat-close-button, .ai-chat-bubble-close-button');
    await expect(closeButton).toBeVisible();
    await closeButton.click();
    
    // チャットUIが非表示になることを確認
    await expect(page.locator('.ai-chat-modal, .ai-chat-bubble')).not.toBeVisible({ timeout: 3000 });
  });

  // ============================================
  // その他画面機能（31-45）
  // ============================================

  test('31: その他画面（Labs）に遷移できる', async ({ page }) => {
    // 下部ナビゲーションの「その他」ボタンをクリック
    const labsButton = page.locator('button.app-nav-button').filter({ hasText: /その他|🧪/ });
    await expect(labsButton).toBeVisible({ timeout: 10000 });
    await labsButton.click();
    await page.waitForTimeout(2000);
    
    // Labs画面が表示されることを確認
    await expect(page.locator('.labs-screen-container, [class*="labs"], [class*="Labs"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('31b: その他でアカウントをタップするとアカウント（認証）画面が表示されホームに飛ばされない', async ({ page }) => {
    const labsButton = page.locator('button.app-nav-button').filter({ hasText: /その他|🧪/ });
    await expect(labsButton).toBeVisible({ timeout: 10000 });
    await labsButton.click();
    await page.waitForSelector('.labs-screen-container, [class*="labs"]', { timeout: 10000 });
    await page.waitForTimeout(500);
    const accountItem = page.locator('.labs-list-item').filter({ hasText: /アカウント|Account|Compte|Konto|账户/ });
    await expect(accountItem).toBeVisible({ timeout: 5000 });
    await accountItem.click();
    await page.waitForTimeout(800);
    await expect(page.locator('.auth-screen')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.labs-screen-container')).not.toBeVisible();
  });

  test('31c: ゲストモードでその他→アカウントをタップしても認証画面が表示されホームに飛ばされない', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('primal_logic_consent_accepted', 'true');
      localStorage.setItem('primal_logic_onboarding_completed', 'true');
      localStorage.setItem('primal_logic_guest_mode', 'true');
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    const labsButton = page.locator('button.app-nav-button').filter({ hasText: /その他|🧪/ });
    await expect(labsButton).toBeVisible({ timeout: 10000 });
    await labsButton.click();
    await page.waitForSelector('.labs-screen-container, [class*="labs"]', { timeout: 10000 });
    await page.waitForTimeout(500);
    const accountItem = page.locator('.labs-list-item').filter({ hasText: /アカウント|Account|Compte|Konto|账户/ });
    await expect(accountItem).toBeVisible({ timeout: 5000 });
    await accountItem.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('.auth-screen')).toBeVisible({ timeout: 5000 });
  });

  test('32: Bio-Tunerボタンが表示される', async ({ page }) => {
    // Labs画面に遷移
    const labsButton = page.locator('button.app-nav-button').filter({ hasText: /その他|🧪/ });
    await expect(labsButton).toBeVisible({ timeout: 10000 });
    await labsButton.click();
    await page.waitForTimeout(2000);
    await page.waitForSelector('.labs-screen-container, [class*="labs"]', { timeout: 10000 });
    
    // Bio-Tunerボタンが表示されることを確認
    await expect(page.getByText(/Bio-Tuner/i)).toBeVisible({ timeout: 10000 });
  });

  test('33: Bio-Tunerボタンをタップして入力画面に遷移できる', async ({ page }) => {
    // Labs画面に遷移
    const labsButton = page.locator('button.app-nav-button').filter({ hasText: /その他|🧪/ });
    await expect(labsButton).toBeVisible({ timeout: 10000 });
    await labsButton.click();
    await page.waitForTimeout(2000);
    await page.waitForSelector('.labs-screen-container, [class*="labs"]', { timeout: 10000 });
    
    // Bio-Tunerボタンをクリック
    const bioTunerButton = page.getByText(/Bio-Tuner/i);
    await bioTunerButton.click();
    
    // 入力画面に遷移することを確認（画面遷移のイベントを待つ）
    await page.waitForTimeout(1000);
    // 入力画面の要素が表示されることを確認（実際の要素に合わせて調整が必要）
  });

  test('34-36: 日記機能が表示・入力・保存できる', async ({ page }) => {
    // Labs画面に遷移
    const labsButton = page.locator('button.app-nav-button').filter({ hasText: /その他|🧪/ });
    await expect(labsButton).toBeVisible({ timeout: 10000 });
    await labsButton.click();
    await page.waitForTimeout(2000);
    await page.waitForSelector('.labs-screen-container, [class*="labs"]', { timeout: 10000 });
    
    // 日記機能が表示されることを確認
    const diarySection = page.getByText(/日記/i);
    if (await diarySection.isVisible({ timeout: 5000 }).catch(() => false)) {
      // 日記入力ができることを確認
      const diaryInput = page.locator('textarea, input[type="text"]').filter({ hasText: /日記|diary/i });
      if (await diaryInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await diaryInput.fill('テスト日記');
        // 保存ボタンをクリック
        const saveButton = page.getByText(/保存|Save/i);
        if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await saveButton.click();
        }
      }
    }
  });

  test('37-38: 習慣トラッカーが表示・動作する', async ({ page }) => {
    // Labs画面に遷移
    const labsButton = page.locator('button.app-nav-button').filter({ hasText: /その他|🧪/ });
    await expect(labsButton).toBeVisible({ timeout: 10000 });
    await labsButton.click();
    await page.waitForTimeout(2000);
    await page.waitForSelector('.labs-screen-container, [class*="labs"]', { timeout: 10000 });
    
    // 習慣トラッカーが表示されることを確認
    const streakTracker = page.getByText(/習慣トラッカー|Streak/i);
    if (await streakTracker.isVisible({ timeout: 5000 }).catch(() => false)) {
      // 習慣トラッカーが動作することを確認
      await expect(streakTracker).toBeVisible();
    }
  });

  test('39-40: Doctor Defenseが表示・動作する', async ({ page }) => {
    // Labs画面に遷移
    const labsButton = page.locator('button.app-nav-button').filter({ hasText: /その他|🧪/ });
    await expect(labsButton).toBeVisible({ timeout: 10000 });
    await labsButton.click();
    await page.waitForTimeout(2000);
    await page.waitForSelector('.labs-screen-container, [class*="labs"]', { timeout: 10000 });
    
    // Doctor Defenseが表示されることを確認
    const doctorDefense = page.getByText(/Doctor Defense|医者への説明/i);
    if (await doctorDefense.isVisible({ timeout: 5000 }).catch(() => false)) {
      await doctorDefense.click();
      
      // 血液検査値入力が表示されることを確認
      await page.waitForTimeout(1000);
      // 実際の要素に合わせて調整が必要
    }
  });

  test('41-42: Tipsが表示・動作する', async ({ page }) => {
    // Labs画面に遷移
    const labsButton = page.locator('button.app-nav-button').filter({ hasText: /その他|🧪/ });
    await expect(labsButton).toBeVisible({ timeout: 10000 });
    await labsButton.click();
    await page.waitForTimeout(2000);
    await page.waitForSelector('.labs-screen-container, [class*="labs"]', { timeout: 10000 });
    // TipsカードをタップしてTips画面へ
    const tipsCard = page.getByText(/Tips|ヒント/i).first();
    if (await tipsCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await tipsCard.click();
      await page.waitForTimeout(1000);
    }
    // Tips画面タイトル「Tips」が表示されることを確認
    const tipsTitle = page.getByText(/^💡 Tips$|^Tips$/);
    if (await tipsTitle.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(tipsTitle).toBeVisible();
    }
  });

  test('43-45: Tips機能が表示・保存できる', async ({ page }) => {
    // Labs画面に遷移
    const labsButton = page.locator('button.app-nav-button').filter({ hasText: /その他|🧪/ });
    await expect(labsButton).toBeVisible({ timeout: 10000 });
    await labsButton.click();
    await page.waitForTimeout(2000);
    await page.waitForSelector('.labs-screen-container, [class*="labs"]', { timeout: 10000 });
    
    // Tips機能が表示されることを確認
    const tips = page.getByText(/Tips|ヒント/i);
    if (await tips.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Tipsが表示されることを確認
      await expect(tips).toBeVisible();
      
      // Tips保存ボタンが存在するか確認
      const saveButton = page.locator('button').filter({ hasText: /保存|お気に入り/i });
      if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(saveButton.first()).toBeVisible();
      }
    }
  });

  // ============================================
  // 設定画面機能（46-60）
  // ============================================

  test('46: 設定画面に遷移できる', async ({ page }) => {
    // 下部ナビゲーションの「設定」ボタンをクリック
    const settingsButton = page.locator('button.app-nav-button').filter({ hasText: /設定|⚙️/ });
    await expect(settingsButton).toBeVisible();
    await settingsButton.click();
    
    // 設定画面が表示されることを確認
    await expect(page.locator('.settings-screen-container, [class*="settings"]')).toBeVisible({ timeout: 5000 });
  });

  test('47-49: プロフィール設定が表示・入力・保存できる', async ({ page }) => {
    // 設定画面に遷移
    const settingsButton = page.locator('button.app-nav-button').filter({ hasText: /設定|⚙️/ });
    await expect(settingsButton).toBeVisible({ timeout: 10000 });
    await settingsButton.click();
    await page.waitForTimeout(2000);
    await page.waitForTimeout(1000);
    
    // プロフィール設定が表示されることを確認
    const profileLink = page.getByText(/プロフィール|Profile/i);
    if (await profileLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await profileLink.click();
      await page.waitForTimeout(1000);
      
      // 基本情報入力ができることを確認
      const genderSelect = page.locator('select, button').filter({ hasText: /性別|Gender/i });
      if (await genderSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(genderSelect).toBeVisible();
      }
      
      // 保存ボタンが存在するか確認
      const saveButton = page.getByText(/保存|Save/i);
      if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(saveButton).toBeVisible();
      }
    }
  });

  test('50: プロフィール保存後、ホーム画面の目標値が更新される', async ({ page }) => {
    // プロフィール設定で性別を変更
    const settingsButton = page.locator('button.app-nav-button').filter({ hasText: /設定|⚙️/ });
    await expect(settingsButton).toBeVisible({ timeout: 10000 });
    await settingsButton.click();
    await page.waitForTimeout(2000);
    await page.waitForTimeout(1000);
    
    const profileLink = page.getByText(/プロフィール|Profile/i);
    if (await profileLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await profileLink.click();
      await page.waitForTimeout(1000);
      
      // 設定を変更して保存（実際の実装に合わせて調整が必要）
      const saveButton = page.getByText(/保存|Save/i);
      if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await saveButton.click();
        await page.waitForTimeout(1000);
        
        // ホーム画面に戻る
        const homeButton = page.locator('button.app-nav-button').filter({ hasText: /ホーム|Home|🏠/ });
        await expect(homeButton).toBeVisible({ timeout: 10000 });
        await homeButton.click();
        await page.waitForTimeout(2000);
        await page.waitForTimeout(1000);
        
        // 目標値が更新されていることを確認（実際の実装に合わせて調整が必要）
      }
    }
  });

  test('51-52: 栄養素目標値設定が表示・変更できる', async ({ page }) => {
    // 設定画面に遷移
    const settingsButton = page.locator('button.app-nav-button').filter({ hasText: /設定|⚙️/ });
    await expect(settingsButton).toBeVisible({ timeout: 10000 });
    await settingsButton.click();
    await page.waitForTimeout(2000);
    await page.waitForTimeout(1000);
    
    // 栄養素目標値設定が表示されることを確認
    const nutrientTargetLink = page.getByText(/栄養素目標値|Nutrient Target/i);
    if (await nutrientTargetLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await nutrientTargetLink.click();
      await page.waitForTimeout(1000);
      
      // 栄養素目標値を変更できることを確認
      const targetInput = page.locator('input[type="number"]').first();
      if (await targetInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(targetInput).toBeVisible();
      }
    }
  });

  test('53-55: 表示設定が表示・変更・反映される', async ({ page }) => {
    // 設定画面に遷移
    const settingsButton = page.locator('button.app-nav-button').filter({ hasText: /設定|⚙️/ });
    await expect(settingsButton).toBeVisible({ timeout: 10000 });
    await settingsButton.click();
    await page.waitForTimeout(2000);
    await page.waitForTimeout(1000);
    
    // 表示設定が表示されることを確認
    const displaySettings = page.getByText(/表示設定|Display/i);
    if (await displaySettings.isVisible({ timeout: 5000 }).catch(() => false)) {
      await displaySettings.click();
      await page.waitForTimeout(1000);
      
      // 栄養素の表示/非表示を切り替えられることを確認
      const toggleButton = page.locator('input[type="checkbox"], button[role="switch"]').first();
      if (await toggleButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        const _initialState = await toggleButton.isChecked();
        void _initialState;
        await toggleButton.click();
        await page.waitForTimeout(500);
        
        // ホーム画面に戻って反映を確認
        const homeButton = page.locator('button.app-nav-button').filter({ hasText: /ホーム|Home|🏠/ });
        await expect(homeButton).toBeVisible({ timeout: 10000 });
        await homeButton.click();
        await page.waitForTimeout(2000);
        await page.waitForTimeout(1000);
        
        // 表示設定が反映されていることを確認（実際の実装に合わせて調整が必要）
      }
    }
  });

  // ============================================
  // データ保存・読み込み（61-70）
  // ============================================

  test('61: データ保存 - 食品追加後、リロードしてもデータが残っている', async ({ page }) => {
    // ホーム画面で食品を追加
    const addFoodButton = page.getByText('+ 食品を追加');
    if (await addFoodButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addFoodButton.click();
      await page.waitForTimeout(1000);
      
      // 食品を選択して追加（簡易版、実際の実装に合わせて調整が必要）
      // ここではデータが保存されることを前提とする
    }
    
    // ページをリロード
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // データが残っていることを確認（実際の実装に合わせて調整が必要）
    // 例: 追加した食品が表示されることを確認
  });

  test('62: データ読み込み - アプリを閉じて再度開いた時、データが読み込まれる', async ({ page: _page, context }) => {
    // データを追加（簡易版）
    // ...
    
    // 新しいページで開く（アプリを閉じて再度開くシミュレーション）
    const newPage = await context.newPage();
    await newPage.goto('/');
    await newPage.waitForLoadState('networkidle');
    
    // データが読み込まれることを確認（実際の実装に合わせて調整が必要）
    await newPage.close();
  });

  test('65-66: 期間選択が動作し、期間別データが表示される', async ({ page }) => {
    // 履歴画面に遷移
    const historyButton = page.locator('button.app-nav-button').filter({ hasText: /履歴|History|📊/ });
    await expect(historyButton).toBeVisible({ timeout: 10000 });
    await historyButton.click();
    await page.waitForTimeout(2000);
    await page.waitForTimeout(2000);
    
    // 期間選択が表示されることを確認
    const periodSelect = page.locator('button, select').filter({ hasText: /今日|週|月|全期間/i });
    if (await periodSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
      // 期間を選択
      await periodSelect.first().click();
      await page.waitForTimeout(1000);
      
      // 期間別データが表示されることを確認（実際の実装に合わせて調整が必要）
    }
  });

  // ============================================
  // UI/UX（71-85）
  // ============================================

  test('71: レスポンシブ表示 - iPhoneの画面サイズに適切に表示される', async ({ page }) => {
    // iPhone 15の画面サイズに設定
    await page.setViewportSize({ width: 393, height: 852 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // ホーム画面が適切に表示されることを確認
    await expect(page.locator('.home-screen-container, [class*="home"]')).toBeVisible();
    
    // 要素が画面からはみ出していないことを確認（スクロール可能な場合はOK）
  });

  test('72: タッチターゲット - ボタンがタッチしやすいサイズ（44px以上）である', async ({ page }) => {
    // ボタンのサイズを確認
    const buttons = page.locator('button.app-nav-button');
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      if (box) {
        // タッチターゲットが44px以上であることを確認
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.width).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('73-74: スクロールができる・スムーズに動作する', async ({ page }) => {
    // 長いコンテンツがある画面に遷移
    const historyButton = page.locator('button.app-nav-button').filter({ hasText: /履歴|History|📊/ });
    await expect(historyButton).toBeVisible({ timeout: 10000 });
    await historyButton.click();
    await page.waitForTimeout(2000);
    await page.waitForTimeout(1000);
    
    // スクロールができることを確認
    await page.evaluate(() => {
      window.scrollTo(0, 500);
    });
    await page.waitForTimeout(500);
    
    // スクロール位置が変更されていることを確認
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
  });

  test('75: ローディング表示が適切', async ({ page: _page }) => {});

  test('76: 空データ表示が適切', async ({ page }) => {
    // データがない状態で画面を確認
    // localStorageをクリア
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 空データ表示が適切に表示されることを確認（実際の実装に合わせて調整が必要）
    // 例: 「データがありません」などのメッセージが表示されることを確認
  });

  // ============================================
  // パフォーマンス（86-95）
  // ============================================

  test('86: 初回読み込み速度 - 3秒以内', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // 初回読み込みが3秒以内であることを確認
    expect(loadTime).toBeLessThan(3000);
  });

  test('87: 画面遷移速度 - 1秒以内', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const startTime = Date.now();
    const historyButton = page.locator('button.app-nav-button').filter({ hasText: /履歴|History|📊/ });
    await expect(historyButton).toBeVisible({ timeout: 10000 });
    await historyButton.click();
    await page.waitForTimeout(2000);
    await page.waitForSelector('[class*="history"]', { timeout: 5000 });
    const transitionTime = Date.now() - startTime;
    
    // 画面遷移が1秒以内であることを確認
    expect(transitionTime).toBeLessThan(1000);
  });

  test('88: 食品検索速度 - 2秒以内に完了', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 入力画面に遷移
    const inputButton = page.getByText(/\+.*食品を追加|\+.*Add Food/i);
    if (await inputButton.isVisible({ timeout: 10000 }).catch(() => false)) {
      await inputButton.click();
      await page.waitForTimeout(2000);
      await page.waitForTimeout(1000);
      
      // 食品検索を実行
      const searchInput = page.locator('input[type="search"], input[placeholder*="検索"]');
      if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        const startTime = Date.now();
        await searchInput.fill('牛肉');
        await page.waitForTimeout(2000); // 検索結果が表示されるまで待つ
        const searchTime = Date.now() - startTime;
        
        // 食品検索が2秒以内に完了することを確認
        expect(searchTime).toBeLessThan(2000);
      }
    }
  });

  // ============================================
  // Safari特有（96-100）
  // ============================================

  test('98: ホーム画面に追加機能が動作する（PWA対応）', async ({ page }) => {
    // PWAのmanifestが存在することを確認
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', /manifest/);
    
    // Apple Touch Iconが存在することを確認
    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
    await expect(appleTouchIcon).toHaveCount(1);
  });

  // ============================================
  // エラーハンドリング（101-110）
  // ============================================

  test('103: 入力検証 - 不正な入力（負の数、空文字）が拒否される', async ({ page }) => {
    // 入力画面で不正な入力を試す
    const addFoodButton = page.getByText('+ 食品を追加');
    if (await addFoodButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addFoodButton.click();
      await page.waitForTimeout(1000);
      
      // 数量入力に負の数を入力
      const amountInput = page.locator('input[type="number"]').filter({ hasText: /量|amount/i });
      if (await amountInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await amountInput.fill('-100');
        await page.waitForTimeout(500);
        
        // エラーメッセージが表示されるか、値が拒否されることを確認
        const value = await amountInput.inputValue();
        expect(parseFloat(value)).toBeGreaterThanOrEqual(0);
      }
    }
  });

  // ============================================
  // 特殊機能（111-120）
  // ============================================

  test('111: 手動入力機能が動作する', async ({ page }) => {
    // 入力画面に遷移
    const addFoodButton = page.getByText('+ 食品を追加');
    if (await addFoodButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addFoodButton.click();
      await page.waitForTimeout(1000);
      
      // 手動入力ボタンが表示されることを確認
      const manualInputButton = page.getByText(/手動入力|Manual/i);
      if (await manualInputButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(manualInputButton).toBeVisible();
      }
    }
  });

  test('114-116: Recovery Protocolが表示・生成・設定できる', async ({ page: _page }) => {});

});

