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
