import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/900bfd3a-0caa-428d-a262-ce5661a996d9';

async function run() {
  console.log('🚀 Iniciando teste de captura do modal de edição de slide preenchido...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1440, height: 950 });

  try {
    // 1. Login
    console.log('🌐 Acessando login...');
    await page.goto('http://localhost:5889/login.html');
    await page.waitForTimeout(1000); 

    console.log('✍️ Efetuando login...');
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('http://localhost:5889/**', { timeout: 20000 }).catch(() => {});
    await page.locator('text=Carregando Estúdio...').waitFor({ state: 'detached', timeout: 30000 });
    await page.waitForTimeout(1500);

    // 2. Expande o primeiro carrossel
    console.log('📂 Expandindo primeiro carrossel...');
    const cardHeader = page.locator('.card-header').first();
    await cardHeader.click();
    await page.waitForTimeout(1000);

    // 3. Hover sobre o primeiro slide e clica em editar
    console.log('✏️ Clicando em editar slide...');
    const thumbWrap = page.locator('.slide-thumb-wrap').first();
    await thumbWrap.hover();
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      const editBtn = document.querySelector('.slide-icon-btn-edit');
      if (editBtn) editBtn.click();
    });
    
    await page.waitForSelector('#edit-modal, .edit-box', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // 4. Captura do modal de edição com os campos preenchidos
    console.log('📸 Capturando modal de edição...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'edit_slide_prefilled.png') });

    console.log('🎉 Captura realizada com sucesso!');

  } catch (error) {
    console.error('❌ Erro na captura:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
