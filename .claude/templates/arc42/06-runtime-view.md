# 6. Runtime View

**Versão**: 1.0
**Data**: YYYY-MM-DD

---

## 6.1 [Scenario 1]: [Name]

### Motivation
[Why this scenario is important]

### Sequence Diagram
```
User → API: Request
API → Service: Process
Service → DB: Query
DB → Service: Result
Service → API: Response
API → User: JSON
```

### Description
1. [Step 1 description]
2. [Step 2 description]
3. [Step 3 description]

---

## 6.2 [Scenario 2]: [Name]

### Sequence Diagram
```
[Actor A] → [Component B]: [Action]
[Component B] → [Component C]: [Action]
[Component C] → [Component B]: [Result]
[Component B] → [Actor A]: [Response]
```

---

## References
- [Link to BDD scenarios]
- [Link to integration tests]
