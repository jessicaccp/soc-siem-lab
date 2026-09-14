# T02: Validar o roadmap contra os requisitos oficiais

## Metadados

- Semana: 0
- Atividades cobertas: T02
- Prioridade: P0
- Pré-requisitos: T01
- Status: done
- Data de conclusão: 13/09/2026

## Resumo do que foi feito

Conferência dos requisitos oficiais (`trabalho.pdf`, slides da Aula 00, 10 páginas) contra o `ROADMAP.md`.

### Avaliação e camadas

- Page 3: seminário 0,3, acompanhamento semanal 0,3, projeto 0,4. Confere com a seção 1.
- Page 5: as 5 camadas e as ferramentas aceitas em cada uma. Confere com a matriz 2.1: HIDS (Wazuh agent), NIDS (Suricata), SIEM (Wazuh manager), SOAR (Shuffle), dashboards (dashboard do Wazuh).
- Escolha dentro do que o slide aceita: HIDS (Wazuh, D2), NIDS (Suricata, D3), SIEM (Wazuh, D2), SOAR (Shuffle, D4, única opção do slide), dashboards (D5).
- Page 6 (figura "ARQUITETURA DA SOLUÇÃO - OPEN SOC LAB"): a transcrição da imagem está na seção de dificuldades. O bloco de visualização lista `Wazuh Dashboard` e `Grafana (opcional)`, o que sustenta o D5 e mantém a T32 como prioridade P1. A mesma figura detalha NIDS por assinatura com saída EVE JSON, SIEM Wazuh (manager, indexer e dashboard), SOAR Shuffle e ações de resposta (bloqueio de IP, scripts, notificações, registro da ação, coleta de evidências), todas cobertas por atividades.
- Page 7: report individual semanal do status da implementação. Coberto pelo relatório por atividade em `docs/reports/` e pelo painel `docs/status.md`.

### Calendário

As 11 datas do slide (page 8), os 10 acompanhamentos e a apresentação de 05/12, conferem uma a uma com a tabela da seção 1.

### Checagem automática da estrutura

- 56 atividades (T01 a T56), todas com Semana, Ordem, Prioridade, Pré-requisitos, Descrição e Entregável.
- Nenhum pré-requisito aponta para ID inexistente nem para atividade posterior na ordem de execução.
- As atividades por semana da tabela da seção 5 e as da seção 6 coincidem, sem divergência.
- Todos os IDs citados na matriz 2.1 existem e os 8 requisitos do slide têm atividade correspondente. A linha "Acompanhamento semanal" é transversal e não leva ID, é coberta pelos relatórios de todas as atividades.

### Ajustes aplicados no ROADMAP.md

O ambiente real da máquina SOC é um Linux com Docker CE 29.5.1 e Compose v5.1.3. Como a stack roda em containers, a distribuição do host não faz parte da arquitetura, e o documento deixou de fixar Ubuntu ou Fedora. Alterações (edição mínima, sem reescrever o documento):

| Ponto | Antes | Depois |
|---|---|---|
| D1 | Docker Compose na máquina SOC (Fedora) | Docker Compose na máquina SOC (Linux com Docker CE); justificativa com "a stack roda em containers, então a distribuição do host não faz parte da solução" |
| D6 | VM Ubuntu (KVM) na máquina vítima; KVM nativo do Fedora | VM Linux (KVM) na máquina vítima; KVM nativo do host |
| Seção 3 | Diagrama com "Fedora" nas duas máquinas e "VM Ubuntu (KVM)" | "Linux" nas duas máquinas e "VM Linux (KVM)" |
| Seção 4 | VM Ubuntu com o agente; ID numerado em ordem de execução | VM Linux com o agente; ID nominal, ordem real por (semana, ordem) |
| T03 | Repositório docker-ce via `dnf config-manager` | Procedimento oficial da distribuição do host (repositório oficial ou script get.docker.com) |
| T05 | `dnf groupinstall virtualization` no Fedora; ISO do Ubuntu Server LTS | libvirt + virt-manager pelo gerenciador de pacotes do host; ISO de uma distribuição Linux server (LTS) |
| T07 | Instalar o Ubuntu Server na VM | Instalar a distribuição Linux escolhida na VM |
| T08 | Liberar portas no firewalld | Liberar portas no firewall do host (firewalld, ufw ou nftables, conforme a distribuição) |
| T09 | Repositório do Wazuh no Ubuntu da VM | Repositório do Wazuh na VM (apt ou dnf, conforme a distribuição) |
| T33, T34 | Bloqueio com `firewalld-cmd --add-rich-rule` e sudo restrito ao firewalld | Comando de bloqueio no firewall do alvo (regra rich do firewalld, nftables ou ufw) |
| T48, T51, R6 | firewalld, ferramenta nativa do Fedora, Docker no Fedora | firewall, ferramenta de captura do host, ambiguidade entre Docker CE e podman-compose no host Linux |

