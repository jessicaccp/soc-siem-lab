# Roadmap do Projeto: Ambiente SOC/SIEM Open-Source

Disciplina: Tópicos Especiais em Segurança (UECE), prof. Rafael L. Gomes.
Curso: PPGCC (Programa de Pós-Graduação em Ciência da Computação), UECE.
Escopo: projeto individual.
Data de criação: 28/08/2026.

---

## 1. Contexto e avaliação

A disciplina tem 3 componentes de nota:

| Componente             | Peso | O que é                                                                        |
| ---------------------- | ---- | ------------------------------------------------------------------------------ |
| Seminário              | 0,3  | Fora do escopo deste roadmap (tratado em separado)                             |
| Acompanhamento semanal | 0,3  | Report individual do status da implementação, toda segunda-feira, 10 encontros |
| Projeto                | 0,4  | Ambiente SOC/SIEM open-source, com apresentação final                          |

Requisitos oficiais da disciplina: `trabalho.pdf` (raiz do repositório). A matriz de cobertura (seção 2.1) rastreia cada requisito do PDF para as atividades do roadmap.

O projeto exige 5 camadas, conforme o slide da disciplina:

1. HIDS: coleta de logs do SO (Wazuh, Auditd, OSSEC ou Velociraptor)
2. NIDS: inspeção de pacotes e rede (Suricata, Zeek ou Snort)
3. SIEM: gestão de eventos de host e rede (Wazuh ou Graylog)
4. SOAR: recebe alertas e executa ações (Shuffle)
5. Dashboards: exibição de eventos (Grafana ou Kibana)

Datas-chave do calendário da disciplina:

| Data       | Evento                          |
| ---------- | ------------------------------- |
| 14/09/2026 | Acompanhamento 1                |
| 21/09/2026 | Acompanhamento 2                |
| 28/09/2026 | Acompanhamento 3                |
| 05/10/2026 | Acompanhamento 4                |
| 14/10/2026 | Acompanhamento 5                |
| 26/10/2026 | Acompanhamento 6                |
| 09/11/2026 | Acompanhamento 7                |
| 16/11/2026 | Acompanhamento 8                |
| 23/11/2026 | Acompanhamento 9                |
| 30/11/2026 | Acompanhamento 10               |
| 05/12/2026 | Apresentação final das soluções |

---

## 2. Decisões de arquitetura e justificativas

| #   | Decisão                  | Escolha                                                                                                                        | Justificativa                                                                                                                                                                                                                                                  | Alternativas rejeitadas                                                                                                                                                                    |
| --- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | Infraestrutura           | Docker Compose na máquina SOC (Linux com Docker CE)                                                                            | Reproduzível, versionável no git, reset rápido para demo; a stack roda em containers, então a distribuição do host não faz parte da solução; a vítima fica isolada na segunda máquina, na mesma rede                                                           | VMs para a stack (overhead de gerenciamento sem ganho; a VM fica reservada à vítima), cloud (custo e fricção), WSL2 (hoje é o host do projeto)                                             |
| D2  | HIDS + SIEM + Dashboards | Wazuh (manager + indexer + dashboard)                                                                                          | Um único serviço cobre 3 caixas do slide; comunidade grande; regras prontas; script oficial de simulação de ataques para demo                                                                                                                                  | Graylog (não faz HIDS, exigiria OSSEC/Auditd separado), OSSEC (mais antigo, sem dashboard moderno), Velociraptor (foco forense, não SIEM em tempo real), Auditd (só Linux e sem dashboard) |
| D3  | NIDS                     | Suricata                                                                                                                       | Alertas nativos, regras atualizadas, melhor suporte a replay de pcap (padrão de teste de IDS); roda em container com network_mode host para sniffar a interface                                                                                                | Zeek (gera metadata/logs, não alertas nativos), Snort (mais datado, regras legacy)                                                                                                         |
| D4  | SOAR                     | Shuffle                                                                                                                        | Única opção listada no slide; open-source; workflows visuais; integra com Wazuh via webhook                                                                                                                                                                    | Nenhuma (obrigatória)                                                                                                                                                                      |
| D5  | Dashboards extras        | Grafana fora do escopo obrigatório, como atividade opcional (T32)                                                              | O dashboard do Wazuh (fork do Kibana) já cobre "Grafana ou Kibana" do slide; sem restrição de RAM, o Grafana entra se houver folga na semana, para não competir com o caminho crítico                                                                          | Grafana como requisito (duplicaria esforço sem requisito novo), Kibana (o Wazuh dashboard já é um fork dele)                                                                               |
| D6  | Alvo monitorado          | VM Linux (KVM) no host do projeto (WSL2), em rede isolada do libvirt                                                           | Duas máquinas disponíveis durante todo o semestre e na apresentação; a VM isola o ambiente de ataque do uso diário, é descartável (snapshot/reset), o KVM é nativo e, com a VM no mesmo host, o tráfego passa pela ponte do libvirt e fica visível ao Suricata | Vítima instalada direto no host (suja a máquina de uso diário e mistura demos com o ambiente pessoal)                                                                                      |
| D7  | Geração de detecção NIDS | Replay de pcaps maliciosos (malware-traffic-analysis.net) + ataques originados na máquina SOC                                  | Padrão da indústria para testar regras de IDS; alertas determinísticos; ataques originados no próprio host do SOC são visíveis ao Suricata (tráfego de saída da própria interface), imunes a AP isolation                                                      | Confiar só no tráfego entre máquinas (WiFi com AP isolation pode esconder o tráfego dos dois sentidos)                                                                                     |
| D8  | Geração de detecção HIDS | Ataques reais (nmap, hydra) contra a VM vítima + script de simulação do Wazuh                                                  | Prova o agente, as regras e o pipeline de ponta a ponta                                                                                                                                                                                                        | Só simulação (menos convincente na demo)                                                                                                                                                   |
| D9  | SOAR como diferencial    | Workflow: alerta crítico do Wazuh dispara bloqueio do IP atacante                                                              | É a camada que poucas equipes entregam funcionando; vira o destaque da apresentação final                                                                                                                                                                      | SOAR só notificando (sem ação, não cumpre "executa ações")                                                                                                                                 |
| D10 | Modo de execução         | Projeto individual, com uma sequência única de atividades (T01 a T56), prioridade P0/P1 e gate de aceite no fim de cada semana | A execução é sequencial por natureza: uma ordem única de atividades, com prioridades explícitas, evita paralelismo que não se sustenta; o acompanhamento é avaliado individualmente                                                                            | Divisão por caixa do slide (gera gargalo em projeto individual), reduzir o escopo (cortaria requisitos do slide)                                                                           |

### 2.1 Cobertura dos requisitos do slide

Matriz de rastreabilidade entre o que o slide da disciplina exige e as atividades do roadmap. Serve para conferir, em qualquer semana, que nenhum requisito está descoberto.

