# Documentação do Projeto

Índice e convenções dos documentos do projeto SOC/SIEM.

## Estrutura

| Arquivo | Conteúdo | Criado em |
|---|---|---|
| `trabalho.pdf` (raiz) | Requisitos oficiais da disciplina (fonte da verdade) | Aula 00 |
| `ROADMAP.md` (raiz) | Planejamento completo: decisões, arquitetura, atividades por semana, riscos | Aula 00 |
| `docs/architecture.md` | Arquitetura final (diagrama, portas, fluxo de dados) | Atividade J20 |
| `docs/decisions.md` | Decisões técnicas tomadas ao longo do projeto | Atividade M9 |
| `docs/demo-guide.md` | Roteiro da apresentação final | Atividade J19 |
| `docs/faq.md` | Respostas para perguntas prováveis do professor | Atividade A4 |
| `docs/open-questions.md` | Perguntas em aberto (tudo que ainda não está decidido) | Sempre que necessário |
| `docs/reports/` | Relatórios por atividade (um arquivo por atividade) | Sempre que uma atividade conclui |
| `docs/guides/` | Guias passo a passo de reprodução (VM, agente, dashboards, replay de pcaps) | Quando um procedimento precisa ser ensinado |

Nota: os arquivos marcados com "Criado em" (ex.: decisions.md na M9, architecture.md na J20, demo-guide.md na J19, faq.md na A4) ainda não existem no repositório; são criados na atividade indicada, conforme o ROADMAP.md.

## Convenções

1. **Idioma**: código, pastas e nomes de arquivos em inglês; o conteúdo dos documentos (docs/) em português.
2. **Relatório por atividade**: um arquivo por atividade em `docs/reports/` (ex.: `J03-start-wazuh.md`), sempre usando o `TEMPLATE.md`. O relatório também pode cobrir **várias atividades** (ex.: as da mesma semana ou da mesma frente), listando todos os IDs nos metadados e separando os pontos por atividade. Nome do arquivo: pelos IDs ou pela semana (ex.: `week-04.md`).
3. **Quando preencher**: após concluir a atividade (ou após a entrega de várias atividades).
4. **Status**: `done` (concluída e aceita) ou `partial` (em andamento, com o que falta listado).
5. **Handoff**: a seção "Aprendizados e avisos" é a leitura obrigatória das atividades dependentes. Quem herda uma atividade lê o relatório da atividade anterior antes de começar.

## Fluxo semanal

1. Atividade concluída durante a semana: preencher o relatório no repo.
2. Antes do acompanhamento: revisar os relatórios e montar os 3 bullets de cada pessoa (seção "Acompanhamento").
3. Segunda-feira: acompanhamento com demo ao vivo, usando os bullets como roteiro da fala.

## Índice dos relatórios

| ID | Atividade | Semana | Dono | Status |
|---|---|---|---|---|
| J0 | Roadmap e definições iniciais | 0 | Jessica | done |
| (preencher conforme os relatórios forem criados; relatórios com várias atividades ganham uma linha por atividade) | | | | |
