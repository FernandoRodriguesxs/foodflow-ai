# Design — Painel de Pedidos Centralizados

## 1. Visão Arquitetural

### Princípios
- **Event-driven**: pedidos chegam como eventos (webhooks) e são processados assincronamente
- **Monorepo**: frontend e backend no mesmo repositório com tipos compartilhados
- **Multi-tenant first**: isolamento de dados via RLS desde o dia 1
- **Adapter pattern**: cada canal de pedido (iFood, WhatsApp) é um adapter independente
- **Processamento assíncrono**: webhooks respondem imediatamente, processamento via filas

### Contexto Arquitetural
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   iFood     │     │  WhatsApp   │     │  Operador   │
│   API       │     │  Evolution  │     │  Browser    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                    │
       │ webhook/polling   │ webhook            │ HTTPS + WSS
       ▼                   ▼                    ▼
┌──────────────────────────────────────────────────────┐
│                    NestJS API                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ iFoodAdpt│  │ WA Adapt │  │ OrderHub         │   │
│  │          │  │          │  │ Normalizer       │   │
│  │ Webhook  │  │ Webhook  │  │ StatusTransition │   │
│  │ Polling  │  │ NLP      │  │ EventEmitter     │   │
│  │ Ack      │  │          │  │                  │   │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘   │
│       └──────────────┴─────────────────┘             │
│                      │                                │
│            ┌─────────┼─────────┐                      │
│            ▼         ▼         ▼                      │
│       PostgreSQL   Redis    Socket.IO                 │
│       (Neon)     (BullMQ)                             │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│                    Next.js Web                        │
│  Login │ Dashboard │ OrderList │ OrderCard            │
└──────────────────────────────────────────────────────┘
```

## 2. Arquitetura de Alto Nível

### Containers

| Container | Tecnologia | Responsabilidade |
|-----------|-----------|-----------------|
| apps/web | Next.js 16.2, React 19, Tailwind v4, shadcn/ui | Dashboard do operador |
| apps/api | NestJS 11, Fastify, Socket.IO, BullMQ | API, webhooks, jobs, real-time |
| packages/shared | TypeScript | Tipos, enums, constantes compartilhadas |
| PostgreSQL | Neon Serverless v17 | Persistência com RLS |
| Redis | Redis 8 | Filas BullMQ, cache |

## 3. Decisões Arquiteturais

| ADR | Decisão | Referência |
|-----|---------|-----------|
| ADR-0001 | Usar polling + webhook para iFood | [specs/adr/0001-polling-plus-webhook.md](../../specs/adr/0001-polling-plus-webhook.md) |
| ADR-0002 | Socket.IO para real-time | [specs/adr/0002-socket-io-realtime.md](../../specs/adr/0002-socket-io-realtime.md) |
| ADR-0003 | Drizzle ORM | [specs/adr/0003-drizzle-orm.md](../../specs/adr/0003-drizzle-orm.md) |
| ADR-0004 | Neon PostgreSQL | [specs/adr/0004-neon-postgres.md](../../specs/adr/0004-neon-postgres.md) |

## 4. Estrutura de Código

```
foodflow-ai/
├── apps/
│   ├── web/                          # Next.js 16.2 frontend
│   │   ├── src/
│   │   │   ├── app/                  # App Router pages
│   │   │   │   ├── (auth)/           # Login, Register
│   │   │   │   ├── (dashboard)/      # Dashboard protegido
│   │   │   │   │   └── orders/       # Lista de pedidos
│   │   │   │   └── layout.tsx
│   │   │   ├── components/           # Componentes React
│   │   │   │   ├── ui/               # shadcn/ui components
│   │   │   │   ├── order-list.tsx
│   │   │   │   ├── order-card.tsx
│   │   │   │   └── status-button.tsx
│   │   │   ├── hooks/                # Custom hooks
│   │   │   │   ├── use-socket.ts
│   │   │   │   └── use-orders.ts
│   │   │   └── lib/                  # Utilitários
│   │   │       ├── api.ts            # HTTP client
│   │   │       └── auth.ts           # Better Auth client
│   │   └── package.json
│   │
│   └── api/                          # NestJS 11 backend
│       ├── src/
│       │   ├── ifood/                # IFoodAdapter module
│       │   │   ├── ifood.module.ts
│       │   │   ├── ifood-webhook.controller.ts
│       │   │   ├── ifood-polling.job.ts
│       │   │   ├── ifood-ack.service.ts
│       │   │   ├── ifood-order-fetcher.service.ts
│       │   │   └── ifood-auth.service.ts
│       │   ├── whatsapp/             # WhatsAppAdapter module
│       │   │   ├── whatsapp.module.ts
│       │   │   ├── whatsapp-webhook.controller.ts
│       │   │   ├── whatsapp-nlp.service.ts
│       │   │   └── conversation.service.ts
│       │   ├── orders/               # OrderHub module
│       │   │   ├── orders.module.ts
│       │   │   ├── orders.controller.ts
│       │   │   ├── order-normalizer.service.ts
│       │   │   ├── order.repository.ts
│       │   │   ├── status-transition.service.ts
│       │   │   └── order-event-emitter.service.ts
│       │   ├── auth/                 # AuthModule
│       │   │   ├── auth.module.ts
│       │   │   ├── auth.middleware.ts
│       │   │   └── tenant.guard.ts
│       │   ├── dashboard/            # DashboardModule
│       │   │   ├── dashboard.module.ts
│       │   │   └── dashboard.gateway.ts
│       │   ├── database/             # Database config + schemas
│       │   │   ├── database.module.ts
│       │   │   ├── drizzle.config.ts
│       │   │   └── schemas/
│       │   │       ├── stores.schema.ts
│       │   │       ├── users.schema.ts
│       │   │       ├── orders.schema.ts
│       │   │       ├── order-items.schema.ts
│       │   │       ├── order-status-history.schema.ts
│       │   │       ├── conversations.schema.ts
│       │   │       └── ifood-events.schema.ts
│       │   └── main.ts
│       └── package.json
│
├── packages/
│   └── shared/                       # Tipos compartilhados
│       ├── src/
│       │   ├── types/
│       │   │   ├── order.ts
│       │   │   ├── store.ts
│       │   │   └── events.ts
│       │   └── enums/
│       │       ├── order-status.ts
│       │       └── order-source.ts
│       └── package.json
│
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## 5. Modelo de Dados

