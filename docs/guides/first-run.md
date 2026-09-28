# Primeira execução (clone limpo)

## Objetivo

Subir o ambiente completo a partir de um clone limpo: as peças em containers na máquina SOC e a VM vítima, na ordem que as dependências exigem, e conferir que as cinco camadas respondem. Este guia é a ordem e a conferência final; o procedimento detalhado de cada peça fica no guia apontado em cada passo.

## Pré-requisitos da máquina

| Item | Requisito | Conferência |
|---|---|---|
| Sistema | Linux com systemd (o projeto roda em WSL2, com o navegador no Windows) | `systemctl --version` |
| Docker | Docker CE com o plugin Compose | `docker version && docker compose version` |
| Grupos | usuário nos grupos `docker`, `kvm` e `libvirt` | `id -nG` |
| Kernel | `vm.max_map_count` igual ou maior que 262144, exigência do indexer | `cat /proc/sys/vm/max_map_count` |
| Memória | 8 GB recomendados. Medido com tudo no ar: Wazuh 2,4 GB (indexer 1,1, manager 1,1, dashboard 178 MB), Shuffle 2,3 GB (OpenSearch 1,8, Tenzir 0,4, backend e orborus 108 MB), Suricata 112 MB e a VM 2 GB | `free -h` |
| Disco | 10 GB para as imagens, 20 GB para o disco da VM e 200 MB para os pcaps | `df -h /` |
| Rede | internet na primeira subida: imagens, regras do Suricata, imagens de app do Shuffle e a cloud image da VM | `curl -sI https://github.com \| head -1` |

## Ordem dos passos

| Ordem | Passo | Guia | O que fica pronto |
|---|---|---|---|
| 1 | Docker CE e o ajuste do kernel | `install-docker.md` | host pronto para containers |
| 2 | Variáveis de ambiente, uma cópia de `.env.example` por peça | o guia de cada peça | `.env` de `configs/wazuh`, `configs/suricata` e `configs/shuffle`, todos fora do git |
| 3 | Stack do Wazuh | `start-wazuh-stack.md` | certificados internos gerados e dashboard em `https://localhost` |
| 4 | VM vítima | `victim-vm.md` | VM no ar em `192.168.122.50`, com o snapshot `clean-install` |
| 5 | Agente Wazuh dentro da VM | `victim-vm.md` | agente registrado e `Active` no manager |
| 6 | Serviços frágeis na VM | `victim-vm.md` | sshd com senha e Apache na 80, snapshot `weak-services-configured` |
| 7 | Suricata | `start-suricata.md` | captura live na ponte `virbr0`, com as assinaturas ET Open |
| 8 | Pcaps de teste | `replay-pcap.md` | 179 MB de capturas públicas em `assets/pcaps/` |
| 9 | Shuffle | `start-shuffle.md` | UI em `http://localhost:3001` e o workflow `brute-force-response` registrado |
| 10 | Integração do Wazuh com o Shuffle | `start-shuffle.md` | alerta de nível 12 vira execução no Shuffle |
| 11 | Integração do Suricata com o Wazuh | `suricata-wazuh.md` | alertas de rede no mesmo índice dos de host |

Duas ordens não podem ser trocadas:

- A VM (passo 4) vem antes do Suricata (passo 7). A ponte `virbr0` e a rede `192.168.122.0/24` nascem com a VM, e é nessa interface que o Suricata captura; sem a VM, o container sobe sem enxergar tráfego.
- O manager do Wazuh é recriado depois de qualquer alteração no `ossec.conf` ou nos arquivos montados nele: `docker compose up -d --force-recreate wazuh.manager`. A integração e as regras são lidas na subida do container.

## Verificação final

| Camada | Comando | Esperado |
|---|---|---|
| Containers | `docker ps --format '{{.Names}}'` | nove em execução: os três do Wazuh, o Suricata e os cinco do Shuffle |
| SIEM | `curl -sk -o /dev/null -w "%{http_code}\n" https://localhost/` | `302` |
| SIEM | `curl -sk -u admin:SecretPassword https://localhost:9200/_cluster/health` | `"status":"green"` |
| HIDS | `docker exec wazuh-wazuh.manager-1 /var/ossec/bin/agent_control -l` | agente `victim` como `Active` |
| Vítima | `nc -z 192.168.122.50 22 && nc -z 192.168.122.50 80` | as duas portas abertas |
| NIDS | `docker logs suricata --tail 3` | `Engine started` e os threads de captura |
| SOAR | `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001` | `200` |
| SOAR | o webhook de teste do `start-shuffle.md` | execução nova com os dois nós em `SUCCESS` |

A verificação detalhada de cada peça, com os valores medidos, está no guia dela.

## Notas

- Não vai para o git: `.env`, certificados e chaves, pcaps, vídeos, o disco da VM e os dados do indexer do Wazuh e do Shuffle (volumes Docker e os diretórios `shuffle-database/`, `shuffle-apps/` e `shuffle-files/`). O clone traz as receitas, não o estado.
- Repetir a subida não perde dado: `docker compose stop` para os containers e `docker compose down` remove os containers mantendo os volumes. Só `docker compose down -v` apaga os dados do indexer.
- Para derrubar tudo, na ordem inversa: `docker compose down` nos três diretórios e `virsh -c qemu:///system shutdown victim`.
- Para ver apenas o SIEM, os passos 1 a 3 bastam: o dashboard sobe sem a VM, sem o Suricata e sem o Shuffle.
- O ambiente completo ocupa cerca de 6,8 GB dos 7,6 GB do host, somando a VM. O heap do OpenSearch do Shuffle está em 1 GB e o Tenzir tem limite de 1 GB justamente por isso (risco R4 do `ROADMAP.md`).
