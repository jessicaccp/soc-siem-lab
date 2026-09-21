# T15: Criar o decoder para os eventos do Suricata no Wazuh

## Metadados

- Semana: 2
- Atividades cobertas: T15
- Prioridade: P0
- Pré-requisitos: T14
- Status: done
- Data de conclusão: 21/09/2026

## Resumo do que foi feito

### T15: Criar o decoder para os eventos do Suricata no Wazuh

- Não foi preciso criar decoder. O ruleset do Wazuh já traz o decoder `json` (`ruleset/decoders/0006-json_decoders.xml`), que extrai os campos do `eve-alerts.json`, e a regra 86601 (`ids,suricata`) marca todo alerta do Suricata com nível 3.
- Campos conferidos com um alerta real do replay do neris, por `wazuh-logtest`:

| Campo no `eve.json` | Como aparece no evento decodificado |
|---|---|
| `alert.signature`, `alert.signature_id`, `alert.category`, `alert.severity` | `alert.*` |
| `src_ip`, `src_port`, `dest_ip`, `dest_port`, `proto`, `app_proto`, `direction` | nomes iguais, sem prefixo |
| `http.hostname`, `http.url`, `http.http_method` | `http.*` |

- Saída do `wazuh-logtest` para a linha do alerta, com a fase de decodificação e a regra que casa:

```
**Phase 2: Completed decoding.
	name: 'json'
	alert.category: 'Generic Protocol Command Decode'
	alert.signature: 'SURICATA TCPv4 invalid checksum'
	alert.signature_id: '2200074'
	dest_ip: '147.32.84.165'
	dest_port: '1040'
	event_type: 'alert'
	src_ip: '94.63.149.152'
	src_port: '80'
	timestamp: '2011-08-10T09:06:36.150781+0000'

**Phase 3: Completed filtering (rules).
	id: '86601'
	level: '3'
	description: 'Suricata: Alert - SURICATA TCPv4 invalid checksum'
	groups: '['ids', 'suricata']'
```

- Documentação do decoder: comentário acima dos `localfile` em `configs/wazuh/config/wazuh_cluster/wazuh_manager.conf`, indicando o arquivo do decoder no ruleset, e a seção "Decoder" de `docs/guides/suricata-wazuh.md`.

## Dificuldades

1. O `wazuh-logtest` não lê bem a linha vinda de um pipe do `grep`: o teste devolveu a regra de fallback de syslog (id 1002, "Unknown problem somewhere in the system") em vez de decodificar o JSON. Com a linha em arquivo e o redirecionamento de entrada (`wazuh-logtest < alerta.json`) a decodificação sai correta. O guia passou a usar a forma com arquivo.
2. Nenhuma dificuldade no decoder em si: o `json` do ruleset cobre todos os campos usados pelas regras, inclusive os aninhados de `alert` e `http`.

## Aprendizados e avisos (handoff)

- Não há decoder próprio no projeto. Se um campo novo do Suricata for necessário (por exemplo, `payload_printable` para a resposta automática), ele já vem do decoder `json`; o trabalho é escrever a regra, não o decoder.
- Os nomes usados nas regras são relativos ao `data` do evento, sem o prefixo: `alert.signature` no `field name`, e `$(alert.signature)` na descrição.
- `wazuh-logtest` é a forma mais rápida de testar uma regra ou um decoder: ele mostra as três fases (pré-decodificação, decodificação e regra aplicada).
- O número da regra base do Suricata (86601) é do ruleset; as regras próprias nascem dela e estão em `configs/wazuh/config/wazuh_cluster/suricata_rules.xml` (T16).

## Entregáveis

- `configs/wazuh/config/wazuh_cluster/wazuh_manager.conf` (comentário do decoder)
- `docs/guides/suricata-wazuh.md` (seção "Decoder")
- `docs/reports/T15-suricata-decoder.md`

## Acompanhamento

- O decoder dos eventos do Suricata é o `json` do próprio ruleset do Wazuh, validado com `wazuh-logtest` sobre um alerta real do replay: assinatura, categoria, severidade, IPs, portas e os campos HTTP são extraídos sem configuração adicional.
- A dificuldade foi de ferramenta, não de configuração: o `wazuh-logtest` precisa da linha em arquivo, porque pelo pipe ele cai na regra de fallback de syslog.
- Próximo passo: T16, escrever as regras de correspondência que dão nível a cada tipo de alerta.
