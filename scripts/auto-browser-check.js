/**
 * ブラウザ操作を自動化してUIを確認するスクリプト
 * Playwrightを使用してローカルのUIを確認
 */

// Playwrightを使用してブラウザ操作を自動化
// 注意: このスクリプトはNode.jsのCommonJS形式で記述されています
const { chromium } = require('playwright');

const NETLIFY_URL = 'https://strong-travesseiro-0a6a1c.netlify.app';
const LOCAL_URL = 'http://localhost:4173';

async function checkUI() {
  console.log('ブラウザを起動しています...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // ローカルのUIを確認
    console.log(`ローカルのUIを確認中: ${LOCAL_URL}`);
    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // 2秒待機

    // HistoryScreenの確認
    console.log('HistoryScreenを確認中...');
    const historyButton = await page.locator('text=History').first();
    if (await historyButton.isVisible()) {
      await historyButton.click();
      await page.waitForTimeout(1000);

      // 期間フィルターボタンの確認
      const periodFilters = ['Today', '7 day', '30 day', 'All', '⭐ All'];
      for (const filter of periodFilters) {
        const button = await page.locator(`text=${filter}`).first();
        const isVisible = await button.isVisible();
        console.log(`  ${filter}: ${isVisible ? '✓ 表示されています' : '✗ 表示されていません'}`);
      }

      // タブの確認
      const tabs = ['Summary', 'History', 'Photo Gallery'];
      for (const tab of tabs) {
        const tabButton = await page.locator(`text=${tab}`).first();
        const isVisible = await tabButton.isVisible();
        console.log(`  ${tab}タブ: ${isVisible ? '✓ 表示されています' : '✗ 表示されていません'}`);
      }
    }

    // HomeScreenの確認
    console.log('HomeScreenを確認中...');
    const homeButton = await page.locator('text=Home').first();
    if (await homeButton.isVisible()) {
      await homeButton.click();
      await page.waitForTimeout(1000);

      // 栄養ゲージの確認
      const nutrientGauges = await page.locator('.minigauge-grid').first();
      const isVisible = await nutrientGauges.isVisible();
      console.log(`  栄養ゲージ: ${isVisible ? '✓ 表示されています' : '✗ 表示されていません'}`);

      // Fasting Timerの確認
      const fastingTimer = await page.locator('text=Fasting').first();
      const timerVisible = await fastingTimer.isVisible();
      console.log(`  Fasting Timer: ${timerVisible ? '✓ 表示されています' : '✗ 表示されていません'}`);
    }

    // ProfileScreenの確認
    console.log('ProfileScreenを確認中...');
    const profileButton = await page.locator('text=Setting').first();
    if (await profileButton.isVisible()) {
      await profileButton.click();
      await page.waitForTimeout(1000);

      const title = await page.locator('h1').first();
      const titleText = await title.textContent();
      console.log(`  タイトル: ${titleText === 'Setting' ? '✓ 「Setting」が正しく表示されています' : `✗ 「${titleText}」が表示されています（「Setting」である必要があります）`}`);
    }

    // LabsScreenの確認
    console.log('LabsScreenを確認中...');
    const labsButton = await page.locator('text=Labs').first();
    if (await labsButton.isVisible()) {
      await labsButton.click();
      await page.waitForTimeout(1000);

      // Tipカードの確認
      const tipCard = await page.locator('text=💡 Tip').first();
      const tipVisible = await tipCard.isVisible();
      console.log(`  Tipカード: ${tipVisible ? '✓ 表示されています' : '✗ 表示されていません'}`);

      // View Tip Listボタンの確認
      const viewTipButton = await page.locator('text=View Tip List').first();
      const buttonVisible = await viewTipButton.isVisible();
      console.log(`  View Tip Listボタン: ${buttonVisible ? '✓ 表示されています' : '✗ 表示されていません'}`);
    }

    console.log('\n確認完了！');
    console.log('ブラウザは5秒後に閉じます...');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await browser.close();
  }
}

// スクリプトを実行
checkUI().catch(console.error);
