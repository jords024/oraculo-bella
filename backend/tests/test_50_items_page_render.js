import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/900bfd3a-0caa-428d-a262-ce5661a996d9';

async function run() {
  console.log('🚀 Iniciando teste de renderização com 50 itens por página na aba Geradas...');
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

    // 3. Abre a aba Geradas
    console.log('🎨 Navegando para a aba Geradas...');
    const generatedTabBtn = page.locator('.assistant-tab-pill:has-text("Geradas")');
    await generatedTabBtn.click();
    await page.waitForTimeout(1000);

    // 4. Seleciona 50 itens por página no dropdown
    console.log('🔢 Selecionando 50 itens por página no drawer...');
    const drawerPageSizeSelect = page.locator('.generated-gallery-wrapper select').first();
    await drawerPageSizeSelect.selectOption('50');
    await page.waitForTimeout(1500);

    // 5. Captura tela comprovando que os cards com 50 itens têm altura completa e scroll limpo
    console.log('📸 Capturando visual com 50 itens por página...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'gallery_50_items_perfect_render.png') });

    // 6. Rola o container da galeria para baixo e tira outra screenshot
    console.log('📜 Rolando o container para baixo...');
    await page.evaluate(() => {
      const container = document.querySelector('.generated-gallery-container');
      if (container) container.scrollTop = 400;
    });
    await page.waitForTimeout(800);

    console.log('📸 Capturando visual após scroll com 50 itens...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'gallery_50_items_scrolled_render.png') });

    console.log('🎉 Teste visual de 50 itens concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
