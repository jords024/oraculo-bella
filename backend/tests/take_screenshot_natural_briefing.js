import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/62103130-50b4-41c9-9c56-22fb7292fd40';

async function run() {
  console.log('🚀 Capturando tela da nova interface de Briefing em Linguagem Natural...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 850 });

  try {
    await page.goto('http://localhost:5889/');
    await page.waitForTimeout(3000);

    if (page.url().includes('login')) {
      await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
      await page.fill('input[name="password"]', '123456');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(4000);
    }

    console.log('💬 Clicando no menu Criador na Sidebar...');
    await page.click('.nav-item:has-text("Criador")');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'criador_natural_briefing.png') });
    console.log('🎉 Captura de tela salva com sucesso em criador_natural_briefing.png!');
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
