#!/usr/bin/env bash
# Installs the HTTP target used by the attack scenarios (T19) and checks the
# fragile surface that the cloud-init already configures.
# Runs inside the victim VM, as root.
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

apt-get update -qq
apt-get install -y -qq apache2
systemctl enable --now apache2

# The package default page is the test page; not replacing it keeps the state
# equal to a fresh install of the package.
test -f /var/www/html/index.html

echo "apache: $(systemctl is-active apache2) / $(systemctl is-enabled apache2)"
echo "sshd password auth: $(sshd -T | grep -m1 '^passwordauthentication')"
echo "test account: $(passwd -S victim | awk '{print $1, $2}')"
echo "listening: $(ss -ltnH | awk '{print $4}' | grep -oE '[0-9]+$' | sort -un | tr '\n' ' ')"
