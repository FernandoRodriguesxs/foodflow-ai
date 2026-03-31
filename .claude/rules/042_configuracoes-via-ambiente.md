# Configurações via Variáveis de Ambiente (Config)

**ID**: INFRAESTRUTURA-042
**Severidade**: 🔴 Crítica
**Categoria**: Infraestrutura

---

## O que é

Todas as configurações que variam entre ambientes (*deploy*) devem ser armazenadas em **variáveis de ambiente**, não em arquivos de configuração versionados ou hardcoded no código. Isso inclui credenciais, URLs de serviços, e feature flags.

## Por que importa

Configurações hardcoded ou em arquivos versionados criam risco de vazamento de credenciais, impedem deploys flexíveis e violam a separação entre código e configuração. Variáveis de ambiente permitem que o mesmo código rode em qualquer ambiente.

## Critérios Objetivos

- [ ] Credenciais (API keys, senhas, tokens) devem ser acessadas **exclusivamente** via `process.env` ou equivalente.
- [ ] É proibido versionar arquivos `.env` com valores reais de produção ou staging.
- [ ] O código deve funcionar com **zero** arquivos de configuração específicos de ambiente no repositório.

## Exceções Permitidas

- **Configurações de Desenvolvimento**: Arquivo `.env.example` com valores de exemplo para documentação.
- **Configurações Estruturais**: Arquivos de configuração de build (`tsconfig.json`, `biome.json`) que não variam entre deploys.

## Como Detectar

### Manual

Busca por strings de conexão, URLs de API, ou credenciais hardcoded no código-fonte.

### Automático

ESLint: Regras customizadas para detectar strings que parecem credenciais. Git-secrets ou Gitleaks para varredura de segredos.

## Relacionada com

- [030 - Proibição de Funções Inseguras](030_proibicao-funcoes-inseguras.md): reforça
- [024 - Proibição de Constantes Mágicas](024_proibicao-constantes-magicas.md): reforça
- [041 - Declaração Explícita de Dependências](041_declaracao-explicita-dependencias.md): complementa
- [043 - Serviços de Apoio como Recursos](043_servicos-apoio-recursos.md): complementa
- [049 - Paridade Dev/Prod](049_paridade-dev-prod.md): reforça

---

**Criada em**: 2025-01-10
**Versão**: 1.0
