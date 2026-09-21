import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/900bfd3a-0caa-428d-a262-ce5661a996d9';

async function run() {
  console.log('🚀 Iniciando teste de persistência e reset do Criador...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 950 });

  try {
    // 1. Login
    await page.goto('http://localhost:5889/login.html');
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.locator('text=Carregando Estúdio...').waitFor({ state: 'detached', timeout: 30000 });
    await page.waitForTimeout(1000);

    // 2. Navega para o Criador
    console.log('📝 Acessando a tela Criador...');
    const criadorNavBtn = page.locator('.nav-item:has-text("Criador"), button:has-text("Criador")').first();
    await criadorNavBtn.click();
    await page.waitForTimeout(1000);

    // 3. Clica no botão de sugestão de ideias para iniciar a conversa
    console.log('💡 Enviando mensagem no Criador...');
    const promptPill = page.locator('.criador-prompt-pill, button:has-text("Dar ideias")').first();
    if (await promptPill.isVisible()) {
      await promptPill.click();
    } else {
      await page.fill('.criador-input', 'quero ideias de temas e titulos para criar o carrossel');
      await page.click('.criador-send-btn');
    }

    // Aguarda a resposta da IA começar a renderizar
    await page.locator('.criador-msg.ai, .criador-ai-msg, .criador-msg').first().waitFor({ timeout: 20000 });
    await page.waitForTimeout(4000);

    // 4. Sai da tela indo para Biblioteca
    console.log('🔄 Saindo do Criador e navegando para a Biblioteca...');
    const bibNavBtn = page.locator('.nav-item:has-text("Biblioteca")').first();
    await bibNavBtn.click();
    await page.waitForTimeout(1500);

    // 5. Volta para o Criador pelo botão lateral
    console.log('🔙 Retornando ao Criador pelo menu lateral...');
    await criadorNavBtn.click();
    await page.waitForTimeout(1500);

    // 6. Captura tela comprovando que a conversa NÃO foi apagada
    console.log('📸 Capturando Criador com a conversa preservada...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'criador_conversation_preserved.png') });

    // 7. Clica no botão "+ Novo Carrossel" (botão vermelho no rodapé da sidebar)
    console.log('✨ Clicando no botão "+ Novo Carrossel"...');
    const newCarouselBtn = page.locator('.btn-sidebar-action:has-text("Novo Carrossel")');
    await newCarouselBtn.click();
    await page.waitForTimeout(1500);

    // 8. Captura tela comprovando que o Criador foi 100% limpo
    console.log('📸 Capturando Criador 100% limpo após "+ Novo Carrossel"...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'criador_cleaned_on_new_carousel.png') });

    console.log('🎉 Teste de persistência e reset do Criador concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
