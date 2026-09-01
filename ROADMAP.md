# Roadmap do Projeto: Ambiente SOC/SIEM Open-Source

Disciplina: Tópicos Especiais em Segurança (UECE), prof. Rafael L. Gomes.
Curso: PPGCC (Programa de Pós-Graduação em Ciência da Computação), UECE.
Equipe: Jessica e Malu.
Data de criação: 28/08/2026.

---

## 1. Contexto e avaliação

A disciplina tem 3 componentes de nota:

| Componente | Peso | O que é |
|---|---|---|
| Seminário | 0,3 | Fora do escopo deste roadmap (tratado em separado) |
| Acompanhamento semanal | 0,3 | Report individual do status da implementação, toda segunda-feira, 10 encontros |
| Projeto | 0,4 | Ambiente SOC/SIEM open-source, equipe de até 4, com apresentação final |

Requisitos oficiais da disciplina: `trabalho.pdf` (raiz do repositório). A matriz de cobertura (seção 2.1) rastreia cada requisito do PDF para as atividades do roadmap.

O projeto exige 5 camadas, conforme o slide da disciplina:

1. HIDS: coleta de logs do SO (Wazuh, Auditd, OSSEC ou Velociraptor)
2. NIDS: inspeção de pacotes e rede (Suricata, Zeek ou Snort)
3. SIEM: gestão de eventos de host e rede (Wazuh ou Graylog)
4. SOAR: recebe alertas e executa ações (Shuffle)
5. Dashboards: exibição de eventos (Grafana ou Kibana)

Datas-chave do calendário da disciplina:

| Data | Evento |
|---|---|
| 14/09/2026 | Acompanhamento 1 |
| 21/09/2026 | Acompanhamento 2 |
| 28/09/2026 | Acompanhamento 3 |
| 05/10/2026 | Acompanhamento 4 |
| 14/10/2026 | Acompanhamento 5 |
| 26/10/2026 | Acompanhamento 6 |
| 09/11/2026 | Acompanhamento 7 |
| 16/11/2026 | Acompanhamento 8 |
| 23/11/2026 | Acompanhamento 9 |
| 30/11/2026 | Acompanhamento 10 |
| 05/12/2026 | Apresentação final das soluções |

---

## 2. Decisões de arquitetura e justificativas

| # | Decisão | Escolha | Justificativa | Alternativas rejeitadas |
|---|---|---|---|---|
| D1 | Infraestrutura | Docker Compose no Notebook 1 (Fedora, 16GB RAM) | Reproduzível, versionável no git, reset rápido para demo, alinhado à experiência da equipe | VMs para a stack (overhead de gerenciamento sem ganho; a VM fica reservada à vítima), cloud (custo e fricção), WSL2 (problemas conhecidos com Wazuh/systemd) |
| D2 | HIDS + SIEM + Dashboards | Wazuh (manager + indexer + dashboard) | Um único serviço cobre 3 caixas do slide; comunidade grande; regras prontas; script oficial de simulação de ataques para demo | Graylog (não faz HIDS, exigiria OSSEC/Auditd separado), OSSEC (mais antigo, sem dashboard moderno), Velociraptor (foco forense, não SIEM em tempo real), Auditd (só Linux e sem dashboard) |
| D3 | NIDS | Suricata | Alertas nativos, regras atualizadas, melhor suporte a replay de pcap (padrão de teste de IDS); roda em container com network_mode host para sniffar a interface | Zeek (gera metadata/logs, não alertas nativos), Snort (mais datado, regras legacy) |
| D4 | SOAR | Shuffle | Única opção listada no slide; open-source; workflows visuais; integra com Wazuh via webhook | Nenhuma (obrigatória) |
| D5 | Dashboards extras | Grafana (descartado com 8GB livres; reavaliar só se sobrar RAM) | O dashboard do Wazuh (fork do Kibana) já cobre a exigência do slide; com 8GB confirmados, Grafana disputaria RAM com o Shuffle | Kibana (o Wazuh dashboard já é um fork dele) |
| D6 | Alvo monitorado | VM Ubuntu (KVM) no Notebook 2 como vítima | Os notebooks são de uso pessoal e a RAM não é garantida: a VM isola o ambiente de ataque do uso diário, é descartável (snapshot/reset) e mantém o Notebook 2 utilizável; KVM é nativo do Fedora e leve (2 a 3GB) | Vítima instalada direto no Fedora do Notebook 2 (suja a máquina pessoal e disputa recursos com o uso diário) |
| D7 | Geração de detecção NIDS | Replay de pcaps maliciosos (malware-traffic-analysis.net) + ataques originados no Notebook 1 | Padrão da indústria para testar regras de IDS; alertas determinísticos; ataques do próprio SOC são visíveis ao Suricata (tráfego de saída da própria interface), imunes a AP isolation | Confiar só no tráfego entre notebooks (WiFi com AP isolation pode esconder o tráfego dos dois sentidos) |
| D8 | Geração de detecção HIDS | Ataques reais (nmap, hydra) contra a VM vítima + script de simulação do Wazuh | Prova o agente, as regras e o pipeline de ponta a ponta | Só simulação (menos convincente na demo) |
| D9 | SOAR como diferencial | Workflow: alerta crítico do Wazuh dispara bloqueio do IP atacante | É a camada que poucas equipes entregam funcionando; vira o destaque da apresentação final | SOAR só notificando (sem ação, não cumpre "executa ações") |
| D10 | Divisão de trabalho | Jessica: infra, pipeline (Suricata, Shuffle, integrações de infra), ataques, documentação e versionamento. Malu: vítima (VM e agente), conteúdo de detecção (regras, decoders), integração Wazuh, dashboards, revisões | Cada um no que tem mais fluência; a divisão foi ajustada para equilibrar a carga e garantir que as duas tenham atividades em todas as semanas, já que o acompanhamento é avaliado individualmente | Divisão por caixa do slide (gera gargalo de quem domina menos) |

### 2.1 Cobertura dos requisitos do slide

Matriz de rastreabilidade entre o que o slide da disciplina exige e as atividades do roadmap. Serve para conferir, em qualquer semana, que nenhum requisito está descoberto.

