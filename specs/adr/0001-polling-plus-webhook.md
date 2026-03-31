# ADR-0001: Polling + Webhook para Integração iFood

## Status

Aceito

## Data

2026-03-31

## Contexto

A API do iFood oferece dois mecanismos para receber eventos de pedidos:

1. **Webhook (push)**: iFood envia POST para um endpoint configurado quando há novos eventos
2. **Polling (pull)**: Aplicação consulta `GET /events/v1.0/events:polling` periodicamente

Um requisito crítico é que o **polling deve ser executado a cada 30 segundos** para manter a loja online na plataforma iFood. Se o polling parar, a loja é marcada como offline e para de receber pedidos.

Além disso:
- Webhooks podem falhar (rede, timeout, deploy)
- Todos os eventos devem receber acknowledgment via `POST /events/v1.0/events/acknowledgment`
- Eventos podem ser recebidos duplicados (mesmo `id` via webhook e polling)

## Decisão

Utilizar **ambos os mecanismos simultaneamente**: webhook como canal primário para latência mínima, e polling como canal obrigatório que também funciona como fallback.

### Implementação:
- **Webhook**: endpoint `POST /api/webhooks/ifood` responde 202 em < 5s, enfileira processamento
- **Polling**: BullMQ recurring job a cada 30s, consulta API iFood
- **Deduplicação**: tabela `ifood_events` com constraint unique em `event_id`; antes de processar, verificar se evento já existe
- **Acknowledgment**: enviado para TODOS os eventos, independente da origem (webhook ou polling)

## Consequências

### Positivas
- **Latência mínima**: webhook entrega eventos em tempo real (~1s)
- **Resiliência**: polling captura eventos que o webhook perdeu (deploy, falha de rede)
- **Loja online**: polling mantém o status ativo na plataforma iFood
- **Confiabilidade**: dois canais redundantes praticamente eliminam perda de eventos

### Negativas
- **Complexidade de deduplicação**: necessário verificar `event_id` antes de processar
- **Custo de infraestrutura**: job recorrente consome recursos mesmo sem novos eventos
- **Mais código**: dois caminhos de ingestão para o mesmo tipo de dado

## Alternativas Consideradas

### A1: Apenas Webhook
- **Prós**: Implementação mais simples, latência ótima
- **Contras**: Loja fica offline sem polling; eventos perdidos durante deploys/falhas; **rejeitada por violar requisito obrigatório do iFood**

### A2: Apenas Polling
- **Prós**: Implementação mais simples, sem necessidade de endpoint público
- **Contras**: Latência de até 30s para novos pedidos; inaceitável para operação em tempo real

### A3: Polling com intervalo menor (5s)
- **Prós**: Menor latência que polling a 30s
- **Contras**: Possível rate limiting pela API iFood; documentação recomenda 30s; webhook já resolve latência
