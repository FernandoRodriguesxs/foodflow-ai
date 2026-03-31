# Escalabilidade via Modelo de Processos (Concurrency)

**ID**: INFRAESTRUTURA-047
**Severidade**: 🟠 Alta
**Categoria**: Infraestrutura

---

## O que é

A aplicação deve escalar horizontalmente através da execução de **múltiplos processos** independentes, não através de threads internas ou um único processo monolítico. Diferentes tipos de trabalho (web, worker, scheduler) devem ser separados em tipos de processos distintos.

## Por que importa

O modelo de processos permite escalabilidade elástica — adicionar mais processos web para lidar com tráfego, ou mais workers para processar filas. Cada tipo de processo pode ser escalado independentemente conforme a demanda, otimizando recursos.

## Critérios Objetivos

- [ ] A aplicação deve suportar execução de **múltiplas instâncias** do mesmo processo sem conflito.
- [ ] Diferentes cargas de trabalho (HTTP, background jobs, scheduled tasks) devem ser separadas em processos distintos.
- [ ] O processo não deve fazer *daemonize* ou escrever PID files — o gerenciamento de processos é responsabilidade do ambiente de execução.

## Exceções Permitidas

- **Workers Internos**: Uso de worker threads para operações CPU-bound dentro de uma requisição, desde que o estado não seja compartilhado entre requisições.

## Como Detectar

### Manual

Verificar se a aplicação pode rodar N instâncias simultâneas com um load balancer na frente, sem conflitos.

### Automático

Testes de carga: Escalar horizontalmente e verificar se throughput aumenta linearmente.

## Relacionada com

- [045 - Processos Stateless](045_processos-stateless.md): complementa
- [046 - Port Binding](046_port-binding.md): complementa
- [048 - Descartabilidade de Processos](048_descartabilidade-processos.md): reforça
- [010 - Princípio da Responsabilidade Única](010_principio-responsabilidade-unica.md): reforça

---

**Criada em**: 2025-01-10
**Versão**: 1.0
