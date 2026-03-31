# 06 — Visão de Runtime

## Cenário 1: Pedido iFood via Webhook

```
iFood           WebhookCtrl      BullMQ         OrderFetcher     Normalizer      DB            Socket.IO
  │                 │               │               │               │             │               │
  │  POST /webhook  │               │               │               │             │               │
  │────────────────►│               │               │               │             │               │
  │  202 Accepted   │               │               │               │             │               │
  │◄────────────────│               │               │               │             │               │
  │                 │  enqueue job  │               │               │             │               │
  │                 │──────────────►│               │               │             │               │
  │                 │               │  process job  │               │             │               │
  │                 │               │──────────────►│               │             │               │
  │                 │               │               │  GET /orders  │             │               │
  │                 │               │               │──────────────►│ (iFood API) │               │
  │                 │               │               │◄──────────────│             │               │
  │                 │               │               │  normalize    │             │               │
  │                 │               │               │──────────────►│             │               │
  │                 │               │               │               │  save order │               │
  │                 │               │               │               │────────────►│               │
  │                 │               │               │               │             │  emit event   │
  │                 │               │               │               │             │──────────────►│
  │                 │               │               │               │             │               │──► Dashboard
```

### Passos detalhados:
1. iFood envia POST com evento `PLACED` para `/api/webhooks/ifood`
2. Controller salva evento em `ifood_events`, responde `202 Accepted` imediatamente
3. Job é enfileirado no BullMQ para processamento assíncrono
4. Worker processa job: verifica deduplicação, busca detalhes via `GET /order/v1.0/orders/{id}`
5. `OrderNormalizerService` transforma dados iFood no modelo interno
6. Pedido salvo em `orders` + `order_items`
7. `OrderEventEmitter` emite `new_order` via Socket.IO na room do `store_id`
8. `IFoodAcknowledgmentService` envia POST de acknowledgment

## Cenário 2: Pedido WhatsApp

```
WhatsApp      Evolution API    WebhookCtrl     NLPService       Normalizer      DB           Socket.IO
  │               │               │               │               │             │               │
  │  mensagem     │               │               │               │             │               │
  │──────────────►│               │               │               │             │               │
  │               │  POST webhook │               │               │             │               │
  │               │──────────────►│               │               │             │               │
  │               │               │  save convo   │               │             │               │
  │               │               │──────────────►│ (conversations)│            │               │
  │               │               │  call Claude  │               │             │               │
  │               │               │──────────────►│               │             │               │
  │               │               │               │  Claude Haiku │             │               │
  │               │               │               │──────────────►│ (Anthropic) │               │
  │               │               │               │◄──────────────│             │               │
  │               │               │               │  structured   │             │               │
  │               │               │               │──────────────►│             │               │
  │               │               │               │               │  save order │               │
  │               │               │               │               │────────────►│               │
  │               │               │               │               │             │  emit event   │
  │               │               │               │               │             │──────────────►│
```

### Passos detalhados:
1. Cliente envia mensagem WhatsApp
2. Evolution API recebe e envia webhook POST para `/api/webhooks/whatsapp`
3. Mensagem salva em `conversations` (histórico)
4. `WhatsAppNLPService` envia mensagem para Claude Haiku 4.5 com prompt estruturado
5. Claude retorna pedido estruturado: itens, quantidades, observações
6. `OrderNormalizerService` transforma em modelo interno com `source='whatsapp'`
7. Pedido salvo em `orders` + `order_items`
8. `OrderEventEmitter` emite `new_order` via Socket.IO

## Cenário 3: Atualização de Status pelo Operador

```
Operador        Dashboard        API              StatusService    DB            Socket.IO
  │               │               │               │               │               │
  │  click btn    │               │               │               │             │
  │──────────────►│               │               │               │             │
  │               │  PATCH /status│               │               │             │
  │               │──────────────►│               │               │             │
  │               │               │  validate     │               │             │
  │               │               │──────────────►│               │             │
  │               │               │               │  update DB    │             │
  │               │               │               │──────────────►│             │
  │               │               │               │  save history │             │
  │               │               │               │──────────────►│             │
  │               │               │  200 OK       │               │             │
  │               │◄──────────────│               │               │             │
  │               │               │               │  emit update  │             │
  │               │               │               │──────────────────────────►  │
  │               │               │               │               │             │──► Outros
```

### Passos detalhados:
1. Operador clica no botão de próximo status (ex: "Confirmar")
2. Dashboard envia `PATCH /api/orders/:id/status` com novo status
3. `StatusTransitionService` valida a transição (ex: PLACED → CONFIRMED é válido)
4. Status atualizado em `orders`, registro criado em `order_status_history`
5. Response 200 para o dashboard
6. `OrderEventEmitter` emite `order_status_updated` para todos na room do store

## Cenário 4: Polling iFood (Job Recorrente)

### Passos detalhados:
1. BullMQ dispara job a cada 30 segundos
2. Job faz `GET /events/v1.0/events:polling` com token OAuth2
3. Para cada evento recebido:
   a. Verifica se `event_id` já existe em `ifood_events` (deduplicação)
   b. Se novo: salva e enfileira para processamento
   c. Se duplicado: ignora
4. Envia `POST /events/v1.0/events/acknowledgment` para TODOS os eventos retornados
5. Eventos PLACED seguem o mesmo fluxo do Cenário 1 (a partir do passo 4)
