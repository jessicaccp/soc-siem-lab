# T03: Instalar Docker CE na máquina SOC

## Metadados

- Semana: 1
- Atividades cobertas: T03
- Prioridade: P0
- Pré-requisitos: T01, T02
- Status: done
- Data de conclusão: 13/09/2026

## Resumo do que foi feito

### T03: Instalar Docker CE na máquina SOC

- Verificação do ambiente da máquina SOC: pacote `docker-ce 5:29.5.1-1~ubuntu.22.04~jammy`, cliente e servidor 29.5.1 (API 1.54, linux/amd64), plugin Docker Compose 5.1.3, serviço `enabled` e `active`, usuário no grupo `docker`, podman ausente.
- `docker run --rm hello-world` executado com sucesso, confirmando que o daemon puxa imagem e roda container.
- Procedimento de instalação e validação registrado em `docs/guides/install-docker.md`, sem fixar distribuição: repositório oficial ou script `get.docker.com`, com os pacotes esperados.
- Decisão de ambiente documentada no guia: usar Docker CE e não `podman-compose` (risco R6).
- `README.md` ganhou a seção "Requisitos de ambiente", com as versões validadas e o ponteiro para o guia.

## Dificuldades

- A máquina SOC já tinha o Docker CE instalado e funcionando, então a atividade se resumiu a validar e registrar o procedimento. O risco R6 não se materializou: não há podman no host, logo não existe o caminho duplo que o risco descreve.
- O roadmap descrevia a instalação pelo `dnf` do Fedora. A T02 já tinha generalizado o passo para o procedimento oficial da distribuição, e o guia segue essa forma.

## Aprendizados e avisos (handoff)

- Ambiente base da stack: Docker CE 29.5.1 com Compose 5.1.3. O Compose 5.x lê o formato de arquivo usado pelo `wazuh-docker`; confirmar na T06, que é a primeira subida real.
- O usuário `jessica` já está no grupo `docker`, então os comandos da stack rodam sem sudo.
- T06, T12, T18 e todas as atividades de container herdam este ambiente. Em caso de reinstalação da máquina, `docs/guides/install-docker.md` reproduz o estado.

## Entregáveis

- `docs/guides/install-docker.md`: procedimento de instalação, verificação e estado validado da máquina SOC.
- `README.md`: seção "Requisitos de ambiente".

## Acompanhamento

- A máquina SOC está com Docker CE 29.5.1 e Compose 5.1.3 validados, serviço habilitado no boot e usuário no grupo docker, tudo registrado em guia reproduzível.
- O roadmap pedia instalação via `dnf` do Fedora, mas a máquina é Linux com Docker já instalado: o guia ficou sem distribuição fixa, o que também resolve a dependência da T03 para outras máquinas.
- O próximo passo da semana é a T04, estrutura de pastas e README, e depois a T06, primeira subida do Wazuh.