## Dificuldades

- O slide 6 é uma figura, sem texto extraível, e o modelo da sessão não processa imagem. Resolvido extraindo o JPEG embutido do PDF com `pypdf` e transcrevendo a figura por um subagente em modelo com entrada de imagem. Trechos literais da transcrição: título `ARQUITETURA DA SOLUÇÃO - OPEN SOC LAB`, bloco `VISUALIZAÇÃO` com `Wazuh Dashboard` e `Grafana (opcional)`, bloco `SIEM - WAZUH` com manager, indexer e dashboard, bloco `SOAR - SHUFFLE`, bloco `INFRAESTRUTURA DO LAB` com `VM01` a `VM06` e `KALI LINUX`, e a legenda de ações de resposta.
- A máquina não tem `pdftotext`, `pdftoppm` nem `pillow`. O texto saiu por página com `pypdf` e as imagens saíram como JPEG direto dos XObjects, sem dependência nova.

## Aprendizados e avisos (handoff)

- A figura do slide ilustra um lab com 6 VMs (VM01 Wazuh, VM02 Suricata + Zeek, VM03 Shuffle, VM04 Linux, VM05 Windows, VM06 Kali) e uma máquina de ataques Kali. O projeto implementa as mesmas camadas com containers em duas máquinas (D1) e ataques originados na máquina SOC (D7). Divergência conhecida e justificada; a resposta para uma arguição é a reprodutibilidade do compose e a cobertura das 5 camadas.
- A solução não fixa distribuição de SO: o requisito de ambiente é Docker CE no host. Na máquina SOC de referência ele já está instalado (Docker CE 29.5.1 e Compose v5.1.3), o que reduz a T03 à validação e ao registro.
- T11 tem número maior que T05 mas roda antes: dentro da semana vale a ordem numérica, entre semanas vale a ordem da semana (nota adicionada na seção 4).
- A decisão de usar Docker CE e não podman-compose (R6) permanece o único ponto de ambiente com risco de fricção em outra máquina.
- Sem perguntas novas em aberto depois desta validação: o dashboard do Wazuh na camada de visualização está sustentado pelo próprio slide.

## Entregáveis

- `docs/reports/T02-validate-roadmap.md` (este relatório).
- `ROADMAP.md` ajustado nos pontos da tabela acima.
- `docs/status.md` com o T02 marcado como `done`.

## Acompanhamento

- O roadmap foi conferido contra o slide: camadas, ferramentas aceitas, pesos, calendário e figura da arquitetura. As 56 atividades têm pré-requisito, descrição e entregável, e os 8 requisitos do slide têm atividade correspondente.
- O slide da arquitetura é imagem: o JPEG foi extraído do PDF e transcrito com um modelo com visão, o que confirmou o dashboard do Wazuh na visualização e o Grafana como opcional.
- O roadmap deixou de fixar distribuição de SO, porque a stack roda em containers. A próxima atividade é a T03, instalar e validar o Docker CE na máquina SOC.
