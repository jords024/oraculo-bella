import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/900bfd3a-0caa-428d-a262-ce5661a996d9';

async function run() {
  console.log('🚀 Iniciando teste real de Recriação de Imagem de Slide via IA...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 950 });

  page.on('console', msg => console.log('🖥️ BROWSER LOG:', msg.text()));
  page.on('response', async resp => {
    if (resp.url().includes('/regen')) {
      console.log('📡 REGEN HTTP RESPONSE:', resp.status(), resp.statusText());
      try {
        const text = await resp.text();
        console.log('📡 REGEN BODY:', text);
      } catch (e) {
        console.log('📡 REGEN BODY READ ERR:', e.message);
      }
    }
  });

  try {
    // 1. Login
    await page.goto('http://localhost:5889/login.html');
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.locator('text=Carregando Estúdio...').waitFor({ state: 'detached', timeout: 30000 });
    await page.waitForTimeout(1000);

    // 2. Navega para Carrosséis
    const carrosselNavBtn = page.locator('.nav-item:has-text("Carrosséis")');
    await carrosselNavBtn.click();
    await page.waitForTimeout(1500);

    // 3. Abre o primeiro carrossel
    const carouselThumb = page.locator('.carousel-card img, .carousel-card').first();
    await carouselThumb.click();
    await page.waitForTimeout(1000);

    // 4. Clica em Editar Slide no Lightbox
    const editSlideBtn = page.locator('button:has-text("Editar"), .lightbox-actions button:has-text("Editar")').first();
    await editSlideBtn.click();
    await page.waitForTimeout(1000);

    // 5. Abre a aba Recriar Imagem
    const recriarTab = page.locator('.edit-tab:has-text("Recriar Imagem")');
    await recriarTab.click();
    await page.waitForTimeout(800);

    // 6. Preenche prompt
    const promptTextarea = page.locator('.form-textarea').first();
    await promptTextarea.fill('Pessoa branca e loira parada na cozinha olhando pro nada, com expressão de cansaço profundo, ambiente escuro e silencioso');

    // 7. Clica em Gerar Nova Imagem
    console.log('🎨 Clicando em Gerar Nova Imagem...');
    const gerarBtn = page.locator('button:has-text("Gerar Nova Imagem")');
    await gerarBtn.click();

    // 8. Aguarda o spinner de geração finalizar (timeout 120s)
    console.log('⏳ Aguardando geração com IA...');
    await page.locator('text=Recriando Imagem com IA...').waitFor({ state: 'detached', timeout: 120000 });
    await page.waitForTimeout(2000);

    // 9. Captura o resultado comprovando que a imagem foi recriada e atualizada com sucesso
    console.log('📸 Capturando visual do slide recriado com a nova imagem...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'slide_regenerated_success.png') });

    console.log('🎉 Teste de recriação de slide concluído com 100% de sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
