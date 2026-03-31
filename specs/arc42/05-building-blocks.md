# 05 — Visão de Blocos de Construção

## Whitebox — Sistema Geral

| Módulo | Responsabilidade | Tecnologia |
|--------|-----------------|------------|
| **apps/web** | Dashboard do operador, UI em tempo real | Next.js 16.2, React 19, Tailwind v4, shadcn/ui |
| **apps/api** | API REST, webhooks, jobs, WebSocket | NestJS 11, Fastify, Socket.IO, BullMQ |
| **packages/shared** | Tipos TypeScript, enums, constantes compartilhadas | TypeScript |

## Nível 2 — Módulos do Backend (apps/api)

### IFoodAdapter

| Componente | Responsabilidade |
|-----------|-----------------|
| `IFoodWebhookController` | Recebe POST do iFood, responde 202, enfileira evento |
| `IFoodPollingJob` | Job BullMQ recorrente (30s), consulta eventos via polling |
| `IFoodAcknowledgmentService` | Envia acknowledgment para todos os eventos recebidos |
| `IFoodOrderFetcher` | Busca detalhes do pedido via GET /order/v1.0/orders/{id} |
| `IFoodAuthService` | Gerencia OAuth2 tokens para API iFood |

### WhatsAppAdapter

| Componente | Responsabilidade |
|-----------|-----------------|
| `WhatsAppWebhookController` | Recebe mensagens da Evolution API |
| `WhatsAppNLPService` | Envia mensagem para Claude Haiku, recebe pedido estruturado |
| `ConversationService` | Persiste histórico de conversas por WhatsApp number |

### OrderHub

| Componente | Responsabilidade |
|-----------|-----------------|
| `OrderNormalizerService` | Transforma pedido de qualquer fonte para modelo interno |
| `OrderRepository` | CRUD de pedidos e itens via Drizzle ORM |
| `StatusTransitionService` | Valida e aplica transições de status (state machine) |
| `OrderEventEmitter` | Emite eventos Socket.IO (`new_order`, `order_status_updated`) |

### AuthModule

| Componente | Responsabilidade |
|-----------|-----------------|
| `BetterAuthProvider` | Configuração do Better Auth com JWT |
| `AuthMiddleware` | Validação de JWT em rotas protegidas |
| `TenantGuard` | Injeta store_id no contexto da request e na sessão PostgreSQL |

### DashboardModule

| Componente | Responsabilidade |
|-----------|-----------------|
| `OrdersController` | API REST para listagem, detalhes e atualização de status |
| `DashboardGateway` | Socket.IO gateway com rooms por store_id |

## Nível 3 — Fluxo de Dados

```
┌──────────────────────────────────────────────────────────────┐
│                        apps/api                              │
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌──────────────┐     │
│  │ IFoodAdapter │    │ WhatsApp    │    │ Dashboard    │     │
│  │             │    │ Adapter     │    │ Module       │     │
│  │ Webhook ────┤    │ Webhook ────┤    │              │     │
│  │ Polling ────┤    │ NLP ────────┤    │ REST API ◄───┼──── Browser
│  │ Ack ────────┤    │ Conversation│    │ Socket.IO ◄──┼──── Browser
│  └──────┬──────┘    └──────┬──────┘    └──────▲───────┘     │
│         │                  │                   │             │
│         ▼                  ▼                   │             │
│  ┌─────────────────────────────────────────────┤             │
│  │              OrderHub                       │             │
│  │  Normalizer → Repository → EventEmitter ────┘             │
│  │                    ↕                                      │
│  │           StatusTransition                                │
│  └─────────────────────┬───────────────────────┘             │
│                        │                                     │
│                        ▼                                     │
│  ┌──────────────┐  ┌──────────────┐                          │
│  │ PostgreSQL   │  │ Redis        │                          │
│  │ (Neon)       │  │ (BullMQ)     │                          │
│  └──────────────┘  └──────────────┘                          │
└──────────────────────────────────────────────────────────────┘
```
