import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/34303ab6-5d35-45c2-8dfa-a6ed7fb424e0';

async function run() {
  console.log('🚀 Iniciando teste visual de Criação Automática de Rascunho e Histórico...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1280, height: 800 });

  page.on('pageerror', exception => {
    console.log(`❌ Page Uncaught Exception: ${exception}`);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Page Console Error: ${msg.text()}`);
    }
  });

  try {
    // 1. Acessa a página de login
    console.log('🌐 Acessando página de login...');
    await page.goto('http://localhost:5176/login.html');
    await page.waitForTimeout(1000);

    // 2. Preenche os dados de login
    console.log('✍️ Preenchendo credenciais...');
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    
    console.log('🚪 Clicando no botão de Login...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // 3. Dispara a criação via fetch de API diretamente na página autenticada
    console.log('🚀 Disparando geração de carrossel de teste...');
    const mockPayload = {
      title: "Teste Histórico Visual",
      theme: "teste-historico-visual",
      format: "A",
      caption: "Legenda de teste do histórico",
      notes: "Notas de teste",
      slides: [
        {
          num: "01",
          estado: "DISRUPÇÃO",
          layout: "fullbleed",
          title: "Slide de Teste",
          body: "Este é um slide de teste para validar o histórico",
          prompt: "Futuristic neon city background with coding dashboard"
        }
      ]
    };

    await page.evaluate(async (payload) => {
      await fetch('/api/criador/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }, mockPayload);

    await page.waitForTimeout(2000); // Aguarda registro do rascunho no backend

    // 4. Navega para a aba de Carrosséis para ver o rascunho
    console.log('📂 Navegando para a aba de Carrosséis...');
    // Clica na aba Carrosséis se não estiver nela
    await page.click('.sidebar-nav button:has-text("Carrosséis")');
    await page.waitForTimeout(3000);

    // Captura a tela mostrando o card de rascunho recém criado com o botão "Histórico"
    console.log('📸 Capturando tela da lista de carrosséis com o rascunho...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'new_carousel_draft_card.png') });

    // 5. Clica no botão "Histórico" do card criado
    console.log('📋 Clicando no botão "Histórico" do rascunho...');
    await page.click('button:has-text("Histórico")');
    await page.waitForTimeout(4000); // Aguarda carregar e puxar logs

    // Captura o modal de histórico aberto com os logs
    console.log('📸 Capturando tela do modal de histórico de criação...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'new_carousel_history_modal.png') });

    // Fecha o modal
    console.log('🔒 Fechando modal de histórico...');
    await page.click('button:has-text("Fechar Histórico")');
    await page.waitForTimeout(1000);

    console.log('🎉 Teste visual de histórico finalizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro no teste visual:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
