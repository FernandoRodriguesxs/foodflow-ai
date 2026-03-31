# language: pt

Funcionalidade: Gestão de pedidos WhatsApp
  Como operador do restaurante
  Quero receber pedidos enviados via WhatsApp interpretados automaticamente por IA
  Para centralizar todos os pedidos em um único painel

  Contexto:
    Dado que existe um restaurante "Pizzaria do Chef" cadastrado no sistema
    E o restaurante possui integração ativa com WhatsApp via Evolution API
    E o operador está autenticado no dashboard

  # --- Recepção e Interpretação ---

  Cenário: Receber mensagem com pedido simples
    Quando um cliente envia a mensagem "Quero 2 pizzas de margherita" para o WhatsApp do restaurante
    Então a Evolution API deve encaminhar a mensagem via webhook
    E a mensagem deve ser salva na tabela "conversations"
    E o Claude Haiku deve interpretar a mensagem
    E o resultado deve conter 1 item: "pizza de margherita" com quantidade 2

  Cenário: Interpretar pedido com múltiplos itens
    Quando um cliente envia a mensagem "Me manda 1 pizza calabresa, 2 cocas e 1 porção de batata frita"
    Então o Claude Haiku deve retornar 3 itens:
      | nome             | quantidade |
      | pizza calabresa  | 1          |
      | coca-cola        | 2          |
      | batata frita     | 1          |

  Cenário: Interpretar pedido com observações especiais
    Quando um cliente envia a mensagem "1 pizza margherita sem cebola e 1 guaraná bem gelado"
    Então o Claude Haiku deve retornar 2 itens
    E o item "pizza margherita" deve ter observação "sem cebola"
    E o item "guaraná" deve ter observação "bem gelado"

  Cenário: Salvar pedido interpretado no banco
    Quando um pedido WhatsApp é interpretado com sucesso pelo Claude Haiku
    Então o pedido deve ser salvo na tabela "orders" com source "whatsapp"
    E os itens devem ser salvos na tabela "order_items"
    E o status inicial deve ser "PLACED"
    E a conversa em "conversations" deve ser associada ao order_id

  Cenário: Notificar dashboard via Socket.IO
    Quando um pedido WhatsApp é salvo no sistema
    Então o dashboard deve receber evento "new_order" via Socket.IO
    E o evento deve conter os dados completos do pedido
    E o evento deve ser emitido apenas na room do restaurante correto

  # --- Casos Especiais ---

  Cenário: Mensagem ambígua — solicitar esclarecimento
    Quando um cliente envia a mensagem "me manda aquele de sempre"
    Então o Claude Haiku deve identificar a mensagem como ambígua
    E o sistema não deve criar um pedido
    E o sistema deve registrar a mensagem na conversa para contexto futuro

  Cenário: Mensagem que não é um pedido
    Quando um cliente envia a mensagem "Qual o horário de funcionamento?"
    Então o Claude Haiku deve classificar como "não é um pedido"
    E o sistema não deve criar um pedido
    E a mensagem deve ser salva em "conversations" para referência

  # --- Multi-Tenant ---

  Cenário: Associar pedido ao restaurante correto
    Dado que existem dois restaurantes cadastrados:
      | nome              | whatsapp_number |
      | Pizzaria do Chef  | 5511999990001   |
      | Burger House      | 5511999990002   |
    Quando um cliente envia mensagem para o número "5511999990001"
    Então o pedido deve ser associado ao restaurante "Pizzaria do Chef"
    E o pedido não deve ser visível para "Burger House"
