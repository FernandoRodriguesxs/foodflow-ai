# language: pt
Funcionalidade: [Nome da Funcionalidade]
  Como [tipo de usuário]
  Eu quero [realizar alguma ação]
  Para que [obter algum benefício]

  # Contexto compartilhado por todos os cenários
  Contexto:
    Dado que o sistema está disponível
    E que existem os seguintes usuários no sistema:
      | nome     | email            | role  |
      | João     | joao@email.com   | user  |
      | Maria    | maria@email.com  | admin |

  # Cenário 1: Caminho Feliz (Happy Path)
  Cenário: [Nome do cenário de sucesso]
    Dado que [pré-condição 1]
    E [pré-condição 2]
    Quando [ação do usuário]
    Então [resultado esperado]
    E [verificação adicional]

  # Cenário 2: Com Exemplos (Scenario Outline)
  Esquema do Cenário: [Nome do cenário com múltiplos inputs]
    Dado que eu estou logado como "<usuario>"
    Quando eu tento "<acao>"
    Então eu devo ver "<resultado>"

    Exemplos:
      | usuario | acao                | resultado           |
      | João    | criar post          | Post criado         |
      | Maria   | deletar post        | Post deletado       |
      | Admin   | banir usuário       | Usuário banido      |

  # Cenário 3: Tratamento de Erro
  Cenário: [Nome do cenário de erro]
    Dado que [situação de erro]
    Quando [ação que causa erro]
    Então [mensagem de erro apropriada]
    E [sistema mantém integridade]

  # Cenário 4: Validação de Regra de Negócio
  Cenário: [Nome da regra de negócio]
    Dado que [contexto da regra]
    Quando [condição que ativa a regra]
    Então [comportamento esperado pela regra]

  @integration
  Cenário: [Cenário de integração com sistema externo]
    Dado que o serviço externo "[nome]" está disponível
    Quando eu faço uma requisição para "[endpoint]"
    Então a resposta deve ter status "200"
    E o payload deve conter:
      """json
      {
        "status": "success",
        "data": {}
      }
      """

  @performance
  Cenário: [Cenário de performance]
    Dado que existem "1000" registros no banco
    Quando eu busco a lista com paginação
    Então a resposta deve ser retornada em menos de "200" milissegundos

  @security
  Cenário: [Cenário de segurança]
    Dado que eu não estou autenticado
    Quando eu tento acessar um recurso protegido
    Então eu devo receber um erro "401 Unauthorized"
