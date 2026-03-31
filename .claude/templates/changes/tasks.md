# Tasks - [Nome da Feature]

**Status**: Draft | In Progress | Completed
**Autor**: [Nome]
**Data**: YYYY-MM-DD
**Versão**: 1.0
**Relacionado**: `PRD.md`, `design.md`, `specs.md`

---

## ⚠️ IMPORTÂNCIA CRÍTICA DA DECOMPOSIÇÃO ATÔMICA

> **Este documento é o mais crítico do workflow SDD**
>
> Decomposição atômica reduz alucinações de IA de **60.4% para 0.9%**
>
> **Fundamentação Teórica**:
> - **Shannon (1948)**: Reduz entropia da informação através de especificação completa
> - **Vaswani et al. (2017)**: Context window limitado - cada task cabe em O(n) ao invés de O(n²)
> - **Liu et al. (2023)**: "Lost in the Middle" - evita perda de contexto em instruções longas

---

## 1. Princípios de Decomposição

### 1.1 Critérios de Atomicidade
Uma task é **atômica** quando:
- [ ] Pode ser completada em **uma única sessão** (< 2 horas)
- [ ] Tem **um único objetivo** claro e mensurável
- [ ] **Não depende** de decisões de design a serem tomadas
- [ ] Pode ser **testada** isoladamente
- [ ] Cabe em **um único contexto** de IA (< 4000 tokens)

### 1.2 Anti-Padrões (NÃO FAZER)
❌ "Implementar autenticação" (muito amplo)
❌ "Refatorar código" (sem objetivo específico)
❌ "Corrigir bugs" (múltiplos objetivos)
❌ "Adicionar testes" (não especifica o quê)

### 1.3 Padrões Corretos (FAZER)
✅ "Criar value object Email com validação RFC 5322"
✅ "Implementar método User.changePassword() com hash bcrypt"
✅ "Adicionar índice B-tree em users.email para query de login"
✅ "Escrever unit test para EmailValueObject.create() com 8 casos"

---

## 2. Estrutura da Decomposição

### Fase 1: Setup (PRÉ-CÓDIGO)
**Objetivo**: Preparar ambiente e dependências

### Fase 2: Domain Layer (CORE)
**Objetivo**: Implementar lógica de negócio pura

### Fase 3: Application Layer (USE CASES)
**Objetivo**: Orquestrar domínio

### Fase 4: Infrastructure Layer (ADAPTADORES)
**Objetivo**: Implementar adaptadores externos

### Fase 5: Presentation Layer (UI/API)
**Objetivo**: Expor funcionalidade

### Fase 6: Testing (VALIDAÇÃO)
**Objetivo**: Garantir qualidade

### Fase 7: Documentation (MANUTENÇÃO)
**Objetivo**: Atualizar docs

---

## 3. Tasks Atômicas

### FASE 1: Setup

#### TASK-001: Criar estrutura de diretórios
**Objetivo**: Criar estrutura context/container/component
**Estimativa**: 5 min
**Dependências**: Nenhuma

**Checklist**:
- [ ] Criar `src/[context]/`
- [ ] Criar `src/[context]/[container]/`
- [ ] Criar `src/[context]/[container]/[component]/`
- [ ] Criar `index.ts` em cada nível

**Critério de Aceitação**:
```bash
ls -R src/[context]/ deve mostrar a estrutura completa
```

**Comandos**:
```bash
mkdir -p src/[context]/[container]/[component]
touch src/[context]/index.ts
touch src/[context]/[container]/index.ts
touch src/[context]/[container]/[component]/index.ts
```

---

#### TASK-002: Instalar dependências necessárias
**Objetivo**: Adicionar libs específicas para esta feature
**Estimativa**: 10 min
**Dependências**: TASK-001

**Checklist**:
- [ ] Adicionar [lib-1] versão X.Y.Z
- [ ] Adicionar [lib-2] versão A.B.C
- [ ] Atualizar package.json
- [ ] Rodar `bun install`

**Critério de Aceitação**:
```bash
bun install deve completar sem erros
bun list deve mostrar as libs instaladas
```

