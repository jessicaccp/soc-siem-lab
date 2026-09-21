# T09: Instalar e registrar o Wazuh agent na VM

## Metadados

- Semana: 2
- Atividades cobertas: T09
- Prioridade: P0
- Pré-requisitos: T07, T06, T08
- Status: done
- Data de conclusão: 15/09/2026

## Resumo do que foi feito

### T09: Instalar e registrar o Wazuh agent na VM

- Procedimento empacotado em `scripts/vm/install-wazuh-agent.sh`, que roda dentro da VM como root. Ele adiciona o repositório oficial do Wazuh (chave GPG em `/usr/share/keyrings/wazuh.gpg` e lista em `/etc/apt/sources.list.d/wazuh.list`), instala o pacote e habilita o serviço.
- Versão casada com o manager (`4.14.7` nos três containers): pacote `wazuh-agent=4.14.7-1`.
- Endereço do manager e nome do agente passados na instalação, que já escrevem o `ossec.conf`:

```bash
WAZUH_MANAGER=192.168.122.1 WAZUH_AGENT_NAME=victim apt-get install -y wazuh-agent=4.14.7-1
```

Trecho resultante de `/var/ossec/etc/ossec.conf`:

```xml
<client>
  <server>
    <address>192.168.122.1</address>
    <port>1514</port>
    <protocol>tcp</protocol>
  </server>
  <enrollment>
    <enabled>yes</enabled>
    <agent_name>victim</agent_name>
  </enrollment>
</client>
```

- Serviço: `systemctl enable --now wazuh-agent`, com `enabled: enabled / active: active`.
- Registro pelo authd do manager (porta 1515), que aceita enrollment sem chave prévia porque `use_source_ip` está desligado. Log do manager:

```
wazuh-authd: INFO: Received request for a new agent (victim) from: 172.23.0.1
wazuh-authd: INFO: Agent key generated for 'victim' (requested by any)
```

- Chave gravada na VM, em `/var/ossec/etc/client.keys`:

```
001 victim any dcdfe292e890f53905c42937a9eaabb1182b1bc19d244872854a4708e9ef9cbd
```

- Conexão estabelecida, no log do agente (`/var/ossec/logs/ossec.log`):

```
wazuh-agentd: INFO: Trying to connect to server ([192.168.122.1]:1514/tcp).
wazuh-agentd: INFO: (4102): Connected to the server ([192.168.122.1]:1514/tcp).
wazuh-syscheckd: INFO: Agent is now online.
```

- Estado no manager:

```bash
docker exec wazuh-wazuh.manager-1 /var/ossec/bin/agent_control -l
# ID: 001, Name: victim, IP: any, Active
docker exec wazuh-wazuh.manager-1 /var/ossec/bin/agent_control -i 001
# Operating system: Linux |victim |5.15.0-191-generic |x86_64
# Client version:   Wazuh v4.14.7
```

## Dificuldades

1. O status do agente no manager passou por `Never connected`, depois `Pending` e só então `Active`, cerca de um minuto depois da instalação. Não é defeito: o manager marca o agente como ativo depois do primeiro keepalive. A validação do estado no dashboard pertence à T10.
2. O authd registrou a requisição com origem `172.23.0.1`, o gateway da rede Docker, e não `192.168.122.50`, por causa do DNAT do Docker. Por isso o agente aparece com `IP: any` (`use_source_ip` desligado no manager). Não afeta a coleta nem o vínculo do agente, porque a identidade é a chave de `client.keys`.
3. O script precisa de root na VM e o terminal não é interativo: ele é copiado com `scp` e executado com `sudo -S`, com a senha vinda pelo `stdin` da conexão.

## Aprendizados e avisos (handoff)

- Agente `001`, nome `victim`, versão 4.14.7, apontando para `192.168.122.1:1514` e registrado pelo authd em `1515`.
- Logs do agente: `/var/ossec/logs/ossec.log`; chave: `/var/ossec/etc/client.keys`; configuração: `/var/ossec/etc/ossec.conf`.
- O script é reexecutável: refazer a instalação não gera um segundo registro nem muda a chave, porque o `client.keys` é preservado.
- Se o agente aparecer como `Never connected` logo após a instalação, esperar o keepalive antes de investigar.
- Reverter a VM para o snapshot `clean-install` apaga o agente; nesse caso rodar `scripts/vm/install-wazuh-agent.sh` de novo, lembrando que o manager mantém o registro antigo com a mesma chave.

## Entregáveis

- `scripts/vm/install-wazuh-agent.sh`
- `docs/reports/T09-wazuh-agent.md`

## Acompanhamento

- Agente instalado, registrado e `Active` no manager, com o endereço do manager em `192.168.122.1`, a ponte do libvirt definida na T08.
- A dificuldade mais interessante foi a progressão de estado do agente no manager: o `Active` só aparece depois do primeiro keepalive, o que explica um `Never connected` que assusta logo após a instalação.
- Próximo passo da semana: T10, validar a coleta de logs de SO e o syscheck, e conferir o status `Active` no dashboard.
