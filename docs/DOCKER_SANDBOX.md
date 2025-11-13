# Docker Sandbox Configuration

Este documento explica como configurar e usar o Docker como provedor de sandbox ao invés do Vercel Sandbox.

## Visão Geral

O projeto suporta dois provedores de sandbox:

- **Vercel Sandbox** (padrão): Ambientes isolados gerenciados pelo Vercel
- **Docker** (novo): Containers Docker locais para desenvolvimento e isolamento

## Vantagens do Docker Sandbox

- ✅ **Controle total**: Ambientes locais sob seu controle
- ✅ **Sem dependências externas**: Não requer credenciais do Vercel
- ✅ **Desenvolvimento offline**: Funciona sem conexão com internet
- ✅ **Customização**: Imagem Docker totalmente personalizável
- ✅ **Custo zero**: Não há custos de infraestrutura externa

## Requisitos

- Docker instalado e funcionando
- Acesso ao Docker daemon (Docker Desktop no Windows/Mac ou Docker Engine no Linux)
- Mínimo 4GB de RAM disponível para containers

## Configuração

### 1. Construir a Imagem Docker

Primeiro, construa a imagem do sandbox:

```bash
# No Windows (WSL)
bash scripts/build-sandbox-image.sh

# Ou manualmente
docker build -f lib/sandbox/Dockerfile.sandbox -t coding-agent-sandbox:latest .
```

### 2. Configurar Variáveis de Ambiente

Edite seu arquivo `.env.local`:

```bash
# Mudar provedor de sandbox para Docker
SANDBOX_PROVIDER=docker

# Configuração do Docker Sandbox
SANDBOX_DOCKER_IMAGE=coding-agent-sandbox:latest
DOCKER_NETWORK=coding-agent-network

# As variáveis do Vercel Sandbox não são mais necessárias
# SANDBOX_VERCEL_TOKEN=...
# SANDBOX_VERCEL_TEAM_ID=...
# SANDBOX_VERCEL_PROJECT_ID=...
```

### 3. Criar Network Docker (Opcional)

A network é criada automaticamente, mas você pode criá-la manualmente:

```bash
docker network create coding-agent-network
```

## Como Funciona

### Ciclo de Vida do Container

1. **Criação**: Um container é criado para cada sandbox solicitado
2. **Clone**: O repositório Git é clonado automaticamente no container
3. **Execução**: Comandos são executados dentro do container isolado
4. **Limpeza**: Container é removido quando o sandbox é encerrado

### Estrutura de Diretórios

Dentro do container:

```
/workspace/
├── project/          # Repositório clonado aqui
│   ├── .git/
│   ├── src/
│   └── package.json
└── ...
```

### Portas Expostas

O container expõe as seguintes portas por padrão:

- `3000` - Next.js / Create React App
- `5173` - Vite
- `8080` - Servidores genéricos
- `5000` - Flask / Express

## Customização da Imagem

### Adicionar Ferramentas

Edite `lib/sandbox/Dockerfile.sandbox` para adicionar ferramentas:

```dockerfile
# Adicionar mais ferramentas
RUN apk add --no-cache \
    postgresql-client \
    redis \
    vim
```

### Instalar Pacotes Globais

```dockerfile
# Adicionar pacotes npm globais
RUN npm install -g \
    vercel \
    netlify-cli \
    firebase-tools
```

### Mudar Versão do Node

```dockerfile
# Usar Node 18 ao invés de 20
FROM node:18-alpine
```

Depois de modificar, reconstrua a imagem:

```bash
bash scripts/build-sandbox-image.sh
```

## Comandos Úteis

### Listar Containers Ativos

```bash
docker ps --filter "name=sandbox-"
```

### Ver Logs de um Container

```bash
docker logs <container-id>
```

### Conectar a um Container

```bash
docker exec -it <container-id> /bin/bash
```

### Limpar Containers Órfãos

```bash
# Parar todos os containers de sandbox
docker ps --filter "name=sandbox-" -q | xargs docker stop

# Remover containers parados
docker container prune -f
```

### Limpar Imagens Antigas

```bash
docker image prune -f
```

## Resolução de Problemas

### Container não inicia

**Problema**: `Failed to create Docker sandbox`

**Soluções**:

1. Verifique se o Docker está rodando: `docker ps`
2. Verifique se a imagem existe: `docker images | grep coding-agent-sandbox`
3. Reconstrua a imagem: `bash scripts/build-sandbox-image.sh`

### Comandos falham no container

**Problema**: `Command execution failed`

**Soluções**:

1. Conecte ao container para debug: `docker exec -it <container-id> /bin/bash`
2. Verifique os logs: `docker logs <container-id>`
3. Verifique se o diretório `/workspace/project` existe

### Porta já em uso

**Problema**: `port is already allocated`

**Soluções**:

1. Escolha outra porta no código
2. Pare o container que está usando a porta
3. Use `docker ps` para identificar conflitos

### Performance lenta

