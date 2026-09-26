// Prints do Shuffle usados na documentacao (semana 3).
//
// Requer Node, playwright-core e um Chromium do Playwright:
//   npm i playwright-core && npx playwright install chromium
// Variaveis: PW_CORE (modulo), CHROMIUM (executavel), OUT (diretorio de saida),
// SHUFFLE_URL, SHUFFLE_USER, SHUFFLE_PASSWORD, WORKFLOW_ID, EXECUTION_ID.
'use strict';
const { chromium } = require(process.env.PW_CORE || 'playwright-core');
const OUT = process.env.OUT || 'assets/prints/week-03';
const BASE = process.env.SHUFFLE_URL || 'http://localhost:3001';
const USER = process.env.SHUFFLE_USER || 'admin';
const PASS = process.env.SHUFFLE_PASSWORD;
const WORKFLOW = process.env.WORKFLOW_ID;
const EXECUTION = process.env.EXECUTION_ID;
const EXEC = process.env.CHROMIUM || undefined;

const check = async (page, words) => {
  const text = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ');
  const missing = words.filter((w) => !text.includes(w));
  console.log(`${missing.length ? 'FALTOU: ' + missing.join(',') : 'ok'} | ${text.slice(0, 80)}`);
};

(async () => {
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const ctx = await browser.newContext({ viewport: { width: 1680, height: 1050 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(120000);

  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `${OUT}/02-shuffle-login.png` });
  await page.fill('#emailfield', USER);
  await page.fill('#outlined-password-input', PASS);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(18000);

  await page.goto(`${BASE}/workflows`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(15000);
  await page.screenshot({ path: `${OUT}/01-shuffle-workflows.png` });
  await check(page, ['Workflows']);

  if (WORKFLOW) {
    await page.goto(`${BASE}/workflows/${WORKFLOW}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(20000);
    await page.screenshot({ path: `${OUT}/04-shuffle-workflow.png` });
    await check(page, ['brute-force-response']);

    if (EXECUTION) {
      await page.goto(`${BASE}/workflows/${WORKFLOW}?execution_id=${EXECUTION}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(30000);
      await page.screenshot({ path: `${OUT}/03-shuffle-execucao.png` });
      await check(page, ['FINISHED', 'webhook']);
    }
  }
  await browser.close();
})();
