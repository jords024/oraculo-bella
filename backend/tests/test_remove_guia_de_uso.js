import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/900bfd3a-0caa-428d-a262-ce5661a996d9';

async function run() {
  console.log('🚀 Validando remoção do botão Guia de Uso no Assistente IA...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 950 });

  try {
    // 1. Login
    await page.goto('http://localhost:5889/login.html');
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.locator('text=Carregando Estúdio...').waitFor({ state: 'detached', timeout: 30000 });
    await page.waitForTimeout(1000);

    // 2. Navega para a Biblioteca
    const bibNavBtn = page.locator('.nav-item:has-text("Biblioteca")');
    await bibNavBtn.click();
    await page.waitForTimeout(1500);

    // 3. Valida que o botão Guia de Uso NÃO existe mais
    const guiaBtn = page.locator('.assistant-tab-pill:has-text("Guia de Uso")');
    const isGuiaVisible = await guiaBtn.isVisible();
    if (isGuiaVisible) {
      throw new Error('O botão Guia de Uso ainda está visível!');
    }
    console.log('✅ Botão Guia de Uso removido com sucesso!');

    // 4. Captura tela comprovando que apenas Conversa e Geradas existem
    console.log('📸 Capturando visual do Drawer sem a aba Guia de Uso...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'drawer_without_guia_de_uso.png') });

    console.log('🎉 Validação concluída!');
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
