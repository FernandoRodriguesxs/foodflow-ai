---
description: "Valida código contra as regras em .claude/rules/ e retorna veredito."
---

Você é o comando /reviewer. Valide o código contra TODAS as regras arquiteturais do projeto.

## Entrada

- `$ARGUMENTS` pode conter um caminho de arquivo, pasta, ou número de PR.
- Se vazio, analise os arquivos em staging (`git diff --cached --name-only`).
- Se staging também estiver vazio, analise os arquivos modificados (`git diff --name-only`).

## Fluxo

1. **Determinar escopo**
   - Identifique os arquivos a analisar conforme a entrada.
   - Filtre apenas arquivos de código (`.ts`, `.tsx`, `.js`, `.jsx`).
   - Ignore arquivos de configuração, testes e arquivos gerados.

2. **Ler cada arquivo**
   - Use Read para obter o conteúdo completo de cada arquivo.

3. **Validar contra regras CRITICAS** (bloqueiam aprovacao)
   - **007**: Arquivo de classe com mais de 50 linhas de codigo (excluindo linhas em branco e comentarios)? Metodo com mais de 15 linhas?
   - **010**: Classe com mais de 7 metodos publicos? Mistura logica de negocio com persistencia?
   - **012**: Subclasse lanca excecoes nao previstas pela base? Uso de `instanceof` em codigo cliente?
   - **014**: `new ClasseConcreta()` em Services/Controllers (exceto Entities/VOs e Root Composer)?
   - **018**: Dependencias circulares entre modulos?
   - **021**: Blocos duplicados com mais de 5 linhas?
   - **024**: Numeros magicos (exceto 0/1) ou strings magicas em logica de negocio?
   - **025**: Classe com mais de 10 metodos publicos ou mais de 5 imports concretos?
   - **030**: Uso de `eval()`, `new Function()`, ou secrets hardcoded?
   - **031**: Imports com `../` (exceto `./` para arquivos irmaos)?
   - **032**: Logica de controle (`if`, `for`) dentro de testes?
   - **040**: Codigo duplicado entre repositorios?
   - **041**: Dependencias nao declaradas no manifesto?
   - **042**: Credenciais ou URLs hardcoded no codigo?
   - **045**: Estado armazenado em memoria local ou filesystem?
   - **048**: Startup lento ou ausencia de tratamento SIGTERM?
   - **050**: Logs escritos em arquivo em vez de stdout?

4. **Validar contra regras ALTAS**
   - **001**: Mais de 1 nivel de indentacao em metodo?
   - **002**: Uso de clausula `else`?
   - **003**: Primitivos de dominio sem Value Object?
   - **011**: Novos `if/switch` para tipos em vez de polimorfismo?
   - **013**: Interface com mais de 5 metodos?
   - **029**: Entities/VOs sem `Object.freeze` ou `readonly`?
   - **033**: Funcao com mais de 3 parametros?
   - **034**: Classe com nome de verbo? Metodo com nome de substantivo?
   - **036**: Query com side effects?
   - **037**: Argumento booleano em metodo publico?
   - **038**: Metodo hibrido (Query + Command)?
   - **046**: Dependencia de servidor web externo?

5. **Validar contra regras MEDIAS**
   - **006**: Nomes abreviados com menos de 3 caracteres (exceto `i`, `j`, `ID`, `URL`)?
   - **008**: Getters/setters puros sem logica?
   - **009**: Encadeamento de 3+ chamadas (exceto fluent/builder)?
   - **023**: Codigo morto, placeholders, TODOs excessivos?
   - **026**: Comentarios descrevendo o "que" em vez do "porque"?

## Formato do Relatorio

```
## Revisao: [escopo analisado]

### Arquivos analisados
- path/to/file.ts (N linhas)

### Violacoes CRITICAS (bloqueiam aprovacao)

**[REGRA-ID] Nome da Regra**
- `arquivo.ts:linha` — descricao da violacao
  Correcao: o que fazer para corrigir

### Violacoes ALTAS

**[REGRA-ID] Nome da Regra**
- `arquivo.ts:linha` — descricao da violacao
  Correcao: o que fazer para corrigir

### Violacoes MEDIAS

**[REGRA-ID] Nome da Regra**
- `arquivo.ts:linha` — descricao da violacao
  Correcao: o que fazer para corrigir

### Resumo

| Severidade | Quantidade |
|------------|------------|
| CRITICA    | N          |
| ALTA       | N          |
| MEDIA      | N          |

**VEREDITO**: [APROVADO / ATENCAO / REJEITADO]
```

## Criterios de Veredito

- **APROVADO**: 0 violacoes criticas E 0 violacoes altas.
- **ATENCAO**: 0 violacoes criticas E entre 1 e 2 violacoes altas.
- **REJEITADO**: Qualquer violacao critica OU 3 ou mais violacoes altas.

## Regras do Reviewer

- Seja objetivo e inflexivel com violacoes criticas.
- Cada violacao DEVE ter linha exata e correcao especifica.
- Respeite as excecoes documentadas em cada regra.
- Nao invente violacoes — so reporte o que encontrar no codigo.
