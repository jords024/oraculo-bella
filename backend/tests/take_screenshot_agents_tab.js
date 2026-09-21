import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/68fb1f81-b7d7-4c51-ac8c-e0920ca0dd31';

async function run() {
  console.log('🚀 Iniciando teste visual da aba Prompts dos Agentes...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1280, height: 850 });

  try {
    // 1. Acessa a aplicação
    console.log('🌐 Acessando aplicação...');
    await page.goto('http://localhost:5889/');
    await page.waitForTimeout(3000);

    // 2. Login se necessário
    if (page.url().includes('login')) {
      console.log('✍️ Efetuando login...');
      await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
      await page.fill('input[name="password"]', '123456');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(4000);
    }

    // 3. Clica no botão "⚡ Pipeline" do primeiro card
    console.log('⚡ Clicando no botão "⚡ Pipeline" do primeiro card...');
    const pipelineButton = page.locator('.card-actions button:has-text("Pipeline")').first();
    await pipelineButton.click();
    await page.waitForTimeout(2000);

    // 4. Clica na aba "Prompts dos Agentes"
    console.log('🤖 Clicando na aba "Prompts dos Agentes"...');
    await page.click('button:has-text("Prompts dos Agentes")');
    await page.waitForTimeout(1000);
    
    // Captura a tela com a aba de prompts de agentes aberta
    const modalImagePath = path.join(ARTIFACT_DIR, 'pipeline_agents_tab_fixed.png');
    console.log(`📸 Salvando captura da aba de Agentes em: ${modalImagePath}`);
    await page.screenshot({ path: modalImagePath });

    console.log('🎉 Teste visual da aba de Agentes concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro no teste visual:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
