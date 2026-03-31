# Specs — Painel de Pedidos Centralizados

## 1. Visão Geral

Especificação técnica detalhada da V1 do FoodFlow AI: painel operacional que centraliza pedidos iFood e WhatsApp em tempo real.

## 2. Casos de Uso

### UC-001: Receber pedido iFood via webhook

- **Atores**: iFood Platform (sistema)
- **Pré-condições**: Restaurante cadastrado com `ifood_merchant_id` configurado
- **Fluxo principal**:
  1. iFood envia POST para `/api/webhooks/ifood` com evento no body
  2. Controller valida signature do request
  3. Controller salva evento em `ifood_events` com `acknowledged=false`, `processed=false`
  4. Controller responde `202 Accepted`
  5. Controller enfileira job `process-ifood-event` no BullMQ
  6. Worker verifica se `event_id` já existe (deduplicação)
  7. Worker faz GET `/order/v1.0/orders/{orderId}` para buscar detalhes
  8. `OrderNormalizerService` transforma dados para modelo interno
  9. Pedido salvo em `orders` + `order_items`
  10. `OrderEventEmitter` emite `new_order` via Socket.IO
  11. `IFoodAcknowledgmentService` envia POST de ack
- **Fluxo alternativo**: Se evento é duplicado (passo 6), pular para passo 11 (ack)
- **Pós-condições**: Pedido existe em `orders`, evento acknowledged

### UC-002: Polling de eventos iFood

- **Atores**: Sistema (BullMQ job)
- **Pré-condições**: Store com integração iFood ativa, token OAuth2 válido
- **Fluxo principal**:
  1. Job BullMQ dispara a cada 30 segundos
  2. Job faz GET `/events/v1.0/events:polling` com Bearer token
  3. Para cada evento retornado:
     a. Verifica se `event_id` existe em `ifood_events`
     b. Se novo: salva e enfileira para processamento
     c. Se duplicado: ignora processamento
  4. Envia acknowledgment para TODOS os eventos retornados
- **Pós-condições**: Novos eventos enfileirados, todos acknowledged

### UC-003: Enviar acknowledgment iFood

- **Atores**: Sistema
- **Pré-condições**: Evento recebido (via webhook ou polling)
- **Fluxo principal**:
  1. Coleta lista de `event_id`s pendentes de ack
  2. Envia POST `/events/v1.0/events/acknowledgment` com array de IDs
  3. Marca `acknowledged=true` em `ifood_events`
- **Pós-condições**: Eventos confirmados no iFood e no banco local

### UC-004: Receber pedido WhatsApp

- **Atores**: Cliente WhatsApp (via Evolution API)
- **Pré-condições**: Store com `whatsapp_number` configurado, Evolution API ativa
- **Fluxo principal**:
  1. Evolution API envia POST para `/api/webhooks/whatsapp`
  2. Controller identifica store pelo `whatsapp_number` do destinatário
  3. Mensagem salva em `conversations` (append ao array `messages`)
  4. Controller chama `WhatsAppNLPService` para interpretação
  5. NLP Service envia mensagem para Claude Haiku com prompt estruturado
  6. Claude retorna JSON com `{ items, customer_name, notes }`
  7. `OrderNormalizerService` cria pedido com `source='whatsapp'`
  8. Pedido salvo em `orders` + `order_items`
  9. `conversations.order_id` atualizado
  10. `OrderEventEmitter` emite `new_order`
- **Fluxo alternativo**: Se Claude classifica como "não é pedido", salvar apenas em conversations
- **Pós-condições**: Pedido criado (se aplicável), conversa persistida

### UC-005: Interpretar pedido com Claude Haiku

- **Atores**: Sistema
- **Pré-condições**: Mensagem WhatsApp recebida
- **Fluxo principal**:
  1. Monta prompt com instruções e mensagem do cliente
  2. Envia POST para `api.anthropic.com/v1/messages` com model `claude-haiku-4-5-20251001`
  3. Recebe resposta JSON estruturada
  4. Valida schema da resposta (items deve ser array não-vazio)
  5. Retorna objeto tipado `ParsedWhatsAppOrder`
- **Prompt template**:
  ```
  Você é um assistente de restaurante. Analise a mensagem do cliente e extraia o pedido.
  Retorne APENAS um JSON com o formato:
  {
    "is_order": true/false,
    "items": [{ "name": "...", "quantity": N, "notes": "..." }],
    "customer_name": "..." (se mencionado),
    "notes": "..." (observações gerais)
  }
  Se a mensagem não for um pedido, retorne is_order: false.
  ```
- **Pós-condições**: Pedido estruturado ou classificação "não é pedido"

### UC-006: Atualizar status de pedido

