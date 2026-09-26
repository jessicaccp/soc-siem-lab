# T22: Confirmar a chegada de alerta de teste no Shuffle

## Metadados

- Semana: 3
- Atividade: T22
- Prioridade: P0
- Pré-requisitos: T21
- Status: done
- Data de conclusão: 26/09/2026

## Resumo do que foi feito

### T22: Confirmar a chegada de alerta de teste no Shuffle

- Alerta de nível alto gerado pelo caminho real da semana 2: replay do pcap `botnet-capture-20110810-neris.pcap` no Suricata, sem tocar no webhook à mão. O feed alimenta o logcollector, as regras custom elevam a assinatura de código malicioso para nível 12 (regra `100200`) e a integração da T21 encaminha o alerta.
- O replay gerou 100 execuções do workflow no Shuffle, todas com os dois nós em `SUCCESS` (91 delas com resultado completo no momento da conferência; o restante ainda em execução).
- Execução conferida no histórico: `Status FINISHED`, `Source webhook`, nó `parse_alert` devolvendo `rule_id` `100200`, `level` 12, a descrição da assinatura e `agent` `wazuh.manager`, e o nó `log_response` com a resposta montada.
- Print do detalhe da execução em `assets/prints/week-03/03-shuffle-execucao.png` e do editor do workflow em `assets/prints/week-03/04-shuffle-workflow.png`.
- Contagem de execuções pela API (`GET /api/v1/workflows/<id>/executions`), que é como o volume foi medido antes e depois do replay.

## Dificuldades

- O alerta que exercita a cadeia é do Suricata, não do brute force: o payload tem o IP de origem em `data.src_ip` e o agente é o próprio manager, enquanto o workflow esperava `data.srcip` e um agente de VM. Na primeira rodada o campo de origem saiu vazio e a mensagem de log ficou sem IP. A correção entrou na T23.
- A mensagem do nó de registro dizia "Brute force confirmado" para um alerta de malware, porque o texto foi escrito para o cenário original. Também corrigido na T23.
- As execuções não aparecem imediatamente: cada alerta gera uma execução e o worker leva de 30 a 60 segundos para concluir. A conferência foi feita por polling na API, não pelo painel.

## Aprendizados e avisos (handoff)

- Com o limiar de nível 12, quem dispara execução hoje são as regras de código malicioso do Suricata (`100200` e `100201`). O replay do neris gera cerca de uma centena de alertas nesse nível.
- Uma execução por alerta: o volume de execuções acompanha o volume de alertas críticos, o que na T40 (análise de ruído) vai precisar de atenção.
- O histórico completo sai em `GET /api/v1/workflows/<id>/executions`; o detalhe de uma execução individual não tem rota própria nessa versão, então o print da UI é a evidência visual.
- O print da execução mostra o payload recebido (`$exec`) e o estado de cada nó, o que serve tanto para a T23 quanto para o roteiro da demo.

## Entregáveis

- `assets/prints/week-03/03-shuffle-execucao.png`: detalhe da execução com os dois nós em `SUCCESS`.
- `assets/prints/week-03/04-shuffle-workflow.png`: editor do workflow `brute-force-response`.
- Execuções registradas no Shuffle (estado de máquina, fora do repositório).

## Acompanhamento

- O caminho completo funciona: alerta do Suricata entra no Wazuh, vira alerta de nível 12, chega ao Shuffle e executa o workflow com o parse dos campos.
- A dificuldade mais interessante foi o formato do alerta: o payload do Suricata tem o IP de origem em outro campo e sem agente de VM, o que só apareceu com um alerta real alimentando a cadeia.
- Próximo passo da semana: T23, corrigir o parse, testar níveis alto e baixo e confirmar que alerta abaixo do limiar não dispara execução.
