# C4 — Nível 1: Diagrama de Contexto

## Escopo

O FoodFlow AI no seu ambiente, mostrando usuários e sistemas externos com os quais interage.

## Diagrama

```mermaid
C4Context
    title Diagrama de Contexto — FoodFlow AI

    Person(operador, "Operador do Restaurante", "Gerencia pedidos no dashboard em tempo real")
    Person(clienteWA, "Cliente WhatsApp", "Envia pedidos via mensagem de texto")
    Person(clienteIF, "Cliente iFood", "Faz pedidos pelo app iFood")

    System(foodflow, "FoodFlow AI", "Plataforma SaaS que centraliza pedidos de múltiplos canais em um painel operacional em tempo real")

    System_Ext(ifood, "iFood Platform", "Marketplace de delivery, envia eventos de pedidos via API")
    System_Ext(evolution, "Evolution API", "Gateway WhatsApp self-hosted para receber/enviar mensagens")
    System_Ext(claude, "Claude Haiku 4.5", "LLM da Anthropic para interpretar pedidos em linguagem natural")

    Rel(operador, foodflow, "Visualiza e gerencia pedidos", "HTTPS + WebSocket")
    Rel(clienteWA, evolution, "Envia mensagem de pedido", "WhatsApp")
    Rel(clienteIF, ifood, "Faz pedido", "iFood App")
    Rel(ifood, foodflow, "Envia eventos de pedidos", "HTTPS Webhook + REST Polling")
    Rel(evolution, foodflow, "Encaminha mensagens", "HTTPS Webhook")
    Rel(foodflow, claude, "Interpreta pedidos WhatsApp", "HTTPS REST")
    Rel(foodflow, ifood, "Busca detalhes e envia acks", "HTTPS REST")
```

## Pessoas / Atores

| Ator | Descrição | Interação |
|------|-----------|-----------|
| Operador do Restaurante | Funcionário que gerencia pedidos recebidos | Acessa dashboard via browser (desktop/tablet) |
| Cliente WhatsApp | Consumidor que faz pedido por mensagem natural | Envia mensagem para número WhatsApp do restaurante |
| Cliente iFood | Consumidor que faz pedido pelo marketplace | Usa app/site iFood, não interage diretamente com FoodFlow |

## Sistemas Externos

| Sistema | Tipo | Descrição | Tecnologia |
|---------|------|-----------|------------|
| iFood Platform | Marketplace | Envia eventos de novos pedidos e atualizações | REST API (`merchant-api.ifood.com.br`) |
| Evolution API | Gateway | Recebe mensagens WhatsApp e encaminha via webhook | REST API self-hosted |
| Claude Haiku 4.5 | LLM | Interpreta mensagens em linguagem natural e extrai pedido estruturado | Anthropic API (`api.anthropic.com`) |

## Relacionamentos

| De | Para | Descrição | Protocolo |
|----|------|-----------|-----------|
| Operador | FoodFlow AI | Visualiza pedidos, atualiza status | HTTPS + WSS (Socket.IO) |
| iFood | FoodFlow AI | Envia eventos de pedido (webhook) | HTTPS POST (JSON) |
| FoodFlow AI | iFood | Polling de eventos (30s), busca detalhes, envia ack | HTTPS GET/POST (JSON, OAuth2) |
| Evolution API | FoodFlow AI | Encaminha mensagens WhatsApp | HTTPS POST (JSON, API Key) |
| FoodFlow AI | Claude Haiku | Envia mensagem para interpretação NLP | HTTPS POST (JSON, API Key) |
