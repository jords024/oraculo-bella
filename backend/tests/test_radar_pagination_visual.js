import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/c20a99c8-b31f-48d4-9df0-a832bdaf6a2b';

async function run() {
  console.log('🚀 Iniciando teste visual do Radar com Paginação via Playwright...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1280, height: 1200 });

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
    
    // Aguarda o login
    await page.waitForTimeout(3000);
    
    // 3. Clica no item do menu "Radar"
    console.log('📡 Navegando para o Radar...');
    await page.click('button:has-text("Radar")');
    await page.waitForTimeout(2000);

    // 4. Captura a tela inicial do Radar (com paginação de 10)
    console.log('📸 Salvando captura com paginação padrão (10 por página)...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'radar_pagination_10.png'), fullPage: true });

    // 5. Altera para 25 por página
    console.log('⚙️ Alterando limite para 25 por página...');
    await page.selectOption('#items-per-page-select', '25');
    await page.waitForTimeout(1000);

    // 6. Captura a tela com paginação de 25
    console.log('📸 Salvando captura com paginação alterada (25 por página)...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'radar_pagination_25.png'), fullPage: true });

    console.log('🎉 Teste visual concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro no teste visual:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
