# SOC/SIEM Open-Source

Projeto da disciplina Tópicos Especiais em Segurança (PPGCC/UECE, prof. Rafael L. Gomes).

## Status

- Semana atual: 1 (14/09/2026), fundação mínima: T06 e T11.
- Concluídas: T01 a T04 (4 de 56 atividades).
- Próxima atividade: T06, subir o Wazuh single-node.

Painel completo em [`docs/status.md`](docs/status.md), atualizado a cada pull request.

## Visão geral

Ambiente SOC/SIEM open-source para detecção de ataques e resposta automática. A solução cobre as 5 camadas exigidas pela disciplina com 3 serviços:

| Camada | Solução | Função |
|---|---|---|
| HIDS | Wazuh agent | Coleta de logs do SO na máquina vítima |
| NIDS | Suricata | Inspeção de tráfego e geração de alertas |
| SIEM | Wazuh manager | Gestão de eventos de host e rede |
| SOAR | Shuffle | Execução de respostas automáticas |
| Dashboards | Wazuh dashboard | Exibição de eventos |

## Arquitetura

Máquina SOC e máquina vítima na mesma rede local:

```
 Máquina SOC                      Máquina vítima
 Docker Compose:                  VM Linux (KVM):
 Wazuh + Suricata + Shuffle  <--  agente Wazuh + serviços frágeis
        ^
        | ataques reais (nmap, hydra) partem da máquina SOC,
        | visíveis ao Suricata na própria interface
```

Fluxo: eventos de sistema (agente) e de rede (Suricata) chegam ao Wazuh, que classifica a severidade; alertas críticos acionam o Shuffle, que bloqueia o IP do atacante no firewall da vítima.

## Requisitos de ambiente

- Máquina SOC: Linux com Docker CE e o plugin Docker Compose. A stack roda em containers, então a distribuição do host não define a solução.
- Instalação e validação: [`docs/guides/install-docker.md`](docs/guides/install-docker.md).
- Versões validadas na máquina SOC de referência (13/09/2026): Docker CE 29.5.1 e Docker Compose 5.1.3.
- Máquina vítima: VM Linux com o agente Wazuh (atividades T05 a T10).

## Repositório

| Arquivo ou pasta | Descrição |
|---|---|
| `trabalho.pdf` | Requisitos oficiais da disciplina |
| `ROADMAP.md` | Plano do projeto: decisões, arquitetura, atividades por semana, riscos |
| `AGENTS.md` | Convenções de edição do repositório |
| `docs/` | Documentação: índice, painel de status, relatórios, guias, perguntas em aberto |
| `configs/` | Configurações por serviço, em `suricata/`, `wazuh/` e `shuffle/` |
| `scripts/` | `attacks/` (nmap, hydra, simulação do Wazuh) e `demo/` (cenário end-to-end) |
| `assets/` | pcaps de teste e artefatos de demo, não versionados por tamanho |
| `.github/` | Template de pull request |

```text
soc-siem-lab/
├── configs/            # suricata/, wazuh/, shuffle/
├── docs/               # README, status.md, reports/, guides/, open-questions.md
├── scripts/
│   ├── attacks/        # nmap, hydra, simulação de ataques do Wazuh
│   └── demo/           # script único do cenário end-to-end
├── assets/             # pcaps de teste e artefatos de demo
└── .github/            # template de pull request
```

## Processo

- Atividades numeradas em ordem de execução (T01 a T56), com prioridade P0/P1, pré-requisitos e critério de aceite (ROADMAP.md, seção 6).
- Cada atividade concluída gera relatório em `docs/reports/`, com dificuldades e aprendizados para as atividades dependentes, e atualiza `docs/status.md`.
- Cada atividade vai em uma branch própria e é integrada após a verificação do critério de aceite.
- O `ROADMAP.md` é editado apenas em decisões de mudança forte; ajustes pontuais vão para os relatórios ou para `docs/open-questions.md`.

## Convenções

- Código, pastas e nomes de arquivos em inglês; conteúdo dos documentos em português.
