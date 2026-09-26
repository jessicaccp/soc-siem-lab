# T23: Testar o workflow com alertas de teste

## Metadados

- Semana: 3
- Atividade: T23
- Prioridade: P0
- Pré-requisitos: T20, T22
- Status: done
- Data de conclusão: 26/09/2026

## Resumo do que foi feito

### T23: Testar o workflow com alertas de teste

- Parse corrigido no nó `parse_alert`: o código passou a ler o objeto inteiro do alerta (`$exec.all_fields`) e montar os campos em Python, em vez de referenciar cada campo por substituição direta. Com isso o IP de origem sai de `data.srcip` (alerta de agente) ou de `data.src_ip` (alerta do Suricata) e o nível é convertido em inteiro com valor padrão zero.
- Mensagem do nó `log_response` generalizada: "Resposta acionada: regra <id> nivel <level> - <descrição> - origem <ip> agente <agente>", que serve tanto para alerta de malware quanto para brute force.
- Descoberto que `POST /api/v1/workflows` sempre cria um workflow novo, com id novo: as três gravações anteriores geraram cópias do `brute-force-response`. A atualização passou a usar `PUT /api/v1/workflows/<id>`, as cópias foram removidas (`DELETE`) e o `scripts/shuffle/import-workflow.sh` passou a escolher o verbo conforme o workflow já existir ou não.
- Testes com o payload que a integração do Wazuh monta:
  - nível 12 com `data.srcip` (regra 5763): `parse_alert` `SUCCESS` com `srcip` `192.168.122.1` e `log_response` `SUCCESS` com a mensagem completa.
  - nível 5 (regra 5710): `parse_alert` `SUCCESS` e `log_response` `SKIPPED` com a razão `Minimum of one branch's conditions must be correct to continue. Total: 0 of 1`.
- Teste do filtro da integração com alerta real: três falhas de autenticação SSH na VM (regra 5760, nível 5) e nenhuma execução nova no Shuffle. A última execução antes do teste é a de 22:20:44 e os alertas são de 22:22:41 a 22:22:45; a contagem ficou em 100 antes e depois.
- Revalidado o caminho de ponta a ponta com o alerta de nível 12 do Suricata: 16 execuções recentes, todas com `parse_alert` e `log_response` em `SUCCESS` e com o IP `147.32.84.165` preenchido.

## Dificuldades

- O parse antigo não dava erro quando o campo não existia: o valor saía vazio e o nó seguia em `SUCCESS`, o que só apareceu porque o alerta real do Suricata tinha outro nome de campo. Ler o objeto inteiro no Python tornou o erro impossível de passar em silêncio.
- As notificações `shuffle_variable_error` no backend vinham das execuções que rodaram com o texto anterior do `log_response`; depois do `PUT` e do processamento da fila, as execuções com resultado ficaram todas em `SUCCESS`. A notificação é reaproveitada pelo backend, então a conferência foi feita pela distribuição de status das execuções, não pela contagem de notificações.
- O `DELETE` de workflow responde `{"success": false}` quando o documento não está no índice que o handler lê, mesmo com o workflow visível na listagem; as cópias desapareceram sozinhas depois de alguns minutos.

## Aprendizados e avisos (handoff)

- Para alterar o workflow: `PUT /api/v1/workflows/<id>` com o objeto inteiro. `POST` cria outro workflow e deixa duas definições vivas, com risco de o hook apontar para a definição antiga.
- O nó `parse_alert` entrega os campos dentro de `message` (o `execute_python` embrulha o JSON do `print`), então as referências são `$parse_alert.message.<campo>` e a condição do ramo é `$parse_alert.message.level maior que 11`.
- Duas camadas filtram a severidade: a integração do Wazuh não envia nada abaixo de nível 12 (não existe execução) e a condição do ramo evita o nó de registro se um alerta de nível baixo chegar por outro caminho (por exemplo, teste direto no webhook).
- A ordem dos testes nas próximas semanas importa: o replay do pcap gera cerca de 100 execuções por rodada. Para testar o workflow sem poluir o histórico, disparar direto no webhook.

## Entregáveis

- `configs/shuffle/workflows/brute-force-response.json`: exportação atualizada com o parse novo e a mensagem generalizada.
- `scripts/shuffle/import-workflow.sh`: registro do workflow com `PUT` ou `POST` conforme o caso.
- `docs/guides/start-shuffle.md`: tabela dos nós atualizada, explicação do parse e a diferença entre `POST` e `PUT`.
- `scripts/media/capture-shuffle.js`: captura dos prints do Shuffle (login, lista de workflows, editor e detalhe da execução).
- `assets/prints/week-03/`: prints do Shuffle regenerados pelo script novo.

## Acompanhamento

- O workflow responde certo nos dois níveis: alerta crítico segue até o registro, alerta abaixo do limiar para no ramo, e o filtro da integração evita a execução inteira.
- A dificuldade mais interessante foi o teste que passou sem provar nada: o parse antigo devolvia `SUCCESS` com o campo vazio, e o erro só apareceu com um alerta real do Suricata na cadeia.
- Próximo passo, agora na semana 4: T24, gerar ataques reais com nmap e hydra contra a VM.
