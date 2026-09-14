# SOC/SIEM Open-Source

Projeto da disciplina Tópicos Especiais em Segurança (PPGCC/UECE, prof. Rafael L. Gomes).

## Status

- Semana atual: 1 (14/09/2026), fundação mínima: T03, T04, T06 e T11.
- Concluídas: T01 (1 de 56 atividades).
- Próxima atividade: T02, validação do roadmap contra o `trabalho.pdf`.

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
 Docker Compose:                  VM Ubuntu (KVM):
 Wazuh + Suricata + Shuffle  <--  agente Wazuh + serviços frágeis
        ^
        | ataques reais (nmap, hydra) partem da máquina SOC,
        | visíveis ao Suricata na própria interface
```

Fluxo: eventos de sistema (agente) e de rede (Suricata) chegam ao Wazuh, que classifica a severidade; alertas críticos acionam o Shuffle, que bloqueia o IP do atacante no firewall da vítima.

## Repositório

| Arquivo | Descrição |
|---|---|
| `trabalho.pdf` | Requisitos oficiais da disciplina |
| `ROADMAP.md` | Plano do projeto: decisões, arquitetura, atividades por semana, riscos |
| `AGENTS.md` | Convenções de edição do repositório |
| `docs/README.md` | Índice dos documentos |
| `docs/status.md` | Status das atividades e índice dos relatórios |
| `docs/reports/` | Relatórios por atividade |
| `docs/open-questions.md` | Perguntas em aberto |

## Processo

- Atividades numeradas em ordem de execução (T01 a T56), com prioridade P0/P1, pré-requisitos e critério de aceite (ROADMAP.md, seção 6).
- Cada atividade concluída gera relatório em `docs/reports/`, com dificuldades e aprendizados para as atividades dependentes, e atualiza `docs/status.md`.
- Cada atividade vai em uma branch própria e é integrada após a verificação do critério de aceite.
- O `ROADMAP.md` é editado apenas em decisões de mudança forte; ajustes pontuais vão para os relatórios ou para `docs/open-questions.md`.

## Convenções

- Código, pastas e nomes de arquivos em inglês; conteúdo dos documentos em português.
