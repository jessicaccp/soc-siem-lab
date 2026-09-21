// Grava um video do painel reagindo a um evento, para a documentacao.
//
// Uso: node scripts/media/capture-video.js <live|replay|hids> [saida.webm]
// Requer Node, playwright-core e um Chromium do Playwright.
// Variaveis: PW_CORE, CHROMIUM, DASHBOARD_URL, DASHBOARD_USER, DASHBOARD_PASSWORD, VICTIM_ADDRESS.
//
// Cada cenario abre o Discover com a consulta certa, espera o estado inicial e
// dispara o gatilho no meio da gravacao, para o video mostrar o "antes" e a
// chegada do alerta.
'use strict';
const { chromium } = require(process.env.PW_CORE || 'playwright-core');
const { execSync } = require('child_process');

const BASE = process.env.DASHBOARD_URL || 'https://localhost';
const USER = process.env.DASHBOARD_USER || 'admin';
const PASS = process.env.DASHBOARD_PASSWORD || 'SecretPassword';
const EXEC = process.env.CHROMIUM || undefined;
const VICTIM = process.env.VICTIM_ADDRESS || 'victim@192.168.122.50';

// O ssh da VM usa senha; o askpass evita depender de sshpass ou de chave.
function sshAskpass(senha, comando, repeticoes) {
  const askpass = `ASKPASS=$(mktemp /tmp/ap.XXXXXX); printf '#!/bin/sh\\necho ${senha}\\n' > "$ASKPASS"; chmod 700 "$ASKPASS"; `;
  const ssh = 'SSH_ASKPASS="$ASKPASS" SSH_ASKPASS_REQUIRE=force DISPLAY=:0 ssh -o StrictHostKeyChecking=no ' +
    `-o PreferredAuthentications=password -o PubkeyAuthentication=no -o ConnectTimeout=5 ${VICTIM} '${comando}'`;
  return repeticoes > 1
    ? `for i in $(seq 1 ${repeticoes}); do ${askpass}${ssh} 2>/dev/null; done; rm -f "$ASKPASS"`
    : `${askpass}${ssh}; rm -f "$ASKPASS"`;
}

const CENARIOS = {
  // Ataque ao vivo: a VM varre portas 22 de enderecos de documentacao.
  live: {
    consulta: 'location:"/var/log/suricata/eve-alerts.json"',
    colunas: 'rule.level,rule.description,data.src_ip,data.dest_ip,data.dest_port',
    janela: 'now-10m',
    parada: 1,
    gatilho: () => execSync(sshAskpass('victim123',
      'for i in $(seq 41 56); do timeout 1 bash -c "echo > /dev/tcp/203.0.113.$i/22" 2>/dev/null; done'), { shell: '/bin/bash' }),
  },
  // Replay de pcap malicioso: o Suricata grava o feed que o Wazuh le.
  replay: {
    consulta: 'rule.groups:suricata',
    colunas: 'rule.level,rule.description,data.src_ip,data.dest_ip',
    janela: 'now-40s',
    parada: 3800,
    gatilho: () => execSync("docker exec suricata sh -c 'rm -f /var/log/suricata/replay/eve-alerts.json' && " +
      'docker exec suricata suricata -r /pcaps/botnet-capture-20110810-neris.pcap -l /var/log/suricata/replay ' +
      '-k none --set vars.address-groups.HOME_NET=147.32.84.0/24 >/dev/null 2>&1', { shell: '/bin/bash' }),
  },
  // HIDS: quatro tentativas de login com senha errada na VM vitima.
  hids: {
    consulta: 'agent.name:victim and rule.id:(5760 or 5763 or 5503)',
    colunas: 'rule.level,rule.description,data.srcip,data.srcuser,location',
    janela: 'now-45s',
    parada: 3,
    gatilho: () => execSync(sshAskpass('senhaerrada', 'true', 4), { shell: '/bin/bash' }),
  },
};

const cenario = process.argv[2];
if (!CENARIOS[cenario]) {
  console.error(`cenario invalido: use ${Object.keys(CENARIOS).join(', ')}`);
  process.exit(1);
}
const cfg = CENARIOS[cenario];
const saida = process.argv[3] || `assets/media/${cenario}.webm`;
const url = `${BASE}/app/data-explorer/discover#?_g=(time:(from:${cfg.janela},to:now),refreshInterval:(pause:!f,value:5000))` +
  `&_a=(discover:(columns:!(${cfg.colunas}),sort:!(!(timestamp,desc))),metadata:(indexPattern:'wazuh-alerts-*',view:discover))` +
  `&_q=(query:(language:kuery,query:'${cfg.consulta}'))`;

const texto = async (page) => (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ');
const hits = (t) => { const m = t.match(/([\d.,]+)\s*hits/); return m ? parseInt(m[1].replace(/[.,]/g, ''), 10) : 0; };

(async () => {
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1680, height: 1050 },
    recordVideo: { dir: '/tmp/videos', size: { width: 1680, height: 1050 } },
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(90000);
  await page.goto(`${BASE}/app/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.fill('[data-test-subj="user-name"]', USER);
  await page.fill('[data-test-subj="password"]', PASS);
  await page.click('[data-test-subj="submit"]');
  await page.waitForTimeout(15000);
  await page.goto('about:blank');
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(22000);
  console.log(`[${cenario}] antes do gatilho: ${hits(await texto(page))} hits`);

  await page.waitForTimeout(6000);
  console.log(`[${cenario}] disparando o gatilho`);
  cfg.gatilho();

  for (let i = 0; i < 25; i++) {
    await page.waitForTimeout(5000);
    const n = hits(await texto(page));
    console.log(`[${cenario}] t=${(i + 1) * 5}s hits=${n}`);
    if (n >= cfg.parada) break;
  }
  await page.waitForTimeout(9000);
  const video = page.video();
  await ctx.close();
  await browser.close();
  if (video) execSync(`mv -f "${await video.path()}" "${saida}"`);
  console.log(`[${cenario}] video em ${saida}`);
})();
