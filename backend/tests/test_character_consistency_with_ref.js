import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/900bfd3a-0caa-428d-a262-ce5661a996d9';

async function run() {
  console.log('🚀 Testando consistência de personagem com imagem de referência...');
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

    // 2. Navega para a Biblioteca
    const bibNavBtn = page.locator('.nav-item:has-text("Biblioteca"), button:has-text("Biblioteca")').first();
    await bibNavBtn.click();
    await page.waitForSelector('.lib-card, .biblioteca-grid', { timeout: 20000 });
    await page.waitForTimeout(1000);

    // 3. Clica no botão ✨ da imagem "Foto Perfil01"
    console.log('✨ Selecionando Foto Perfil01 como referência...');
    const perfilCard = page.locator('.lib-card:has-text("Foto Perfil")').first();
    const refBtn = perfilCard.locator('.lib-reference-btn');
    await refBtn.click();
    await page.waitForTimeout(500);

    // 4. Digita o prompt para trocar a cor do cabelo para platinado
    console.log('✍️ Digitando prompt para trocar a cor do cabelo para platinado...');
    const chatInput = page.locator('.assistant-textarea');
    await chatInput.fill('troque o cabelo dele para platinado');
    await page.waitForTimeout(300);

    const sendBtn = page.locator('.assistant-send-btn');
    await sendBtn.click();

    // 5. Aguarda a IA da OpenAI processar
    console.log('⏳ Aguardando GPT-4o Vision e OpenAI gerarem o personagem com cabelo vermelho...');
    await page.locator('text=Criando imagem').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await page.locator('text=Criando imagem').waitFor({ state: 'detached', timeout: 90000 });
    await page.waitForTimeout(2000);

    // 6. Captura tela do chat
    console.log('📸 Capturando resultado com o mesmo personagem de cabelo vermelho...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'consistent_character_red_hair.png') });

    console.log('🎉 Teste de consistência de personagem concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
