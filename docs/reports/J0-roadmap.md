# J0: Criar o roadmap e as definições iniciais do projeto

## Metadados

- Semana: 0
- Atividades cobertas: J0
- Dono: Jessica
- Pré-requisitos: nenhum
- Status: done
- Data de conclusão: 28/08/2026

## Resumo do que foi feito

- Planejamento definido em conjunto com a equipe: arquitetura com 2 notebooks (Notebook 1 = SOC com Docker Compose; Notebook 2 = host da VM vítima), stack Wazuh (HIDS+SIEM+dashboard) + Suricata (NIDS) + Shuffle (SOAR), Grafana descartado (8GB de RAM livres).
- Cronograma das 10 semanas com critérios de aceite, riscos e matriz de cobertura dos requisitos do trabalho.pdf.
- Criação da documentação base do repositório (ver Entregáveis).
- Pendência: validação pela Malu (M0), a concluir na revisão do pull request.

## Dificuldades

- Desenho de rede do Suricata: tráfego entre notebooks pode ficar invisível em WiFi com AP isolation; resolvido com ataques originados no próprio Notebook 1 (visíveis ao Suricata na própria interface) + replay de pcaps.
- Balanceamento da divisão de atividades para garantir presença semanal das duas, porque o acompanhamento é avaliado individualmente.

## Aprendizados e avisos (handoff)

- A VM vítima fica no Notebook 2; o acesso (IP e credenciais) deve ser documentado no repo (M1/M2), pois várias atividades dependem disso (J11, J15, J16, J21).
- Convenções ativas: idioma (código e pastas em inglês, docs em português), relatórios por atividade, entrega por pull request com revisão leve, edição mínima do ROADMAP.md, perguntas em aberto em docs/open-questions.md.
- Leitura obrigatória antes de qualquer mudança: AGENTS.md.

## Entregáveis

- `ROADMAP.md`: planejamento completo (decisões, arquitetura, matriz de cobertura, atividades com dono, pré-requisitos, descrição e entregável, riscos).
- `AGENTS.md`: fontes de verdade e convenções para humanos e agentes.
- `README.md`: visão geral do projeto.
- `docs/`: README.md (índice), reports/TEMPLATE.md, reports/J0-roadmap.md (este), guides/README.md, open-questions.md.
- `.github/pull_request_template.md`: template de pull request.
- `.gitignore` e `trabalho.pdf` (requisitos da disciplina).

## Acompanhamento

- O projeto foi planejado por completo antes de começar: arquitetura, stack, divisão de atividades e cronograma das 10 semanas.
- A stack cobre as 5 camadas do slide com 3 serviços: Wazuh, Suricata e Shuffle.
- A divisão garante atividade para as duas em todas as semanas, com dependências e critérios de aceite definidos.
