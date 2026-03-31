# 7. Deployment View

**Versão**: 1.0
**Data**: YYYY-MM-DD

---

## 7.1 Infrastructure Level 1

### Deployment Diagram
```
┌─────────────────────────┐
│   Load Balancer         │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│App 1  │ │App 2  │
└───┬───┘ └──┬────┘
    │        │
    └───┬────┘
        │
   ┌────▼─────┐
   │ Database │
   └──────────┘
```

### Node Descriptions

| Node | Type | Responsibility | Specs |
|------|------|----------------|-------|
| Load Balancer | AWS ELB | Traffic distribution | - |
| App Server | EC2 | Run application | 2 vCPU, 4GB RAM |
| Database | RDS | Data persistence | PostgreSQL 14 |

---

## 7.2 Infrastructure Level 2

### Production Environment
- **Cloud Provider**: [AWS/Azure/GCP]
- **Region**: [us-east-1]
- **High Availability**: [Multi-AZ]

### Networking
- **VPC**: [CIDR block]
- **Subnets**: [Public/Private]
- **Security Groups**: [Inbound/Outbound rules]

---

## References
- [Link to Terraform/CloudFormation]
- [Link to deployment runbook]
