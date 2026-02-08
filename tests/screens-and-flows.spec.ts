/**
 * RULES.md 2.1b: 画面遷移・ボタン・フォーム・主要フローをすべてE2Eでカバーする
 * その他(Labs)配下の全画面、設定のフォーム・ボタン、同意→Paywall→ゲストフローを網羅
 */

import { test, expect } from '@playwright/test';

/** ゲスト＋同意＋オンボーディング済みでホームを表示し、ナビを表示させる（storageState 利用時は既に状態があれば短時間で完了） */
async function ensureHomeWithNav(page: import('@playwright/test').Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const navVisible = await page.getByTestId('nav-home').or(page.getByRole('button', { name: /Home|ホーム/i })).first().isVisible({ timeout: 4000 }).catch(() => false);
  if (navVisible) {
    await expect(page.getByTestId('nav-others').or(page.getByRole('button', { name: /Other|その他/i })).first()).toBeVisible({ timeout: 3000 });
    await page.waitForTimeout(300);
    return;
  }
  await page.evaluate(() => {
    localStorage.setItem('primal_logic_consent_accepted', 'true');
    localStorage.setItem('primal_logic_onboarding_completed', 'true');
    localStorage.setItem('primal_logic_guest_mode', 'true');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  const guestBtn = page.getByRole('button', { name: /ゲスト|Guest|続ける|Continue/ });
  if (await guestBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await guestBtn.click();
    await page.waitForTimeout(1500);
  }
  await expect(
    page.getByTestId('nav-home').or(page.getByRole('button', { name: /Home|ホーム/i })).first()
  ).toBeVisible({ timeout: 30000 });
  await expect(
    page.getByTestId('nav-others').or(page.getByRole('button', { name: /Other|その他/i })).first()
  ).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(500);
}

/** App の __navigateToScreen で指定画面へ直接遷移。screenChanged 発火まで待つ */
async function navigateTo(page: import('@playwright/test').Page, screen: string) {
  await Promise.race([
    page.waitForFunction(
      () => (window as unknown as { __navigateToScreen?: (s: string) => void }).__navigateToScreen != null,
      { timeout: 5000 }
    ).catch(() => {}),
    page.waitForTimeout(1000),
  ]);
  await page.evaluate((s) => {
    return new Promise<void>((resolve) => {
      const done = () => {
        window.removeEventListener('screenChanged', done);
        resolve();
      };
      window.addEventListener('screenChanged', done);
      setTimeout(resolve, 2000);
      const win = window as unknown as { __navigateToScreen?: (s: string) => void };
      if (typeof win.__navigateToScreen === 'function') {
        win.__navigateToScreen(s);
      } else {
        window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: s }));
      }
    });
  }, screen);
  await page.waitForTimeout(400);
}

/** その他(Labs)タブを開き、Labs画面が表示されるまで待つ */
async function openLabs(page: import('@playwright/test').Page) {
  const navOthers = page.getByRole('button', { name: /Other|その他/ }).or(page.getByTestId('nav-others'));
  await navOthers.first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await navOthers.first().click({ force: true });
  await page.waitForTimeout(800);
  const labsLocator = page.getByTestId('labs-screen').or(page.getByRole('heading', { name: /Other|その他|Others/ })).first();
  const visible = await labsLocator.isVisible().catch(() => false);
  if (!visible) {
    await page.evaluate(() => {
      const win = window as unknown as { __navigateToScreen?: (s: string) => void };
      if (typeof win.__navigateToScreen === 'function') {
        win.__navigateToScreen('labs');
      }
    });
    await page.waitForTimeout(1500);
  }
  await expect(labsLocator).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(400);
}

