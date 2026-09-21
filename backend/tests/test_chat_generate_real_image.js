import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/900bfd3a-0caa-428d-a262-ce5661a996d9';

async function run() {
  console.log('🚀 Testando envio de prompt e geração real no Chat da IA...');
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

    // 2. Navega para Biblioteca
    const bibNavBtn = page.locator('.nav-item:has-text("Biblioteca"), button:has-text("Biblioteca")').first();
    await bibNavBtn.click();
    await page.waitForSelector('.lib-card, .biblioteca-grid', { timeout: 20000 });
    await page.waitForTimeout(1000);

    // 3. Garante que está na aba Conversa
    const conversaTab = page.locator('.assistant-tab-pill:has-text("Conversa")').first();
    await conversaTab.click();
    await page.waitForTimeout(500);

    // 4. Digita prompt no chat e envia
    console.log('✍️ Enviando prompt para a IA...');
    const chatInput = page.locator('.assistant-textarea');
    await chatInput.fill('Gato fofo e cachorro dourado brincando juntos em um gramado ensolarado');
    await page.waitForTimeout(300);

    const sendBtn = page.locator('.assistant-send-btn');
    await sendBtn.click();

    // 5. Aguarda o término da geração na OpenAI
    console.log('⏳ Aguardando geração da imagem pela OpenAI...');
    await page.locator('text=Criando imagem').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await page.locator('text=Criando imagem').waitFor({ state: 'detached', timeout: 90000 });
    await page.waitForTimeout(2000);

    // 6. Captura tela do chat com o resultado real
    console.log('📸 Capturando imagem gerada no chat...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'real_image_generated_chat.png') });

    // 7. Navega para a aba Geradas para ver o card na galeria
    const geradasTab = page.locator('.assistant-tab-pill:has-text("Geradas")').first();
    await geradasTab.click();
    await page.waitForTimeout(1500);

    console.log('📸 Capturando aba Geradas com a nova imagem...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'real_image_in_generated_gallery.png') });

    console.log('🎉 Teste de geração real finalizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
