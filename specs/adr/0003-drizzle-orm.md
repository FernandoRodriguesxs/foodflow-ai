# ADR-0003: Drizzle ORM como ORM Principal

## Status

Aceito

## Data

2026-03-31

## Contexto

O FoodFlow AI precisa de um ORM TypeScript para interagir com PostgreSQL (Neon Serverless). Os requisitos são:

- Type-safety completo (schema → queries → resultados)
- Excelente performance em ambiente serverless (cold starts rápidos)
- Compatibilidade nativa com o driver serverless do Neon (`@neondatabase/serverless`)
- Suporte a migrações e schema-as-code
- Capacidade de executar queries raw para RLS (`SET LOCAL`)

## Decisão

Utilizar **Drizzle ORM v0.45** como ORM principal do projeto.

### Implementação:
- **Schema**: definido em TypeScript com `pgTable()` em arquivos `*.schema.ts`
- **Migrações**: geradas via `drizzle-kit generate` e aplicadas com `drizzle-kit push`
- **Driver**: `@neondatabase/serverless` para HTTP/WebSocket (edge-compatible)
- **Queries**: API type-safe SQL-like (`db.select().from().where()`)
- **RLS**: queries raw via `db.execute(sql\`SET LOCAL ...\`)` antes de operações multi-tenant

## Consequências

### Positivas
- **Sem binary engine**: diferente do Prisma, não requer binário nativo — cold starts ~3x mais rápidos em serverless
- **SQL-like API**: queries são próximas do SQL real, reduzindo abstração e facilitando debug
- **Type-safety total**: schema TypeScript gera tipos automaticamente para queries e resultados
- **Neon nativo**: driver `@neondatabase/serverless` funciona diretamente, sem adaptadores extras
- **Schema-as-code**: schema versionado no repositório, migrações determinísticas
- **Leve**: bundle size ~50KB vs ~2MB do Prisma Client
- **Queries raw**: suporte nativo a `sql` template literals para RLS e queries complexas

### Negativas
- **Comunidade menor**: menos tutoriais, exemplos e plugins que Prisma
- **Documentação em evolução**: algumas features avançadas ainda com documentação limitada
- **Menos abstrações**: requer mais conhecimento de SQL que Prisma (que é mais "ORM tradicional")

## Alternativas Consideradas

### A1: Prisma
- **Prós**: Maior comunidade, Prisma Studio, documentação extensa, Prisma Migrate robusto
- **Contras**: Binary engine causa cold starts lentos em serverless (~3-5s), bundle size grande (~2MB), driver Neon requer adapter experimental, abstrações dificultam queries raw para RLS
- **Motivo da rejeição**: Performance em serverless é crítica para o FoodFlow; cold starts do Prisma são inaceitáveis com Neon scale-to-zero

### A2: TypeORM
- **Prós**: Maduro, suporte a Active Record e Data Mapper patterns
- **Contras**: Type-safety fraco (tipos não inferidos de schema), performance ruim, manutenção lenta, API verbosa
- **Motivo da rejeição**: Inferência de tipos inferior e projeto com manutenção irregular

### A3: Knex.js
- **Prós**: Query builder flexível, leve, amplamente usado
- **Contras**: Sem type-safety de schema (tipos manuais), sem ORM features (relations), sem geração de migrações a partir de schema
- **Motivo da rejeição**: Ausência de type-safety e schema-as-code aumenta risco de bugs
