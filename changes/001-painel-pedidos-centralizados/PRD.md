# PRD — Painel de Pedidos Centralizados

## 1. Resumo Executivo

O FoodFlow AI é uma plataforma SaaS que resolve o problema de gestão fragmentada de pedidos em restaurantes. Na V1, o produto oferece um **painel operacional em tempo real** que centraliza pedidos recebidos via **iFood** e **WhatsApp** em uma única interface.

O operador do restaurante deixa de alternar entre múltiplos aplicativos e abas, passando a gerenciar todos os pedidos — desde a recepção até a conclusão — em um dashboard unificado com atualização em tempo real via WebSocket.

## 2. Problema

### Contexto
Restaurantes que operam em múltiplos canais de venda (iFood, WhatsApp, telefone) enfrentam:

- **Fragmentação**: operador precisa monitorar simultaneamente o app iFood, WhatsApp Business e outros canais
- **Pedidos perdidos**: durante picos de demanda, mensagens WhatsApp são esquecidas ou o painel iFood não é verificado a tempo
- **Lentidão na resposta**: alternar entre apps aumenta o tempo de confirmação de pedidos
- **Falta de visibilidade**: dono do restaurante não tem visão consolidada do fluxo de pedidos

### Impacto
- Perda de receita por pedidos não atendidos
- Avaliações negativas no iFood por tempo de resposta lento
- Erros de interpretação em pedidos WhatsApp (texto livre, abreviações)
- Estresse operacional da equipe

### Evidência
- Restaurantes relatam perder 5-15% dos pedidos WhatsApp em horários de pico
- Tempo médio de confirmação de pedido iFood acima de 3 minutos em operações multi-canal

## 3. Objetivos

| ID | Objetivo | Métrica | Baseline | Target |
|----|----------|---------|----------|--------|
| OBJ-001 | Reduzir tempo de resposta a pedidos | Tempo médio de confirmação | ~3 min | < 30s |
| OBJ-002 | Eliminar pedidos perdidos | Taxa de pedidos não processados | ~10% | 0% |
| OBJ-003 | Unificar gestão de pedidos | Nº de apps que operador monitora | 3+ | 1 |
| OBJ-004 | Interpretar pedidos WhatsApp automaticamente | Acurácia de extração de itens | Manual | ≥ 90% |

## 4. Proposta de Solução

### Visão geral
Dashboard web em tempo real que:
1. **Recebe** pedidos automaticamente do iFood (webhook + polling) e WhatsApp (Evolution API)
2. **Interpreta** pedidos WhatsApp em linguagem natural usando Claude Haiku 4.5
3. **Normaliza** todos os pedidos para um modelo interno unificado
4. **Exibe** pedidos em lista atualizada em tempo real via Socket.IO
5. **Permite** atualização de status com um clique (Confirmar → Despachar → Concluir)

### User Stories

| ID | Como... | Quero... | Para... | Prioridade |
|----|---------|----------|---------|------------|
| US-001 | Operador | Ver todos os pedidos em uma lista unificada | Não precisar alternar entre apps | P0 |
| US-002 | Operador | Receber pedidos iFood automaticamente | Nunca perder um pedido | P0 |
| US-003 | Operador | Receber pedidos WhatsApp interpretados por IA | Não precisar interpretar texto manualmente | P0 |
| US-004 | Operador | Atualizar status do pedido com 1 clique | Agilizar o fluxo operacional | P0 |
| US-005 | Operador | Ver atualizações em tempo real sem refresh | Manter visibilidade constante | P0 |
| US-006 | Dono | Ter dados isolados do meu restaurante | Segurança e privacidade | P0 |

### Escopo V1

**Incluído:**
- Recepção de pedidos iFood (webhook + polling + ack)
- Recepção de pedidos WhatsApp (Evolution API + Claude Haiku)
- Dashboard em tempo real com lista de pedidos
- Gestão de status (PLACED → CONFIRMED → DISPATCHED → CONCLUDED / CANCELLED)
- Autenticação e multi-tenancy
- Deploy em produção

