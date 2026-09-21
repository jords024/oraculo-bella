import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/900bfd3a-0caa-428d-a262-ce5661a996d9';

async function run() {
  console.log('🚀 Iniciando captura de tela com Playwright para 1.000 Carrosséis...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1440, height: 950 });

  try {
    // 1. Login
    console.log('🌐 Acessando página de login no frontend (5889)...');
    await page.goto('http://localhost:5889/login.html');
    await page.waitForTimeout(1000); 

    console.log('✍️ Efetuando login...');
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Aguarda o login e a navegação para o dashboard
    console.log('⏳ Aguardando navegação e carregamento do dashboard...');
    await page.waitForURL('http://localhost:5889/**', { timeout: 20000 }).catch(() => {});
    await page.locator('text=Carregando Estúdio...').waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
    await page.locator('text=Carregando Estúdio...').waitFor({ state: 'detached', timeout: 30000 });
    await page.waitForTimeout(1500);

    // 2. Captura do Dashboard de Carrosséis (Página 1, Todos)
    console.log('📸 Capturando aba Carrosséis (Página 1, 1000 itens)...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'carousels_1000_all.png') });

    // 3. Clica no filtro "PRONTO"
    console.log('🔍 Testando filtro PRONTO...');
    const prontoBtn = await page.locator('.filter-pill:has-text("PRONTO"), button:has-text("PRONTO")');
    if (await prontoBtn.count() > 0) {
      await prontoBtn.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'carousels_filter_pronto.png') });
    }

    // 4. Volta para "Todos" e navega para a página 4
    console.log('📄 Navegando para página 4...');
    const todosBtn = await page.locator('.filter-pill:has-text("Todos"), button:has-text("Todos")');
    if (await todosBtn.count() > 0) {
      await todosBtn.first().click();
      await page.waitForTimeout(1000);
    }

    const page4Btn = await page.locator('button.page-btn:has-text("4")');
    if (await page4Btn.count() > 0) {
      await page4Btn.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'carousels_1000_page_4.png') });
    }

    // 5. Clica no filtro "AGENDADO"
    console.log('🔍 Testando filtro AGENDADO...');
    const agendadoBtn = await page.locator('.filter-pill:has-text("AGENDADO"), button:has-text("AGENDADO")');
    if (await agendadoBtn.count() > 0) {
      await agendadoBtn.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'carousels_filter_agendado.png') });
    }

    console.log('🎉 Capturas visuais dos 1.000 carrosséis criadas com sucesso!');

  } catch (error) {
    console.error('❌ Erro na captura de tela:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
