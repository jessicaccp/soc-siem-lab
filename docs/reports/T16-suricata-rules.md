# T16: Criar as regras de correspondência para os alertas do Suricata

## Metadados

- Semana: 2
- Atividades cobertas: T16
- Prioridade: P0
- Pré-requisitos: T15
- Status: done
- Data de conclusão: 21/09/2026

## Resumo do que foi feito

### T16: Criar as regras de correspondência para os alertas do Suricata

- Arquivo `configs/wazuh/config/wazuh_cluster/suricata_rules.xml`, montado em `/var/ossec/etc/rules/suricata_rules.xml` no manager e carregado pelo `rule_dir` `etc/rules` que já existia no `ossec.conf`.

| Regra | Nível | Condição | Descrição gerada |
|---|---|---|---|
| 100200 | 12 | assinatura começando com `ET MALWARE` ou `ET TROJAN` | `Suricata: código malicioso detectado - <assinatura> - origem <ip> destino <ip>` |
| 100201 | 12 | categoria `A Network Trojan was detected` | `Suricata: tráfego de trojan detectado - ...` |
| 100210 | 6 | assinatura começando com `ET SCAN` | `Suricata: varredura detectada - ...` |
| 100211 | 6 | categoria `Detection of a Network Scan` | `Suricata: varredura detectada - ...` |
| 100212 | 6 | categoria `Attempted Information Leak` | `Suricata: tentativa de coleta de informação - ...` |

- As regras 100201, 100211 e 100212 cobrem por categoria os alertas cuja assinatura não começa com `ET MALWARE` ou `ET SCAN`, inclusive os das assinaturas GPL do conjunto de regras.
- Validação por `wazuh-logtest`, uma linha de cada tipo, com a regra resultante:

```
ET MALWARE Terse alphanumeric executable downloader ...  -> id 100200, level 12
ET SCAN Potential SSH Scan OUTBOUND                     -> id 100210, level 6
SURICATA TCPv4 invalid checksum                         -> id 86601,  level 3
```

- Exemplo de descrição montada com os campos extraídos:

```
Suricata: código malicioso detectado - ET MALWARE Terse alphanumeric executable downloader high likelihood of being hostile - origem 147.32.84.165 destino 60.190.223.75
```

## Dificuldades

1. A primeira versão das regras não carregou: `ERROR: (5107): Syntax error on tag 'alert.signature' in rule 100200`, seguido de `CRITICAL: (1220): Error loading the rules`. O campo sem `type` é interpretado como OS_Regex, que não aceita alternância como `(MALWARE|TROJAN)`. Resolvido com `type="pcre2"` nos campos das regras próprias. O erro derruba o arquivo inteiro, não só a regra com problema.
2. O nível 12 coincide com o `email_alert_level` do `ossec.conf`. Como `email_notification` está desligado, o alerta sai com `mail: true` e nenhum e-mail é enviado; vale conferir isso antes de ligar notificação por e-mail.

## Aprendizados e avisos (handoff)

- Campo com alternância, âncora ou classe de caracteres exige `type="pcre2"`; sem isso o arquivo de regras não carrega.
- Os níveis estão alinhados com o roadmap: 12 para código malicioso (limiar previsto para a resposta automática na semana 3, T34) e 6 para varredura de reconhecimento.
- A regra 100210 casa primeiro com as assinaturas `ET SCAN`; as regras de categoria ficam para os alertas que não carregam o prefixo, e por isso não se sobrepõem.
- Ao testar uma regra nova, `wazuh-logtest` mostra o `id` e o `level` finais, que é o que a resposta automática vai usar.
- As regras usam os campos do decoder validado em T15; se um campo não aparecer no `wazuh-logtest`, o problema é o nome do campo, não o decoder.

## Entregáveis

- `configs/wazuh/config/wazuh_cluster/suricata_rules.xml` (regras 100200 a 100212)
- `configs/wazuh/docker-compose.yml` (arquivo de regras montado no manager)
- `docs/guides/suricata-wazuh.md` (tabela de regras)
- `docs/reports/T16-suricata-rules.md`

## Acompanhamento

- Os alertas do Suricata passaram a ter nível por tipo de assinatura: 12 para código malicioso, 6 para varredura e 3 para o restante, com a assinatura e os IPs de origem e destino na descrição do alerta.
- A dificuldade mais interessante foi o carregamento das regras falhar por causa da sintaxe de campo: o OS_Regex não aceita alternância, e o erro só aparece no `ossec.log`, com o arquivo inteiro rejeitado.
- Próximo passo: T17, rodar o replay com as regras ativas e conferir os alertas no dashboard.
