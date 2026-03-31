# ADR-0002: Socket.IO para Comunicação em Tempo Real

## Status

Aceito

## Data

2026-03-31

## Contexto

O dashboard do FoodFlow AI precisa exibir novos pedidos e atualizações de status em tempo real, sem que o operador precise atualizar a página. Os requisitos são:

- Novos pedidos devem aparecer no dashboard em < 2 segundos
- Atualizações de status devem ser refletidas para todos os operadores da mesma loja
- Isolamento multi-tenant: operador da loja A não pode ver eventos da loja B
- Reconexão automática em caso de queda de conexão
- Compatibilidade com a arquitetura NestJS

## Decisão

Utilizar **Socket.IO** como camada de comunicação em tempo real, embutido no servidor NestJS via `@nestjs/websockets`.

### Implementação:
- **Gateway**: `DashboardGateway` com namespace `/dashboard`
- **Rooms**: cada store tem sua room `store:{store_id}`
- **Autenticação**: JWT validado no handshake (`auth.token`)
- **Eventos emitidos**:
  - `new_order`: quando pedido é criado (iFood ou WhatsApp)
  - `order_status_updated`: quando operador muda status
- **Eventos recebidos**: nenhum na V1 (comunicação server → client)

## Consequências

### Positivas
- **Bidirecional**: permite expansão futura (chat, notificações) sem mudança de stack
- **Rooms nativas**: isolamento multi-tenant natural com `socket.join('store:' + storeId)`
- **Auto-reconnect**: reconexão automática com backoff exponencial (built-in)
- **Fallback**: degrada graciosamente para HTTP long-polling em ambientes restritivos
- **Ecossistema NestJS**: integração oficial via `@nestjs/platform-socket.io`
- **Amplo suporte**: funciona em todos os browsers modernos

### Negativas
- **Overhead**: ligeiramente mais pesado que SSE (protocolo de handshake)
- **Sticky sessions**: necessário em cenários de múltiplas instâncias (resolvível com Redis adapter)
- **Complexidade**: mais complexo que SSE para o caso de uso atual (server → client unidirecional)

## Alternativas Consideradas

### A1: Server-Sent Events (SSE)
- **Prós**: Mais leve, protocolo simples, nativo do browser, unidirecional (suficiente para V1)
- **Contras**: Sem rooms nativas (isolamento manual), sem reconexão sofisticada, limitação de 6 conexões por domínio no HTTP/1.1, sem suporte bidirecional para futuro
- **Motivo da rejeição**: Falta de rooms nativas dificulta multi-tenancy; bidirecionalidade será necessária em versões futuras

### A2: WebSockets puros (ws)
- **Prós**: Mínimo overhead, máxima performance
- **Contras**: Sem reconexão automática, sem rooms, sem fallback, sem serialização automática
- **Motivo da rejeição**: Requer reimplementar funcionalidades que Socket.IO oferece pronto

### A3: Polling HTTP (short/long)
- **Prós**: Mais simples, sem estado de conexão
- **Contras**: Latência alta (polling interval), desperdício de recursos, não atende requisito de < 2s
- **Motivo da rejeição**: Inaceitável para operação em tempo real
