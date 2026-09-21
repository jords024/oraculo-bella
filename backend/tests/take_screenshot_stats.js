import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/67021bd3-e186-4857-84ac-286504dbe23b';

async function run() {
  console.log('🚀 Iniciando captura de tela com Playwright...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1280, height: 800 });

  try {
    // 1. Acessa a página de login
    console.log('🌐 Acessando página de login...');
    await page.goto('http://localhost:5176/login.html');
    await page.waitForTimeout(1000); 

    // 2. Preenche os dados e faz login
    console.log('✍️ Efetuando login...');
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Aguarda o login e o carregamento do dashboard
    await page.waitForTimeout(3000);

    // 3. Captura o estado inicial do Dashboard (com dados de stats carregados!)
    console.log('📸 Capturando tela inicial do Dashboard...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'dashboard_stats_after.png') });

    // 4. Clica no filtro "RASCUNHO" para ver o empty state centralizado
    console.log('🔘 Clicando no filtro RASCUNHO para exibir tela vazia...');
    const rascunhoFilter = await page.locator('button:has-text("RASCUNHO")');
    if (await rascunhoFilter.count() > 0) {
      await rascunhoFilter.click();
      await page.waitForTimeout(1000);
      
      console.log('📸 Capturando tela vazia centralizada...');
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'dashboard_empty_centered.png') });
      
      // Volta para o filtro "TODOS"
      await page.click('button:has-text("Todos")');
      await page.waitForTimeout(500);
    }

    // 5. Clica no botão "Selecionar Todos" para ativar os checkboxes
    console.log('🔘 Clicando em Selecionar Todos...');
    const selectAllBtn = await page.locator('text="Selecionar Todos"');
    if (await selectAllBtn.count() > 0) {
      await selectAllBtn.click();
      await page.waitForTimeout(500);
      
      // Captura a tela com todos selecionados e o botão de bulk delete à mostra
      console.log('📸 Capturando tela com itens selecionados...');
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'dashboard_bulk_selected.png') });
      
      // 6. Clica no botão de bulk delete para mostrar o modal
      console.log('🗑️ Clicando em Excluir Selecionados...');
      const bulkDeleteBtn = await page.locator('button:has-text("Excluir Selecionados")');
      if (await bulkDeleteBtn.count() > 0) {
        await bulkDeleteBtn.click();
        await page.waitForTimeout(500);
        
        // Captura a tela mostrando o modal premium de confirmação (backdrop e blur)
        console.log('📸 Capturando modal de confirmação...');
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'dashboard_bulk_delete_confirm.png') });
        
        // Clica em Cancelar no modal para restaurar o estado
        await page.click('text="Cancelar"');
        await page.waitForTimeout(300);
      }
    } else {
      console.log('⚠️ Nenhum carrossel disponível para selecionar.');
    }

    console.log('🎉 Capturas visuais criadas com sucesso na pasta de artefatos!');

  } catch (error) {
    console.error('❌ Erro na captura de tela:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