**Comandos**:
```bash
bun add [lib-1]@X.Y.Z
bun add -d [lib-2]@A.B.C
```

---

### FASE 2: Domain Layer

#### TASK-003: Criar Value Object [Nome]
**Objetivo**: Implementar VO [Nome] com validação completa
**Estimativa**: 30 min
**Dependências**: TASK-001

**Especificação**:
```typescript
// Localização: src/[context]/domain/value-objects/[Name].ts

class [Name] {
  private constructor(private readonly value: [Type]) {}

  static create(value: [Type]): Result<[Name]> {
    // Validação 1: [regra]
    // Validação 2: [regra]
    // Validação 3: [regra]
    return Result.ok(new [Name](value))
  }

  getValue(): [Type] {
    return this.value
  }

  equals(other: [Name]): boolean {
    return this.value === other.value
  }
}
```

**Validações Obrigatórias**:
- [ ] Validação 1: [descrição exata]
- [ ] Validação 2: [descrição exata]
- [ ] Validação 3: [descrição exata]

**Critério de Aceitação**:
- [ ] Arquivo criado em `src/[context]/domain/value-objects/[Name].ts`
- [ ] Todas as validações implementadas
- [ ] Método `equals()` implementado
- [ ] Export adicionado ao `index.ts`

**Casos de Teste** (implementar em TASK-XXX):
| Caso | Input | Output Esperado |
|------|-------|-----------------|
| TC-001 | [valid input] | Result.ok() |
| TC-002 | [invalid: regra 1] | Result.fail() |
| TC-003 | [invalid: regra 2] | Result.fail() |

---

#### TASK-004: Criar Entity [Nome]
**Objetivo**: Implementar entidade [Nome] com invariantes
**Estimativa**: 45 min
**Dependências**: TASK-003

**Especificação**:
```typescript
// Localização: src/[context]/domain/entities/[Name].ts

class [Name] {
  private constructor(
    private readonly id: [EntityId],
    private [property1]: [ValueObject1],
    private [property2]: [ValueObject2]
  ) {}

  static create(props: [CreateProps]): Result<[Name]> {
    // Validar invariantes
    // Criar entidade
    return Result.ok(new [Name](...))
  }

  [method1]([params]): Result<void> {
    // Validar pré-condições
    // Executar lógica de domínio
    // Emitir evento de domínio
    this.addDomainEvent(new [Event]())
    return Result.ok()
  }

  private checkInvariant(): boolean {
    // Invariante 1
    // Invariante 2
  }
}
```

**Invariantes** (devem ser sempre verdadeiras):
- [ ] Invariante 1: [descrição]
- [ ] Invariante 2: [descrição]

**Eventos de Domínio**:
- [ ] [EventName]: Emitido quando [condição]

**Critério de Aceitação**:
- [ ] Arquivo criado em `src/[context]/domain/entities/[Name].ts`
- [ ] Factory method `create()` implementado
- [ ] Todos os métodos de comportamento implementados
- [ ] Invariantes verificados
- [ ] Eventos de domínio emitidos

---

#### TASK-005: Criar Domain Service [Nome]
**Objetivo**: Implementar serviço de domínio para [operação]
**Estimativa**: 40 min
**Dependências**: TASK-004

**Especificação**:
```typescript
// Localização: src/[context]/domain/services/[Name]Service.ts

class [Name]Service {
  [operation]([entity1]: [Entity1], [entity2]: [Entity2]): Result<[Output]> {
    // Lógica que envolve múltiplas entidades
    // Que não pertence a nenhuma entidade específica
    return Result.ok([output])
  }
}
```

**Regras de Negócio**:
- [ ] RN-001: [descrição exata]
- [ ] RN-002: [descrição exata]

**Critério de Aceitação**:
- [ ] Service implementado
- [ ] Todas as regras de negócio aplicadas
- [ ] Sem efeitos colaterais (função pura)

---

### FASE 3: Application Layer

#### TASK-006: Criar Use Case [Nome]
**Objetivo**: Implementar caso de uso [Nome]
**Estimativa**: 50 min
**Dependências**: TASK-005

