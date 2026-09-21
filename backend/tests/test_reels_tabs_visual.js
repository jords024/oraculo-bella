import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/7b5c7d24-2b1f-4bef-a078-a6611e1f568d';

async function run() {
  console.log('🚀 Iniciando teste visual de abas do Reels com Playwright...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1280, height: 800 });

  try {
    // 1. Acessa a página de login
    console.log('🌐 Acessando página de login...');
    await page.goto('http://localhost:5176/login.html');
    await page.waitForTimeout(1000); // Aguarda animação

    // 2. Preenche os dados de login
    console.log('✍️ Preenchendo credenciais...');
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    
    console.log('🚪 Clicando no botão de Login...');
    await page.click('button[type="submit"]');
    
    // Aguarda o login e carregamento do painel/dashboard principal
    await page.waitForTimeout(3000);
    
    // 3. Clica no item do menu "Clonador de Reels"
    console.log('📹 Navegando para o Clonador de Reels...');
    // Clica no link com texto 'Clonador de Reels'
    await page.click('button:has-text("Clonador de Reels")');
    await page.waitForTimeout(2000);

    // 4. Captura a tela inicial do Clonador de Reels (Aba Clonar Reels ativa por padrão)
    console.log('📸 Salvando captura da aba de Clonagem...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'reels_cloner_tab_cloner.png') });

    // 5. Clica na aba de Histórico
    console.log('📜 Clicando na aba do Histórico...');
    await page.click('#tab-history');
    await page.waitForTimeout(1000);

    // 6. Captura a tela com a aba do Histórico ativa
    console.log('📸 Salvando captura da aba do Histórico...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'reels_cloner_tab_history.png') });

    console.log('🎉 Teste visual concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro no teste visual:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
