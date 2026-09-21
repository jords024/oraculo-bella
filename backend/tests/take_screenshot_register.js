import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  // 1. Obter convite ativo
  const loginRes = await fetch('http://localhost:3131/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'afonteoculta@gmail.com', password: 'FonteOculta@2025' })
  }).then(r => r.json());

  const inviteRes = await fetch('http://localhost:3131/api/users/invitations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + loginRes.token },
    body: JSON.stringify({ role: 'user', hours: 24 })
  }).then(r => r.json());

  const inviteId = inviteRes.inviteId;
  console.log('Convite para screenshot:', inviteId);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto(`http://localhost:5889/register.html?invite=${inviteId}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Preenche dados para visualização
  await page.fill('#nameInput', 'Julia Nogueira');
  await page.fill('#emailInput', 'julia.nogueira@estudio.com');
  await page.fill('#passwordInput', 'Senha@2026');
  await page.waitForTimeout(500);

  const screenshotPath = path.join(__dirname, 'screenshot_register_validation.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('Screenshot salva em:', screenshotPath);

  await browser.close();
}

run().catch(console.error);
