# Guias de reprodução

Guias passo a passo para reproduzir configurações e procedimentos do projeto a partir de um clone limpo. Usados quando um entregável não é um arquivo simples de copiar (VM, agente, dashboards, integrações, replay de pcaps).

Formato de cada guia: objetivo, pré-requisitos, passos, verificação.

| Guia | Cobre |
|---|---|
| `install-docker.md` | Docker CE e plugin Compose na máquina SOC (T03) |
| `start-wazuh-stack.md` | Stack do Wazuh, portas publicadas e verificação (T06, T08) |
| `victim-vm.md` | VM vítima no KVM/libvirt, acesso ssh, snapshot e agente Wazuh (T05, T07, T09) |
| `start-suricata.md` | Suricata em container, modo live sobre a ponte do libvirt (T12) |
| `replay-pcap.md` | Replay de pcaps públicos e alertas de assinatura (T13) |
| `suricata-wazuh.md` | Feed dos alertas do Suricata no Wazuh, regras de nível e conferência no dashboard (T14 a T17) |

Novos guias entram nesta tabela.