**Especificação**:
```typescript
// Localização: src/[context]/application/use-cases/[Name]UseCase.ts

class [Name]UseCase {
  constructor(
    private readonly [repo]: I[Repository]
  ) {}

  async execute(request: [Request]): Promise<Result<[Response]>> {
    // 1. Validar input
    // 2. Buscar entidades do repositório
    // 3. Executar lógica de domínio
    // 4. Persistir mudanças
    // 5. Retornar resultado
  }
}
```

**Fluxo Exato**:
1. [ ] Validar `request` com schema
2. [ ] Buscar [Entity] via repositório
3. [ ] Executar `[entity].method()`
4. [ ] Salvar via `repository.save()`
5. [ ] Mapear para DTO de resposta

**Critério de Aceitação**:
- [ ] Use case implementado
- [ ] Validação de input
- [ ] Transaction handling (se aplicável)
- [ ] Error handling completo

---

### FASE 4: Infrastructure Layer

#### TASK-007: Criar Repository Implementation
**Objetivo**: Implementar repositório concreto para [Entity]
**Estimativa**: 60 min
**Dependências**: TASK-004

**Especificação**:
```typescript
// Localização: src/[context]/infrastructure/repositories/[Name]Repository.ts

class [Name]Repository implements I[Name]Repository {
  constructor(private readonly db: Database) {}

  async findById(id: [EntityId]): Promise<Option<[Entity]>> {
    const row = await this.db.query(/* SQL */)
    return row ? this.toDomain(row) : None
  }

  async save(entity: [Entity]): Promise<Result<void>> {
    const data = this.toPersistence(entity)
    await this.db.query(/* SQL */)
    return Result.ok()
  }

  private toDomain(raw: any): [Entity] {
    // Mapper de DB → Domain
  }

  private toPersistence(entity: [Entity]): any {
    // Mapper de Domain → DB
  }
}
```

**Queries**:
```sql
-- findById
SELECT * FROM [table] WHERE id = $1 AND deleted_at IS NULL

-- save (upsert)
INSERT INTO [table] (id, [columns])
VALUES ($1, $2)
ON CONFLICT (id) DO UPDATE SET [columns] = EXCLUDED.[columns]
```

**Critério de Aceitação**:
- [ ] Todos os métodos da interface implementados
- [ ] Queries SQL otimizadas com prepared statements
- [ ] Mappers bidirecionais (Domain ↔ DB)
- [ ] Error handling para DB errors

---

#### TASK-008: Criar Migration para [Table]
**Objetivo**: Criar schema de banco para [Entity]
**Estimativa**: 20 min
**Dependências**: Nenhuma (pode ser paralelo)

**Especificação**:
```sql
-- Localização: migrations/YYYYMMDDHHMMSS_create_[table].sql

CREATE TABLE [table] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  [column1] [TYPE] NOT NULL,
  [column2] [TYPE] UNIQUE,
  [fk_id] UUID REFERENCES [other_table](id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes para performance
CREATE INDEX idx_[table]_[column] ON [table]([column]);
CREATE INDEX idx_[table]_deleted_at ON [table](deleted_at) WHERE deleted_at IS NULL;

-- Trigger para updated_at
CREATE TRIGGER update_[table]_updated_at
BEFORE UPDATE ON [table]
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

**Critério de Aceitação**:
- [ ] Migration criada
- [ ] Todos os constraints definidos
- [ ] Índices criados para queries frequentes
- [ ] Trigger de updated_at configurado
- [ ] Rollback migration criada

---

### FASE 5: Presentation Layer

#### TASK-009: Criar Controller/Route [Nome]
**Objetivo**: Expor use case via API REST
**Estimativa**: 40 min
**Dependências**: TASK-006

**Especificação**:
```typescript
// Localização: src/[context]/infrastructure/http/controllers/[Name]Controller.ts

class [Name]Controller {
  constructor(private readonly useCase: [Name]UseCase) {}

