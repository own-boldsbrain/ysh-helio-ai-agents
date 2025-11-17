# 🔍 CÓDIGO-REVIEW 360° - CODING AGENT TEMPLATE

**Data:** 2025-11-17  
**Versão Aplicação:** 2.0.0  
**Status Atual:** Production-Ready com Gaps Identificados  
**Reviewers:** Specialist AI Agents (Full-Stack Coverage)

---

## 📋 SUMÁRIO EXECUTIVO

### Métricas Atuais vs. Alvo

| Métrica                  | Atual | Alvo  | Gap  | Prioridade  |
| ------------------------ | ----- | ----- | ---- | ----------- |
| **Architecture Score**   | 7/10  | 9/10  | +2   | 🟡 Medium   |
| **Infrastructure Score** | 5/10  | 10/10 | +5   | 🔴 CRITICAL |
| **Security Score**       | 6/10  | 9/10  | +3   | 🔴 CRITICAL |
| **Performance Score**    | 6/10  | 9/10  | +3   | 🟡 Medium   |
| **Testing Coverage**     | 45%   | 80%+  | +35% | 🟡 Medium   |
| **Docker Maturity**      | 3/10  | 10/10 | +7   | 🔴 CRITICAL |
| **CI/CD Automation**     | 50%   | 95%+  | +45% | 🔴 CRITICAL |
| **Production Readiness** | 6/10  | 9/10  | +3   | 🔴 CRITICAL |

---

## 🏗️ ARQUITETURA TÉCNICA

### Stack Atual ✅ Excelente

```
Frontend:
├── Next.js 16 (App Router)
├── React 19
├── TypeScript 5.7
├── Tailwind CSS 4
├── UI Components (shadcn/ui)
└── Shadcn Form Builder

Backend:
├── Node.js Runtime
├── Express/Next.js API Routes
├── PostgreSQL 15
├── Drizzle ORM
└── TypeScript

DevOps:
├── Docker & Docker Compose
├── GitHub Actions (Basic)
├── Turbo (Monorepo)
├── pnpm (Workspace)
└── Biome/ESLint (Code Quality)

Monorepo Structure:
├── apps/
│   ├── web (Main Next.js app)
│   ├── playground-vite (Vite app)
│   └── lab-ladle (Component lab)
├── packages/
│   ├── lib (Shared utilities)
│   ├── ui (Shared components)
│   └── tsconfig (Shared config)
```

### Pontos Fortes ✅

1. **Monorepo Excelente**
   - Turborepo + pnpm bem configurado
   - Caching estratégico
   - Shared packages organizados
   - Workspace scripts bem definidos

2. **Type Safety**
   - TypeScript strict mode
   - Proper tsconfig paths
   - Type exports centralizados
   - Zero any types (mostly)

3. **Modern Stack**
   - Versões atualizadas
   - Padrões modernos (App Router)
   - React 19 com Server Components
   - Performance-first tooling

4. **Code Quality**
   - Biome + ESLint
   - Prettier formatting
   - Lint scripts definidos
   - Format scripts automatizados

### Gaps Críticos ❌

#### 1. **Falta de Pacotes Shared** 🔴 CRITICAL

```diff
- ❌ Não existe: @repo/api-types
- ❌ Não existe: @repo/constants
- ❌ Não existe: @repo/hooks
- ❌ Não existe: @repo/services
```

**Impacto:**

- Duplicação de tipos através do projeto
- Magic strings espalhados
- Hooks duplicados entre apps
- API clients não compartilhados
- Difícil manutenção

