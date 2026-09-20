# T13: Baixar pcaps maliciosos e testar em modo pcap

## Metadados

- Semana: 2
- Atividades cobertas: T13
- Prioridade: P0
- Pré-requisitos: T12
- Status: done
- Data de conclusão: 20/09/2026

## Resumo do que foi feito

### T13: Baixar pcaps maliciosos e testar em modo pcap

- Fonte escolhida: Malware Capture Facility Project (CTU, Praga / Stratosphere IPS), capturas reais de botnet com download direto e arquivos de rótulos. Os pcaps do `malware-traffic-analysis.net`, citados como exemplo na atividade, passaram a usar um esquema de senha divulgado apenas em imagem (`about.gif`) na página "about" do site: sem a senha, o zip não abre e a reprodução a partir de um clone limpo não se sustenta.
- Dois pcaps baixados em `assets/pcaps/`, que não é versionado por tamanho:

```
curl -LO https://mcfp.felk.cvut.cz/publicDatasets/CTU-Malware-Capture-Botnet-42/botnet-capture-20110810-neris.pcap
curl -LO https://mcfp.felk.cvut.cz/publicDatasets/CTU-Malware-Capture-Botnet-44/botnet-capture-20110812-rbot.pcap
```

- `assets/pcaps/` passou a ser montado como `/pcaps:ro` no container do Suricata, para o replay usar os arquivos do host sem cópia intermediária.
- Replay em modo offline, sem tocar na captura live:

```bash
docker exec suricata mkdir -p /var/log/suricata/replay-neris
docker exec suricata suricata -r /pcaps/botnet-capture-20110810-neris.pcap \
  -l /var/log/suricata/replay-neris -k none \
  --set vars.address-groups.HOME_NET=147.32.84.0/24
```

- Resultado do replay dos dois pcaps:

| pcap | Pacotes | Entradas `alert` | Alertas de assinatura | Assinaturas distintas |
|---|---|---|---|---|
| `botnet-capture-20110810-neris.pcap` | 323.154 | 7.254 | 1.036 | 22 |
| `botnet-capture-20110812-rbot.pcap` | 495.056 | 42.018 | 41.822 | 19 |

Entradas `alert` são todas as linhas com `event_type: alert`, incluindo as internas do engine (checksum, stream, applayer). Alertas de assinatura são as entradas cuja `signature` começa com `ET ` ou `GPL `.

- Assinaturas que atendem ao critério da atividade (ex.: `ET MALWARE`, `ET SCAN`):

| pcap | Assinatura | `signature_id` | Severidade | Ocorrências |
|---|---|---|---|---|
| neris | ET MALWARE Trojan Generic - POST To gate.php with no referer | 2017930 | 1 | 53 |
| neris | ET MALWARE Trojan Generic - POST To gate.php with no accept headers | 2022985 | 1 | 53 |
| neris | ET MALWARE Win32/Virut.BN Checkin | 2012533 | 1 | 4 |
| neris | ET MALWARE Driveby Loader Request List.php | 2013518 | 1 | 4 |
| rbot | ET SCAN Potential SSH Scan OUTBOUND | 2003068 | 2 | 31.663 |
| rbot | ET SCAN Behavioral Unusually fast Terminal Server Traffic Potential Scan or Infection (Inbound) | 2001972 | 3 | 63 |
| rbot | ET SCAN Suspicious inbound to MSSQL port 1433 | 2010935 | 2 | 15 |

- Exemplo de alerta `ET MALWARE` gravado no `replay-neris/eve.json`, com os campos que as atividades T15 e T16 vão interpretar:

```json
{
 "timestamp": "2011-08-10T09:08:49.612032+0000",
 "event_type": "alert",
 "src_ip": "147.32.84.165", "src_port": 1276,
 "dest_ip": "31.192.109.167", "dest_port": 80,
 "proto": "TCP",
 "alert": {
  "action": "allowed",
  "gid": 1, "signature_id": 2017930, "rev": 12,
  "signature": "ET MALWARE Trojan Generic - POST To gate.php with no referer",
  "category": "A Network Trojan was detected",
  "severity": 1
 },
 "http": {"hostname": "finalcortex.com", "url": "/snapbn/gate.php", "http_method": "POST", "protocol": "HTTP/1.0", "status": 200},
 "app_proto": "http",
 "direction": "to_server"
}
```

- Exemplo de alerta `ET SCAN` do `replay-rbot/eve.json`:

```json
{
 "timestamp": "2011-08-12T13:02:38.765034+0000",
 "event_type": "alert",
 "src_ip": "147.32.84.165", "src_port": 1041,
 "dest_ip": "111.89.136.30", "dest_port": 22,
 "proto": "TCP",
 "alert": {
  "gid": 1, "signature_id": 2003068, "rev": 7,
  "signature": "ET SCAN Potential SSH Scan OUTBOUND",
  "category": "Attempted Information Leak",
  "severity": 2
 },
 "direction": "to_server"
}
```

