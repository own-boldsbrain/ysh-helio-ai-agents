# 🎯 Skills, Capabilities & Tools - 360° Reference

**Última Atualização**: 2025-11-17  
**Escopo**: Agentes Especialistas, Ferramentas Disponíveis, Recursos de Referência  

---

## 📊 Sumário Executivo

| Categoria | Recursos | Status |
|-----------|----------|--------|
| **Agentes Especialistas** | 19 disponíveis | ✅ Full Stack |
| **Ferramentas de IA** | 5 plataformas | ✅ Integradas |
| **Infraestrutura** | Docker, K8s, Cloud | ✅ Pronta |
| **Monitoramento** | Prometheus, Grafana | ⚠️ Configurar |
| **Stack Tech** | Next.js, React, TS | ✅ Latest |

---

## 🤖 Agentes Especialistas Disponíveis

### Categoria 1: AI Providers (19 Agentes)

#### 1.1 Claude Models (Anthropic) - 4 Agentes

| Agente | Modelo | Capacidades | Custo |
|--------|--------|-----------|-------|
| **Claude 3.5 Sonnet** | claude-3-5-sonnet-20241022 | Coding, Analysis, Reasoning | $3/$15 per 1M tokens |
| **Claude 3.5 Haiku** | claude-3-5-haiku-20241022 | Fast, Cost-effective | $0.80/$4 per 1M tokens |
| **Claude 3 Opus** | claude-3-opus-20250219 | Long context, Complex tasks | $15/$90 per 1M tokens |
| **Claude 3 Sonnet** | claude-3-sonnet-20240229 | Balanced performance | $3/$15 per 1M tokens |

**Ref**: https://docs.anthropic.com/  
**API Key**: `ANTHROPIC_API_KEY`

#### 1.2 GPT Models (OpenAI) - 4 Agentes

| Agente | Modelo | Capacidades | Custo |
|--------|--------|-----------|-------|
| **GPT-4 Turbo** | gpt-4-turbo | Advanced reasoning | $10/$30 per 1M tokens |
| **GPT-4 Vision** | gpt-4-vision-preview | Image analysis | $10/$30 per 1M tokens |
| **GPT-4o** | gpt-4o | Optimized, faster | $5/$15 per 1M tokens |
| **GPT-3.5 Turbo** | gpt-3.5-turbo | Fast & cheap | $0.50/$1.50 per 1M tokens |

**Ref**: https://platform.openai.com/docs/  
**API Key**: `OPENAI_API_KEY`

#### 1.3 Gemini Models (Google) - 3 Agentes

| Agente | Modelo | Capacidades | Custo |
|--------|--------|-----------|-------|
| **Gemini 2.0 Flash** | gemini-2.0-flash | Fast, multimodal | Free (limited) |
| **Gemini 1.5 Pro** | gemini-1.5-pro | Advanced reasoning | $7.50/$30 per 1M tokens |
| **Gemini 1.5 Flash** | gemini-1.5-flash | Fast inference | $0.075/$0.30 per 1M tokens |

**Ref**: https://ai.google.dev/docs/  
**API Key**: `GOOGLE_AI_API_KEY`

#### 1.4 Groq Models - 2 Agentes

| Agente | Modelo | Capacidades | Custo |
|--------|--------|-----------|-------|
| **LLaMA 3 70B** | llama-3-70b-versatile | Fast inference | $0.59/$0.79 per 1M tokens |
| **Mixtral 8x7B** | mixtral-8x7b-32768 | High throughput | $0.24/$0.24 per 1M tokens |

**Ref**: https://console.groq.com/docs/  
**API Key**: `GROQ_API_KEY`

#### 1.5 Local Models (Ollama) - 6 Agentes

| Agente | Modelo | RAM Req | Velocidade | Custo |
|--------|--------|---------|-----------|-------|
| **Qwen2.5 Coder** | qwen2.5-coder | 6GB | Fast | ✅ Free |
| **Qwen2-VL** | qwen2-vl | 8GB | Medium | ✅ Free |
| **Gemma2** | gemma2 | 4GB | Fast | ✅ Free |
| **LLaMA3** | llama3 | 8GB | Medium | ✅ Free |
| **Mistral** | mistral | 4GB | Fast | ✅ Free |
| **Neural Chat** | neural-chat | 4GB | Medium | ✅ Free |

**Ref**: https://ollama.ai/  
**Setup**: `docker run -d -p 11434:11434 ollama/ollama`

---

## 🛠️ Ferramentas & APIs

### 1. GitHub Integration

```typescript
// Octokit Client for GitHub API
import { Octokit } from '@octokit/rest'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

// Common operations:
await octokit.repos.get({ owner, repo })
await octokit.issues.list({ owner, repo })
await octokit.pulls.list({ owner, repo })
await octokit.repos.getContent({ owner, repo, path })
```

**Endpoints**:
- Issues: `/repos/{owner}/{repo}/issues`
- Commits: `/repos/{owner}/{repo}/commits`
- Pull Requests: `/repos/{owner}/{repo}/pulls`
- Branches: `/repos/{owner}/{repo}/branches`

**Ref**: https://docs.github.com/en/rest/

