import { chromium } from 'playwright';
import path from 'path';

async function run() {
  const ARTIFACT_DIR = "C:/Users/aryar/.gemini/antigravity/brain/62103130-50b4-41c9-9c56-22fb7292fd40";
  
  console.log("🚀 Iniciando captura de tela do Dashboard para validar cronômetro nos carrosséis...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1280, height: 900 });
    
    // Acessa o dashboard (se for redirecionado para login, realiza o formulário)
    await page.goto("http://localhost:5889");
    await page.waitForTimeout(2000);

    const isLogin = await page.locator('input[name="username"]').count();
    if (isLogin > 0) {
      console.log("✍️ Preenchendo credenciais de login...");
      await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
      await page.fill('input[name="password"]', '123456');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }

    console.log("📸 Tirando screenshot da página do Dashboard com os badges de tempo...");
    const screenshotPath = path.join(ARTIFACT_DIR, 'dashboard_timer_verification.png');
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    
    console.log(`🎉 Captura de tela salva em: ${screenshotPath}`);
  } catch (error) {
    console.error("❌ Ocorreu um erro:", error);
  } finally {
    await browser.close();
  }
}

run();
