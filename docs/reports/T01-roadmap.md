# T01: Criar o roadmap e as definições iniciais do projeto

## Metadados

- Semana: 0
- Atividades cobertas: T01
- Prioridade: P0
- Pré-requisitos: nenhum
- Status: done
- Data de conclusão: 28/08/2026

## Resumo do que foi feito

- Planejamento do projeto antes da implementação: arquitetura com duas máquinas (máquina SOC com Docker Compose; máquina vítima com VM Ubuntu e agente Wazuh), stack Wazuh (HIDS + SIEM + dashboard) + Suricata (NIDS) + Shuffle (SOAR); Grafana como atividade opcional (T32).
- Cronograma das 10 semanas com critérios de aceite, riscos e matriz de cobertura dos requisitos do `trabalho.pdf`.
- Criação da documentação base do repositório (ver Entregáveis).
- Revisão de 13/09/2026: IDs T01 a T56 em ordem de execução, prioridade P0/P1, escopo mínimo por semana (R8) e matriz de cobertura atualizada. A validação formal contra o `trabalho.pdf` fica na T02.
- Ajuste de 13/09/2026: a semana 1 ficou restrita à fundação mínima (T03, T04, T06 e T11), com T05, T07, T08, T09 e T10 remanejadas para a semana 2, para a primeira entrega sair com a stack no ar.

## Dificuldades

- Desenho de rede do Suricata: tráfego entre as duas máquinas pode ficar invisível em WiFi com AP isolation; resolvido com ataques originados na própria máquina SOC (visíveis ao Suricata na própria interface) + replay de pcaps.
- Dimensionamento da carga: cada semana concentra todas as frentes do projeto; resolvido com prioridade P0/P1 por atividade e escopo mínimo por semana.

## Aprendizados e avisos (handoff)

- A VM vítima roda na máquina vítima; o acesso (IP e credenciais de teste) deve ser documentado no repo (T05 e T09), pois várias atividades dependem disso (T24, T33, T34, T38, T47).
- Convenções ativas: idioma (código e pastas em inglês, docs em português), relatórios por atividade, entrega por branch integrada após a verificação do critério de aceite, edição mínima do `ROADMAP.md`, perguntas em aberto em `docs/open-questions.md`.
- Leitura obrigatória antes de qualquer mudança: `AGENTS.md`.

## Entregáveis

- `ROADMAP.md`: planejamento completo (decisões, arquitetura, matriz de cobertura, atividades com prioridade, pré-requisitos, descrição e entregável, riscos).
- `AGENTS.md`: fontes de verdade e convenções para humanos e agentes.
- `README.md`: visão geral do projeto.
- `docs/`: README.md (índice), reports/TEMPLATE.md, reports/T01-roadmap.md (este), guides/README.md, open-questions.md.
- `.github/pull_request_template.md`: checklist de fechamento da entrega.
- `.gitignore` e `trabalho.pdf` (requisitos da disciplina).

## Acompanhamento

- O projeto foi planejado por completo antes de começar: arquitetura, stack, ordem de execução e cronograma das 10 semanas.
- A stack cobre as 5 camadas do slide com 3 serviços: Wazuh, Suricata e Shuffle.
- O roadmap está em sequência única de execução, com pré-requisitos, prioridades e gate de aceite por semana.
