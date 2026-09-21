import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/5f97c295-c7a7-4de4-b6ce-bb48c0cb1467';

async function run() {
  console.log('🚀 Iniciando captura visual do Dashboard na porta 5889...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1280, height: 800 });

  try {
    console.log('🌐 Acessando página de login...');
    await page.goto('http://localhost:5889/login.html');
    await page.waitForTimeout(2000);

    console.log('✍️ Preenchendo credenciais...');
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    
    console.log('🚪 Clicando no botão de Login...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000); // Aguarda carregar dados do Dashboard
    
    console.log('📸 Salvando captura do Dashboard...');
    const screenshotPath = path.join(ARTIFACT_DIR, 'dashboard_after_fixing.png');
    await page.screenshot({ path: screenshotPath });

    console.log('🎉 Captura de tela salva em:', screenshotPath);
  } catch (error) {
    console.error('❌ Erro na captura de tela:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
