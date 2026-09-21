import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/900bfd3a-0caa-428d-a262-ce5661a996d9';

async function run() {
  console.log('🚀 Iniciando teste visual de Gestão de Usuários para Admin vs Super Admin...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 950 });

  try {
    // 1. Login como Super Admin
    console.log('👑 Realizando login como Super Admin...');
    await page.goto('http://localhost:5889/login.html');
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.locator('text=Carregando Estúdio...').waitFor({ state: 'detached', timeout: 30000 });
    await page.waitForTimeout(1000);

    // 2. Acessa Gestão de Usuários como Super Admin
    console.log('📋 Acessando Gestão de Usuários como Super Admin...');
    const usersNavBtn = page.locator('.nav-item:has-text("Gestão de Usuários")');
    await usersNavBtn.click();
    await page.waitForTimeout(1500);

    // 3. Captura tela do Super Admin vendo a si mesmo listado com badge SUPER ADMIN
    console.log('📸 Capturando visual do Super Admin...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'users_management_super_admin_view.png') });

    // 4. Cria convite de Admin pelo formulário
    console.log('✉️ Criando convite para novo Admin...');
    await page.click('button:has-text("Novo Usuário")');
    await page.waitForTimeout(600);
    const roleSelect = page.locator('.form-modal select').first();
    await roleSelect.selectOption('admin');
    await page.click('button:has-text("Gerar Convite")');
    await page.waitForTimeout(1000);

    const inviteLinkEl = page.locator('.form-box span:has-text("http")').first();
    await inviteLinkEl.waitFor({ timeout: 5000 });
    const inviteLink = await inviteLinkEl.innerText();
    console.log('🔗 Link gerado:', inviteLink);
    await page.click('.form-box button:has-text("Fechar")');
    await page.waitForTimeout(500);

    // 5. Registra o novo Admin através do link
    const inviteId = inviteLink.split('invite=')[1];
    const newAdminEmail = `admin_gestor_${Date.now()}@teste.com`;
    console.log('✍️ Registrando novo admin:', newAdminEmail);
    await page.goto(`http://localhost:5889/register.html?invite=${inviteId}`);
    await page.locator('#nameInput').waitFor({ timeout: 10000 });
    await page.fill('#nameInput', 'Admin Gestor Projeto');
    await page.fill('#emailInput', newAdminEmail);
    await page.fill('#passwordInput', 'SenhaForte#2026!');
    await page.fill('#confirmPasswordInput', 'SenhaForte#2026!');
    await page.click('#submitBtn');
    await page.waitForTimeout(2000);

    // 6. Login com o novo Admin
    console.log('👤 Fazendo login com o novo Admin Gestor...');
    await page.goto('http://localhost:5889/login.html');
    await page.fill('input[name="username"]', newAdminEmail);
    await page.fill('input[name="password"]', 'SenhaForte#2026!');
    await page.click('button[type="submit"]');
    await page.locator('text=Carregando Estúdio...').waitFor({ state: 'detached', timeout: 30000 });
    await page.waitForTimeout(1000);

    // 7. Valida que o botão "Gestão de Usuários" está visível no menu lateral
    console.log('🔍 Validando botão de Gestão de Usuários no menu do Admin...');
    const adminUsersBtn = page.locator('.nav-item:has-text("Gestão de Usuários")');
    if (!(await adminUsersBtn.isVisible())) {
      throw new Error('Botão de Gestão de Usuários não está visível para o Admin!');
    }
    await adminUsersBtn.click();
    await page.waitForTimeout(1500);

    // 8. Captura tela do Admin Gestor (Super Admin Ocultado da lista)
    console.log('📸 Capturando visual do Admin Gestor (sem Super Admin na lista)...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'users_management_admin_view.png') });

    console.log('🎉 Validação visual e de permissões concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