- **Atores**: Operador do restaurante
- **Pré-condições**: Operador autenticado, pedido pertence ao store do operador
- **Fluxo principal**:
  1. Operador envia PATCH `/api/orders/:id/status` com `{ status: "CONFIRMED" }`
  2. Controller valida JWT e extrai `store_id`
  3. `StatusTransitionService` busca pedido e valida transição
  4. Se válida: atualiza `orders.status`, insere em `order_status_history`
  5. `OrderEventEmitter` emite `order_status_updated`
  6. Retorna 200 com pedido atualizado
- **Fluxo alternativo**: Transição inválida → retorna 422
- **Pós-condições**: Status atualizado, histórico registrado, evento emitido

### UC-007: Visualizar painel em tempo real

- **Atores**: Operador do restaurante
- **Pré-condições**: Operador autenticado
- **Fluxo principal**:
  1. Operador acessa `/dashboard/orders`
  2. Frontend faz GET `/api/orders?status=PLACED,CONFIRMED,DISPATCHED`
  3. Frontend conecta Socket.IO com JWT no handshake
  4. Socket.IO autentica e join na room `store:{store_id}`
  5. Lista de pedidos renderizada
  6. Ao receber `new_order`: adiciona pedido no topo da lista
  7. Ao receber `order_status_updated`: atualiza status do pedido na lista
- **Pós-condições**: Dashboard exibe estado atual em tempo real

## 3. Schemas do Banco (Drizzle)

```typescript
// stores.schema.ts
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const stores = pgTable('stores', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  ifoodMerchantId: varchar('ifood_merchant_id', { length: 255 }),
  whatsappNumber: varchar('whatsapp_number', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// users.schema.ts
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { pgEnum } from 'drizzle-orm/pg-core';
import { stores } from './stores.schema';

export const userRoleEnum = pgEnum('user_role', ['owner', 'operator']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  storeId: uuid('store_id').notNull().references(() => stores.id),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('operator').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// orders.schema.ts
import { pgTable, uuid, varchar, timestamp, decimal, jsonb, text } from 'drizzle-orm/pg-core';
import { pgEnum } from 'drizzle-orm/pg-core';
import { stores } from './stores.schema';

export const orderSourceEnum = pgEnum('order_source', ['ifood', 'whatsapp']);
export const orderStatusEnum = pgEnum('order_status', [
  'PLACED', 'CONFIRMED', 'DISPATCHED', 'CONCLUDED', 'CANCELLED'
]);

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  storeId: uuid('store_id').notNull().references(() => stores.id),
  externalId: varchar('external_id', { length: 255 }),
  source: orderSourceEnum('source').notNull(),
  status: orderStatusEnum('status').default('PLACED').notNull(),
  customerName: varchar('customer_name', { length: 255 }),
  customerPhone: varchar('customer_phone', { length: 20 }),
  total: decimal('total', { precision: 10, scale: 2 }),
  rawData: jsonb('raw_data'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// order-items.schema.ts
import { pgTable, uuid, varchar, integer, decimal, text } from 'drizzle-orm/pg-core';
import { orders } from './orders.schema';

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  name: varchar('name', { length: 255 }).notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }),
  notes: text('notes'),
});

// order-status-history.schema.ts
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { orders } from './orders.schema';
import { users } from './users.schema';

export const orderStatusHistory = pgTable('order_status_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  fromStatus: varchar('from_status', { length: 20 }).notNull(),
  toStatus: varchar('to_status', { length: 20 }).notNull(),
  changedBy: uuid('changed_by').references(() => users.id),
  changedAt: timestamp('changed_at').defaultNow().notNull(),
});

// conversations.schema.ts
import { pgTable, uuid, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { stores } from './stores.schema';
import { orders } from './orders.schema';

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  storeId: uuid('store_id').notNull().references(() => stores.id),
  whatsappNumber: varchar('whatsapp_number', { length: 20 }).notNull(),
  messages: jsonb('messages').notNull().default([]),
  orderId: uuid('order_id').references(() => orders.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ifood-events.schema.ts
import { pgTable, uuid, varchar, jsonb, boolean, timestamp } from 'drizzle-orm/pg-core';
import { stores } from './stores.schema';

export const ifoodEvents = pgTable('ifood_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  storeId: uuid('store_id').notNull().references(() => stores.id),
  eventId: varchar('event_id', { length: 255 }).notNull().unique(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  payload: jsonb('payload').notNull(),
  acknowledged: boolean('acknowledged').default(false).notNull(),
  processed: boolean('processed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

## 4. APIs Internas

### POST /api/webhooks/ifood
- **Auth**: Signature validation (header)
- **Request body**: `{ id, code, orderId, ... }` (iFood event format)
- **Response**: `202 Accepted` (corpo vazio)
- **Tempo máximo**: 5 segundos

### POST /api/webhooks/whatsapp
- **Auth**: API Key (header `apikey`)
- **Request body**: Evolution API message format
- **Response**: `200 OK`

### POST /api/auth/register
- **Auth**: Público
- **Request body**: `{ email, password, name, storeName, storeSlug }`
- **Response**: `201 { user, store, token }`
- **Validação**: email único, slug único, password min 8 chars

### POST /api/auth/login
- **Auth**: Público
- **Request body**: `{ email, password }`
- **Response**: `200 { user, token }`
- **Erro**: 401 se credenciais inválidas

### GET /api/orders
- **Auth**: JWT Bearer
- **Query params**:
  - `status`: comma-separated (ex: `PLACED,CONFIRMED`)
  - `source`: `ifood` | `whatsapp`
  - `page`: número (default 1)
  - `limit`: número (default 20, max 100)
- **Response**: `{ data: Order[], meta: { total, page, limit, totalPages } }`
- **RLS**: automaticamente filtrado por `store_id` do JWT

### GET /api/orders/:id
- **Auth**: JWT Bearer
- **Response**: `{ order: Order, items: OrderItem[] }`
- **Errors**: 404 se não encontrado (ou fora do tenant)

### PATCH /api/orders/:id/status
- **Auth**: JWT Bearer
- **Request body**: `{ status: "CONFIRMED" }`
- **Response**: `200 { order: Order }`
- **Errors**: 404 (não encontrado), 422 (transição inválida)
- **Side effects**: insere em `order_status_history`, emite Socket.IO `order_status_updated`

### GET /api/orders/:id/history
- **Auth**: JWT Bearer
- **Response**: `{ history: OrderStatusHistory[] }`

## 5. Regras de Negócio

| ID | Regra | Descrição |
|----|-------|-----------|
| RN-001 | Webhook response timeout | Endpoint iFood DEVE responder 202 em ≤ 5 segundos |
| RN-002 | Acknowledgment obrigatório | TODOS os eventos iFood devem receber acknowledgment |
| RN-003 | Deduplicação por event_id | Eventos com mesmo `event_id` não geram pedidos duplicados |
| RN-004 | Transições de status válidas | Apenas transições definidas na state machine são permitidas |
| RN-005 | Isolamento por tenant | Dados filtrados por `store_id` via RLS em todas as queries |
| RN-006 | Extração de itens WhatsApp | Claude Haiku deve extrair: nome do item, quantidade, observações |
| RN-007 | Polling obrigatório | Polling iFood a cada 30s para manter loja online |

## 6. Estados e Transições

### State Machine — Pedido

```
       ┌──────────────────────────────┐
       │                              │
       ▼                              │
    PLACED ──────► CONFIRMED ──────► DISPATCHED ──────► CONCLUDED
       │              │                  │
       └──────────────┴──────────────────┴──────────► CANCELLED
