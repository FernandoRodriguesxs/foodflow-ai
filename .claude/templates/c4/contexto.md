# C4 Model - Context Diagram

**Versão**: 1.0
**Data**: YYYY-MM-DD
**Nível**: 1 - System Context

---

## Overview

O diagrama de contexto mostra o sistema no seu ambiente, incluindo:
- Usuários (pessoas/atores)
- Sistemas externos com os quais interage

---

## Diagram

```
┌─────────────┐                    ┌──────────────────┐
│    User     │───────────────────▶│   [System Name]  │
│  (Person)   │◀───────────────────│                  │
└─────────────┘                    └────────┬─────────┘
                                            │
                                            │ Uses
                                            │
                         ┌──────────────────▼──────────┐
                         │   External System A         │
                         │   (Email Service)           │
                         └─────────────────────────────┘
```

### Notation (PlantUML/Structurizr)
```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

Person(user, "User", "End user of the system")
System(system, "[System Name]", "Core system")
System_Ext(email, "Email Service", "Sends emails")

Rel(user, system, "Uses", "HTTPS")
Rel(system, email, "Sends emails via", "SMTP")
@enduml
```

---

## Elements

### People/Actors

| Name | Description | Responsibilities |
|------|-------------|------------------|
| User | End user | Perform actions via UI |
| Admin | System administrator | Manage system |

### Systems

| Name | Type | Description | Technology |
|------|------|-------------|------------|
| [System Name] | Core | Main system | [Stack] |
| External System A | External | Email service | SendGrid |
| External System B | External | Payment gateway | Stripe |

---

## Relationships

| From | To | Description | Protocol |
|------|----|-----------|---------  |
| User | [System] | Uses web interface | HTTPS |
| [System] | Email Service | Sends notifications | SMTP/API |
| [System] | Payment Gateway | Process payments | REST/HTTPS |

---

## Business Context

### Problem Statement
[What problem this system solves]

### Key Features
1. [Feature 1]
2. [Feature 2]
3. [Feature 3]

---

## References
- [Link to Arc42 Chapter 3: Context and Scope]
- [Link to requirements]
