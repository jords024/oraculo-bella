import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:5889', { waitUntil: 'networkidle' });
  
  // Fill login inputs
  await page.fill('input[type="text"]', 'aryarajmarketing@gmail.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);

  // Set chat messages in sessionStorage
  await page.evaluate(() => {
    sessionStorage.setItem('criador_chat_messages', JSON.stringify([
      { role: 'user', content: 'Sugira 5 ideias de temas e títulos para carrosséis.' },
      { role: 'ai', content: '1. Tema: espiritualidade-dna\nTítulo: O Código Espiritual: Reescreva seu DNA com Consciência Elevada\n\n2. Tema: frequencia-traumas\nTítulo: Vibrando no Passado: Como Frequências Podem Curar Traumas Emocionais', timestamp: '18:15:00 de 21/08/2026', costUSD: 0.0016, model: 'gpt-4o' }
    ]));
  });
  
  // Click Criador in sidebar
  const criadorNav = await page.waitForSelector('.nav-item:has-text("Criador"), button:has-text("Criador"), [data-view="criador"]');
  if (criadorNav) {
    await criadorNav.click();
    await page.waitForTimeout(1000);
  }

  const screenshotPath = path.join(__dirname, 'screenshots', 'criador_chat_export_ideas.png');
  fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('Screenshot salva com sucesso em:', screenshotPath);
  await browser.close();
}

run().catch(console.error);