| Requisito do slide | Atividades que o cumprem | Semanas |
|---|---|---|
| Equipe integrada (até 4 alunos) | J0, M0 (definições iniciais) e divisão de atividades por pessoa | 0 |
| HIDS: coleta de logs de SO | M2a/M2b (agente + coleta de logs), J13 (simulação de ataques), M7, M14, M15 e M10a/M10b (regras) | 1, 4, 7 |
| NIDS: inspeção de pacotes e rede | J5 (modo live), J6 (replay de pcap), J7, M4 e M13 (eventos no SIEM), M3 (validação) | 2 |
| SIEM: gestão de eventos de host e rede | J3 (manager), M3 (eventos de rede no dashboard), M8 (visualização) | 1, 2, 5 |
| SOAR: recebe alertas e executa ações | J8, J9 (workflow), M5a/M5b (integração Wazuh), J15, J27 e J16 (bloqueio real de IP) | 3, 6 |
| Dashboards: exibição de eventos | J14 (nativos), M8 (visualizações) e M16 (dashboard único), via dashboard do Wazuh (fork do Kibana, ver D5) | 5, 6 |
| Acompanhamento semanal: report individual | docs/reports/ e bullets de "Acompanhamento" (docs/README.md) | todas |
| Apresentação das Soluções (05/12) | A2, J24, A3, J26, A4 | 9, 10 |

---

## 3. Arquitetura da solução

```
                      Rede local (WiFi ou cabo)
   +--------------------------+        +--------------------------+
   |  Notebook 1 (SOC)        |        |  Notebook 2 (host da     |
   |  Fedora, 16GB            |        |  vítima), Fedora         |
   |  Docker Compose:         |        |  VM Ubuntu (KVM):        |
   |  - Wazuh manager+indexer |<-------|  - Wazuh agent           |
   |  - Wazuh dashboard       | agent  |  - SSH com senha fraca   |
   |  - Suricata (host net)   | 1514   |  - Serviços frágeis      |
   |  - Shuffle (SOAR)        |        |                          |
   +------------^-------------+        +------------^-------------+
                |                            ^
        alertas |                            | ataques reais (nmap,
        (webhook)|                           | hydra, metasploit
                |                            | opcional): originados
                |                            | no Notebook 1 (SOC),
                |                            | visíveis ao Suricata na
                |                            | própria interface
   +------------+-------------+              |
   | Os 2 notebooks são da    +--------------+
   | equipe (1 por pessoa).   |  Notebook 2: a VM vítima
   | O Notebook 1 (SOC) é a   |  envia eventos de SO ao
   | origem dos ataques       |  agente Wazuh (HIDS)
   +--------------------------+
```

Fluxo de dados:

1. Wazuh agent (dentro da VM no Notebook 2) envia eventos de SO para o Wazuh manager (porta 1514).
2. Suricata (Notebook 1) inspeciona o tráfego local, incluindo os ataques originados no próprio Notebook 1, e gera alertas (eve.json).
3. Alertas do Suricata são enviados ao Wazuh via logcollector/integração.
4. O Wazuh aplica regras (built-in + custom) e classifica a severidade.
5. Alertas críticos são encaminhados ao Shuffle via webhook (integração no ossec.conf).
6. O Shuffle executa o workflow de resposta (ex.: bloquear IP atacante no firewall do alvo).
7. Todo o histórico fica visível no dashboard do Wazuh.

---

## 4. Papéis da equipe

Convenção de IDs: J## = atividade da Jessica, M## = atividade da Malu, A## = atividade conjunta.

| Pessoa | Notebook | Responsabilidades |
|---|---|---|
| Jessica | Notebook 1 (SOC) | Docker Compose base, Suricata e Shuffle (infra e workflows), integrações de infra (logcollector, webhook), rede, scripts de ataque e de demo, documentação e versionamento, vídeo |
| Malu | Notebook 2 (host da VM vítima) | VM vítima e agente Wazuh, conteúdo de detecção (regras, decoders), integração Wazuh (regras e política de acionamento), dashboard custom, revisões |

Atividades conjuntas: verificação do acompanhamento 1 (A1), ensaio da demo (A2), slides (A3), respostas para perguntas (A4).

Regra de dependência: a atividade só pode começar quando todos os pré-requisitos (IDs listados) estiverem concluídos e aceitos. Dentro de uma semana, as atividades seguem a ordem numérica; entre semanas, vale o critério de aceite da semana anterior como porta de entrada.

Regra de presença semanal: cada integrante tem pelo menos uma atividade em todas as semanas, porque o acompanhamento é avaliado individualmente.

Regra de idioma: código, pastas e nomes de arquivos em inglês; o conteúdo dos documentos (docs/) em português.

---

## 5. Roadmap semanal (visão por acompanhamento)

| Semana | Data | Objetivo | Atividades | Critério de aceite |
|---|---|---|---|---|
| 0 | 28/08 | Definições iniciais | J0, M0 | Roadmap validado pelas duas |
| 1 | 14/09 | Fundação | J1, J2, M1a, M1b, J3, J4, M2a, M2b, A1 | Dashboard acessível, agente Active, 1 evento visível |
| 2 | 21/09 | NIDS no ar | J5, J6, J7, M4, M13, M3 | Replay de pcap gera alertas do Suricata no dashboard |
| 3 | 28/09 | SOAR conectado | J8, M6, J9, M5a, M5b, J10 | Alerta crítico dispara workflow com ação visível no Shuffle |
| 4 | 05/10 | Ataques reais e regras custom | J11, J12, M7, M14, M15, J13 | Ataques reais geram alertas com severidade correta; regras custom documentadas |
| 5 | 14/10 | Dashboards | J14, M8 | Dashboard navegável com alertas das semanas 1 a 4 |
| 6 | 26/10 | SOAR completo | J15, J27, M9a, M9b, M16, J16 | Ataque real interrompido automaticamente |
| 7 | 09/11 | Cenário end-to-end | J17, M10a, M10b, J19, J18 (opcional) | Cenário completo reproduzível em menos de 10 minutos |
| 8 | 16/11 | Hardening e resiliência | J20, M11, J21, M17, J22, J23 | Reboot a frio funciona; repositório completo |
| 9 | 23/11 | Ensaio e vídeo | A2, J24, A3 | Demo flui sem falhas; vídeo e slides prontos |
| 10 | 30/11 | Polimento | M12, J25, J26, A4 | Nada em aberto no roadmap |
| Final | 05/12 | Apresentação | todas | Apresentação entregue |

### Semana 0 (28/08/2026): Definições iniciais

Objetivo: planejamento completo do projeto antes da implementação.

Atividades na ordem: J0 (Jessica): criar o roadmap e as definições iniciais; M0 (Malu): revisar e validar o roadmap.

O que já existe desta semana: ROADMAP.md, docs/README.md e docs/reports/TEMPLATE.md (criados em 28/08).

### Acompanhamento 1 (14/09/2026): Fundação

Objetivo: stack mínima rodando, Wazuh com 1 agente ativo.

