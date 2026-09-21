# T17: Validar os alertas do Suricata no dashboard

## Metadados

- Semana: 2
- Atividades cobertas: T17
- Prioridade: P0
- Pré-requisitos: T14, T15, T16
- Status: done
- Data de conclusão: 21/09/2026

## Resumo do que foi feito

### T17: Validar os alertas do Suricata no dashboard

- Replay dos dois pcaps de T13 com a integração ativa, com o feed gravado em `/var/log/suricata/replay/eve-alerts.json` e consumido pelo manager.
- Resultado no índice do Wazuh (`wazuh-alerts-4.x-2026.09.21`), agrupado por regra:

| Regra | Nível | Alertas |
|---|---|---|
| 100210 (ET SCAN) | 6 | 31.749 |
| 86601 (base do ruleset) | 3 | 14.292 |
| 100200 (ET MALWARE) | 12 | 120 |
| Total | | 46.161 |

- Amostra de alerta de malware, como ficou no índice:

```json
{"timestamp":"2026-09-21T00:10:21.766+0000","rule":{"id":"100200","level":12,"description":"Suricata: código malicioso detectado - ET MALWARE ATTACKER IRCBot - ipconfig - PRIVMSG Command - origem 38.229.70.20 destino 147.32.84.165","groups":["ids","suricata"]},"agent":{"id":"000","name":"wazuh.manager"},"data":{"src_ip":"38.229.70.20","dest_ip":"147.32.84.165","dest_port":1027,"proto":"TCP","alert":{"signature":"ET MALWARE ATTACKER IRCBot - ipconfig - PRIVMSG Command","signature_id":"2017287","category":"A Network Trojan was detected","severity":"1"}},"location":"/var/log/suricata/replay/eve-alerts.json"}
```

- Amostra de alerta de varredura:

```json
{"rule":{"id":"100210","level":6,"description":"Suricata: varredura detectada - ET SCAN Potential SSH Scan OUTBOUND - origem 147.32.84.165 destino 223.200.190.5","groups":["ids","suricata"]},"data":{"src_ip":"147.32.84.165","dest_ip":"223.200.190.5","dest_port":22,"event_type":"alert","alert":{"signature":"ET SCAN Potential SSH Scan OUTBOUND","signature_id":"2003068","category":"Attempted Information Leak","severity":"2"}}}
```

- Print do dashboard, no Discover do Wazuh, com os alertas das regras 100200 e 100210 ordenados por nível, as colunas de nível, descrição e IPs e o total de 31.869 ocorrências no filtro: `assets/prints/t17-dashboard-suricata.png`. A consulta usada foi `rule.id:(100200 or 100210)` no índice `wazuh-alerts-*`.
- O feed live foi validado com tráfego real depois de a VM vítima voltar, e não só por replay: 12 SYNs da VM para a porta 22 de endereços de documentação (`203.0.113.0/24`) dispararam a assinatura `ET SCAN Potential SSH Scan OUTBOUND`, e os alertas chegaram ao índice pela regra 100210, nível 6, com `location` `/var/log/suricata/eve-alerts.json`.

```
total do feed live: 3
2026-09-21T01:15:24.165+0000 | regra 100210 nivel 6 | Suricata: varredura detectada - ET SCAN Potential SSH Scan OUTBOUND - origem 192.168.122.50
```

- Snapshot da VM vítima criado no fechamento da semana, com o agente já registrado e sem os serviços de ataque: `agent-enrolled` (filho do `clean-install`). O ponto de retorno foi exercitado: `snapshot-revert`, reboot e o agente de volta em `Active`, sem intervenção.

## Dificuldades

1. O primeiro teste do feed live não gerou alerta nenhum, mesmo com o tráfego chegando à ponte (os eventos `flow` apareciam no `eve.json`). A assinatura `ET SCAN Potential SSH Scan OUTBOUND` tem `threshold: type threshold, track by_src, count 5, seconds 120`: quatro SYNs para a porta 22 não bastam, e o alerta só sai no quinto. Com 12 SYNs o alerta apareceu. O mesmo vale para a T24, com ataques reais.
2. O replay deixa um volume grande de alertas no índice (46.161), o que polui a leitura do dashboard. A consulta `rule.id:(100200 or 100210)` isola o que importa para a validação; para voltar ao cenário limpo, apagar o índice do dia (`DELETE wazuh-alerts-4.x-<data>`) e rodar um replay novo.
3. Renomear um snapshot interno com `snapshot-edit --rename` troca só o metadado do libvirt. A etiqueta dentro do `victim.qcow2` continua com o nome antigo, e o `snapshot-revert` passou a falhar com `Failed to load snapshot: No such file or directory`. Foi preciso apagar o snapshot e criar de novo com o nome escolhido, o que exigiu a VM desligada. O nome final ficou `agent-enrolled`, pelo conteúdo e não pela semana.

## Aprendizados e avisos (handoff)

- Os IDs de regra do Wazuh para os alertas do Suricata: 86601 (base do ruleset, nível 3), 100200 (malware, nível 12) e 100210 (varredura, nível 6). As regras 100201, 100211 e 100212 cobrem as categorias sem o prefixo `ET`.
- A consulta do print (`rule.id:(100200 or 100210)` no `wazuh-alerts-*`, ordenada por `rule.level` decrescente) é a mesma que serve para a demo: mostra o malware no topo.
- O print foi obtido com um navegador headless autenticado no dashboard, o que dispensa a captura manual de tela; se o dashboard mudar de layout, a consulta acima continua válida na API do índice.
- O feed live só produz alerta se houver tráfego real na ponte; o replay continua sendo a forma determinística de validar as regras.
- A validação ficou registrada com dois caminhos: 46.161 alertas vindos do replay e os primeiros alertas vindos da captura live, no mesmo índice.
- O snapshot `agent-enrolled` é o ponto de retorno antes dos serviços da semana 3 (T19); o `clean-install` continua sendo o estado sem agente nem SSH de teste. Ambos são snapshots internos, dentro de `~/vms/victim.qcow2`, com o metadado em `/var/lib/libvirt/qemu/snapshot/victim/`.
- O revert foi exercitado no fechamento da semana: VM desligada, `snapshot-revert agent-enrolled`, VM ligada e agente de volta em `Active` sem intervenção. O procedimento está em `victim-vm.md`.

## Entregáveis

- `assets/prints/t17-dashboard-suricata.png`
- `docs/reports/T17-suricata-dashboard.md`
- Snapshot `agent-enrolled` da VM vítima (estado de máquina, sem arquivo no repositório)

## Acompanhamento

- Os alertas do Suricata aparecem no dashboard com o nível certo: 120 de código malicioso no nível 12, 31.749 de varredura no nível 6 e os demais no nível 3, com assinatura e IPs de origem e destino no texto do alerta.
- A dificuldade mais interessante foi o silêncio do primeiro teste live: a assinatura ET SCAN exige 5 SYNs da mesma origem em 120 segundos, então um scan curto passa sem alerta, o que muda o preparo da T24.
- Próximo passo: semana 3, T18 (subir o Shuffle com limite de RAM) e T21 (ligar o Wazuh ao Shuffle pelo alerta de nível 12).
