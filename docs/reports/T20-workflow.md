# T20: Criar o workflow 1 no Shuffle

## Metadados

- Semana: 3
- Atividade: T20
- Prioridade: P0
- Pré-requisitos: T18
- Status: done
- Data de conclusão: 26/09/2026

## Resumo do que foi feito

### T20: Criar o workflow 1 no Shuffle

- Workflow `brute-force-response` criado pela API do Shuffle (`POST /api/v1/workflows`), com os nós posicionados e os ids fixos no arquivo exportado, para não depender de cliques na interface.
- Nós: trigger `Webhook` (tipo WEBHOOK), `parse_alert` (Shuffle Tools 1.2.0, `execute_python`) e `log_response` (Shuffle Tools 1.2.0, `repeat_back_to_me`).
- O `parse_alert` monta os campos a partir do payload do webhook com substituição direta dos valores do alerta (`$exec.rule_id`, `$exec.all_fields.rule.level`, `$exec.all_fields.data.srcip`, `$exec.all_fields.agent.name`, `$exec.title`) e devolve JSON no `print`, que o `execute_python` converte em `message`. O ramo seguinte referencia `$parse_alert.message.level`.
- Ramo condicional entre `parse_alert` e `log_response`: `source` igual a `$parse_alert.message.level`, `condition` igual a `larger than` e `destination` igual a `11`, o que equivale a nível maior ou igual a 12.
- Webhook registrado por `POST /api/v1/hooks/new` com id igual ao do trigger do workflow. A URL é `http://localhost:3001/api/v1/hooks/webhook_<id do trigger>`.
- Exportação do workflow versionada em `configs/shuffle/workflows/brute-force-response.json` e script de registro em `scripts/shuffle/import-workflow.sh`, que envia o JSON, relê o trigger gravado pela API e registra o webhook, imprimindo a URL final.
- Testes com o payload que a integração do Wazuh monta, direto no webhook:
  - alerta de nível 12 (regra 5763, brute force): execução `FINISHED`, `parse_alert` `SUCCESS` com os cinco campos extraídos e `log_response` `SUCCESS` com a mensagem montada.
  - alerta de nível 5 (regra 5710): execução `FINISHED`, `parse_alert` `SUCCESS` e `log_response` `SKIPPED` com a razão `Minimum of one branch's conditions must be correct to continue. Total: 0 of 1`.
- Correção no deploy da T18 descoberta nesta atividade: o orborus estava configurado para o modo Swarm, que não existe nesta máquina. O `.env` passou a usar `SHUFFLE_SWARM_CONFIG=false`, o compose lê a variável e o guia registra o motivo e as consequências.

## Dificuldades

- A primeira execução ficou parada em `EXECUTING` sem resultados. O orborus tentava recriar o container do Tenzir e falhava com `network shuffle_swarm_executions not found`: com `SHUFFLE_SWARM_CONFIG=run` ele pede uma rede do tipo overlay, que só existe em Docker Swarm ativo, e a criação falhava com `driver failed programming external connectivity`. Sem worker, a execução nunca saía da fila. Resolvido com `SHUFFLE_SWARM_CONFIG=false`.
- Depois de recriar o container do orborus, as execuções continuaram paradas por cerca de 90 segundos com `Orborus UUID mismatch`: o backend só troca o líder da fila quando o checkin anterior envelhece. Passado o intervalo, a fila voltou e o worker foi criado.
- O backend regrava o id do trigger do webhook ao salvar o workflow, o que muda a URL do hook. O script de registro relê o trigger pela API depois do `POST` e usa o id que ficou gravado.
- Salvar o workflow pela API não cria o webhook no modo on-prem; o registro é um passo separado (`/api/v1/hooks/new`). O hook id é o id do trigger, e o `status` que aparece no workflow espelha o status do hook, então o workflow foi salvo de novo depois de registrar o hook para o trigger aparecer como `running`.
- A semântica das condições não está documentada no repositório do Shuffle: foi levantada no SDK que roda dentro do worker (`check_branch_conditions` e `validate_condition`). O operador `larger than` compara inteiros, e `>=` se comporta como `>` no SDK, então a comparação usa `11` como limite.

## Aprendizados e avisos (handoff)

- URL do webhook: `http://localhost:3001/api/v1/hooks/webhook_<id do trigger>`, com exatamente 44 caracteres no último segmento. O callback recusa ids com outro tamanho e recusa hook com status `stopped`. É essa URL que entra no `hook_url` da integração do Wazuh na T21.
- Ids gravados hoje: workflow `04237424-fee4-44de-845a-e2081963fb17`, trigger `48805230-a71c-5b84-8668-e8b290e19ea3`, nó `parse_alert` `6f0a2d3e-1b47-4f8f-8a2c-3d5e6f7a8b02`. Se o workflow for recriado com outro trigger, a URL muda e o `ossec.conf` precisa acompanhar.
- A condição do ramo aponta para `$parse_alert.message.level`: o `execute_python` devolve o JSON do `print` dentro de `message`, então os campos ficam um nível abaixo do nó.
- O payload que a integração do Wazuh envia tem `rule_id`, `title`, `text`, `severity` no primeiro nível e o alerta completo em `all_fields`; o IP de origem do SSH aparece em `all_fields.data.srcip`.
- Recriar o container do orborus custa cerca de 90 segundos de fila parada. Nas demos, subir a stack e esperar antes de disparar o ataque.
- As execuções deixam containers `Shuffle-Tools_1-2-0_<nó>_<execução>` e um `worker-<execução>` no host. A limpeza é automática depois do fim da execução, mas sobra um `tenzir-node` em execução.

## Entregáveis

- `configs/shuffle/workflows/brute-force-response.json`: exportação do workflow com os nós, os ramos e a condição de severidade.
- `scripts/shuffle/import-workflow.sh`: registro do workflow e do webhook em uma instância limpa.
- `docs/guides/start-shuffle.md`: seções "Modo de execução dos workers" e "Workflow de resposta a brute force (T20)", com o teste do webhook.
- `configs/shuffle/docker-compose.yml` e `configs/shuffle/.env.example`: `SHUFFLE_SWARM_CONFIG` vindo do `.env`.

## Acompanhamento

- O primeiro workflow do SOAR existe e está exportado: recebe o alerta pelo webhook, extrai os campos e só segue para o registro quando a severidade é de nível 12 ou mais.
- A dificuldade mais interessante foi a fila parada: o modo Swarm do compose oficial pedia uma rede overlay que a máquina não tem, e o sintoma aparecia como execução eterna em `EXECUTING`, não como erro no Shuffle.
- Próximo passo da semana: T21, ligar o Wazuh ao webhook pelo bloco `integration` do `ossec.conf`, com nível mínimo 12.
