# T11: Gate do acompanhamento 1

## Metadados

- Semana: 1
- Atividades cobertas: T11
- Prioridade: P0
- Pré-requisitos: T03, T06
- Status: done
- Data de conclusão: 14/09/2026

## Resumo do que foi feito

### T11: Gate do acompanhamento 1

Critério de aceite da semana 1, "Dashboard do Wazuh acessível e stack no ar", conferido item por item:

| Item | Verificação | Resultado |
|---|---|---|
| A stack sobe com um comando | `docker compose up -d` em `configs/wazuh/` | três containers `Up` (manager, indexer, dashboard) |
| O dashboard responde de forma estável | `curl -k` em `https://localhost/` e `https://172.29.204.254/` | HTTP 302 para `/app/login` |
| O login funciona | conferência da usuária no navegador, por `localhost` do Windows | home do Wazuh acessível em `/app/wz-home` |
| Os eventos chegam ao indexer | índice `wazuh-alerts-4.x-2026.09.14` | 186 documentos; 45 alertas de severidade média e 141 de severidade baixa nas últimas 24 horas |
| O agente aparece | home do Wazuh | "This instance has no agents registered", o esperado antes da T09 |

- Credenciais de teste documentadas sem segredo real: as do `configs/wazuh/.env.example` são as padrão da imagem oficial do Wazuh, e a troca está prevista na T48.
- Narrativa de 1 minuto para o acompanhamento preparada nos bullets da seção "Acompanhamento".

## Dificuldades

- O navegador não está na máquina de execução: o host é um WSL2 e a interface é usada a partir do Windows. O acesso funciona por `localhost`, pelo encaminhamento do WSL2. Não há sshd ativo, então túnel SSH não é caminho disponível, e a 9200 ficou restrita a `127.0.0.1` justamente por não ser necessária na rede.
- Sem navegador instalado na máquina, a captura visual ficou com a usuária. No lugar da imagem, o relatório registra o conteúdo da home do Wazuh conferido por ela.

## Aprendizados e avisos (handoff)

- Host de execução: WSL2 (Linux com systemd, Docker CE 29.5.1, `/dev/kvm` disponível). O item "WSL2" da lista de alternativas rejeitadas do D1 foi ajustado, porque a stack roda nele sem os problemas que motivaram o descarte.
- Acesso de fora do Windows para dentro do WSL2 não funciona sem configuração extra. Se a VM vítima ficar em outra máquina, o agente precisa alcançar as portas 1514, 1515 e 55000, o que exige portproxy do Windows e regra de firewall. Isso é mudança de rede e precisa de aviso prévio à usuária; está registrado em `docs/open-questions.md`.
- O dashboard respondendo em `127.0.0.1` ou em `0.0.0.0` ainda não foi testado contra o acesso pelo Windows. Decidir na T48 antes de prender a porta, para não derrubar o acesso que existe hoje.
- Próxima atividade: T05, preparar a virtualização e criar a VM vítima, que abre a semana 2.

## Entregáveis

- Checklist do gate preenchido (este relatório).
- Evidência: conteúdo da home do Wazuh conferido pela usuária, mais as respostas HTTP e o índice de alertas registrados aqui.
- Narrativa de 1 minuto nos bullets abaixo.

## Acompanhamento

- A semana 1 fechou com o Wazuh single-node no ar: manager, indexer e dashboard na versão 4.14.7, dashboard acessível com login, 186 alertas indexados e a stack inteira versionada em `configs/wazuh/`, com guia de reprodução.
- A dificuldade que apareceu foi de ambiente, não de configuração: a máquina é um WSL2 com o navegador no Windows, então o acesso ao dashboard passa por `localhost` e a captura visual saiu pela usuária; o roadmap já estava sem distribuição fixa, o que evitou retrabalho.
- O próximo passo é a semana 2: criar a VM vítima (T05, T07), instalar e registrar o agente (T09, T10), depois Suricata em modo live e replay de pcap (T12 a T17).
