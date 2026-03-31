# Processos Stateless (Processes)

**ID**: INFRAESTRUTURA-045
**Severidade**: 🔴 Crítica
**Categoria**: Infraestrutura

---

## O que é

Os processos da aplicação devem ser **stateless** (sem estado) e **share-nothing**. Qualquer dado que precise persistir deve ser armazenado em um serviço de apoio com estado (banco de dados, cache distribuído, object storage).

## Por que importa

Processos stateless podem ser escalados horizontalmente sem complexidade, reiniciados a qualquer momento sem perda de dados, e distribuídos entre múltiplos servidores. Estado em memória ou filesystem local impede escalabilidade e causa perda de dados.

## Critérios Objetivos

- [ ] É proibido armazenar estado de sessão em memória local — sessões devem usar stores externos (Redis, banco de dados).
- [ ] É proibido assumir que arquivos escritos no filesystem local estarão disponíveis em requisições futuras.
- [ ] O processo deve ser capaz de reiniciar a qualquer momento sem perda de dados do usuário (*crash-only design*).

## Exceções Permitidas

- **Cache em Memória Efêmero**: Cache local de curta duração para otimização, desde que a aplicação funcione corretamente sem ele.
- **Arquivos Temporários**: Uso de `/tmp` para operações de curta duração dentro de uma única requisição.

## Como Detectar

### Manual

Verificar se a aplicação falha ou perde dados quando um processo é reiniciado durante uma operação.

### Automático

Testes de caos: Reiniciar processos aleatoriamente e verificar se a aplicação mantém consistência.

## Relacionada com

- [029 - Imutabilidade de Objetos](029_imutabilidade-objetos-freeze.md): complementa
- [036 - Restrição de Funções com Efeitos Colaterais](036_restricao-funcoes-efeitos-colaterais.md): reforça
- [043 - Serviços de Apoio como Recursos](043_servicos-apoio-recursos.md): reforça
- [047 - Concorrência via Processos](047_concorrencia-via-processos.md): complementa
- [048 - Descartabilidade de Processos](048_descartabilidade-processos.md): reforça

---

**Criada em**: 2025-01-10
**Versão**: 1.0
