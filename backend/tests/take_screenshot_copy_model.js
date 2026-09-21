import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/9dea563d-3b95-4988-b5f7-e7d67e5f682e';

async function run() {
  console.log('🚀 Iniciando captura de tela para validação visual do modelo de copy...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1280, height: 900 });

  try {
    // 1. Acessa a página de login
    console.log('🌐 Acessando a página de login...');
    await page.goto('http://localhost:5889/login.html');
    await page.waitForTimeout(1000);

    // 2. Preenche os dados de login
    console.log('✍️ Preenchendo credenciais...');
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    
    console.log('🚪 Clicando no botão de Login...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000); // Aguarda carregar dados do Dashboard
    
    // 3. Clica na aba de Configurações
    console.log('⚙️ Clicando na aba Configurações...');
    await page.locator('button:has-text("Configurações")').click();
    await page.waitForTimeout(2000); // Aguarda renderizar as configurações

    // 4. Captura a tela de configurações com o novo dropdown do modelo de copy
    console.log('📸 Salvando captura da tela de configurações...');
    const dest = path.join(ARTIFACT_DIR, 'copy_model_settings.png');
    await page.screenshot({ path: dest });
    console.log(`🎉 Captura salva com sucesso em: ${dest}`);
  } catch (error) {
    console.error('❌ Erro no teste visual:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
