# T04: Criar a estrutura de pastas e refinar o README

## Metadados

- Semana: 1
- Atividades cobertas: T04
- Prioridade: P0
- Pré-requisitos: T01
- Status: done
- Data de conclusão: 13/09/2026

## Resumo do que foi feito

### T04: Criar a estrutura de pastas e refinar o README

- Estrutura criada conforme a seção 9 do roadmap: `configs/suricata/`, `configs/wazuh/`, `configs/shuffle/`, `scripts/attacks/`, `scripts/demo/` e `assets/pcaps/`, cada uma com um `.gitkeep` para o diretório existir no clone.
- `.gitignore` ajustado: acrescentado `assets/*.mp4`, porque o vídeo da demo (T51) é artefato grande e fica fora do repositório, conforme a regra de reprodutibilidade do `AGENTS.md`.
- `README.md` refinado: seção "Requisitos de ambiente" (Docker CE e Compose, com versões validadas e ponteiro para o guia), seção "Repositório" com arquivos e pastas mais a árvore do projeto, e o diagrama de arquitetura corrigido para "VM Linux (KVM)".

## Dificuldades

- O git não versiona diretório vazio, então a estrutura só aparece no clone com um arquivo em cada pasta. Resolvido com `.gitkeep` vazio em vez de inventar conteúdo de placeholder.
- A descrição da T04 inclui a seção "como subir" no README. Ela depende do `docker-compose.yml`, que só existe na T06, então entrou no escopo da T06 para o README não documentar arquivo inexistente; a versão completa com tempos esperados fica na T44.

## Aprendizados e avisos (handoff)

- Os caminhos canônicos de configuração passam a ser `configs/suricata/`, `configs/wazuh/` e `configs/shuffle/`. As atividades T15, T16, T26 a T28, T30, T36 e T37 gravam nesses diretórios.
- Scripts de ataque vão em `scripts/attacks/` (T24 e T29) e o script único da demo em `scripts/demo/` (T39).
- `assets/pcaps/` concentra os pcaps de teste da T13, com o download documentado no relatório, porque o arquivo em si fica fora do git.
- Vídeos também ficam fora do git (`.gitignore`), então o entregável da T51 precisa de URL ou caminho local documentado.

## Entregáveis

- Estrutura de pastas versionada (`configs/`, `scripts/`, `assets/pcaps/`).
- `.gitignore` com a entrada de vídeo.
- `README.md` com requisitos de ambiente, estrutura do repositório e diagrama atualizado.

## Acompanhamento

- O repositório agora tem a estrutura completa de pastas, pronta para receber configurações de Suricata, Wazuh e Shuffle, scripts de ataque e pcaps de teste.
- Detalhe que exigiu decisão: diretório vazio não entra no git, então a estrutura foi fixada com `.gitkeep`, e a seção "como subir" do README foi adiada para a T06 para não documentar um compose que ainda não existe.
- O próximo passo é a T06, primeira subida do Wazuh single-node, que é o item de maior peso da semana.