### 2. Vercel Integration (Sandbox Deployment)

```typescript
// Vercel SDK for deployment
import { Deployment } from '@vercel/sdk'

const deployment = await vercel.deployments.create({
  name: 'sandbox-project',
  gitSource: {
    repo: 'owner/repo',
    ref: 'branch-name'
  }
})
```

**Credentials Required**:
- `SANDBOX_VERCEL_TOKEN` - API token
- `SANDBOX_VERCEL_TEAM_ID` - Team identifier
- `SANDBOX_VERCEL_PROJECT_ID` - Project identifier

**Ref**: https://vercel.com/docs/api/

### 3. Docker API

```bash
# Container lifecycle
docker create [OPTIONS] IMAGE [COMMAND]
docker start CONTAINER
docker stop CONTAINER
docker rm CONTAINER
docker exec CONTAINER COMMAND

# Image operations
docker build -t IMAGE:TAG .
docker push REGISTRY/IMAGE:TAG
docker pull REGISTRY/IMAGE:TAG

# Monitoring
docker stats CONTAINER
docker logs CONTAINER
docker inspect CONTAINER
```

**Compose Operations**:
```bash
docker-compose up -d [SERVICE]
docker-compose down
docker-compose logs -f [SERVICE]
docker-compose ps
docker-compose restart [SERVICE]
```

### 4. Database Access

```typescript
// PostgreSQL via Drizzle ORM
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const client = postgres(process.env.DATABASE_URL)
const db = drizzle(client)

// Type-safe queries
const users = await db.select().from(usersTable)
const user = await db.query.users.findFirst({
  where: (users, { eq }) => eq(users.id, userId)
})

// Mutations
await db.insert(usersTable).values({ name, email })
await db.update(usersTable).set({ name }).where(eq(id, userId))
await db.delete(usersTable).where(eq(id, userId))
```

**Ref**: https://orm.drizzle.team/

### 5. Monitoring & Logging

```typescript
// Prometheus Metrics
import prom from 'prom-client'

const httpRequestDuration = new prom.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
})

// Structured Logging
import { logger } from '@repo/lib/logger'

logger.info('Operation completed')  // ✅ Static only
logger.error('Operation failed', error)
```

---

## 🏗️ Infrastructure & Deployment

### Docker Stack

```yaml
# Production Services
postgres:15        # Database
redis:7           # Caching (optional)
rabbitmq:3.12     # Message queue (optional)
ollama:latest     # Local LLM (optional)
prometheus:latest # Metrics collection
grafana:latest    # Visualization
```

### Deployment Options

#### 1. Docker Compose (Development/Small Production)
```bash
docker-compose -f docker-compose.prod.yml up -d
# Easy, single-command deployment
# Good for <100 QPS
```

#### 2. Kubernetes (Enterprise/High Scale)
```bash
kubectl apply -f K8S_DEPLOYMENT.template.yaml
# Horizontal scaling
# High availability
# Auto-healing
```

#### 3. Vercel (Serverless)
```bash
# For frontend + serverless functions
# Auto-scaling
# Global CDN
```

### Load Balancing Options

```nginx
# Nginx configuration for load balancing
upstream backend {
    least_conn;
    server web1:3000;
    server web2:3000;
    server web3:3000;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
    }
}
```

---

## 📊 Performance & Scaling

### Benchmarks

| Operation | Target | Current | Status |
|-----------|--------|---------|--------|
| API Response | <200ms | Unknown | ⚠️ Monitor |
| Build Time | <1min | ~2min | ⚠️ Optimize |
| Page Load | <2s | Unknown | ⚠️ Monitor |
| DB Query | <50ms | Unknown | ⚠️ Monitor |
| Docker Build | <1min | Unknown | ⚠️ Optimize |

### Resource Allocation

```yaml
# Recommended for production
Web Service:
  CPU: 2 cores
  Memory: 2GB
  Disk: 20GB

Database:
  CPU: 1 core
  Memory: 2GB
  Disk: 100GB

Cache (Redis):
  CPU: 0.5 cores
  Memory: 1GB

Total: ~5.5 cores, ~5GB RAM
```

---

## 🔐 Security & Credentials

### API Keys Required

| Service | Env Var | Type | Priority |
|---------|---------|------|----------|
| Anthropic | `ANTHROPIC_API_KEY` | Secret | HIGH |
| OpenAI | `OPENAI_API_KEY` | Secret | HIGH |
| Google AI | `GOOGLE_AI_API_KEY` | Secret | MEDIUM |
| Groq | `GROQ_API_KEY` | Secret | MEDIUM |
| GitHub | `GITHUB_TOKEN` | Secret | HIGH |
| Vercel | `SANDBOX_VERCEL_TOKEN` | Secret | HIGH |
| Vercel Team | `SANDBOX_VERCEL_TEAM_ID` | Secret | HIGH |
| Vercel Project | `SANDBOX_VERCEL_PROJECT_ID` | Secret | HIGH |
| Database | `DATABASE_URL` | Secret | HIGH |
| Encryption | `JWE_SECRET` | Secret | HIGH |

### Credential Redaction

