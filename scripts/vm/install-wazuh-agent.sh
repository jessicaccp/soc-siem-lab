#!/usr/bin/env bash
# Installs and enrolls the Wazuh agent on the victim VM (T09).
# Runs inside the VM, as root.
set -euo pipefail

MANAGER_IP="${WAZUH_MANAGER:-192.168.122.1}"
AGENT_NAME="${WAZUH_AGENT_NAME:-victim}"
AGENT_VERSION="${WAZUH_AGENT_VERSION:-4.14.7}"

export DEBIAN_FRONTEND=noninteractive

apt-get install -y -qq curl gnupg apt-transport-https >/dev/null

curl -fsSL https://packages.wazuh.com/key/GPG-KEY-WAZUH | gpg --dearmor -o /usr/share/keyrings/wazuh.gpg
echo "deb [signed-by=/usr/share/keyrings/wazuh.gpg] https://packages.wazuh.com/4.x/apt/ stable main" \
  > /etc/apt/sources.list.d/wazuh.list

apt-get update -qq
WAZUH_MANAGER="$MANAGER_IP" WAZUH_AGENT_NAME="$AGENT_NAME" \
  apt-get install -y -qq "wazuh-agent=${AGENT_VERSION}-1"

systemctl daemon-reload
systemctl enable --now wazuh-agent

echo "agent version: $(dpkg-query -W -f='${Version}' wazuh-agent)"
echo "manager: $(grep -m1 '<address>' /var/ossec/etc/ossec.conf)"
echo "service: $(systemctl is-active wazuh-agent)"