Atividades na ordem: J1 (Jessica): instalar Docker CE no Notebook 1; J2 (Jessica): criar repositório git público + estrutura; M1a (Malu): preparar a virtualização e criar a VM vítima (em paralelo com J1 a J3, pois são máquinas diferentes); J3 (Jessica): subir o Wazuh single-node; M1b (Malu): instalar o SO na VM e liberar o acesso ssh; J4 (Jessica): liberar portas no firewalld; M2a (Malu): instalar e registrar o agente na VM; M2b (Malu): validar a coleta de logs e o status Active; A1 (conjunta): verificar agente Active + eventos.

O que mostrar no acompanhamento: docker compose up funcionando, dashboard com o agente ativo.

### Acompanhamento 2 (21/09/2026): NIDS no ar

Atividades na ordem: J5 (Jessica): subir o Suricata com network_mode host; J6 (Jessica): baixar pcaps maliciosos e testar em modo pcap; J7 (Jessica): integrar Suricata ao Wazuh (infraestrutura); M4 (Malu): criar o decoder para os eventos do Suricata no Wazuh; M13 (Malu): criar as regras de correspondência dos alertas do Suricata; M3 (Malu): validar alertas no dashboard.

### Acompanhamento 3 (28/09/2026): SOAR conectado

Atividades na ordem: J8 (Jessica): subir o Shuffle standalone com limite de RAM; M6 (Malu): configurar serviços frágeis na VM (antecipada da semana 4); J9 (Jessica): criar o workflow 1 (webhook + parse + ação); M5a (Malu): configurar a integração do Wazuh com o Shuffle; M5b (Malu): confirmar a chegada de alerta de teste no Shuffle; J10 (Jessica): testar o workflow com alertas de teste.

### Acompanhamento 4 (05/10/2026): Ataques reais e regras custom

Atividades na ordem: J11 (Jessica): gerar ataques reais (nmap, hydra); J12 (Jessica): verificar regras built-in; M7 (Malu): criar regra custom de brute force; M14 (Malu): criar regra custom de check_ip; M15 (Malu): criar regra custom de elevação de malware do Suricata; J13 (Jessica): rodar simulação de ataques do Wazuh.

Nota de rede: o tráfego de ataque sai da interface do Notebook 1 e é visível ao Suricata; tráfego entre notebooks pode não passar pelo Suricata (ver seção 7, R2). O pipeline NIDS se apoia em replay de pcap; ataques reais alimentam o HIDS.

### Acompanhamento 5 (14/10/2026): Dashboards

Atividades na ordem: J14 (Jessica): configurar dashboards nativos do Wazuh; M8 (Malu): criar as visualizações do dashboard custom (severidade, top IPs, eventos por agente). Grafana fica de fora (D5).

### Acompanhamento 6 (26/10/2026): SOAR completo

Atividades na ordem: J15 (Jessica): preparar o acesso SSH por chave à VM vítima; J27 (Jessica): adicionar o nó de bloqueio real e notificação no workflow; M9a (Malu): avaliar o Active Response do Wazuh e decidir a divisão de papéis; M9b (Malu): configurar o Active Response escolhido; M16 (Malu): montar e exportar o dashboard único do projeto; J16 (Jessica): testar cenário completo (hydra, alerta, bloqueio, tentativas falhando).

### Acompanhamento 7 (09/11/2026): Cenário end-to-end

Atividades na ordem: J17 (Jessica): script de demo único; M10a (Malu): analisar ruído e falsos negativos e ajustar as regras custom; M10b (Malu): re-testar as regras e manter o changelog; J19 (Jessica): roteiro da demo; J18 (Jessica, opcional): Metasploit contra serviço vulnerável.

### Acompanhamento 8 (16/11/2026): Hardening e resiliência

Atividades na ordem: J20 (Jessica): documentar arquitetura final; M11 (Malu): revisão técnica da arquitetura; J21 (Jessica): teste de resiliência do Notebook 1 (reboot e stack); M17 (Malu): teste de resiliência da VM (reboot e reconexão do agente); J22 (Jessica): reduzir exposição (bind localhost, firewalld); J23 (Jessica): versionar configurações no git.

### Acompanhamento 9 (23/11/2026): Ensaio e vídeo

Atividades na ordem: A2 (conjunta): ensaio da demo ao vivo; J24 (Jessica): gravar vídeo de 3 a 5 minutos; A3 (conjunta): preparar slides.

### Acompanhamento 10 (30/11/2026): Polimento

Atividades na ordem: M12 (Malu): revisão final da documentação; J25 (Jessica): testes finais de workflows e regras; J26 (Jessica): preparar o ambiente da apresentação final; A4 (conjunta): preparar respostas para perguntas prováveis.

### Apresentação final (05/12/2026)

Estrutura sugerida: contexto do problema, arquitetura, demo ao vivo ou vídeo (5 a 8 minutos), métricas, lições aprendidas, possíveis evoluções.

---

## 6. Registro detalhado das atividades

Formato por atividade: Semana, Ordem, Dono, Pré-requisitos, Descrição, Entregável. A descrição indica os passos concretos; o entregável é o que deve existir ou ser mostrado ao final.

### Semana 0: Definições iniciais

#### J0: Criar o roadmap e as definições iniciais do projeto
- Semana: 0. Ordem: 1. Dono: Jessica. Pré-requisitos: nenhum.
- Descrição: definir com a equipe (e com o apoio da ferramenta de IA): arquitetura (2 notebooks, VM vítima, Docker Compose), stack (Wazuh, Suricata, Shuffle), divisão de trabalho, cronograma das 10 semanas, riscos e convenções de idioma; escrever tudo em `ROADMAP.md` (raiz); criar `docs/README.md` (índice e convenções) e `docs/reports/TEMPLATE.md` (modelo de relatório). Concluída em 28/08/2026; relatório em `docs/reports/J0-roadmap.md`.
- Entregável: ROADMAP.md validado e docs base do repositório.

#### M0: Revisar e validar o roadmap e as definições iniciais
- Semana: 0. Ordem: 2. Dono: Malu. Pré-requisitos: J0.
- Descrição: ler o ROADMAP.md por completo; validar arquitetura, stack, divisão de atividades (incluindo a própria presença semanal), cronograma e riscos; apontar divergências ou sugestões no review do pull request; registrar correções em `docs/open-questions.md` ou como ajuste pontual nos docs, se necessário.
- Entregável: roadmap aprovado pelas duas, registrado no review do pull request. Não gera relatório (revisão de pull request).

### Semana 1: Fundação

