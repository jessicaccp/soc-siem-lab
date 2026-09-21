# Guia da demonstração

## Objetivo

Reunir o que o ambiente já faz e as evidências visuais geradas, para o acompanhamento semanal e para o vídeo de 3 a 5 minutos (T51). O roteiro final da apresentação é a T42.

## O que mostrar hoje (fim da semana 2)

| Camada | O que já funciona | Como mostrar |
|---|---|---|
| HIDS | Agente Wazuh `Active` na VM vítima, coletando logs do SO pelo journald e integridade de arquivos | prints 01 e 03, vídeo `hids-auth.mp4` |
| NIDS | Suricata em container host-network com 52.769 assinaturas ET Open, captura live na ponte e replay de pcaps | prints 04, 05 e 06, vídeos `live-alert.mp4` e `replay-pcap.mp4` |
| SIEM | Alertas de host e de rede no mesmo painel, com nível por tipo: 12 para malware, 6 para varredura e 3 para o restante | prints 04 e 05 |
| Dashboards | Painel nativo do Wazuh com os eventos, o FIM e o resumo por severidade | prints 01, 02 e 03 |
| SOAR | Ainda não, entra na semana 3 (T18 a T23) | - |

## Prints (versionados)

| Arquivo | O que mostra |
|---|---|
| `01-painel-visao-geral.png` | Resumo do painel: agentes conectados e contagem por severidade |
| `02-fim-eventos.png` | Integridade de arquivos: o arquivo de teste em `/etc` apareceu como `added` e `deleted` |
| `03-hids-agente.png` | Eventos do agente da vítima: falhas de autenticação SSH e sessões PAM |
| `04-nids-alertas.png` | Alertas do Suricata no índice, com nível, descrição, IPs de origem e destino e porta |
| `05-nids-malware.png` | Só os alertas de malware (regra 100200, nível 12), com assinatura ET e categoria |
| `06-nids-live.png` | Alertas vindos da captura live, gerados por ataque na ponte |
| `07-arquitetura.png` | Diagrama das camadas, das duas máquinas, das portas e do fluxo de dados |

## Vídeos (fora do git, por tamanho)

| Arquivo | Duração | O que mostra |
|---|---|---|
| `live-alert.mp4` | 38 s | Ataque ao vivo a partir da VM vítima (16 SYNs para portas 22) e o alerta `ET SCAN` aparecendo no painel pela regra 100210, nível 6 |
| `replay-pcap.mp4` | 40 s | Replay do pcap malicioso do neris e 4.146 alertas entrando no painel |
| `hids-auth.mp4` | 30 s | Quatro logins com senha errada na vítima e o Wazuh gerando a falha de autenticação (5760, nível 5) e o brute force (5763, nível 10) |

Os vídeos ficam em `assets/media/`, que não é versionado. Os cortes começam depois da autenticação no painel, então nenhum deles mostra credencial.

## Roteiro de três minutos

1. **Contexto** (print 07): as cinco camadas, as duas máquinas e o fluxo de dados.
2. **HIDS** (print 01 e vídeo `hids-auth`): agente `Active`, falha de autenticação e brute force detectados na vítima.
3. **NIDS e SIEM** (vídeo `live-alert` e print 05): ataque na ponte, detecção por assinatura e alerta de malware no nível 12 no mesmo painel dos eventos de host.
4. **Volume e reprodutibilidade** (vídeo `replay-pcap` e print 04): o replay de um pcap público alimentando o painel com milhares de alertas.
5. **Fechamento**: o que falta é o SOAR, que entra na semana 3 (T18 a T23).

## Como regerar as evidências

```bash
# prints do painel (assets/prints/week-02)
node scripts/media/capture-stills.js

# vídeos (assets/media), um por cenário
node scripts/media/capture-video.js live /tmp/videos/live-alert.webm
node scripts/media/capture-video.js replay /tmp/videos/replay-pcap.webm
node scripts/media/capture-video.js hids /tmp/videos/hids-auth.webm
scripts/media/render.sh /tmp/videos assets/media
```

Dependências: Node com `playwright-core` e o Chromium do Playwright, e um ffmpeg com libx264 e libass (o build estático de `johnvansickle.com/ffmpeg` serve). Os scripts leem `PW_CORE`, `CHROMIUM`, `DASHBOARD_URL`, `DASHBOARD_USER`, `DASHBOARD_PASSWORD` e `VICTIM_ADDRESS` do ambiente. Os cortes de tempo em `render.sh` são os da gravação usada aqui; uma gravação nova pode precisar de ajuste, porque o tempo de carga do painel varia.

## Notas

- Os números que aparecem nos prints são do momento da captura. A rodada de validação registrada em `docs/reports/T17-suricata-dashboard.md` tem 46.161 alertas do Suricata, 120 deles de nível 12.
- O diagrama da arquitetura foi desenhado em Mermaid e renderizado em PNG; o arquivo final da T44 deve substituí-lo quando a arquitetura estiver fechada.
- Cada cenário de vídeo depende do ambiente no ar: containers do Wazuh e do Suricata, VM vítima com o agente, e a ponte `virbr0` ativa.
