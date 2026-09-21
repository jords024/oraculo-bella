import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/900bfd3a-0caa-428d-a262-ce5661a996d9';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 950 });

  try {
    await page.goto('http://localhost:5889/login.html');
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.locator('text=Carregando Estúdio...').waitFor({ state: 'detached', timeout: 30000 });
    await page.waitForTimeout(1000);

    const bibNavBtn = page.locator('.nav-item:has-text("Biblioteca"), button:has-text("Biblioteca")').first();
    await bibNavBtn.click();
    await page.waitForSelector('.lib-card, .biblioteca-grid', { timeout: 20000 });

    const geradasTab = page.locator('.assistant-tab-pill:has-text("Geradas")').first();
    await geradasTab.click();
    await page.waitForTimeout(1000);

    // Foca o select
    const selectElem = page.locator('.generated-gallery-wrapper select');
    await selectElem.focus();
    await page.waitForTimeout(300);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'dropdown_fixed_dark.png') });
    console.log('✅ Screenshot do select capturado!');
  } finally {
    await browser.close();
  }
}

run();
