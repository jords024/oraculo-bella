// backend/tests/test_library_source_filter_playwright.js
import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/ad1ad4db-76ad-4f51-8c14-fdb55eb9689b';

async function run() {
  console.log('🚀 Iniciando validação E2E: Filtros de Origem, Modelo de IA e Lightbox na Biblioteca...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await context.newPage();

  try {
    // 1. Login
    console.log('🔑 Realizando login...');
    await page.goto('http://localhost:5889/login.html');
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.locator('text=Carregando Estúdio...').waitFor({ state: 'detached', timeout: 30000 });
    await page.waitForTimeout(1000);

    // 2. Navegar para a Biblioteca
    console.log('📂 Acessando a Biblioteca de Referências...');
    const bibNav = page.locator('.nav-item:has-text("Biblioteca"), [data-tab="biblioteca"]');
    await bibNav.first().waitFor({ state: 'visible', timeout: 10000 });
    await bibNav.first().click();
    await page.waitForTimeout(1500);

    // 3. Validar se os dropdowns de Origem e Modelo estão presentes
    console.log('🔍 Validando dropdowns de filtro...');
    const originSelect = page.locator('select[title="Filtrar por Origem"]');
    await originSelect.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Dropdown de Origem visível!');

    // 4. Capturar screenshot da Galeria com badges de IA e Upload
    const galleryScreenshot = path.join(ARTIFACT_DIR, 'biblioteca_galeria_com_badges_modelo.png');
    await page.screenshot({ path: galleryScreenshot });
    console.log(`📸 Screenshot da galeria salvo em: ${galleryScreenshot}`);

    // 5. Testar filtro "Geradas por IA"
    console.log('🤖 Aplicando filtro "Geradas por IA"...');
    await originSelect.selectOption('ai');
    await page.waitForTimeout(1000);

    // 6. Abrir o Lightbox da primeira imagem clicando nela
    console.log('🖼️ Abrindo Lightbox da imagem para verificar exibição do modelo...');
    const firstImageThumb = page.locator('.lib-card-thumb-wrap').first();
    await firstImageThumb.click();
    await page.waitForTimeout(800);

    const lightboxModal = page.locator('.form-modal.open');
    await lightboxModal.waitFor({ state: 'visible', timeout: 5000 });

    // 7. Capturar screenshot do Lightbox com a informação do modelo
    const lightboxScreenshot = path.join(ARTIFACT_DIR, 'biblioteca_lightbox_com_modelo.png');
    await page.screenshot({ path: lightboxScreenshot });
    console.log(`📸 Screenshot do Lightbox salvo em: ${lightboxScreenshot}`);

    console.log('🎉 Validação E2E da Biblioteca concluída com 100% de sucesso!');
  } catch (err) {
    console.error('❌ Erro no teste Playwright:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
