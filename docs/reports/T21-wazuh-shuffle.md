# T21: Configurar a integração do Wazuh com o Shuffle

## Metadados

- Semana: 3
- Atividade: T21
- Prioridade: P0
- Pré-requisitos: T20, T06
- Status: done
- Data de conclusão: 26/09/2026

## Resumo do que foi feito

### T21: Configurar a integração do Wazuh com o Shuffle

- Bloco `integration` adicionado ao `configs/wazuh/config/wazuh_cluster/wazuh_manager.conf`, com `name=shuffle`, `hook_url` no webhook do workflow da T20, `level` 12 e `alert_format` json.
- `extra_hosts` com `host.docker.internal:host-gateway` no serviço `wazuh.manager` do `configs/wazuh/docker-compose.yml`, para o container alcançar a porta 3001 publicada na máquina SOC.
- Container do manager recriado (`docker compose up -d wazuh.manager`). O `wazuh-integratord` registrou a integração na subida:

```
2026/09/26 22:01:10 wazuh-integratord: INFO: Enabling integration for: 'shuffle'.
```

- Daemons conferidos com `wazuh-control status`: `wazuh-analysisd`, `wazuh-remoted`, `wazuh-logcollector`, `wazuh-modulesd`, `wazuh-monitord` e `wazuh-syscheckd` em execução (`wazuh-maild` e `wazuh-clusterd` ficam parados em single-node).
- Alcance conferido de dentro do container, sem disparar execução: `host.docker.internal` resolve para `172.17.0.1`, a UI do Shuffle responde 200 e a rota do webhook responde 400 com `{"success": false}` para um id inexistente, o que confirma o caminho sem criar execução.
- O manager usa o script `shuffle.py` que já vem na imagem (mesma pasta das integrações do Slack e do VirusTotal); não foi preciso instalar nada.

## Dificuldades

- O bloco de integração não é aplicado só reiniciando o serviço: o `ossec.conf` do container é copiado da montagem na subida, então a mudança exigiu recriar o container (`up -d`), não apenas `restart`.
- Não existe uma forma de conferir a integração sem gerar alerta; a alternativa foi validar o caminho de rede com a raiz da UI (200) e com a rota do webhook e um id inexistente (400), que prova a resolução do nome e o roteamento sem criar execução.

## Aprendizados e avisos (handoff)

- Limiar atual do SOAR: nível 12 ou mais. Quem dispara hoje são as regras de código malicioso do Suricata (`100200` e `100201`, nível 12).
- O brute force de SSH não alcança o limiar: a regra 5763 e a 5720 são nível 10, e a 5760 é nível 5. A T26 (regra custom de brute force) e a T38 (cenário completo com hydra) dependem dessa decisão: ou a regra custom da T26 sobe para nível 12, ou o `<level>` da integração desce para 10. A pergunta está registrada em `docs/open-questions.md`.
- O `hook_url` embute o id do trigger do workflow. Recriar o workflow com outro trigger id obriga a atualizar o `ossec.conf` e a recriar o container do manager.
- Sem o `extra_hosts`, o manager não resolve `host.docker.internal` e a integração falha em silêncio, apenas com erro no `ossec.log` no momento do alerta.
- Para conferir a chegada de um alerta, o caminho é o `ossec.log` do manager com a mensagem do `wazuh-integratord` e o histórico de execuções no Shuffle.

## Entregáveis

- `configs/wazuh/config/wazuh_cluster/wazuh_manager.conf`: bloco `integration` com o webhook do Shuffle e nível 12.
- `configs/wazuh/docker-compose.yml`: `extra_hosts` com `host.docker.internal:host-gateway`.
- `docs/guides/start-shuffle.md`: seção "Integração do Wazuh (T21)", com o bloco, a aplicação e a conferência.
- `docs/guides/start-wazuh-stack.md`: ponteiro para a integração.
- `docs/open-questions.md`: decisão pendente sobre o limiar de nível para o brute force.

## Acompanhamento

- O Wazuh está ligado ao Shuffle: alerta de nível 12 ou mais vira execução do workflow `brute-force-response`, com o webhook alcançado de dentro do container do manager.
- A dificuldade mais interessante foi o alcance de rede: o container precisa de `extra_hosts` para chegar ao serviço publicado no host, e a conferência teve de ser feita por uma rota que não cria execução.
- Próximo passo da semana: T22, gerar um alerta real de nível alto e confirmar a execução no Shuffle.
