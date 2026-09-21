import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:5889', { waitUntil: 'networkidle' });
  
  // Login
  await page.fill('input[type="text"]', 'aryarajmarketing@gmail.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);

  // Navigate to Configurações
  const settingsBtn = await page.waitForSelector('.nav-item:has-text("Configurações"), button:has-text("Configurações"), [data-view="configuracoes"]');
  if (settingsBtn) {
    await settingsBtn.click();
    await page.waitForTimeout(1000);
  }

  const screenshotPath = path.join(__dirname, 'screenshots', 'settings_provedores_updated.png');
  fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('Screenshot salva com sucesso em:', screenshotPath);
  await browser.close();
}

run().catch(console.error);
