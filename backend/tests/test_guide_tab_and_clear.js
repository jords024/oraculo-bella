// backend/tests/test_guide_tab_and_clear.js — Validação das abas e limpeza do chat
import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/c6025309-4bec-4cd0-802d-18557fabdbea';

async function run() {
  console.log('🚀 Testando aba Guia de Uso e botão Limpar...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
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

    // 3. Abre o assistente
    const fabBtn = page.locator('.biblioteca-fab-assistant');
    if (await fabBtn.isVisible()) {
      await fabBtn.click();
      await page.waitForTimeout(1000);
    }

    // 4. Clica na nova aba "💡 Guia de Uso"
    console.log('💡 Acessando aba Guia de Uso...');
    await page.locator('.assistant-tab-pill:has-text("Guia de Uso")').click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'biblioteca_guide_tab_active.png') });
    console.log('📸 Captura da aba Guia de Uso salva!');

    // 5. Clica no botão "Limpar" para zerar o chat e voltar à tela inicial
    console.log('🧹 Testando botão Limpar...');
    await page.locator('.assistant-tab-pill:has-text("Conversa")').click();
    await page.waitForTimeout(600);
    await page.locator('.assistant-btn-clear').click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'biblioteca_chat_cleared_with_guide.png') });
    console.log('📸 Captura do chat limpo com o guia inicial salva!');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
