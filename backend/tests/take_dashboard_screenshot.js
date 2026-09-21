import { chromium } from 'playwright';
import path from 'path';

async function run() {
  const ARTIFACT_DIR = "C:/Users/aryar/.gemini/antigravity/brain/e262e029-7737-4a59-ae9a-affb51f24bc1";
  
  console.log("🚀 Iniciando captura de tela do Dashboard para validar paginação...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto("http://localhost:5889/login.html");
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('.btn-login');
    
    // Aguarda o redirecionamento para o dashboard (URL raiz)
    await page.waitForURL('http://localhost:5889/');
    await page.waitForTimeout(4000); // Aguarda carrosséis carregarem

    console.log("📸 Tirando screenshot da página do Dashboard...");
    await page.screenshot({ 
      path: path.join(ARTIFACT_DIR, '05_pagination_dashboard.png'),
      fullPage: true 
    });
    
    console.log("🎉 Captura de tela do dashboard salva com sucesso!");
  } catch (error) {
    console.error("❌ Ocorreu um erro:", error);
  } finally {
    await browser.close();
  }
}

run();
