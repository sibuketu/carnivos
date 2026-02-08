/**
 * screenshot-1〜4.png を 1242×2688 にリサイズ（App Store iPhone 6.5インチ必須）
 */
import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const W = 1242;
const H = 2688;

async function resize(src: string, dest: string) {
  const absInput = path.resolve(src).replace(/\\/g, '/');
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#000"><img src="file:///${absInput}" style="width:100%;height:100%;object-fit:cover" /></body></html>`;
  const htmlPath = path.join(__dirname, `../_temp-65-${path.basename(src)}.html`);
  fs.writeFileSync(htmlPath, html);

  const browser = await chromium.launch();
  const page = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
  }).then((ctx) => ctx.newPage());
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`);
  await page.waitForTimeout(500);
  await page.screenshot({ path: dest });
  await browser.close();
  fs.unlinkSync(htmlPath);
  console.log('Saved:', dest);
}

async function main() {
  const base = path.join(__dirname, '../store-assets');
  for (let i = 1; i <= 4; i++) {
    const src = path.join(base, `screenshot-${i}.png`);
    const dest = path.join(base, `screenshot-65inch-${i}.png`);
    if (fs.existsSync(src)) {
      await resize(src, dest);
    } else {
      console.warn('Skip (not found):', src);
    }
  }
}

main();
