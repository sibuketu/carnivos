/**
 * app-icon-512.png を 1024×1024 にリサイズ（App Store 必須）
 */
import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INPUT = path.join(__dirname, '../store-assets/app-icon-512.png');
const OUTPUT = path.join(__dirname, '../store-assets/app-icon-1024x1024.png');
const SZ = 1024;

async function main() {
  if (!fs.existsSync(INPUT)) {
    console.error('app-icon-512.png not found');
    process.exit(1);
  }
  const absInput = path.resolve(INPUT).replace(/\\/g, '/');
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#fff"><img src="file:///${absInput}" width="${SZ}" height="${SZ}" style="display:block" /></body></html>`;
  const htmlPath = path.join(__dirname, '../_temp-icon-1024.html');
  fs.writeFileSync(htmlPath, html);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: SZ, height: SZ },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`);
  await page.waitForTimeout(500);
  await page.screenshot({ path: OUTPUT });
  await browser.close();
  fs.unlinkSync(htmlPath);
  console.log('Saved:', OUTPUT);
}

main();