**Problema**: Container lento no Windows

**Soluções**:

1. Use WSL 2 backend do Docker Desktop
2. Aumente recursos do Docker Desktop (Settings → Resources)
3. Coloque o projeto dentro do WSL ao invés de /mnt/c/

## Migração do Vercel Sandbox

Se você já usava Vercel Sandbox, a migração é simples:

1. **Construa a imagem Docker** (passo 1 acima)
2. **Mude `SANDBOX_PROVIDER=docker`** no `.env.local`
3. **Reinicie o servidor** Next.js

Nenhuma mudança no código é necessária - a abstração é compatível com ambos.

## Comparação Vercel vs Docker

| Recurso | Vercel Sandbox | Docker Sandbox |
|---------|---------------|----------------|
| Custo | Pago (após free tier) | Gratuito |
| Setup | Rápido (só credenciais) | Requer build de imagem |
| Performance | Alta (servidores Vercel) | Depende do host |
| Isolamento | Total (cloud) | Processo isolado (local) |
| Customização | Limitada | Total |
| Offline | Não | Sim |
| Rede | Vercel Edge | Rede Docker local |

## Próximos Passos

- [x] Adicionar suporte a volumes persistentes
- [x] Implementar cache de camadas Docker
- [x] Adicionar métricas de uso de recursos
- [x] Criar imagens especializadas (Python, Java, etc.)

## Recursos Avançados

### Volumes Persistentes

Os dados do projeto agora são armazenados em volumes Docker, permitindo persistência entre reinicializações:

```bash
# Listar volumes criados
docker volume ls | grep sandbox

# Inspecionar um volume específico
docker volume inspect sandbox-abc123-data

# Limpar volumes não utilizados
docker volume prune
```

Para manter volumes após parar sandboxes (útil para debug):

```bash
SANDBOX_KEEP_VOLUME=true
```

### Métricas de Recursos

Obtenha métricas em tempo real do uso de recursos:

```typescript
const sandbox = await DockerSandbox.get({ sandboxId: 'sandbox-id' })
const metrics = await sandbox.getMetrics()

console.log(metrics)
// {
//   cpu: 12.5,              // CPU usage %
//   memory: 256,            // Memory in MB
//   memoryLimit: 2048,      // Memory limit in MB
//   diskUsage: 150,         // Disk usage in MB
//   networkRx: 1024,        // Network received (bytes)
//   networkTx: 512          // Network transmitted (bytes)
// }
```

### Limites de Recursos

Configure limites de CPU e memória no `.env.local`:

```bash
# Limitar a 2 CPUs e 2GB de RAM
SANDBOX_MEMORY_LIMIT=2g
SANDBOX_CPU_LIMIT=2

# Para projetos maiores
SANDBOX_MEMORY_LIMIT=4g
SANDBOX_CPU_LIMIT=4
```

### Imagens Especializadas

Escolha a imagem otimizada para seu projeto:

#### Python (Data Science & ML)

```bash
SANDBOX_DOCKER_IMAGE=coding-agent-sandbox:python
```

Inclui:
- Python 3.12
- NumPy, Pandas, Matplotlib, Scikit-learn
- Flask, FastAPI, Uvicorn
- Pytest, Black, Mypy, Flake8
- Jupyter, IPython
- Node.js 20 (para projetos fullstack)

#### Java (Enterprise & Spring)

```bash
SANDBOX_DOCKER_IMAGE=coding-agent-sandbox:java
```

Inclui:
- OpenJDK 21 (Eclipse Temurin)
- Maven 3.9.6
- Gradle 8.5
- Node.js 20 (para projetos fullstack)
- Cache pré-configurado para Maven/Gradle

#### Node.js (Web Development)

```bash
SANDBOX_DOCKER_IMAGE=coding-agent-sandbox:nodejs
```

Inclui:
- Node.js 20
- pnpm, yarn, npm
- TypeScript, tsx, ts-node
- NestJS CLI, Angular CLI, Vite
- PM2, nodemon
- ESLint, Prettier
- Python 3 (para ferramentas de build)

### Construir Imagens Especializadas

```bash
# Construir todas as imagens
bash scripts/build-specialized-images.sh --all

# Construir apenas uma imagem específica
bash scripts/build-specialized-images.sh --python
bash scripts/build-specialized-images.sh --java
bash scripts/build-specialized-images.sh --nodejs

# Com cache otimizado (BuildKit)
export DOCKER_BUILDKIT=1
bash scripts/build-specialized-images.sh --all
```

### Cache de Camadas Docker

As imagens especializadas usam BuildKit para cache eficiente:

- **Cache de dependências**: pip, npm, Maven, Gradle usam cache mounts
- **Cache entre builds**: Reutiliza camadas não modificadas
- **Cache compartilhado**: Camadas base compartilhadas entre imagens

Para limpar cache:

```bash
docker builder prune
```

## Suporte

Para problemas ou sugestões, abra uma issue no repositório.
