import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/1ffe6ce1-2310-449c-8c6c-0eef03d46593';

async function run() {
  console.log('🚀 Iniciando teste visual com Playwright...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Define viewport grande para melhor visualização
  await page.setViewportSize({ width: 1280, height: 800 });

  try {
    // 1. Acessa a página de login
    console.log('🌐 Acessando página de login...');
    await page.goto('http://localhost:5176/login.html');
    await page.waitForTimeout(1000); // Aguarda animação de fade

    // Captura tela inicial vazia
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'login_initial.png') });
    console.log('📸 Captura da tela inicial salva.');

    // 2. Preenche os dados
    console.log('✍️ Preenchendo campos...');
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');

    // Captura com a senha oculta
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'login_password_hidden.png') });
    console.log('📸 Captura da senha oculta salva.');

    // Verifica que o input é do tipo password
    const typeBefore = await page.getAttribute('#passwordInput', 'type');
    console.log(`Tipo do input antes do clique: ${typeBefore}`);
    if (typeBefore !== 'password') {
      throw new Error('O input deveria ser do tipo password inicialmente.');
    }

    // 3. Clica no botão de alternar senha
    console.log('👁️ Clicando no botão de alternar senha...');
    await page.click('#togglePassword');
    await page.waitForTimeout(200);

    // Verifica que o input mudou para text
    const typeAfter = await page.getAttribute('#passwordInput', 'type');
    console.log(`Tipo do input após o clique: ${typeAfter}`);
    if (typeAfter !== 'text') {
      throw new Error('O input deveria ter mudado para o tipo text.');
    }

    // Captura com a senha revelada
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'login_password_revealed.png') });
    console.log('📸 Captura da senha revelada salva.');

    // 4. Clica novamente para ocultar a senha
    console.log('👁️ Clicando no botão de alternar senha novamente para ocultar...');
    await page.click('#togglePassword');
    await page.waitForTimeout(200);

    // Verifica que o input voltou para password
    const typeBack = await page.getAttribute('#passwordInput', 'type');
    console.log(`Tipo do input voltou para: ${typeBack}`);
    if (typeBack !== 'password') {
      throw new Error('O input deveria ter voltado para o tipo password.');
    }

    console.log('🎉 Teste visual de UI concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro no teste visual:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
