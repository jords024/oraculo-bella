import { chromium } from 'playwright';

const ARTIFACT_DIR = 'C:/Users/aryar/.gemini/antigravity/brain/a9d6ec5b-ff4c-42dd-bc1d-d58fa7ee704f';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  try {
    await page.goto('http://localhost:5889/login.html');
    await page.waitForTimeout(1000);
    await page.fill('input[name="username"]', 'aryarajmarketing@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2500);

    // Navegar ao calendário
    await page.click('text=Calendário');
    await page.waitForTimeout(2000);

    const outPath = `${ARTIFACT_DIR}/calendar_screenshot.png`;
    await page.screenshot({ path: outPath });
    console.log('Screenshot salvo em:', outPath);
  } finally {
    await browser.close();
  }
}

run().catch(e => { console.error(e.message); process.exit(1); });
