# Status das atividades

Painel de acompanhamento das 56 atividades do projeto (T01 a T56). Descrição, pré-requisitos e entregável de cada uma ficam no `ROADMAP.md`, seção 6.

Atualizar este arquivo no mesmo commit do relatório, a cada pull request que conclui atividade.

Status: `done` (concluída e aceita), `partial` (em andamento), `pendente` (não iniciada). Prioridade P1 é cortável (ver `ROADMAP.md`, seção 4).

## Resumo

- Última atualização: 21/09/2026
- Concluídas: 17 de 56
- Semana atual: 2 (21/09/2026), Vítima e NIDS no ar
- Pendente da semana: nenhuma
- Próxima atividade: T18, subir o Shuffle standalone

## Semana 0 (28/08/2026): Definições iniciais (2/2)

| ID | Atividade | Prioridade | Status | Relatório |
|---|---|---|---|---|
| T01 | Criar o roadmap e as definições iniciais do projeto | P0 | done | [T01](reports/T01-roadmap.md) |
| T02 | Validar o roadmap contra os requisitos oficiais | P0 | done | [T02](reports/T02-validate-roadmap.md) |

## Semana 1 (14/09/2026): Fundação mínima (4/4)

| ID | Atividade | Prioridade | Status | Relatório |
|---|---|---|---|---|
| T03 | Instalar Docker CE na máquina SOC | P0 | done | [T03](reports/T03-install-docker.md) |
| T04 | Criar a estrutura de pastas e refinar o README | P0 | done | [T04](reports/T04-repo-structure.md) |
| T06 | Subir o Wazuh single-node | P0 | done | [T06](reports/T06-start-wazuh.md) |
| T11 | Gate do acompanhamento 1 | P0 | done | [T11](reports/T11-gate-week-1.md) |

## Semana 2 (21/09/2026): Vítima e NIDS no ar (11/11)

| ID | Atividade | Prioridade | Status | Relatório |
|---|---|---|---|---|
| T05 | Preparar a virtualização e criar a VM vítima | P0 | done | [T05](reports/T05-create-vm.md) |
| T07 | Instalar o SO na VM e liberar o acesso ssh | P0 | done | [T07](reports/T05-create-vm.md) |
| T08 | Liberar as portas do Wazuh no firewalld da máquina SOC | P0 | done | [T08](reports/T08-open-wazuh-ports.md) |
| T09 | Instalar e registrar o Wazuh agent na VM | P0 | done | [T09](reports/T09-wazuh-agent.md) |
| T10 | Validar a coleta de logs e o status Active do agente | P0 | done | [T10](reports/T10-validate-agent.md) |
| T12 | Subir o Suricata em container com network_mode host | P0 | done | [T12](reports/T12-suricata.md) |
| T13 | Baixar pcaps maliciosos e testar em modo pcap | P0 | done | [T13](reports/T13-malicious-pcaps.md) |
| T14 | Integrar Suricata ao Wazuh (infraestrutura) | P0 | done | [T14](reports/T14-suricata-wazuh.md) |
| T15 | Criar o decoder para os eventos do Suricata no Wazuh | P0 | done | [T15](reports/T15-suricata-decoder.md) |
| T16 | Criar as regras de correspondência para os alertas do Suricata | P0 | done | [T16](reports/T16-suricata-rules.md) |
| T17 | Validar alertas do Suricata no dashboard | P0 | done | [T17](reports/T17-suricata-dashboard.md) |

## Semana 3 (28/09/2026): SOAR conectado (0/6)

| ID | Atividade | Prioridade | Status | Relatório |
|---|---|---|---|---|
| T18 | Subir o Shuffle standalone com limite de RAM | P0 | pendente | |
| T19 | Configurar serviços frágeis na VM vítima | P0 | pendente | |
| T20 | Criar o workflow 1 no Shuffle | P0 | pendente | |
| T21 | Configurar a integração do Wazuh com o Shuffle | P0 | pendente | |
| T22 | Confirmar a chegada de alerta de teste no Shuffle | P0 | pendente | |
| T23 | Testar o workflow com alertas de teste | P0 | pendente | |

