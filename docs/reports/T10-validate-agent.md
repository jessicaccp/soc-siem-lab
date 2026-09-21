# T10: Validar a coleta de logs e o status Active do agente

## Metadados

- Semana: 2
- Atividades cobertas: T10
- Prioridade: P0
- Pré-requisitos: T09
- Status: done
- Data de conclusão: 15/09/2026

## Resumo do que foi feito

### T10: Validar a coleta de logs e o status Active do agente

Coleta de logs de SO. O agente 4.14.7 em Ubuntu 22.04 coleta pelo `journald`, que é o padrão da versão para hosts com systemd e cobre o `auth.log` e o `syslog`, mais `/var/ossec/logs/active-responses.log` e `/var/log/dpkg.log`:

```
<localfile><log_format>journald</log_format><location>journald</location></localfile>
<localfile><log_format>syslog</log_format><location>/var/ossec/logs/active-responses.log</location></localfile>
<localfile><log_format>syslog</log_format><location>/var/log/dpkg.log</location></localfile>
```

Teste ponta a ponta com uma autenticação falha por SSH, disparada da máquina SOC:

```bash
ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no victim@192.168.122.50 true   # senha errada
sleep 12
curl -sk -u admin:SecretPassword "https://localhost:9200/wazuh-alerts-*/_search?q=agent.id:001&size=3&sort=@timestamp:desc"
```

Alerta gerado cerca de um segundo depois do evento no `auth.log`:

```
full_log: "Sep 16 01:43:59 victim sshd[5596]: Failed password for victim from 192.168.122.1 port 47326 ssh2"
rule.id: 5760 | rule.description: "sshd: authentication failed." | rule.level: 5 | data.srcip: 192.168.122.1
```

Também foi indexado o alerta da regra 5503 (PAM: User login failed) para o mesmo evento.

Syscheck (FIM). Configuração do agente: `disabled no`, `frequency 43200`, `scan_on_start yes`, monitorando `/etc`, `/usr/bin`, `/usr/sbin`, `/bin`, `/sbin` e `/boot`. Validação com arquivo novo e scan forçado pelo manager:

```bash
ssh victim@192.168.122.50 'sudo sh -c "echo fim-test > /etc/wazuh-fim-test.conf"'
docker exec wazuh-wazuh.manager-1 /var/ossec/bin/agent_control -r -u 001
```

Alertas resultantes:

```
syscheck.path: /etc/wazuh-fim-test.conf | syscheck.event: added   | rule.id: 554 | "File added to the system."
syscheck.path: /etc/wazuh-fim-test.conf | syscheck.event: deleted | rule.id: 553 | "File deleted."
```

O arquivo de teste foi removido da VM ao fim da validação; os alertas de adição e remoção ficaram registrados nos índices.

Status e envio de eventos. O agente aparece como `Active` no manager e responde na API, que é a fonte usada pelo dashboard:

```bash
docker exec wazuh-wazuh.manager-1 /var/ossec/bin/agent_control -l
# ID: 001, Name: victim, IP: any, Active

TOKEN=$(curl -sk -u 'wazuh-wui:MyS3cr37P450r.*-' -X POST "https://localhost:55000/security/user/authenticate?raw=true")
curl -sk -H "Authorization: Bearer $TOKEN" "https://localhost:55000/agents?select=id,name,status,version,lastKeepAlive"
# id: 001, name: victim, status: active, version: Wazuh v4.14.7, lastKeepAlive: 2026-09-16T01:46:09+00:00
```

Volume: o agente 001 tinha 256 alertas indexados antes do teste, 258 depois da autenticação falha, além dos alertas de FIM.

Confirmação no dashboard, painel do agente 001:

| Campo | Valor exibido |
| --- | --- |
| Status | active |
| IP address | `192.168.122.50` |
| Version | Wazuh v4.14.7 |
| Operating system | Ubuntu 22.04.5 LTS |
| Registration date | Sep 15, 2026 @ 22:32:49 |
| Last keep alive | Sep 15, 2026 @ 22:49:29 |
| System inventory | 2 cores, 1.9GB |

A aba "FIM: Recent events" lista os dois eventos de `/etc/wazuh-fim-test.conf`: `deleted` (regra 553, nível 7) e `added` (regra 554, nível 5). O painel de File Integrity Monitoring mostra os mesmos dois registros em "Files added" e "Files deleted", com `root` como usuário ativo.

