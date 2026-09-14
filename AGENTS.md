# Convenções do repositório

Regras para quem edita este repositório. Fonte da verdade da disciplina: `trabalho.pdf` (raiz).

## Contexto do projeto

- Disciplina: Tópicos Especiais em Segurança (UECE), prof. Rafael L. Gomes.
- Projeto: ambiente SOC/SIEM open-source (Wazuh, Suricata, Shuffle). Requisitos oficiais em `trabalho.pdf`.
- Execução: projeto individual, em duas máquinas (máquina SOC e máquina vítima).
- Avaliação: acompanhamento semanal (peso 0,3, nota individual), seminário (peso 0,3, fora do escopo deste repositório), projeto (peso 0,4, apresentação das soluções em 05/12/2026).

## Fontes de verdade (ler antes de agir)

1. `trabalho.pdf`: requisitos da disciplina (5 camadas do SOC, calendário, avaliação).
2. `ROADMAP.md`: plano completo (decisões D1 a D10, matriz de cobertura 2.1, atividades por semana com IDs T##, prioridade, pré-requisitos, riscos R1 a R9).
3. `docs/README.md`: índice e convenções dos documentos.
4. `docs/reports/`: relatórios por atividade, o detalhe da execução (status done/partial).
5. `docs/status.md`: painel das 56 atividades (done, partial ou pendente), com o link de cada relatório.
6. `docs/open-questions.md`: perguntas em aberto (tudo que ainda não está decidido ou documentado).

## Convenções obrigatórias

- Idioma: código, pastas e nomes de arquivos em inglês; o conteúdo dos documentos em português.
- Nunca usar o caractere travessão longo (em dash, U+2014) em arquivos do repositório; usar vírgula, ponto e vírgula ou parênteses.
- Tom dos documentos: registro técnico e factual de engenharia. Descrever o que o sistema faz, o que foi executado e o que ficou pendente, com dados verificáveis. Sem narrativa de processo, sem justificar decisão que já está registrada, sem autoavaliação, sem linguagem derrotista ou vaga, sem hipérbole e sem emoji. Incerteza vira risco ou pergunta em aberto, nunca comentário solto no texto.
- Um relatório por atividade (ou grupo de atividades da mesma semana) em `docs/reports/`, usando o `TEMPLATE.md`; preencher após a atividade. Atividades de verificação (T02, T45, T53) geram relatório curto com o checklist preenchido.
- `docs/status.md` é o painel do que está feito e do que falta: atualizar o status das atividades no mesmo commit do relatório, a cada pull request que conclui atividade.
- Reprodutibilidade: o repositório guarda configurações, scripts e documentação, para que um clone limpo reproduza o ambiente em outra máquina. Estado de máquina (VM, agentes, serviços) e artefatos grandes (pcaps, vídeos) não vão ao repositório: vão como receita de reprodução, acesso documentado e URLs de download. Segredos (chaves, credenciais reais) nunca vão ao repositório. Guias passo a passo de reprodução ficam em `docs/guides/`.
- Versionamento: cada atividade vai em uma branch própria e é integrada após a verificação do critério de aceite; o relatório entra no mesmo commit. O template de pull request (`.github/pull_request_template.md`) vale como checklist de fechamento.
- Toda decisão técnica nova: registrar em `docs/decisions.md`.
- Edição do `ROADMAP.md`: mínima. Só alterar por decisão de mudança forte (escopo, arquitetura, datas). Ajustes pontuais vão para os relatórios ou para `docs/open-questions.md`.

## Como trabalhar neste repositório

- Antes de editar: ler `ROADMAP.md`, a seção da atividade alvo (seção 6) e os relatórios dos pré-requisitos (seção "Aprendizados e avisos").
- Apresentar a abordagem e os arquivos que serão alterados antes de editar; implementar depois da aprovação.
- Fazer mudanças pequenas e incrementais, com verificação a cada passo; manter a documentação atualizada na mesma mudança.
- Não assumir fatos (datas, portas, versões, credenciais, configurações): conferir nas fontes de verdade. Informação ausente vira pergunta em `docs/open-questions.md`.
- Nova atividade detectada (instalação, configuração de ambiente, validação): mapear no `ROADMAP.md` com ID, semana, prioridade, pré-requisitos, descrição e entregável, e atualizar a tabela semanal e a matriz 2.1.
- Manter a matriz de cobertura (seção 2.1) atualizada: nenhum requisito do `trabalho.pdf` pode ficar sem atividade correspondente.
- Reaproveitar o que já existe no repositório antes de criar algo novo.
- Ao responder decisões, basear-se no `ROADMAP.md` e nos relatórios; se a resposta não estiver documentada, dizer que não está e propor registrar.

## Fora de escopo deste repositório

- Seminário da disciplina (tratado em separado).
