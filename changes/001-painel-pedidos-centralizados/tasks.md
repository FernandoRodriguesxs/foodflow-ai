# Tasks — Painel de Pedidos Centralizados

> Decomposição atômica de tarefas para implementação da V1 do FoodFlow AI.
> Cada tarefa é completável em < 2 horas, tem objetivo único e é testável independentemente.

---

## Fase 1: Setup

### TASK-001: Setup monorepo Turborepo + pnpm
Entrada: repositório vazio com `.claude/` e `specs/` já existentes
Ação: inicializar Turborepo com pnpm workspaces; criar `apps/web` (Next.js 16.2 + React 19 + Tailwind CSS v4), `apps/api` (NestJS 11 + Fastify) e `packages/shared` (TypeScript); configurar `turbo.json` com pipelines build/lint/test
Saída: `pnpm install` funciona, `turbo run build` passa em todos os workspaces
Critério: estrutura de pastas conforme `design.md`, builds sem erros

### TASK-002: Configurar Drizzle ORM + conexão Neon
Entrada: monorepo configurado (TASK-001)
Ação: instalar `drizzle-orm`, `@neondatabase/serverless` e `drizzle-kit` em `apps/api`; criar `drizzle.config.ts` lendo `DATABASE_URL` de env; criar módulo `database.module.ts` no NestJS exportando instância do Drizzle
Saída: conexão com banco Neon estabelecida via driver serverless
Critério: script de teste de conexão `pnpm --filter api db:test` executa sem erros

---

## Fase 2: Schema do Banco

### TASK-003: Criar schema Drizzle — stores e users
Entrada: Drizzle configurado (TASK-002)
Ação: criar `stores.schema.ts` e `users.schema.ts` conforme definido em `specs.md` seção 3; criar enum `user_role`; incluir FK de users para stores
Saída: migração gerada com `drizzle-kit generate` e aplicada com `drizzle-kit push`
Critério: tabelas `stores` e `users` existem no banco com constraints corretas

### TASK-004: Criar schema Drizzle — orders e order_items
Entrada: tabelas stores/users existem (TASK-003)
Ação: criar `orders.schema.ts` e `order-items.schema.ts` conforme `specs.md`; criar enums `order_source` e `order_status`; incluir FKs e índices (store_id+created_at, store_id+status, external_id)
Saída: migração gerada e aplicada
Critério: tabelas `orders` e `order_items` existem com enums, FKs e índices

### TASK-005: Criar schema Drizzle — order_status_history, conversations, ifood_events
Entrada: tabelas orders existem (TASK-004)
Ação: criar `order-status-history.schema.ts`, `conversations.schema.ts` e `ifood-events.schema.ts` conforme `specs.md`; incluir constraint UNIQUE em `ifood_events.event_id`
Saída: migração gerada e aplicada
Critério: todas as 7 tabelas existem no banco, constraint unique em event_id funcional

---

## Fase 3: Auth e Multi-Tenant

### TASK-006: Configurar Better Auth
Entrada: monorepo com schema de users (TASK-003)
Ação: instalar `better-auth` em `apps/api`; configurar provider com PostgreSQL; criar endpoints `/api/auth/register` e `/api/auth/login`; JWT deve conter `user_id`, `store_id` e `role`; criar `auth.middleware.ts` para validar JWT em rotas protegidas
Saída: endpoints de login/register funcionais, JWT retornado no login
Critério: POST `/api/auth/register` cria user, POST `/api/auth/login` retorna JWT válido com store_id

### TASK-007: Implementar RLS multi-tenant
Entrada: schema completo (TASK-005) + auth (TASK-006)
Ação: criar migration SQL com `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` e `CREATE POLICY tenant_isolation` em orders, order_items (via join), order_status_history (via join), conversations, ifood_events; criar `tenant.guard.ts` que executa `SET LOCAL app.current_store_id` antes de cada request
Saída: queries automaticamente filtradas por tenant
Critério: query autenticada como store A não retorna dados de store B

---

## Fase 4: Integração iFood

