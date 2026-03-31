# C4 Model - Container Diagram

**Versão**: 1.0
**Data**: YYYY-MM-DD
**Nível**: 2 - Container
**Sistema**: [System Name]

---

## Overview

O diagrama de containers mostra aplicações e data stores do sistema.

**Container**: Aplicação ou data store executável separadamente.
Exemplos: Web app, API, database, filesystem

---

## Diagram

```
┌──────────┐
│   User   │
└────┬─────┘
     │ Uses (HTTPS)
     │
┌────▼────────────────────────┐
│  Web Application            │
│  (React SPA)                │
└────┬────────────────────────┘
     │ Makes API calls (HTTPS/JSON)
     │
┌────▼────────────────────────┐
│  API Application            │
│  (Node.js / Express)        │
└────┬─────────────┬──────────┘
     │             │
     │ Reads/Write │ Sends
     │             │
┌────▼────┐   ┌───▼──────┐
│Database │   │  Queue   │
│(Postgres│   │ (Redis)  │
└─────────┘   └──────────┘
```

### PlantUML Notation
```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

Person(user, "User")

System_Boundary(system, "[System Name]") {
    Container(web, "Web Application", "React", "SPA")
    Container(api, "API", "Node.js", "REST API")
    ContainerDb(db, "Database", "PostgreSQL", "Stores data")
    Container(queue, "Message Queue", "Redis", "Async processing")
}

Rel(user, web, "Uses", "HTTPS")
Rel(web, api, "Makes API calls", "HTTPS/JSON")
Rel(api, db, "Reads/Writes", "SQL")
Rel(api, queue, "Publishes", "Redis Protocol")
@enduml
```

---

## Containers

### Applications

| Name | Type | Description | Technology | Hosting |
|------|------|-------------|------------|---------|
| Web App | SPA | User interface | React 18 | S3 + CloudFront |
| API | Backend | Business logic | Node.js + Express | ECS |
| Worker | Background | Async jobs | Node.js | ECS |

### Data Stores

| Name | Type | Description | Technology | Backup |
|------|------|-------------|------------|--------|
| Database | RDBMS | Primary storage | PostgreSQL 14 | Daily |
| Cache | Key-Value | Session/cache | Redis 7 | None |
| File Storage | Object Store | User uploads | S3 | Versioned |

---

## Relationships

| From | To | Description | Protocol | Port |
|------|----|-----------| --------|------|
| Web App | API | CRUD operations | HTTPS/JSON | 443 |
| API | Database | Persist data | PostgreSQL | 5432 |
| API | Cache | Cache reads | Redis | 6379 |
| Worker | Queue | Consume jobs | Redis Pub/Sub | 6379 |

---

## Technology Choices

### Web Application
- **Framework**: React 18
- **State**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Build**: Vite

### API Application
- **Runtime**: Node.js 20
- **Framework**: Express 4
- **ORM**: Prisma
- **Validation**: Zod

### Database
- **Type**: PostgreSQL 14
- **Hosting**: AWS RDS
- **Backup**: Automated daily
- **Replication**: Multi-AZ

---

## References
- [Link to Arc42 Chapter 5: Building Blocks]
- [Link to deployment diagrams]
