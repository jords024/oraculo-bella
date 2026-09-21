import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/900bfd3a-0caa-428d-a262-ce5661a996d9';

async function run() {
  console.log('🚀 Iniciando teste de geração Fake/Mock sem consumo de tokens...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1440, height: 950 });

  try {
    // 1. Login
    await page.goto('http://localhost:5889/login.html');
    await page.waitForTimeout(1000); 

    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('http://localhost:5889/**', { timeout: 20000 }).catch(() => {});
    await page.locator('text=Carregando Estúdio...').waitFor({ state: 'detached', timeout: 30000 });
    await page.waitForTimeout(1500);

    // 2. Navega para a Biblioteca
    const bibNavBtn = page.locator('.nav-item:has-text("Biblioteca"), button:has-text("Biblioteca")').first();
    await bibNavBtn.click();
    await page.waitForSelector('.lib-card, .biblioteca-grid', { timeout: 20000 });
    await page.waitForTimeout(1000);

    // 3. Seleciona 1 referência
    console.log('✨ Selecionando 1 referência...');
    const refBtn = page.locator('.lib-reference-btn').first();
    if (await refBtn.count() > 0) {
      await refBtn.click();
      await page.waitForTimeout(500);
    }

    // 4. Digita prompt e envia
    console.log('💬 Enviando prompt no chat do assistente...');
    const chatInput = page.locator('.assistant-textarea');
    await chatInput.fill('criar personagem guerreiro com armadura sombria');
    await page.waitForTimeout(300);
    
    const sendBtn = page.locator('.assistant-send-btn');
    await sendBtn.click();

    // 5. Aguarda conclusão da geração mock (instantânea)
    await page.waitForSelector('.chat-bubble-ai-card .chat-ai-img, .chat-ai-prompt-box', { timeout: 15000 });
    await page.waitForTimeout(1500);

    console.log('📸 Capturando resultado no Chat com Imagem Mock Preta...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mock_image_chat_result.png') });

    // 6. Vai para a aba Geradas
    console.log('🎨 Navegando para a aba Geradas...');
    const geradasTab = page.locator('.assistant-tab-pill:has-text("Geradas")').first();
    await geradasTab.click();
    await page.waitForTimeout(1000);

    console.log('📸 Capturando Galeria de Geradas com Imagem Mock...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mock_image_gallery_result.png') });

    console.log('🎉 Teste de Mock Zero Tokens finalizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro no teste de mock:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
