import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/8b01761a-95ff-4e1d-9cea-858038be6bdd';

async function run() {
  console.log('🚀 Executando validação visual do campo "Slides Sem Imagem"...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1280, height: 800 });

  try {
    console.log('🌐 Acessando dashboard na porta 5889...');
    await page.goto('http://localhost:5889/login.html');
    await page.waitForTimeout(1000);

    console.log('✍️ Preenchendo credenciais...');
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    console.log('➕ Clicando no menu "Novo Carrossel"...');
    await page.click('button:has-text("Novo Carrossel")');
    await page.waitForTimeout(2000);

    const screenshotPath = path.join(ARTIFACT_DIR, 'no_image_slides_form_validation.png');
    console.log('📸 Salvando captura da interface...');
    await page.screenshot({ path: screenshotPath });
    console.log('🎉 Captura salva com sucesso em:', screenshotPath);
  } catch (error) {
    console.error('❌ Erro na validação visual:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
