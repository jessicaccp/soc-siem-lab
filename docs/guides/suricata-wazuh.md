# Integração entre Suricata e Wazuh

## Objetivo

Levar os alertas do Suricata para o Wazuh com o nível definido pelo tipo de alerta, e conferir o resultado no dashboard. O Suricata grava dois arquivos em `configs/suricata/logs/`: o `eve.json` completo, com os logs de transação, e o `eve-alerts.json` só com alertas. O Wazuh lê o segundo.

## Pré-requisitos

- Suricata no ar com as regras ET Open carregadas (`start-suricata.md`).
- Stack do Wazuh no ar (`start-wazuh-stack.md`).
- O manager recebe três coisas do repositório: o `ossec.conf`, o arquivo de regras `suricata_rules.xml` e o diretório `configs/suricata/logs/` montado como `/var/log/suricata`. Os três estão no `configs/wazuh/docker-compose.yml`.

## Passos

1. Subir ou recriar o manager para aplicar a configuração:

```bash
cd configs/wazuh
docker compose up -d
```

2. Alimentar o feed com um replay de pcap (`replay-pcap.md`). A captura live já alimenta o feed sozinha, sempre que houver tráfego na ponte do libvirt.

## Verificação

```bash
# os dois arquivos monitorados
docker exec wazuh-wazuh.manager-1 grep "Analyzing file" /var/ossec/logs/ossec.log

# evento bruto que chegou ao manager (antes de virar alerta)
docker exec wazuh-wazuh.manager-1 tail -1 /var/ossec/logs/archives/archives.json

# alertas por regra, no índice do Wazuh
curl -sk -u admin:SecretPassword 'https://localhost:9200/wazuh-alerts-4.x-*/_search' \
  -H 'Content-Type: application/json' \
  -d '{"size":0,"query":{"term":{"rule.groups":"suricata"}},"aggs":{"regras":{"terms":{"field":"rule.id","size":10}}}}'

# testar uma linha do eve-alerts.json sem passar pelo replay
docker exec -i wazuh-wazuh.manager-1 /var/ossec/bin/wazuh-logtest < alerta.json
```

Saída esperada no teste de uma linha: `Phase 2` com os campos do JSON (`alert.signature`, `alert.category`, `src_ip`, `dest_ip`, `dest_port`) e `Phase 3` com a regra de nível correspondente.

## Decoder

O decoder é o `json` do próprio ruleset do Wazuh (`ruleset/decoders/0006-json_decoders.xml`): os campos do `eve-alerts.json` entram no evento decodificado sem configuração adicional, como `alert.signature`, `alert.signature_id`, `alert.category` e `alert.severity`, mais `src_ip`, `src_port`, `dest_ip`, `dest_port`, `proto`, `app_proto`, `direction` e, nos alertas HTTP, os campos `http.*`. Não há decoder próprio.

## Regras

Arquivo `configs/wazuh/config/wazuh_cluster/suricata_rules.xml`, montado em `/var/ossec/etc/rules/suricata_rules.xml`.

| Regra | Nível | Corresponde a |
|---|---|---|
| 86601 (ruleset) | 3 | Todo alerta do Suricata, sem distinção |
| 100200 | 12 | Assinatura começando com `ET MALWARE` ou `ET TROJAN` |
| 100201 | 12 | Categoria `A Network Trojan was detected` |
| 100210 | 6 | Assinatura começando com `ET SCAN` |
| 100211 | 6 | Categoria `Detection of a Network Scan` |
| 100212 | 6 | Categoria `Attempted Information Leak` |

As regras próprias usam `type="pcre2"` nos campos, porque a sintaxe padrão dos campos (OS_Regex) não aceita alternância como `(MALWARE|TROJAN)`.

O nível 12 é o `email_alert_level` do `ossec.conf`; sem e-mail configurado, o alerta só sai marcado com `mail: true`. O nível 12 é o limiar previsto para a resposta automática na semana 3.

## Estado validado (21/09/2026)

| Item | Valor verificado |
|---|---|
| Arquivos lidos | `/var/log/suricata/eve-alerts.json` e `/var/log/suricata/replay/eve-alerts.json` |
| Eventos brutos | `archives.json` com um registro por alerta recebido, `location` apontando para o arquivo do feed |
| Decoder | `json`, campos extraídos conforme o `wazuh-logtest` |
| Feed do replay do neris | 4.145 alertas |
| Feed do replay do rbot | 42.019 alertas |
| Feed live | Alertas reais da VM, regra 100210 (nível 6), com `location` `/var/log/suricata/eve-alerts.json` |
| Índice `wazuh-alerts-4.x-2026.09.21` | 46.161 alertas do Suricata: 31.749 na regra 100210 (nível 6), 14.292 na 86601 (nível 3), 120 na 100200 (nível 12) |
| Erros do decoder | 1.634 mensagens `Too many fields`, todas anteriores à separação do arquivo de alertas |

## Notas

- O `eve-alerts.json` existe porque o `eve.json` completo não serve para o SIEM: os eventos de `stats` e `flow` têm centenas de campos, e o decoder do Wazuh recusa esses eventos com `ERROR: Too many fields for JSON decoder` (1.634 mensagens em um replay), além de encher o `archives.json` (125 MB contra 8,8 MB lendo só alertas).
- `logall_json` está ligado no `ossec.conf` para permitir conferir os eventos brutos no `archives.json`. O arquivo cresce a cada replay (121 MB depois de uma sessão de testes); desligar depois da validação, se o disco importar.
- O `eve-log` do Suricata acrescenta ao arquivo existente em vez de recriá-lo. Para números limpos, limpar antes do replay: `docker exec suricata rm -f /var/log/suricata/replay/eve-alerts.json`.
- O logcollector não cria arquivo ausente: até o primeiro replay ele registra `Could not open file '/var/log/suricata/replay/eve-alerts.json'` no `ossec.log` e segue tentando.
- Várias assinaturas do ET Open só disparam depois de repetição: `ET SCAN Potential SSH Scan OUTBOUND`, por exemplo, pede 5 SYNs da mesma origem para a porta 22 em 120 segundos. Um scan curto passa sem alerta, o que importa para a T24.
- Os arquivos do replay pertencem ao root, porque o `docker exec` entra no container como root, o que impede apagá-los pelo host.
