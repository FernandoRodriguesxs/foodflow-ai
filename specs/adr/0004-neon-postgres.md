# ADR-0004: Neon Serverless PostgreSQL

## Status

Aceito

## Data

2026-03-31

## Contexto

O FoodFlow AI precisa de um banco PostgreSQL gerenciado com as seguintes características:

- Suporte a Row-Level Security (RLS) para multi-tenancy
- Compatibilidade com ambientes serverless/edge
- Custo baixo para estágio inicial (startup)
- Escalabilidade conforme crescimento de restaurantes
- Suporte a branching para ambientes de desenvolvimento/staging
- PostgreSQL 17 com features modernas

## Decisão

Utilizar **Neon Serverless PostgreSQL** como banco de dados principal.

### Implementação:
- **Driver**: `@neondatabase/serverless` (HTTP/WebSocket, edge-compatible)
- **Connection pooling**: PgBouncer integrado no Neon (pooled connection string)
- **Branching**: branch `main` para produção, branches efêmeras para PRs/staging
- **RLS**: policies criadas via migrações Drizzle
- **Região**: São Paulo (sa-east-1) para menor latência

## Consequências

### Positivas
- **Scale-to-zero**: sem custo quando não há queries (ideal para restaurantes fora do horário de pico)
- **Branching**: cria cópias instantâneas do banco para dev/preview com copy-on-write
- **Driver serverless**: funciona em edge functions (Vercel Edge, Cloudflare Workers) via HTTP/WebSocket
- **RLS nativo**: PostgreSQL 17 com suporte completo a Row-Level Security
- **Connection pooling integrado**: PgBouncer built-in resolve problema de muitas conexões serverless
- **Free tier generoso**: 0.5 GB storage, 190 horas de compute/mês — suficiente para MVP
- **Point-in-time recovery**: restauração para qualquer ponto no tempo (últimos 7 dias no free tier)

### Negativas
- **Vendor lock-in parcial**: driver `@neondatabase/serverless` é específico do Neon (mitigável: Drizzle suporta múltiplos drivers)
- **Serviço mais recente**: menos battle-tested que AWS RDS ou Cloud SQL em produção de larga escala
- **Cold start em scale-to-zero**: primeira query após inatividade pode ter ~500ms de latência extra
- **Limites do free tier**: compute suspenso após 5 min de inatividade

## Alternativas Consideradas

### A1: Supabase (PostgreSQL)
- **Prós**: PostgreSQL gerenciado, RLS, auth integrado, real-time built-in, dashboard
- **Contras**: Plataforma mais pesada (pagamos por features não usadas), auth próprio conflita com Better Auth, sem branching nativo, driver não é edge-native
- **Motivo da rejeição**: Over-engineering para V1; auth e real-time já resolvidos com Better Auth e Socket.IO

### A2: AWS RDS PostgreSQL
- **Prós**: Mais battle-tested, SLA robusto, Multi-AZ, ampla documentação
- **Contras**: Sem scale-to-zero (instância sempre ligada = custo fixo), sem branching, sem driver serverless nativo, setup mais complexo (VPC, security groups)
- **Motivo da rejeição**: Custo fixo inaceitável para MVP; complexidade de setup desnecessária

### A3: PlanetScale
- **Prós**: Serverless, branching, boa DX, scale-to-zero
- **Contras**: **MySQL only** — não suporta PostgreSQL, portanto não suporta RLS nativo
- **Motivo da rejeição**: Requisito de PostgreSQL + RLS elimina esta opção

### A4: CockroachDB Serverless
- **Prós**: Serverless, PostgreSQL-compatible, distribuído
- **Contras**: Compatibilidade com RLS limitada, driver Neon não funciona, mais complexo que necessário
- **Motivo da rejeição**: RLS limitado e complexidade desnecessária para V1