- O comando de replay, as URLs dos pcaps e os números esperados ficaram em `docs/guides/replay-pcap.md`, e o `README.md` aponta para o guia. O ROADMAP pedia o comando no README; o desvio está registrado em `docs/open-questions.md`.
- No mesmo commit, o `docs/status.md` teve três linhas duplicadas de T09, T10 e T12 removidas (apareciam como `done` e como `pendente`) e a semana 2 passou de 5/11 para 7/11 atividades concluídas.

## Dificuldades

1. O zip do `malware-traffic-analysis.net` (244 MB) não abre com a senha histórica `infected` porque o site mudou o esquema e divulga a senha em imagem. A fonte foi trocada por capturas do CTU, com download direto e sem senha.
2. A primeira execução em modo pcap abortou com `The logging directory "/var/log/suricata/replay-neris" supplied at the command-line (-l ...) doesn't exist`. O Suricata não cria o diretório de saída, é preciso criá-lo antes.
3. Com a configuração padrão, o replay do neris gerou 3.109 alertas, todos internos do engine (checksum, stream), e nenhuma assinatura ET. A captura vem da rede pública do laboratório da CTU (`147.32.84.0/24`), que não pertence ao `HOME_NET` do projeto; as assinaturas com direção `$HOME_NET -> $EXTERNAL_NET` não disparam. Resolvido com `--set vars.address-groups.HOME_NET=147.32.84.0/24` na linha de comando, o que deixou a configuração versionada intacta para a captura live. Com o ajuste, as assinaturas ET subiram de zero para 1.036 no neris.
4. Os arquivos de saída do replay pertencem ao root, porque o `docker exec` entra no container como root, o que impede apagá-los pelo host. A limpeza é feita com `docker exec suricata rm -rf /var/log/suricata/replay-*`.
5. Um terceiro pcap testado, captura de VM com endereço privado (`10.0.2.0/24`), gerou 4 alertas internos do engine e nenhuma assinatura ET, mesmo com o `HOME_NET` correto. Foi descartado e não entrou no guia.

## Aprendizados e avisos (handoff)

- Os pcaps ficam em `assets/pcaps/` e não são versionados: um clone limpo precisa baixá-los de novo pelas URLs do `docs/guides/replay-pcap.md`.
- O `HOME_NET` da configuração cobre as faixas privadas do laboratório. Replay de pcap capturado em outra rede exige `--set vars.address-groups.HOME_NET=<rede da captura>` na linha de comando, senão as assinaturas de direção não disparam.
- A saída do replay vai para `configs/suricata/logs/replay-<nome>/`, separada do `eve.json` da captura live. É esse `eve.json` live, em `configs/suricata/logs/eve.json`, que a T14 monta no container do manager para o logcollector ler.
- `-k none` é necessário: os pcaps do CTU foram capturados com offload de checksum e, sem a flag, o stream engine gera milhares de alertas de checksum inválido que escondem as assinaturas ET.
- A severidade no `eve.json` é a escala do Suricata, de 1 (mais grave) a 4, e não o nível do Wazuh. As regras de correspondência da T16 definem o nível a partir dela: `ET MALWARE` sai com severidade 1 e `ET SCAN` com 2 ou 3.
- Campos disponíveis para o decoder da T15 nos alertas de assinatura: `timestamp`, `src_ip`, `src_port`, `dest_ip`, `dest_port`, `proto`, `app_proto`, `direction`, `alert.signature`, `alert.signature_id`, `alert.category`, `alert.severity` e, quando o evento é HTTP, `http.hostname` e `http.url`.
- Rótulos de referência: `botnet-capture-20110810-neris.pcap` é o Neris, `botnet-capture-20110812-rbot.pcap` é o Rbot. O rbot rende 31.663 alertas de SSH scan, volume que serve de insumo para a análise de ruído da T40.

## Entregáveis

- `docs/guides/replay-pcap.md`
- `configs/suricata/docker-compose.yml` (volume read-only `/pcaps`)
- `docs/reports/T13-malicious-pcaps.md`
- `assets/pcaps/` com os dois pcaps e as URLs de origem no guia (pasta não versionada)

## Acompanhamento

- Os dois pcaps públicos rodam em replay offline e geram assinatura `ET MALWARE` (neris) e `ET SCAN` (rbot), com 1.036 e 41.822 alertas de assinatura respectivamente.
- A dificuldade mais interessante foi o replay inicial sem nenhuma assinatura ET: o pcap vinha de rede pública e o `HOME_NET` do projeto não a cobria, então as assinaturas de direção ficaram mudas até o ajuste pela linha de comando.
- Próximo passo da semana: T14, montar o `eve.json` do Suricata no container do manager e configurar o logcollector para receber os eventos brutos no Wazuh.
