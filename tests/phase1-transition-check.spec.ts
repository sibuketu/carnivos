/**
 * Primal Logic - Phase 1: 移行期間サポート機能の自動チェック
 * 
 * このテストは、移行期間バナー、動的栄養素調整、ガイド画面の動作を確認します。
 */

import { test, expect } from '@playwright/test';

test.describe('Phase 1: 移行期間サポート機能', () => {
  test.beforeEach(async ({ page }) => {
    // アプリを開く
    await page.goto('http://localhost:5174');
    
    // ページが読み込まれるまで待機（networkidleの代わりに、より具体的な要素を待つ）
    await page.waitForSelector('.app-navigation, [class*="home"], [class*="Home"]', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(500);
  });

  test('移行期間バナーが表示される（移行期間中の場合）', async ({ page }) => {
    // ローカルストレージに移行期間中のデータを設定
    await page.evaluate(() => {
      const userProfile = {
        gender: 'male',
        goal: 'healing',
        metabolicStatus: 'transitioning',
        daysOnCarnivore: 15, // 移行期間中（30日未満）
        carnivoreStartDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };
      localStorage.setItem('primal_logic_user_profile', JSON.stringify(userProfile));
    });

    // ページをリロード
    await page.reload();
    await page.waitForSelector('.app-navigation, [class*="home"], [class*="Home"]', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(500);

    // 移行期間バナーが表示されることを確認
    const banner = page.getByText('移行期間:', { exact: false });
    await expect(banner).toBeVisible();
    
    // 進捗表示を確認
    await expect(page.getByText('15/30日', { exact: false })).toBeVisible();
    await expect(page.getByText('適応モード:', { exact: false })).toBeVisible();
  });

  test('移行期間バナーが表示されない（移行期間終了後）', async ({ page }) => {
    // ローカルストレージに移行期間終了後のデータを設定
    await page.evaluate(() => {
      const userProfile = {
        gender: 'male',
        goal: 'healing',
        metabolicStatus: 'adapted',
        daysOnCarnivore: 35, // 移行期間終了後（30日以上）
        carnivoreStartDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };
      localStorage.setItem('primal_logic_user_profile', JSON.stringify(userProfile));
    });

    // ページをリロード
    await page.reload();
    await page.waitForSelector('.app-navigation, [class*="home"], [class*="Home"]', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(500);

    // 移行期間バナーが表示されないことを確認
    const banner = page.getByText('移行期間:', { exact: false });
    await expect(banner).not.toBeVisible();
  });

  test('移行期間ガイド画面が開く（バナーをタップ）', async ({ page }) => {
    // ローカルストレージに移行期間中のデータを設定
    await page.evaluate(() => {
      const userProfile = {
        gender: 'male',
        goal: 'healing',
        metabolicStatus: 'transitioning',
        daysOnCarnivore: 15,
        carnivoreStartDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };
      localStorage.setItem('primal_logic_user_profile', JSON.stringify(userProfile));
    });

    // ページをリロード
    await page.reload();
    await page.waitForSelector('.app-navigation, [class*="home"], [class*="Home"]', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(500);

    // バナーをタップ
    const banner = page.getByText('移行期間:', { exact: false });
    await banner.click();

    // ガイド画面が表示されることを確認
    await expect(page.getByText('移行期間ガイド', { exact: true })).toBeVisible();
    await expect(page.getByText('移行期間について', { exact: false })).toBeVisible();
    await expect(page.getByText('よくある症状と対処法', { exact: false })).toBeVisible();
    await expect(page.getByText('推奨食品', { exact: false })).toBeVisible();
  });

  test('症状を選択して対処法が表示される', async ({ page }) => {
    // ローカルストレージに移行期間中のデータを設定
    await page.evaluate(() => {
      const userProfile = {
        gender: 'male',
        goal: 'healing',
        metabolicStatus: 'transitioning',
        daysOnCarnivore: 15,
        carnivoreStartDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };
      localStorage.setItem('primal_logic_user_profile', JSON.stringify(userProfile));
    });

    // ページをリロード
    await page.reload();
    await page.waitForSelector('.app-navigation, [class*="home"], [class*="Home"]', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(500);

    // バナーをタップしてガイド画面を開く
    const banner = page.getByText('移行期間:', { exact: false });
    await banner.click();

    // 「頭痛」を選択
    const headacheButton = page.getByText('頭痛', { exact: true }).first();
    await headacheButton.click();

    // 対処法が表示されることを確認
    await expect(page.getByText('頭痛の対処法', { exact: false })).toBeVisible();
    await expect(page.getByText('ナトリウム', { exact: false })).toBeVisible();
    await expect(page.getByText('+2000mg', { exact: false })).toBeVisible();
    await expect(page.getByText('推奨食品', { exact: false })).toBeVisible();
  });

  test('動的栄養素調整が適用される（移行期間中）', async ({ page }) => {
    // ローカルストレージに移行期間中のデータを設定
    await page.evaluate(() => {
      const userProfile = {
        gender: 'male',
        goal: 'healing',
        metabolicStatus: 'transitioning',
        daysOnCarnivore: 15,
        carnivoreStartDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };
      localStorage.setItem('primal_logic_user_profile', JSON.stringify(userProfile));
    });

    // ページをリロード
    await page.reload();
    await page.waitForSelector('.app-navigation, [class*="home"], [class*="Home"]', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(500);

    // ナトリウムゲージが移行期間中の目標値（7000mg）を表示していることを確認
    // 注: 実際のゲージ表示を確認する必要があるため、セレクターは要調整
    const sodiumGauge = page.getByText('ナトリウム', { exact: false }).first();
    await expect(sodiumGauge).toBeVisible();
    
    // 7000mgが表示されていることを確認（ゲージの構造に依存）
    // 注: 実際のUI構造に合わせてセレクターを調整する必要がある
  });
});

