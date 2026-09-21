import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/68fb1f81-b7d7-4c51-ac8c-e0920ca0dd31';

async function run() {
  console.log('🚀 Teste visual: Aba Histórico de Chat...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 850 });

  try {
    await page.goto('http://localhost:5889/');
    await page.waitForTimeout(3000);

    if (page.url().includes('login')) {
      await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
      await page.fill('input[name="password"]', '123456');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(4000);
    }

    const pipelineButton = page.locator('.card-actions button:has-text("Pipeline")').first();
    await pipelineButton.click();
    await page.waitForTimeout(2000);

    console.log('💬 Clicando na aba "Histórico de Chat"...');
    await page.click('button:has-text("Histórico de Chat")');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'pipeline_chat_tab_fixed.png') });
    console.log('🎉 Teste visual de Chat concluído!');
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
