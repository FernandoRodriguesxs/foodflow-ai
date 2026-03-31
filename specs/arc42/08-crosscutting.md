# 08 — Conceitos Transversais

## Autenticação e Autorização

### Better Auth
- **Método**: JWT (JSON Web Tokens) com refresh tokens
- **Fluxo**: Login (email/senha) → JWT contendo `user_id`, `store_id`, `role`
- **Middleware**: Todas as rotas `/api/*` (exceto webhooks) exigem JWT válido
- **Roles**: `owner` (dono do restaurante), `operator` (operador)

### Autenticação de Webhooks
- **iFood**: Validação de signature no header (conforme documentação iFood)
- **Evolution API**: Validação via API Key no header

### Autenticação Socket.IO
- JWT enviado no handshake (`auth.token`)
- Validação no middleware do gateway
- Ingresso automático na room `store:{store_id}`

## Multi-Tenancy (RLS)

### Estratégia: Row-Level Security no PostgreSQL

Cada tabela com dados de tenant possui coluna `store_id`. RLS policies garantem isolamento:

```sql
-- Habilitar RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: usuário só acessa dados do seu store
CREATE POLICY tenant_isolation ON orders
  USING (store_id = current_setting('app.current_store_id')::uuid);

-- Aplicar em todas as tabelas: orders, order_items, order_status_history,
-- conversations, ifood_events
```

### Injeção do Tenant
1. JWT decodificado no middleware → extrai `store_id`
2. Antes de cada query: `SET LOCAL app.current_store_id = '<store_id>'`
3. RLS filtra automaticamente todas as queries

### Tabelas com RLS

| Tabela | Coluna de Tenant |
|--------|-----------------|
| orders | store_id |
| order_items | via JOIN com orders |
| order_status_history | via JOIN com orders |
| conversations | store_id |
| ifood_events | store_id |

## Logging

### Formato
- **Estrutura**: JSON estruturado
- **Campos obrigatórios**: `timestamp`, `level`, `message`, `store_id`, `request_id`
- **Níveis**: `error`, `warn`, `info`, `debug`

### Contexto por Request
```json
{
  "timestamp": "2026-03-31T10:00:00Z",
  "level": "info",
  "message": "Order created from iFood webhook",
  "store_id": "uuid",
  "request_id": "uuid",
  "order_id": "uuid",
  "source": "ifood",
  "duration_ms": 45
}
```

### Onde logar
- Recebimento de webhook (info)
- Processamento de pedido (info)
- Erro de integração externa (error)
- Falha de acknowledgment (error + retry)
- Transição de status inválida (warn)

## Tratamento de Erros

### Domínio
- Exceções de domínio tipadas: `InvalidStatusTransitionError`, `DuplicateEventError`, `OrderNotFoundError`
- Nunca retornar `null` — retornar exceção de domínio
- Controller converte exceção em HTTP status code adequado

### Integrações Externas
- **Retry com backoff exponencial**: iFood API, Claude Haiku (3 tentativas, backoff 1s/2s/4s)
- **Circuit breaker**: se 5 falhas consecutivas, abrir circuito por 30s
- **Timeout**: 5s para webhooks, 10s para chamadas de API, 15s para Claude Haiku
- **Dead letter queue**: eventos que falharam após todas as tentativas

### Mapeamento de Erros HTTP

| Exceção de Domínio | HTTP Status |
|--------------------|-------------|
| `OrderNotFoundError` | 404 |
| `InvalidStatusTransitionError` | 422 |
| `DuplicateEventError` | 200 (idempotente) |
| `UnauthorizedError` | 401 |
| `ForbiddenError` | 403 |
| Erro interno | 500 |

## Segurança

### Input Validation
- DTOs validados com `class-validator` ou `zod` em todas as rotas
- Sanitização de dados de webhook antes de persistir
- Tamanho máximo de payload: 1MB

### Rate Limiting
- Webhooks: sem rate limit (iFood/Evolution controlam)
- API REST: 100 req/min por store
- Socket.IO: 50 eventos/min por conexão

### Dados Sensíveis
- Senhas: hash com bcrypt (Better Auth)
- API keys: apenas em variáveis de ambiente, nunca no código
- Dados de cliente (nome, telefone): protegidos por RLS, conformidade LGPD
- Logs: nunca logar dados sensíveis (senhas, tokens, dados de cartão)

## Modelo de Domínio (Linguagem Ubíqua)

| Termo | Definição |
|-------|-----------|
| **Store** | Restaurante/estabelecimento, unidade de tenancy |
| **Order** | Pedido normalizado de qualquer origem |
| **Order Item** | Item individual dentro de um pedido |
| **Source** | Origem do pedido: `ifood` ou `whatsapp` |
| **Status** | Estado do pedido: PLACED, CONFIRMED, DISPATCHED, CONCLUDED, CANCELLED |
| **Conversation** | Histórico de mensagens WhatsApp com um número |
| **Event** | Evento iFood (PLACED, CONFIRMED, etc.) |
| **Acknowledgment** | Confirmação de recebimento de evento enviada ao iFood |
| **Tenant** | Sinônimo de Store no contexto de isolamento de dados |
