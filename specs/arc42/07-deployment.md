# 07 — Visão de Deployment

## Infraestrutura — Visão Geral

```
┌─────────────────────────────────────────────────────────┐
│                      Internet                            │
│                                                         │
│   ┌──────────┐         ┌──────────┐                     │
│   │ Browser  │         │ iFood /  │                     │
│   │ Operador │         │ Evolution│                     │
│   └────┬─────┘         └────┬─────┘                     │
│        │                     │                           │
│        ▼                     ▼                           │
│   ┌──────────┐         ┌──────────┐                     │
│   │ Vercel   │         │ Render   │                     │
│   │ (Web)    │────────►│ (API)    │                     │
│   │ Next.js  │  REST   │ NestJS   │                     │
│   └──────────┘  + WS   └────┬─────┘                     │
│                              │                           │
│                    ┌─────────┼─────────┐                │
│                    ▼         ▼         ▼                │
│              ┌──────────┐ ┌──────┐ ┌──────────┐        │
│              │ Neon     │ │Redis │ │ Anthropic│        │
│              │ Postgres │ │      │ │ API      │        │
│              └──────────┘ └──────┘ └──────────┘        │
└─────────────────────────────────────────────────────────┘
```

## Nós de Deployment

| Nó | Tipo | Responsabilidade | Especificações |
|----|------|-----------------|----------------|
| Vercel | PaaS (Serverless) | Frontend Next.js 16.2 | Edge Network global, auto-scaling |
| Render | PaaS (Container) | Backend NestJS 11 + Socket.IO | Web Service, 512MB RAM (starter) |
| Neon | DBaaS (Serverless) | PostgreSQL 17 com RLS | Scale-to-zero, connection pooling |
| Redis | Managed | Cache + BullMQ queues | Upstash ou Redis Cloud, 256MB |
| Evolution API | Self-hosted | Gateway WhatsApp | VPS ou container dedicado |

## Ambientes

### Produção

| Componente | URL/Host | Região |
|-----------|----------|--------|
| Web (Vercel) | `app.foodflow.ai` | Edge (global) |
| API (Render) | `api.foodflow.ai` | São Paulo (South America) |
| PostgreSQL (Neon) | Connection string via env | São Paulo |
| Redis | Connection string via env | São Paulo |

### Staging

| Componente | URL/Host | Região |
|-----------|----------|--------|
| Web (Vercel) | `staging.foodflow.ai` | Edge |
| API (Render) | `api-staging.foodflow.ai` | São Paulo |
| PostgreSQL (Neon) | Branch de staging | São Paulo |
| Redis | Instância separada | São Paulo |

## Variáveis de Ambiente

| Variável | Serviço | Descrição |
|----------|---------|-----------|
| `DATABASE_URL` | Neon | Connection string PostgreSQL |
| `REDIS_URL` | Redis | Connection string Redis |
| `IFOOD_CLIENT_ID` | iFood | OAuth2 client ID |
| `IFOOD_CLIENT_SECRET` | iFood | OAuth2 client secret |
| `IFOOD_MERCHANT_ID` | iFood | ID do merchant na plataforma |
| `WHATSAPP_API_URL` | Evolution | URL da instância Evolution API |
| `WHATSAPP_API_KEY` | Evolution | API key da Evolution API |
| `ANTHROPIC_API_KEY` | Anthropic | API key para Claude Haiku |
| `BETTER_AUTH_SECRET` | Auth | Secret para JWT/sessões |
| `NEXT_PUBLIC_API_URL` | Frontend | URL da API para o frontend |
| `NEXT_PUBLIC_WS_URL` | Frontend | URL do WebSocket |

## CI/CD Pipeline

```
Push/PR ──► GitHub Actions ──► Lint + TypeCheck + Test ──► Build
                                                            │
                                          ┌─────────────────┤
                                          ▼                 ▼
                                    Vercel Deploy     Render Deploy
                                    (auto via Git)    (auto via Git)
```

### Workflow de PR
1. Push para branch `feat/*` ou `fix/*`
2. GitHub Actions: `pnpm install` → `turbo lint` → `turbo typecheck` → `turbo test` → `turbo build`
3. Vercel cria preview deployment automático

### Workflow de Deploy (main)
1. Merge PR para `main`
2. Vercel: deploy automático do frontend
3. Render: deploy automático do backend
4. Neon: migrações via CI step (drizzle-kit push)

## Estratégia de Rollback

| Serviço | Estratégia |
|---------|-----------|
| Vercel | Instant rollback para deployment anterior via dashboard |
| Render | Rollback para commit anterior via dashboard |
| Neon | Branch restore ou point-in-time recovery |
| Redis | Sem estado crítico, restart limpo |
