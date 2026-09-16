# T05: Preparar a virtualização e criar a VM vítima

## Metadados

- Semana: 2
- Atividades cobertas: T05
- Prioridade: P0
- Pré-requisitos: T01
- Status: done
- Data de conclusão: 15/09/2026

## Resumo do que foi feito

### T05: Preparar a virtualização e criar a VM vítima

- Pacotes no host: `qemu-system-x86`, `qemu-utils`, `libvirt-daemon-system`, `libvirt-clients`, `virtinst`, `cloud-image-utils` e `acl`; `libvirtd` habilitado; rede `default` ativa e com autostart.
- Permissões: usuária nos grupos `kvm` e `libvirt` (vale para sessões novas), ACL de `rw` em `/dev/kvm` e `/run/libvirt/libvirt-sock` para a sessão atual, e ACL do usuário `libvirt-qemu` em `$HOME` (`rx`), em `~/vms` (`rwx`, com default para arquivos novos) e em `/dev/kvm`.
- Imagem base: cloud image Ubuntu 22.04 LTS (`jammy-server-cloudimg-amd64.img`, 701 MB) em `~/vms`, fora do repositório.
- Rede: reserva de DHCP por MAC (`52:54:00:2b:1f:10` para `192.168.122.50`) na rede `default` do libvirt, NAT em `virbr0` na `192.168.122.0/24`, versionada em `scripts/vm/libvirt-default-network.xml`.
- VM: domínio `victim`, criado por `./scripts/vm/create-victim-vm.sh`, que aplica a reserva de rede, cria o disco em overlay, gera o seed de cloud-init e executa o `virt-install`.
- Cloud-init: usuário de teste `victim` com `sudo` (senha exigida), login por senha habilitado em `/etc/ssh/sshd_config.d/99-lab-password-auth.conf`.

Verificação do critério de aceite (VM criada com rede acessível da máquina SOC):

```bash
virsh -c qemu:///system list
#  Id   Name     State
#  2    victim   running
virsh -c qemu:///system dominfo victim | grep -E "CPU\(s\)|Max memory"
# CPU(s):         2
# Max memory:     2097152 KiB
qemu-img info -U ~/vms/victim.qcow2
# virtual size: 20 GiB (21474836480 bytes)
# backing file: /home/jessica/vms/jammy-server-cloudimg-amd64.img
virsh -c qemu:///system net-dhcp-leases default
# 192.168.122.50/24   victim   52:54:00:2b:1f:10
ping -c 3 192.168.122.50
# 3 packets transmitted, 3 received, 0% packet loss
nc -z 192.168.122.50 22
# porta aberta
ssh -o BatchMode=yes victim@192.168.122.50
# Permission denied (publickey,password,keyboard-interactive)
```

A lista de métodos na última resposta mostra que o `sshd` da VM oferece autenticação por senha, que é a fragilidade intencional para os ataques de força bruta da T26.

## Especificação da VM

| Item | Valor |
| --- | --- |
| Distribuição | Ubuntu 22.04 LTS (jammy) cloud image |
| vCPU | 2 |
| Memória | 2048 MB |
| Disco | 20 GB (overlay `qcow2` sobre `~/vms/jammy-server-cloudimg-amd64.img`) |
| Rede | `default` do libvirt (NAT, `192.168.122.0/24`) |
| IP | `192.168.122.50` (reserva de DHCP por MAC) |
| MAC | `52:54:00:2b:1f:10` |
| Gateway | `192.168.122.1` |
| Usuário de teste | `victim` / `victim123` (grupos `adm` e `sudo`) |
| Arquivos de estado | `~/vms/victim.qcow2`, `~/vms/victim-seed.iso` (fora do repositório) |

Imagem base: `jammy-server-cloudimg-amd64.img`, sha256 `9144540e8af7637d258b50dbabe82ce1aa6752c9574fedfb048270da0e087899`.

Desvios em relação à descrição da atividade no `ROADMAP.md`: a VM usa cloud image com cloud-init, em vez da ISO com instalador interativo, e é criada por `virt-install`, em vez do virt-manager, porque o host é headless (decisão registrada em `docs/open-questions.md`, entrada 5). O cloud-init adianta itens de T07 (usuário de teste com `sudo` e sshd aceitando senha) e a fragilidade prevista na T19 (autenticação por senha); a validação formal de cada item pertence às atividades correspondentes.

## Dificuldades

1. `sudo virsh net-start default` respondeu `network is already active`: a rede é autostart e sobe junto com o `libvirtd`. Nenhuma ação necessária.
2. O bloco de preparação inicial não instalava o pacote `acl`, então o `setfacl` não existia na máquina. A correção entrou no guia.
3. `virsh` sem `--connect` usa `qemu:///session` para usuário comum, onde a rede `default` não existe (`Network not found: no network with matching name 'default'`). Todas as operações passaram a usar `-c qemu:///system` e o script exporta `LIBVIRT_DEFAULT_URI`.
4. `virt-install` falhou com `Cannot access storage file '/home/jessica/vms/victim.qcow2' (as uid:64055)`: o QEMU dos domínios de sistema roda como `libvirt-qemu` e não atravessa o diretório pessoal. Resolvido com ACL em `$HOME` e em `~/vms`.
5. `virsh domifaddr victim --source arp` falha no kernel do WSL2 com `internal error: wrong nlmsg len`. Como o script usa `set -e` e `pipefail`, o erro dentro da substituição de comando encerrava o script em silêncio, antes da mensagem de timeout. A espera pelo IP passou a consultar o lease do dnsmasq com `virsh net-dhcp-leases default`.

## Aprendizados e avisos (handoff)

- Operar sempre em `qemu:///system`; exportar `LIBVIRT_DEFAULT_URI=qemu:///system` evita o erro de rede inexistente.
- `virsh domifaddr --source arp` não funciona no WSL2; usar `virsh net-dhcp-leases default` (ou `--source lease`).
- O usuário `libvirt-qemu` precisa de ACL de leitura e escrita nos discos; sem isso o `virt-install` falha na abertura do storage.
- As ACLs em `/dev/kvm` e no socket do libvirt servem para a sessão atual. Depois de um reinício do WSL2, os grupos `kvm` e `libvirt` já valem e as ACLs são dispensáveis.
- Reiniciar o WSL2 derruba a VM; subir com `virsh -c qemu:///system start victim`. O autostart do domínio está desabilitado.
- O script recria a rede `default` (`net-destroy` e `net-start`) para aplicar a reserva; não rodar com outras VMs dessa rede em uso.
- Memória: o WSL2 tem 7,6 GB e o Wazuh consome cerca de 3,5 GB; a VM usa 2 GB. Conferir folga antes de subir o Shuffle (T18 e T19).

## Entregáveis

- `scripts/vm/create-victim-vm.sh`
- `scripts/vm/libvirt-default-network.xml`
- `scripts/vm/cloud-init/victim-user-data.yaml`
- `docs/guides/victim-vm.md`
- `docs/reports/T05-create-vm.md`

## Acompanhamento

- VM vítima no ar (2 vCPU, 2 GB, 20 GB), com IP fixo por reserva de DHCP e acessível da máquina SOC; criação reproduzível por script a partir de cloud image.
- A dificuldade mais instrutiva foi o QEMU dos domínios de sistema rodar como `libvirt-qemu`: o storage no diretório pessoal exigiu ACL, e a detecção de IP precisou abandonar o `domifaddr --source arp`, quebrado no kernel do WSL2.
- Próximo passo da semana: T07, validar o acesso ssh com o usuário de teste e criar o snapshot limpo da VM.