### Diagrama ER

```
stores 1──N users
stores 1──N orders
stores 1──N conversations
stores 1──N ifood_events
orders 1──N order_items
orders 1──N order_status_history
conversations 0..1──1 orders
```

### Tabelas

#### stores
| Coluna | Tipo | Constraints |
|--------|------|------------|
| id | uuid | PK, default gen_random_uuid() |
| name | varchar(255) | NOT NULL |
| slug | varchar(100) | UNIQUE, NOT NULL |
| ifood_merchant_id | varchar(255) | NULLABLE |
| whatsapp_number | varchar(20) | NULLABLE |
| created_at | timestamp | DEFAULT now() |
| updated_at | timestamp | DEFAULT now() |

#### users
| Coluna | Tipo | Constraints |
|--------|------|------------|
| id | uuid | PK, default gen_random_uuid() |
| store_id | uuid | FK → stores.id, NOT NULL |
| email | varchar(255) | UNIQUE, NOT NULL |
| name | varchar(255) | NOT NULL |
| password_hash | varchar(255) | NOT NULL |
| role | enum('owner','operator') | DEFAULT 'operator' |
| created_at | timestamp | DEFAULT now() |

#### orders
| Coluna | Tipo | Constraints |
|--------|------|------------|
| id | uuid | PK, default gen_random_uuid() |
| store_id | uuid | FK → stores.id, NOT NULL |
| external_id | varchar(255) | NULLABLE (iFood order ID) |
| source | enum('ifood','whatsapp') | NOT NULL |
| status | enum('PLACED','CONFIRMED','DISPATCHED','CONCLUDED','CANCELLED') | DEFAULT 'PLACED' |
| customer_name | varchar(255) | NULLABLE |
| customer_phone | varchar(20) | NULLABLE |
| total | decimal(10,2) | NULLABLE |
| raw_data | jsonb | NULLABLE (dados brutos da fonte) |
| notes | text | NULLABLE |
| created_at | timestamp | DEFAULT now() |
| updated_at | timestamp | DEFAULT now() |

#### order_items
| Coluna | Tipo | Constraints |
|--------|------|------------|
| id | uuid | PK, default gen_random_uuid() |
| order_id | uuid | FK → orders.id, NOT NULL |
| name | varchar(255) | NOT NULL |
| quantity | integer | NOT NULL, CHECK > 0 |
| unit_price | decimal(10,2) | NULLABLE |
| notes | text | NULLABLE |

