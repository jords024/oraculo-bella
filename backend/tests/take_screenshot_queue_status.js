import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/62103130-50b4-41c9-9c56-22fb7292fd40';

async function run() {
  console.log('🚀 Capturando tela do Dashboard para verificar visualização do status...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 850 });

  try {
    await page.goto('http://localhost:5889/');
    await page.waitForTimeout(3000);

    if (page.url().includes('login')) {
      console.log('✍️ Preenchendo credenciais de login...');
      await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
      await page.fill('input[name="password"]', '123456');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(4000);
    }

    console.log('📸 Tirando screenshot da página do Dashboard...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'dashboard_queue_status_verification.png') });
    console.log('🎉 Captura de tela salva em: dashboard_queue_status_verification.png!');
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
