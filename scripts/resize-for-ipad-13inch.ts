/**
 * screenshot-1.png を 2048×2732 にリサイズして iPad 13インチ用に出力
 */
import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INPUT = path.join(__dirname, '../store-assets/screenshot-1.png');
const OUTPUT = path.join(__dirname, '../store-assets/ipad-13inch-2048x2732.png');
const W = 2048;
const H = 2732;

async function main() {
  if (!fs.existsSync(INPUT)) {
    console.error('screenshot-1.png not found');
    process.exit(1);
  }
  const absInput = path.resolve(INPUT);
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#000"><img src="file:///${absInput.replace(/\\/g, '/')}" style="width:100%;height:100%;object-fit:cover" /></body></html>`;
  const htmlPath = path.join(__dirname, '../_temp-ipad-resize.html');
  fs.writeFileSync(htmlPath, html);

  const browser = await chromium.launch();
  const page = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
  }).then((ctx) => ctx.newPage());
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`);
  await page.waitForTimeout(500);
  await page.screenshot({ path: OUTPUT });
  await browser.close();
  fs.unlinkSync(htmlPath);
  console.log('Saved:', OUTPUT);
}

main();
