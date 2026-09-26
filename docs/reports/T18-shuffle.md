# T18: Subir o Shuffle standalone com limite de RAM

## Metadados

- Semana: 3
- Atividade: T18
- Prioridade: P0
- Pré-requisitos: T03
- Status: done
- Data de conclusão: 26/09/2026

## Resumo do que foi feito

### T18: Subir o Shuffle standalone com limite de RAM

- Origem do deploy: o repositório `Shuffle/shuffle-docker` citado no roadmap não existe mais (resposta 404). O standalone passou a ser o `docker-compose.yml` da raiz do repositório `Shuffle/Shuffle`. Usei a tag `v2.2.1`, a última estável (o `master` está em `2.3.0-rc2`), e fixei as imagens em `2.2.1`: `shuffle-frontend`, `shuffle-backend`, `shuffle-orborus` e o worker que o orborus cria (`shuffle-worker`). Conferi no ghcr que a tag existe nas quatro.
- Deploy copiado para `configs/shuffle/`: `docker-compose.yml`, `.env.example` e `.env` (este fora do git, com as senhas).
- Ajustes em relação ao arquivo oficial: heap do OpenSearch de 3 GB para 1 GB (risco R4), porta 9200 do host para 9201 (a 9200 pertence ao indexer do Wazuh), `DOCKER_API_VERSION` de 1.40 para 1.44 (API do Docker 29.8.1) e remoção dos serviços comentados (cadvisor, memcached, docker-socket-proxy).
- `.env` com senhas geradas para o OpenSearch e para o usuário da UI, chave de API em formato UUID, modificador de cifra dos apps, `TZ=America/Fortaleza` e os diretórios de dados relativos a `configs/shuffle/`.
- Primeira subida com `docker compose up -d`: quatro containers no ar, OpenSearch respondendo `green` em cerca de 1 minuto e init do backend concluído em cerca de 4 minutos, criando o usuário `admin`, a organização `default` e as políticas ISM dos 12 padrões de índice.
- Verificação: `docker compose ps` com os quatro serviços `Up`, `_cluster/health` respondendo, UI com HTTP 200 em `http://localhost:3001` e `POST /api/v1/login` com `success: true`. No estado estável o cluster fica `yellow`, porque o Shuffle cria os índices com uma réplica e só existe um nó: as primárias ficam ativas e as réplicas sem alocar.
- Print da UI autenticada em `assets/prints/week-03/`, capturado com Chromium headless (login e página de workflows).
- Consumo com a stack no ar: OpenSearch 1,6 a 1,7 GB, backend 200 a 440 MB, orborus 55 MB e frontend 16 MB, cerca de 2 GB no total.

## Dificuldades

- O primeiro `docker compose up -d` gerou 12 erros `Error in initial database connection` no backend: ele sobe antes do OpenSearch e tenta reconectar a cada 5 segundos. Os erros cessaram sozinhos quando o OpenSearch passou a responder, sem intervenção.
- A chave de API padrão do backend precisa ter formato de UUID. Com 32 caracteres hexadecimais, o init falhava em `validate swagger` e `set new workflow` com `Apikey must be at least 36 characters long (UUID)`, e o workflow do ops dashboard não era criado. A chave foi trocada por um UUID de 36 caracteres.
- Trocar a chave no `.env` não corrigiu o aviso: o backend usa a chave já gravada no banco. Como a instalação ainda não tinha nada, limpei `shuffle-database/` e subi de novo; o usuário foi recriado com a chave correta e os avisos desapareceram.
- O compose oficial pede 3 GB de heap para o OpenSearch, que não cabem junto com o Wazuh (3,5 GB) e o Suricata (0,5 GB). O valor foi reduzido para 1 GB antes da primeira subida, não depois de um problema de memória.

## Aprendizados e avisos (handoff)

- Acessos: UI em `http://localhost:3001`, API em `http://localhost:5001` e OpenSearch interno em `https://localhost:9201`. As credenciais ficam no `.env` (`SHUFFLE_DEFAULT_USERNAME` e `SHUFFLE_DEFAULT_PASSWORD`); a chave de API é o `SHUFFLE_DEFAULT_APIKEY`.
- As atividades T20 a T23 alteram `configs/shuffle/` e usam a porta 3001 do host para receber o webhook do Wazuh. O backend fala com o OpenSearch pelo nome `shuffle-opensearch`, na rede `shuffle`.
- O init leva cerca de 4 minutos e o primeiro start precisa de internet: o backend monta as imagens dos apps padrão (`frikky/shuffle:<app>_<versão>`), que ficam no cache do Docker e servem às execuções seguintes.
- Trocar as credenciais no `.env` depois do primeiro start não atualiza o banco do Shuffle: é preciso limpar `shuffle-database/` e subir de novo.
- Com o Shuffle no ar sobram cerca de 1,5 GB de RAM. A VM vítima (2 GB) entra nas T19, T22 e T23; se faltar memória, o Suricata (470 MB) pode ficar parado durante a montagem dos workflows, sem afetar a cadeia do SOAR.
- Os serviços do compose não têm healthcheck: a conferência é por `docker compose ps`, pelo `_cluster/health` (que fica `yellow` com um nó só) e pelo login na API.
- O `ROADMAP.md` (T18) foi corrigido para apontar o repositório e a tag reais. O setup local por e-mail de teste não existe nesse caminho: o usuário administrador é criado pelas variáveis `SHUFFLE_DEFAULT_*` do `.env`.

## Entregáveis

- `configs/shuffle/docker-compose.yml`: imagens fixadas em `2.2.1`, heap do OpenSearch em 1 GB, porta 9201.
- `configs/shuffle/.env.example` e `configs/shuffle/.env` (local, ignorado pelo git).
- `configs/shuffle/shuffle-apps/`, `shuffle-files/` e `shuffle-database/`: diretórios de dados, ignorados pelo git.
- `docs/guides/start-shuffle.md`: subida, verificação, parada e limpeza.
- `assets/prints/week-03/01-shuffle-workflows.png` e `02-shuffle-login.png`.
- `README.md` e `docs/guides/README.md`: ponteiros para o guia do Shuffle.

## Acompanhamento

- O Shuffle standalone está no ar na versão 2.2.1, com UI, API e OpenSearch estáveis, usuário administrador criado e consumo de cerca de 2 GB, tudo versionado em `configs/shuffle/` e reproduzível pelo guia.
- A dificuldade mais interessante foi a chave de API: o backend exigia UUID, o aviso persistia porque a chave antiga estava no banco, e a saída foi limpar o `shuffle-database/` da instalação nova e subir de novo.
- Próximo passo da semana: T19, configurar os serviços frágeis na VM vítima (Apache com página de teste) antes de montar o workflow.
- Os prints do SOAR entram no `docs/demo-guide.md` no fim da semana, junto com a T23, para o roteiro registrar a cadeia completa em uma única passada.