| Requisito do slide                        | Atividades que o cumprem                                                                                                             | Semanas |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| Projeto individual                        | T01, T02 (definições iniciais)                                                                                                       | 0       |
| HIDS: coleta de logs de SO                | T09, T10 (agente + coleta de logs), T29 (simulação de ataques), T26, T27, T28, T40, T41 (regras)                                     | 2, 4, 7 |
| NIDS: inspeção de pacotes e rede          | T12 (modo live), T13 (replay de pcap), T14, T16 e T15 (decoders e regras), T17 (validação)                                           | 2       |
| SIEM: gestão de eventos de host e rede    | T06 (manager), T17 (eventos de rede no dashboard), T31 (visualização)                                                                | 1, 2, 5 |
| SOAR: recebe alertas e executa ações      | T20, T21, T22 (integração Wazuh), T23, T34 e T38 (bloqueio real de IP), T36                                                          | 3, 6    |
| Dashboards: exibição de eventos           | T30 (nativos), T31 (visualizações), T37 (dashboard único), via dashboard do Wazuh (fork do Kibana, ver D5); T32 (Grafana) é opcional | 5, 6    |
| Acompanhamento semanal: report individual | docs/reports/ e bullets de "Acompanhamento" (docs/README.md)                                                                         | todas   |
| Apresentação das Soluções (05/12)         | T50, T51, T52, T55, T56                                                                                                              | 9, 10   |

---

## 3. Arquitetura da solução

```
  Host Linux único do projeto (WSL2, na máquina do Windows)
  +----------------------------------+-----------------------------+
  | Docker Compose (máquina SOC)     | VM Linux (KVM) da vítima    |
  +----------------------------------+-----------------------------+
  | Wazuh manager + indexer          | Wazuh agent                 |
  | Wazuh dashboard                  | SSH com senha fraca         |
  | Suricata (network_mode host)     | serviços frágeis            |
  | Shuffle (SOAR)                   |                             |
  +----------------------------------+-----------------------------+
  fluxo: o agente envia eventos ao manager na 1514, pela ponte do libvirt;
  os ataques (nmap, hydra) saem do host pela mesma ponte e são vistos pelo Suricata.
```

Fluxo de dados:

1. Wazuh agent (dentro da VM vítima) envia eventos de SO para o Wazuh manager, pela rede isolada do libvirt (porta 1514).
2. Suricata (com network_mode host) inspeciona a ponte do libvirt e o tráfego do host, incluindo os ataques originados nele, e gera alertas (eve.json).
3. Alertas do Suricata são enviados ao Wazuh via logcollector/integração.
4. O Wazuh aplica regras (built-in + custom) e classifica a severidade.
5. Alertas críticos são encaminhados ao Shuffle via webhook (integração no ossec.conf).
6. O Shuffle executa o workflow de resposta (ex.: bloquear IP atacante no firewall do alvo).
7. Todo o histórico fica visível no dashboard do Wazuh.

---

## 4. Modo de execução

Convenção de IDs: T## = atividade (T01 a T56); o ID é nominal, a ordem real de execução é a de (semana, ordem) na seção 6. Frente (infra, detecção, dashboards, resposta, documentação, demo) é rótulo de contexto.

| Aspecto      | Como funciona                                                                                                                                                                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ordem        | Sequência única: T01, T02, T03, ... T56. Atividades dentro da semana seguem a ordem numérica; entre semanas vale o critério de aceite da semana anterior como porta de entrada                                                                 |
| Prioridade   | P0 = requisito do slide ou pré-requisito de algo a jusante, não pode sair. P1 = aprofundamento cortável (T32 Grafana, T43 Metasploit), executado só se a semana fechar em dia                                                                  |
| Máquinas     | Host Linux único (WSL2): stack Docker Compose (Wazuh, Suricata, Shuffle) na máquina SOC e VM Linux (KVM) da vítima em rede isolada do libvirt. Os dois ambientes ficam disponíveis durante todo o semestre e rodam em paralelo na apresentação |
| Dependências | A atividade só pode começar quando todos os pré-requisitos listados estiverem concluídos e aceitos                                                                                                                                             |
| Gate semanal | No fim de cada semana, o "Critério de aceite" da tabela da seção 5 é verificado antes de abrir a semana seguinte                                                                                                                               |
| Carga        | Uma pessoa executa todas as frentes; por isso cada semana tem prioridade e escopo mínimo declarados, e o risco R8 é acompanhado no report                                                                                                      |
| Entrega      | Cada atividade vai em uma branch própria e é integrada após a verificação do critério de aceite; o relatório entra em `docs/reports/` no mesmo commit                                                                                          |
| Idioma       | Código, pastas e nomes de arquivos em inglês; conteúdo dos documentos (docs/) em português                                                                                                                                                     |

---

## 5. Roadmap semanal (visão por acompanhamento)

| Semana | Data  | Objetivo                      | Atividades                         | Critério de aceite                                                             | Escopo mínimo da semana                          |
| ------ | ----- | ----------------------------- | ---------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| 0      | 28/08 | Definições iniciais           | T01, T02                           | Roadmap validado contra o `trabalho.pdf`                                       | (já concluída)                                   |
| 1      | 14/09 | Fundação mínima               | T03, T04, T06, T11                 | Dashboard do Wazuh acessível e stack no ar                                     | Dashboard acessível                              |
| 2      | 21/09 | Vítima e NIDS no ar           | T05, T07, T08, T09, T10, T12 a T17 | Agente Active e replay de pcap gerando alertas no dashboard                    | Agente Active e 1 pcap com alerta visível        |
| 3      | 28/09 | SOAR conectado                | T18 a T23                          | Alerta crítico dispara workflow com ação visível no Shuffle                    | Alerta chegando ao Shuffle e workflow executando |
| 4      | 05/10 | Ataques reais e regras custom | T24 a T29                          | Ataques reais geram alertas com severidade correta; regras custom documentadas | hydra detectado + regra de brute force           |
| 5      | 14/10 | Dashboards                    | T30, T31, T32 (opcional)           | Dashboard navegável com alertas das semanas 1 a 4                              | Dashboard custom com 2 visualizações             |
| 6      | 26/10 | SOAR completo                 | T33 a T38                          | Ataque real interrompido automaticamente                                       | Bloqueio real funcionando com métrica            |
| 7      | 09/11 | Cenário end-to-end            | T39 a T43                          | Cenário completo reproduzível em menos de 10 minutos                           | demo.sh rodando de ponta a ponta                 |
| 8      | 16/11 | Hardening e resiliência       | T44 a T49                          | Reboot a frio funciona; repositório completo                                   | Reboots documentados + repo versionado           |
| 9      | 23/11 | Ensaio e vídeo                | T50 a T52                          | Demo flui sem falhas; vídeo e slides prontos                                   | Ensaio limpo + vídeo                             |
| 10     | 30/11 | Polimento                     | T53 a T56                          | Nada em aberto no roadmap                                                      | Checklist final + ambiente validado              |
| Final  | 05/12 | Apresentação                  | todas                              | Apresentação entregue                                                          | vídeo como plano B                               |

### Semana 0 (28/08/2026): Definições iniciais

Objetivo: planejamento completo do projeto antes da implementação.

Atividades na ordem: T01 (P0): criar o roadmap e as definições iniciais; T02 (P0): validar cada requisito do `trabalho.pdf` contra a matriz de cobertura.

O que já existe desta semana: ROADMAP.md, docs/README.md e docs/reports/TEMPLATE.md (criados em 28/08).

### Acompanhamento 1 (14/09/2026): Fundação mínima

