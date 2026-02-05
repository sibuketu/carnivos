
import puppeteer, { Page } from 'puppeteer';
import path from 'path';
import fs from 'fs';

// Artifacts Config
const ARTIFACT_DIR = 'C:\\Users\\susam\\.gemini\\antigravity\\brain\\edf2add6-f5c2-4a82-8af9-6124d01c6d84';
const PORTS = [5173, 5174, 5175, 5178];

interface Violation {
    element: string;
    issue: string;
    value: string;
    rect: string;
}

interface PageReport {
    name: string;
    screenshot: string;
    violations: Violation[];
}

const reports: PageReport[] = [];

async function auditPage(page: Page, name: string) {
    console.log(`Auditing ${name}...`);

    // 1. Screenshot
    const screenshotName = `audit_${name}_${Date.now()}.png`;
    const screenshotPath = path.join(ARTIFACT_DIR, screenshotName);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Saved screenshot: ${screenshotName}`);

    // 2. Scan Violations
    const violations = await page.evaluate(() => {
        const issues: Array<{ element: string; issue: string; value: string; rect: string }> = [];
        const elements = document.querySelectorAll('button, a, input, select, [role="button"]');

        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);

            // Ignore hidden or tiny elements
            if (rect.width < 5 || rect.height < 5 || style.display === 'none' || style.visibility === 'hidden') return;

            // Touch Target Check (< 44px is warning, < 48px is strict)
            // Using 44px as a reasonable baseline for mobile
            if (rect.width < 44 || rect.height < 44) {
                issues.push({
                    element: el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.split(' ').join('.') : '') + ` "${el.innerText.slice(0, 20)}"`,
                    issue: 'Touch Target Too Small',
                    value: `${Math.round(rect.width)}x${Math.round(rect.height)}px`,
                    rect: JSON.stringify(rect)
                });
            }

            // Font Size Check (< 16px)
            const fontSize = parseFloat(style.fontSize);
            if (fontSize < 16) {
                issues.push({
                    element: el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.split(' ').join('.') : '') + ` "${el.innerText.slice(0, 20)}"`,
                    issue: 'Font Size Too Small',
                    value: `${fontSize}px`,
                    rect: JSON.stringify(rect)
                });
            }
        });
        return issues;
    });

    reports.push({
        name,
        screenshot: screenshotName,
        violations
    });
}

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 2 });

    try {
        // Port Scan
        let activePort = 0;
        for (const port of PORTS) {
            try {
                console.log(`Trying http://localhost:${port}...`);
                await page.goto(`http://localhost:${port}`, { waitUntil: 'domcontentloaded', timeout: 5000 });
                activePort = port;
                console.log(`Connected to port ${port}`);
                break;
            } catch {
                console.log(`Port ${port} failed.`);
            }
        }

        if (!activePort) throw new Error('No active dev server found on ports 5173, 5175, 5178');

        // 1. Home
        await new Promise(r => setTimeout(r, 2000)); // Settle
        await auditPage(page, 'Home');

        // 2. History (Try to find tab)
        // const historyBtn = await page.$('p:contains("履歴"), span:contains("履歴"), div:contains("履歴"), button:has-text("履歴")');
        // Trying a broader selector strategy or assume bottom nav position if text fails
        // Based on i18n, 'nav.history' is '履歴'

        // Let's try to click by text content since we don't know exact selectors
        const buttons = await page.$$('button, div[role="button"]');
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.innerText, btn);
            if (text.includes('履歴') || text.includes('History')) {
                console.log('Found History button, clicking...');
                await btn.click();
                await new Promise(r => setTimeout(r, 2000));
                await auditPage(page, 'History');
                break;
            }
        }

        // 3. Others
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.innerText, btn);
            if (text.includes('その他') || text.includes('Others')) {
                console.log('Found Others button, clicking...');
                await btn.click();
                await new Promise(r => setTimeout(r, 2000));
                await auditPage(page, 'Others');
                break;
            }
        }

        // Output Report
        const reportPath = path.join(ARTIFACT_DIR, 'audit_results.json');
        fs.writeFileSync(reportPath, JSON.stringify(reports, null, 2));
        console.log(`Audit Complete. Report saved to ${reportPath}`);

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
})();
