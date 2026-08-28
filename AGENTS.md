# AGENTS.md

Guia para humanos e agentes de IA trabalharem neste repositório de forma consistente.

## Contexto do projeto

- Disciplina: Tópicos Especiais em Segurança (UECE), prof. Rafael L. Gomes.
- Projeto: ambiente SOC/SIEM open-source (Wazuh, Suricata, Shuffle). Requisitos oficiais em `trabalho.pdf` (raiz), fonte da verdade da disciplina.
- Equipe: Jessica e Malu.
- Avaliação: acompanhamento semanal (peso 0,3, nota individual), seminário (peso 0,3, fora do escopo deste repositório), projeto (peso 0,4, apresentação das soluções em 05/12/2026).

## Fontes de verdade (ler antes de agir)

1. `trabalho.pdf`: requisitos da disciplina (5 camadas do SOC, calendário, avaliação).
2. `ROADMAP.md`: plano completo (decisões D1-D10, matriz de cobertura 2.1, atividades por semana com IDs, donos e pré-requisitos, riscos R1-R7).
3. `docs/README.md`: índice e convenções dos documentos.
4. `docs/reports/`: relatórios por atividade, o estado real da execução (status done/partial).
5. `docs/open-questions.md`: perguntas em aberto (tudo que ainda não está decidido ou documentado).

## Convenções obrigatórias

- Idioma: código, pastas e nomes de arquivos em inglês; o conteúdo dos documentos (docs/ e este arquivo) em português.
- Nunca usar o caractere travessão longo (em dash, U+2014) em arquivos do repositório; usar vírgula, ponto e vírgula ou parênteses.
- Um relatório por atividade (ou grupo de atividades da mesma semana) em `docs/reports/`, usando o `TEMPLATE.md`; preencher após a atividade (ou após a entrega de várias atividades). Atividades que consistem apenas em revisão de pull request não geram relatório.
- Compartilhamento de entregáveis: o repositório guarda configurações, scripts e documentação, para que cada integrante consiga reproduzir o trabalho da outra. Estado de máquina (VM, agentes, serviços) e artefatos grandes (pcaps, vídeos) não vão ao repositório: vão como receita de reprodução, acesso documentado e URLs de download. Segredos (chaves, credenciais reais) nunca vão ao repositório. Guias passo a passo de reprodução ficam em `docs/guides/`.
- Entrega por pull request: cada atividade concluída é enviada via pull request e a outra integrante revisa e faz o merge. Pull requests de documentação podem ser revisados e mesclados rapidamente. Usar o template de pull request (`.github/pull_request_template.md`).
- Revisão leve: revisão simples, sem rigidez; o objetivo é o merge. Correções necessárias não bloqueiam o pull request: são registradas como atividade nova no `ROADMAP.md` (ou ajuste nos relatórios) e tratadas posteriormente.
- Toda decisão técnica nova: registrar em `docs/decisions.md`.
- Edição do `ROADMAP.md`: mínima. Só alterar por decisão de mudança forte (escopo, arquitetura, divisão de trabalho, datas). Ajustes pontuais vão para os relatórios ou para `docs/open-questions.md`.

## Como trabalhar neste repositório

- Antes de implementar ou editar: ler `ROADMAP.md`, a seção 6 da atividade alvo e os relatórios dos pré-requisitos (seção "Aprendizados e avisos").
- Planejar antes de implementar: apresentar a abordagem e os arquivos que serão alterados antes de editar; implementar somente após o plano ser aceito.
- Quando possível, usar skills que reduzam o gasto de tokens (ex.: soluções mínimas, reuso do que já existe no repositório); evitar reescrever o que já funciona.
- Fazer mudanças pequenas e incrementais, com verificações frequentes; manter a documentação atualizada na mesma mudança.
- Não inventar fatos (datas, portas, versões, credenciais, configurações): conferir nas fontes de verdade. Se a informação não estiver documentada, registrar em `docs/open-questions.md` em vez de assumir.
- Nova atividade mínima detectada (instalação, configuração de ambiente, validação): mapear no `ROADMAP.md` com ID, dono, semana, pré-requisitos, descrição e entregável, e atualizar a tabela semanal e a matriz 2.1.
- Manter a matriz de cobertura (seção 2.1) atualizada: nenhum requisito do `trabalho.pdf` pode ficar sem atividade correspondente.
- Ao responder decisões, basear-se no `ROADMAP.md` e nos relatórios; se a resposta não estiver documentada, dizer que não está e propor registrar.

## Fora de escopo deste repositório

- Seminário da disciplina (tratado em separado).
