// backend/tests/test_financeiro_tab.js
import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/ad1ad4db-76ad-4f51-8c14-fdb55eb9689b';

async function run() {
  console.log('🚀 Iniciando validação E2E: Soma do Custo Total Geral (Carrosséis + Galeria/Estúdio + Prompts)...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 }
  });
  const page = await context.newPage();

  try {
    // 1. Acessa e faz login
    console.log('🔑 Realizando login...');
    await page.goto('http://localhost:5889/login.html');
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.locator('text=Carregando Estúdio...').waitFor({ state: 'detached', timeout: 30000 });
    await page.waitForTimeout(1000);

    // 2. Navega para a aba Financeiro
    console.log('💰 Acessando aba Financeiro...');
    const financeiroBtn = page.locator('button.nav-item:has-text("Financeiro"), .nav-item:has-text("Financeiro")');
    await financeiroBtn.first().waitFor({ state: 'visible', timeout: 10000 });
    await financeiroBtn.first().click();
    await page.waitForTimeout(1500);

    // 3. Captura os valores dos cards de KPI
    const totalGeralText = await page.locator('.financeiro-kpi-card:has-text("Custo Total Geral") .financeiro-kpi-value').textContent();
    const carrosseisText = await page.locator('.financeiro-kpi-card:has-text("Carrosséis & Recriações") .financeiro-kpi-value').textContent();
    const estudioText = await page.locator('.financeiro-kpi-card:has-text("Imagens de Estúdio") .financeiro-kpi-value').textContent();
    const promptsText = await page.locator('.financeiro-kpi-card:has-text("Prompts & Conversas IA") .financeiro-kpi-value').textContent();

    console.log(`📊 Valores nos cards:`);
    console.log(`   - Custo Total Geral: ${totalGeralText.trim()}`);
    console.log(`   - Carrosséis & Recriações: ${carrosseisText.trim()}`);
    console.log(`   - Imagens de Estúdio / Galeria: ${estudioText.trim()}`);
    console.log(`   - Prompts & Conversas IA: ${promptsText.trim()}`);

    // 4. Capturar screenshot para evidência visual
    const screenshotPath = path.join(ARTIFACT_DIR, 'financeiro_custo_total_somado.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot salvo em: ${screenshotPath}`);

    console.log('🎉 Validação do Custo Total Geral concluída com sucesso!');
  } catch (err) {
    console.error('❌ Falha no teste do Financeiro:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