#### J1: Instalar Docker CE no Notebook 1
- Semana: 1. Ordem: 1. Dono: Jessica. Pré-requisitos: nenhum.
- Descrição: habilitar o repositório docker-ce no dnf (`sudo dnf config-manager addrepo` para o repositório oficial docker-ce), instalar os pacotes docker-ce, docker-ce-cli, containerd.io e docker-compose-plugin; habilitar e iniciar o serviço (`sudo systemctl enable --now docker`); adicionar o usuário ao grupo docker; validar com `docker run hello-world`. Decidir e documentar: usar Docker CE (recomendado) e não podman-compose, para evitar a ambiguidade do R6.
- Entregável: `docker version` funcionando; comando de instalação registrado no README.

#### J2: Criar repositório git público e estrutura de pastas
- Semana: 1. Ordem: 2. Dono: Jessica. Pré-requisitos: nenhum.
- Descrição: criar repositório público no GitHub (nome: soc-siem-lab); `git init` no projeto; ajustar o `.gitignore` criado na semana 0 (pcaps grandes, .env com credenciais, certificados do Wazuh); refinar o README.md criado na semana 0 (visão geral, arquitetura resumida, como subir); criar as pastas restantes da estrutura: `configs/suricata/`, `configs/wazuh/`, `configs/shuffle/`, `scripts/attacks/`, `scripts/demo/`, `assets/` (ver seção 9).
- Entregável: repositório público clonável com estrutura e README.

#### M1a: Preparar a virtualização e criar a VM vítima
- Semana: 1. Ordem: 3. Dono: Malu. Pré-requisitos: nenhum.
- Descrição: instalar o grupo de virtualização no Fedora do Notebook 2 (`sudo dnf groupinstall virtualization`, libvirt + virt-manager); baixar a ISO do Ubuntu Server LTS; criar a VM com 2GB de RAM, 20GB de disco e rede acessível do Notebook 1 (ex.: bridge com IP na rede local, ou NAT com port forward, pois os ataques partem do Notebook 1 nas J11, J15, J27 e J16); registrar a spec da VM (recursos, rede, caminho da ISO) para a receita de reprodução. Pode rodar em paralelo com as atividades da Jessica (J1 a J3), pois são máquinas diferentes.
- Entregável: VM criada no virt-manager com rede acessível do Notebook 1; spec documentada (docs/reports/M1-create-vm.md).

#### J3: Subir o Wazuh single-node
- Semana: 1. Ordem: 4. Dono: Jessica. Pré-requisitos: J1.
- Descrição: clonar o repositório oficial wazuh/wazuh-docker; usar a configuração single-node (docker-compose.yml, single-node.yml, indexer cluster menos replicação); gerar os certificados do indexer com o script fornecido; ajustar variáveis (versões, senhas iniciais); `docker compose up -d` e aguardar o indexer ficar healthy (primeira subida demora alguns minutos); acessar o dashboard em https://localhost:443 com as credenciais admin geradas.
- Entregável: dashboard do Wazuh acessível e estável.

#### M1b: Instalar o SO na VM e liberar o acesso ssh
- Semana: 1. Ordem: 5. Dono: Malu. Pré-requisitos: M1a.
- Descrição: instalar o Ubuntu Server na VM com usuário de teste com sudo; habilitar openssh-server; registrar o IP da VM (fixo via DHCP reservado, se possível) e o acesso ssh; testar o acesso a partir do Notebook 1; snapshot limpo antes de demos.
- Entregável: VM acessível por ssh; IP, credenciais de teste e comandos documentados no repo (docs/reports/M1-create-vm.md).

#### J4: Liberar as portas do Wazuh no firewalld do Notebook 1
- Semana: 1. Ordem: 6. Dono: Jessica. Pré-requisitos: J3.
- Descrição: no firewalld do Notebook 1, liberar 1514/tcp (eventos dos agentes), 1515/tcp (registro/enroll de agentes), 55000/tcp (comunicação de autenticação de agentes, quando aplicável) e 443/tcp (dashboard) apenas para a rede local de lab (zona public ou serviço custom); documentar as regras; validar com nmap a partir do Notebook 2.
- Entregável: portas acessíveis do Notebook 2 para o Notebook 1; regras documentadas no README.

#### M2a: Instalar e registrar o Wazuh agent na VM
- Semana: 1. Ordem: 7. Dono: Malu. Pré-requisitos: M1b, J3, J4.
- Descrição: adicionar o repositório oficial do Wazuh no Ubuntu da VM; instalar o pacote wazuh-agent; configurar o endereço do manager no `/var/ossec/etc/ossec.conf` (WAZUH_MANAGER = IP do Notebook 1) e o nome do agente; registrar o agente (enroll com a chave do manager ou com authd na porta 1515); iniciar e habilitar o serviço (`sudo systemctl enable --now wazuh-agent`); conferir o status e o arquivo de chaves em /var/ossec/etc/client.keys.
- Entregável: agente instalado e registrado no manager (client.keys presente, serviço ativo).

#### M2b: Validar a coleta de logs e o status Active do agente
- Semana: 1. Ordem: 8. Dono: Malu. Pré-requisitos: M2a.
- Descrição: verificar que o agente coleta os logs de SO padrão (auth.log, syslog) e o syscheck (o que caracteriza o HIDS do slide); confirmar no dashboard que o agente aparece como Active; capturar o primeiro evento como evidência.
- Entregável: agente com status Active no dashboard, enviando eventos.

#### A1: Verificação conjunta do acompanhamento 1
- Semana: 1. Ordem: 9. Dono: Jessica e Malu. Pré-requisitos: J3, M2b.
- Descrição: juntas, validar no dashboard: agente Active, primeiros eventos de syscheck e de conectividade; definir e documentar as credenciais de teste (sem segredos reais no repo); preparar a narrativa de 1 minuto do que foi construído (compose, agente, dashboard) para apresentar ao professor.
- Entregável: captura do dashboard com agente Active + narrativa pronta.

### Semana 2: NIDS no ar

#### J5: Subir o Suricata em container com network_mode host
- Semana: 2. Ordem: 1. Dono: Jessica. Pré-requisitos: J1.
- Descrição: adicionar ao docker-compose um serviço suricata (imagem jasonish/suricata ou oficial) com `network_mode: host` (obrigatório para sniffar a interface, ver R3); montar volumes para /var/log/suricata (eve.json), /etc/suricata (configuração) e /var/lib/suricata (regras); atualizar as regras na primeira subida (`suricata-update`); configurar o eve.json para emitir também os logs de transação (dns, http, tls, ssh, flow), além de alertas, o que dá ao Suricata o papel de NIDS (detecção por assinatura) + análise de tráfego (NSM) na narrativa do projeto; rodar em modo live apontando para a interface do Notebook 1; conferir que o eve.json está sendo escrito.
- Entregável: container do Suricata rodando com eve.json sendo gravado.

