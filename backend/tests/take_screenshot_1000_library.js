import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/900bfd3a-0caa-428d-a262-ce5661a996d9';

async function run() {
  console.log('🚀 Iniciando capturas Playwright da Biblioteca com Data e Horário de Upload...');
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

    // 2. Navega para a aba Biblioteca
    console.log('📂 Navegando para a aba Biblioteca...');
    const bibNavBtn = page.locator('.nav-item:has-text("Biblioteca"), button:has-text("Biblioteca")').first();
    await bibNavBtn.click();
    
    await page.waitForSelector('.lib-card, .biblioteca-grid', { timeout: 20000 });
    await page.waitForTimeout(2000);

    // 3. Captura os cards com a Data e Horário de Upload visíveis
    console.log('📸 Capturando galeria com data e horário de upload nos cards...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'library_cards_upload_date.png') });

    // 4. Clica no ícone de editar informações da primeira imagem para abrir o modal de detalhes
    console.log('✏️ Abrindo modal de detalhes da imagem...');
    const editBtn = page.locator('.lib-btn-icon-edit').first();
    if (await editBtn.count() > 0) {
      await editBtn.click();
      await page.waitForTimeout(1000);
      console.log('📸 Capturando modal de detalhes com data e horário de upload...');
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'library_image_details_date.png') });
    }

    console.log('🎉 Capturas visuais de data e horário concluídas com sucesso!');

  } catch (error) {
    console.error('❌ Erro na captura:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