  @Post('/api/v1/[resource]')
  @Authenticated()
  @ValidateBody([RequestSchema])
  async handle(req: Request, res: Response): Promise<Response> {
    const result = await this.useCase.execute(req.body)

    if (result.isFailure) {
      return res.status([code]).json({ error: result.error })
    }

    return res.status(201).json(result.value)
  }
}
```

**Validações**:
```typescript
const [RequestSchema] = z.object({
  [field]: z.string().min(3).max(50),
  [field2]: z.number().positive()
})
```

**Critério de Aceitação**:
- [ ] Route registrada
- [ ] Input validation com Zod
- [ ] Authentication middleware aplicado
- [ ] Error handling com códigos HTTP corretos
- [ ] Response DTO mapeado

---

### FASE 6: Testing

#### TASK-010: Unit Tests para [Component]
**Objetivo**: Escrever testes unitários para [Component]
**Estimativa**: 45 min
**Dependências**: TASK que criou [Component]

**Especificação**:
```typescript
// Localização: src/[context]/[layer]/[Component].test.ts

describe('[Component]', () => {
  describe('[method]', () => {
    it('should [expected behavior] when [condition]', () => {
      // Arrange
      const [input] = [value]
      const [component] = new [Component]()

      // Act
      const result = [component].[method]([input])

      // Assert
      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe([expected])
    })

    it('should fail when [invalid condition]', () => {
      // Arrange
      const [invalidInput] = [value]

      // Act
      const result = [component].[method]([invalidInput])

      // Assert
      expect(result.isFailure).toBe(true)
      expect(result.error).toBe('[expected error]')
    })
  })
})
```

**Casos de Teste Obrigatórios**:
| ID | Cenário | Input | Output |
|----|---------|-------|--------|
| TC-001 | Happy path | [valid] | Success |
| TC-002 | Invalid input 1 | [invalid] | Failure |
| TC-003 | Invalid input 2 | [invalid] | Failure |
| TC-004 | Edge case | [edge] | [expected] |

**Critério de Aceitação**:
- [ ] Todos os casos de teste implementados
- [ ] Coverage ≥ 85% para o componente
- [ ] Tests passando: `bun test [file].test.ts`

---

#### TASK-011: Integration Tests para [UseCase]
**Objetivo**: Testar integração do use case com repositório
**Estimativa**: 60 min
**Dependências**: TASK-006, TASK-007

**Especificação**:
```typescript
// Localização: src/[context]/application/use-cases/[Name]UseCase.integration.test.ts

describe('[Name]UseCase Integration', () => {
  let db: Database
  let repository: [Name]Repository
  let useCase: [Name]UseCase

  beforeEach(async () => {
    db = await setupTestDatabase()
    repository = new [Name]Repository(db)
    useCase = new [Name]UseCase(repository)
  })

  afterEach(async () => {
    await cleanupTestDatabase(db)
  })

  it('should [end-to-end behavior]', async () => {
    // Arrange
    await seedDatabase(db, [fixtures])

    // Act
    const result = await useCase.execute([request])

    // Assert
    expect(result.isSuccess).toBe(true)
    const saved = await repository.findById([id])
    expect(saved.isSome).toBe(true)
  })
})
```

**Critério de Aceitação**:
- [ ] Test database configurado
- [ ] Fixtures criados
- [ ] Testes passando com DB real
- [ ] Cleanup após testes

---

### FASE 7: Documentation

#### TASK-012: Atualizar Arc42 Building Blocks
**Objetivo**: Documentar novos componentes no arc42
**Estimativa**: 30 min
**Dependências**: Todas as tasks de implementação

**Localização**: `specs/arc42/05-building-blocks.md`

**Adicionar**:
```markdown
### [Component Name]

**Responsabilidade**: [O que faz]

**Colaboradores**:
- [Component A]: [Relação]
- [Component B]: [Relação]

**Interface**:
```typescript
interface I[Component] {
  [method]([params]): [Return]
}
```