#### J6: Baixar pcaps maliciosos e testar em modo pcap
- Semana: 2. Ordem: 2. Dono: Jessica. Pré-requisitos: J5.
- Descrição: baixar 2 a 3 pcaps públicos de tráfego malicioso (ex.: malware-traffic-analysis.net, amostras de Cobalt Strike, Trickbot, Emotet); salvar em `assets/pcaps/` (fora do controle do git por tamanho, ver .gitignore); registrar no relatório as URLs de download dos pcaps, para a outra integrante reproduzir; testar o Suricata em modo replay: `suricata -r arquivo.pcap -l /tmp/suricata-test`; conferir alertas no eve.json/fast.log (ex.: regras ET MALWARE, ET SCAN); registrar o comando de teste reproduzível no README.
- Entregável: comando de replay que gera alertas confirmadas nas regras.

#### J7: Integrar Suricata ao Wazuh (infraestrutura)
- Semana: 2. Ordem: 3. Dono: Jessica. Pré-requisitos: J6, J3.
- Descrição: escolher o caminho de integração e documentar: (a) logcollector do Wazuh manager lendo o eve.json do Suricata montado no container (mais simples), ou (b) syslog do Suricata para o manager; configurar o `localfile` correspondente no ossec.conf do manager; validar que os eventos brutos do Suricata chegam ao Wazuh como eventos do manager (antes de virar alerta). A interpretação do conteúdo fica com a Malu (M4).
- Entregável: eventos brutos do Suricata chegando ao Wazuh.

#### M4: Criar o decoder para os eventos do Suricata no Wazuh
- Semana: 2. Ordem: 4. Dono: Malu. Pré-requisitos: J7.
- Descrição: garantir (ou criar) o decoder adequado para os campos do eve.json (timestamp, signature, categoria, src/dst ip e porta); validar que os campos são extraídos corretamente dos eventos brutos do Suricata (testar com um evento real do replay de J6); documentar o decoder em `configs/wazuh/`.
- Entregável: decoder funcionando, com os campos do eve.json extraídos.

#### M13: Criar regras de correspondência para os alertas do Suricata
- Semana: 2. Ordem: 5. Dono: Malu. Pré-requisitos: M4.
- Descrição: criar regras de correspondência no Wazuh para as assinaturas do Suricata (ex.: ET MALWARE, ET SCAN) com severidade adequada (nível >= 6 para scans, >= 10 para malware); validar que os eventos viram alertas com os campos corretos (signature, categoria, ip de origem e destino); documentar as regras em `configs/wazuh/`.
- Entregável: regras de correspondência funcionando; alertas do Suricata tipados corretamente no Wazuh.

#### M3: Validar alertas do Suricata no dashboard
- Semana: 2. Ordem: 6. Dono: Malu. Pré-requisitos: J7, M4, M13.
- Descrição: rodar o replay de pcap de J6 com a integração ativa; confirmar no dashboard do Wazuh alertas do tipo Suricata (ex.: ET MALWARE, ET SCAN) com severidade adequada; capturar um exemplo completo de alerta (JSON) e documentar; registrar os IDs de regra do Wazuh correspondentes.
- Entregável: print do dashboard com alertas do Suricata + amostra JSON documentada.

### Semana 3: SOAR conectado

#### J8: Subir o Shuffle standalone com limite de RAM
- Semana: 3. Ordem: 1. Dono: Jessica. Pré-requisitos: J1.
- Descrição: clonar o repositório shuffle/shuffle-docker; usar o modo standalone (containers de banco, OpenSearch, orbiter e a UI); limitar a RAM dos containers Java (ex.: Xmx de 1 a 2GB para o backend) para proteger o Wazuh (R4); subir com docker compose e aguardar os serviços healthy; acessar a UI em http://localhost:3001 e concluir o setup local (e-mail de teste).
- Entregável: UI do Shuffle acessível e estável.

#### M6: Configurar serviços frágeis na VM vítima
- Semana: 3. Ordem: 2. Dono: Malu. Pré-requisitos: M1b.
- Descrição: na VM, configurar sshd para permitir autenticação por senha; criar usuário de teste com senha fraca (ex.: usuario/teste123); instalar o Apache com uma página de teste; deixar documentado quais serviços estão expostos e por quê; (o serviço vulnerável vsftpd 2.3.4 fica para J18, semana 7). Antecipada da semana 4 para liberar a semana dos ataques.
- Entregável: VM com SSH (senha fraca) e Apache acessíveis pela rede.

#### J9: Criar o workflow 1 no Shuffle
- Semana: 3. Ordem: 3. Dono: Jessica. Pré-requisitos: J8.
- Descrição: criar o workflow "resposta-brute-force": trigger do tipo Webhook; nó de parse do JSON do alerta do Wazuh (extrair ip de origem, rule.id, rule.level, agent.name); ramo condicional por nível de severidade (só prossegue se level >= 12); nó de ação inicial que registra a execução em log (a ação de bloqueio real entra na semana 6); exportar o workflow em JSON para `configs/shuffle/`; documentar a URL do webhook gerada (endpoint local).
- Entregável: workflow com trigger webhook funcional + exportação versionada.

#### M5a: Configurar a integração do Wazuh com o Shuffle
- Semana: 3. Ordem: 4. Dono: Malu. Pré-requisitos: J9, J3.
- Descrição: no ossec.conf do manager, adicionar o bloco de integração `integration` com `name=shuffle` (ou custom), `hook_url` apontando para a URL do webhook do workflow de J9 e `level >= 12`; a URL do webhook gerada na J9 fica registrada no relatório da J9 (docs/reports/); alinhar com a J9 quais regras e níveis devem acionar o SOAR; reiniciar o manager e conferir no log que a integração carregou sem erros.
- Entregável: integração configurada no ossec.conf e manager reiniciado.

#### M5b: Confirmar a chegada de alerta de teste no Shuffle
- Semana: 3. Ordem: 5. Dono: Malu. Pré-requisitos: M5a.
- Descrição: gerar um alerta de teste de nível alto e confirmar que chega ao Shuffle como execução do workflow; conferir o histórico de execuções e o log do nó de ação; registrar a evidência (print). O teste profundo do workflow (vários níveis e correções de parse) fica na J10.
- Entregável: alerta crítico do Wazuh aparecendo como execução no Shuffle.

#### J10: Testar o workflow com alerta de teste
- Semana: 3. Ordem: 6. Dono: Jessica. Pré-requisitos: J9, M5b.
- Descrição: disparar alertas de teste de vários níveis (baixo e alto) para validar o filtro do ramo condicional; conferir o histórico de execuções no Shuffle e o log do nó de ação; verificar que alertas abaixo do nível não disparam; corrigir o parse do JSON se algum campo vier vazio; registrar a evidência.
- Entregável: execução visível no Shuffle com log da ação + print.

