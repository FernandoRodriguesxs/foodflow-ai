# 04 — Estratégia de Solução

## Decisões Tecnológicas

| Área | Tecnologia | Justificativa |
|------|-----------|---------------|
| Frontend | Next.js 16.2 + React 19 | Server Components, excelente DX, deploy simples na Vercel |
| UI | Tailwind CSS v4 + shadcn/ui | Componentes acessíveis, design system consistente, sem runtime CSS |
| Backend | NestJS 11 + Fastify | Arquitetura modular, injeção de dependência, Fastify 2x mais rápido que Express |
| ORM | Drizzle ORM v0.45 | Type-safe, SQL-like, excelente com Neon serverless, sem binary engine |
| Banco | PostgreSQL 17 (Neon) | RLS nativo, serverless scale-to-zero, branching para dev |
| Cache/Filas | Redis 8 + BullMQ | Jobs recorrentes (polling), filas de processamento, cache de sessão |
| Realtime | Socket.IO | Bidirecional, rooms por tenant, auto-reconnect, fallback polling |
| Auth | Better Auth | Leve, TypeScript-first, JWT, extensível |
| IA | Claude Haiku 4.5 | Rápido, barato, excelente para NLP de pedidos |
| WhatsApp | Evolution API | Self-hosted, sem custo por mensagem, API simples |
| Monorepo | Turborepo + pnpm | Builds incrementais, cache, workspace sharing |

## Decomposição de Alto Nível

O sistema é decomposto nos seguintes blocos principais:

1. **IFoodAdapter** — Recebe eventos do iFood via webhook e polling, envia acknowledgments
2. **WhatsAppAdapter** — Recebe mensagens da Evolution API, usa Claude Haiku para interpretar
3. **OrderHub** — Normaliza pedidos de qualquer origem para modelo interno
4. **DashboardModule** — API REST + Socket.IO para o painel em tempo real
5. **AuthModule** — Autenticação e autorização com Better Auth
6. **TenantModule** — Isolamento multi-tenant via RLS

## Estratégia de Ingestão: Webhook + Polling

```
iFood ──webhook──► [BullMQ Queue] ──► OrderHub ──► DB + Socket.IO
  │                      ▲
  └──polling/30s────────┘ (deduplicação por event_id)
```

- **Webhook**: recepção imediata, resposta 202 em < 5s, processamento assíncrono via fila
- **Polling**: job BullMQ a cada 30s, mantém loja online, captura eventos perdidos
- **Deduplicação**: tabela `ifood_events` com `event_id` unique, ignorar duplicatas

## Estratégia de NLP para WhatsApp

```
WhatsApp msg ──► Evolution API ──webhook──► WhatsAppAdapter ──► Claude Haiku ──► OrderHub
```

- Mensagem recebida via webhook da Evolution API
- Claude Haiku 4.5 interpreta com prompt estruturado
- Extrai: itens, quantidades, observações, dados do cliente
- Pedido estruturado segue para OrderHub (mesmo fluxo que iFood)

## Abordagens de Qualidade

| Objetivo de Qualidade | Estratégia de Implementação |
|----------------------|----------------------------|
| Latência < 2s | Webhook → BullMQ → Socket.IO (processamento assíncrono), Redis cache |
| Disponibilidade 99.5% | Polling como fallback, retry com backoff, circuit breaker |
| Segurança multi-tenant | PostgreSQL RLS em todas as tabelas, store_id no JWT |
| Usabilidade | shadcn/ui componentes prontos, layout responsivo, 1-click status update |
| Manutenibilidade | Monorepo com tipos compartilhados, DDD leve, testes automatizados |