**Excluído da V1:**
- Gestão de cardápio / menu
- Processamento de pagamentos
- Analytics e relatórios
- Aplicativo mobile nativo
- Integração com Rappi, Uber Eats ou outros marketplaces
- Chat de resposta ao cliente WhatsApp
- Impressão de comanda

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceitação |
|----|-----------|------------|----------------------|
| RF-001 | Receber pedidos iFood via webhook | P0 | Webhook responde 202 em < 5s, pedido salvo no banco |
| RF-002 | Polling iFood a cada 30s | P0 | Job BullMQ ativo, loja permanece online |
| RF-003 | Acknowledment de todos eventos iFood | P0 | 100% dos eventos confirmados, campo acknowledged=true |
| RF-004 | Deduplicação de eventos iFood | P0 | Mesmo event_id não gera pedido duplicado |
| RF-005 | Receber mensagens WhatsApp via Evolution API | P0 | Webhook recebe e persiste mensagens |
| RF-006 | Interpretar pedidos WhatsApp com Claude Haiku | P0 | ≥ 90% acurácia na extração de itens |
| RF-007 | Normalizar pedidos para modelo interno | P0 | Pedidos de qualquer fonte salvos no mesmo formato |
| RF-008 | Exibir lista de pedidos no dashboard | P0 | Lista paginada, filtros por status e source |
| RF-009 | Atualizar status com 1 clique | P0 | Transições válidas aplicadas, inválidas rejeitadas |
| RF-010 | Atualizações em tempo real via Socket.IO | P0 | new_order e order_status_updated emitidos na room |
| RF-011 | Autenticação com Better Auth | P0 | Login/registro funcional, JWT válido |
| RF-012 | Isolamento multi-tenant (RLS) | P0 | Dados de store A invisíveis para store B |
| RF-013 | Histórico de status de pedidos | P1 | Cada transição registrada com timestamp e actor |

## 6. Requisitos Não-Funcionais

| Categoria | Requisito | Métrica |
|-----------|-----------|---------|
| Performance | Latência de atualização do dashboard | < 2 segundos |
| Performance | Tempo de resposta API REST | p95 < 200ms |
| Performance | Tempo de interpretação Claude Haiku | p95 < 3 segundos |
| Disponibilidade | Uptime do sistema | ≥ 99.5% |
| Escalabilidade | Stores simultâneos | ≥ 50 na V1 |
| Escalabilidade | Pedidos por store por dia | ≥ 500 |
| Segurança | Isolamento de dados | RLS em todas as tabelas |
| Segurança | Conformidade | LGPD (dados de clientes) |
| Usabilidade | Tempo de aprendizado | Operador produtivo em < 5 min |
| Manutenibilidade | Cobertura de testes | ≥ 85% |

## 7. Stakeholders

| Papel | Responsabilidade | Expectativa |
|-------|-----------------|-------------|
| Operador do Restaurante | Usuário primário | Interface rápida e simples |
| Dono do Restaurante | Decisor de compra | ROI claro, confiabilidade |
| Equipe de Desenvolvimento | Implementação | Stack moderna, DX boa |
| iFood | Parceiro (API) | Conformidade com SLA e documentação |
| Clientes (WhatsApp) | Usuários indiretos | Pedidos interpretados corretamente |

## 8. Riscos e Mitigações

| ID | Risco | Probabilidade | Impacto | Mitigação |
|----|-------|--------------|---------|-----------|
| R-001 | API iFood muda sem aviso | Média | Alto | Monitorar changelog, adapter pattern para isolar mudanças |
| R-002 | Claude Haiku interpreta pedido incorretamente | Média | Médio | Prompt engineering robusto, fallback para revisão manual |
| R-003 | Evolution API instável | Média | Alto | Health checks, alertas, retry automático |
| R-004 | Latência do Neon em cold start | Baixa | Médio | Connection pooling, keep-alive queries |
| R-005 | Concorrência de status updates | Baixa | Médio | Optimistic locking com version column |

## 9. Escopo V1 — Limites Explícitos

Este documento cobre **exclusivamente** a V1 do FoodFlow AI. Funcionalidades como gestão de cardápio, pagamentos, analytics, app mobile e integrações com outros marketplaces estão **fora do escopo** e serão avaliadas em versões futuras.
