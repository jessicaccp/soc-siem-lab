#!/usr/bin/env bash
# Creates the victim VM (T05) from the Ubuntu 22.04 cloud image, with the
# libvirt default network DHCP reservation and the cloud-init test user.
set -euo pipefail

VM_NAME=victim
VM_DIR="${VM_DIR:-$HOME/vms}"
BASE_IMAGE="$VM_DIR/jammy-server-cloudimg-amd64.img"
DISK="$VM_DIR/$VM_NAME.qcow2"
SEED="$VM_DIR/$VM_NAME-seed.iso"
DISK_SIZE=20G
MEMORY_MB=2048
VCPUS=2
MAC=52:54:00:2b:1f:10
IP=192.168.122.50
VM_IP_TIMEOUT=300

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
export LIBVIRT_DEFAULT_URI=qemu:///system

[ -r "$BASE_IMAGE" ] || { echo "base image not found: $BASE_IMAGE"; exit 1; }
virsh net-info default >/dev/null 2>&1 || { echo "libvirt default network is not available"; exit 1; }
if virsh dominfo "$VM_NAME" >/dev/null 2>&1; then echo "domain $VM_NAME already exists"; exit 1; fi

virsh net-define "$REPO_DIR/scripts/vm/libvirt-default-network.xml" >/dev/null
virsh net-destroy default >/dev/null
virsh net-start default >/dev/null

qemu-img create -f qcow2 -F qcow2 -b "$BASE_IMAGE" "$DISK" "$DISK_SIZE" >/dev/null
cloud-localds "$SEED" "$REPO_DIR/scripts/vm/cloud-init/victim-user-data.yaml"

virt-install \
  --name "$VM_NAME" \
  --memory "$MEMORY_MB" \
  --vcpus "$VCPUS" \
  --cpu host-passthrough \
  --disk "path=$DISK,format=qcow2,bus=virtio" \
  --disk "path=$SEED,device=cdrom" \
  --network "network=default,mac=$MAC,model=virtio" \
  --osinfo name=ubuntu22.04,require=off \
  --graphics none \
  --import \
  --noautoconsole

# virsh domifaddr --source arp fails on the WSL2 kernel ("internal error: wrong
# nlmsg len"), so the address is taken from the network dnsmasq lease.
reachable=0
for _ in $(seq 1 $((VM_IP_TIMEOUT / 5))); do
  if virsh net-dhcp-leases default 2>/dev/null | grep -q "$MAC" && ping -c 1 -W 2 "$IP" >/dev/null 2>&1; then
    reachable=1
    break
  fi
  sleep 5
done

if [ "$reachable" -eq 0 ]; then
  echo "$IP did not answer within ${VM_IP_TIMEOUT}s"
  exit 1
fi

echo "domain $VM_NAME is up at $IP"
