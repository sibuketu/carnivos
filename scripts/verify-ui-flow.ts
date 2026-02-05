
import puppeteer from 'puppeteer';


async function run() {
    console.log('Starting UI Verification Flow...');

    // Launch browser
    const browser = await puppeteer.launch({
        headless: true, // Run in headless mode for automation
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport to mobile size to test responsive UI
    await page.setViewport({ width: 390, height: 844 });

    try {
        console.log('Navigating to localhost:5173...');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

        // 1. Initial Home Screen
        console.log('Taking screenshot: 1_initial_home.png');
        await page.screenshot({ path: '1_initial_home.png' });

        // 2. Scroll down to see Tier Sections
        console.log('Scrolling down...');
        await page.evaluate(() => {
            // Try scrolling the window and the container
            window.scrollTo(0, document.body.scrollHeight);
            const container = document.querySelector('.home-screen-container');
            if (container) container.scrollTop = container.scrollHeight;
            const appContent = document.querySelector('.app-content');
            if (appContent) appContent.scrollTop = appContent.scrollHeight;
        });

        // Wait for scroll
        await new Promise(r => setTimeout(r, 1000));
        console.log('Taking screenshot: 2_scrolled_gauges.png');
        await page.screenshot({ path: '2_scrolled_gauges.png' });

        // 3. Open Butcher Select
        console.log('Clicking + button...');
        // Finding the + button (it has specific style or text '+')
        const plusButtons = await page.$$('button');
        let found = false;
        for (const btn of plusButtons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text && text.includes('+')) {
                await btn.click();
                found = true;
                break;
            }
        }

        if (!found) {
            console.error('Plus button not found, trying accessibility selector');
            // Fallback strategies...
        }

        await new Promise(r => setTimeout(r, 1000));
        await new Promise(r => setTimeout(r, 1000));
        console.log('Taking screenshot: 3_butcher_select_opened.png');
        await page.screenshot({ path: '3_butcher_select_opened.png' });

        // Scroll down within the ButcherSelect area or the page to ensure the new gauge section is visible
        console.log('Scrolling down in ButcherSelect...');
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });
        await new Promise(r => setTimeout(r, 500));
        console.log('Taking screenshot: 3b_butcher_select_unselected_scroll.png');
        await page.screenshot({ path: '3b_butcher_select_unselected_scroll.png' });

        // 4. Select Organs Category
        console.log('Selecting Organs category...');
        // Need to find the button with "内臓"
        const buttons = await page.$$('button');
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text && text.includes('内臓')) {
                await btn.click();
                break;
            }
        }
        await new Promise(r => setTimeout(r, 500));

        // 5. Select Liver
        console.log('Selecting Beef Liver...');
        // Need to find "Beef Liver" or "牛レバー"
        // Note: The UI might use English keys or Japanese text depending on mapping
        const foodButtons = await page.$$('button');
        for (const btn of foodButtons) {
            const text = await page.evaluate(el => el.innerText, btn); // innerText gets visible text
            if (text && (text.includes('LIVER') || text.includes('レバー'))) {
                await btn.click();
                break;
            }
        }
        await new Promise(r => setTimeout(r, 1000)); // Wait for modal

        // 6. Add Food (in Modal or direct)
        // Assuming a modal opens or direct add. Since implementation varies, let's take screenshot first
        console.log('Taking screenshot: 4_liver_selected.png');
        await page.screenshot({ path: '4_liver_selected.png' });

        // Try to find "Add" or "追加" button
        const addButtons = await page.$$('button');
        for (const btn of addButtons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text && (text.includes('Add') || text.includes('追加'))) {
                await btn.click();
                console.log('Clicked Add button');
                break;
            }
        }

        // 7. Verify Result
        await new Promise(r => setTimeout(r, 1000));
        console.log('Taking screenshot: 5_after_addition.png');
        await page.screenshot({ path: '5_after_addition.png' });

        console.log('Verification Complete. Check screenshots.');

    } catch (e) {
        console.error('Error during verification:', e);
    } finally {
        await browser.close();
    }
}

run();
