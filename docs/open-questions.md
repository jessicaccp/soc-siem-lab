# Perguntas em aberto

Registro de tudo que ainda não está decidido ou documentado no projeto. Perguntas resolvidas são movidas para `docs/decisions.md` (criado na T35) e, quando necessário, refletidas no `ROADMAP.md` (edição mínima, só para mudanças fortes).

## Em aberto

- Na T48, confirmar se prender o dashboard em `127.0.0.1` mantém o acesso pelo navegador do Windows. Hoje o acesso funciona por `localhost` do WSL2 e a porta 443 está publicada em todas as interfaces.

## Resolvidas

1. Acompanhamento com demo ao vivo e repositório público (GitHub). Resolvida em 28/08/2026.
2. Vítima em VM (KVM) na máquina vítima, ambiente isolado do uso diário. Resolvida em 28/08/2026.
3. Escopo do projeto: individual, com IDs T01 a T56 em ordem de execução, prioridade P0/P1, escopo mínimo por semana e matriz de cobertura. Resolvida em 13/09/2026.
4. Máquinas: as duas ficam disponíveis durante todo o semestre e podem rodar em paralelo na apresentação. O Grafana entra como atividade opcional (T32) e o limite de RAM do Shuffle é boa prática de estabilidade (R4). Resolvida em 13/09/2026.
5. Local da VM vítima: dentro do host do projeto (WSL2, com KVM e rede isolada do libvirt), em vez de uma segunda máquina. Evita mudança de rede no Windows, mantém o tráfego visível ao Suricata pela ponte do libvirt e concentra a demo em um host só. Decisão reversível: se a virtualização aninhada der problema, a vítima volta para uma segunda máquina. Resolvida em 14/09/2026.