### Semana 4: Ataques reais e regras custom

#### J11: Gerar ataques reais (nmap, hydra)
- Semana: 4. Ordem: 1. Dono: Jessica. Pré-requisitos: M6, J5.
- Descrição: a partir do Notebook 1, executar varredura de rede: `nmap -sS -sV <IP da VM>` e brute force de SSH: `hydra -l usuario -P wordlist ssh://<IP da VM>`; instalar previamente o nmap, o hydra e uma wordlist de senhas (ex.: rockyou) no Notebook 1, se ainda não estiverem instalados; usar o IP e as credenciais da VM documentados no repo (M1b, M2a e M2b); salvar os comandos em `scripts/attacks/` com comentários; registrar que o tráfego de saída do Notebook 1 é visível ao Suricata na própria interface (D7); repetir varreduras em momentos distintos para gerar volume de eventos.
- Entregável: comandos de ataque versionados + tráfego real registrado.

#### J12: Verificar as regras built-in do Wazuh disparando
- Semana: 4. Ordem: 2. Dono: Jessica. Pré-requisitos: J11.
- Descrição: no dashboard, identificar os alertas gerados pelos ataques de J11: falhas de login SSH (regras da família 5710/5720), brute force (família 5710 com contagem), varredura de portas; validar que a severidade está adequada (nível >= 6 para brute force); listar os IDs de regra disparados e o que cada um representa.
- Entregável: lista documentada de IDs de regra e severidades observadas.

#### M7: Criar regra custom de brute force
- Semana: 4. Ordem: 3. Dono: Malu. Pré-requisitos: J12.
- Descrição: criar regra custom em local_rules.xml (ou via API): N falhas de login em X minutos (ex.: 5 falhas em 5 minutos eleva para nível 10); testar a regra com evento real dos ataques de J11; documentar a regra em `configs/wazuh/`.
- Entregável: regra de brute force testada, funcionando e versionada no repo.

#### M14: Criar regra custom de check_ip
- Semana: 4. Ordem: 4. Dono: Malu. Pré-requisitos: J12.
- Descrição: criar regra custom: conexão de um IP em lista de indicadores (check_ip ou lista custom) dispara alerta; montar a lista de indicadores de teste; testar com evento real dos ataques de J11; documentar a regra em `configs/wazuh/`.
- Entregável: regra de check_ip testada, funcionando e versionada no repo.

#### M15: Criar regra custom de elevação de malware do Suricata
- Semana: 4. Ordem: 5. Dono: Malu. Pré-requisitos: J12.
- Descrição: criar regra custom: alerta do Suricata de categoria malware com severidade elevada (nível >= 10); testar com o replay de pcap de J6 (regra ET MALWARE) via integração; documentar a regra em `configs/wazuh/`.
- Entregável: regra de elevação testada, funcionando e versionada no repo.

#### J13: Rodar a simulação de ataques do Wazuh
- Semana: 4. Ordem: 6. Dono: Jessica. Pré-requisitos: M2b.
- Descrição: executar o script oficial de simulação de ataques do Wazuh (conjunto de comandos que dispara dezenas de regras HIDS: criação de usuário, alteração de permissões, downloads suspeitos, etc.) na VM com o agente; confirmar no dashboard a variedade de alertas HIDS gerados; salvar o script em `scripts/attacks/`.
- Entregável: conjunto variado de alertas HIDS visíveis no dashboard.

### Semana 5: Dashboards

#### J14: Configurar os dashboards nativos do Wazuh
- Semana: 5. Ordem: 1. Dono: Jessica. Pré-requisitos: J3.
- Descrição: explorar e configurar as visões padrão do Wazuh: Security events (tabela de alertas, seletor por agente), Integrity monitoring (syscheck) e MITRE ATT&CK; ajustar o período de tempo padrão; documentar quais dashboards padrão ficam como base; exportar a configuração (saved objects) para `configs/wazuh/` quando o export for suportado, ou documentar o passo a passo com prints.
- Entregável: dashboards nativos configurados e navegáveis.

#### M8: Criar as visualizações do dashboard custom
- Semana: 5. Ordem: 2. Dono: Malu. Pré-requisitos: J14, M7, M14, M15.
- Descrição: no OpenSearch/Kibana do Wazuh, criar visualizações: contagem de alertas por severidade (barras), top 10 IPs de origem (tabela), eventos por agente (pizza), linha do tempo de alertas (área); validar que refletem os alertas das semanas 1 a 4; documentar as visualizações criadas (a montagem do dashboard único fica na M16).
- Entregável: visualizações criadas e validadas com dados reais.

### Semana 6: SOAR completo

#### J15: Preparar o acesso SSH por chave à VM vítima
- Semana: 6. Ordem: 1. Dono: Jessica. Pré-requisitos: J9, M6.
- Descrição: criar uma chave SSH dedicada (sem passphrase, restrita à VM vítima) e instalá-la na VM; configurar na VM um usuário com sudo sem senha apenas para o firewalld (comando restrito ao bloqueio de IP); testar o acesso SSH por chave a partir do Notebook 1; guardar a chave como segredo no Shuffle (a configuração do segredo fica na J27); documentar o procedimento de criação da chave em `docs/` (segurança da chave é crítica).
- Entregável: acesso SSH por chave funcionando + procedimento documentado.

#### J27: Adicionar o nó de bloqueio real e notificação no workflow
- Semana: 6. Ordem: 2. Dono: Jessica. Pré-requisitos: J15, J9.
- Descrição: no workflow de J9, adicionar o nó de ação de resposta: executar ssh na VM vítima e rodar `firewalld-cmd --add-rich-rule` bloqueando o IP de origem do alerta; adicionar também uma notificação (email ou chat, ex.: webhook de chat) registrando o alerta e a ação tomada; configurar a chave criada na J15 como segredo no Shuffle; testar o nó isolado com um IP de teste.
- Entregável: workflow executando bloqueio real de IP na VM + notificação.

#### M9a: Avaliar o Active Response do Wazuh e decidir a divisão de papéis
- Semana: 6. Ordem: 3. Dono: Malu. Pré-requisitos: M7, J27.
- Descrição: avaliar o active response nativo do Wazuh (ex.: comando firewall-drop que bloqueia o IP no próprio agente); consultar a exportação do workflow e o relatório da J27 para entender o que o Shuffle já faz; decidir e documentar a divisão de papéis: Active Response como resposta imediata no endpoint (rápida, nativa) e Shuffle como orquestração, notificação e resposta na VM; registrar a decisão em `docs/decisions.md`.
- Entregável: decisão documentada em `docs/decisions.md`.

