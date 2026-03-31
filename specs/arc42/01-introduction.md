# 01 — Introdução e Objetivos

## Visão Geral

**FoodFlow AI** é uma plataforma SaaS de gestão operacional para restaurantes. A versão 1 (V1) tem um único objetivo claro: fornecer um **painel operacional em tempo real** que centraliza pedidos recebidos via **WhatsApp** e **iFood**, permitindo ao operador visualizar, confirmar e gerenciar o ciclo de vida de cada pedido em uma única interface.

## Objetivos de Negócio

| ID | Objetivo | Prioridade | Métrica de Sucesso |
|----|----------|------------|---------------------|
| OBJ-001 | Centralizar pedidos de múltiplos canais em um único painel | Alta | 100% dos pedidos iFood e WhatsApp visíveis no dashboard |
| OBJ-002 | Reduzir tempo de resposta a pedidos | Alta | Tempo médio de confirmação < 30s após recebimento |
| OBJ-003 | Eliminar pedidos perdidos | Alta | 0 pedidos não processados por falha de sistema |
| OBJ-004 | Interpretar pedidos WhatsApp automaticamente | Média | ≥ 90% de acurácia na extração de itens via IA |

## Objetivos de Qualidade

| Prioridade | Atributo de Qualidade | Descrição |
|------------|----------------------|-----------|
| 1 | Latência em tempo real | Novos pedidos devem aparecer no dashboard em < 2 segundos |
| 2 | Disponibilidade | Sistema operacional com uptime ≥ 99.5% |
| 3 | Segurança multi-tenant | Isolamento total de dados entre restaurantes (RLS) |
| 4 | Usabilidade | Operador consegue confirmar pedido com 1 clique |

## Stakeholders

| Papel | Expectativa | Preocupação |
|-------|-------------|-------------|
| Operador do Restaurante | Interface única e rápida para gerenciar pedidos | Não perder nenhum pedido, interface simples |
| Dono do Restaurante | Visão consolidada das operações, menos erros | Custo, confiabilidade, segurança dos dados |
| Cliente WhatsApp | Fazer pedido por mensagem natural | Pedido ser interpretado corretamente |
| Cliente iFood | Pedido processado rapidamente | Status atualizado no app iFood |
| Equipe de Desenvolvimento | Stack moderna, código manutenível | Complexidade de integrações externas |
| iFood (parceiro) | Conformidade com API e SLA | Acknowledgment de eventos, polling ativo |

## Escopo da V1

### Incluído
- Recepção de pedidos iFood (webhook + polling)
- Recepção de pedidos WhatsApp (Evolution API + Claude Haiku)
- Dashboard em tempo real com Socket.IO
- Gerenciamento de status de pedidos
- Autenticação e multi-tenancy

### Excluído da V1
- Gestão de cardápio
- Processamento de pagamentos
- Analytics e relatórios
- App mobile nativo
- Integração com outros marketplaces (Rappi, Uber Eats)
