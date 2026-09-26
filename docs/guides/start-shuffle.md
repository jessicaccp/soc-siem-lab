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

## Modo de execução dos workers

O `docker-compose.yml` oficial pede `SHUFFLE_SWARM_CONFIG=run` no orborus, que cria os workers como serviços do Docker Swarm e precisa da rede overlay `shuffle_swarm_executions`. A máquina SOC não tem Swarm ativo (`docker info` responde `Swarm: inactive`), então essa rede não é criada, o container do Tenzir não sobe e nenhuma execução sai da fila. O projeto usa `SHUFFLE_SWARM_CONFIG=false` no `.env`, valor que o compose lê na variável do orborus: nesse modo os workers rodam como containers comuns, na rede do compose.

Consequências:

- O `tenzir-node`, que o orborus sobe para o pipeline de logs, fica na rede `tenzir-network` e não responde ao ping do orborus (`dial tcp: lookup tenzir-node`). O projeto não usa pipelines; as execuções não dependem dele.
- Depois de recriar o container do orborus, o backend recusa a fila por cerca de 90 segundos com `Orborus UUID mismatch`, até o failover trocar o líder. Nesse intervalo as execuções ficam paradas em `EXECUTING`.

## Workflow de resposta a brute force (T20)

A definição fica versionada em `configs/shuffle/workflows/brute-force-response.json`, exportada do banco do Shuffle. Para registrar o workflow e o webhook em uma instância limpa:

```bash
bash scripts/shuffle/import-workflow.sh
# workflow: brute-force-response (<id do workflow>)
# webhook:  http://localhost:3001/api/v1/hooks/webhook_<id do trigger>
```

O script envia o JSON e registra o webhook. O id do hook é o id do trigger que está dentro do workflow, porque a URL é `POST /api/v1/hooks/webhook_<id>` (44 caracteres, com o prefixo).

| Nó | App e ação | Papel |
|---|---|---|
| `Webhook` | trigger do tipo WEBHOOK | recebe o alerta do Wazuh |
| `parse_alert` | Shuffle Tools, `execute_python` | extrai `rule_id`, `level`, `description`, `srcip` e `agent` do payload |
| `log_response` | Shuffle Tools, `repeat_back_to_me` | registra a resposta no histórico da execução |

O ramo entre `parse_alert` e `log_response` tem uma condição: `$parse_alert.message.level` maior que `11`, ou seja, só segue com severidade de nível 12 ou mais. Abaixo disso o nó é marcado como `SKIPPED`, com a razão `Minimum of one branch's conditions must be correct to continue`.

Teste do webhook, sem depender do manager:

```bash
curl -s -X POST http://localhost:3001/api/v1/hooks/webhook_<id do trigger> \
  -H 'Content-Type: application/json' \
  -d '{"severity":3,"title":"sshd: brute force","rule_id":"5763",
       "all_fields":{"rule":{"id":"5763","level":12},"agent":{"name":"victim"},
       "data":{"srcip":"192.168.122.1"}}}'
# {"success": true, "execution_id": "..."}
```

No histórico do workflow, o alerta de nível 12 fecha com `parse_alert` e `log_response` em `SUCCESS`; o de nível 5 fecha com `log_response` em `SKIPPED`.

## Integração do Wazuh (T21)

O manager encaminha os alertas de nível 12 ou mais para o webhook do workflow. O bloco fica em `configs/wazuh/config/wazuh_cluster/wazuh_manager.conf`:

```xml
  <integration>
    <name>shuffle</name>
    <hook_url>http://host.docker.internal:3001/api/v1/hooks/webhook_48805230-a71c-5b84-8668-e8b290e19ea3</hook_url>
    <level>12</level>
    <alert_format>json</alert_format>
  </integration>
```

O `host.docker.internal` alcança a porta 3001 publicada na máquina SOC; o alias vem do `extra_hosts` do serviço `wazuh.manager` em `configs/wazuh/docker-compose.yml`. Para aplicar, recriar o container do manager:

```bash
cd configs/wazuh && docker compose up -d wazuh.manager
docker exec wazuh-wazuh.manager-1 grep -i 'Enabling integration' /var/ossec/logs/ossec.log | tail -1
# 2026/09/26 ... wazuh-integratord: INFO: Enabling integration for: 'shuffle'.
```

Conferência de alcance, sem disparar execução:

```bash
docker exec wazuh-wazuh.manager-1 sh -c \
  'curl -s -o /dev/null -w "%{http_code}\n" http://host.docker.internal:3001/'
# 200
```

Quais alertas acionam: os de nível 12 ou mais, hoje as regras de código malicioso do Suricata (`100200` e `100201`). As de varredura do Suricata (`100210` a `100212`, nível 6) e as de autenticação SSH (5760 nível 5, 5720 e 5763 nível 10) ficam abaixo do limiar. Se o cenário de brute force precisar acionar o SOAR, muda o `<level>` da integração ou o nível da regra custom da T26.

## Notas

- Origem: `docker-compose.yml` do repositório [Shuffle/Shuffle](https://github.com/Shuffle/Shuffle), tag `v2.2.1`, a última estável (o `master` está em `2.3.0-rc2`). O antigo repositório `Shuffle/shuffle-docker` não existe mais. As imagens estão fixadas em `2.2.1`, inclusive a do worker usada pelo orborus.
- Diferenças em relação ao arquivo oficial: heap do OpenSearch de 1 GB em vez de 3 GB, porta 9201 no host em vez de 9200, `SHUFFLE_SWARM_CONFIG` vindo do `.env` e remoção dos serviços comentados (cadvisor, memcached, docker-socket-proxy).
- O primeiro start precisa de internet: o orborus baixa a imagem do worker e o backend monta as imagens dos apps padrão (`frikky/shuffle:<app>_<versão>`), que ficam no cache do Docker e servem às execuções seguintes.
- Trocar `SHUFFLE_DEFAULT_PASSWORD`, `SHUFFLE_DEFAULT_APIKEY` ou a senha do OpenSearch depois do primeiro start não altera o usuário já gravado no banco: nesse caso, limpar `shuffle-database/` e subir de novo.
- O usuário administrador é criado pelo backend a partir do `.env`, sem etapa de registro por e-mail na UI.
- Os dados ficam em `shuffle-database/`, `shuffle-apps/` e `shuffle-files/`, ignorados pelo git.
