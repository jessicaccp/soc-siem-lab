# Instalar o Docker CE na máquina SOC

## Objetivo

Deixar a máquina SOC com o Docker CE e o plugin Docker Compose, que são a base de toda a stack (Wazuh, Suricata e Shuffle). A escolha do Docker CE em vez do podman-compose elimina a ambiguidade do risco R6.

## Pré-requisitos

- Host Linux com acesso sudo e saída para a internet.
- Usuário que vai operar a stack definido (no projeto, o usuário da máquina SOC).

## Passos

1. Instalar o Docker CE pelo procedimento oficial da distribuição (`https://docs.docker.com/engine/install/`) ou pelo script de conveniência `curl -fsSL https://get.docker.com | sh`. Pacotes esperados: `docker-ce`, `docker-ce-cli`, `containerd.io` e `docker-compose-plugin`.
2. Habilitar e iniciar o serviço: `sudo systemctl enable --now docker`.
3. Dar acesso ao usuário (evita sudo em cada comando e vale para sessões novas): `sudo usermod -aG docker "$USER"`.
4. Não misturar caminhos de container: se o podman estiver presente no host, ele não é usado no projeto (`podman-compose` fica fora).

## Verificação

```bash
docker version --format 'cliente {{.Client.Version}} / servidor {{.Server.Version}}'
docker compose version
systemctl is-enabled docker && systemctl is-active docker
docker run --rm hello-world
```

Resultado esperado: cliente e servidor na mesma versão, plugin do Compose presente, serviço `enabled` e `active`, e a mensagem "Hello from Docker!".

## Estado da máquina SOC de referência (13/09/2026)

| Item | Valor verificado |
|---|---|
| Pacote | `docker-ce 5:29.5.1-1~ubuntu.22.04~jammy` |
| Cliente e servidor | 29.5.1 (API 1.54), linux/amd64 |
| Docker Compose | 5.1.3 |
| Serviço | `systemctl` enabled e active |
| Grupo do usuário | `docker` presente (comandos sem sudo) |
| podman | não instalado |
| `docker run --rm hello-world` | executado com sucesso |