**Localização**: `src/[context]/[layer]/[Component].ts`
```

**Critério de Aceitação**:
- [ ] Seção adicionada ao capítulo 05
- [ ] Diagrama de blocos atualizado (se aplicável)
- [ ] Interfaces documentadas

---

#### TASK-013: Atualizar C4 Component Diagram
**Objetivo**: Adicionar novos componentes ao diagrama C4
**Estimativa**: 20 min
**Dependências**: TASK-012

**Localização**: `specs/c4/component-diagrams/[context].md`

**Adicionar**:
```
Component([Name], "[Description]", "Technology")
Rel([Component A], [Component B], "[Interaction]", "Protocol")
```

**Critério de Aceitação**:
- [ ] Componente adicionado ao diagrama
- [ ] Relacionamentos documentados
- [ ] Tecnologia especificada

---

#### TASK-014: Criar BDD Feature File
**Objetivo**: Documentar comportamento em formato BDD
**Estimativa**: 25 min
**Dependências**: TASK-006

**Localização**: `specs/bdd/[feature-name].feature`

**Especificação**:
```gherkin
Feature: [Feature Name]
  As a [user type]
  I want to [action]
  So that [benefit]

  Background:
    Given [common precondition]

  Scenario: [Happy path]
    Given [precondition]
    When [action]
    Then [expected outcome]
    And [additional verification]

  Scenario: [Error case]
    Given [precondition]
    When [invalid action]
    Then [error should occur]
```

**Critério de Aceitação**:
- [ ] Feature file criado
- [ ] Todos os cenários principais documentados
- [ ] Sintaxe Gherkin validada

---

#### TASK-015: Criar/Atualizar ADR
**Objetivo**: Documentar decisão arquitetural importante
**Estimativa**: 30 min
**Dependências**: TASK que gerou a decisão

**Localização**: `specs/adr/NNNN-[title].md`

**Especificação**:
```markdown
# ADR-NNNN: [Título da Decisão]

**Status**: Accepted
**Data**: YYYY-MM-DD
**Decisores**: [Nomes]

## Contexto
[Por que esta decisão foi necessária?]

## Decisão
[O que foi decidido?]

## Consequências
**Positivas**:
- [Benefício 1]

**Negativas**:
- [Trade-off 1]

**Trade-offs**:
- [Explicação]

## Alternativas Consideradas
### Opção A
- Prós: [...]
- Contras: [...]
### Opção B
- Prós: [...]
- Contras: [...]

## Referências
- [Links relevantes]
```

**Critério de Aceitação**:
- [ ] ADR criada com número sequencial
- [ ] Todas as seções preenchidas
- [ ] Alternativas documentadas

---

## 4. Resumo de Estimativas

| Fase | Tasks | Tempo Total |
|------|-------|-------------|
| Setup | 2 | 15 min |
| Domain | 3 | 115 min |
| Application | 1 | 50 min |
| Infrastructure | 2 | 80 min |
| Presentation | 1 | 40 min |
| Testing | 2 | 105 min |
| Documentation | 4 | 105 min |
| **TOTAL** | **15** | **~8.5 horas** |

---

## 5. Ordem de Execução

### Sequencial Obrigatório
1. TASK-001 → TASK-002
2. TASK-003 → TASK-004 → TASK-005
3. TASK-005 → TASK-006
4. TASK-004 → TASK-007
5. TASK-006 → TASK-009

### Pode Ser Paralelo
- TASK-008 (migration) pode ser feita a qualquer momento
- TASK-010, TASK-011 após respectivos componentes
- TASK-012 a TASK-015 podem ser feitas em paralelo

---

## 6. Critérios de "Done"

Uma task só está **completa** quando:
- [ ] Código implementado conforme especificação EXATA
- [ ] Testes unitários passando (se aplicável)
- [ ] Testes de integração passando (se aplicável)
- [ ] Code review aprovado
- [ ] Biome check passando (lint/format)
- [ ] Documentação atualizada
- [ ] Committed to git

---

## 7. Templates de Commit

```bash
# Para task de implementação
git commit -m "feat(context): implement [Component] [method]

TASK-XXX: [Título da task]

- [Detalhe 1]
- [Detalhe 2]

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Para task de teste
git commit -m "test(context): add unit tests for [Component]

TASK-XXX: [Título da task]

Coverage: XX%

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Para task de documentação
git commit -m "docs(specs): update [document] with [Component]

TASK-XXX: [Título da task]

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Changelog

| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| 1.0 | YYYY-MM-DD | [Nome] | Decomposição inicial |
