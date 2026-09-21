import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/900bfd3a-0caa-428d-a262-ce5661a996d9';

async function run() {
  console.log('🚀 Iniciando capturas Playwright da Galeria de Geradas com 1.000 Imagens e Paginação...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1440, height: 950 });

  try {
    // 1. Login
    await page.goto('http://localhost:5889/login.html');
    await page.waitForTimeout(1000); 

    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('http://localhost:5889/**', { timeout: 20000 }).catch(() => {});
    await page.locator('text=Carregando Estúdio...').waitFor({ state: 'detached', timeout: 30000 });
    await page.waitForTimeout(1500);

    // 2. Navega para a Biblioteca
    const bibNavBtn = page.locator('.nav-item:has-text("Biblioteca"), button:has-text("Biblioteca")').first();
    await bibNavBtn.click();
    await page.waitForSelector('.lib-card, .biblioteca-grid', { timeout: 20000 });
    await page.waitForTimeout(2000);

    // 3. Clica na aba "Geradas (1000)" no Assistente
    console.log('🎨 Clicando na aba Geradas...');
    const geradasTabBtn = page.locator('.assistant-tab-pill:has-text("Geradas")').first();
    await geradasTabBtn.click();
    await page.waitForTimeout(1500);

    // 4. Captura Página 1 da Galeria de Geradas
    console.log('📸 Capturando Página 1 da Galeria de Geradas...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'generated_gallery_page_1.png') });

    // 5. Clica na Página 2 dos botões de paginação no drawer
    console.log('📄 Clicando na Página 2 no Drawer...');
    const page2Btn = page.locator('.generated-gallery-wrapper button:has-text("2")').first();
    if (await page2Btn.count() > 0) {
      await page2Btn.click();
      await page.waitForTimeout(1000);
      console.log('📸 Capturando Página 2 da Galeria de Geradas...');
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'generated_gallery_page_2.png') });
    }

    console.log('🎉 Validação visual da galeria de geradas concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