```typescript
// Automatic redaction of sensitive data
import { redactSensitiveInfo } from '@repo/lib/logging'

const log = redactSensitiveInfo(logMessage)
// Removes: API keys, tokens, credentials, team/project IDs
```

**Patterns Redacted**:
- API Keys (ANTHROPIC_, OPENAI_, etc.)
- GitHub tokens (ghp_*, gho_*, etc.)
- Bearer tokens
- Email addresses
- Phone numbers
- API URLs with auth

---

## 🔧 Development Tools

### Package Management
```bash
pnpm install         # Install deps
pnpm add <pkg>      # Add package
pnpm update         # Update deps
pnpm build          # Build all
pnpm lint           # Lint code
pnpm format         # Format code
pnpm type-check     # Type validation
pnpm test           # Run tests
```

### Code Quality

```bash
# Formatting
pnpm format          # Auto-format
pnpm format:check    # Check formatting

# Linting
pnpm lint            # ESLint

# Type Checking
pnpm type-check      # TypeScript strict

# Testing
pnpm test            # Unit + integration
pnpm test:coverage   # Coverage report
pnpm test:e2e        # End-to-end
```

### Monorepo Commands

```bash
turbo build          # Build all packages
turbo build --filter web  # Build specific
turbo run test       # Test all
turbo run lint       # Lint all
turbo cache clean    # Clear cache
```

---

## 📚 Reference URLs

### Documentation
- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **Drizzle ORM**: https://orm.drizzle.team/docs
- **Radix UI**: https://www.radix-ui.com/docs

### AI Providers
- **Anthropic Claude**: https://docs.anthropic.com/
- **OpenAI**: https://platform.openai.com/docs/
- **Google AI**: https://ai.google.dev/docs/
- **Groq**: https://console.groq.com/docs/
- **Ollama**: https://ollama.ai/

### Infrastructure
- **Docker**: https://docs.docker.com/
- **Kubernetes**: https://kubernetes.io/docs/
- **Vercel**: https://vercel.com/docs/
- **GitHub API**: https://docs.github.com/en/rest/

### Monitoring
- **Prometheus**: https://prometheus.io/docs/
- **Grafana**: https://grafana.com/docs/
- **Datadog**: https://docs.datadoghq.com/

---

## 🎓 Learning Paths

### For New Developers

1. **Week 1: Foundations**
   - [ ] Read Next.js docs (2 hours)
   - [ ] Understand monorepo structure (1 hour)
   - [ ] Setup local environment (1 hour)

2. **Week 2: Core Features**
   - [ ] Build first API endpoint (2 hours)
   - [ ] Create React component (2 hours)
   - [ ] Write unit test (1 hour)

3. **Week 3: Production**
   - [ ] Deploy to Docker (1 hour)
   - [ ] Setup monitoring (2 hours)
   - [ ] Create production checklist (1 hour)

### For AI/ML Engineers

1. **Integration**
   - [ ] Setup Ollama locally (30 min)
   - [ ] Test multi-agent routing (1 hour)
   - [ ] Implement custom agent (2 hours)

2. **Optimization**
   - [ ] Profile LLM latency (1 hour)
   - [ ] Setup caching layer (1.5 hours)
   - [ ] Batch request processing (2 hours)

### For DevOps/SRE

1. **Infrastructure**
   - [ ] Review Docker configs (1 hour)
   - [ ] Setup monitoring stack (2 hours)
   - [ ] Create runbooks (2 hours)

2. **Scaling**
   - [ ] Implement load balancing (1.5 hours)
   - [ ] Setup auto-scaling (2 hours)
   - [ ] Create disaster recovery plan (1 hour)

---

## 🚀 Quick Start Commands

```bash
# Clone & Setup
git clone <repo>
cd coding-agent-template
cp .env.example .env

# Environment Setup
pnpm install
pnpm build

# Local Development (DON'T RUN - see AGENTS.md)
# Use these instead:
pnpm type-check
pnpm lint
pnpm test

# Docker Development
docker-compose up -d postgres
docker-compose logs -f

# Production Build
docker build -f Dockerfile.prod -t app:latest .
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📞 Support & Resources

### Internal Documentation
- `README.md` - Project overview
- `AGENTS.md` - AI agent guidelines & security rules
- `CODE_REVIEW_360_PERFORMANCE.md` - Architecture analysis
- `QUICK_WINS_IMPLEMENTATION_GUIDE.md` - Implementation roadmap
- `ARCHITECTURE_TROUBLESHOOTING.md` - Troubleshooting guide

### External Resources
- GitHub Issues: https://github.com/issues
- Stack Overflow: https://stackoverflow.com/
- AI Provider Support: Check respective provider docs
- Docker Community: https://forums.docker.com/

### Team Contacts
- **Lead Architecture**: Review `ARCHITECTURE_TROUBLESHOOTING.md`
- **DevOps Questions**: See Docker/K8s docs + internal runbooks
- **Security Issues**: Check `AGENTS.md` security section
- **AI Integration**: Refer to provider documentation

---

**Last Updated**: 2025-11-17  
**Version**: 1.0  
**Status**: ✅ Complete & Ready for Reference
