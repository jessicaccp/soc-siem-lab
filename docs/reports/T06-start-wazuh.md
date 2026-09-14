# T06: Subir o Wazuh single-node

## Metadados

- Semana: 1
- Atividades cobertas: T06
- Prioridade: P0
- Pré-requisitos: T03
- Status: done
- Data de conclusão: 14/09/2026

## Resumo do que foi feito

### T06: Subir o Wazuh single-node

- Versão escolhida: `wazuh-docker` **v4.14.7**, a última estável da linha 4.x. A linha 5.x só tem alpha e beta no repositório oficial (main em 5.1.0-alpha0), o que não serve para a demo.
- Deploy single-node copiado para `configs/wazuh/`: `docker-compose.yml` (manager, indexer e dashboard), `generate-indexer-certs.yml`, `config/certs.yml`, `config/wazuh_cluster/wazuh_manager.conf`, `config/wazuh_indexer/` e `config/wazuh_dashboard/`.
- Certificados internos gerados com a ferramenta oficial (`wazuh/wazuh-certs-generator:0.0.4`, tool 4.14): 12 arquivos em `config/wazuh_indexer_ssl_certs/`, com permissões restritas da própria ferramenta (400, donos 999 e 1000). O diretório ficou fora do git.
- Credenciais parametrizadas em `.env` com os valores padrão da imagem: `INDEXER_PASSWORD`, `API_PASSWORD` e `DASHBOARD_PASSWORD`. O `docker-compose.yml` usa `${VAR:-default}`, então a stack sobe sem `.env`, e o repositório só guarda o `.env.example`.
- `restart: unless-stopped` nos três serviços, como pedido: a stack volta sozinha depois de um reboot e continua parada se for parada à mão.
- Indexer publicado só em `127.0.0.1:9200`. Ele só é acessado dentro da rede do compose, então não precisa de porta aberta na rede; o restante do bind fica para a T48.
- Corrigido o `.gitignore` para o caminho real dos certificados (`configs/wazuh/config/wazuh_indexer_ssl_certs/`).
- Stack subida e verificada: cluster `green`, dashboard em HTTP 302 para `/app/login`, API do manager em 401 sem credencial (esperado), índice `wazuh-alerts-4.x-2026.09.14` com 186 documentos.
- Procedimento completo em `docs/guides/start-wazuh-stack.md`, com passos, verificação, parada, limpeza e o estado validado.

## Dificuldades

- A recriação do container do indexer (para prender a porta 9200 em localhost) derrubou a conexão do manager e do dashboard por cerca de um minuto, com erros `Indexer connection error` e `ECONNREFUSED 172.23.0.3:9200` nos logs. Os erros cessaram quando o indexer terminou de subir, o cluster voltou a `green` e o índice de alertas continuou íntegro. É o comportamento esperado de recriação sem espera de dependência, não um defeito da configuração.
- O gerador de certificados registra `find: command not found` em uma das etapas internas e segue adiante. Os 12 certificados esperados foram criados e os containers os consomem, então a mensagem é ruído da imagem oficial.
- O diretório de certificados fica com permissão restrita (400, donos 999 e 1000), ilegível para o usuário comum do host. É o desenho da ferramenta oficial: o daemon do Docker lê os arquivos e o indexer roda com o UID dono. Por isso ele está no `.gitignore`.

## Aprendizados e avisos (handoff)

- Imagens fixadas em `wazuh/*:4.14.7`. Qualquer atividade que altere `configs/wazuh/` (T14, T21, T26 a T28, T30) trabalha sobre esse deploy.
- O `ossec.conf` que os containers usam é `configs/wazuh/config/wazuh_cluster/wazuh_manager.conf`, montado como `/wazuh-config-mount/etc/ossec.conf`. A integração com o Suricata (T14) e o webhook do Shuffle (T21) entram nesse arquivo.
- A senha do indexer é usada por manager, filebeat e dashboard. Trocar `INDEXER_PASSWORD` no `.env` sem atualizar o hash em `config/wazuh_indexer/internal_users.yml` quebra a autenticação.
- Com a stack no ar, a máquina SOC usa cerca de 3,5 GB de RAM dos 7,6 GB. Suricata (T12) e Shuffle (T18) entram com folga, mas o Shuffle é Java e pede limite de heap (R4).
- Os comandos de leitura do estado passam por `docker compose ps`, `wazuh-control status` e pela API do indexer; o dashboard em si foi validado por resposta HTTP e depende de conferência visual no navegador.

## Entregáveis

- `configs/wazuh/`: `docker-compose.yml`, `generate-indexer-certs.yml`, `.env.example` e `config/` (manager, indexer e dashboard).
- `docs/guides/start-wazuh-stack.md`: como subir, verificar, parar e limpar a stack.
- Dashboard do Wazuh acessível em `https://localhost`.

## Acompanhamento

- O Wazuh single-node está no ar com manager, indexer e dashboard na versão 4.14.7, cluster `green`, dashboard respondendo e 186 alertas já indexados, com a stack toda versionada em `configs/wazuh/`.
- A escolha da versão foi a decisão mais pesada: o repositório oficial está em 5.1.0-alpha, então fixei a última estável 4.14.7; e a recriação do indexer para prender a porta 9200 em localhost gerou erros transitórios de conexão que cessaram sozinhos.
- O próximo passo é o gate da semana (T11): conferir o critério de aceite, registrar a evidência do dashboard e preparar a narrativa do acompanhamento, antes de abrir a semana 2.
