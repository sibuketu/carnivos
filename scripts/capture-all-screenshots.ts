/**
 * Primal Logic - 全画面スクリーンショット取得スクリプト
 *
 * アプリの全画面のスクリーンショットを自動取得し、Geminiに共有するための画像を生成します。
 */

import { test, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = path.join(__dirname, '../screenshots-for-gemini');
const BASE_URL = 'http://localhost:5173';

// 全画面のリスト
const SCREENS: Array<{
  name: string;
  screen: string;
  description: string;
  requiresAuth?: boolean;
  requiresOnboarding?: boolean;
  setup?: (page: Page) => Promise<void>;
}> = [
    {
      name: 'consent',
      screen: 'consent',
      description: '同意画面',
      setup: async (page) => {
        // localStorageをクリアして同意画面を表示
        await page.evaluate(() => {
          localStorage.removeItem('primal_logic_consent_accepted');
          localStorage.removeItem('primal_logic_onboarding_completed');
        });
        await page.reload();
        await page.waitForTimeout(1000);
      },
    },
    {
      name: 'onboarding',
      screen: 'onboarding',
      description: 'オンボーディング画面',
      setup: async (page) => {
        await page.evaluate(() => {
          localStorage.setItem('primal_logic_consent_accepted', 'true');
          localStorage.removeItem('primal_logic_onboarding_completed');
        });
        await page.reload();
        await page.waitForTimeout(1000);
      },
    },
    {
      name: 'home',
      screen: 'home',
      description: 'ホーム画面（メインダッシュボード）',
      setup: async (page) => {
        await page.evaluate(() => {
          localStorage.setItem('primal_logic_consent_accepted', 'true');
          localStorage.setItem('primal_logic_onboarding_completed', 'true');
        });
        await page.reload();
        await page.waitForTimeout(2000); // データ読み込み待機
      },
    },
    {
      name: 'profile',
      screen: 'profile',
      description: 'プロファイル設定画面',
      setup: async (page) => {
        await page.evaluate(() => {
          localStorage.setItem('primal_logic_consent_accepted', 'true');
          localStorage.setItem('primal_logic_onboarding_completed', 'true');
        });
        await page.goto(`${BASE_URL}/#profile`);
        await page.waitForTimeout(2000);
      },
    },
    {
      name: 'history',
      screen: 'history',
      description: '履歴画面',
      setup: async (page) => {
        await page.evaluate(() => {
          localStorage.setItem('primal_logic_consent_accepted', 'true');
          localStorage.setItem('primal_logic_onboarding_completed', 'true');
        });
        await page.goto(`${BASE_URL}/#history`);
        await page.waitForTimeout(2000);
      },
    },
    {
      name: 'labs',
      screen: 'labs',
      description: 'Labs画面（実験的機能）',
      setup: async (page) => {
        await page.evaluate(() => {
          localStorage.setItem('primal_logic_consent_accepted', 'true');
          localStorage.setItem('primal_logic_onboarding_completed', 'true');
        });
        await page.goto(`${BASE_URL}/#labs`);
        await page.waitForTimeout(2000);
      },
    },
    {
      name: 'settings',
      screen: 'settings',
      description: '設定画面',
      setup: async (page) => {
        await page.evaluate(() => {
          localStorage.setItem('primal_logic_consent_accepted', 'true');
          localStorage.setItem('primal_logic_onboarding_completed', 'true');
        });
        await page.goto(`${BASE_URL}/#settings`);
        await page.waitForTimeout(2000);
      },
    },
    {
      name: 'customFood',
      screen: 'customFood',
      description: 'カスタム食品登録画面',
      setup: async (page) => {
        await page.evaluate(() => {
          localStorage.setItem('primal_logic_consent_accepted', 'true');
          localStorage.setItem('primal_logic_onboarding_completed', 'true');
        });
        await page.goto(`${BASE_URL}/#customFood`);
        await page.waitForTimeout(2000);
      },
    },
    {
      name: 'input',
      screen: 'input',
      description: '日次入力画面',
      setup: async (page) => {
        await page.evaluate(() => {
          localStorage.setItem('primal_logic_consent_accepted', 'true');
          localStorage.setItem('primal_logic_onboarding_completed', 'true');
        });
        await page.goto(`${BASE_URL}/#input`);
        await page.waitForTimeout(2000);
      },
    },
    {
      name: 'gift',
      screen: 'gift',
      description: 'Gift画面（コミュニティ機能）',
      setup: async (page) => {
        await page.evaluate(() => {
          localStorage.setItem('primal_logic_consent_accepted', 'true');
          localStorage.setItem('primal_logic_onboarding_completed', 'true');
        });
        await page.goto(`${BASE_URL}/#gift`);
        await page.waitForTimeout(2000);
      },
    },
    {
      name: 'bioHack',
      screen: 'bioHack',
      description: 'Bio-Hackダッシュボード画面',
      setup: async (page) => {
        await page.evaluate(() => {
          localStorage.setItem('primal_logic_consent_accepted', 'true');
          localStorage.setItem('primal_logic_onboarding_completed', 'true');
        });
        await page.goto(`${BASE_URL}/#bioHack`);
        await page.waitForTimeout(2000);
      },
    },
    {
      name: 'ifThenRules',
      screen: 'ifThenRules',
      description: 'If-Thenルール画面',
      setup: async (page) => {
        await page.evaluate(() => {
          localStorage.setItem('primal_logic_consent_accepted', 'true');
          localStorage.setItem('primal_logic_onboarding_completed', 'true');
        });
        await page.goto(`${BASE_URL}/#ifThenRules`);
        await page.waitForTimeout(2000);
      },
    },
  ];

// スクリーンショットディレクトリを作成
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

test.describe('Capture All Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    // モバイルビューポートに設定（iPhone 15幅）
    await page.setViewportSize({ width: 393, height: 852 });
  });

  for (const screenConfig of SCREENS) {
    test(`Capture screenshot: ${screenConfig.name}`, async ({ page }) => {
      // 画面のセットアップ
      if (screenConfig.setup) {
        await screenConfig.setup(page);
      } else {
        await page.goto(BASE_URL);
        await page.waitForTimeout(2000);
      }

      // スクリーンショットを取得
      const screenshotPath = path.join(SCREENSHOT_DIR, `${screenConfig.name}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true, // 全ページスクリーンショット
      });

      console.log(`✓ Screenshot saved: ${screenshotPath}`);
    });
  }
});

// スクリーンショット一覧を生成
test.afterAll(async () => {
  const screenshotListPath = path.join(SCREENSHOT_DIR, 'SCREENSHOT_LIST.md');
  const screenshots = SCREENS.map((s) => ({
    name: s.name,
    description: s.description,
    path: `screenshots-for-gemini/${s.name}.png`,
  }));

  const markdown = `# スクリーンショット一覧

以下のスクリーンショットをGeminiに送信してください。

## 📸 スクリーンショット一覧

${screenshots
      .map(
        (s, index) => `
### ${index + 1}. ${s.description} (${s.name})

- **ファイルパス**: \`C:\\Users\\susam\\Downloads\\新しいフォルダー\\docs\\primal-logic-app\\primal-logic-web\\${s.path}\`
- **説明**: ${s.description}
`
      )
      .join('\n')}

---

## 💬 Geminiへの送信メッセージ例

\`\`\`
以下のスクリーンショットを送信します。Primal Logicアプリの全画面のスクリーンショットです。

送信ファイル：
${screenshots.map((s) => `- ${s.name}.png (${s.description})`).join('\n')}

これらのスクリーンショットを参考に、カメラ機能統合の要件定義をお願いします。
\`\`\`
`;

  fs.writeFileSync(screenshotListPath, markdown);
  console.log(`✓ Screenshot list saved: ${screenshotListPath}`);
});

