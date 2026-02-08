/**
 * 1回だけゲスト状態を作り storageState を保存。screens-and-flows 等がこれを再利用して実行時間を短縮する。
 */
import { test as setup, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_FILE = path.join(__dirname, '../playwright/.auth/user.json');

setup('prepare guest auth state', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('primal_logic_consent_accepted', 'true');
    localStorage.setItem('primal_logic_onboarding_completed', 'true');
    localStorage.setItem('primal_logic_guest_mode', 'true');
  });
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  const guestBtn = page.getByRole('button', { name: /ゲスト|Guest|続ける|Continue/ });
  if (await guestBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await guestBtn.click();
    await page.waitForTimeout(1500);
  }
  await expect(
    page.getByTestId('nav-home').or(page.getByRole('button', { name: /Home|ホーム/i })).first()
  ).toBeVisible({ timeout: 20000 });
  await expect(
    page.getByTestId('nav-others').or(page.getByRole('button', { name: /Other|その他/i })).first()
  ).toBeVisible({ timeout: 5000 });

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  await page.context().storageState({ path: AUTH_FILE });
});