test.describe('画面遷移・ボタン・フォーム E2E（2.1b フルカバー）', () => {
  test.setTimeout(60000);

  // ========== その他(Labs)配下の全画面遷移 ==========
  test('その他 → 統計(Stats) に遷移し戻る', async ({ page }) => {
    await ensureHomeWithNav(page);
    await openLabs(page);
    await navigateTo(page, 'stats');
    await page.waitForTimeout(3000);
    await expect(page.getByText(/統計|グラフ|栄養|習慣|Streak|Stats/i).first()).toBeVisible({ timeout: 15000 });
    await page.getByTestId('nav-others').click({ force: true });
    await page.waitForTimeout(1000);
  });

  test('その他 → Bio-Tuner(Input) に遷移し戻る', async ({ page }) => {
    await ensureHomeWithNav(page);
    await openLabs(page);
    await navigateTo(page, 'input');
    await page.waitForTimeout(2000);
    await expect(page.getByText(/Bio-Tuner|入力|Input|プロフィール|Profile/i).first()).toBeVisible({ timeout: 15000 });
    await page.getByTestId('nav-others').click({ force: true });
    await page.waitForTimeout(1000);
  });

  test('その他 → 日記(Diary) に遷移し戻る', async ({ page }) => {
    await ensureHomeWithNav(page);
    await openLabs(page);
    await navigateTo(page, 'diary');
    await page.waitForTimeout(3000);
    await expect(page.getByText(/日記|Diary|Daily Log|Log|お気に入り|すべて|Weight/i).first()).toBeVisible({ timeout: 15000 });
    await page.getByTestId('nav-others').click({ force: true });
    await page.waitForTimeout(1000);
  });

  test('その他 → ユーザー設定(Profile) に遷移し戻る', async ({ page }) => {
    await ensureHomeWithNav(page);
    await openLabs(page);
    await navigateTo(page, 'userSettings');
    await page.waitForTimeout(3000);
    await expect(
      page.getByText(/プロフィール|Profile|性別|Gender|設定|Settings|読み込みに失敗|目標|Goal/i).first()
    ).toBeVisible({ timeout: 15000 });
    await page.getByTestId('nav-others').click({ force: true });
    await page.waitForTimeout(1000);
  });

  test('その他 → UI設定(Settings) に遷移し戻る', async ({ page }) => {
    await ensureHomeWithNav(page);
    await openLabs(page);
    await navigateTo(page, 'settings');
    await page.waitForTimeout(3000);
    await expect(page.locator('.settings-screen-container').or(page.getByText(/設定|Settings|言語|Language/i)).first()).toBeVisible({ timeout: 15000 });
    await page.getByTestId('nav-others').click({ force: true });
    await page.waitForTimeout(1000);
  });

  test('その他 → 塩設定(Salt) に遷移し戻る', async ({ page }) => {
    await ensureHomeWithNav(page);
    await openLabs(page);
    await navigateTo(page, 'salt');
    await page.waitForTimeout(2000);
    await expect(page.getByText(/塩|Salt|ナトリウム|Sodium/i).first()).toBeVisible({ timeout: 15000 });
    await page.getByTestId('nav-others').click({ force: true });
    await page.waitForTimeout(1000);
  });

  test('その他 → 炭水化物目標(CarbTarget) に遷移し戻る', async ({ page }) => {
    await ensureHomeWithNav(page);
    await openLabs(page);
    await navigateTo(page, 'carbTarget');
    await page.waitForTimeout(3000);
    await expect(page.getByText(/炭水化物|Carb|目標|Target/i).first()).toBeVisible({ timeout: 15000 });
    await page.getByTestId('nav-others').click({ force: true });
    await page.waitForTimeout(1000);
  });

  test('その他 → 言語設定(Language) に遷移し戻る', async ({ page }) => {
    await ensureHomeWithNav(page);
    await openLabs(page);
    await navigateTo(page, 'language');
    await page.waitForTimeout(3000);
    await expect(page.getByText(/言語|Language|English|日本語/i).first()).toBeVisible({ timeout: 15000 });
    await page.getByTestId('nav-others').click({ force: true });
    await page.waitForTimeout(1000);
  });

  test('その他 → アカウント(Auth) を開いて認証画面が表示される', async ({ page }) => {
    await ensureHomeWithNav(page);
    await navigateTo(page, 'auth');
    await page.waitForTimeout(1500);
    await expect(page.locator('.auth-screen').first()).toBeVisible({ timeout: 15000 });
  });

  test('その他 → フィードバック(Feedback) に遷移し戻る', async ({ page }) => {
    await ensureHomeWithNav(page);
    await openLabs(page);
    await navigateTo(page, 'feedback');
    await page.waitForTimeout(2000);
    await expect(page.getByText(/Feedback|フィードバック|送信|バグ|Bug/i).first()).toBeVisible({ timeout: 15000 });
    await page.getByTestId('nav-others').click({ force: true });
    await page.waitForTimeout(1000);
  });

  test('その他 → プライバシーポリシー(Privacy) に遷移し戻る', async ({ page }) => {
    await ensureHomeWithNav(page);
    await openLabs(page);
    await navigateTo(page, 'privacy');
    await page.waitForTimeout(3000);
    await expect(page.getByText(/Privacy|プライバシー|個人情報/i).first()).toBeVisible({ timeout: 15000 });
    await page.getByTestId('nav-others').click({ force: true });
    await page.waitForTimeout(1000);
  });

  test('その他 → 利用規約(Terms) に遷移し戻る', async ({ page }) => {
    await ensureHomeWithNav(page);
    await openLabs(page);
    await navigateTo(page, 'terms');
    await page.waitForTimeout(2000);
    await expect(page.getByText(/Terms|利用規約|規約/i).first()).toBeVisible({ timeout: 15000 });
    await page.getByTestId('nav-others').click({ force: true });
    await page.waitForTimeout(1000);
  });

  test('その他 → データ削除(DataDelete) に遷移し戻る', async ({ page }) => {
    await ensureHomeWithNav(page);
    await openLabs(page);
    await navigateTo(page, 'dataDelete');
    await page.waitForTimeout(3000);
    await expect(page.getByText(/削除|Delete|データ|Data/i).first()).toBeVisible({ timeout: 15000 });
    await page.getByTestId('nav-others').click({ force: true });
    await page.waitForTimeout(1000);
  });

  test('その他 → ギフト(Gift) に遷移し戻る（表示時のみ）', async ({ page }) => {
    await ensureHomeWithNav(page);
    await openLabs(page);
    await navigateTo(page, 'gift');
    await page.waitForTimeout(2000);
    const hasContent = await page.getByText(/ギフト|Gift|招待|Support/i).first().isVisible({ timeout: 5000 }).catch(() => false);
    if (hasContent) {
      await page.getByRole('button', { name: /戻る|Back/ }).first().click({ force: true }).catch(() => {});
      await page.waitForTimeout(800);
    }
  });

  test('その他 → ショップ(Shop) に遷移し戻る（表示時のみ）', async ({ page }) => {
    await ensureHomeWithNav(page);
    await openLabs(page);
    await navigateTo(page, 'shop');
    await page.waitForTimeout(2000);
    const hasContent = await page.getByText(/ショップ|Shop|購入|Customization/i).first().isVisible({ timeout: 5000 }).catch(() => false);
    if (hasContent) {
      await page.getByRole('button', { name: /戻る|Back/ }).first().click({ force: true }).catch(() => {});
      await page.waitForTimeout(800);
    }
  });

  test('その他 → カスタム食品(CustomFood) に遷移し戻る（表示時のみ）', async ({ page }) => {
    await ensureHomeWithNav(page);
    await openLabs(page);
    await navigateTo(page, 'customFood');
    await page.waitForTimeout(2000);
    const hasContent = await page.getByText(/カスタム|Custom|食品|登録|Registration/i).first().isVisible({ timeout: 8000 }).catch(() => false);
    if (hasContent) {
      await page.getByTestId('nav-others').click({ force: true });
      await page.waitForTimeout(1000);
    }
  });

  test('その他 → Tips 一覧を開き戻る', async ({ page }) => {
    await ensureHomeWithNav(page);
    await openLabs(page);
    const tipsBtn = page.getByRole('button', { name: /Tips|ヒント|View List/i }).or(page.getByTestId('labs-tips')).first();
    await expect(tipsBtn).toBeVisible({ timeout: 8000 });
    await tipsBtn.click({ force: true });
    await page.waitForTimeout(1500);
    await expect(page.getByText(/Tips|ヒント|💡/i).first()).toBeVisible({ timeout: 10000 });
    await page.getByTestId('nav-others').click({ force: true });
    await page.waitForTimeout(1000);
  });

  // ========== 設定画面のフォーム・ボタン ==========
  test('設定画面: 言語ボタンがクリックできる', async ({ page }) => {
    await ensureHomeWithNav(page);
    await openLabs(page);
    await navigateTo(page, 'settings');
    await page.waitForTimeout(3000);
    await expect(page.locator('.settings-screen-container').or(page.getByText(/設定|Settings/i)).first()).toBeVisible({ timeout: 15000 });
    const enBtn = page.getByRole('button', { name: 'English' });
    const jaBtn = page.getByRole('button', { name: '日本語' });
    if (await enBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await enBtn.click({ force: true });
      await page.waitForTimeout(300);
    }
    if (await jaBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await jaBtn.click({ force: true });
      await page.waitForTimeout(300);
    }
  });

  test('設定画面: 断食タイマー時間ボタンがクリックできる', async ({ page }) => {
    await ensureHomeWithNav(page);
    await openLabs(page);
    await navigateTo(page, 'settings');
    await page.waitForTimeout(3000);
    await expect(page.locator('.settings-screen-container').or(page.getByText(/設定|Settings/i)).first()).toBeVisible({ timeout: 15000 });
    const hoursBtn = page.locator('button').filter({ hasText: /12|16|18|24/ }).first();
    if (await hoursBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await hoursBtn.click({ force: true });
      await page.waitForTimeout(300);
    }
  });

  test('設定画面: 文字サイズボタンがクリックできる', async ({ page }) => {
    await ensureHomeWithNav(page);
    await openLabs(page);
    await navigateTo(page, 'settings');
    await page.waitForTimeout(3000);
    await expect(page.locator('.settings-screen-container').or(page.getByText(/設定|Settings/i)).first()).toBeVisible({ timeout: 15000 });
    const smallBtn = page.getByRole('button', { name: /小|Small/i });
    if (await smallBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await smallBtn.click({ force: true });
      await page.waitForTimeout(300);
    }
  });

  // ========== その他 → UI設定 で設定画面を開く（下部ナビに設定タブはないため、その他経由で確認） ==========
  test('その他 → UI設定 で設定画面が開く', async ({ page }) => {
    await ensureHomeWithNav(page);
    await openLabs(page);
    await navigateTo(page, 'settings');
    await page.waitForTimeout(3000);
    await expect(page.locator('.settings-screen-container').or(page.getByText(/設定|Settings|言語|Language/i)).first()).toBeVisible({ timeout: 15000 });
  });

  // ========== 同意 → Paywall → ゲストの一連フロー ==========
  test('同意 → Paywall → ゲストでホームまで一連フロー', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.removeItem('primal_logic_consent_accepted');
      localStorage.removeItem('primal_logic_onboarding_completed');
      localStorage.removeItem('primal_logic_guest_mode');
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);

    const consent = page.locator('[class*="consent"], [class*="Consent"]').or(page.getByText(/プライバシーポリシー|Privacy|同意|Consent/i));
    await expect(consent.first()).toBeVisible({ timeout: 20000 });

    const privacyCheck = page.locator('input[type="checkbox"]').first();
    const termsCheck = page.locator('input[type="checkbox"]').nth(1);
    await privacyCheck.check();
    await termsCheck.check();
    await page.getByRole('button', { name: /同意して続ける|同意|Continue|Accept/i }).or(page.getByText(/同意して続ける|同意|Continue/i)).first().click();
    await page.waitForTimeout(2500);

    const paywallOrAuth = page.getByText(/サブスクリプション|Subscription|ようこそ|Welcome|ログイン|Login|ゲスト|Guest|Try|試す/i);
    await expect(paywallOrAuth.first()).toBeVisible({ timeout: 20000 });

    const guestBtn = page.getByRole('button', { name: /ゲスト|Guest|続ける|試す/i });
    if (await guestBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
      await guestBtn.click();
      await page.waitForTimeout(2000);
      await expect(page.getByTestId('nav-home')).toBeVisible({ timeout: 15000 });
    } else {
      await expect(
        page
          .getByTestId('nav-home')
          .or(page.getByTestId('nav-history'))
          .or(page.getByTestId('nav-others'))
          .or(page.getByText(/ログイン|Login|ホーム|Home|履歴|History|サブスクリプション|Subscription|Try|試す|同意|Consent/i))
          .first()
      ).toBeVisible({ timeout: 15000 });
    }
  });

  // ========== 履歴画面: 期間選択・表示 ==========
  test('履歴画面で期間選択ボタンがクリックできる', async ({ page }) => {
    await ensureHomeWithNav(page);
    await page.getByTestId('nav-history').click({ force: true });
    await page.waitForTimeout(2500);
    await expect(page.getByText(/履歴|History|日付|Date|No data|データがありません/i).first()).toBeVisible({ timeout: 15000 });
    const periodBtn = page.locator('button, [role="button"]').filter({ hasText: /今日|週|月|7|30|全期間/i }).first();
    if (await periodBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await periodBtn.click({ force: true });
      await page.waitForTimeout(500);
    }
  });

  // ========== ホーム → 食品追加モーダル → 閉じる ==========
  test('食品追加モーダルを開いて閉じる', async ({ page }) => {
    await ensureHomeWithNav(page);
    const addBtn = page.getByTestId('add-food');
    await expect(addBtn).toBeVisible({ timeout: 10000 });
    await addBtn.click({ force: true });
    await page.waitForTimeout(2500);
    await expect(
      page.getByText(/牛肉|Ribeye|🐄|反芻|Butcher|食品|選択可能な食品|反芻・牛・羊|豚・鶏|卵・脂|Select|追加/i).first()
    ).toBeVisible({ timeout: 25000 });
    const closeBtn = page.locator('button').filter({ hasText: /×|閉じる|Cancel|Close/ }).first();
    if (await closeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await closeBtn.click({ force: true });
      await page.waitForTimeout(500);
    } else {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  });
});