### TASK-008: Criar IFoodAdapter — webhook receiver
Entrada: schema de ifood_events (TASK-005)
Ação: criar `ifood.module.ts` e `ifood-webhook.controller.ts`; endpoint POST `/api/webhooks/ifood` que: salva evento em `ifood_events`, responde 202, enfileira job `process-ifood-event` no BullMQ; instalar e configurar `@nestjs/bullmq`
Saída: webhook recebe evento e retorna 202 em < 5s, job criado na fila
Critério: POST para webhook salva em ifood_events, job aparece na fila Redis

### TASK-009: Criar IFoodAdapter — polling job
Entrada: BullMQ configurado (TASK-008)
Ação: criar `ifood-polling.job.ts` como BullMQ recurring job (30s); executa GET `/events/v1.0/events:polling` com OAuth2 token; deduplicar por `event_id` verificando tabela `ifood_events`; enfileirar eventos novos; criar `ifood-auth.service.ts` para gerenciar tokens OAuth2 com cache em Redis
Saída: job rodando a cada 30s, eventos novos enfileirados, duplicados ignorados
Critério: após 2 ciclos de polling, eventos novos no banco, duplicados não reprocessados

### TASK-010: Criar IFoodAdapter — acknowledgment
Entrada: webhook + polling (TASK-008, TASK-009)
Ação: criar `ifood-ack.service.ts` que envia POST `/events/v1.0/events/acknowledgment` com array de event IDs; chamar após receber eventos (webhook e polling); marcar `acknowledged=true` em `ifood_events`
Saída: todos os eventos recebidos são confirmados no iFood
Critério: campo `acknowledged=true` para todos os eventos após processamento

### TASK-011: Criar IFoodAdapter — buscar detalhes e processar pedido
Entrada: eventos enfileirados (TASK-008/009)
Ação: criar `ifood-order-fetcher.service.ts` como BullMQ worker que processa job `process-ifood-event`; para eventos PLACED: GET `/order/v1.0/orders/{orderId}`; extrair dados do pedido (cliente, itens, total); passar para OrderNormalizerService
Saída: dados completos do pedido iFood disponíveis para normalização
Critério: worker processa job, dados do pedido extraídos corretamente

---

## Fase 5: Order Hub

### TASK-012: Criar OrderHub — normalização de pedidos
Entrada: dados iFood disponíveis (TASK-011)
Ação: criar `orders.module.ts`, `order-normalizer.service.ts` e `order.repository.ts`; normalizer transforma payload iFood em modelo interno; repository salva em `orders` + `order_items` via Drizzle; retorna pedido criado
Saída: pedido normalizado salvo nas tabelas orders e order_items
Critério: pedido iFood salvo com `source='ifood'`, campos mapeados corretamente, itens persistidos

### TASK-013: Criar StatusTransitionService
Entrada: OrderRepository (TASK-012)
Ação: criar `status-transition.service.ts` com state machine; validar transições (PLACED→CONFIRMED, CONFIRMED→DISPATCHED, DISPATCHED→CONCLUDED, qualquer→CANCELLED); ao transicionar: atualizar `orders.status`, inserir em `order_status_history`
Saída: transições válidas aplicadas, inválidas rejeitadas com erro tipado
Critério: PLACED→CONFIRMED funciona, CONCLUDED→PLACED retorna `InvalidStatusTransitionError`

---

## Fase 6: Real-Time (Socket.IO)

### TASK-014: Configurar Socket.IO no NestJS
Entrada: NestJS configurado (TASK-001) + auth (TASK-006)
Ação: instalar `@nestjs/websockets` e `socket.io`; criar `dashboard.module.ts` e `dashboard.gateway.ts`; autenticação via JWT no handshake; rooms por `store:{store_id}`; ao conectar: join na room do store
Saída: conexão WebSocket funcional com rooms por tenant
Critério: cliente conecta com JWT, entra na room do store, recebe evento de teste

