# Subir o Suricata

## Objetivo

Subir o Suricata em container na máquina SOC, em modo live sobre a ponte do libvirt, gerando `eve.json` com alertas e logs de transação para a integração com o Wazuh.

## Pré-requisitos

- Docker CE com o plugin Docker Compose (ver `install-docker.md`).
- A ponte `virbr0` do libvirt ativa, criada com a VM vítima (`victim-vm.md`).
- Permissão para criar containers com `network_mode: host`, `NET_ADMIN`, `NET_RAW` e `SYS_NICE`. Sem elas o Suricata não enxerga a interface e a detecção fica cega (risco R3).

## Passos

1. Copiar as variáveis de ambiente e ajustar a interface, se necessário:

```bash
cd configs/suricata
cp .env.example .env
```

2. Subir o serviço:

```bash
docker compose up -d
```

3. Baixar e habilitar as regras na primeira subida. O comando recarrega as regras em quente, sem reiniciar o container:

```bash
docker exec --user suricata suricata suricata-update -f
```

4. Acompanhar o log até o engine iniciar (a carga das regras leva cerca de 40 segundos):

```bash
docker logs -f suricata
grep -E "signatures processed|Engine started" logs/suricata.log | tail -3
```

## Verificação

```bash
docker ps --filter name=suricata                          # container Up
tail -2 logs/eve.json                                     # eventos sendo gravados
python3 -c "import json,collections; c=collections.Counter(json.loads(l).get('event_type') for l in open('logs/eve.json')); print(c)"
docker exec suricata suricata -T -c /etc/suricata/suricata.yaml   # config válida
```

Para gerar tráfego na ponte, execute algo dentro da VM vítima, o tráfego dela passa pela `virbr0`:

```bash
ssh victim@192.168.122.50 'curl -sI https://example.com | head -1; curl -s -o /dev/null http://example.com'
```

## Estado validado (16/09/2026)

| Item | Valor verificado |
|---|---|
| Imagem | `jasonish/suricata:7.0.17` |
| Modo | live, af-packet, 8 threads de captura, interface `virbr0` |
| Regras | 68.722 baixadas pelo `suricata-update`, 52.769 habilitadas, 52.774 signatures carregadas |
| Tipos no `eve.json` | `alert`, `anomaly`, `http`, `dns`, `tls`, `ssh`, `flow`, `stats` |
| Volumes | `config/` (configuração), `logs/` (eve.json, fast.log, suricata.log), `lib/` (regras) |

## Notas

- A configuração versionada é uma versão enxuta do `suricata.yaml` (o default da imagem tem 2.258 linhas). A seção `af-packet` com `interface: default` é obrigatória para o modo live, mesmo com o `-i` na linha de comando; a interface em si vem de `SURICATA_INTERFACE` no `.env`.
- `HOME_NET` cobre as faixas privadas (`192.168.0.0/16`, `10.0.0.0/8`, `172.16.0.0/12`), o que inclui a rede do laboratório `192.168.122.0/24`.
- `logs/` e `lib/` não são versionados: são estado da máquina. O `eve.json` é regenerado a cada subida, e as regras vêm do `suricata-update`.
- A série 8.0.6 da imagem também existe. A 7.0.17 foi escolhida por manter o formato do `eve.json` coberto pelos decoders do Wazuh usados na T15.