```

### Tabela de Transições Válidas

| De | Para | Ação UI |
|----|------|---------|
| PLACED | CONFIRMED | Botão "Confirmar" |
| PLACED | CANCELLED | Botão "Cancelar" |
| CONFIRMED | DISPATCHED | Botão "Despachar" |
| CONFIRMED | CANCELLED | Botão "Cancelar" |
| DISPATCHED | CONCLUDED | Botão "Concluir" |
| DISPATCHED | CANCELLED | Botão "Cancelar" |

**Estados finais** (sem transições de saída): `CONCLUDED`, `CANCELLED`

## 7. Integrações

### iFood API (`merchant-api.ifood.com.br`)

| Endpoint | Método | Descrição | Auth |
|----------|--------|-----------|------|
| `/authentication/v1.0/oauth/token` | POST | Obter token OAuth2 | client_credentials |
| `/events/v1.0/events:polling` | GET | Polling de eventos | OAuth2 Bearer |
| `/order/v1.0/orders/{id}` | GET | Detalhes do pedido | OAuth2 Bearer |
| `/events/v1.0/events/acknowledgment` | POST | Confirmar eventos | OAuth2 Bearer |

**OAuth2**: `grant_type=client_credentials` com `client_id` e `client_secret`. Token cacheado em Redis até expiração (~1h).

### Evolution API (WhatsApp Gateway)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| Webhook configurado | POST (recebido) | Mensagens do WhatsApp |

**Payload**: `{ instance, data: { key: { remoteJid }, message: { conversation } } }`

### Claude Haiku API (Anthropic)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/v1/messages` | POST | Interpretar mensagem WhatsApp |

- **Model**: `claude-haiku-4-5-20251001`
- **Max tokens**: 1024
- **Temperature**: 0 (determinístico)
- **System prompt**: instruções de extração de pedido (ver UC-005)

### Socket.IO Events

| Evento | Direção | Payload | Descrição |
|--------|---------|---------|-----------|
| `new_order` | Server → Client | `{ order, items }` | Novo pedido criado |
| `order_status_updated` | Server → Client | `{ orderId, status, updatedAt }` | Status atualizado |

**Rooms**: `store:{store_id}` — cada store tem sua room isolada
**Auth**: JWT no handshake (`auth: { token }`)
