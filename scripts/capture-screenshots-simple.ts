/**
 * Primal Logic - 全画面スクリーンショット取得スクリプト（シンプル版）
 *
 * 開発サーバーが起動している状態で実行してください。
 * 使用方法: npx tsx scripts/capture-screenshots-simple.ts
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = path.join(__dirname, '../screenshots-for-gemini');
const BASE_URL = 'http://localhost:5174';

// 全画面のリスト
const SCREENS = [
  { name: 'consent', description: '同意画面' },
  { name: 'onboarding', description: 'オンボーディング画面' },
  { name: 'home', description: 'ホーム画面（メインダッシュボード）' },
  { name: 'profile', description: 'プロファイル設定画面' },
  { name: 'history', description: '履歴画面' },
  { name: 'labs', description: 'Labs画面（実験的機能）' },
  { name: 'settings', description: '設定画面' },
  { name: 'customFood', description: 'カスタム食品登録画面' },
  { name: 'input', description: '日次入力画面' },
  { name: 'gift', description: 'Gift画面（コミュニティ機能）' },
  { name: 'bioHack', description: 'Bio-Hackダッシュボード画面' },
  { name: 'ifThenRules', description: 'If-Thenルール画面' },
];

async function captureScreenshots() {
  // スクリーンショットディレクトリを作成
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 }, // iPhone 15幅
  });
  const page = await context.newPage();

  console.log('📸 スクリーンショット取得を開始します...\n');

  for (const screen of SCREENS) {
    try {
      console.log(`📷 ${screen.description} (${screen.name}) を取得中...`);

      // localStorageを設定して画面を表示
      if (screen.name === 'consent') {
        await page.evaluate(() => {
          localStorage.removeItem('primal_logic_consent_accepted');
          localStorage.removeItem('primal_logic_onboarding_completed');
        });
        await page.goto(BASE_URL);
      } else if (screen.name === 'onboarding') {
        await page.evaluate(() => {
          localStorage.setItem('primal_logic_consent_accepted', 'true');
          localStorage.removeItem('primal_logic_onboarding_completed');
        });
        await page.goto(BASE_URL);
      } else {
        await page.evaluate(() => {
          localStorage.setItem('primal_logic_consent_accepted', 'true');
          localStorage.setItem('primal_logic_onboarding_completed', 'true');
        });
        await page.goto(BASE_URL);
        // 画面遷移（CustomEventを使用）
        await page.evaluate((screenName) => {
          const event = new CustomEvent('navigateToScreen', { detail: screenName });
          window.dispatchEvent(event);
        }, screen.name);
      }

      // 画面の読み込みを待機
      await page.waitForTimeout(2000);

      // スクリーンショットを取得
      const screenshotPath = path.join(SCREENSHOT_DIR, `${screen.name}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });

      console.log(`  ✓ 保存完了: ${screenshotPath}\n`);
    } catch (error) {
      console.error(`  ✗ エラー: ${screen.name}`, error);
    }
  }

  // スクリーンショット一覧を生成
  const screenshotListPath = path.join(SCREENSHOT_DIR, 'SCREENSHOT_LIST.md');
  const markdown = `# スクリーンショット一覧

以下のスクリーンショットをGeminiに送信してください。

## 📸 スクリーンショット一覧

${SCREENS.map(
  (s, index) => `
### ${index + 1}. ${s.description} (${s.name})

- **ファイルパス**: \`C:\\Users\\susam\\Downloads\\新しいフォルダー\\docs\\primal-logic-app\\primal-logic-web\\screenshots-for-gemini\\${s.name}.png\`
- **説明**: ${s.description}
`
).join('\n')}

---

## 💬 Geminiへの送信メッセージ例

\`\`\`
以下のスクリーンショットを送信します。Primal Logicアプリの全画面のスクリーンショットです。

送信ファイル：
${SCREENS.map((s) => `- ${s.name}.png (${s.description})`).join('\n')}

これらのスクリーンショットを参考に、カメラ機能統合の要件定義をお願いします。
\`\`\`
`;

  fs.writeFileSync(screenshotListPath, markdown);
  console.log(`✓ スクリーンショット一覧を保存: ${screenshotListPath}`);

  await browser.close();
  console.log('\n✅ 全てのスクリーンショット取得が完了しました！');
}

// 実行
captureScreenshots().catch(console.error);