Objetivo: stack no ar e dashboard acessível, pronta para receber o agente. A semana fica restrita ao mínimo que demonstra evolução.

Atividades na ordem: T03 (P0): instalar Docker CE na máquina SOC; T04 (P0): criar a estrutura de pastas e refinar o README; T06 (P0): subir o Wazuh single-node; T11 (P0, gate): validar o dashboard acessível e preparar a narrativa.

O que mostrar no acompanhamento: dashboard do Wazuh acessível, stack versionada no repo e o plano da semana seguinte (VM vítima e agente).

Remanejado para a semana 2: T05, T07, T08, T09 e T10 (virtualização, VM vítima, agente e portas).

### Acompanhamento 2 (21/09/2026): Vítima e NIDS no ar

Objetivo: agente Wazuh Active na VM vítima e Suricata gerando alertas visíveis no dashboard.

Atividades na ordem: T05 (P0): preparar a virtualização e criar a VM vítima; T07 (P0): instalar o SO na VM e liberar o acesso ssh; T08 (P0): liberar portas no firewall; T09 (P0): instalar e registrar o agente na VM; T10 (P0): validar a coleta de logs e o status Active; T12 (P0): subir o Suricata com network_mode host; T13 (P0): baixar pcaps maliciosos e testar em modo pcap; T14 (P0): integrar Suricata ao Wazuh (infraestrutura); T15 (P0): criar o decoder para os eventos do Suricata no Wazuh; T16 (P0): criar as regras de correspondência dos alertas do Suricata; T17 (P0): validar alertas no dashboard.

Se não couber na semana: T16 e T17 descem para a semana 3, junto com o bloco SOAR, mantendo a integração (T14) e o decoder (T15).

### Acompanhamento 3 (28/09/2026): SOAR conectado

Atividades na ordem: T18 (P0): subir o Shuffle standalone com limite de RAM; T19 (P0): configurar serviços frágeis na VM (antecipada da semana 4); T20 (P0): criar o workflow 1 (webhook + parse + ação); T21 (P0): configurar a integração do Wazuh com o Shuffle; T22 (P0): confirmar a chegada de alerta de teste no Shuffle; T23 (P0): testar o workflow com alertas de teste.

### Acompanhamento 4 (05/10/2026): Ataques reais e regras custom

Atividades na ordem: T24 (P0): gerar ataques reais (nmap, hydra); T25 (P0): verificar regras built-in; T26 (P0): criar regra custom de brute force; T27 (P0): criar regra custom de check_ip; T28 (P0): criar regra custom de elevação de malware do Suricata; T29 (P0): rodar simulação de ataques do Wazuh.

Nota de rede: o tráfego de ataque sai da interface da máquina SOC e é visível ao Suricata; tráfego entre as máquinas pode não passar pelo Suricata (ver seção 7, R2). O pipeline NIDS se apoia em replay de pcap; ataques reais alimentam o HIDS.

### Acompanhamento 5 (14/10/2026): Dashboards

Atividades na ordem: T30 (P0): configurar dashboards nativos do Wazuh; T31 (P0): criar as visualizações do dashboard custom (severidade, top IPs, eventos por agente); T32 (P1, opcional): publicar o Grafana com um painel de alertas, apenas se a semana fechar sem pendência.

### Acompanhamento 6 (26/10/2026): SOAR completo

Atividades na ordem: T33 (P0): preparar o acesso SSH por chave à VM vítima; T34 (P0): adicionar o nó de bloqueio real e notificação no workflow; T35 (P0): avaliar o Active Response do Wazuh e decidir a divisão de papéis; T36 (P0): configurar o Active Response escolhido; T37 (P0): montar e exportar o dashboard único do projeto; T38 (P0): testar cenário completo (hydra, alerta, bloqueio, tentativas falhando).

### Acompanhamento 7 (09/11/2026): Cenário end-to-end

Atividades na ordem: T39 (P0): script de demo único; T40 (P0): analisar ruído e falsos negativos e ajustar as regras custom; T41 (P0): re-testar as regras e manter o changelog; T42 (P0): roteiro da demo; T43 (P1, opcional): Metasploit contra serviço vulnerável.

### Acompanhamento 8 (16/11/2026): Hardening e resiliência

Atividades na ordem: T44 (P0): documentar arquitetura final; T45 (P0): verificação técnica da arquitetura contra o ambiente real; T46 (P0): teste de resiliência da máquina SOC (reboot e stack); T47 (P0): teste de resiliência da VM (reboot e reconexão do agente); T48 (P0): reduzir exposição (bind localhost, firewall); T49 (P0): versionar configurações no git.

### Acompanhamento 9 (23/11/2026): Ensaio e vídeo

Atividades na ordem: T50 (P0): ensaio da demo ao vivo; T51 (P0): gravar vídeo de 3 a 5 minutos; T52 (P0): preparar slides.

### Acompanhamento 10 (30/11/2026): Polimento

Atividades na ordem: T53 (P0): verificação final da documentação; T54 (P0): testes finais de workflows e regras; T55 (P0): preparar o ambiente da apresentação final; T56 (P0): preparar respostas para perguntas prováveis.

### Apresentação final (05/12/2026)

Estrutura sugerida: contexto do problema, arquitetura, demo ao vivo ou vídeo (5 a 8 minutos), métricas, lições aprendidas, possíveis evoluções.

---

## 6. Registro detalhado das atividades

Formato por atividade: Semana, Ordem, Prioridade, Pré-requisitos, Descrição, Entregável. A descrição indica os passos concretos; o entregável é o que deve existir ou ser mostrado ao final.

### Semana 0: Definições iniciais

#### T01: Criar o roadmap e as definições iniciais do projeto
- Semana: 0. Ordem: 1. Prioridade: P0. Pré-requisitos: nenhum.
- Descrição: definir arquitetura (duas máquinas, VM vítima, Docker Compose), stack (Wazuh, Suricata, Shuffle), cronograma das 10 semanas, riscos e convenções de idioma; escrever tudo em `ROADMAP.md` (raiz); criar `docs/README.md` (índice e convenções) e `docs/reports/TEMPLATE.md` (modelo de relatório). Concluída em 28/08/2026; relatório em `docs/reports/T01-roadmap.md`. Revisão de 13/09/2026: IDs T## em ordem de execução, prioridade P0/P1 e matriz de cobertura atualizada.
- Entregável: ROADMAP.md e docs base do repositório.

#### T02: Validar o roadmap contra os requisitos oficiais
- Semana: 0. Ordem: 2. Prioridade: P0. Pré-requisitos: T01.
- Descrição: ler o `trabalho.pdf` de ponta a ponta e conferir cada requisito do slide contra a matriz de cobertura (seção 2.1) e contra o calendário; conferir que as 5 camadas, os pesos e as datas estão refletidos; conferir que toda atividade tem pré-requisito existente, entregável e critério de aceite; corrigir as divergências em `docs/open-questions.md` ou na própria tabela. Concluída em 13/09/2026; relatório em `docs/reports/T02-validate-roadmap.md`. Ajustes aplicados: o documento deixou de fixar a distribuição de SO do host e ganhou nota sobre a ordem real de execução.
- Entregável: checklist de validação registrado no relatório, com a matriz de cobertura fechada (nenhum requisito sem atividade).

