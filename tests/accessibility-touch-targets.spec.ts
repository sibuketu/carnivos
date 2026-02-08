/**
 * タッチターゲット（当たり判定）のアクセシビリティテスト
 * WCAG 2.5.5 / iOS HIG: 最小 44x44 CSS ピクセルを推奨
 * 全ボタン・[role=button] がこのサイズ以上であることを検証する
 */

import { test, expect } from '@playwright/test';

const TOUCH_TARGET_MIN_PX = 44;

test.describe('タッチターゲット最小サイズ（44px）', () => {
  test('ホーム画面: 表示中のボタン・role=button がすべて 44px 以上', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('button, [role="button"]', { timeout: 10000 }).catch(() => {});

    const buttons = page.locator('button, [role="button"]').filter({ has: page.locator(':visible') });
    const count = await buttons.count();
    const violations: { name: string; w: number; h: number }[] = [];

    for (let i = 0; i < count; i++) {
      const el = buttons.nth(i);
      const box = await el.boundingBox();
      if (!box || box.width < 1 || box.height < 1) continue; // 非表示はスキップ
      const name = await el.getAttribute('aria-label') ?? await el.getAttribute('title') ?? await el.textContent() ?? `#${i}`;
      if (box.width < TOUCH_TARGET_MIN_PX || box.height < TOUCH_TARGET_MIN_PX) {
        violations.push({ name: name.slice(0, 30), w: Math.round(box.width), h: Math.round(box.height) });
      }
    }

    expect(violations, `以下の要素が ${TOUCH_TARGET_MIN_PX}px 未満: ${JSON.stringify(violations)}`).toHaveLength(0);
  });

  test('その他画面: ボタン・role=button が 44px 以上', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const otherTab = page.getByRole('button', { name: /Other screen|その他/i });
    await otherTab.click();
    await page.waitForTimeout(500);

    const buttons = page.locator('button, [role="button"]').filter({ has: page.locator(':visible') });
    const count = await buttons.count();
    const violations: { name: string; w: number; h: number }[] = [];

    for (let i = 0; i < count; i++) {
      const el = buttons.nth(i);
      const box = await el.boundingBox();
      if (!box || box.width < 1 || box.height < 1) continue;
      const name = await el.getAttribute('aria-label') ?? await el.getAttribute('title') ?? await el.textContent() ?? `#${i}`;
      if (box.width < TOUCH_TARGET_MIN_PX || box.height < TOUCH_TARGET_MIN_PX) {
        violations.push({ name: name.slice(0, 30), w: Math.round(box.width), h: Math.round(box.height) });
      }
    }

    expect(violations, `以下の要素が ${TOUCH_TARGET_MIN_PX}px 未満: ${JSON.stringify(violations)}`).toHaveLength(0);
  });
});
