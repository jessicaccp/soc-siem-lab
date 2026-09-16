# SOC/SIEM Open-Source

Projeto da disciplina Tópicos Especiais em Segurança (PPGCC/UECE, prof. Rafael L. Gomes): ambiente SOC/SIEM open-source que detecta ataques e executa resposta automática.

## Status

- Semana atual: 2 (21/09/2026), vítima e NIDS no ar.
- Concluídas: 12 de 56 atividades.

Painel completo, com o link de cada relatório, em [`docs/status.md`](docs/status.md).

## Visão geral

| Camada | Solução | Função |
|---|---|---|
| HIDS | Wazuh agent | Coleta de logs do SO na máquina vítima |
| NIDS | Suricata | Inspeção de tráfego e geração de alertas |
| SIEM | Wazuh manager | Gestão de eventos de host e rede |
| SOAR | Shuffle | Execução de respostas automáticas |
| Dashboards | Wazuh dashboard | Exibição de eventos |

A máquina SOC roda a stack em Docker Compose e a máquina vítima é uma VM Linux monitorada. Arquitetura, decisões e cronograma em [`ROADMAP.md`](ROADMAP.md).

## Como subir

A stack da máquina SOC fica em `configs/wazuh/`:

```bash
cd configs/wazuh
cp .env.example .env
docker compose -f generate-indexer-certs.yml run --rm generator
docker compose up -d
```

Dashboard em `https://localhost`. Procedimento completo, portas e verificação em [`docs/guides/start-wazuh-stack.md`](docs/guides/start-wazuh-stack.md).

A máquina SOC precisa de Docker CE com o plugin Compose (instalação e versões validadas em [`docs/guides/install-docker.md`](docs/guides/install-docker.md)). A VM vítima, com o agente Wazuh, é criada pelo guia [`docs/guides/victim-vm.md`](docs/guides/victim-vm.md).

## Documentação

Índice e convenções dos documentos em [`docs/README.md`](docs/README.md). O que editar, onde cada informação mora e como contribuir: [`AGENTS.md`](AGENTS.md).

## Repositório

| Pasta | Conteúdo |
|---|---|
| `ROADMAP.md` | Plano: decisões, arquitetura, atividades por semana, riscos |
| `docs/` | Painel de status, relatórios, guias e perguntas em aberto |
| `configs/` | Configurações por serviço: `suricata/`, `wazuh/`, `shuffle/` |
| `scripts/` | `vm/` (VM vítima e agente), `attacks/` (nmap, hydra), `demo/` |
| `assets/` | pcaps de teste e artefatos de demo, não versionados por tamanho |
