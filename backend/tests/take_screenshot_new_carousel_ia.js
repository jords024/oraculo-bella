import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/4e3dfbf1-4242-4df1-8322-3ab42e41048b';

async function run() {
  console.log('🚀 Iniciando teste visual de Envio do Carrossel para o Chat (IA)...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1280, height: 800 });

  page.on('pageerror', exception => {
    console.log(`❌ Page Uncaught Exception: ${exception}`);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Page Console Error: ${msg.text()}`);
    }
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
    
    console.log('🚪 Clicando no botão de Login...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // 3. Clica no botão "+ Novo Carrossel" no sidebar
    console.log('➕ Clicando em "Novo Carrossel" no menu lateral...');
    await page.click('button:has-text("Novo Carrossel")');
    await page.waitForTimeout(2000); // Aguarda troca de aba

    // 4. Preenche os campos do formulário inline do chat
    console.log('✍️ Preenchendo campos do formulário inline no chat...');
    await page.fill('input[placeholder="Ex: O que a física prova sobre dinheiro..."]', 'Como programar melhor com inteligência artificial');
    await page.fill('input[placeholder="Ex: frequencia-dinheiro"]', 'ia-desenvolvimento');
    await page.selectOption('.criador-msgs select', 'B'); // Formato B
    await page.fill('input[placeholder="C:/Users/julia/Desktop/nome-da-pasta"]', 'C:/Users/aryar/Desktop/ia-dev');
    await page.fill('textarea[placeholder="Legenda do post..."]', 'Aprenda as melhores dicas para trabalhar com IA de forma eficiente.');
    await page.fill('textarea[placeholder="Observações..."]', 'Usar tom direto e curto.');

    // Captura o formulário preenchido
    console.log('📸 Salvando captura do formulário preenchido no chat...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'new_carousel_ia_input_prefilled.png') });

    // 5. Clica em "Avaliar Briefing com IA"
    console.log('📤 Clicando no botão de avaliar briefing...');
    await page.click('button:has-text("Avaliar Briefing com IA")');
    
    // Aguarda a resposta da IA começar a chegar (streaming)
    console.log('⏳ Aguardando streaming da resposta da IA...');
    await page.waitForTimeout(6000);

    // Captura a tela do criador (chat) com a resposta
    console.log('📸 Salvando captura da resposta no chat...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'new_carousel_ia_chat_response.png') });

    console.log('🎉 Teste visual concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro no teste visual:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
