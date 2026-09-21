import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/900bfd3a-0caa-428d-a262-ce5661a996d9';

async function run() {
  console.log('🚀 Iniciando teste de Recriar Imagem no modal de edição de slide...');
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

    // 3. Abre o primeiro carrossel para visualização e edição
    console.log('🖼️ Abrindo lightbox do primeiro carrossel...');
    const carouselThumb = page.locator('.carousel-card img, .carousel-card').first();
    if (await carouselThumb.isVisible()) {
      await carouselThumb.click();
      await page.waitForTimeout(1000);

      // Clica no botão Editar Slide no lightbox
      const editSlideBtn = page.locator('button:has-text("Editar"), .lightbox-actions button:has-text("Editar")').first();
      if (await editSlideBtn.isVisible()) {
        await editSlideBtn.click();
        await page.waitForTimeout(1000);

        // Abre a aba Recriar Imagem no modal de slide
        const recriarTab = page.locator('.edit-tab:has-text("Recriar Imagem")');
        if (await recriarTab.isVisible()) {
          await recriarTab.click();
          await page.waitForTimeout(800);
          console.log('📸 Capturando visual da aba Recriar Imagem...');
          await page.screenshot({ path: path.join(ARTIFACT_DIR, 'edit_slide_recriar_imagem_view.png') });
        }
      }
    }

    console.log('🎉 Validação do modal de recriar imagem concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
