# T19: Configurar serviços frágeis na VM vítima

## Metadados

- Semana: 3
- Atividade: T19
- Prioridade: P0
- Pré-requisitos: T07
- Status: done
- Data de conclusão: 26/09/2026

## Resumo do que foi feito

### T19: Configurar serviços frágeis na VM vítima

- A parte de SSH da atividade já estava pronta desde a T05: o cloud-init cria o usuário `victim` com a senha fraca, no grupo `sudo`, e o arquivo `/etc/ssh/sshd_config.d/99-lab-password-auth.conf` com `PasswordAuthentication yes`. O que faltava era o servidor web.
- Criado `scripts/vm/setup-weak-services.sh`, que roda dentro da VM como root, instala o `apache2`, habilita o serviço e confere a superfície: estado do Apache, autenticação por senha do sshd, situação da conta de teste e portas em escuta.
- Execução na VM (cópia por `scp` e execução com `sudo`):

```
apache: active / enabled
sshd password auth: passwordauthentication yes
test account: victim P
listening: 22 53 80
```

- A página padrão do pacote é a página de teste, mantida sem alteração (a resposta tem 10.671 bytes e o título `Apache2 Ubuntu Default Page: It works`), conferida pela máquina SOC com HTTP 200 em `http://192.168.122.50/`.
- Portas alcançáveis pela máquina SOC, testadas uma a uma: 22/tcp (sshd) e 80/tcp (Apache) abertas; 53/tcp fechada, porque o `53` da listagem é o resolvedor local do systemd em `127.0.0.53`. A VM não tem firewall (`ufw` não está instalado), então não houve regra a liberar.
- Snapshot `weak-services-configured` criado com a VM desligada, depois de conferir que o reboot devolve tudo no ar: Apache e agente Wazuh `active`, HTTP 200 e o agente `victim` como `Active` no manager.

## Dificuldades

- A atividade pedia configurar sshd e criar o usuário de teste, mas os dois vieram do cloud-init na T05. Refazer isso seria duplicar o que já estava versionado em `scripts/vm/cloud-init/victim-user-data.yaml`, então a T19 ficou com o Apache e com a conferência da superfície, que é o que o script passou a cobrir.
- O script roda com `sudo` e o terminal não é interativo: a senha foi passada por `echo ... | sudo -S`, o mesmo caminho registrado na T05 para o acesso SSH sem `sshpass`.

## Aprendizados e avisos (handoff)

- Superfície de ataque da VM: 22/tcp (SSH com senha fraca, `victim`/`victim123`) e 80/tcp (Apache com a página padrão). A varredura e o brute force das T24 a T29 atacam exatamente essas portas.
- O `ufw` não está instalado na VM, então não há regra de firewall a ajustar; o isolamento vem da rede do libvirt, que é NAT de `192.168.122.0/24`.
- Snapshot de retorno antes dos ataques: `weak-services-configured`. Depois dele, qualquer mudança na VM (arquivos criados por ataques, tentativas falhas no `auth.log`) pode ser descartada com `snapshot-revert`.
- O script é idempotente e serve de receita em uma VM nova; a senha fraca do usuário continua vindo do cloud-init, não do script.
- Antes de qualquer atividade com a VM: `virsh -c qemu:///system net-start default` quando o WSL2 foi reiniciado, e `virsh -c qemu:///system start victim`.
- Com o Shuffle, o Wazuh, o Suricata e a VM no ar, restam cerca de 1,6 GB de RAM. Se a T20 a T23 precisarem de folga, o Suricata (250 MB) pode ficar parado, porque não participa da cadeia do SOAR.

## Entregáveis

- `scripts/vm/setup-weak-services.sh`: instalação do Apache e conferência da superfície frágil.
- `docs/guides/victim-vm.md`: seção "Serviços frágeis (T19)", tabela de portas e novo snapshot na tabela de pontos de retorno.
- `docs/guides/README.md`: linha do guia atualizada para T05, T07, T09 e T19.
- Snapshot `weak-services-configured` na VM (estado de máquina, fora do repositório).

## Acompanhamento

- A VM vítima tem a superfície de ataque fechada: SSH com senha fraca e Apache ativo na página de teste, com o agente Wazuh coletando os eventos desses serviços.
- A dificuldade mais interessante foi o escopo: metade da atividade já estava no cloud-init da T05, então a T19 virou Apache mais conferência, em vez de reconfigurar o que já estava versionado.
- Próximo passo da semana: T20, criar o workflow de resposta a brute force no Shuffle, com trigger de webhook e ramo condicional por severidade.
