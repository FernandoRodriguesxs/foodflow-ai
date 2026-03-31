# Declaração Explícita de Dependências (Dependencies)

**ID**: INFRAESTRUTURA-041
**Severidade**: 🔴 Crítica
**Categoria**: Infraestrutura

---

## O que é

Uma aplicação deve declarar **todas** as suas dependências de forma explícita e completa através de um manifesto de dependências (ex: `package.json`, `requirements.txt`). A aplicação nunca deve depender da existência implícita de pacotes no sistema.

## Por que importa

Dependências implícitas quebram a portabilidade e a reprodutibilidade do ambiente. Um novo desenvolvedor ou um novo servidor não conseguirá executar a aplicação sem conhecimento prévio das dependências ocultas, violando o princípio de *setup* mínimo.

## Critérios Objetivos

- [ ] **100%** das dependências de runtime e build devem estar declaradas no manifesto (`package.json`, `bun.lockb`).
- [ ] É proibido o uso de dependências globais do sistema (ex: bibliotecas instaladas via `npm install -g` ou `apt-get`).
- [ ] O *lockfile* de dependências deve ser versionado e mantido atualizado para garantir builds determinísticos.

## Exceções Permitidas

- **Runtime Base**: Dependências fundamentais do runtime (ex: Node.js, Bun, Python) que são declaradas como requisito de ambiente.

## Como Detectar

### Manual

Clonar o repositório em uma máquina limpa e executar `npm install && npm start` — se falhar por dependência faltante, há violação.

### Automático

CI/CD: Builds em containers efêmeros (Docker) que falham se houver dependências não declaradas.

## Relacionada com

- [014 - Princípio de Inversão de Dependência](014_principio-inversao-dependencia.md): complementa
- [018 - Princípio de Dependências Acíclicas](018_principio-dependencias-aciclicas.md): reforça
- [042 - Configurações via Ambiente](042_configuracoes-via-ambiente.md): complementa
- [044 - Separação Build, Release, Run](044_separacao-build-release-run.md): reforça

---

**Criada em**: 2025-01-10
**Versão**: 1.0
