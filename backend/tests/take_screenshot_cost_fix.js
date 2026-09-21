import puppeteer from 'puppeteer';
import path from 'path';

async function capture() {
  console.log('📸 Efetuando login e capturando Dashboard com a correção do cálculo de custo...');
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  try {
    await page.goto('http://localhost:5889/login.html', { waitUntil: 'networkidle2' });

    await page.type('input[name="username"]', 'afonteoculta');
    await page.type('input[name="password"]', 'FonteOculta@2025');

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {})
    ]);

    await new Promise(r => setTimeout(r, 2000));

    const outputPath = path.resolve('scratch/evidencia_custo_zero_falhas.png');
    await page.screenshot({ path: outputPath, fullPage: false });
    console.log(`✅ Evidência visual do Dashboard com custo corrigido salva em: ${outputPath}`);
  } catch (err) {
    console.error('❌ Erro na captura de tela:', err.message);
  } finally {
    await browser.close();
  }
}

capture();
