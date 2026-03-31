# 3. System Scope and Context

**Versão**: 1.0
**Data**: YYYY-MM-DD

---

## 3.1 Business Context

### System Boundaries
[Descreva o que está DENTRO e FORA do sistema]

### Context Diagram
```
┌──────────┐      ┌─────────────┐      ┌──────────┐
│  Actor A │─────▶│   System    │─────▶│ System B │
└──────────┘      └─────────────┘      └──────────┘
                         │
                         ▼
                  ┌──────────┐
                  │ System C │
                  └──────────┘
```

### External Entities

| Entity | Type | Relationship | Interface |
|--------|------|--------------|-----------|
| [Name] | User/System | [Input/Output] | [Protocol] |

---

## 3.2 Technical Context

### External Interfaces

| Interface | Protocol | Format | Authentication |
|-----------|----------|--------|----------------|
| [API A] | REST/HTTP | JSON | OAuth2 |
| [DB] | PostgreSQL | SQL | Password |
| [Queue] | AMQP | Binary | Token |

### Integration Points
```
[System] ←→ [External API] via HTTPS/JSON
[System] ←→ [Database] via TCP/SQL
[System] ←→ [Message Queue] via AMQP
```

---

## References
- [Link to C4 Context Diagram]
- [Link to integration specifications]
