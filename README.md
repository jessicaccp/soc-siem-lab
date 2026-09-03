# SOC/SIEM Open-Source

Projeto da disciplina Tópicos Especiais em Segurança (PPGCC/UECE, prof. Rafael L. Gomes).

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

Duas máquinas na mesma rede local:

```
 Notebook 1 (SOC)                 Notebook 2 (vítima)
 Docker Compose:                  VM Ubuntu (KVM):
 Wazuh + Suricata + Shuffle  <--  agente Wazuh + serviços frágeis
        ^
        | ataques reais (nmap, hydra) partem do Notebook 1,
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
| `docs/reports/` | Relatórios por atividade |
| `docs/open-questions.md` | Perguntas em aberto |

## Processo

- Divisão de trabalho por atividade, com dono, pré-requisitos e critério de aceite (ROADMAP.md, seção 6).
- Cada atividade concluída gera relatório em `docs/reports/`, com dificuldades e aprendizados para as atividades dependentes.
- O `ROADMAP.md` é editado apenas em decisões de mudança forte; ajustes pontuais vão para os relatórios ou para `docs/open-questions.md`.

## Convenções

- Código, pastas e nomes de arquivos em inglês; conteúdo dos documentos em português.