### TASK-015: Emitir eventos Socket.IO para pedidos
Entrada: OrderHub (TASK-012) + Socket.IO (TASK-014) + StatusTransition (TASK-013)
Ação: criar `order-event-emitter.service.ts`; emitir `new_order` (com dados do pedido) na room `store:{store_id}` após salvar pedido; emitir `order_status_updated` (com id, novo status) após transição de status
Saída: dashboard recebe eventos em tempo real
Critério: novo pedido → evento `new_order` recebido no socket; status atualizado → evento `order_status_updated` recebido

---

## Fase 7: Integração WhatsApp

### TASK-016: Criar WhatsAppAdapter — webhook receiver
Entrada: schema de conversations (TASK-005)
Ação: criar `whatsapp.module.ts` e `whatsapp-webhook.controller.ts`; endpoint POST `/api/webhooks/whatsapp` que: identifica store pelo `whatsapp_number`, salva mensagem em `conversations` (append ao JSON array); criar `conversation.service.ts`
Saída: mensagens WhatsApp recebidas e persistidas
Critério: POST simula mensagem Evolution API → mensagem salva em conversations com store correto

### TASK-017: Criar WhatsAppAdapter — interpretação com Claude Haiku
Entrada: webhook WhatsApp (TASK-016)
Ação: criar `whatsapp-nlp.service.ts`; instalar `@anthropic-ai/sdk`; enviar mensagem para Claude Haiku 4.5 com prompt estruturado (conforme specs.md UC-005); parsear resposta JSON; validar schema com zod; retornar `ParsedWhatsAppOrder`
Saída: pedido estruturado a partir de mensagem em linguagem natural
Critério: mensagem "2 pizzas margherita e 1 coca" retorna `{ is_order: true, items: [{name: "pizza margherita", quantity: 2}, {name: "coca-cola", quantity: 1}] }`

### TASK-018: Integrar WhatsApp com OrderHub
Entrada: NLP (TASK-017) + OrderHub (TASK-012) + EventEmitter (TASK-015)
Ação: no webhook controller, após interpretação com `is_order: true`: criar adapter para normalizer com `source='whatsapp'`; salvar pedido via OrderNormalizerService; atualizar `conversations.order_id`; emitir `new_order` via Socket.IO
Saída: pedido WhatsApp aparece no dashboard em tempo real
Critério: mensagem WhatsApp → pedido salvo com `source='whatsapp'` → evento `new_order` emitido

---

## Fase 8: API REST do Dashboard

### TASK-019: API de listagem de pedidos
Entrada: OrderRepository (TASK-012) + auth (TASK-006) + RLS (TASK-007)
Ação: criar `orders.controller.ts` com endpoint GET `/api/orders`; filtros: `status` (comma-separated), `source`, `page` (default 1), `limit` (default 20); ordenação por `created_at DESC`; paginação com `total`, `page`, `totalPages`
Saída: endpoint retorna lista paginada de pedidos filtrada por tenant
Critério: GET `/api/orders?status=PLACED,CONFIRMED&page=1&limit=10` retorna dados corretos

### TASK-020: API de atualização de status
Entrada: StatusTransitionService (TASK-013) + EventEmitter (TASK-015) + auth (TASK-006)
Ação: criar endpoint PATCH `/api/orders/:id/status` no OrdersController; request body: `{ status }` validado com Zod; chamar StatusTransitionService; se válido: retornar 200 com pedido atualizado; se inválido: retornar 422
Saída: status atualizado com histórico e evento Socket.IO emitido
Critério: PATCH com transição válida → 200 + history criado + socket emitido; inválida → 422

---

## Fase 9: Frontend Dashboard

### TASK-021: Dashboard Next.js — layout e autenticação
Entrada: auth configurada (TASK-006) + apps/web (TASK-001)
Ação: instalar shadcn/ui em apps/web; criar layout base com sidebar/header; criar páginas `/login` e `/register` com formulários; integrar Better Auth client para login/logout; criar middleware de proteção de rotas (`/dashboard/*` requer auth)
Saída: login funcional, layout base renderizado, rotas protegidas
Critério: usuário não autenticado → redirecionado para `/login`; autenticado → vê dashboard

