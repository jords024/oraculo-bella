import puppeteer from 'puppeteer';
import path from 'path';

async function capture() {
  console.log('📸 Efetuando login e capturando EditSlideModal com os novos botões de abas...');
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

    // Expandir o 1º carrossel para ver a faixa de slides se não estiver expandido
    console.log('📂 Expandindo carrossel...');
    await page.evaluate(() => {
      const card = document.querySelector('.carousel-card');
      if (card) card.click();
    });

    await new Promise(r => setTimeout(r, 1000));

    // Clicar no botão "Editar" do footer do carrossel ou no slide
    console.log('✏️ Clicando em Editar Slide...');
    await page.evaluate(() => {
      const editButtons = Array.from(document.querySelectorAll('button'));
      const editBtn = editButtons.find(b => b.textContent.includes('Editar'));
      if (editBtn) editBtn.click();
    });

    await new Promise(r => setTimeout(r, 2000));

    const outputPath = path.resolve('scratch/evidencia_botoes_edit_slide.png');
    await page.screenshot({ path: outputPath, fullPage: false });
    console.log(`✅ Evidência visual do modal de edição salva em: ${outputPath}`);
  } catch (err) {
    console.error('❌ Erro na captura de tela:', err.message);
  } finally {
    await browser.close();
  }
}

capture();
