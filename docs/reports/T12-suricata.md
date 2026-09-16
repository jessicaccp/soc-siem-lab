# T12: Subir o Suricata em container com network_mode host

## Metadados

- Semana: 2
- Atividades cobertas: T12
- Prioridade: P0
- Pré-requisitos: T03
- Status: done
- Data de conclusão: 15/09/2026

## Resumo do que foi feito

### T12: Subir o Suricata em container com network_mode host

- Serviço criado em `configs/suricata/docker-compose.yml`, com imagem `jasonish/suricata:7.0.17`, `network_mode: host` (exigência do R3, sem ele o container não enxerga a interface) e as capacidades `NET_ADMIN`, `NET_RAW` e `SYS_NICE`, que o image usa para capturar e depois abandonar o privilégio de root.
- Compose separado do Wazuh, em `configs/suricata/`, seguindo a organização por serviço definida na T04. A descrição da atividade citava "adicionar ao docker-compose"; a estrutura de pastas do repositório separa cada serviço, e o Suricata não compartilha ciclo de vida nem volumes com o manager.
- Interface de captura: `virbr0`, a ponte do libvirt, por onde passa o tráfego entre a máquina SOC e a VM vítima, incluindo os ataques originados no host (D7). Parametrizada em `.env` como `SURICATA_INTERFACE`.
- Três volumes, como a atividade pede: `config/` (`/etc/suricata`), `logs/` (`/var/log/suricata`) e `lib/` (`/var/lib/suricata`). `logs/` e `lib/` ficam fora do git por serem estado de máquina.
- Configuração versionada em `configs/suricata/config/suricata.yaml`: versão enxuta do `suricata.yaml` (o default da imagem tem 2.258 linhas), com `vars`, `af-packet`, caminho das regras, `eve.json` e `logging`. Validada pelo próprio Suricata.
- Regras atualizadas com `suricata-update -f`, que baixou e habilitou o conjunto ET Open e recarregou em quente:

```
Writing rules to /var/lib/suricata/rules/suricata.rules: total: 68722; enabled: 52769
Running suricatasc -c reload-rules. Reload command returned: {"message": "done", "return": "OK"}
```

- Tipos de log no `eve.json` conforme a atividade pede (alertas mais transações):

```yaml
types:
  - alert
  - anomaly: {enabled: yes}
  - http: {extended: yes}
  - dns
  - tls: {extended: yes}
  - ssh
  - flow
  - stats
```

- Verificação do critério de aceite (container rodando com `eve.json` sendo gravado). Após 45 segundos de carga, o engine inicia e os eventos aparecem:

```
Info: detect: 1 rule files processed. 52769 rules successfully loaded, 0 rules failed
Notice: threads: Threads created -> W: 8 FM: 1 FR: 1   Engine started.
```

Eventos gravados no `eve.json` após tráfego gerado de dentro da VM, que atravessa a ponte:

| Tipo | Quantidade | Origem |
| --- | --- | --- |
| `stats` | 28 | contadores internos do engine, a cada 60 s |
| `dns` | 12 | consultas de `example.com` e `wikipedia.org` feitas pela VM |
| `flow` | 8 | sessões SSH e HTTP |
| `tls` | 2 | sessões HTTPS da VM |
| `ssh` | 2 | logins SSH na vítima |
| `http` | 1 | `GET /` em `example.com`, HTTP/1.1, status 200 |

Exemplo de evento HTTP:

```json
{"event_type": "http", "http": {"hostname": "example.com", "url": "/", "protocol": "HTTP/1.1", "status": 200}}
```

## Dificuldades

1. A configuração enxuta passou no `suricata -T` mas falhou ao subir em modo live, com `Error: af-packet: Problem with config file`. O `-T` valida a configuração, porém não exercita a captura: no modo live o Suricata exige a seção `af-packet`. Resolvido com `interface: default` na seção, que aplica os parâmetros a qualquer interface passada por `-i` e mantém a escolha da interface em um só lugar (`.env`).
2. Sem `SURICATA_OPTIONS`, o entrypoint da imagem executa o Suricata sem argumentos e o processo só imprime o usage e sai com código 1, deixando o container em reinício. A interface precisa continuar vindo por `-i` no `SURICATA_OPTIONS`, e a seção `af-packet` fica só com os parâmetros.
3. O `eve.json` não registra transação quando o host é o cliente de um SSH de comando único: o tráfego precisa ser gerado dentro da VM, atravessando a ponte, para render `dns`, `http`, `tls` e `ssh`.

## Aprendizados e avisos (handoff)

- O `eve.json` fica em `configs/suricata/logs/eve.json`, no host. É esse caminho que a T14 monta no container do manager para o logcollector ler.
- Atualizar regras sem reiniciar: `docker exec --user suricata suricata suricata-update -f`, que dispara o `reload-rules` pelo socket de comando.
- Antes da T13, o `fast.log` está vazio porque ainda não houve tráfego malicioso; os alertas entram no replay do pcap.
- A interface de captura é a `virbr0`. Se a VM mudar de rede, ajustar `SURICATA_INTERFACE` no `.env` e o parâmetro correspondente no `suricata.yaml` não é necessário, ele vale para qualquer interface.
- O container reinicia sozinho (`restart: unless-stopped`) e volta a capturar; as regras já estão persistidas em `lib/`.

## Entregáveis

- `configs/suricata/docker-compose.yml`
- `configs/suricata/config/suricata.yaml`
- `configs/suricata/.env.example`
- `docs/guides/start-suricata.md`
- `docs/reports/T12-suricata.md`

## Acompanhamento

- O Suricata 7.0.17 roda em container com `network_mode: host` sobre a ponte do libvirt, com 52.769 regras ET Open carregadas e `eve.json` gravando alertas e transações de `dns`, `http`, `tls`, `ssh` e `flow`.
- A dificuldade mais interessante foi o limite do `suricata -T`: ele valida a configuração, mas não a captura, então a falta da seção `af-packet` só apareceu na subida em modo live.
- Próximo passo da semana: T13, baixar pcaps públicos de tráfego malicioso e validar o replay gerando alertas.
