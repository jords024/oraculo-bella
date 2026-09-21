import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/900bfd3a-0caa-428d-a262-ce5661a996d9';

async function run() {
  console.log('🚀 Iniciando teste de renderização da Galeria de Geradas e Dropdown...');
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
    await page.waitForTimeout(1500);

    // 3. Clica na aba Geradas
    console.log('🎨 Navegando para a aba Geradas...');
    const geradasTab = page.locator('.assistant-tab-pill:has-text("Geradas")').first();
    await geradasTab.click();
    await page.waitForTimeout(2000);

    // 4. Captura a Galeria com miniaturas coloridas e nítidas
    console.log('📸 Capturando Galeria de Geradas com renderização corrigida...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'fixed_generated_gallery_render.png') });

    // 5. Clica no botão Salvar em um dos cards para capturar o modal com título e prompt
    console.log('💾 Clicando em Salvar para abrir popup...');
    const saveBtn = page.locator('.btn-save-lib').first();
    await saveBtn.click();
    await page.waitForTimeout(1000);

    console.log('📸 Capturando Popup de Salvamento com Título e Prompt...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'save_popup_with_title_and_prompt.png') });

    console.log('🎉 Teste visual finalizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
