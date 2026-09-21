import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/e0ff4678-158e-43db-b268-b101c5e8970a';

async function run() {
  console.log('🚀 Iniciando teste visual e funcional resiliente com validações e autopreenchimento...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1280, height: 800 });

  try {
    // 1. Login
    console.log('🌐 Acessando página de login...');
    await page.goto('http://localhost:5176/login.html');
    await page.waitForTimeout(2000);

    console.log('✍️ Preenchendo credenciais...');
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    
    console.log('⏳ Aguardando redirecionamento do Dashboard...');
    await page.waitForTimeout(6000); // Mais tempo para a API responder na máquina em desenvolvimento

    // 2. Acessa Teste de Escala
    console.log('⚡ Navegando para o Teste de Escala...');
    await page.click('button:has-text("Teste de Escala")');
    await page.waitForTimeout(2000);

    // 3. Provoca o Toast de validação (enviar em branco)
    console.log('🚫 Testando validação de formulário em branco...');
    await page.click('button:has-text("Avaliar Briefing com IA")');
    await page.waitForTimeout(1000);
    
    // Salva o screenshot provando o Toast de erro
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '02_validation_toast_error.png') });
    console.log('📸 Captura do Toast de erro salva.');

    // 4. Preenche os dados manualmente para seguir o fluxo
    console.log('✍️ Preenchendo campos Título e Tema do carrossel...');
    await page.fill('input[placeholder="Ex: O que a física prova sobre dinheiro..."]', 'Segredos da Inteligência Emocional');
    await page.fill('input[placeholder="Ex: frequencia-dinheiro"]', 'inteligencia-emocional');
    
    console.log('🔑 Enviando briefing preenchido...');
    await page.click('button:has-text("Avaliar Briefing com IA")');
    
    console.log('⏳ Aguardando chat da IA responder com os botões rápidos...');
    await page.waitForTimeout(18000); // Tempo estendido para a IA gerar todo o roteiro
    
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '03_escala_chat_response.png') });
    console.log('📸 Captura da resposta da IA com botões rápidos salva.');

    // 5. Salva o mock
    console.log('⚡ Clicando em "Criar design rápido (Mock)"...');
    await page.click('button:has-text("Criar design rápido (Mock)")');
    await page.waitForTimeout(12000); // Espera a geração temporizada dos slides
    
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '04_escala_saved.png') });
    console.log('📸 Captura do salvamento mock concluído.');

    console.log('🎉 Teste visual e funcional resiliente concluído com sucesso absoluto!');
  } catch (error) {
    console.error('❌ Erro no teste visual de validação:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