Distribuição dos eventos do agente 001 nas últimas 24 horas, conferida contra o indexer (painel Threat Hunting com filtro `agent.id: 001`):

| Contador do painel | Valor | Conferência no indexer |
| --- | --- | --- |
| Total | 282 | 282 documentos com `agent.id: 001` |
| Level 12 or above | 0 | nenhum alerta com `rule.level >= 12`; o nível máximo é 7 |
| Authentication failure | 2 | grupo `authentication_failed` com 2 documentos |
| Authentication success | 35 | grupo `authentication_success` com 35 documentos |

Grupos de regra: `sca` 208, `syslog` 71, `pam` 50, `authentication_success` 35, `sshd` 11, `sudo` 10, `ossec` 3, `authentication_failed` 2.

Dois pontos observados no painel que valem para as próximas atividades:

- O dashboard exibe `IP address 192.168.122.50`, enquanto `agent_control -l` mostra `IP: any`, o valor definido no registro. Os dois convivem: o segundo é o campo de configuração, o primeiro é o endereço lido pelo painel.
- O painel já mostra módulos que não foram configurados nesta atividade: Vulnerability Detection (67 críticas, 780 altas, 1.559 médias e 50 baixas, concentradas em `linux-image-5.15.0-191-generic`) e Security Configuration Assessment com a política CIS Ubuntu Linux 22.04 LTS Benchmark v2.0.0 (score 47%, 93 aprovadas, 103 reprovadas). Vêm habilitados por padrão na 4.14 e são insumo para a T30.

## Dificuldades

1. O agente não coleta `/var/log/auth.log` e `/var/log/syslog` como arquivos, e sim o `journald`. É o comportamento padrão da 4.14 em hosts com systemd e cobre os dois logs, mas a conferência do critério ("auth.log, syslog") exige olhar o `localfile` em vez de assumir o caminho de arquivo.
2. A detecção do FIM não aparece sozinha em tempo útil: o `frequency` é de 12 horas e o `realtime` não está habilitado para os diretórios padrão. Foi preciso forçar o scan pelo manager com `agent_control -r -u 001` para validar a detecção no mesmo dia.
3. Os índices de inventário do agente (`wazuh-states-inventory-*-victim`) ainda não existem; só há os do próprio manager. O módulo de inventário sincroniza em ciclos próprios, então a ausência não indica falha: os alertas de log e de FIM chegaram normalmente.

## Aprendizados e avisos (handoff)

- O agente 001 aparece como `active` no dashboard, com o IP `192.168.122.50`, versão 4.14.7 e o último keepalive em 15/09/2026 22:49:29.
- O `rootcheck` registra `netstat not available. Skipping port check.` na VM. É aviso esperado da imagem mínima e não afeta a coleta de logs nem o FIM.
- Forçar o scan de FIM pelo manager é o caminho para validar detecção sem esperar 12 horas: `docker exec wazuh-wazuh.manager-1 /var/ossec/bin/agent_control -r -u 001`.
- As regras nativas já cobrem o que a semana 4 vai gerar: 5760 para autenticação SSH falha, 554 e 553 para FIM, além das regras de PAM.

## Entregáveis

- `docs/reports/T10-validate-agent.md`
- Evidências: alertas 5760, 5503, 554 e 553 indexados, com o `full_log` da autenticação falha e o status `active` do agente 001 pela API.

## Acompanhamento

- O agente aparece como `active` no dashboard e coleta logs de SO pelo `journald`, além de monitorar integridade em `/etc`, `/usr/bin`, `/usr/sbin`, `/bin`, `/sbin` e `/boot`; um `Failed password` virou alerta em cerca de um segundo e um arquivo novo em `/etc` gerou alerta de adição e de remoção.
- A dificuldade mais interessante foi o FIM: com `frequency` de 12 horas e sem `realtime`, a detecção não aparece sozinha, e a validação exigiu forçar o scan pelo manager.
- O painel do agente já mostra Vulnerability Detection e Security Configuration Assessment habilitados por padrão, o que antecipa material para a T30.
- Próximo passo da semana: T12, subir o Suricata em container com `network_mode: host` e conferir o `eve.json`.
