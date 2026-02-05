
import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
    test.beforeEach(async ({ page }) => {
        // Pipe browser logs to stdout for debugging
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));

        // Clear storage then seed specific flags to skip onboarding
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded'); // Ensure DOM is ready
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('primal_logic_consent_accepted', 'true');
            localStorage.setItem('primal_logic_onboarding_completed', 'true');
        });
        await page.reload();
    });

    test('Guest Mode Access', async ({ page }) => {
        // Wait for Auth Screen container specifically
        await expect(page.locator('.auth-screen')).toBeVisible({ timeout: 15000 });

        // Wait for Auth Screen title
        await expect(page.getByText('ログイン', { exact: true }).first()).toBeVisible();

        // Click Guest Mode
        await page.getByRole('button', { name: 'ゲストとして試す' }).click();

        // Should now be on Home Screen
        await expect(page.getByRole('button', { name: 'ホーム', exact: true })).toBeVisible();
    });

    test('Registration Validation', async ({ page }) => {
        // Wait for Auth Screen container
        await expect(page.locator('.auth-screen')).toBeVisible({ timeout: 15000 });

        // Go to Signup
        await page.getByRole('button', { name: '新規登録' }).click();

        // Wait for title to change to ensure we are in signup mode
        await expect(page.getByRole('heading', { name: '新規登録' })).toBeVisible();

        // Fill invalid email
        await page.fill('input[name="email"]', 'invalid-email');
        await page.fill('input[name="password"]', 'short');
        await page.getByRole('button', { name: '登録' }).click();

        // Fill valid email but invalid password
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'weakpass');
        await page.fill('input[name="confirmPassword"]', 'weakpass');
        await page.getByRole('button', { name: '登録' }).click();

        await expect(page.getByText('パスワードは8文字以上、英字と数字を含めてください')).toBeVisible();
    });
});
