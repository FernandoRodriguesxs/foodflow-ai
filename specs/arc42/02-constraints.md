# 02 — Restrições

## Restrições Técnicas

| ID | Restrição | Justificativa |
|----|-----------|---------------|
| TC-001 | Monorepo TypeScript com Turborepo + pnpm | Compartilhamento de tipos entre frontend e backend, builds incrementais |
| TC-002 | PostgreSQL 17 com RLS (Neon Serverless) | Multi-tenancy no nível do banco, scale-to-zero |
| TC-003 | Webhook iFood deve responder 202 em ≤ 5 segundos | Requisito da API iFood — timeout resulta em re-envio |
| TC-004 | Polling iFood a cada 30 segundos obrigatório | Manter loja online na plataforma iFood |
| TC-005 | Acknowledgment obrigatório para TODOS os eventos iFood | Requisito da API — eventos não confirmados são reenviados |
| TC-006 | Deduplicação de eventos iFood pelo campo `id` | Polling + webhook podem gerar duplicatas |
| TC-007 | Next.js 16.2 com React 19 | Versão mais recente com Server Components e melhorias de performance |
| TC-008 | NestJS 11 com adapter Fastify | Performance superior ao Express para API backend |

## Restrições Organizacionais

| ID | Restrição | Justificativa |
|----|-----------|---------------|
| OC-001 | Equipe pequena (1-3 devs) | Startup em estágio inicial |
| OC-002 | MVP em 8 semanas | Time-to-market para validação com primeiros restaurantes |
| OC-003 | Multi-tenant desde o dia 1 | Modelo SaaS — cada restaurante é um tenant isolado |
| OC-004 | Custo de infraestrutura mínimo | Free tiers e serviços serverless (Neon, Vercel, Render) |

## Restrições Legais

| ID | Restrição | Justificativa |
|----|-----------|---------------|
| LC-001 | Conformidade LGPD | Dados de clientes (nome, telefone) devem ser protegidos |
| LC-002 | Termos da API iFood | Uso conforme documentação oficial do merchant-api |
| LC-003 | Política do WhatsApp Business | Mensagens via Evolution API dentro dos termos de uso |

## Convenções

| Área | Convenção |
|------|-----------|
| Linguagem | TypeScript strict em todo o monorepo |
| Estilo de código | Biome (lint + format) |
| Commits | Conventional Commits (`feat:`, `fix:`, `chore:`) |
| Branches | `main` (produção), `develop`, `feat/*`, `fix/*` |
| Testes | Vitest (unit), Supertest (integration), min 85% coverage |
| API Design | REST com versionamento em path (`/api/v1/`) |
| Banco | Migrações via Drizzle Kit, schema-as-code |
