# T08: Liberar as portas do Wazuh no firewall da máquina SOC

## Metadados

- Semana: 2
- Atividades cobertas: T08
- Prioridade: P0
- Pré-requisitos: T06
- Status: done
- Data de conclusão: 15/09/2026

## Resumo do que foi feito

### T08: Liberar as portas do Wazuh no firewall da máquina SOC

- Levantamento do firewall da máquina SOC: `firewalld`, `ufw`, `nftables` e `iptables` estão todos inativos. O WSL2 não traz firewall habilitado, então não havia regra a criar, e a liberação das portas já era consequência da publicação do Docker Compose.
- Portas publicadas pelo `configs/wazuh/docker-compose.yml`:

| Porta | Serviço | Publicação | Configuração |
|---|---|---|---|
| 1514/tcp | Wazuh manager, eventos dos agentes | `0.0.0.0` | `docker-compose.yml:15` |
| 1515/tcp | Wazuh manager, registro de agentes | `0.0.0.0` | `docker-compose.yml:16` |
| 514/udp | Wazuh manager, syslog | `0.0.0.0` | `docker-compose.yml:17` |
| 55000/tcp | Wazuh manager, API | `0.0.0.0` | `docker-compose.yml:18` |
| 9200/tcp | Wazuh indexer | `127.0.0.1` | `docker-compose.yml:51` |
| 443/tcp | Wazuh dashboard | `0.0.0.0` | `docker-compose.yml:76` |

- Endereço da máquina SOC na rede do laboratório: `192.168.122.1`, a ponte `virbr0` do libvirt. É o valor que o agente usa como `WAZUH_MANAGER` na T09.
- Validação a partir da VM vítima, com `nmap` instalado na própria vítima (versão 7.80):

```bash
nmap -Pn -p 1514,1515,55000,443 192.168.122.1
# PORT      STATE SERVICE
# 443/tcp   open  https
# 1514/tcp  open  fujitsu-dtcns
# 1515/tcp  open  ifor-protocol
# 55000/tcp open  unknown
```

As quatro portas exigidas pelo critério de aceite estão acessíveis da vítima para a máquina SOC.

- Regras e estado do firewall documentados em `docs/guides/start-wazuh-stack.md`, seção "Portas e publicação".

## Dificuldades

1. A atividade pressupõe um firewall para configurar (`firewalld`, `ufw` ou `nftables`), mas a máquina SOC não tem nenhum ativo, então não há arquivo de regras a editar. A verificação de alcance passou a ser o entregável real: o que importa para a T09 é que a vítima alcance as portas, e isso foi medido com `nmap` de dentro da vítima.
2. Restringir a origem à rede do laboratório, como a descrição pede ("apenas para a rede local de lab"), não é possível só com um firewall comum: o Docker publica as portas por DNAT e o `ufw` não filtra o tráfego encaminhado dessa cadeia, o que exigiria regras em `DOCKER-USER`. Além disso, restringir a `192.168.122.0/24` derrubaria o acesso ao dashboard pelo navegador do Windows, que chega pela interface `eth0`. A restrição foi registrada como decisão pendente de hardening em `docs/open-questions.md`.

## Aprendizados e avisos (handoff)

- O agente da T09 deve apontar para `192.168.122.1` (ponte `virbr0`), não para `localhost` nem para o IP de `eth0`.
- Não há firewall para desligar ou ajustar: se algo não conectar na T09, a causa não é firewall na máquina SOC.
- As portas 1514, 1515 e 55000 respondem também em `eth0`, ou seja, fora da rede do laboratório. Isso é exposição conhecida e está na lista de pendências de hardening, não é um defeito desta atividade.
- O `nmap` 7.80 ficou instalado na VM vítima. Ele será útil na T13 e nas atividades de ataque (T24), mas o `nmap` da máquina SOC, exigido pela T24, é outro pacote.

## Entregáveis

- `docs/guides/start-wazuh-stack.md`, seção "Portas e publicação" (tabela de portas, endereço do manager e validação).
- `docs/reports/T08-open-wazuh-ports.md`.

## Acompanhamento

- As quatro portas do Wazuh estão acessíveis da VM vítima em `192.168.122.1`, validado com `nmap` executado de dentro da vítima.
- A dificuldade mais interessante foi o pressuposto de firewall da atividade não existir na máquina SOC: sem firewall, a liberação já estava dada pela publicação do Docker, e a restrição de origem esbarra na cadeia `DOCKER-USER` e no acesso pelo navegador do Windows.
- Próximo passo da semana: T09, instalar e registrar o agente Wazuh na VM.
