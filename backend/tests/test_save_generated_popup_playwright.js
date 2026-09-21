import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/900bfd3a-0caa-428d-a262-ce5661a996d9';

async function run() {
  console.log('🚀 Iniciando teste do Popup de Salvar Imagem Gerada (Título e Prompt)...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1440, height: 950 });

  try {
    // 1. Login
    await page.goto('http://localhost:5889/login.html');
    await page.waitForTimeout(1000); 

    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('http://localhost:5889/**', { timeout: 20000 }).catch(() => {});
    await page.locator('text=Carregando Estúdio...').waitFor({ state: 'detached', timeout: 30000 });
    await page.waitForTimeout(1500);

    // 2. Navega para a Biblioteca
    const bibNavBtn = page.locator('.nav-item:has-text("Biblioteca"), button:has-text("Biblioteca")').first();
    await bibNavBtn.click();
    await page.waitForSelector('.lib-card, .biblioteca-grid', { timeout: 20000 });
    await page.waitForTimeout(1500);

    // 3. Clica no botão "Salvar na Biblioteca" de um card no Chat ou na aba Geradas
    console.log('💾 Clicando no botão Salvar na Biblioteca...');
    const saveBtn = page.locator('.btn-save-lib').first();
    await saveBtn.click();
    await page.waitForTimeout(1000);

    // 4. Captura o Popup aberto com os campos de Título e Prompt
    console.log('📸 Capturando Popup de Salvamento com Título e Prompt...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'save_generated_popup_modal.png') });

    // 5. Preenche Título e Categoria customizados e confirma o salvamento
    console.log('✍️ Preenchendo campos customizados no popup...');
    const titleInput = page.locator('input[placeholder*="Personagem Guerreiro"]');
    await titleInput.fill('Guerreiro Lendário das Sombras');
    await page.waitForTimeout(300);

    const confirmSaveBtn = page.locator('button[type="submit"]:has-text("Salvar na Biblioteca")');
    await confirmSaveBtn.click();
    await page.waitForTimeout(2000);

    // 6. Captura a Biblioteca Principal com o item salvo
    console.log('📸 Capturando Biblioteca Principal com o novo item salvo...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'library_saved_custom_item.png') });

    console.log('🎉 Validação visual do Popup de Salvamento concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
