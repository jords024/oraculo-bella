import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  // Clear localStorage so login is shown
  await page.goto('http://localhost:5889', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const screenshotPath = path.join(__dirname, 'screenshots', 'login_footer_oraculo.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('Screenshot salva com sucesso em:', screenshotPath);

  await browser.close();
}

run().catch(console.error);
