import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/4e4b0c83-91cb-4f2d-8f41-ef3c56f3ca79';

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
      title: "Teste Historico Visual",
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
      const authData = localStorage.getItem('fo_token');
      await fetch('/api/criador/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': authData ? `Bearer ${authData}` : ''
        },
        body: JSON.stringify(payload)
      });
    }, mockPayload);

    await page.waitForTimeout(5000); // Aguarda registro do rascunho e início do pipeline

    // 4. Navega para a aba de Carrosséis para ver o rascunho
    console.log('📂 Navegando para a aba de Carrosséis...');
    await page.click('.sidebar-nav button:has-text("Carrosséis")');
    await page.waitForTimeout(3000);

    // Captura a tela mostrando o card de rascunho recém criado
    console.log('📸 Capturando tela da lista de carrosséis com o rascunho...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'new_carousel_draft_card.png') });

    // 5. Clica no botão "Detalhes" do card criado
    console.log('📋 Clicando no botão "Detalhes" do rascunho...');
    await page.click('button:has-text("Detalhes")');
    await page.waitForTimeout(4000); // Aguarda carregar modal

    // Captura o modal
    console.log('📸 Capturando tela do modal de detalhes...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'new_carousel_details_modal.png') });

    console.log('🎉 Teste visual de histórico finalizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro no teste visual:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
