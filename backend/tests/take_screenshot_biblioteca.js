// backend/tests/take_screenshot_biblioteca.js — Captura do Guia de Mensagem Padrão do Chat
import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/c6025309-4bec-4cd0-802d-18557fabdbea';

async function run() {
  console.log('🚀 Iniciando captura da mensagem padrão do chat...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1366, height: 850 });

  try {
    // 1. Login
    await page.goto('http://localhost:5889/login.html');
    await page.waitForTimeout(1000); 
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // 2. Acessa biblioteca
    const biblioBtn = await page.locator('.nav-item:has-text("Biblioteca")');
    await biblioBtn.click();
    await page.waitForTimeout(1500);

    // 3. Se o assistente estiver fechado, clica no FAB para abrir
    const fabBtn = page.locator('.biblioteca-fab-assistant');
    if (await fabBtn.isVisible()) {
      await fabBtn.click();
      await page.waitForTimeout(1000);
    }

    // 4. Captura a tela mostrando a mensagem padrão e guia de uso do assistente
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'biblioteca_chat_welcome_guide.png') });
    console.log('📸 Captura da mensagem padrão do chat salva com sucesso!');

  } catch (error) {
    console.error('❌ Erro na captura de tela:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
