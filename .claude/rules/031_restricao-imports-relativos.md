# Proibição de Imports Relativos (Obrigatoriedade de Path Aliases)

**ID**: ESTRUTURAL-031
**Severidade**: 🔴 Crítica
**Categoria**: Estrutural

---

## O que é

Proíbe **completamente** o uso de caminhos relativos com `../` e impõe o uso obrigatório de *path aliases* para todos os imports entre módulos.

## Por que importa

*Imports* relativos quebram a **portabilidade** e a **legibilidade** do código. A regra reforça a **Arquitetura Limpa**, garantindo que módulos sejam sempre referenciados por seus aliases (`@agent`, `@dom`, `@event`, etc.), tornando o código mais consistente e fácil de refatorar.

## Critérios Objetivos

- [ ] É **proibido** o uso de `../` em qualquer caminho de *import*.
- [ ] Todos os módulos devem ser importados exclusivamente por *path aliases* (ex: `import { X } from "@dom/html"`).
- [ ] Apenas imports do mesmo diretório (`./file`) são permitidos para arquivos irmãos.
- [ ] O arquivo de configuração (`vite.config.js` ou `tsconfig.json`) deve definir todos os *paths* necessários.

## Exceções Permitidas

- **Arquivos Irmãos**: *Imports* diretos para arquivos no mesmo diretório (`./file`) são permitidos.

## Como Detectar

### Manual

Busca por `../` em qualquer arquivo de código-fonte.

### Automático

ESLint/Biome: Regra `no-relative-imports` configurada para proibir qualquer uso de `../`.

## Relacionada com

- [014 - Princípio de Inversão de Dependência](014_principio-inversao-dependencia.md): reforça
- [018 - Princípio de Dependências Acíclicas](018_principio-dependencias-aciclicas.md): reforça

---

**Criada em**: 2025-10-08
**Atualizada em**: 2026-01-11
**Versão**: 2.0
