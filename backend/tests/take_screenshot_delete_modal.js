import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/a79e77ff-8ad9-4dfe-ae10-d2f2a1c47023';

async function run() {
  console.log('🚀 Iniciando captura de tela do modal de exclusão com Playwright...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1280, height: 800 });

  try {
    // 1. Login
    await page.goto('http://localhost:5176/login.html');
    await page.waitForTimeout(1000); 
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // 2. Acessa Gestão de Usuários
    const usersBtn = await page.locator('.nav-item:has-text("Gestão de Usuários")');
    await usersBtn.click();
    await page.waitForTimeout(1500);

    // 3. Abre modal de exclusão do Colaborador Teste
    console.log('💥 Clicando no botão Excluir do Colaborador...');
    const deleteBtn = await page.locator('tr:has-text("Colaborador Teste") button:has-text("Excluir")');
    await deleteBtn.click();
    await page.waitForTimeout(1000);

    // 4. Captura modal de exclusão
    console.log('📸 Capturando modal com o botão de confirmação vermelho...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'delete_modal.png') });

    console.log('🎉 Captura do modal criada com sucesso!');

  } catch (error) {
    console.error('❌ Erro na captura de tela do modal:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