### TASK-022: Dashboard Next.js — lista de pedidos em tempo real
Entrada: layout (TASK-021) + API (TASK-019) + Socket.IO (TASK-014)
Ação: criar hook `use-orders.ts` que faz fetch inicial via GET `/api/orders` e conecta Socket.IO; ao receber `new_order`: adicionar pedido no topo; ao receber `order_status_updated`: atualizar status na lista; criar componente `order-list.tsx` com filtros por status e source
Saída: lista de pedidos atualiza em tempo real sem refresh
Critério: novo pedido aparece automaticamente, status atualiza em tempo real

### TASK-023: Dashboard Next.js — card de pedido e ação de status
Entrada: lista (TASK-022) + API status (TASK-020)
Ação: criar componente `order-card.tsx` com: badge de source (iFood/WhatsApp), nome do cliente, lista de itens, total, status atual, timestamp; criar `status-button.tsx` com botão de próximo status contextual (Confirmar/Despachar/Concluir/Cancelar); ao clicar: PATCH `/api/orders/:id/status`
Saída: operador visualiza pedido completo e atualiza status com 1 clique
Critério: card exibe dados corretos, botão muda status, UI atualiza via Socket.IO

---

## Fase 10: Deploy e CI/CD

### TASK-024: Configurar CI/CD com GitHub Actions
Entrada: monorepo completo com testes
Ação: criar `.github/workflows/ci.yml` que executa em PRs: `pnpm install` → `turbo run lint` → `turbo run typecheck` → `turbo run test` → `turbo run build`; configurar cache de pnpm e turbo
Saída: CI roda automaticamente em PRs
Critério: PR aberta → checks executam e passam (ou falham com motivo claro)

### TASK-025: Deploy — Vercel (web) + Render (api)
Entrada: CI configurado (TASK-024)
Ação: configurar projeto Vercel para `apps/web` com root directory e build command; configurar Render Web Service para `apps/api`; configurar variáveis de ambiente em ambos (DATABASE_URL, REDIS_URL, IFOOD_*, WHATSAPP_*, ANTHROPIC_API_KEY, BETTER_AUTH_SECRET); configurar domínios customizados
Saída: aplicação acessível em produção
Critério: web abre no domínio Vercel, API responde GET `/health` no Render, WebSocket conecta

---

## Dependências entre Tarefas

```
TASK-001 ──► TASK-002 ──► TASK-003 ──► TASK-004 ──► TASK-005
                │              │                         │
                │              ▼                         │
                │         TASK-006 ──► TASK-007          │
                │              │                         │
                ▼              ▼                         ▼
           TASK-014       TASK-008 ──► TASK-009 ──► TASK-010
                │              │
                │              ▼
                │         TASK-011 ──► TASK-012 ──► TASK-013
                │                         │              │
                ▼                         ▼              ▼
           TASK-015 ◄───────────── TASK-012 + TASK-013
                │
                ▼
TASK-016 ──► TASK-017 ──► TASK-018
                              │
                              ▼
TASK-019 ──► TASK-020 (requerem TASK-012, TASK-006, TASK-007)
                │
                ▼
TASK-021 ──► TASK-022 ──► TASK-023
                              │
                              ▼
                         TASK-024 ──► TASK-025
```

## Resumo

| Fase | Tasks | Descrição |
|------|-------|-----------|
| 1. Setup | 001-002 | Monorepo + Drizzle |
| 2. Schema | 003-005 | Todas as 7 tabelas |
| 3. Auth | 006-007 | Better Auth + RLS |
| 4. iFood | 008-011 | Webhook + Polling + Ack + Fetcher |
| 5. OrderHub | 012-013 | Normalização + Status Machine |
| 6. Real-Time | 014-015 | Socket.IO + Eventos |
| 7. WhatsApp | 016-018 | Webhook + NLP + Integração |
| 8. API | 019-020 | Listagem + Status Update |
| 9. Frontend | 021-023 | Layout + Lista + Card |
| 10. Deploy | 024-025 | CI/CD + Produção |

**Total: 25 tarefas atômicas**