### Semana 1: Fundação mínima

#### T03: Instalar Docker CE na máquina SOC
- Semana: 1. Ordem: 1. Prioridade: P0. Pré-requisitos: T01, T02.
- Descrição: instalar o Docker CE pelo procedimento oficial da distribuição do host (repositório oficial ou script get.docker.com), com os pacotes docker-ce, docker-ce-cli, containerd.io e docker-compose-plugin; habilitar e iniciar o serviço (`sudo systemctl enable --now docker`); adicionar o usuário ao grupo docker; validar com `docker run hello-world`. Decidir e documentar: usar Docker CE (recomendado) e não podman-compose, para evitar a ambiguidade do R6.
- Entregável: `docker version` funcionando; comando de instalação registrado no README.

#### T04: Criar a estrutura de pastas e refinar o README
- Semana: 1. Ordem: 2. Prioridade: P0. Pré-requisitos: T01.
- Descrição: o repositório público já existe desde a T01; criar as pastas restantes da estrutura (`configs/suricata/`, `configs/wazuh/`, `configs/shuffle/`, `scripts/attacks/`, `scripts/demo/`, `assets/`, ver seção 9), ajustar o `.gitignore` (pcaps grandes, .env com credenciais, certificados do Wazuh) e refinar o README.md (visão geral, arquitetura resumida, como subir).
- Entregável: repositório público clonável com estrutura e README.

#### T06: Subir o Wazuh single-node
- Semana: 1. Ordem: 3. Prioridade: P0. Pré-requisitos: T03.
- Descrição: clonar o repositório oficial wazuh/wazuh-docker; usar a configuração single-node (docker-compose.yml, single-node.yml, indexer cluster menos replicação); gerar os certificados do indexer com o script fornecido; ajustar variáveis (versões, senhas iniciais); `docker compose up -d` e aguardar o indexer ficar healthy (primeira subida demora alguns minutos); acessar o dashboard em https://localhost:443 com as credenciais admin geradas.
- Entregável: dashboard do Wazuh acessível e estável.

#### T11: Gate do acompanhamento 1
- Semana: 1. Ordem: 4. Prioridade: P0. Pré-requisitos: T03, T06.
- Descrição: conferir que a stack sobe com um comando e que o dashboard do Wazuh responde de forma estável; documentar as credenciais de teste do admin (sem segredos reais no repo); preparar a narrativa de 1 minuto do que foi construído (compose, dashboard, decisões) e do que vem na semana seguinte (VM vítima e agente); conferir o critério de aceite da semana antes de abrir a semana 2.
- Entregável: captura do dashboard acessível + narrativa pronta.

### Semana 2: Vítima e NIDS no ar

#### T05: Preparar a virtualização e criar a VM vítima
- Semana: 2. Ordem: 1. Prioridade: P0. Pré-requisitos: T01.
- Descrição: instalar a virtualização na máquina vítima (libvirt + virt-manager, pelo gerenciador de pacotes do host); baixar a ISO de uma distribuição Linux server (LTS); criar a VM com 2GB de RAM, 20GB de disco e rede acessível da máquina SOC (ex.: bridge com IP na rede local, ou NAT com port forward, pois os ataques partem da máquina SOC nas T24, T33, T34 e T38); registrar a spec da VM (recursos, rede, caminho da ISO) para a receita de reprodução.
- Entregável: VM criada no virt-manager com rede acessível da máquina SOC; spec documentada (docs/reports/T05-create-vm.md).

#### T07: Instalar o SO na VM e liberar o acesso ssh
- Semana: 2. Ordem: 2. Prioridade: P0. Pré-requisitos: T05.
- Descrição: instalar a distribuição Linux escolhida na VM, com usuário de teste com sudo; habilitar openssh-server; registrar o IP da VM (fixo via DHCP reservado, se possível) e o acesso ssh; testar o acesso a partir da máquina SOC; snapshot limpo antes de demos.
- Entregável: VM acessível por ssh; IP, credenciais de teste e comandos documentados no repo (docs/reports/T05-create-vm.md).

#### T08: Liberar as portas do Wazuh no firewall da máquina SOC
- Semana: 2. Ordem: 3. Prioridade: P0. Pré-requisitos: T06.
- Descrição: no firewall da máquina SOC (firewalld, ufw ou nftables, conforme a distribuição), liberar 1514/tcp (eventos dos agentes), 1515/tcp (registro/enroll de agentes), 55000/tcp (comunicação de autenticação de agentes, quando aplicável) e 443/tcp (dashboard) apenas para a rede local de lab (zona public ou serviço custom); documentar as regras; validar com nmap a partir da máquina vítima.
- Entregável: portas acessíveis da máquina vítima para a máquina SOC; regras documentadas em `docs/guides/start-wazuh-stack.md`.

#### T09: Instalar e registrar o Wazuh agent na VM
- Semana: 2. Ordem: 4. Prioridade: P0. Pré-requisitos: T07, T06, T08.
- Descrição: adicionar o repositório oficial do Wazuh na VM (apt ou dnf, conforme a distribuição); instalar o pacote wazuh-agent; configurar o endereço do manager no `/var/ossec/etc/ossec.conf` (WAZUH_MANAGER = IP da máquina SOC) e o nome do agente; registrar o agente (enroll com a chave do manager ou com authd na porta 1515); iniciar e habilitar o serviço (`sudo systemctl enable --now wazuh-agent`); conferir o status e o arquivo de chaves em /var/ossec/etc/client.keys.
- Entregável: agente instalado e registrado no manager (client.keys presente, serviço ativo).

#### T10: Validar a coleta de logs e o status Active do agente
- Semana: 2. Ordem: 5. Prioridade: P0. Pré-requisitos: T09.
- Descrição: verificar que o agente coleta os logs de SO padrão (auth.log, syslog) e o syscheck (o que caracteriza o HIDS do slide); confirmar no dashboard que o agente aparece como Active; capturar o primeiro evento como evidência.
- Entregável: agente com status Active no dashboard, enviando eventos.

#### T12: Subir o Suricata em container com network_mode host
- Semana: 2. Ordem: 6. Prioridade: P0. Pré-requisitos: T03.
- Descrição: adicionar ao docker-compose um serviço suricata (imagem jasonish/suricata ou oficial) com `network_mode: host` (obrigatório para sniffar a interface, ver R3); montar volumes para /var/log/suricata (eve.json), /etc/suricata (configuração) e /var/lib/suricata (regras); atualizar as regras na primeira subida (`suricata-update`); configurar o eve.json para emitir também os logs de transação (dns, http, tls, ssh, flow), além de alertas, o que dá ao Suricata o papel de NIDS (detecção por assinatura) + análise de tráfego (NSM) na narrativa do projeto; rodar em modo live apontando para a interface da máquina SOC; conferir que o eve.json está sendo escrito.
- Entregável: container do Suricata rodando com eve.json sendo gravado.

