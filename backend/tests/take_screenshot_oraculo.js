import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/a79e77ff-8ad9-4dfe-ae10-d2f2a1c47023';

async function run() {
  console.log('🚀 Iniciando captura de tela da aba Oráculo com Playwright...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1280, height: 900 });

  try {
    // 1. Login
    await page.goto('http://localhost:5176/login.html');
    await page.waitForTimeout(1000); 
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // 2. Acessa Oráculo
    const oraculoBtn = await page.locator('.nav-item:has-text("Oráculo")');
    await oraculoBtn.click();
    await page.waitForTimeout(2000);

    // 3. Captura aba de Oráculo
    console.log('📸 Capturando aba de Oráculo...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'oraculo_tab.png') });

    console.log('🎉 Captura da aba Oráculo criada com sucesso!');

  } catch (error) {
    console.error('❌ Erro na captura de tela da aba Oráculo:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
