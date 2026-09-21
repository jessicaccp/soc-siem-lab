# Documentação do Projeto

Índice e convenções dos documentos do projeto SOC/SIEM.

## Estrutura

| Arquivo | Conteúdo | Criado em |
|---|---|---|
| `trabalho.pdf` (raiz) | Requisitos oficiais da disciplina (fonte da verdade) | Aula 00 |
| `ROADMAP.md` (raiz) | Planejamento completo: decisões, arquitetura, atividades por semana, riscos | Aula 00 |
| `docs/architecture.md` | Arquitetura final (diagrama, portas, fluxo de dados) | Atividade T44 |
| `docs/decisions.md` | Decisões técnicas tomadas ao longo do projeto | Atividade T35 |
| `docs/demo-guide.md` | Roteiro da demonstração e índice das evidências visuais | Atividade T42 (iniciado na semana 2) |
| `docs/faq.md` | Respostas para perguntas prováveis da arguição | Atividade T56 |
| `docs/open-questions.md` | Perguntas em aberto (tudo que ainda não está decidido) | Sempre que necessário |
| `docs/status.md` | Status das 56 atividades e índice dos relatórios | Atualizado a cada pull request |
| `docs/reports/` | Relatórios por atividade (um arquivo por atividade) | Sempre que uma atividade conclui |
| `docs/guides/` | Guias passo a passo de reprodução (VM, agente, dashboards, replay de pcaps) | Quando um procedimento precisa ser ensinado |

Nota: os arquivos marcados com "Criado em" (ex.: decisions.md na T35, architecture.md na T44, faq.md na T56) ainda não existem no repositório; são criados na atividade indicada, conforme o ROADMAP.md.

## Convenções

As regras de escrita, idioma e status dos relatórios são as de [`AGENTS.md`](../AGENTS.md), seção "Convenções obrigatórias". O que é específico do sistema de docs:

1. **Relatório por atividade**: um arquivo por atividade em `docs/reports/` (ex.: `T06-start-wazuh.md`), nomeado pelo ID, sempre usando o `TEMPLATE.md`. Uma atividade por arquivo: atividades diferentes não compartilham relatório.
2. **Quando preencher**: após concluir a atividade (ou após a entrega de várias atividades).
3. **Aprendizados e avisos**: leitura obrigatória antes de começar uma atividade dependente e ao retomar o projeto depois de uma pausa.
4. **Guia por tópico**: procedimento passo a passo em `docs/guides/`, no formato objetivo, pré-requisitos, passos, verificação.

## Fluxo semanal

1. Atividade concluída durante a semana: preencher o relatório no repo e atualizar `docs/status.md`.
2. Antes do acompanhamento: revisar os relatórios, conferir o critério de aceite da semana e montar os 3 bullets da seção "Acompanhamento".
3. Segunda-feira: acompanhamento com demo ao vivo, usando os bullets como roteiro da fala.

## Índice dos relatórios

O status de todas as atividades (T01 a T56) e o link de cada relatório ficam em `docs/status.md`; os relatórios propriamente ditos continuam em `docs/reports/`.
