import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/900bfd3a-0caa-428d-a262-ce5661a996d9';

async function run() {
  console.log('🚀 Iniciando capturas Playwright de Gestão de Usuários (Lote e Selecionar Todos)...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1440, height: 950 });

  try {
    // 1. Login
    console.log('🌐 Acessando login...');
    await page.goto('http://localhost:5889/login.html');
    await page.waitForTimeout(1000); 

    console.log('✍️ Efetuando login...');
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('http://localhost:5889/**', { timeout: 20000 }).catch(() => {});
    await page.locator('text=Carregando Estúdio...').waitFor({ state: 'detached', timeout: 30000 });
    await page.waitForTimeout(1500);

    // 2. Navega para Gestão de Usuários
    console.log('📂 Navegando para Gestão de Usuários...');
    const userNavBtn = page.locator('.nav-item:has-text("Gestão de Usuários"), button:has-text("Gestão de Usuários")').first();
    await userNavBtn.click();
    
    await page.waitForSelector('table', { timeout: 20000 });
    await page.waitForTimeout(1500);

    // 3. Testa Seleção de Todos os Usuários
    console.log('☑️ Clicando em Selecionar Todos os Usuários...');
    const selectAllUsersBtn = page.locator('button:has-text("Selecionar Todos")').first();
    if (await selectAllUsersBtn.count() > 0) {
      await selectAllUsersBtn.click();
      await page.waitForTimeout(1000);
      console.log('📸 Capturando banner de lote e seleção de todos os usuários...');
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'users_batch_select.png') });
    }

    // 4. Abre Modal de Exclusão de Usuários em Lote
    console.log('🗑️ Clicando em Excluir Selecionados...');
    const deleteBatchUsersBtn = page.locator('button:has-text("Excluir Selecionados")').first();
    if (await deleteBatchUsersBtn.count() > 0) {
      await deleteBatchUsersBtn.click();
      await page.waitForTimeout(1000);
      console.log('📸 Capturando modal de exclusão de usuários em lote...');
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'users_batch_delete_modal.png') });

      // Fecha modal para continuar testes
      const cancelBtn = page.locator('.form-modal button:has-text("Cancelar")').first();
      if (await cancelBtn.count() > 0) {
        await cancelBtn.click();
        await page.waitForTimeout(500);
      }
    }

    // 5. Troca para a aba Convites Enviados
    console.log('✉️ Trocando para a aba Convites Enviados...');
    const invitesTabBtn = page.locator('button:has-text("Convites Enviados")').first();
    await invitesTabBtn.click();
    await page.waitForTimeout(1500);

    // 6. Testa Seleção de Todos os Convites
    console.log('☑️ Clicando em Selecionar Todos os Convites...');
    const selectAllInvitesBtn = page.locator('button:has-text("Selecionar Todos")').first();
    if (await selectAllInvitesBtn.count() > 0) {
      await selectAllInvitesBtn.click();
      await page.waitForTimeout(1000);
      console.log('📸 Capturando banner de lote e seleção de todos os convites...');
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'invites_batch_select.png') });
    }

    // 7. Abre Modal de Exclusão de Convites em Lote
    console.log('🗑️ Clicando em Excluir Selecionados (Convites)...');
    const deleteBatchInvitesBtn = page.locator('button:has-text("Excluir Selecionados")').first();
    if (await deleteBatchInvitesBtn.count() > 0) {
      await deleteBatchInvitesBtn.click();
      await page.waitForTimeout(1000);
      console.log('📸 Capturando modal de exclusão de convites em lote...');
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'invites_batch_delete_modal.png') });
    }

    console.log('🎉 Todas as capturas visuais de Usuários e Convites foram concluídas com sucesso!');

  } catch (error) {
    console.error('❌ Erro na captura:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