#### T13: Baixar pcaps maliciosos e testar em modo pcap
- Semana: 2. Ordem: 7. Prioridade: P0. Pré-requisitos: T12.
- Descrição: baixar 2 a 3 pcaps públicos de tráfego malicioso (ex.: malware-traffic-analysis.net, amostras de Cobalt Strike, Trickbot, Emotet); salvar em `assets/pcaps/` (fora do controle do git por tamanho, ver .gitignore); registrar no relatório as URLs de download dos pcaps, para reprodução futura a partir de um clone limpo; testar o Suricata em modo replay: `suricata -r arquivo.pcap -l /tmp/suricata-test`; conferir alertas no eve.json/fast.log (ex.: regras ET MALWARE, ET SCAN); registrar o comando de teste reproduzível no README.
- Entregável: comando de replay que gera alertas confirmadas nas regras.

#### T14: Integrar Suricata ao Wazuh (infraestrutura)
- Semana: 2. Ordem: 8. Prioridade: P0. Pré-requisitos: T13, T06.
- Descrição: escolher o caminho de integração e documentar: (a) logcollector do Wazuh manager lendo o eve.json do Suricata montado no container (mais simples), ou (b) syslog do Suricata para o manager; configurar o `localfile` correspondente no ossec.conf do manager; validar que os eventos brutos do Suricata chegam ao Wazuh como eventos do manager (antes de virar alerta). A interpretação do conteúdo fica na T15.
- Entregável: eventos brutos do Suricata chegando ao Wazuh.

#### T15: Criar o decoder para os eventos do Suricata no Wazuh
- Semana: 2. Ordem: 9. Prioridade: P0. Pré-requisitos: T14.
- Descrição: garantir (ou criar) o decoder adequado para os campos do eve.json (timestamp, signature, categoria, src/dst ip e porta); validar que os campos são extraídos corretamente dos eventos brutos do Suricata (testar com um evento real do replay de T13); documentar o decoder em `configs/wazuh/`.
- Entregável: decoder funcionando, com os campos do eve.json extraídos.

#### T16: Criar as regras de correspondência para os alertas do Suricata
- Semana: 2. Ordem: 10. Prioridade: P0. Pré-requisitos: T15.
- Descrição: criar regras de correspondência no Wazuh para as assinaturas do Suricata (ex.: ET MALWARE, ET SCAN) com severidade adequada (nível >= 6 para scans, >= 10 para malware); validar que os eventos viram alertas com os campos corretos (signature, categoria, ip de origem e destino); documentar as regras em `configs/wazuh/`.
- Entregável: regras de correspondência funcionando; alertas do Suricata tipados corretamente no Wazuh.

#### T17: Validar alertas do Suricata no dashboard
- Semana: 2. Ordem: 11. Prioridade: P0. Pré-requisitos: T14, T15, T16.
- Descrição: rodar o replay de pcap de T13 com a integração ativa; confirmar no dashboard do Wazuh alertas do tipo Suricata (ex.: ET MALWARE, ET SCAN) com severidade adequada; capturar um exemplo completo de alerta (JSON) e documentar; registrar os IDs de regra do Wazuh correspondentes.
- Entregável: print do dashboard com alertas do Suricata + amostra JSON documentada.

### Semana 3: SOAR conectado

#### T18: Subir o Shuffle standalone com limite de RAM
- Semana: 3. Ordem: 1. Prioridade: P0. Pré-requisitos: T03.
- Descrição: clonar o repositório shuffle/shuffle-docker; usar o modo standalone (containers de banco, OpenSearch, orbiter e a UI); limitar a RAM dos containers Java (ex.: Xmx de 1 a 2GB para o backend) para manter a stack estável durante a demo (R4); subir com docker compose e aguardar os serviços healthy; acessar a UI em http://localhost/3001 e concluir o setup local (e-mail de teste).
- Entregável: UI do Shuffle acessível e estável.

#### T19: Configurar serviços frágeis na VM vítima
- Semana: 3. Ordem: 2. Prioridade: P0. Pré-requisitos: T07.
- Descrição: na VM, configurar sshd para permitir autenticação por senha; criar usuário de teste com senha fraca (ex.: usuario/teste123); instalar o Apache com uma página de teste; deixar documentado quais serviços estão expostos e por quê; (o serviço vulnerável vsftpd 2.3.4 fica para T43, semana 7). Antecipada da semana 4 para liberar a semana dos ataques.
- Entregável: VM com SSH (senha fraca) e Apache acessíveis pela rede.

#### T20: Criar o workflow 1 no Shuffle
- Semana: 3. Ordem: 3. Prioridade: P0. Pré-requisitos: T18.
- Descrição: criar o workflow "resposta-brute-force": trigger do tipo Webhook; nó de parse do JSON do alerta do Wazuh (extrair ip de origem, rule.id, rule.level, agent.name); ramo condicional por nível de severidade (só prossegue se level >= 12); nó de ação inicial que registra a execução em log (a ação de bloqueio real entra na semana 6); exportar o workflow em JSON para `configs/shuffle/`; documentar a URL do webhook gerada (endpoint local).
- Entregável: workflow com trigger webhook funcional + exportação versionada.

#### T21: Configurar a integração do Wazuh com o Shuffle
- Semana: 3. Ordem: 4. Prioridade: P0. Pré-requisitos: T20, T06.
- Descrição: no ossec.conf do manager, adicionar o bloco de integração `integration` com `name=shuffle` (ou custom), `hook_url` apontando para a URL do webhook do workflow de T20 e `level >= 12`; a URL do webhook gerada na T20 fica registrada no relatório da T20 (docs/reports/); conferir quais regras e níveis devem acionar o SOAR; reiniciar o manager e conferir no log que a integração carregou sem erros.
- Entregável: integração configurada no ossec.conf e manager reiniciado.

#### T22: Confirmar a chegada de alerta de teste no Shuffle
- Semana: 3. Ordem: 5. Prioridade: P0. Pré-requisitos: T21.
- Descrição: gerar um alerta de teste de nível alto e confirmar que chega ao Shuffle como execução do workflow; conferir o histórico de execuções e o log do nó de ação; registrar a evidência (print). O teste profundo do workflow (vários níveis e correções de parse) fica na T23.
- Entregável: alerta crítico do Wazuh aparecendo como execução no Shuffle.

#### T23: Testar o workflow com alertas de teste
- Semana: 3. Ordem: 6. Prioridade: P0. Pré-requisitos: T20, T22.
- Descrição: disparar alertas de teste de vários níveis (baixo e alto) para validar o filtro do ramo condicional; conferir o histórico de execuções no Shuffle e o log do nó de ação; verificar que alertas abaixo do nível não disparam; corrigir o parse do JSON se algum campo vier vazio; registrar a evidência.
- Entregável: execução visível no Shuffle com log da ação + print.

### Semana 4: Ataques reais e regras custom

#### T24: Gerar ataques reais (nmap, hydra)
- Semana: 4. Ordem: 1. Prioridade: P0. Pré-requisitos: T19, T12.
- Descrição: a partir da máquina SOC, executar varredura de rede: `nmap -sS -sV <IP da VM>` e brute force de SSH: `hydra -l usuario -P wordlist ssh://<IP da VM>`; instalar previamente o nmap, o hydra e uma wordlist de senhas (ex.: rockyou) na máquina SOC, se ainda não estiverem instalados; usar o IP e as credenciais da VM documentados no repo (T05, T07, T09 e T10); salvar os comandos em `scripts/attacks/` com comentários; registrar que o tráfego de saída da máquina SOC é visível ao Suricata na própria interface (D7); repetir varreduras em momentos distintos para gerar volume de eventos.
- Entregável: comandos de ataque versionados + tráfego real registrado.

