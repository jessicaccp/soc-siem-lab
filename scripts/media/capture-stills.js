// Prints do dashboard usados na documentacao (semana 2).
//
// Requer Node, playwright-core e um Chromium do Playwright:
//   npm i playwright-core && npx playwright install chromium
// Variaveis: PW_CORE (modulo), CHROMIUM (executavel), OUT (diretorio de saida),
// DASHBOARD_URL (padrao https://localhost), DASHBOARD_USER, DASHBOARD_PASSWORD.
'use strict';
const { chromium } = require(process.env.PW_CORE || 'playwright-core');
const OUT = process.env.OUT || 'assets/prints/week-02';
const BASE = process.env.DASHBOARD_URL || 'https://localhost';
const USER = process.env.DASHBOARD_USER || 'admin';
const PASS = process.env.DASHBOARD_PASSWORD || 'SecretPassword';
const EXEC = process.env.CHROMIUM || undefined;

const discover = (query, columns, from) =>
  `${BASE}/app/data-explorer/discover#?_g=(time:(from:${from || 'now-7d'},to:now))` +
  `&_a=(discover:(columns:!(${columns}),sort:!(!(timestamp,desc))),metadata:(indexPattern:'wazuh-alerts-*',view:discover))` +
  `&_q=(query:(language:kuery,query:'${query}'))`;

// [arquivo, url, palavras que precisam aparecer na tela]
const VIEWS = [
  ['01-painel-visao-geral', `${BASE}/app/wz-home`, ['AGENTS']],
  ['02-fim-eventos', discover('rule.groups:fim or syscheck.event:added', 'rule.level,rule.description,syscheck.path,syscheck.event'), ['added']],
  ['03-hids-agente', discover('agent.name:victim and (rule.id:5760 or rule.id:5501 or rule.id:5502)', 'rule.level,rule.description,data.srcip,data.dstuser,location'), ['victim']],
  ['04-nids-alertas', discover('rule.groups:suricata', 'rule.level,rule.description,data.src_ip,data.dest_ip,data.dest_port'), ['Suricata']],
  ['05-nids-malware', discover('rule.id:100200', 'rule.level,rule.description,data.alert.signature,data.src_ip,data.dest_ip,data.alert.category'), ['malicioso']],
  ['06-nids-live', discover('location:"/var/log/suricata/eve-alerts.json"', 'rule.level,rule.description,data.src_ip,data.dest_ip,data.dest_port'), ['varredura']],
];

(async () => {
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1680, height: 1050 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(90000);
  await page.goto(`${BASE}/app/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.fill('[data-test-subj="user-name"]', USER);
  await page.fill('[data-test-subj="password"]', PASS);
  await page.click('[data-test-subj="submit"]');
  await page.waitForTimeout(18000);

  for (const [name, url, words] of VIEWS) {
    await page.goto('about:blank');
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.reload({ waitUntil: 'domcontentloaded' });   // garante a troca de consulta entre telas do Discover
    await page.waitForTimeout(28000);
    const text = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ');
    const missing = words.filter((w) => !text.includes(w));
    const hits = (text.match(/([\d.,]+)\s*hits/) || [])[1] || '-';
    await page.screenshot({ path: `${OUT}/${name}.png` });
    console.log(`${name} | hits ${hits} | ${missing.length ? 'FALTOU: ' + missing.join(',') : 'ok'}`);
  }
  await browser.close();
})();
