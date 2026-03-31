# 03 — Contexto e Escopo

## Contexto de Negócio

O FoodFlow AI se posiciona como hub central entre os canais de pedido (iFood e WhatsApp) e o operador do restaurante. O sistema recebe pedidos de múltiplas fontes, normaliza para um modelo interno e apresenta em tempo real no dashboard.

### Diagrama de Contexto

```
┌─────────────┐     mensagem      ┌──────────────┐     webhook      ┌─────────────────┐
│  Cliente     │ ──────────────► │  Evolution    │ ──────────────► │                 │
│  WhatsApp    │                  │  API          │                  │                 │
└─────────────┘                  └──────────────┘                  │                 │
                                                                     │   FoodFlow AI   │
┌─────────────┐   pedido online   ┌──────────────┐  webhook/poll   │   Platform      │
│  Cliente     │ ──────────────► │  iFood        │ ──────────────► │                 │
│  iFood       │                  │  Platform     │                  │                 │
└─────────────┘                  └──────────────┘                  │                 │
                                                                     │                 │
                                  ┌──────────────┐   NLP request   │                 │
                                  │  Claude       │ ◄────────────── │                 │
                                  │  Haiku 4.5    │ ──────────────► │                 │
                                  └──────────────┘   structured     └────────┬────────┘
                                                      order                   │
                                                                              │ WebSocket
                                                                              ▼
                                                                     ┌─────────────────┐
                                                                     │  Operador do     │
                                                                     │  Restaurante     │
                                                                     │  (Browser)       │
                                                                     └─────────────────┘
```

### Entidades Externas

| Entidade | Tipo | Descrição | Tecnologia |
|----------|------|-----------|------------|
| Cliente WhatsApp | Pessoa | Envia pedido via mensagem de texto natural | WhatsApp |
| Cliente iFood | Pessoa | Faz pedido pelo app/site iFood | iFood App |
| Operador do Restaurante | Pessoa | Gerencia pedidos no dashboard | Browser (desktop/tablet) |
| iFood Platform | Sistema | Marketplace de delivery, envia eventos de pedidos | REST API (merchant-api.ifood.com.br) |
| Evolution API | Sistema | Gateway WhatsApp self-hosted | REST API + Webhooks |
| Claude Haiku 4.5 | Sistema | LLM para interpretação de pedidos em linguagem natural | Anthropic API |

## Contexto Técnico

### Interfaces Externas

| Interface | Protocolo | Formato | Autenticação | Direção |
|-----------|-----------|---------|--------------|---------|
| iFood Webhook | HTTPS POST | JSON | Signature validation | iFood → FoodFlow |
| iFood Polling | HTTPS GET | JSON | OAuth2 Bearer Token | FoodFlow → iFood |
| iFood Acknowledgment | HTTPS POST | JSON | OAuth2 Bearer Token | FoodFlow → iFood |
| iFood Order Details | HTTPS GET | JSON | OAuth2 Bearer Token | FoodFlow → iFood |
| Evolution API Webhook | HTTPS POST | JSON | API Key | Evolution → FoodFlow |
| Claude Haiku API | HTTPS POST | JSON | API Key (Anthropic) | FoodFlow → Claude |
| Dashboard WebSocket | WSS | JSON | JWT Token | FoodFlow ↔ Browser |
| Dashboard REST API | HTTPS | JSON | JWT Bearer Token | Browser → FoodFlow |

### Pontos de Integração

| Sistema | Endpoint Base | SLA | Rate Limit |
|---------|--------------|-----|------------|
| iFood | `merchant-api.ifood.com.br` | 99.9% | Polling: 1 req/30s |
| Evolution API | Self-hosted | Depende do host | Sem limite definido |
| Claude Haiku | `api.anthropic.com` | 99.9% | Tier-based |
| Neon PostgreSQL | Neon connection string | 99.95% | Connection pooling |
