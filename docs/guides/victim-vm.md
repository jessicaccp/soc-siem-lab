# Guia: VM vítima (T05 e T07)

Passo a passo para reproduzir a VM vítima (Ubuntu 22.04 server, KVM/libvirt no host do projeto) em uma máquina nova.

## 1. Pré-requisitos do host (uma vez por máquina)

```bash
sudo apt update
sudo apt install -y qemu-system-x86 qemu-utils libvirt-daemon-system libvirt-clients virtinst cloud-image-utils acl
sudo systemctl enable --now libvirtd
sudo virsh net-start default
sudo virsh net-autostart default
sudo usermod -aG kvm,libvirt "$USER"
```

O grupo vale para sessões novas. Para liberar a sessão atual sem reiniciar:

```bash
sudo setfacl -m u:"$USER":rw /dev/kvm
sudo setfacl -m u:"$USER":rw /run/libvirt/libvirt-sock
```

O QEMU dos domínios de sistema roda como `libvirt-qemu` e precisa atravessar o diretório das imagens:

```bash
sudo setfacl -m u:libvirt-qemu:rx "$HOME"
sudo setfacl -m u:libvirt-qemu:rwx "$HOME/vms"
sudo setfacl -d -m u:libvirt-qemu:rw "$HOME/vms"
sudo setfacl -m u:libvirt-qemu:rw /dev/kvm
```

## 2. Imagem base

Baixar a cloud image do Ubuntu 22.04 (LTS) para `~/vms` (fica fora do repositório):

```bash
mkdir -p ~/vms && cd ~/vms
curl -LO https://cloud-images.ubuntu.com/jammy/current/jammy-server-cloudimg-amd64.img
sha256sum jammy-server-cloudimg-amd64.img
# esperado em 15/09/2026: 9144540e8af7637d258b50dbabe82ce1aa6752c9574fedfb048270da0e087899
```

O caminho `current` é mutável: a imagem publicada muda a cada build e o hash acima vale para o build usado na criação da VM.

## 3. Criar a VM

```bash
./scripts/vm/create-victim-vm.sh
```

O script aplica a reserva de DHCP da rede `default` (`scripts/vm/libvirt-default-network.xml`), cria o disco em overlay (20 GB sobre a cloud image), gera o seed do cloud-init (`scripts/vm/cloud-init/victim-user-data.yaml`) e sobe o domínio com `virt-install`.

## 4. Verificação

```bash
virsh -c qemu:///system list
virsh -c qemu:///system net-dhcp-leases default
ping -c 2 192.168.122.50
nc -z 192.168.122.50 22
ssh victim@192.168.122.50
```

Login por senha sem terminal interativo (dispensa `sshpass`):

```bash
ASKPASS=$(mktemp /tmp/askpass.XXXXXX)
printf '#!/bin/sh\necho victim123\n' > "$ASKPASS"
chmod 700 "$ASKPASS"
SSH_ASKPASS="$ASKPASS" SSH_ASKPASS_REQUIRE=force DISPLAY=:0 \
  ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no victim@192.168.122.50 'hostname; id -nG'
rm -f "$ASKPASS"
```

O `virsh domifaddr victim --source arp` responde `internal error: wrong nlmsg len` no kernel do WSL2; o método que funciona é ler o lease do dnsmasq com `virsh net-dhcp-leases default`.

## 5. Snapshot e retorno ao estado limpo

Com a VM desligada:

```bash
virsh -c qemu:///system shutdown victim
virsh -c qemu:///system snapshot-create-as --name clean-install \
  --description "Ubuntu 22.04 cloud image, sshd with password auth, test user victim" victim
virsh -c qemu:///system start victim
```

Para voltar ao estado limpo (descarta tudo o que veio depois):

```bash
virsh -c qemu:///system shutdown victim
virsh -c qemu:///system snapshot-revert victim --snapshotname clean-install
virsh -c qemu:///system start victim
```

## Especificação

A especificação da VM (recursos, rede, disco, credenciais de teste) fica em `docs/reports/T05-create-vm.md`.

## Agente Wazuh (T09)

O script `scripts/vm/install-wazuh-agent.sh` roda dentro da VM e instala o agente casado com a versão do manager, apontando para a ponte `virbr0` (`192.168.122.1`). Copiar e executar com root:

```bash
scp scripts/vm/install-wazuh-agent.sh victim@192.168.122.50:/tmp/
ssh victim@192.168.122.50 'sudo bash /tmp/install-wazuh-agent.sh'
```

Verificação, na VM e no manager:

```bash
sudo cat /var/ossec/etc/client.keys
sudo systemctl is-enabled wazuh-agent; sudo systemctl is-active wazuh-agent
docker exec wazuh-wazuh.manager-1 /var/ossec/bin/agent_control -l
```

O agente aparece como `Active` no manager depois do primeiro keepalive, cerca de um minuto após a instalação.

## Notas

- O URI padrão do `virsh` para o usuário comum é `qemu:///session`, onde a rede `default` não existe. Usar `virsh -c qemu:///system` ou exportar `LIBVIRT_DEFAULT_URI=qemu:///system`. O script já exporta a variável.
- Credenciais de teste (usuário e senha) estão no relatório `docs/reports/T05-create-vm.md`. São de ambiente de laboratório isolado na rede do libvirt.
- O XML da rede não fixa `uuid`: o libvirt gera um na definição, para que o arquivo sirva a qualquer host.
- O script recria a rede `default` (`net-destroy` seguido de `net-start`) para aplicar a reserva de DHCP. Não rodar com outras VMs dessa rede em uso.
