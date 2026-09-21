import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/6cb7202d-73c4-47c7-bcc5-e7afc41c6be2';

async function run() {
  console.log('🚀 Iniciando capturas de tela das permissões...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1280, height: 1000 });

  try {
    // 1. Login
    console.log('🌐 Efetuando login...');
    await page.goto('http://localhost:5176/login.html');
    await page.waitForTimeout(1000); 
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // 2. Ir para Gestão de Usuários
    console.log('⚙️ Acessando Gestão de Usuários...');
    const usersBtn = await page.locator('.nav-item:has-text("Gestão de Usuários")');
    await usersBtn.click();
    await page.waitForTimeout(1500);

    // 3. Abrir Novo Convite Modal
    console.log('➕ Abrindo modal de Novo Convite...');
    await page.click('button:has-text("+ Novo Usuário")');
    await page.waitForTimeout(1000);

    // Capturar Modal de Novo Convite
    console.log('📸 Capturando Novo Convite modal...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'new_invite_permissions.png') });

    // Fechar Modal
    await page.click('button:has-text("Fechar")');
    await page.waitForTimeout(500);

    // 4. Abrir Editar Usuário Modal
    console.log('✏️ Abrindo modal de Editar Usuário...');
    // Clica no botão de editar do primeiro usuário (deve ser o segundo na tabela se o primeiro for o superadmin virtual que não tem botão de editar)
    const editButtons = await page.locator('button:has-text("Editar")');
    if (await editButtons.count() > 0) {
      await editButtons.first().click();
      await page.waitForTimeout(1000);

      // Capturar Modal de Editar Usuário
      console.log('📸 Capturando Editar Usuário modal...');
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'edit_user_permissions.png') });
    } else {
      console.log('⚠️ Nenhum botão de editar encontrado.');
    }

    console.log('🎉 Capturas visuais criadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro na captura de tela:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
