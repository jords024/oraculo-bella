import puppeteer from 'puppeteer';
import path from 'path';

async function capture() {
  console.log('📸 Efetuando login e capturando Lightbox com pré-carregamento e cache estável...');
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

    // Clicar na thumb do 1º slide para abrir o Lightbox
    console.log('🖼️ Abrindo Lightbox do 1º carrossel...');
    await page.evaluate(() => {
      const thumbs = document.querySelectorAll('.slide-thumb-wrap');
      if (thumbs && thumbs[0]) thumbs[0].click();
    });

    await new Promise(r => setTimeout(r, 2000));

    // Clicar na seta da direita para ir ao 2º slide de forma rápida
    console.log('› Passando para o próximo slide...');
    await page.evaluate(() => {
      const nextBtn = document.querySelector('.lb-nav-arrow:last-child');
      if (nextBtn) nextBtn.click();
    });

    await new Promise(r => setTimeout(r, 1000));

    const outputPath = path.resolve('scratch/evidencia_lightbox_rapido.png');
    await page.screenshot({ path: outputPath, fullPage: false });
    console.log(`✅ Evidência visual do Lightbox salva em: ${outputPath}`);
  } catch (err) {
    console.error('❌ Erro na captura de tela:', err.message);
  } finally {
    await browser.close();
  }
}

capture();
