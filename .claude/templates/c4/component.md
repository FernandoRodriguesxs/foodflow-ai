# C4 Model - Component Diagram

**Versão**: 1.0
**Data**: YYYY-MM-DD
**Nível**: 3 - Component
**Container**: [Container Name]

---

## Overview

O diagrama de componentes mostra como um container é composto de componentes, suas responsabilidades e relacionamentos.

**Component**: Agrupamento de código relacionado (classes, módulos, packages)

---

## Diagram

```
┌─────────────────────────────────────────┐
│          API Container                  │
│                                         │
│  ┌──────────────┐   ┌──────────────┐  │
│  │ Controllers  │──▶│  Use Cases   │  │
│  └──────────────┘   └───────┬──────┘  │
│                              │          │
│                     ┌────────▼──────┐  │
│                     │   Domain      │  │
│                     │   (Entities)  │  │
│                     └────────┬──────┘  │
│                              │          │
│  ┌──────────────┐   ┌───────▼──────┐  │
│  │  HTTP Client │◀──│ Repositories │  │
│  └──────────────┘   └──────────────┘  │
│         ▲                               │
└─────────┼───────────────────────────────┘
          │
     ┌────▼────┐
     │Database │
     └─────────┘
```

### PlantUML Notation
```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

Container_Boundary(api, "API Container") {
    Component(controllers, "Controllers", "Express Router", "Handle HTTP")
    Component(usecases, "Use Cases", "Application Layer", "Business logic")
    Component(domain, "Domain", "Domain Layer", "Entities & VOs")
    Component(repos, "Repositories", "Infrastructure", "Data access")
}

ComponentDb_Ext(db, "Database", "PostgreSQL")

Rel(controllers, usecases, "Calls")
Rel(usecases, domain, "Uses")
Rel(usecases, repos, "Calls")
Rel(repos, db, "Reads/Writes", "SQL")
@enduml
```

---

## Components

### Presentation Layer

| Component | Responsibility | Technology | Location |
|-----------|----------------|------------|----------|
| Controllers | HTTP handling | Express Router | `src/[context]/infrastructure/http/` |
| Validators | Input validation | Zod | `src/[context]/infrastructure/validators/` |
| DTOs | Data transfer | TypeScript | `src/[context]/infrastructure/dtos/` |

### Application Layer

| Component | Responsibility | Technology | Location |
|-----------|----------------|------------|----------|
| Use Cases | Orchestration | TypeScript | `src/[context]/application/use-cases/` |
| Commands | Write operations | CQRS | `src/[context]/application/commands/` |
| Queries | Read operations | CQRS | `src/[context]/application/queries/` |

### Domain Layer

| Component | Responsibility | Technology | Location |
|-----------|----------------|------------|----------|
| Entities | Business logic | TypeScript | `src/[context]/domain/entities/` |
| Value Objects | Domain concepts | TypeScript | `src/[context]/domain/value-objects/` |
| Domain Services | Multi-entity logic | TypeScript | `src/[context]/domain/services/` |
| Events | Domain events | TypeScript | `src/[context]/domain/events/` |

### Infrastructure Layer

| Component | Responsibility | Technology | Location |
|-----------|----------------|------------|----------|
| Repositories | Data persistence | Prisma | `src/[context]/infrastructure/repositories/` |
| HTTP Clients | External APIs | Axios | `src/[context]/infrastructure/clients/` |
| Event Publishers | Message queue | Redis | `src/[context]/infrastructure/events/` |

---

## Relationships

### Data Flow
1. **Controller** receives HTTP request
2. **Controller** validates with **Validator**
3. **Controller** calls **Use Case**
4. **Use Case** loads **Entity** via **Repository**
5. **Use Case** executes domain logic on **Entity**
6. **Use Case** persists via **Repository**
7. **Use Case** returns **DTO** to **Controller**
8. **Controller** sends HTTP response

### Dependencies
- Presentation → Application → Domain
- Infrastructure → Domain (via interfaces)
- **Rule**: Domain has ZERO dependencies on outer layers

---

## Design Patterns

| Pattern | Where Used | Purpose |
|---------|------------|---------|
| Repository | Infrastructure | Abstract data access |
| Factory | Domain | Create entities |
| Strategy | Domain | Pluggable algorithms |
| Observer | Domain Events | Decouple side effects |
| Adapter | Infrastructure | External system integration |

---

## References
- [Link to Arc42 Chapter 5]
- [Link to code]
