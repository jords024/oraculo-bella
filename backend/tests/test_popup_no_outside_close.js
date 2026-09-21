// backend/tests/test_popup_no_outside_close.js — Validação de que popups não fecham ao clicar fora
import { chromium } from 'playwright';

async function run() {
  console.log('🚀 Testando que o popup não fecha ao clicar fora...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1366, height: 850 });

  try {
    // 1. Login
    await page.goto('http://localhost:5889/login.html');
    await page.waitForTimeout(1000); 
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // 2. Acessa biblioteca
    const biblioBtn = await page.locator('.nav-item:has-text("Biblioteca")');
    await biblioBtn.click();
    await page.waitForTimeout(1500);

    // 3. Abre modal de detalhes da imagem
    console.log('🔍 Abrindo popup de detalhes...');
    const editBtn = await page.locator('.lib-btn-icon-edit').first();
    await editBtn.click();
    await page.waitForTimeout(1000);

    // Verifica que o modal está aberto
    const modal = page.locator('.form-modal.open');
    if (!(await modal.isVisible())) {
      throw new Error('Modal não abriu!');
    }
    console.log('✓ Modal de detalhes aberto.');

    // 4. Clica no canto superior esquerdo (fora da caixa central)
    console.log('🖱️ Clicando fora da caixa central (no backdrop)...');
    await page.mouse.click(20, 20);
    await page.waitForTimeout(1000);

    // 5. Valida que o modal CONTINUA ABERTO
    const stillVisible = await modal.isVisible();
    if (!stillVisible) {
      throw new Error('❌ Falha: O modal fechou ao clicar fora!');
    }
    console.log('✅ SUCESSO: O modal permaneceu aberto após o clique externo!');

    // 6. Fecha pelo botão X
    console.log('✕ Fechando pelo botão X...');
    await page.locator('.form-box button:has-text("✕")').click();
    await page.waitForTimeout(600);

    const closed = !(await modal.isVisible());
    if (!closed) {
      throw new Error('❌ Falha: O modal não fechou pelo botão X!');
    }
    console.log('✅ SUCESSO: O modal fechou com sucesso ao clicar no botão X!');

  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
