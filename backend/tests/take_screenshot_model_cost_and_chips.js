import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/900bfd3a-0caa-428d-a262-ce5661a996d9';

async function run() {
  console.log('🚀 Iniciando capturas Playwright de Modelo, Custo em Reais e Reset de Referências...');
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
    await page.waitForTimeout(1500);

    // 3. Captura o Chat com Modelo e Custo em Reais visíveis
    console.log('📸 Capturando Chat com Modelo e Custo em Reais...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'library_chat_model_and_cost.png') });

    // 4. Seleciona uma imagem como referência para testar o reset automático
    console.log('✨ Selecionando 1 imagem de referência...');
    const refBtn = page.locator('.lib-reference-btn').first();
    if (await refBtn.count() > 0) {
      await refBtn.click();
      await page.waitForTimeout(500);
    }

    // 5. Troca para a aba Geradas para capturar modelo e custo nos cards gerados
    console.log('🎨 Navegando para a aba Geradas...');
    const geradasTab = page.locator('.assistant-tab-pill:has-text("Geradas")').first();
    await geradasTab.click();
    await page.waitForTimeout(1000);

    console.log('📸 Capturando Galeria de Geradas com Modelo e Custo...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'generated_gallery_model_and_cost.png') });

    console.log('🎉 Todas as capturas visuais foram concluídas com sucesso!');
  } catch (error) {
    console.error('❌ Erro na captura:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
