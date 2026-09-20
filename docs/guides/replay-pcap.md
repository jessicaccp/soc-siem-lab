# Replay de pcaps maliciosos

## Objetivo

Validar as regras carregadas no Suricata com pcaps públicos de tráfego malicioso, em modo offline, sem interferir na captura live.

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
docker exec suricata mkdir -p /var/log/suricata/replay-neris
docker exec suricata suricata -r /pcaps/botnet-capture-20110810-neris.pcap \
  -l /var/log/suricata/replay-neris -k none \
  --set vars.address-groups.HOME_NET=147.32.84.0/24

docker exec suricata mkdir -p /var/log/suricata/replay-rbot
docker exec suricata suricata -r /pcaps/botnet-capture-20110812-rbot.pcap \
  -l /var/log/suricata/replay-rbot -k none \
  --set vars.address-groups.HOME_NET=147.32.84.0/24
```

`HOME_NET` é obrigatório nestes pcaps: a captura veio do laboratório da CTU (`147.32.84.0/24`), fora do `HOME_NET` do projeto, e as assinaturas com direção `$HOME_NET -> $EXTERNAL_NET` não disparam sem o ajuste.

A saída fica no host, em `configs/suricata/logs/replay-neris/` e `configs/suricata/logs/replay-rbot/`, separada do `eve.json` da captura live.

## Verificação

```bash
cd configs/suricata/logs
python3 - <<'EOF'
import json, collections
for d in ("replay-neris", "replay-rbot"):
    c = collections.Counter(); gid = set(); tot = 0
    for l in open(f"{d}/eve.json"):
        e = json.loads(l)
        if e.get("event_type") != "alert": continue
        tot += 1
        a = e["alert"]
        if a["signature"].startswith(("ET ", "GPL ")):
            c[a["signature"]] += 1; gid.add(a["gid"])
    print(d, "entradas alert:", tot, "alertas de assinatura:", sum(c.values()),
          "assinaturas distintas:", len(c), "gid:", gid)
EOF
head -3 replay-rbot/fast.log
```

Saída esperada:

```
replay-neris entradas alert: 7254 alertas de assinatura: 1036 assinaturas distintas: 22 gid: {1}
replay-rbot entradas alert: 42018 alertas de assinatura: 41822 assinaturas distintas: 19 gid: {1}
```

- **Entradas `alert`**: todas as linhas com `event_type: alert` no `eve.json`, incluindo as internas do engine (checksum, stream, applayer).
- **Alertas de assinatura**: entradas `alert` cuja `signature` começa com `ET ` ou `GPL `, ou seja, as assinaturas do conjunto de regras, e não as internas do engine.

## Estado validado (20/09/2026)

| pcap | Pacotes | Bytes | Entradas `alert` | Alertas de assinatura | Assinaturas distintas |
|---|---|---|---|---|---|
| `botnet-capture-20110810-neris.pcap` | 323.154 | 53.096.018 | 7.254 | 1.036 | 22 |
| `botnet-capture-20110812-rbot.pcap` | 495.056 | 120.654.271 | 42.018 | 41.822 | 19 |

Assinaturas mais frequentes:

| pcap | Assinatura | `signature_id` | Severidade | Ocorrências |
|---|---|---|---|---|
| neris | ET USER_AGENTS Suspicious User-Agent (ClickAdsByIE) | 2010220 | 2 | 360 |
| neris | ET DNS Query for .su TLD (Soviet Union) Often Malware Related | 2014169 | 2 | 290 |
| neris | ET MALWARE Trojan Generic - POST To gate.php with no referer | 2017930 | 1 | 53 |
| neris | ET MALWARE Win32/Virut.BN Checkin | 2012533 | 1 | 4 |
| rbot | ET SCAN Potential SSH Scan OUTBOUND | 2003068 | 2 | 31.663 |
| rbot | ET SCAN Behavioral Unusually fast Terminal Server Traffic Potential Scan or Infection (Inbound) | 2001972 | 3 | 63 |
| rbot | ET SCAN Suspicious inbound to MSSQL port 1433 | 2010935 | 2 | 15 |

A severidade do `eve.json` é a escala do Suricata, de 1 (mais grave) a 4. Ela não é o nível do Wazuh, definido nas regras de correspondência da T16.

## Notas

- O modo offline lê o arquivo e encerra o processo; a instância live continua capturando na `virbr0` durante o replay.
- A seção `replay-*` fica dentro de `logs/`, que é estado da máquina e não vai ao git, igual ao `eve.json` da captura live.
- Os contadores de `ET SCAN` do rbot são altos porque a fonte é um botnet varrendo a internet; servem de base para a análise de ruído da T40.
