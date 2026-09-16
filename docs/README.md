# Documentação do Projeto

Índice e convenções dos documentos do projeto SOC/SIEM.

## Estrutura

| Arquivo | Conteúdo | Criado em |
|---|---|---|
| `trabalho.pdf` (raiz) | Requisitos oficiais da disciplina (fonte da verdade) | Aula 00 |
| `ROADMAP.md` (raiz) | Planejamento completo: decisões, arquitetura, atividades por semana, riscos | Aula 00 |
| `docs/architecture.md` | Arquitetura final (diagrama, portas, fluxo de dados) | Atividade T44 |
| `docs/decisions.md` | Decisões técnicas tomadas ao longo do projeto | Atividade T35 |
| `docs/demo-guide.md` | Roteiro da apresentação final | Atividade T42 |
| `docs/faq.md` | Respostas para perguntas prováveis da arguição | Atividade T56 |
| `docs/open-questions.md` | Perguntas em aberto (tudo que ainda não está decidido) | Sempre que necessário |
| `docs/status.md` | Status das 56 atividades e índice dos relatórios | Atualizado a cada pull request |
| `docs/reports/` | Relatórios por atividade (um arquivo por atividade) | Sempre que uma atividade conclui |
| `docs/guides/` | Guias passo a passo de reprodução (VM, agente, dashboards, replay de pcaps) | Quando um procedimento precisa ser ensinado |

Nota: os arquivos marcados com "Criado em" (ex.: decisions.md na T35, architecture.md na T44, demo-guide.md na T42, faq.md na T56) ainda não existem no repositório; são criados na atividade indicada, conforme o ROADMAP.md.

## Convenções

1. **Idioma**: código, pastas e nomes de arquivos em inglês; o conteúdo dos documentos (docs/) em português.
2. **Relatório por atividade**: um arquivo por atividade em `docs/reports/` (ex.: `T06-start-wazuh.md`), sempre usando o `TEMPLATE.md`. O relatório também pode cobrir **várias atividades** (ex.: as da mesma semana), listando todos os IDs nos metadados e separando os pontos por atividade. Nome do arquivo: pelos IDs ou pela semana (ex.: `week-04.md`).
3. **Quando preencher**: após concluir a atividade (ou após a entrega de várias atividades).
4. **Status**: `done` (concluída e aceita) ou `partial` (em andamento, com o que falta listado).
5. **Aprendizados e avisos**: leitura obrigatória antes de começar uma atividade dependente e ao retomar o projeto depois de uma pausa.
6. **Dono único**: cada informação tem um arquivo dono, listado em `AGENTS.md`, seção "Dono de cada informação". Os demais arquivos apenas linkam o conteúdo, nunca o copiam.

## Fluxo semanal

1. Atividade concluída durante a semana: preencher o relatório no repo e atualizar `docs/status.md`.
2. Antes do acompanhamento: revisar os relatórios, conferir o critério de aceite da semana e montar os 3 bullets da seção "Acompanhamento".
3. Segunda-feira: acompanhamento com demo ao vivo, usando os bullets como roteiro da fala.

## Índice dos relatórios

O status de todas as atividades (T01 a T56) e o link de cada relatório ficam em `docs/status.md`; os relatórios propriamente ditos continuam em `docs/reports/`.
