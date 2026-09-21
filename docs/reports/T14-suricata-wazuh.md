# T14: Integrar Suricata ao Wazuh (infraestrutura)

## Metadados

- Semana: 2
- Atividades cobertas: T14
- Prioridade: P0
- Pré-requisitos: T13, T06
- Status: done
- Data de conclusão: 21/09/2026

## Resumo do que foi feito

### T14: Integrar Suricata ao Wazuh (infraestrutura)

- Caminho escolhido entre os dois do roadmap: (a) o logcollector do Wazuh manager lê o arquivo do Suricata montado no container. O compose do Wazuh monta `../suricata/logs` como `/var/log/suricata:ro` no manager, e o `ossec.conf` ganhou dois `localfile` com `log_format` igual a `json`: a captura live (`/var/log/suricata/eve-alerts.json`) e o feed de replay (`/var/log/suricata/replay/eve-alerts.json`).
- O Suricata passou a gravar um segundo `eve-log`, com apenas o tipo `alert`, no arquivo `eve-alerts.json`. O `eve.json` completo, com os logs de transação, continua sendo gravado para análise de tráfego. O motivo está na dificuldade 1.
- `logall_json` passou a `yes` no `ossec.conf`, para que os eventos brutos possam ser conferidos no `archives.json`.
- Aplicação da configuração: `docker compose up -d` em `configs/wazuh/`. O `ossec.log` confirma os dois arquivos sob análise:

```
wazuh-logcollector: INFO: (1950): Analyzing file: '/var/log/suricata/eve-alerts.json'.
wazuh-logcollector: INFO: (1950): Analyzing file: '/var/log/suricata/replay/eve-alerts.json'.
```

- Evidência de que o evento bruto chega ao manager antes de virar alerta: o `archives.json` recebeu um registro por alerta do replay, com o `full_log` trazendo a linha original do `eve.json` e a localização do arquivo lido:

```json
{"timestamp":"2026-09-21T00:01:50.086+0000","rule":{"level":3,"description":"Suricata: Alert - SURICATA STREAM 3way handshake excessive different SYNs","id":"86601","groups":["ids","suricata"]},"agent":{"id":"000","name":"wazuh.manager"},"full_log":"{\"timestamp\":\"2011-08-10T13:48:49.278026+0000\",\"event_type\":\"alert\",\"src_ip\":\"147.32.84.165\",\"dest_ip\":\"217.16.28.65\",\"dest_port\":25 ...","location":"/var/log/suricata/replay/eve-alerts.json"}
```

## Dificuldades

1. O `eve.json` completo não serve para o SIEM. O decoder JSON do Wazuh recusa eventos com muitos campos: um replay gerou 1.634 mensagens `ERROR: Too many fields for JSON decoder`, todas dos eventos de `stats` (539 campos) e afins, e o `archives.json` chegou a 125 MB com os 105 mil eventos de um replay. Com um segundo arquivo de saída só com alertas, os erros pararam e o `archives.json` ficou em 8,8 MB para o mesmo replay.
2. O logcollector não cria arquivo que ainda não existe: até o primeiro replay ele registra `ERROR: (1103): Could not open file '/var/log/suricata/replay/eve-alerts.json'` no `ossec.log` e continua tentando. Inofensivo, mas aparece no log.
3. O `eve-log` do Suricata acrescenta ao arquivo existente em vez de recriá-lo. Isso tinha inflado os contadores do replay do neris em T13 (duas execuções no mesmo diretório); os números foram refeitos com uma execução limpa e o guia passou a instruir a limpar o arquivo antes do replay.
4. Os arquivos gerados no replay pertencem ao root, porque o `docker exec` entra no container como root, o que impede apagá-los pelo host. A limpeza é feita com `docker exec suricata rm -f ...`.

## Aprendizados e avisos (handoff)

- Procedimento completo, comandos de verificação e estado validado da integração: `docs/guides/suricata-wazuh.md`. O guia do replay (`docs/guides/replay-pcap.md`) passou a gravar em um diretório único (`/var/log/suricata/replay/`), porque é esse o caminho que o feed lê.
- O Wazuh lê apenas o arquivo de alertas do Suricata. O `eve.json` completo continua em `configs/suricata/logs/eve.json` para análise de tráfego, e é ele que a T12 cita como NSM.
- A integração depende de dois arquivos previsíveis: `eve-alerts.json` da captura live e `replay/eve-alerts.json` do replay. Um replay em outro diretório não alimenta o Wazuh.
- `logall_json` está ligado para permitir conferir os eventos brutos. O `archives.json` cresce cerca de 2 kB por evento; em operação normal é pouco, mas um replay grande passa de 90 MB.
- Depois de reiniciar o WSL2, a rede `default` do libvirt fica inativa e a VM vítima não sobe: `virsh -c qemu:///system net-start default` antes de `virsh -c qemu:///system start victim` (o guia `victim-vm.md` cobre o procedimento).

## Entregáveis

- `configs/wazuh/config/wazuh_cluster/wazuh_manager.conf` (dois `localfile` e `logall_json`)
- `configs/wazuh/docker-compose.yml` (volume dos logs do Suricata no manager)
- `configs/suricata/config/suricata.yaml` (segundo `eve-log`, só alertas)
- `docs/guides/suricata-wazuh.md`
- `docs/guides/replay-pcap.md` (atualizado)
- `docs/reports/T14-suricata-wazuh.md`

## Acompanhamento

- Os alertas do Suricata chegam ao Wazuh como eventos do manager e estão visíveis no `archives.json` antes de virar alerta; o feed é o `eve-alerts.json`, separado do `eve.json` completo que serve à análise de tráfego.
- A dificuldade mais interessante foi o limite do decoder JSON do Wazuh: o `eve.json` completo estourava nos eventos de `stats` e enchia o `archives.json`, o que levou a separar o arquivo que o SIEM lê.
- Próximo passo: T15, conferir o decoder e os campos extraídos dos eventos do Suricata.
