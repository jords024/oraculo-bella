import { test, expect } from '@playwright/test';

test.describe('Dashboard Criador Flow', () => {
  test('deve interagir com o chat do Criador a partir do Novo Carrossel', async ({ page }) => {
    // 1. Login inicial
    console.log('🌐 Fazendo login prévio...');
    await page.goto('/login.html');
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');

    // Aguarda carregar o sidebar após o login
    const sidebar = page.locator('.sidebar-nav');
    await sidebar.waitFor({ state: 'visible', timeout: 10000 });

    // 2. Acionar a ação do Novo Carrossel (que redireciona para a aba Criador)
    console.log('➕ Clicando no botão Novo Carrossel...');
    await page.click('button:has-text("Novo Carrossel")');
    
    // 3. Validar se a aba mudou para o Criador e se o chat está visível
    console.log('📂 Validando se a aba Criador foi carregada...');
    const chatInput = page.locator('textarea[placeholder*="Digite o tema do carrossel"]');
    await expect(chatInput).toBeVisible({ timeout: 10000 });

    // 4. Digitar uma mensagem de simulação
    console.log('✍️ Testando a digitação no input do chat...');
    await chatInput.fill('Quero criar um carrossel sobre a frequência do dinheiro e memórias de escassez');
    
    // Valida se o valor foi inserido
    await expect(chatInput).toHaveValue('Quero criar um carrossel sobre a frequência do dinheiro e memórias de escassez');
    
    console.log('✅ Interação com o chat do Criador validada com sucesso!');
  });
});
