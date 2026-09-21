import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/900bfd3a-0caa-428d-a262-ce5661a996d9';

async function run() {
  console.log('🚀 Validando seletor de layout na aba Recriar Imagem...');
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

    // 2. Navega para Carrosséis
    const carrosselNavBtn = page.locator('.nav-item:has-text("Carrosséis")');
    await carrosselNavBtn.click();
    await page.waitForTimeout(1500);

    // 3. Abre o primeiro carrossel
    const carouselThumb = page.locator('.carousel-card img, .carousel-card').first();
    await carouselThumb.click();
    await page.waitForTimeout(1000);

    // 4. Clica em Editar Slide no Lightbox
    const editSlideBtn = page.locator('button:has-text("Editar"), .lightbox-actions button:has-text("Editar")').first();
    await editSlideBtn.click();
    await page.waitForTimeout(1000);

    // 5. Abre a aba Recriar Imagem
    const recriarTab = page.locator('.edit-tab:has-text("Recriar Imagem")');
    await recriarTab.click();
    await page.waitForTimeout(800);

    // 6. Captura tela mostrando o novo seletor de formato/layout na aba Recriar Imagem
    console.log('📸 Capturando visual da aba Recriar Imagem com opções de formato...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'slide_recriar_with_layout_selector.png') });

    console.log('🎉 Validação visual do seletor de layout concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