#### M9b: Configurar o Active Response escolhido
- Semana: 6. Ordem: 4. Dono: Malu. Pré-requisitos: M9a.
- Descrição: configurar o Active Response decidido na M9a (ex.: comando firewall-drop nos grupos de resposta do agente); testar a resposta com um alerta de teste; documentar a configuração em `configs/wazuh/`.
- Entregável: Active Response configurado e validado no agente.

#### M16: Montar e exportar o dashboard único do projeto
- Semana: 6. Ordem: 5. Dono: Malu. Pré-requisitos: M8, J14.
- Descrição: montar o dashboard único "SOC: Projeto" com as visualizações da M8; ajustar o layout e o período padrão; exportar o dashboard e as visualizações (saved objects) para `configs/wazuh/`, para a outra integrante reproduzir; validar que reflete os alertas das semanas 1 a 5.
- Entregável: dashboard custom navegável com os indicadores do projeto + exportação versionada.

#### J16: Testar o cenário completo de resposta
- Semana: 6. Ordem: 6. Dono: Jessica. Pré-requisitos: J27, M9b.
- Descrição: rodar o hydra atacando a VM; observar a cadeia completa: alerta no Wazuh, envio ao Shuffle, execução do workflow, bloqueio do IP na VM, novas tentativas falhando (timeout/refused); medir o tempo entre o início do ataque e o bloqueio; gravar evidência (log + vídeo curto); documentar o resultado com métricas.
- Entregável: ataque real interrompido automaticamente, com evidência e tempo de resposta medido.

### Semana 7: Cenário end-to-end

#### J17: Script de demo único
- Semana: 7. Ordem: 1. Dono: Jessica. Pré-requisitos: J16, M16.
- Descrição: criar `scripts/demo/demo.sh`: um único comando que (a) dispara o ataque (hydra), (b) aguarda a detecção no Wazuh, (c) confirma o bloqueio na VM, (d) imprime um resumo com URLs dos alertas e o tempo decorrido; testar repetidamente até rodar em menos de 10 minutos de ponta a ponta; tratar falhas com mensagens claras.
- Entregável: script de demo reproduzível com resumo ao final.

#### M10a: Analisar ruído e falsos negativos e ajustar as regras custom
- Semana: 7. Ordem: 2. Dono: Malu. Pré-requisitos: M7, M14, M15, J27.
- Descrição: analisar os alertas acumulados (semanas 4 a 6); identificar ruído (ex.: varreduras repetidas, regras custom disparam demais) e falsos negativos (ataques não detectados); ajustar níveis, condições e listas das regras custom (M7, M14 e M15).
- Entregável: lista de ajustes aplicados nas regras.

#### M10b: Re-testar as regras e manter o changelog
- Semana: 7. Ordem: 3. Dono: Malu. Pré-requisitos: M10a.
- Descrição: re-testar as regras ajustadas com os ataques de J11 e J16; confirmar que o ruído caiu sem perder detecções; manter um changelog dos ajustes em `configs/wazuh/`.
- Entregável: regras revalidadas + changelog dos ajustes.

#### J19: Roteiro da demo
- Semana: 7. Ordem: 4. Dono: Jessica (com Malu). Pré-requisitos: J17.
- Descrição: escrever `docs/demo-guide.md`: passo a passo da apresentação com tempos, prints esperados, e quem fala o quê (Jessica apresenta a demo técnica; Malu apresenta arquitetura e decisões); incluir perguntas prováveis e respostas; ensaiar a divisão de fala.
- Entregável: roteiro escrito e combinado entre as duas.

#### J18 (opcional): Metasploit contra serviço vulnerável
- Semana: 7. Ordem: 5. Dono: Jessica. Pré-requisitos: M6, J5.
- Descrição: se sobrar tempo e RAM: instalar o vsftpd 2.3.4 (versão com backdoor conhecida) na VM; instalar metasploit-framework no Notebook 1; executar o exploit vsftpd_234_backdoor; confirmar detecção no Suricata e/ou Wazuh (HIDS); se não der tempo, registrar a decisão de pular (a demo já cobre com hydra).
- Entregável: exploit detectado (ou registro da decisão de pular).

### Semana 8: Hardening e resiliência

#### J20: Documentar a arquitetura final
- Semana: 8. Ordem: 1. Dono: Jessica. Pré-requisitos: M16, M10b.
- Descrição: escrever `docs/architecture.md`: diagrama final (atualizado), portas abertas, fluxo de dados, decisões (apontando para este roadmap e para `docs/decisions.md`), credenciais de teste (sem segredos reais); atualizar o README com o procedimento de reprodução completo (comandos exatos, ordem, tempo esperado); conferir consistência com o código do repo.
- Entregável: documentação completa e consistente.

#### M11: Revisão técnica da documentação da arquitetura
- Semana: 8. Ordem: 2. Dono: Malu. Pré-requisitos: J20.
- Descrição: revisar o `docs/architecture.md` escrito na J20: conferir diagrama, portas, fluxo de dados e credenciais de teste contra o ambiente real; apontar divergências (ex.: porta que falta, fluxo descrito errado, versões diferentes) no review do pull request; validar que o README reproduz a stack a partir de um clone limpo.
- Entregável: revisão registrada no review do pull request, com correções aplicadas quando houver. Não gera relatório (revisão de pull request).

#### J21: Teste de resiliência do Notebook 1 (reboot e stack)
- Semana: 8. Ordem: 3. Dono: Jessica. Pré-requisitos: J3, M2b.
- Descrição: garantir `restart: always` nos serviços do compose; reiniciar o Notebook 1 e medir o tempo até a stack voltar (indexer healthy, dashboards acessíveis); registrar o teste (tempos, problemas) em `docs/`. O reboot da VM vítima e a reconexão do agente ficam na M17.
- Entregável: reboot a frio do Notebook 1 documentado e funcionando sem intervenção.

#### M17: Teste de resiliência da VM (reboot e reconexão do agente)
- Semana: 8. Ordem: 4. Dono: Malu. Pré-requisitos: M2b, J3.
- Descrição: reiniciar a VM vítima a frio; confirmar que o agente reconecta sozinho ao manager (status Active de volta) e que o syscheck re-arma; registrar o teste (tempos, problemas) em `docs/`.
- Entregável: reboot a frio da VM documentado, com o agente reconectando sem intervenção.

