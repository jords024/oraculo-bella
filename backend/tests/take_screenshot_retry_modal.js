import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:5889', { waitUntil: 'networkidle' });
  
  // Fill login inputs
  await page.fill('input[type="text"]', 'aryarajmarketing@gmail.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);

  // Click Recriar button on the first card
  const recriarBtn = await page.waitForSelector('button:has-text("Recriar")');
  if (recriarBtn) {
    await recriarBtn.click();
    await page.waitForTimeout(500);
  }

  const screenshotPath = path.join(__dirname, 'screenshots', 'confirm_retry_modal.png');
  fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('Screenshot salva com sucesso em:', screenshotPath);
  await browser.close();
}

run().catch(console.error);
