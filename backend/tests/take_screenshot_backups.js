import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/e72db39c-4ba0-4658-8285-dd5c5c7a1402';

async function run() {
  console.log('🚀 Iniciando captura de tela com Playwright para validação das Abas de Backup...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1280, height: 950 });

  try {
    // 1. Acessa a página de login
    console.log('🌐 Acessando dashboard no frontend...');
    const url = 'http://localhost:5889';
    await page.goto(url);
    await page.waitForTimeout(1000); 

    // Verifica se precisa de login
    const isLogin = await page.locator('input[name="username"]').count();
    if (isLogin > 0) {
      console.log('✍️ Efetuando login...');
      await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
      await page.fill('input[name="password"]', '123456');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2500);
    }

    // 2. Clica na aba "Backups do Banco" no menu lateral
    console.log('⚙️ Acessando menu Backups do Banco...');
    const backupsBtn = await page.locator('.nav-item:has-text("Backups do Banco")');
    await backupsBtn.click();
    await page.waitForTimeout(1500);

    // 3. Captura Aba 1: Histórico & Arquivos
    console.log('📸 Capturando Aba 1: Histórico & Arquivos...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'aba_1_historico_arquivos.png'), fullPage: true });

    // 4. Clica e Captura Aba 2: Backup Manual & Importar
    console.log('⚡ Clicando na Aba 2: Backup Manual & Importar...');
    const manualTabBtn = await page.locator('button.inner-tab-btn:has-text("Backup Manual & Importar")');
    await manualTabBtn.click();
    await page.waitForTimeout(1000);
    console.log('📸 Capturando Aba 2: Backup Manual & Importar...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'aba_2_backup_manual_importar.png'), fullPage: true });

    // 5. Clica e Captura Aba 3: Agendamento & Retenção
    console.log('⚙️ Clicando na Aba 3: Agendamento & Retenção...');
    const scheduleTabBtn = await page.locator('button.inner-tab-btn:has-text("Agendamento & Retenção")');
    await scheduleTabBtn.click();
    await page.waitForTimeout(1000);
    console.log('📸 Capturando Aba 3: Agendamento & Retenção...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'aba_3_agendamento_retencao.png'), fullPage: true });

    // 6. Clica em "Salvar Configuração" para validar toast
    console.log('💾 Testando ação de Salvar Configuração...');
    await page.click('button:has-text("Salvar Configuração")');
    await page.waitForTimeout(600);
    console.log('📸 Capturando Aba 3 com Toast de Sucesso...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'aba_3_com_toast.png') });

    console.log('🎉 Todas as evidências visuais foram geradas com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante a validação visual:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
