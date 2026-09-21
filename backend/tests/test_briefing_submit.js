import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/34303ab6-5d35-45c2-8dfa-a6ed7fb424e0';

async function run() {
  console.log('🚀 Iniciando teste do formulário do Criador...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1280, height: 800 });

  page.on('pageerror', exception => {
    console.log(`❌ Page Uncaught Exception: ${exception}`);
  });
  page.on('console', msg => {
    console.log(`💬 Console [${msg.type()}]: ${msg.text()}`);
  });

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
    
    // 3. Clica em "Novo Carrossel" no sidebar para ir ao Criador com o form
    console.log('➕ Clicando em "+ Novo Carrossel" no Sidebar...');
    await page.click('button:has-text("Novo Carrossel")');
    await page.waitForTimeout(2000);

    // 4. Preenche o formulário inline do briefing
    console.log('✍️ Preenchendo formulário de briefing...');
    await page.fill('input[placeholder*="física prova"]', 'Carrossel Teste Auto-Rascunho');
    await page.fill('input[placeholder*="frequencia-dinheiro"]', 'teste-auto-rascunho');
    await page.fill('input[placeholder*="Desktop/nome-da-pasta"]', 'C:/Users/julia/Desktop/teste-auto-rascunho');
    await page.fill('textarea[placeholder*="Legenda do post"]', 'Legenda de teste do auto-rascunho');
    await page.fill('textarea[placeholder*="Observações"]', 'Notas de teste do auto-rascunho');

    // Captura a tela com o formulário preenchido
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_briefing_filled.png') });

    // 5. Clica no botão para enviar o briefing
    console.log('🚀 Clicando em "Avaliar Briefing com IA"...');
    await page.click('button:has-text("Avaliar Briefing com IA")');
    await page.waitForTimeout(5000); // Aguarda rede e processamento inicial

    // Captura o chat rodando
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_chat_running.png') });

    // 6. Navega de volta para Carrosséis e valida se o rascunho aparece
    console.log('📂 Navegando para Carrosséis para checar o card...');
    await page.click('.sidebar-nav button:has-text("Carrosséis")');
    await page.waitForTimeout(3000);

    // Captura a lista final de carrosséis
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_dashboard_result.png') });
    console.log('🎉 Teste visual concluído!');
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await browser.close();
  }
}

run();