## Semana 4 (05/10/2026): Ataques reais e regras custom (0/6)

| ID | Atividade | Prioridade | Status | Relatório |
|---|---|---|---|---|
| T24 | Gerar ataques reais (nmap, hydra) | P0 | pendente | |
| T25 | Verificar as regras built-in do Wazuh disparando | P0 | pendente | |
| T26 | Criar regra custom de brute force | P0 | pendente | |
| T27 | Criar regra custom de check_ip | P0 | pendente | |
| T28 | Criar regra custom de elevação de malware do Suricata | P0 | pendente | |
| T29 | Rodar a simulação de ataques do Wazuh | P0 | pendente | |

## Semana 5 (14/10/2026): Dashboards (0/3)

| ID | Atividade | Prioridade | Status | Relatório |
|---|---|---|---|---|
| T30 | Configurar os dashboards nativos do Wazuh | P0 | pendente | |
| T31 | Criar as visualizações do dashboard custom | P0 | pendente | |
| T32 | Publicar o Grafana com painel de alertas | P1 | pendente | |

## Semana 6 (26/10/2026): SOAR completo (0/6)

| ID | Atividade | Prioridade | Status | Relatório |
|---|---|---|---|---|
| T33 | Preparar o acesso SSH por chave à VM vítima | P0 | pendente | |
| T34 | Adicionar o nó de bloqueio real e notificação no workflow | P0 | pendente | |
| T35 | Avaliar o Active Response do Wazuh e decidir a divisão de papéis | P0 | pendente | |
| T36 | Configurar o Active Response escolhido | P0 | pendente | |
| T37 | Montar e exportar o dashboard único do projeto | P0 | pendente | |
| T38 | Testar o cenário completo de resposta | P0 | pendente | |

## Semana 7 (09/11/2026): Cenário end-to-end (0/5)

| ID | Atividade | Prioridade | Status | Relatório |
|---|---|---|---|---|
| T39 | Script de demo único | P0 | pendente | |
| T40 | Analisar ruído e falsos negativos e ajustar as regras custom | P0 | pendente | |
| T41 | Re-testar as regras e manter o changelog | P0 | pendente | |
| T42 | Roteiro da demo | P0 | pendente | |
| T43 | Metasploit contra serviço vulnerável | P1 | pendente | |

## Semana 8 (16/11/2026): Hardening e resiliência (0/6)

| ID | Atividade | Prioridade | Status | Relatório |
|---|---|---|---|---|
| T44 | Documentar a arquitetura final | P0 | pendente | |
| T45 | Verificação técnica da documentação da arquitetura | P0 | pendente | |
| T46 | Teste de resiliência da máquina SOC (reboot e stack) | P0 | pendente | |
| T47 | Teste de resiliência da VM (reboot e reconexão do agente) | P0 | pendente | |
| T48 | Reduzir exposição da stack | P0 | pendente | |
| T49 | Versionar todas as configurações | P0 | pendente | |

## Semana 9 (23/11/2026): Ensaio e vídeo (0/3)

| ID | Atividade | Prioridade | Status | Relatório |
|---|---|---|---|---|
| T50 | Ensaio da demo ao vivo | P0 | pendente | |
| T51 | Gravar vídeo de 3 a 5 minutos | P0 | pendente | |
| T52 | Preparar os slides | P0 | pendente | |

## Semana 10 (30/11/2026): Polimento (0/4)

| ID | Atividade | Prioridade | Status | Relatório |
|---|---|---|---|---|
| T53 | Verificação final da documentação | P0 | pendente | |
| T54 | Testes finais de workflows e regras | P0 | pendente | |
| T55 | Preparar o ambiente da apresentação final | P0 | pendente | |
| T56 | Preparar respostas para perguntas prováveis | P0 | pendente | |