#### T25: Verificar as regras built-in do Wazuh disparando
- Semana: 4. Ordem: 2. Prioridade: P0. Pré-requisitos: T24.
- Descrição: no dashboard, identificar os alertas gerados pelos ataques de T24: falhas de login SSH (regras da família 5710/5720), brute force (família 5710 com contagem), varredura de portas; validar que a severidade está adequada (nível >= 6 para brute force); listar os IDs de regra disparados e o que cada um representa.
- Entregável: lista documentada de IDs de regra e severidades observadas.

#### T26: Criar regra custom de brute force
- Semana: 4. Ordem: 3. Prioridade: P0. Pré-requisitos: T25.
- Descrição: criar regra custom em local_rules.xml (ou via API): N falhas de login em X minutos (ex.: 5 falhas em 5 minutos eleva para nível 10); testar a regra com evento real dos ataques de T24; documentar a regra em `configs/wazuh/`.
- Entregável: regra de brute force testada, funcionando e versionada no repo.

#### T27: Criar regra custom de check_ip
- Semana: 4. Ordem: 4. Prioridade: P0. Pré-requisitos: T25.
- Descrição: criar regra custom: conexão de um IP em lista de indicadores (check_ip ou lista custom) dispara alerta; montar a lista de indicadores de teste; testar com evento real dos ataques de T24; documentar a regra em `configs/wazuh/`.
- Entregável: regra de check_ip testada, funcionando e versionada no repo.

#### T28: Criar regra custom de elevação de malware do Suricata
- Semana: 4. Ordem: 5. Prioridade: P0. Pré-requisitos: T25.
- Descrição: criar regra custom: alerta do Suricata de categoria malware com severidade elevada (nível >= 10); testar com o replay de pcap de T13 (regra ET MALWARE) via integração; documentar a regra em `configs/wazuh/`.
- Entregável: regra de elevação testada, funcionando e versionada no repo.

#### T29: Rodar a simulação de ataques do Wazuh
- Semana: 4. Ordem: 6. Prioridade: P0. Pré-requisitos: T10.
- Descrição: executar o script oficial de simulação de ataques do Wazuh (conjunto de comandos que dispara dezenas de regras HIDS: criação de usuário, alteração de permissões, downloads suspeitos, etc.) na VM com o agente; confirmar no dashboard a variedade de alertas HIDS gerados; salvar o script em `scripts/attacks/`.
- Entregável: conjunto variado de alertas HIDS visíveis no dashboard.

### Semana 5: Dashboards

#### T30: Configurar os dashboards nativos do Wazuh
- Semana: 5. Ordem: 1. Prioridade: P0. Pré-requisitos: T06.
- Descrição: explorar e configurar as visões padrão do Wazuh: Security events (tabela de alertas, seletor por agente), Integrity monitoring (syscheck) e MITRE ATT&CK; ajustar o período de tempo padrão; documentar quais dashboards padrão ficam como base; exportar a configuração (saved objects) para `configs/wazuh/` quando o export for suportado, ou documentar o passo a passo com prints.
- Entregável: dashboards nativos configurados e navegáveis.

#### T31: Criar as visualizações do dashboard custom
- Semana: 5. Ordem: 2. Prioridade: P0. Pré-requisitos: T30, T26, T27, T28.
- Descrição: no OpenSearch/Kibana do Wazuh, criar visualizações: contagem de alertas por severidade (barras), top 10 IPs de origem (tabela), eventos por agente (pizza), linha do tempo de alertas (área); validar que refletem os alertas das semanas 1 a 4; documentar as visualizações criadas (a montagem do dashboard único fica na T37).
- Entregável: visualizações criadas e validadas com dados reais.

#### T32 (opcional): Publicar o Grafana com painel de alertas
- Semana: 5. Ordem: 3. Prioridade: P1 (só executar se as semanas 1 a 5 fecharem sem pendência). Pré-requisitos: T31.
- Descrição: subir o Grafana em container; conectar ao indexer do Wazuh (datasource compatível com OpenSearch) e criar um painel simples com contagem de alertas por severidade e top IPs; exportar o dashboard em JSON para `configs/` e documentar o passo a passo. Timebox: se a integração consumir mais de uma sessão de trabalho, registrar em `docs/open-questions.md` a decisão de manter apenas o dashboard do Wazuh e encerrar a atividade.
- Entregável: painel do Grafana com alertas reais, ou decisão registrada de não seguir com o Grafana.

### Semana 6: SOAR completo

#### T33: Preparar o acesso SSH por chave à VM vítima
- Semana: 6. Ordem: 1. Prioridade: P0. Pré-requisitos: T20, T19.
- Descrição: criar uma chave SSH dedicada (sem passphrase, restrita à VM vítima) e instalá-la na VM; configurar na VM um usuário com sudo sem senha apenas para o comando de bloqueio no firewall (restrito ao bloqueio de IP); testar o acesso SSH por chave a partir da máquina SOC; guardar a chave como segredo no Shuffle (a configuração do segredo fica na T34); documentar o procedimento de criação da chave em `docs/` (segurança da chave é crítica).
- Entregável: acesso SSH por chave funcionando + procedimento documentado.

#### T34: Adicionar o nó de bloqueio real e notificação no workflow
- Semana: 6. Ordem: 2. Prioridade: P0. Pré-requisitos: T33, T20.
- Descrição: no workflow de T20, adicionar o nó de ação de resposta: executar ssh na VM vítima e rodar o comando de bloqueio no firewall do alvo (regra rich do firewalld, nftables ou ufw) bloqueando o IP de origem do alerta; adicionar também uma notificação (email ou chat, ex.: webhook de chat) registrando o alerta e a ação tomada; configurar a chave criada na T33 como segredo no Shuffle; testar o nó isolado com um IP de teste.
- Entregável: workflow executando bloqueio real de IP na VM + notificação.

#### T35: Avaliar o Active Response do Wazuh e decidir a divisão de papéis
- Semana: 6. Ordem: 3. Prioridade: P0. Pré-requisitos: T26, T34.
- Descrição: avaliar o active response nativo do Wazuh (ex.: comando firewall-drop que bloqueia o IP no próprio agente); consultar a exportação do workflow e o relatório da T34 para entender o que o Shuffle já faz; decidir e documentar a divisão de papéis: Active Response como resposta imediata no endpoint (rápida, nativa) e Shuffle como orquestração, notificação e resposta na VM; registrar a decisão em `docs/decisions.md` (arquivo criado nesta atividade).
- Entregável: decisão documentada em `docs/decisions.md`.

#### T36: Configurar o Active Response escolhido
- Semana: 6. Ordem: 4. Prioridade: P0. Pré-requisitos: T35.
- Descrição: configurar o Active Response decidido na T35 (ex.: comando firewall-drop nos grupos de resposta do agente); testar a resposta com um alerta de teste; documentar a configuração em `configs/wazuh/`.
- Entregável: Active Response configurado e validado no agente.

