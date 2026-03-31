# language: pt

Funcionalidade: Gestão de pedidos iFood
  Como operador do restaurante
  Quero receber e gerenciar pedidos do iFood automaticamente
  Para centralizar todos os pedidos em um único painel

  Contexto:
    Dado que existe um restaurante "Pizzaria do Chef" cadastrado no sistema
    E o restaurante possui integração ativa com iFood
    E o operador está autenticado no dashboard

  # --- Recepção de Pedidos ---

  Cenário: Receber novo pedido via webhook
    Quando o iFood envia um webhook com evento "PLACED" para o pedido "ORD-001"
    Então o sistema deve responder com status 202
    E o evento deve ser salvo na tabela "ifood_events"
    E um job de processamento deve ser enfileirado no BullMQ
    E após processamento, o pedido deve existir na tabela "orders" com source "ifood"
    E o dashboard deve receber evento "new_order" via Socket.IO

  Cenário: Responder webhook dentro do timeout de 5 segundos
    Quando o iFood envia um webhook com evento "PLACED"
    Então o sistema deve responder com status 202 em menos de 5 segundos
    E o processamento do pedido deve ocorrer de forma assíncrona

  Cenário: Enviar acknowledgment para todos os eventos
    Quando o iFood envia um webhook com evento "PLACED"
    Então o sistema deve enviar POST para "/events/v1.0/events/acknowledgment"
    E o campo "acknowledged" do evento deve ser marcado como true

  Cenário: Enviar acknowledgment para eventos não utilizados
    Quando o iFood envia um webhook com evento "STATUS_CHANGED" não processável
    Então o sistema deve responder com status 202
    E o sistema deve enviar acknowledgment para o evento
    E o evento não deve gerar um novo pedido

  Cenário: Deduplicar eventos repetidos
    Dado que já existe um evento iFood com id "EVT-123" processado
    Quando o iFood envia um webhook com o mesmo event_id "EVT-123"
    Então o sistema deve responder com status 202
    E o evento duplicado não deve ser processado novamente
    E não deve ser criado um pedido duplicado

  Cenário: Buscar detalhes completos do pedido
    Quando o sistema processa um evento "PLACED" para o pedido "ORD-001"
    Então o sistema deve fazer GET para "/order/v1.0/orders/ORD-001"
    E o pedido deve conter nome do cliente, telefone e endereço
    E os itens do pedido devem ser salvos na tabela "order_items"

  # --- Polling ---

  Cenário: Descobrir novos eventos via polling
    Dado que o job de polling está ativo
    Quando o polling executa GET para "/events/v1.0/events:polling"
    E a resposta contém um evento "PLACED" com id "EVT-456" não processado
    Então o evento deve ser salvo e enfileirado para processamento
    E o acknowledgment deve ser enviado

  Cenário: Polling ignora eventos já conhecidos
    Dado que já existe um evento com id "EVT-789" no sistema
    Quando o polling retorna o evento "EVT-789" novamente
    Então o evento não deve ser processado novamente
    E o acknowledgment deve ser enviado mesmo assim

  # --- Gestão de Status ---

  Cenário: Confirmar um pedido
    Dado que existe um pedido iFood com status "PLACED"
    Quando o operador clica em "Confirmar"
    Então o status do pedido deve mudar para "CONFIRMED"
    E um registro deve ser criado em "order_status_history"
    E o dashboard deve receber evento "order_status_updated" via Socket.IO

  Cenário: Despachar um pedido confirmado
    Dado que existe um pedido iFood com status "CONFIRMED"
    Quando o operador clica em "Despachar"
    Então o status do pedido deve mudar para "DISPATCHED"
    E um registro deve ser criado em "order_status_history"

  Cenário: Concluir um pedido despachado
    Dado que existe um pedido iFood com status "DISPATCHED"
    Quando o operador clica em "Concluir"
    Então o status do pedido deve mudar para "CONCLUDED"
    E um registro deve ser criado em "order_status_history"

  Cenário: Cancelar um pedido
    Dado que existe um pedido iFood com status "PLACED"
    Quando o operador clica em "Cancelar"
    Então o status do pedido deve mudar para "CANCELLED"
    E um registro deve ser criado em "order_status_history"

  Esquema do Cenário: Rejeitar transições de status inválidas
    Dado que existe um pedido iFood com status "<status_atual>"
    Quando o operador tenta mudar o status para "<status_novo>"
    Então o sistema deve retornar erro 422
    E a mensagem deve indicar "Transição de status inválida"
    E o status do pedido deve permanecer "<status_atual>"

    Exemplos:
      | status_atual | status_novo |
      | CONCLUDED    | CONFIRMED   |
      | CONCLUDED    | DISPATCHED  |
      | CANCELLED    | CONFIRMED   |
      | CANCELLED    | PLACED      |
      | DISPATCHED   | CONFIRMED   |
      | DISPATCHED   | PLACED      |
      | CONFIRMED    | PLACED      |