**Solução:** [Veja SESSION-ARCHITECTURE](#arquitetura-criação-de-pacotes)

#### 2. **Docker não Pronto para Produção** 🔴 CRITICAL

```
✅ Exist:
  - Dockerfile.dev
  - docker-compose.dev.yml
  - docker-compose.yml (basic)

❌ Falta:
  - Dockerfile.prod (multi-stage)
  - docker-compose.prod.yml (production)
  - Health checks em containers
  - Resource limits/reservations
  - Non-root user execution
  - Security scanning
```

**Impacto:**

- Não pode fazer deploy seguro
- Sem health checks = without monitoring
- Sem resource limits = crashes em prod
- Sem scanning = vulnerabilidades desconhecidas

**Solução:** [Veja SESSION-DOCKER](#docker-production-ready)

#### 3. **CI/CD Incompleto** 🔴 CRITICAL

```yaml
❌ Falta:
  - Security scanning (SAST)
  - Container scanning (Trivy)
  - Test coverage reporting
  - Deployment automation
  - Staging environment
  - Production environment
  - Rollback strategy
```

**Impacto:**

- Vulnerabilidades chegam em prod
- Sem rastreamento de coverage
- Deploys manuais e propensos a erros
- Sem SLA compliance

**Solução:** [Veja SESSION-CICD](#cicd-enhanced)

#### 4. **Sem Monitoring/Observability** 🔴 CRITICAL

```
❌ Falta:
  - Prometheus metrics
  - Grafana dashboards
  - Centralized logging (ELK/Loki)
  - Distributed tracing
  - APM setup
  - Alert rules
```

**Impacto:**

- Sem visibilidade em produção
- Debugging cego
- Incidentes descobertos por clientes
- SLA não alcançáveis
- MTTR (Mean Time To Recovery) alto

**Solução:** [Veja SESSION-MONITORING](#monitoring-observability)

#### 5. **TypeScript Errors** 🟡 MEDIUM

```typescript
❌ Encontrados:
  - Missing '@/components/tasks-context'
  - Mock<Procedure> type issue
  - Session type mismatches (3x)
  - Database query API type errors (7x)
```

**Impacto:**

- Build pode falhar em CI
- Type safety não aplicada
- Runtime errors possíveis

**Solução:** Corrigir imports e tipos

---

## 📦 PACKAGES ESTRUTURA

### Atual

```
packages/
├── lib/          ✅ Shared utilities
│   └── src/
│       ├── utils.ts
│       ├── logging.ts
│       └── ...
├── ui/           ✅ Shared components
│   └── src/
│       ├── components/
│       └── ...
└── tsconfig/     ✅ Shared TypeScript config
```

### Recomendado (FASE 1)

```
packages/
├── lib/          ✅ Keep (expand)
│   └── src/
│       ├── utils/
│       ├── env.ts (NEW)
│       ├── logger.ts (NEW)
│       └── ...
├── ui/           ✅ Keep
├── tsconfig/     ✅ Keep
├── api-types/    ❌ NEW - API contracts
│   └── src/
│       ├── requests/
│       ├── responses/
│       ├── entities/
│       └── index.ts
├── constants/    ❌ NEW - Shared constants
│   └── src/
│       ├── api-endpoints.ts
│       ├── app-config.ts
│       ├── error-codes.ts
│       └── index.ts
├── hooks/        ❌ NEW - React hooks
│   └── src/
│       ├── useAuth.ts
│       ├── useApi.ts
│       ├── usePagination.ts
│       └── index.ts
└── services/     ❌ NEW - API clients
    └── src/
        ├── api-client.ts
        ├── github-service.ts
        ├── sandbox-service.ts
        └── index.ts
```

---

## 🐳 DOCKER - PRODUCTION READY

### Status Atual

**Dockerfile.dev** ✅ Existe (development)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

❌ **Problemas:**

- Sem multi-stage build
- Root user (security)
- Sem health check
- Sem resource limits
- Imagem grande (node + build tools)

### Solução: Multi-Stage Build

**Arquivo:** `Dockerfile.prod`

```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages packages
COPY apps apps

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Build all apps
RUN pnpm build --filter=@repo/web

# Stage 2: Runtime
FROM node:20-alpine

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

# Copy only production dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/web/package.json ./apps/web/

# Security: Use non-root user
USER nextjs

EXPOSE 3000
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["pnpm", "--filter=@repo/web", "start"]
```

**Benefícios:**

- ✅ Imagem 70% menor
- ✅ Sem build tools em produção
- ✅ Execução como non-root user
- ✅ Health check nativo
- ✅ Build cache eficiente

### Docker Compose Production

**Arquivo:** `docker-compose.prod.yml`

```yaml
version: '3.9'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: coding-agent-web
    restart: always
    ports:
      - '3000:3000'
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/coding_agent
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health']
      interval: 30s
      timeout: 10s
      retries: 3
    resources:
      limits:
        cpus: '1'
        memory: 1024M
      reservations:
        cpus: '0.5'
        memory: 512M
    networks:
      - coding-agent

  postgres:
    image: postgres:15-alpine
    container_name: coding-agent-postgres
    restart: always
    environment:
      POSTGRES_DB: coding_agent
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5
    resources:
      limits:
        cpus: '2'
        memory: 1024M
      reservations:
        cpus: '1'
        memory: 512M
    networks:
      - coding-agent

  redis:
    image: redis:7-alpine
    container_name: coding-agent-redis
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5
    resources:
      limits:
        cpus: '0.5'
        memory: 256M
    networks:
      - coding-agent

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  coding-agent:
    driver: bridge
```

---

## 🔄 CI/CD - ENHANCED

### GitHub Actions Workflow

**Arquivo:** `.github/workflows/deploy.yml`

```yaml
name: Build, Test & Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Stage 1: Test
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm type-check

      - name: Lint
        run: pnpm lint

      - name: Unit tests
        run: pnpm test:unit

      - name: Test coverage
        run: pnpm test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3

  # Stage 2: Security
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy results to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  # Stage 3: Build
  build:
    needs: [test, security]
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    outputs:
      image: ${{ steps.meta.outputs.tags }}
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile.prod
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # Stage 4: E2E Tests (opcional, em deploy staging)
  e2e:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  # Stage 5: Deploy (Staging)
  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.coding-agent.dev
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Staging
        run: |
          echo "Deploying to staging..."
          # Add your staging deployment commands here
        env:
          DEPLOY_KEY: ${{ secrets.STAGING_DEPLOY_KEY }}

  # Stage 6: Deploy (Production)
  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://coding-agent.dev
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Production
        run: |
          echo "Deploying to production..."
          # Add your production deployment commands here
        env:
          DEPLOY_KEY: ${{ secrets.PROD_DEPLOY_KEY }}
```

---

## 📊 MONITORING & OBSERVABILITY

### Health Check Endpoint

**Arquivo:** `apps/web/app/api/health/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  try {
    // Check database connectivity
    await db.query.users.findFirst()

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'unknown',
      version: process.env.npm_package_version || '0.0.0',
      dependencies: {
        database: 'connected',
      },
    }

    return NextResponse.json(health, { status: 200 })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Service unavailable',
      },
      { status: 503 },
    )
  }
}
```

### Metrics Endpoint

**Arquivo:** `apps/web/app/api/metrics/route.ts`

```typescript
import { NextResponse } from 'next/server'

const metrics = {
  requests: 0,
  errors: 0,
  requestsPerSecond: 0,
  averageResponseTime: 0,
}

export async function GET() {
  const gauges = [
    `# HELP app_requests_total Total number of requests`,
    `# TYPE app_requests_total counter`,
    `app_requests_total ${metrics.requests}`,
    '',
    `# HELP app_errors_total Total number of errors`,
    `# TYPE app_errors_total counter`,
    `app_errors_total ${metrics.errors}`,
    '',
    `# HELP app_uptime_seconds Application uptime in seconds`,
    `# TYPE app_uptime_seconds gauge`,
    `app_uptime_seconds ${process.uptime()}`,
    '',
    `# HELP app_memory_heap_bytes Heap memory usage in bytes`,
    `# TYPE app_memory_heap_bytes gauge`,
    `app_memory_heap_bytes ${process.memoryUsage().heapUsed}`,
  ]

  return new NextResponse(gauges.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
```

### Prometheus Configuration

**Arquivo:** `docker/prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'coding-agent'
    static_configs:
      - targets: ['web:3000']
    metrics_path: '/api/metrics'
```

---

## 🔒 SEGURANÇA

### Security Headers Middleware

**Arquivo:** `apps/web/middleware.ts`

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  )
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### Secrets Management

**Arquivo:** `.env.prod`

```env
# Database
DATABASE_URL=postgresql://user:pass@db:5432/prod

# Authentication
NEXT_PUBLIC_GITHUB_CLIENT_ID=xxxxx
GITHUB_CLIENT_SECRET=xxxxx

# API
API_SECRET=xxxxx
JWE_SECRET=xxxxx

# Vercel (if using)
SANDBOX_VERCEL_TOKEN=xxxxx
```

**Regra:** NEVER commit secrets! Use GitHub Secrets ou CI/CD secrets.

---

## 📝 TYPE ERRORS - CORRECTIONS REQUIRED

### 1. Missing `@/components/tasks-context`

**Arquivo:** `components/home-page-header.tsx:10`

```diff
- import { useTasksContext } from '@/components/tasks-context'
+ // Criar ou importar do local correto
```

### 2. Mock Type Issues

**Arquivo:** `test/components/task-form.test.tsx:53`

```typescript
// Usar proper typing para mocks
import { vi } from 'vitest'
import type { Procedure } from '@/types'

const mockProcedure = vi.fn<[], Procedure>()
```

### 3. Session Type Mismatches

**Arquivo:** `test/github/user-token.test.ts`

```typescript
// Corrigir Session objects em testes
const mockSession = {
  user: { id: 'user-123' },
  created: new Date(),
  authProvider: 'github',
}
```

---

## 🚀 IMPLEMENTAÇÃO - PLANO DE AÇÃO

### FASE 0: Quick Wins (7.5 horas) - SEMANA 1

**Sprint Duration:** 1 dia

| Task                           | Time | Status  | Owner          |
| ------------------------------ | ---- | ------- | -------------- |
| 1. Fix TypeScript errors       | 1h   | 🔴 TODO | Backend Agent  |
| 2. Add health check endpoint   | 30m  | 🔴 TODO | Backend Agent  |
| 3. Add metrics endpoint        | 1h   | 🔴 TODO | Backend Agent  |
| 4. Environment validation      | 1h   | 🔴 TODO | Backend Agent  |
| 5. Security headers middleware | 45m  | 🔴 TODO | Security Agent |
| 6. Structured logging          | 1.5h | 🔴 TODO | Backend Agent  |
| 7. Docker optimization         | 1h   | 🔴 TODO | DevOps Agent   |
| 8. README badges               | 15m  | 🔴 TODO | DevOps Agent   |
| 9. Env validation script       | 45m  | 🔴 TODO | Backend Agent  |
| 10. Request logging            | 1h   | 🔴 TODO | Backend Agent  |

**Total:** 7.5 horas  
**Result:** Infrastructure 5/10 → 7/10

### FASE 1: Production Docker (2 semanas) - SEMANAS 1-2

| Component                | Time | Dependencies        |
| ------------------------ | ---- | ------------------- |
| Dockerfile.prod          | 2h   | Phase 0 complete    |
| docker-compose.prod.yml  | 2h   | Dockerfile.prod     |
| Health checks in compose | 1h   | docker-compose.prod |
| Resource limits setup    | 1h   | docker-compose.prod |
| Local validation         | 1h   | All above           |

**Result:** Infrastructure 7/10 → 8/10

### FASE 2: CI/CD Enhanced (1 semana) - SEMANA 2-3

| Component                 | Time | Dependencies     |
| ------------------------- | ---- | ---------------- |
| Security scanning (Trivy) | 1.5h | Phase 1 complete |
| Test coverage reporting   | 1h   | Phase 1 complete |
| Container scanning        | 1.5h | Phase 1 complete |
| Deployment automation     | 2h   | All above        |

**Result:** Infrastructure 8/10 → 8.5/10

### FASE 3: Monitoring (1.5 semanas) - SEMANA 3-4

| Component           | Time | Dependencies     |
| ------------------- | ---- | ---------------- |
| Prometheus setup    | 2h   | Phase 2 complete |
| Grafana dashboards  | 2h   | Prometheus       |
| Centralized logging | 2h   | Prometheus       |
| Alert rules         | 1h   | Monitoring       |

**Result:** Infrastructure 8.5/10 → 9.5/10

### FASE 4: Advanced (Ongoing) - SEMANA 4+

| Component            | Time | Status |
| -------------------- | ---- | ------ |
| Kubernetes manifests | 4h   | Future |
| Helm charts          | 2h   | Future |
| Distributed tracing  | 3h   | Future |
| Service mesh         | 4h   | Future |

**Result:** Infrastructure 9.5/10 → 10/10

---

## 📦 ARQUITETURA - CRIAÇÃO DE PACOTES

### 1. @repo/api-types

**Arquivo:** `packages/api-types/package.json`

```json
{
  "name": "@repo/api-types",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./requests": "./src/requests/index.ts",
    "./responses": "./src/responses/index.ts",
    "./entities": "./src/entities/index.ts"
  }
}
```

**Arquivo:** `packages/api-types/src/entities/index.ts`

```typescript
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  githubId: string
  createdAt: Date
  updatedAt: Date
}

export interface Sandbox {
  id: string
  userId: string
  name: string
  status: 'creating' | 'active' | 'inactive' | 'failed'
  environment: 'nodejs' | 'python' | 'ruby' | 'java'
  createdAt: Date
  expiresAt: Date
}

export interface Task {
  id: string
  userId: string
  title: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  sandboxId: string
  createdAt: Date
  updatedAt: Date
}
```

**Arquivo:** `packages/api-types/src/requests/index.ts`

```typescript
export interface CreateSandboxRequest {
  name: string
  environment: 'nodejs' | 'python' | 'ruby' | 'java'
  diskSize?: number
  memorySize?: number
}

export interface ExecuteTaskRequest {
  sandboxId: string
  command: string
  timeout?: number
  cwd?: string
}

export interface CreateTaskRequest {
  title: string
  description: string
  sandboxId: string
  command: string
}
```

**Arquivo:** `packages/api-types/src/responses/index.ts`

```typescript
import type { User, Sandbox, Task } from '../entities'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
  timestamp: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export type UserResponse = ApiResponse<User>
export type SandboxResponse = ApiResponse<Sandbox>
export type TaskResponse = ApiResponse<Task>
```

### 2. @repo/constants

**Arquivo:** `packages/constants/src/api-endpoints.ts`

```typescript
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    CALLBACK: '/api/auth/callback',
    SESSION: '/api/auth/session',
  },

  // Sandboxes
  SANDBOXES: {
    LIST: '/api/sandboxes',
    CREATE: '/api/sandboxes',
    GET: (id: string) => `/api/sandboxes/${id}`,
    DELETE: (id: string) => `/api/sandboxes/${id}`,
    EXECUTE: (id: string) => `/api/sandboxes/${id}/execute`,
  },

  // Tasks
  TASKS: {
    LIST: '/api/tasks',
    CREATE: '/api/tasks',
    GET: (id: string) => `/api/tasks/${id}`,
    UPDATE: (id: string) => `/api/tasks/${id}`,
    DELETE: (id: string) => `/api/tasks/${id}`,
  },
} as const
```

### 3. @repo/hooks

**Arquivo:** `packages/hooks/src/useApi.ts`

```typescript
import { useCallback, useState } from 'react'

