import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/34303ab6-5d35-45c2-8dfa-a6ed7fb424e0';

async function run() {
  console.log('🚀 Iniciando teste visual do modal de exclusão...');
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
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // 3. Clica na aba Carrosséis se não estiver nela
    console.log('📂 Navegando para Carrosséis...');
    await page.click('.sidebar-nav button:has-text("Carrosséis")');
    await page.waitForTimeout(2000);

    // 4. Seleciona todos
    console.log('🔘 Clicando em SELECIONAR TODOS...');
    await page.click('button:has-text("SELECIONAR TODOS")');
    await page.waitForTimeout(1000);

    // 5. Clica no botão de apagar no cabeçalho (se houver selecionados)
    console.log('🗑️ Clicando no botão de excluir lote...');
    await page.click('button:has-text("Excluir Selecionados")');
    await page.waitForTimeout(2000);

    // Captura o modal aberto com o texto legível
    console.log('📸 Capturando tela do modal com texto legível...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'bulk_delete_modal_fixed.png') });
    console.log('🎉 Teste visual finalizado!');
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await browser.close();
  }
}

run();