#### T37: Montar e exportar o dashboard único do projeto
- Semana: 6. Ordem: 5. Prioridade: P0. Pré-requisitos: T31, T30.
- Descrição: montar o dashboard único "SOC: Projeto" com as visualizações da T31; ajustar o layout e o período padrão; exportar o dashboard e as visualizações (saved objects) para `configs/wazuh/`, para reprodução a partir de um clone limpo; validar que reflete os alertas das semanas 1 a 5.
- Entregável: dashboard custom navegável com os indicadores do projeto + exportação versionada.

#### T38: Testar o cenário completo de resposta
- Semana: 6. Ordem: 6. Prioridade: P0. Pré-requisitos: T34, T36.
- Descrição: rodar o hydra atacando a VM; observar a cadeia completa: alerta no Wazuh, envio ao Shuffle, execução do workflow, bloqueio do IP na VM, novas tentativas falhando (timeout/refused); medir o tempo entre o início do ataque e o bloqueio; gravar evidência (log + vídeo curto); documentar o resultado com métricas.
- Entregável: ataque real interrompido automaticamente, com evidência e tempo de resposta medido.

### Semana 7: Cenário end-to-end

#### T39: Script de demo único
- Semana: 7. Ordem: 1. Prioridade: P0. Pré-requisitos: T38, T37.
- Descrição: criar `scripts/demo/demo.sh`: um único comando que (a) dispara o ataque (hydra), (b) aguarda a detecção no Wazuh, (c) confirma o bloqueio na VM, (d) imprime um resumo com URLs dos alertas e o tempo decorrido; testar repetidamente até rodar em menos de 10 minutos de ponta a ponta; tratar falhas com mensagens claras.
- Entregável: script de demo reproduzível com resumo ao final.

#### T40: Analisar ruído e falsos negativos e ajustar as regras custom
- Semana: 7. Ordem: 2. Prioridade: P0. Pré-requisitos: T26, T27, T28, T34.
- Descrição: analisar os alertas acumulados (semanas 4 a 6); identificar ruído (ex.: varreduras repetidas, regras custom disparam demais) e falsos negativos (ataques não detectados); ajustar níveis, condições e listas das regras custom (T26, T27 e T28).
- Entregável: lista de ajustes aplicados nas regras.

#### T41: Re-testar as regras e manter o changelog
- Semana: 7. Ordem: 3. Prioridade: P0. Pré-requisitos: T40.
- Descrição: re-testar as regras ajustadas com os ataques de T24 e T38; confirmar que o ruído caiu sem perder detecções; manter um changelog dos ajustes em `configs/wazuh/`.
- Entregável: regras revalidadas + changelog dos ajustes.

#### T42: Roteiro da demo
- Semana: 7. Ordem: 4. Prioridade: P0. Pré-requisitos: T39.
- Descrição: escrever `docs/demo-guide.md`: passo a passo da apresentação com tempos, prints esperados e ordem das falas (arquitetura, decisões e demo técnica); incluir perguntas prováveis e respostas; ensaiar a sequência de fala.
- Entregável: roteiro escrito e cronometrado.

#### T43 (opcional): Metasploit contra serviço vulnerável
- Semana: 7. Ordem: 5. Prioridade: P1. Pré-requisitos: T19, T12.
- Descrição: se houver folga na semana: instalar o vsftpd 2.3.4 (versão com backdoor conhecida) na VM; instalar metasploit-framework na máquina SOC; executar o exploit vsftpd_234_backdoor; confirmar detecção no Suricata e/ou Wazuh (HIDS); se não der tempo, registrar a decisão de pular (a demo já cobre com hydra).
- Entregável: exploit detectado (ou registro da decisão de pular).

### Semana 8: Hardening e resiliência

#### T44: Documentar a arquitetura final
- Semana: 8. Ordem: 1. Prioridade: P0. Pré-requisitos: T37, T41.
- Descrição: escrever `docs/architecture.md`: diagrama final (atualizado), portas abertas, fluxo de dados, decisões (apontando para este roadmap e para `docs/decisions.md`), credenciais de teste (sem segredos reais); atualizar o README com o procedimento de reprodução completo (comandos exatos, ordem, tempo esperado); conferir consistência com o código do repo.
- Entregável: documentação completa e consistente.

#### T45: Verificação técnica da documentação da arquitetura
- Semana: 8. Ordem: 2. Prioridade: P0. Pré-requisitos: T44.
- Descrição: conferir o `docs/architecture.md` contra o ambiente real: diagrama, portas, fluxo de dados e credenciais de teste; apontar divergências (ex.: porta que falta, fluxo descrito errado, versões diferentes) e corrigir; validar que o README reproduz a stack a partir de um clone limpo (máquina ou diretório separado).
- Entregável: checklist de verificação preenchido, com as correções aplicadas.

#### T46: Teste de resiliência da máquina SOC (reboot e stack)
- Semana: 8. Ordem: 3. Prioridade: P0. Pré-requisitos: T06, T10.
- Descrição: garantir `restart: always` nos serviços do compose; reiniciar a máquina SOC e medir o tempo até a stack voltar (indexer healthy, dashboards acessíveis); registrar o teste (tempos, problemas) em `docs/`. O reboot da VM vítima e a reconexão do agente ficam na T47.
- Entregável: reboot a frio da máquina SOC documentado e funcionando sem intervenção.

#### T47: Teste de resiliência da VM (reboot e reconexão do agente)
- Semana: 8. Ordem: 4. Prioridade: P0. Pré-requisitos: T10, T06.
- Descrição: reiniciar a VM vítima a frio; confirmar que o agente reconecta sozinho ao manager (status Active de volta) e que o syscheck re-arma; registrar o teste (tempos, problemas) em `docs/`.
- Entregável: reboot a frio da VM documentado, com o agente reconectando sem intervenção.

#### T48: Reduzir exposição da stack
- Semana: 8. Ordem: 5. Prioridade: P0. Pré-requisitos: T03, T08.
- Descrição: ajustar o compose para bind das portas de administração (dashboard, Shuffle) em 127.0.0.1 quando não precisarem ser acessadas de fora; revisar o firewall da máquina SOC para liberar somente o necessário (1514, 1515 para os agentes); validar com nmap externo que apenas as portas esperadas respondem.
- Entregável: scan externo mostrando somente as portas necessárias.

#### T49: Versionar todas as configurações
- Semana: 8. Ordem: 6. Prioridade: P0. Pré-requisitos: T26, T27, T28, T34.
- Descrição: garantir no git: docker-compose (com .env.example e sem .env real), regras custom do Wazuh, exportação dos workflows do Shuffle, docs e scripts; ajustar .gitignore (pcaps, chaves, certificados, .env); testar a clonagem limpa do repo em outro diretório e seguir o README para confirmar que reproduz.
- Entregável: repositório completo e reproduzível a partir de um clone limpo.

### Semana 9: Ensaio e vídeo

#### T50: Ensaio da demo ao vivo
- Semana: 9. Ordem: 1. Prioridade: P0. Pré-requisitos: T39.
- Descrição: rodar a demo completa (demo.sh) sem roteiro em mãos, com as duas máquinas em rede; cronometrar e anotar pontos de falha; repetir até duas execuções seguidas sem falhas; validar que os prints e URLs do roteiro correspondem à realidade.
- Entregável: duas execuções limpas e consecutivas.

