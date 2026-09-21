import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/a79e77ff-8ad9-4dfe-ae10-d2f2a1c47023';

async function run() {
  console.log('🚀 Iniciando captura de tela com Playwright para Identidade Visual...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1280, height: 800 });

  try {
    // 1. Acessa a página de login inicial (mostrando o nome da empresa padrão)
    console.log('🌐 Acessando página de login inicial...');
    await page.goto('http://localhost:5176/login.html');
    await page.waitForTimeout(1000); 
    console.log('📸 Capturando tela de login antes da alteração...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'login_before.png') });

    // 2. Preenche os dados e faz login
    console.log('✍️ Efetuando login...');
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Aguarda o login e o carregamento do dashboard
    await page.waitForTimeout(3000);

    // 3. Clica na aba Configurações
    console.log('⚙️ Acessando Configurações...');
    const configBtn = await page.locator('.nav-item:has-text("Configurações")');
    await configBtn.click();
    await page.waitForTimeout(1000);

    // 4. Clica na aba "Identidade Visual"
    console.log('🎨 Acessando aba Identidade Visual...');
    const identityTab = await page.locator('button:has-text("Identidade Visual")');
    await identityTab.click();
    await page.waitForTimeout(1000);

    // 5. Preenche o novo campo "Nome da Empresa"
    console.log('✍️ Preenchendo Nome da Empresa...');
    const companyInput = await page.locator('div.key-row:has-text("Nome da Empresa") input');
    await companyInput.fill('EMPRESA SUPREMA');
    await page.waitForTimeout(500);

    // 6. Clica em "Salvar Identidade"
    console.log('💾 Clicando em Salvar Identidade...');
    const saveBtn = await page.locator('button:has-text("Salvar Identidade")');
    await saveBtn.click();
    await page.waitForTimeout(1500); // Aguarda resposta do servidor e reload

    // 7. Navega diretamente para a página de login para testar a resposta pública
    console.log('🌐 Navegando diretamente para a página de login para ver o novo nome...');
    await page.goto('http://localhost:5176/login.html');
    await page.waitForTimeout(1500);
    console.log('📸 Capturando tela de login dinâmica atualizada...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'login_after.png') });

    // 8. Loga novamente para restaurar o estado original
    console.log('✍️ Efetuando login novamente para restaurar...');
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    console.log('⚙️ Acessando Configurações para restaurar...');
    await page.locator('.nav-item:has-text("Configurações")').click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Identidade Visual")').click();
    await page.waitForTimeout(1000);

    console.log('🔄 Restaurando valor original...');
    const companyInput2 = await page.locator('div.key-row:has-text("Nome da Empresa") input');
    await companyInput2.fill('FONTE OCULTA');
    await page.waitForTimeout(200);
    await page.locator('button:has-text("Salvar Identidade")').click();
    await page.waitForTimeout(1000);

    console.log('🎉 Capturas visuais criadas com sucesso na pasta de artefatos!');

  } catch (error) {
    console.error('❌ Erro na captura de tela:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
