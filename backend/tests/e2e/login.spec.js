import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation and Smoke Test', () => {
  test('deve fazer login e navegar por todas as abas do sidebar sem erros', async ({ page }) => {
    // 1. Acessa a página de login
    console.log('🌐 Acessando a página de login...');
    await page.goto('/login.html');
    
    // 2. Preenche os dados de login
    console.log('✍️ Preenchendo credenciais...');
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');

    // 3. Aguarda o carregamento do Dashboard
    console.log('📂 Aguardando carregamento do painel principal...');
    const sidebar = page.locator('.sidebar-nav');
    await sidebar.waitFor({ state: 'visible', timeout: 10000 });
    
    // 4. Testar navegação nas abas principais para garantir que não há tela branca
    const abas = [
      { text: 'Carrosséis', selector: '.sidebar-nav button:has-text("Carrosséis")' },
      { text: 'Criador', selector: '.sidebar-nav button:has-text("Criador")' },
      { text: 'Calendário', selector: '.sidebar-nav button:has-text("Calendário")' },
      { text: 'Biblioteca', selector: '.sidebar-nav button:has-text("Biblioteca")' },
      { text: 'Clonador de Reels', selector: '.sidebar-nav button:has-text("Clonador de Reels")' },
      { text: 'Fábrica de Vídeos', selector: '.sidebar-nav button:has-text("Fábrica de Vídeos")' },
      { text: 'Oráculo', selector: '.sidebar-nav button:has-text("Oráculo")' },
      { text: 'Radar', selector: '.sidebar-nav button:has-text("Radar")' },
      { text: 'Configurações', selector: '.sidebar-nav button:has-text("Configurações")' }
    ];

    for (const aba of abas) {
      console.log(`🧭 Navegando para a aba: ${aba.text}...`);
      const btn = page.locator(aba.selector);
      
      // Se a aba estiver oculta (ex: permissões), pula
      if (await btn.count() > 0 && await btn.isVisible()) {
        await btn.click();
        await page.waitForTimeout(1000); // Aguarda renderização da página
        
        // Garante que o container principal da dashboard/conteúdo continua visível (sem crashar)
        const mainArea = page.locator('.main-area');
        await expect(mainArea).toBeVisible();
      } else {
        console.log(`⚠️ Aba ${aba.text} não está visível para o usuário atual. Pulando.`);
      }
    }

    console.log('✅ Navegação completa em todas as abas concluída sem falhas!');
  });
});
