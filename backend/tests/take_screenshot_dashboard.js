import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/4e3dfbf1-4242-4df1-8322-3ab42e41048b';

async function run() {
  console.log('🚀 Iniciando teste visual do Dashboard...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1280, height: 800 });

  try {
    // 1. Acessa a página de login
    console.log('🌐 Acessando página de login...');
    await page.goto('http://localhost:5176/login.html');
    await page.waitForTimeout(1000);

    // 2. Preenche os dados de login
    console.log('✍️ Preenchendo credenciais...');
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    
    console.log('🚪 Clicando no botão de Login...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000); // Aguarda carregar dados do Dashboard
    
    // Captura a tela do dashboard com os cartões de carrossel
    console.log('📸 Salvando captura do Dashboard...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'dashboard_after_button_change.png') });

    console.log('🎉 Teste visual do Dashboard concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro no teste visual do Dashboard:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
