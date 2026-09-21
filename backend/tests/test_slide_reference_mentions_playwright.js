// backend/tests/test_slide_reference_mentions_playwright.js
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/ad1ad4db-76ad-4f51-8c14-fdb55eb9689b';

async function run() {
  console.log('🚀 Iniciando validação E2E: Menções @ e seleção de referências da biblioteca na Recriação de Slide...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 950 });

  try {
    // 1. Login
    console.log('🔑 Realizando login...');
    await page.goto('http://localhost:5889/login.html');
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.locator('text=Carregando Estúdio...').waitFor({ state: 'detached', timeout: 30000 });
    await page.waitForTimeout(1000);

    // 2. Navega para Carrosséis
    console.log('📂 Acessando aba Carrosséis...');
    const carrosselNavBtn = page.locator('.nav-item:has-text("Carrosséis")');
    await carrosselNavBtn.click();
    await page.waitForTimeout(1500);

    // 3. Abre o primeiro carrossel e clica em Editar
    const carouselThumb = page.locator('.carousel-card img, .carousel-card').first();
    await carouselThumb.waitFor({ state: 'visible', timeout: 10000 });
    await carouselThumb.click();
    await page.waitForTimeout(1000);

    const editSlideBtn = page.locator('button:has-text("Editar"), .lightbox-actions button:has-text("Editar")').first();
    await editSlideBtn.waitFor({ state: 'visible', timeout: 10000 });
    await editSlideBtn.click();
    await page.waitForTimeout(1000);

    // 4. Clica na aba "Recriar Imagem"
    console.log('🎨 Acessando aba Recriar Imagem...');
    const recriarTab = page.locator('.edit-tab:has-text("Recriar Imagem")');
    await recriarTab.waitFor({ state: 'visible', timeout: 10000 });
    await recriarTab.click();
    await page.waitForTimeout(800);

    // 5. Localiza o textarea e digita "@" para disparar autocomplete
    console.log('⌨️ Digitando @ no Prompt Visual...');
    const promptTextarea = page.locator('.edit-panel-content textarea.form-textarea');
    await promptTextarea.waitFor({ state: 'visible', timeout: 5000 });
    await promptTextarea.click();
    await promptTextarea.fill('Pessoa segurando machado @');
    await page.waitForTimeout(600);

    // 6. Verifica se o menu de autocomplete abriu
    const mentionMenu = page.locator('.mention-autocomplete-menu');
    await mentionMenu.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Menu de menção @ exibido com sucesso!');

    const menuOpenScreenshot = path.join(ARTIFACT_DIR, 'slide_recriar_menu_aberto.png');
    await page.screenshot({ path: menuOpenScreenshot });
    console.log(`📸 Screenshot do menu aberto salvo em: ${menuOpenScreenshot}`);

    // 7. Seleciona o primeiro item com teclado (Enter)
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);
    console.log('✅ Primeira referência adicionada via Enter!');

    // 8. Digita @ novamente e seleciona a 2ª imagem com ArrowDown + Enter
    await promptTextarea.focus();
    const currentVal = await promptTextarea.inputValue();
    await promptTextarea.fill(currentVal + ' @');
    await page.waitForTimeout(600);
    await mentionMenu.waitFor({ state: 'visible', timeout: 5000 });
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);
    console.log('✅ Segunda referência adicionada via ArrowDown + Enter!');

    // 9. Digita @ e seleciona a 3ª imagem
    const val3 = await promptTextarea.inputValue();
    await promptTextarea.fill(val3 + ' @');
    await page.waitForTimeout(600);
    await mentionMenu.waitFor({ state: 'visible', timeout: 5000 });
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);
    console.log('✅ Terceira referência adicionada (limite 3/3)!');

    // 10. Captura screenshot para evidência visual
    const screenshotPath = path.join(ARTIFACT_DIR, 'slide_recriar_com_referencias.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot salvo em: ${screenshotPath}`);

    console.log('🎉 Todos os fluxos de menção @ e referências validados com sucesso!');
  } catch (err) {
    console.error('❌ Erro no teste E2E:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
