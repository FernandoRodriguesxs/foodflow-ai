# Separação Estrita de Build, Release e Run

**ID**: INFRAESTRUTURA-044
**Severidade**: 🔴 Crítica
**Categoria**: Infraestrutura

---

## O que é

O processo de deploy deve ser separado em três estágios distintos e imutáveis: **Build** (compila o código), **Release** (combina build com configuração), e **Run** (executa a aplicação). Cada release deve ter um identificador único e ser imutável.

## Por que importa

A separação permite rollbacks rápidos, auditoria de releases, e garante que o código em execução seja exatamente o mesmo que foi testado. Misturar estágios cria ambiguidade sobre o que está rodando e impede reprodutibilidade.

## Critérios Objetivos

- [ ] O estágio de **Build** deve produzir um artefato executável (bundle, container image) sem dependências de configuração de ambiente.
- [ ] O estágio de **Release** deve ser imutável — uma vez criada, a release não pode ser alterada; correções exigem nova release.
- [ ] Toda release deve ter um **identificador único** (timestamp, hash, número sequencial) para rastreabilidade.

## Exceções Permitidas

- **Ambiente de Desenvolvimento Local**: Build e run podem ser combinados para agilizar o ciclo de desenvolvimento (ex: `bun run dev`).

## Como Detectar

### Manual

Verificar se é possível alterar código ou configuração de uma release já em produção sem criar uma nova release.

### Automático

CI/CD: Pipeline que rejeita deploys manuais e exige passagem pelos três estágios com versionamento.

## Relacionada com

- [040 - Base de Código Única](040_base-codigo-unica.md): complementa
- [041 - Declaração Explícita de Dependências](041_declaracao-explicita-dependencias.md): reforça
- [042 - Configurações via Ambiente](042_configuracoes-via-ambiente.md): complementa
- [049 - Paridade Dev/Prod](049_paridade-dev-prod.md): reforça

---

**Criada em**: 2025-01-10
**Versão**: 1.0
