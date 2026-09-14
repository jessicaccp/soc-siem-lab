# Subir a stack do Wazuh

## Objetivo

Subir o Wazuh single-node (manager, indexer e dashboard) da máquina SOC a partir do que está versionado em `configs/wazuh/`, e conferir que o dashboard responde.

## Pré-requisitos

- Docker CE com o plugin Docker Compose (ver `install-docker.md`).
- `vm.max_map_count` igual ou maior que 262144 no host, exigência do indexer. Conferir com `cat /proc/sys/vm/max_map_count` e ajustar com `sudo sysctl -w vm.max_map_count=262144`.
- Portas livres no host: 443 (dashboard), 1514 e 1515 (agentes), 55000 (API do manager) e 9200 (indexer, publicado apenas em 127.0.0.1).
- Cerca de 2 GB de imagens e 2 GB de RAM durante a execução.

## Passos

1. Copiar as variáveis de ambiente:

```bash
cd configs/wazuh
cp .env.example .env
```

2. Gerar os certificados internos (uma vez). O gerador oficial escreve em `config/wazuh_indexer_ssl_certs/`, fora do controle de versão:

```bash
docker compose -f generate-indexer-certs.yml run --rm generator
```

3. Subir a stack:

```bash
docker compose up -d
```

4. Acompanhar a subida. O indexer leva cerca de um minuto para responder:

```bash
docker compose ps
docker compose logs -f wazuh.indexer
```

5. Acessar o dashboard em `https://localhost`. O aviso de certificado autoassinado é esperado. As credenciais padrão da imagem oficial são `admin` / `SecretPassword`, definidas em `.env`; trocar antes de expor a porta fora da rede local (atividade T48).

## Parar, reiniciar e limpar

- Parar sem perder dados: `docker compose stop`.
- Remover os containers mantendo os volumes: `docker compose down`.
- Apagar tudo, incluindo os dados do indexer: `docker compose down -v`.
- Os três serviços usam `restart: unless-stopped`: voltam sozinhos depois de um reboot do host e continuam parados se forem parados à mão.

## Verificação

```bash
curl -sk -u admin:SecretPassword https://localhost:9200/_cluster/health   # status green
curl -sk -o /dev/null -w "%{http_code}\n" https://localhost/             # 302
docker compose ps                                                        # 3 containers Up
docker exec wazuh-wazuh.manager-1 /var/ossec/bin/wazuh-control status    # daemons running
```

Resultado esperado: cluster `green`, dashboard respondendo com redirecionamento para `/app/login`, três containers `Up` e os daemons do manager rodando (`wazuh-analysisd`, `wazuh-remoted`, `wazuh-syscheckd`, `wazuh-apid`). Sem configurar cluster e e-mail, `wazuh-clusterd` e `wazuh-maild` aparecem como `not running`, o que é esperado em single-node.

## Estado validado (14/09/2026)

| Item | Valor verificado |
|---|---|
| Imagens | `wazuh/wazuh-manager`, `wazuh/wazuh-indexer` e `wazuh/wazuh-dashboard` na versão 4.14.7 |
| Indexer | API respondendo, cluster `green`, 1 nó, 12 shards ativos |
| Dashboard | HTTP 302 para `/app/login`, título `Wazuh` |
| Alertas indexados | índice `wazuh-alerts-4.x-2026.09.14` com 186 documentos gerados na primeira subida |
| Memória dos containers | indexer 1,5 GB, manager 868 MB, dashboard 250 MB |
| Política de restart | `unless-stopped` nos três serviços |
| Certificados | 12 arquivos gerados pelo tool oficial em `config/wazuh_indexer_ssl_certs/` (fora do git) |
