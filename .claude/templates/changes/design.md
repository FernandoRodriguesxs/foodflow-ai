# Design - [Nome da Feature]

**Status**: Draft | Review | Approved | Implemented
**Autor**: [Nome]
**Data**: YYYY-MM-DD
**Versão**: 1.0
**Relacionado**: `PRD.md`

---

## 1. Visão Arquitetural

### 1.1 Contexto
[Onde esta feature se encaixa no sistema maior? Referência ao C4 Context Diagram]

### 1.2 Princípios Arquiteturais
- [Princípio 1: ex. Separation of Concerns]
- [Princípio 2: ex. Single Responsibility]
- [Princípio 3: ex. Dependency Inversion]

---

## 2. Arquitetura de Alto Nível

### 2.1 Diagrama de Containers
```
[User] → [Web App] → [API Gateway] → [Service X] → [Database]
```

### 2.2 Componentes Principais
| Componente | Responsabilidade | Tecnologia |
|------------|------------------|------------|
| [Nome] | [Descrição] | [Stack] |

---

## 3. Decisões Arquiteturais

### ADR-001: [Título da Decisão]
**Status**: Accepted | Proposed | Deprecated | Superseded

**Contexto**:
[Por que precisamos tomar esta decisão?]

**Opções Consideradas**:
1. **Opção A**: [Descrição]
   - Prós: [...]
   - Contras: [...]

2. **Opção B**: [Descrição]
   - Prós: [...]
   - Contras: [...]

**Decisão**:
[Opção escolhida e justificativa]

**Consequências**:
- Positivas: [...]
- Negativas: [...]
- Trade-offs: [...]

---

## 4. Estrutura de Código

### 4.1 Organização de Diretórios
```
src/
├── [context]/
│   └── [container]/
│       └── [component]/
│           ├── index.ts
│           ├── [Component].ts
│           ├── [Component].test.ts
│           └── [Component].story.ts
```

### 4.2 Módulos e Camadas
```
┌─────────────────────────┐
│   Presentation Layer    │  ← UI Components
├─────────────────────────┤
│   Application Layer     │  ← Use Cases
├─────────────────────────┤
│      Domain Layer       │  ← Business Logic
├─────────────────────────┤
│  Infrastructure Layer   │  ← External Services
└─────────────────────────┘
```

---

## 5. Modelo de Dados

### 5.1 Entidades de Domínio
```typescript
interface [Entity] {
  id: EntityId
  [property]: ValueObject
  [relation]: [RelatedEntity]
}
```

### 5.2 Value Objects
```typescript
class [ValueObject] {
  private readonly value: string

  constructor(value: string) {
    this.validate(value)
    this.value = value
  }

  private validate(value: string): void {
    // Regras de validação
  }
}
```

### 5.3 Relacionamentos
```
[Entity A] 1──── N [Entity B]
              │
              └─── N [Entity C]
```

---

## 6. Banco de Dados

### 6.1 Schema
```sql
CREATE TABLE [table_name] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  [column] [TYPE] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_[table]_[column] ON [table]([column]);
```

### 6.2 Migrações
| Versão | Descrição | Script |
|--------|-----------|--------|
| 001 | [Descrição] | `migrations/001_*.sql` |

---

## 7. APIs e Contratos

### 7.1 REST Endpoints
```http
GET    /api/v1/[resource]
POST   /api/v1/[resource]
GET    /api/v1/[resource]/:id
PUT    /api/v1/[resource]/:id
DELETE /api/v1/[resource]/:id
```

### 7.2 Request/Response Schema
```typescript
// Request
interface [Create]Request {
  [field]: string
}

// Response
interface [Resource]Response {
  id: string
  [field]: string
  createdAt: string
}
```

### 7.3 Códigos de Status
| Código | Significado | Quando Usar |
|--------|-------------|-------------|
| 200 | OK | Sucesso em GET/PUT |
| 201 | Created | Sucesso em POST |
| 400 | Bad Request | Validação falhou |
| 401 | Unauthorized | Sem autenticação |
| 404 | Not Found | Recurso não existe |
| 500 | Internal Error | Erro do servidor |

---

## 8. Fluxo de Dados

### 8.1 Sequência Principal
```
[User] → [Component] → [Use Case] → [Repository] → [Database]
                ↓           ↓             ↓
            [Event]    [Validation]   [Entity]
```

### 8.2 Eventos de Domínio
```typescript
interface [DomainEvent] {
  eventId: string
  eventType: '[EventType]'
  aggregateId: string
  occurredAt: Date
  payload: [EventPayload]
}
```

---

## 9. Segurança

### 9.1 Autenticação
- [ ] JWT tokens com expiração de X horas
- [ ] Refresh tokens armazenados em HttpOnly cookies

### 9.2 Autorização
```typescript
@RequireRole(['admin', 'editor'])
async function [action]() { }
```

### 9.3 Validação de Input
- [ ] Schema validation com Zod/Yup
- [ ] SQL injection prevention via parameterized queries
- [ ] XSS prevention via sanitization

---

## 10. Performance

### 10.1 Otimizações
- [ ] Database indexing em [colunas]
- [ ] Cache de [dados] com TTL de X minutos
- [ ] Lazy loading de [componentes]

### 10.2 Limites
| Recurso | Limite | Justificativa |
|---------|--------|---------------|
| Request size | X MB | [Razão] |
| Query time | Y ms | [Razão] |
| Concurrent users | Z | [Razão] |

---

## 11. Resiliência

### 11.1 Error Handling
```typescript
try {
  await [operation]()
} catch (error) {
  if (error instanceof [DomainError]) {
    // Handle domain error
  }
  throw new [ApplicationError](error)
}
```

### 11.2 Retry Strategy
- [ ] Exponential backoff para [operação]
- [ ] Circuit breaker para [serviço externo]
- [ ] Timeout de X segundos

---

## 12. Observabilidade

### 12.1 Logging
```typescript
logger.info('[Operation] started', {
  userId: user.id,
  resourceId: resource.id
})
```

### 12.2 Métricas
- [ ] Request latency (p50, p95, p99)
- [ ] Error rate
- [ ] Throughput (req/s)

### 12.3 Tracing
- [ ] Distributed tracing com [OpenTelemetry/Jaeger]

---

## 13. Testing Strategy

### 13.1 Pirâmide de Testes
```
      ┌─────────┐
      │   E2E   │  10%
     ┌───────────┐
     │Integration│  20%
   ┌───────────────┐
   │     Unit      │  70%
   └───────────────┘
```

### 13.2 Cobertura Esperada
- Unit: ≥ 85%
- Integration: ≥ 70%
- E2E: Fluxos críticos

---

## 14. Deploy Strategy

### 14.1 Estratégia
- [ ] Blue-Green deployment
- [ ] Canary release (5% → 50% → 100%)
- [ ] Feature flags para [features experimentais]

### 14.2 Rollback Plan
[Como reverter se algo der errado]

---

## 15. Dependências Externas

### 15.1 Serviços
| Serviço | Propósito | SLA | Contingência |
|---------|-----------|-----|--------------|
| [Nome] | [Uso] | 99.9% | [Plano B] |

### 15.2 Bibliotecas
| Biblioteca | Versão | Justificativa |
|------------|--------|---------------|
| [Nome] | X.Y.Z | [Por quê] |

---

## 16. Anexos

### 16.1 Diagramas Adicionais
[Links ou imagens]

### 16.2 Referências
- [Arc42 capítulo relacionado]
- [ADR relacionada]
- [C4 diagrams]

---

## Changelog

| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| 1.0 | YYYY-MM-DD | [Nome] | Versão inicial |