#### T51: Gravar vídeo de 3 a 5 minutos
- Semana: 9. Ordem: 2. Prioridade: P0. Pré-requisitos: T50.
- Descrição: gravar com OBS (ou ferramenta de captura do host): arquitetura em 30s, ataque, detecção e resposta em 2 a 3 minutos, métricas (volume de alertas, tempo de resposta) em 30s; salvar em `assets/demo.mp4` (e/ou subir no YouTube não listado para o link no slide); conferir áudio e legibilidade dos terminais.
- Entregável: vídeo de 3 a 5 minutos salvo e acessível.

#### T52: Preparar os slides
- Semana: 9. Ordem: 3. Prioridade: P0. Pré-requisitos: T44, T39.
- Descrição: montar deck de 8 a 10 slides: problema e motivação, arquitetura, decisões e porquês, demo com link do vídeo, métricas e lições aprendidas, possíveis evoluções; alinhar com o roteiro de T42.
- Entregável: deck final revisado.

### Semana 10: Polimento

#### T53: Verificação final da documentação
- Semana: 10. Ordem: 1. Prioridade: P0. Pré-requisitos: T44.
- Descrição: revisar README, arquitetura, decisões e este roadmap: consistência, diagramas, comandos; conferir que os comandos do README funcionam a partir do zero (se possível, teste em máquina limpa ou container); corrigir ortografia e referências cruzadas.
- Entregável: documentação sem pendências.

#### T54: Testes finais de workflows e regras
- Semana: 10. Ordem: 2. Prioridade: P0. Pré-requisitos: T38, T41.
- Descrição: reexecutar o checklist completo: replay de pcap (T13), simulação de ataques (T29), ataques reais (T24), resposta automática (T38) e demo única (T39); confirmar que todos os alertas e ações ainda funcionam após o hardening da semana 8; registrar o resultado.
- Entregável: checklist de fechamento 100% verificado.

#### T55: Preparar o ambiente da apresentação final
- Semana: 10. Ordem: 3. Prioridade: P0. Pré-requisitos: T54.
- Descrição: validar o ambiente onde a apresentação vai acontecer (sala do lab ou sala de aula): rede disponível para as duas máquinas se comunicarem, projetor/monitor, tomada e adaptador para as duas máquinas; deixar o vídeo da demo acessível offline (arquivo local) como reserva para falha de rede; conferir que a máquina SOC sobe a stack em menos de 15 minutos; definir um plano B (ex.: vídeo no lugar da demo ao vivo, ou a VM vítima na própria máquina SOC) e registrar em `docs/demo-guide.md`.
- Entregável: ambiente validado e plano B registrado.

#### T56: Preparar respostas para perguntas prováveis
- Semana: 10. Ordem: 4. Prioridade: P0. Pré-requisitos: T44.
- Descrição: rascunhar respostas curtas para: por que Wazuh (3 caixas do slide em um serviço), por que Suricata (alertas nativos + replay de pcap), como o SOAR executa ações (webhook, workflow, ssh), o que é replay de pcap, o que acontece num reboot, por que a solução roda em duas máquinas; deixar o documento em `docs/faq.md`.
- Entregável: documento de respostas pronto para as perguntas prováveis da arguição.

---

## 7. Riscos e mitigações

| #   | Risco                                                                                        | Impacto                                   | Mitigação                                                                                                                                                                                                                                             |
| --- | -------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | Primeira entrega em 14/09 (Acompanhamento 1)                                                 | Primeira entrega sem demonstração prática | Semana 1 restrita à fundação mínima (stack no ar e dashboard acessível); T05, T07, T08, T09 e T10 remanejadas para a semana 2, com escopo mínimo da semana                                                                                            |
| R2  | WiFi com isolamento de cliente (AP isolation) esconde o tráfego entre as máquinas            | Suricata não vê ataques reais             | Ataques originados na própria máquina SOC são sempre visíveis ao Suricata (tráfego de saída da própria interface); NIDS complementado por replay de pcap; as duas máquinas estão sempre disponíveis, então cabe cabo direto ou hotspot da máquina SOC |
| R3  | Suricata em container não enxerga a interface                                                | NIDS cego                                 | network_mode host é obrigatório; validar na semana 2 (T12)                                                                                                                                                                                            |
| R4  | Shuffle pesado (Java) desestabiliza a stack                                                  | Stack instável durante a demo             | Limitar RAM do container (Xmx) na T18; Wazuh tem prioridade                                                                                                                                                                                           |
| R5  | Regras padrão do Wazuh geram ruído (falsos positivos)                                        | Dashboard poluído, demo confusa           | Regras custom ajustadas na semana 4 (T26, T27 e T28) e revisadas na semana 7 (T40 e T41)                                                                                                                                                              |
| R6  | Ambiguidade entre Docker CE e podman-compose no host Linux                                   | Fricção e incompatibilidade               | Escolher Docker CE na semana 1 (T03) e documentar; não misturar                                                                                                                                                                                       |
| R7  | Falha na integração Wazuh, Shuffle (webhook)                                                 | SOAR não dispara                          | Fallback: Active Response nativo do Wazuh como camada de resposta independente (T35 e T36)                                                                                                                                                            |
| R8  | Carga concentrada em uma pessoa por semana                                                   | Semana travada e entrega atrasada         | Prioridade P0/P1 por atividade, escopo mínimo da semana (seção 5); as atividades P1 (T32, T43) saem antes das P0; o report semanal registra os desvios                                                                                                |
| R9  | Apresentação depende das duas máquinas em rede                                               | Demo não roda na hora                     | T55 valida sala, rede e tomadas com antecedência; vídeo offline como plano B; alternativa documentada de rodar a VM vítima na própria máquina SOC                                                                                                     |

---

## 8. Perguntas em aberto

As perguntas em aberto ficam em `docs/open-questions.md`; as resolvidas viram decisões registradas em `docs/decisions.md` (criado na T35). Histórico já resolvido:

1. Acompanhamento com demo ao vivo e repositório público (GitHub).
2. Vítima em VM (KVM) na máquina vítima, ambiente isolado do uso diário.
3. Escopo do projeto: individual, com IDs T## em ordem de execução, prioridade P0/P1, gate de aceite por semana e matriz de cobertura.
4. Máquinas: as duas ficam disponíveis durante todo o semestre e podem rodar em paralelo na apresentação; o Grafana entra como atividade opcional (T32).

---

## 9. Estrutura futura do repositório (planejada, ainda não criada)

```
soc-siem-lab/
├── README.md            # visão geral, arquitetura, como subir
├── docker-compose.yml   # Wazuh, Suricata, Shuffle
├── docs/                # documentos em português
│   ├── README.md        # índice e convenções dos docs
│   ├── reports/         # relatórios por atividade (1 por atividade)
│   ├── guides/          # guias passo a passo de reprodução
│   └── ...              # architecture, decisions, demo-guide, faq
├── configs/
│   ├── suricata/        # regras custom, integração com Wazuh
│   ├── wazuh/           # regras custom, ossec.conf, integração Shuffle
│   └── shuffle/         # exportação dos workflows
├── scripts/
│   ├── attacks/         # nmap, hydra, simulação do Wazuh
│   └── demo/            # script único do cenário end-to-end
└── assets/              # pcaps, prints, vídeo da demo
```
