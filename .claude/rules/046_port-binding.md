# Exposição de Serviços via Port Binding

**ID**: INFRAESTRUTURA-046
**Severidade**: 🟠 Alta
**Categoria**: Infraestrutura

---

## O que é

A aplicação deve ser **completamente autocontida** e expor seus serviços através de *port binding*. Ela não deve depender de um servidor web externo (Apache, Nginx) injetado em runtime para ser executável — o servidor HTTP deve ser embutido na aplicação.

## Por que importa

Port binding garante que a aplicação seja portável e possa ser executada em qualquer ambiente sem configuração de servidor externo. A aplicação se torna um serviço que pode ser consumido por outras aplicações via URL, criando uma arquitetura de microserviços natural.

## Critérios Objetivos

- [ ] A aplicação deve iniciar seu próprio servidor HTTP/HTTPS e fazer *bind* em uma porta especificada por variável de ambiente.
- [ ] É proibido depender de configuração de servidor web externo (VirtualHost, .htaccess) para funcionar corretamente.
- [ ] A porta de execução deve ser configurável via `PORT` ou variável equivalente, não hardcoded.

## Exceções Permitidas

- **Reverse Proxy**: Uso de Nginx/HAProxy na frente da aplicação para TLS termination, load balancing, ou roteamento — desde que a aplicação funcione sem ele.
- **Aplicações Frontend SPA**: Aplicações estáticas que são servidas por CDN ou servidor de arquivos estáticos.

## Como Detectar

### Manual

Verificar se a aplicação pode ser iniciada e acessada apenas com `npm start` ou `bun run start`, sem configuração adicional de servidor.

### Automático

CI/CD: Testes que iniciam a aplicação em container limpo e verificam se responde em porta configurada.

## Relacionada com

- [042 - Configurações via Ambiente](042_configuracoes-via-ambiente.md): reforça
- [043 - Serviços de Apoio como Recursos](043_servicos-apoio-recursos.md): complementa
- [047 - Concorrência via Processos](047_concorrencia-via-processos.md): complementa
- [048 - Descartabilidade de Processos](048_descartabilidade-processos.md): complementa

---

**Criada em**: 2025-01-10
**Versão**: 1.0
