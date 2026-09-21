# Replay de pcaps maliciosos

## Objetivo

Validar as regras carregadas no Suricata com pcaps públicos de tráfego malicioso, em modo offline, sem interferir na captura live. A saída do replay alimenta o Wazuh quando é gravada no diretório do feed, conforme `suricata-wazuh.md`.

## Pré-requisitos

- Suricata no ar com as regras ET Open carregadas (`start-suricata.md`).
- Cerca de 200 MB livres em `assets/pcaps/`, que não é versionado por tamanho.
- O compose monta `assets/pcaps/` como `/pcaps:ro` dentro do container.

## Passos

1. Baixar os pcaps. Fonte: Malware Capture Facility Project (CTU/Stratosphere IPS), capturas reais de botnet com arquivos de rótulos.

```bash
cd assets/pcaps
curl -LO https://mcfp.felk.cvut.cz/publicDatasets/CTU-Malware-Capture-Botnet-42/botnet-capture-20110810-neris.pcap
curl -LO https://mcfp.felk.cvut.cz/publicDatasets/CTU-Malware-Capture-Botnet-44/botnet-capture-20110812-rbot.pcap
```

2. Rodar o replay. O diretório de saída precisa existir, e `-k none` desliga a validação de checksum, porque os pcaps foram capturados com offload de checksum.

```bash
docker exec suricata mkdir -p /var/log/suricata/replay
docker exec suricata rm -f /var/log/suricata/replay/eve-alerts.json
docker exec suricata suricata -r /pcaps/botnet-capture-20110810-neris.pcap \
  -l /var/log/suricata/replay -k none \
  --set vars.address-groups.HOME_NET=147.32.84.0/24
```

O mesmo comando serve para o rbot, trocando o arquivo do pcap.

`HOME_NET` é obrigatório nestes pcaps: a captura veio do laboratório da CTU (`147.32.84.0/24`), fora do `HOME_NET` do projeto, e as assinaturas com direção `$HOME_NET -> $EXTERNAL_NET` não disparam sem o ajuste.

O `eve-log` do Suricata acrescenta ao arquivo existente em vez de recriá-lo, então o `rm` antes do replay evita somar duas execuções. A saída fica no host, em `configs/suricata/logs/replay/`: `eve-alerts.json` (só alertas, é o que o Wazuh lê) e `eve.json` (completo, com os logs de transação).

## Verificação

```bash
cd configs/suricata/logs
python3 - <<'EOF'
import json, collections
c = collections.Counter(); tot = 0
for l in open("replay/eve-alerts.json"):
    e = json.loads(l); tot += 1
    s = e["alert"]["signature"]
    if s.startswith(("ET ", "GPL ")):
        c[s] += 1
print("alertas:", tot, "de assinatura:", sum(c.values()), "distintas:", len(c))
EOF
head -3 replay/fast.log
```

Saída esperada com o pcap do neris: `alertas: 4146 de assinatura: 1037 distintas: 22`.

Para conferir os alertas no Wazuh depois do replay, ver a verificação de `suricata-wazuh.md`.

## Estado validado (21/09/2026)

| pcap | Pacotes | Alertas no feed | Alertas de assinatura | Assinaturas distintas |
|---|---|---|---|---|
| `botnet-capture-20110810-neris.pcap` | 323.154 | 4.146 | 1.037 | 22 |
| `botnet-capture-20110812-rbot.pcap` | 495.056 | 42.021 | 41.825 | 19 |

Assinaturas mais frequentes:

| pcap | Assinatura | `signature_id` | Severidade | Ocorrências |
|---|---|---|---|---|
| neris | ET USER_AGENTS Suspicious User-Agent (ClickAdsByIE) | 2010220 | 2 | 360 |
| neris | ET DNS Query for .su TLD (Soviet Union) Often Malware Related | 2014169 | 2 | 290 |
| neris | ET MALWARE Trojan Generic - POST To gate.php with no referer | 2017930 | 1 | 53 |
| neris | ET MALWARE Win32/Virut.BN Checkin | 2012533 | 1 | 4 |
| rbot | ET SCAN Potential SSH Scan OUTBOUND | 2003068 | 2 | 31.663 |
| rbot | ET SCAN Behavioral Unusually fast Terminal Server Traffic Potential Scan or Infection (Inbound) | 2001972 | 3 | 65 |
| rbot | ET SCAN Suspicious inbound to MSSQL port 1433 | 2010935 | 2 | 15 |

Os contadores variam alguns alertas entre execuções, porque parte das assinaturas usa limite por tempo. A severidade do `eve.json` é a escala do Suricata, de 1 (mais grave) a 4; ela não é o nível do Wazuh, definido nas regras de `suricata-wazuh.md`.

## Notas

- O modo offline lê o arquivo e encerra o processo; a instância live continua capturando na `virbr0` durante o replay.
- `configs/suricata/logs/` é estado da máquina e não vai ao git, igual ao `eve.json` da captura live.
- Os pcaps não são versionados: um clone limpo precisa baixá-los de novo pelas URLs acima.
- Os contadores de `ET SCAN` do rbot são altos porque a fonte é um botnet varrendo a internet; servem de base para a análise de ruído da T40.
- Os arquivos gerados dentro do container pertencem ao root, o que impede apagá-los pelo host; usar `docker exec suricata rm -f ...`.