#### J22: Reduzir exposição da stack
- Semana: 8. Ordem: 5. Dono: Jessica. Pré-requisitos: J1, J4.
- Descrição: ajustar o compose para bind das portas de administração (dashboard, Shuffle) em 127.0.0.1 quando não precisarem ser acessadas de fora; revisar o firewalld do Notebook 1 para liberar somente o necessário (1514, 1515 para os agentes); validar com nmap externo que apenas as portas esperadas respondem.
- Entregável: scan externo mostrando somente as portas necessárias.

#### J23: Versionar todas as configurações
- Semana: 8. Ordem: 6. Dono: Jessica. Pré-requisitos: M7, M14, M15, J27.
- Descrição: garantir no git: docker-compose (com .env.example e sem .env real), regras custom do Wazuh, exportação dos workflows do Shuffle, docs e scripts; ajustar .gitignore (pcaps, chaves, certificados, .env); testar a clonagem limpa do repo em outro diretório e seguir o README para confirmar que reproduz.
- Entregável: repositório completo e reproduzível a partir de um clone limpo.

### Semana 9: Ensaio e vídeo

#### A2: Ensaio da demo ao vivo
- Semana: 9. Ordem: 1. Dono: Jessica e Malu. Pré-requisitos: J17.
- Descrição: rodar a demo completa (demo.sh) sem roteiro em mãos, com as duas presentes; cronometrar e anotar pontos de falha; repetir até duas execuções seguidas sem falhas; validar que os prints e URLs do roteiro correspondem à realidade.
- Entregável: duas execuções limpas e consecutivas.

#### J24: Gravar vídeo de 3 a 5 minutos
- Semana: 9. Ordem: 2. Dono: Jessica. Pré-requisitos: A2.
- Descrição: gravar com OBS (ou ferramenta nativa do Fedora): arquitetura em 30s, ataque, detecção e resposta em 2 a 3 minutos, métricas (volume de alertas, tempo de resposta) em 30s; salvar em `assets/demo.mp4` (e/ou subir no YouTube não listado para o link no slide); conferir áudio e legibilidade dos terminais.
- Entregável: vídeo de 3 a 5 minutos salvo e acessível.

#### A3: Preparar os slides
- Semana: 9. Ordem: 3. Dono: Jessica e Malu. Pré-requisitos: J20, J17.
- Descrição: montar deck de 8 a 10 slides: problema e motivação, arquitetura (Malu), decisões e porquês (Malu), demo com link do vídeo (Jessica), métricas e lições aprendidas, possíveis evoluções; alinhar com o roteiro de J19.
- Entregável: deck final revisado pelas duas.

### Semana 10: Polimento

#### M12: Revisão final da documentação
- Semana: 10. Ordem: 1. Dono: Malu. Pré-requisitos: J20.
- Descrição: revisar README, arquitetura, decisões e este roadmap: consistência, diagramas, comandos; conferir que os comandos do README funcionam a partir do zero (se possível, teste em máquina limpa ou container); corrigir ortografia e referências cruzadas.
- Entregável: documentação sem pendências. Não gera relatório (revisão de pull request).

#### J25: Testes finais de workflows e regras
- Semana: 10. Ordem: 2. Dono: Jessica. Pré-requisitos: J16, M10b.
- Descrição: reexecutar o checklist completo: replay de pcap (J6), simulação de ataques (J13), ataques reais (J11), resposta automática (J16) e demo única (J17); confirmar que todos os alertas e ações ainda funcionam após o hardening da semana 8; registrar o resultado.
- Entregável: checklist de fechamento 100% verificado.

#### J26: Preparar o ambiente da apresentação final
- Semana: 10. Ordem: 3. Dono: Jessica. Pré-requisitos: J25.
- Descrição: validar o ambiente onde a apresentação vai acontecer (sala do lab ou sala de aula): rede disponível para os notebooks se comunicarem, projetor/monitor, tomada e adaptador; deixar o vídeo da demo acessível offline (arquivo local) como reserva para falha de rede; conferir que o Notebook 1 sobe a stack em menos de 15 minutos; definir um plano B (ex.: vídeo no lugar da demo ao vivo) e registrar em `docs/demo-guide.md`.
- Entregável: ambiente validado e plano B registrado.

#### A4: Preparar respostas para perguntas prováveis
- Semana: 10. Ordem: 4. Dono: Jessica e Malu. Pré-requisitos: J20.
- Descrição: rascunhar respostas curtas para: por que Wazuh (3 caixas do slide em um serviço), por que Suricata (alertas nativos + replay de pcap), como o SOAR executa ações (webhook, workflow, ssh), o que é replay de pcap, o que acontece num reboot, como a equipe se dividiu; deixar o documento em `docs/faq.md`.
- Entregável: documento de respostas pronto para as perguntas do professor.

---

## 7. Riscos e mitigações

| # | Risco | Impacto | Mitigação |
|---|---|---|---|
| R1 | Tempo curto até o Acompanhamento 1 (2,5 semanas) | Não ter nada para mostrar | Escopo do A1 é mínimo (compose up + 1 agente); regras de prioridade por semana |
| R2 | WiFi com isolamento de cliente (AP isolation) esconde o tráfego entre notebooks | Suricata não vê ataques reais | Ataques originados no próprio Notebook 1 (SOC) são sempre visíveis ao Suricata (tráfego de saída da própria interface); NIDS complementado por replay de pcap; opcional: cabo entre notebooks ou hotspot do Notebook 1 |
| R3 | Suricata em container não enxerga a interface | NIDS cego | network_mode host é obrigatório; validar na semana 2 (J5) |
| R4 | Shuffle pesado (Java) disputando RAM | Stack instável | Limitar RAM do container (Xmx); Grafana já descartado; Wazuh tem prioridade |
| R5 | Regras padrão do Wazuh geram ruído (falsos positivos) | Dashboard poluído, demo confusa | Regras custom ajustadas na semana 4 (M7, M14 e M15) e revisadas na semana 7 (M10a/M10b) |
| R6 | Docker no Fedora tem dois caminhos (Docker CE vs podman) | Fricção e incompatibilidade | Escolher Docker CE na semana 1 (J1) e documentar; não misturar |
| R7 | Falha na integração Wazuh, Shuffle (webhook) | SOAR não dispara | Fallback: Active Response nativo do Wazuh como camada de resposta independente (M9a/M9b) |

---

## 8. Perguntas em aberto

As perguntas em aberto ficam em `docs/open-questions.md`; as resolvidas viram decisões registradas em `docs/decisions.md` (criado na M9a). Histórico já resolvido:

1. Acompanhamento com demo ao vivo e repositório público (GitHub).
2. Vítima em VM (KVM) no Notebook 2, ambiente isolado do uso pessoal.
3. RAM livre no Notebook 1: 8GB confirmados. Consequência: Grafana fica de fora e a RAM do Shuffle é limitada (ver R4 e semana 5).

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