#### order_status_history
| Coluna | Tipo | Constraints |
|--------|------|------------|
| id | uuid | PK, default gen_random_uuid() |
| order_id | uuid | FK → orders.id, NOT NULL |
| from_status | varchar(20) | NOT NULL |
| to_status | varchar(20) | NOT NULL |
| changed_by | uuid | FK → users.id, NULLABLE |
| changed_at | timestamp | DEFAULT now() |

#### conversations
| Coluna | Tipo | Constraints |
|--------|------|------------|
| id | uuid | PK, default gen_random_uuid() |
| store_id | uuid | FK → stores.id, NOT NULL |
| whatsapp_number | varchar(20) | NOT NULL |
| messages | jsonb | NOT NULL, DEFAULT '[]' |
| order_id | uuid | FK → orders.id, NULLABLE |
| created_at | timestamp | DEFAULT now() |
| updated_at | timestamp | DEFAULT now() |

#### ifood_events
| Coluna | Tipo | Constraints |
|--------|------|------------|
| id | uuid | PK, default gen_random_uuid() |
| store_id | uuid | FK → stores.id, NOT NULL |
| event_id | varchar(255) | UNIQUE, NOT NULL |
| event_type | varchar(100) | NOT NULL |
| payload | jsonb | NOT NULL |
| acknowledged | boolean | DEFAULT false |
| processed | boolean | DEFAULT false |
| created_at | timestamp | DEFAULT now() |

### Índices

| Tabela | Colunas | Tipo |
|--------|---------|------|
| orders | store_id, created_at DESC | B-tree |
| orders | store_id, status | B-tree |
| orders | external_id | B-tree (partial: WHERE external_id IS NOT NULL) |
| ifood_events | event_id | Unique |
| ifood_events | store_id, processed | B-tree |
| conversations | store_id, whatsapp_number | B-tree |

## 6. Fluxos de Dados

### Fluxo 1: Pedido iFood
```
iFood POST → WebhookController (202) → save ifood_events → BullMQ enqueue
→ Worker: fetch order details → OrderNormalizer → save orders + order_items
→ OrderEventEmitter → Socket.IO emit 'new_order' na room store:{id}
→ IFoodAckService → POST acknowledgment
```

### Fluxo 2: Pedido WhatsApp
```
Evolution API POST → WhatsAppController → save conversations
→ WhatsAppNLPService → Claude Haiku → structured order
→ OrderNormalizer → save orders + order_items
→ OrderEventEmitter → Socket.IO emit 'new_order'
```

### Fluxo 3: Atualização de Status
```
Operador click → PATCH /api/orders/:id/status
→ StatusTransitionService (validate) → update orders.status
→ insert order_status_history → OrderEventEmitter
→ Socket.IO emit 'order_status_updated'
```

## 7. Segurança

- **RLS**: PostgreSQL Row-Level Security em todas as tabelas com `store_id`
- **JWT**: tokens assinados com Better Auth, contendo `user_id` e `store_id`
- **Webhook validation**: verificação de signature/API key nos endpoints de webhook
- **Input validation**: Zod schemas em todos os DTOs
- **CORS**: configurado para domínio do frontend apenas
- **Rate limiting**: 100 req/min por store em API REST

## 8. APIs Internas

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | /api/webhooks/ifood | Webhook iFood | Signature |
| POST | /api/webhooks/whatsapp | Webhook WhatsApp | API Key |
| POST | /api/auth/register | Registrar usuário | Público |
| POST | /api/auth/login | Login | Público |
| GET | /api/orders | Listar pedidos (paginado) | JWT |
| GET | /api/orders/:id | Detalhes do pedido | JWT |
| PATCH | /api/orders/:id/status | Atualizar status | JWT |
| GET | /api/orders/:id/history | Histórico de status | JWT |

## 9. Deploy

| Componente | Plataforma | URL |
|-----------|-----------|-----|
| Frontend (apps/web) | Vercel | app.foodflow.ai |
| Backend (apps/api) | Render | api.foodflow.ai |
| Banco de dados | Neon | (connection string) |
| Redis | Upstash/Redis Cloud | (connection string) |
| Evolution API | VPS self-hosted | (URL interna) |
