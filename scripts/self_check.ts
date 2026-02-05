
import puppeteer from 'puppeteer';
import path from 'path';


// Artifact directory (hardcoded for this session based on previous context)
const ARTIFACT_DIR = 'C:\\Users\\susam\\.gemini\\antigravity\\brain\\edf2add6-f5c2-4a82-8af9-6124d01c6d84';
const SCREENSHOT_PATH = path.join(ARTIFACT_DIR, `self_check_${Date.now()}.png`);

async function runSelfCheck() {
    console.log('Starting Self-Check Browser...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=en-US']
    });
    const page = await browser.newPage();

    // Set viewport to a mobile-like size (iPhone 14 Pro ish)
    await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 2 });

    // Force English Language
    await page.evaluateOnNewDocument(() => {
        localStorage.setItem('primal_logic_language', 'en');
    });

    // Capture browser console logs
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));

    // Try ports 5173, 5175, 5178
    const ports = [5173, 5175, 5178];
    let connected = false;

    for (const port of ports) {
        try {
            console.log(`Trying http://localhost:${port}...`);
            await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle0', timeout: 5000 });
            console.log(`Connected to port ${port}`);
            connected = true;
            break;
        } catch (e) {
            console.log(`Failed to connect to port ${port}: ${e.message}`);
        }
    }

    if (!connected) {
        console.error('Could not connect to localhost on 5173 or 5175. Is the dev server running?');
        await browser.close();
        process.exit(1);
    }

    // Wait for a bit to let animations settle
    await new Promise(r => setTimeout(r, 2000));

    // Take screenshot
    await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
    console.log(`Screenshot saved to: ${SCREENSHOT_PATH}`);

    await browser.close();
}

runSelfCheck().catch(console.error);
