# Shuffle standalone (SOAR)

## Objetivo

Subir o Shuffle standalone na máquina SOC: UI em `http://localhost:3001`, API em `http://localhost:5001` e o OpenSearch interno em `https://localhost:9201`. Guia da T18.

## Pré-requisitos

- Docker CE com o plugin Compose (`install-docker.md`).
- Portas 3001, 3443, 5001 e 9201 livres no host (a 9200 pertence ao indexer do Wazuh).
- Cerca de 2,5 GB de RAM livres. O compose limita o heap do OpenSearch em 1 GB; o arquivo oficial pede 3 GB, que não cabem junto com o Wazuh (risco R4).

## Passos

1. Copiar o arquivo de ambiente e preencher as senhas:

```bash
cd configs/shuffle
cp .env.example .env
# Preencher: SHUFFLE_DEFAULT_PASSWORD, SHUFFLE_DEFAULT_APIKEY (UUID de 36 caracteres),
# SHUFFLE_ENCRYPTION_MODIFIER, SHUFFLE_OPENSEARCH_PASSWORD e OPENSEARCH_INITIAL_ADMIN_PASSWORD.
chmod 600 .env
```

2. Subir a stack:

```bash
docker compose up -d
```

3. Acompanhar o primeiro start. O backend espera o OpenSearch ficar pronto, cria o usuário administrador a partir das variáveis `SHUFFLE_DEFAULT_*` e monta os índices; no host de laboratório leva cerca de 4 minutos:

```bash
docker compose logs -f backend
# a mensagem final do init é: "Successfully created user admin"
```

4. Acessar a UI em `http://localhost:3001` e entrar com as credenciais de `SHUFFLE_DEFAULT_USERNAME` e `SHUFFLE_DEFAULT_PASSWORD`.

## Verificação

```bash
docker compose ps --format '{{.Name}}\t{{.Status}}\t{{.Ports}}'
# shuffle-backend     Up   0.0.0.0:5001->5001/tcp
# shuffle-frontend    Up   0.0.0.0:3001->80/tcp, 0.0.0.0:3443->443/tcp
# shuffle-opensearch  Up   0.0.0.0:9201->9200/tcp
# shuffle-orborus     Up

curl -sk -u "admin:$SHUFFLE_OPENSEARCH_PASSWORD" https://localhost:9201/_cluster/health
# {"cluster_name":"shuffle-cluster","status":"yellow",...}

curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3001
# 200

curl -s -X POST http://localhost:5001/api/v1/login -H 'Content-Type: application/json' \
  -d "{\"username\":\"$SHUFFLE_DEFAULT_USERNAME\",\"password\":\"$SHUFFLE_DEFAULT_PASSWORD\"}" | head -c 60
# {"success":true,...

docker stats --no-stream --format '{{.Name}}\t{{.MemUsage}}'
# shuffle-opensearch ~1,6 GiB | shuffle-backend ~200 MiB | shuffle-orborus ~55 MiB | shuffle-frontend ~16 MiB
```

O cluster fica `yellow` no estado estável: o Shuffle cria os índices com uma réplica e o cluster tem um nó só, então as réplicas ficam sem alocar. As primárias ficam ativas e a UI funciona; o `green` aparece apenas nos primeiros segundos, antes de o backend criar os índices.

## Parada e limpeza

```bash
docker compose stop           # para os containers, mantém os dados
docker compose down           # remove os containers e a rede, mantém os dados
rm -rf shuffle-database/*     # apaga o banco do Shuffle (usuário, workflows, execuções)
```

## Notas

- Origem: `docker-compose.yml` do repositório [Shuffle/Shuffle](https://github.com/Shuffle/Shuffle), tag `v2.2.1`, a última estável (o `master` está em `2.3.0-rc2`). O antigo repositório `Shuffle/shuffle-docker` não existe mais. As imagens estão fixadas em `2.2.1`, inclusive a do worker usada pelo orborus.
- Diferenças em relação ao arquivo oficial: heap do OpenSearch de 1 GB em vez de 3 GB, porta 9201 no host em vez de 9200 e remoção dos serviços comentados (cadvisor, memcached, docker-socket-proxy).
- O primeiro start precisa de internet: o orborus baixa a imagem do worker e o backend monta as imagens dos apps padrão (`frikky/shuffle:<app>_<versão>`), que ficam no cache do Docker e servem às execuções seguintes.
- Trocar `SHUFFLE_DEFAULT_PASSWORD`, `SHUFFLE_DEFAULT_APIKEY` ou a senha do OpenSearch depois do primeiro start não altera o usuário já gravado no banco: nesse caso, limpar `shuffle-database/` e subir de novo.
- O usuário administrador é criado pelo backend a partir do `.env`, sem etapa de registro por e-mail na UI.
- Os dados ficam em `shuffle-database/`, `shuffle-apps/` e `shuffle-files/`, ignorados pelo git.