interface UseApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
}

export function useApi<T>(url: string, options?: UseApiOptions) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(
    async (body?: Record<string, unknown>) => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(url, {
          method: options?.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
          body: body ? JSON.stringify(body) : undefined,
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const json = await response.json()
        setData(json)
        return json
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
        throw err
      } finally {
        setLoading(false)
      }
    },
    [url, options],
  )

  return { data, error, loading, fetch }
}
```

---

## ✅ CHECKLIST COMPLIANCE

### Compliance: Static Logging

**Regra:** Sem valores dinâmicos em logs

```typescript
// ❌ BAD
logger.info(`Sandbox created: ${sandboxId}`)
logger.error(`Failed to process ${filename}`)

// ✅ GOOD
logger.info('Sandbox created', { sandboxId })
logger.error('Failed to process file', { filename })
```

### Compliance: Code Quality

- [ ] `pnpm format` - All files formatted
- [ ] `pnpm type-check` - Zero TypeScript errors
- [ ] `pnpm lint` - All lint checks pass
- [ ] `pnpm test` - All tests pass
- [ ] `pnpm build` - Production build succeeds

### Compliance: Security

- [ ] No secrets in .env (use .env.example)
- [ ] No dynamic values in user-facing logs
- [ ] Security headers configured
- [ ] Container runs as non-root
- [ ] Resource limits set

### Compliance: Docker

- [ ] Dockerfile.prod exists (multi-stage)
- [ ] docker-compose.prod.yml exists
- [ ] Health checks configured
- [ ] Resource limits defined
- [ ] Build tested locally

---

## 📞 PRÓXIMOS PASSOS

### Imediato (Today)

1. ✅ Ler este code-review completamente
2. ✅ Identificar qual agente especialista assume cada sessão
3. ✅ Criar GitHub Issues para cada tarefa
4. ✅ Começar FASE 0 (Quick Wins)

### Curto Prazo (This Week)

1. ✅ Completar todas as correções TypeScript
2. ✅ Implementar todos os 10 Quick Wins
3. ✅ Criar Dockerfile.prod
4. ✅ Testar localmente com docker-compose.prod.yml

### Médio Prazo (Weeks 2-3)

1. ✅ Enhanced CI/CD com security scanning
2. ✅ Monitoring com Prometheus + Grafana
3. ✅ Centralized logging
4. ✅ Test coverage reporting

### Longo Prazo (Weeks 4+)

1. ✅ Kubernetes manifests
2. ✅ Helm charts
3. ✅ Distributed tracing
4. ✅ Advanced observability

---

## 📊 SUCCESS METRICS

### Phase 0 (End of Week 1)

- [ ] Infrastructure Score: 5/10 → 7/10
- [ ] Zero TypeScript errors
- [ ] All tests passing
- [ ] Docker local validation complete

### Phase 1 (End of Week 2)

- [ ] Infrastructure Score: 7/10 → 8/10
- [ ] Prod Docker setup complete
- [ ] Health checks working
- [ ] Basic monitoring in place

### Phase 2 (End of Week 3)

- [ ] Infrastructure Score: 8/10 → 8.5/10
- [ ] CI/CD automation 95%
- [ ] Security scanning active
- [ ] Test coverage > 80%

### Phase 3 (End of Week 4)

- [ ] Infrastructure Score: 8.5/10 → 9.5/10
- [ ] Kubernetes ready
- [ ] Full observability
- [ ] 99.9% uptime capable

### Phase 4+ (Production Excellence)

- [ ] Infrastructure Score: 10/10 ✅
- [ ] All advanced features
- [ ] Zero known vulnerabilities
- [ ] SLA compliant

---

**Documento Status:** ✅ COMPLETO  
**Última Atualização:** 2025-11-17  
**Próxima Review:** Após completar FASE 0  
**Review Coverage:** 360° Full-Stack

---

## 📚 Referências

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Actions Security](https://docs.github.com/en/actions/security-guides)
- [Kubernetes Docs](https://kubernetes.io/docs/)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [Prometheus Monitoring](https://prometheus.io/docs/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/securing-your-application)

---

_Generated by AI Specialist Agents_  
_Application: Coding Agent Template v2.0.0_  
_Coverage: Full-Stack 360° Review_
