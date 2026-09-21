import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/a79e77ff-8ad9-4dfe-ae10-d2f2a1c47023';

async function run() {
  console.log('🚀 Iniciando captura de tela com Playwright para Gestão de Usuários...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1280, height: 800 });

  try {
    // 1. Acessa a página de login
    console.log('🌐 Acessando página de login...');
    await page.goto('http://localhost:5176/login.html');
    await page.waitForTimeout(1000); 

    // 2. Preenche os dados e faz login como Super Admin
    console.log('✍️ Efetuando login...');
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Aguarda o login e o carregamento do dashboard
    await page.waitForTimeout(3000);

    // 3. Clica na aba "Gestão de Usuários" no menu lateral
    console.log('⚙️ Acessando Gestão de Usuários...');
    const usersBtn = await page.locator('.nav-item:has-text("Gestão de Usuários")');
    await usersBtn.click();
    await page.waitForTimeout(1500);

    // Captura aba de Usuários
    console.log('📸 Capturando aba de Usuários...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'users_tab.png') });

    // 4. Acessa a aba "Convites Enviados"
    console.log('🎨 Acessando aba Convites...');
    const invitesTab = await page.locator('button:has-text("Convites Enviados")');
    await invitesTab.click();
    await page.waitForTimeout(1000);

    // Captura aba de Convites inicial
    console.log('📸 Capturando aba de Convites...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'invites_tab.png') });

    // 5. Clica em "Novo Convite"
    console.log('➕ Clicando em Novo Convite...');
    await page.click('button:has-text("+ Novo Convite")');
    await page.waitForTimeout(500);

    // Seleciona Admin e 48 horas
    await page.selectOption('select:has-text("Colaborador")', 'admin');
    await page.selectOption('select:has-text("24 horas")', '48');
    await page.waitForTimeout(300);

    // Clica em Gerar
    await page.click('button:has-text("Gerar Convite")');
    await page.waitForTimeout(1500);

    // Captura o modal com o link gerado
    console.log('📸 Capturando modal com link de convite gerado...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'invite_modal_generated.png') });

    // Obtém o link do convite gerado para acessar no browser
    const linkText = await page.locator('div[style*="font-family: monospace"] span').textContent();
    console.log(`🔗 Link de convite gerado: ${linkText}`);

    // Fecha o modal
    await page.click('button:has-text("Fechar")');
    await page.waitForTimeout(500);

    // 6. Navega até o link do convite
    console.log('🌐 Navegando até a página de registro do convite...');
    await page.goto(linkText);
    await page.waitForTimeout(2000);

    // Captura a página de registro do convite
    console.log('📸 Capturando página pública de registro...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'register_page.png') });

    console.log('🎉 Capturas visuais criadas com sucesso na pasta de artefatos!');

  } catch (error) {
    console.error('❌ Erro na captura de tela:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
