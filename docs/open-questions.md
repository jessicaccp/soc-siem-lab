# Perguntas em aberto

Registro de tudo que ainda não está decidido ou documentado no projeto. Perguntas resolvidas são movidas para `docs/decisions.md` (criado na T35) e, quando necessário, refletidas no `ROADMAP.md` (edição mínima, só para mudanças fortes).

## Em aberto

- Onde roda a VM vítima: dentro do WSL2 da máquina SOC (o `/dev/kvm` está disponível) ou em uma segunda máquina da rede? A resposta define o desenho da semana 2 e se a T08 precisa de mudança de rede no Windows (portproxy e firewall) para o agente alcançar o manager nas portas 1514, 1515 e 55000. Qualquer alteração de rede no host precisa de aviso prévio à usuária.
- Na T48, confirmar se prender o dashboard em `127.0.0.1` mantém o acesso pelo navegador do Windows. Hoje o acesso funciona por `localhost` do WSL2 e a porta 443 está publicada em todas as interfaces.

## Resolvidas

1. Acompanhamento com demo ao vivo e repositório público (GitHub). Resolvida em 28/08/2026.
2. Vítima em VM (KVM) na máquina vítima, ambiente isolado do uso diário. Resolvida em 28/08/2026.
3. Escopo do projeto: individual, com IDs T01 a T56 em ordem de execução, prioridade P0/P1, escopo mínimo por semana e matriz de cobertura. Resolvida em 13/09/2026.
4. Máquinas: as duas ficam disponíveis durante todo o semestre e podem rodar em paralelo na apresentação. O Grafana entra como atividade opcional (T32) e o limite de RAM do Shuffle é boa prática de estabilidade (R4). Resolvida em 13/09/2026.
