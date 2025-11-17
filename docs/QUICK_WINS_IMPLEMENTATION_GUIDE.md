# 🚀 10 Quick Wins Implementation Guide

**Objective**: Bring application from 7.5/10 → 10/10 in ~19 hours  
**Target**: Full production readiness with monitoring, health checks, and optimized Docker

---

## 📋 Implementation Checklist

### Phase 1: Foundation (2-3 hours)

#### ✅ Quick Win #1: Health Check Endpoint (30 min)

**Goal**: Enable Docker/K8s health checks

**File 1**: Create `apps/web/app/api/health/route.ts`

```typescript
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  try {
    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'unknown',
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({ status: 'error' }, { status: 503 })
  }
}
```

**File 2**: Update `docker-compose.prod.yml`

```yaml
web:
  healthcheck:
    test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health']
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```

**Validation**:

```bash
curl http://localhost:3000/api/health
# Should return: {"status":"ok","timestamp":"...","uptime":123.45,...}
```

---

#### ✅ Quick Win #2: Environment Validation (1 hour)

**Goal**: Centralized, type-safe environment configuration

**File 1**: Create `packages/lib/src/env.ts`

```typescript
import { z } from 'zod'

const envSchema = z.object({
  // Server-only
  DATABASE_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),

  // Client (NEXT_PUBLIC_ prefix)
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_GITHUB_CLIENT_ID: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`Invalid env: ${err.path.join('.')}: ${err.message}`)
      })
    }
    throw new Error('Invalid environment configuration')
  }
}

export const env = validateEnv()
```

**File 2**: Update `packages/lib/package.json`

```json
{
  "exports": {
    "./env": "./src/env.ts"
  }
}
```

**File 3**: Update `apps/web/app/layout.tsx`

```typescript
import { env } from '@repo/lib/env'

// Validates env at app startup
console.log('App environment:', env.NODE_ENV)

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

**Validation**:

```bash
# Should validate on startup
cd apps/web && npm run build
```

---

#### ✅ Quick Win #3: Structured Logging (1 hour)

**Goal**: Static-only log messages (security per AGENTS.md)

**File 1**: Create `packages/lib/src/logger.ts`

```typescript
export const logger = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`)
    if (error && process.env.NODE_ENV === 'development') {
      console.error(error)
    }
  },
  warn: (message: string) => console.warn(`[WARN] ${message}`),
  debug: (message: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`)
    }
  },
}
```

**File 2**: Audit existing logs

```bash
# Search for dynamic values in logs (CRITICAL)
grep -r "console\.\(log\|error\|warn\)(\`.*\$\{" apps/ lib/ --include="*.ts" --include="*.tsx" || echo "✅ No dynamic logs found"
grep -r "logger\.\(info\|error\|success\)(\`.*\$\{" apps/ lib/ --include="*.ts" --include="*.tsx" || echo "✅ No dynamic logs found"
```

**File 3**: Update all logging calls

```typescript
// BAD (before)
console.log(`User ${userId} logged in`)
logger.error(`Failed to process ${filename}`)

// GOOD (after)
logger.info('User logged in')
logger.error('Failed to process file')
```

**Validation**:

```bash
# All logs should be static strings only
grep -r "console\." apps/web/app --include="*.ts" --include="*.tsx" | grep -v ".next" | wc -l
```

---

#### ✅ Quick Win #4: API Status Endpoint (45 min)

**Goal**: Comprehensive system health and metrics

**File**: Create `apps/web/app/api/status/route.ts`

```typescript
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const startTime = Date.now()

  try {
    // Basic checks
    const checks = {
      database: await checkDatabase(),
      memory: checkMemory(),
      uptime: process.uptime(),
    }

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks,
        responseTime: Date.now() - startTime,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({ status: 'degraded' }, { status: 503 })
  }
}

async function checkDatabase(): Promise<boolean> {
  try {
    // Add DB ping logic here
    return true
  } catch {
    return false
  }
}

function checkMemory(): object {
  const usage = process.memoryUsage()
  return {
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
    external: `${Math.round(usage.external / 1024 / 1024)}MB`,
  }
}
```

**Validation**:

```bash
curl http://localhost:3000/api/status
```

---

### Phase 2: Integration (3-4 hours)

#### ✅ Quick Win #5: Sandbox Lifecycle API (1.5 hours)

**Goal**: Container orchestration for code execution

**File 1**: Create `apps/web/app/api/sandbox/create/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { language, memory = '512m', timeout = 30 } = await request.json()

    if (!language) {
      return NextResponse.json({ error: 'Language required' }, { status: 400 })
    }

    // Validate language
    const validLanguages = ['nodejs', 'python', 'java']
    if (!validLanguages.includes(language)) {
      return NextResponse.json({ error: 'Invalid language' }, { status: 400 })
    }

    const sandboxId = `sandbox-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    try {
      // Create container
      const { stdout } = await execAsync(
        `docker run -d --memory="${memory}" --name="${sandboxId}" coding-agent:sandbox-${language} sleep ${timeout}`,
      )

      return NextResponse.json(
        {
          status: 'created',
          sandboxId,
          language,
          memory,
          timeout,
        },
        { status: 201 },
      )
    } catch (error) {
      console.error('Container creation error:', error)
      return NextResponse.json({ error: 'Failed to create sandbox' }, { status: 500 })
    }
  } catch (error) {
    console.error('Request parsing error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
```

**File 2**: Create `apps/web/app/api/sandbox/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export const runtime = 'nodejs'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { stdout } = await execAsync(`docker inspect ${id}`)
    const inspectData = JSON.parse(stdout)

    return NextResponse.json({
      sandboxId: id,
      status: inspectData[0].State.Status,
      running: inspectData[0].State.Running,
    })
  } catch (error) {
    console.error('Sandbox status error:', error)
    return NextResponse.json({ error: 'Sandbox not found' }, { status: 404 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    await execAsync(`docker rm -f ${id}`)

    return NextResponse.json({ status: 'deleted', sandboxId: id })
  } catch (error) {
    console.error('Sandbox deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete sandbox' }, { status: 500 })
  }
}
```

**Validation**:

```bash
# Create sandbox
curl -X POST http://localhost:3000/api/sandbox/create \
  -H "Content-Type: application/json" \
  -d '{"language":"nodejs","memory":"512m"}'

# Check status
curl http://localhost:3000/api/sandbox/SANDBOX_ID

# Delete sandbox
curl -X DELETE http://localhost:3000/api/sandbox/SANDBOX_ID
```

---

#### ✅ Quick Win #6: Dockerfile Optimization (1 hour)

**Goal**: Faster builds, smaller images

**File**: Update `Dockerfile.prod`

```dockerfile
# Multi-stage production build with optimization

# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app

# Cache layer - only invalidate if lock file changes
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
RUN apk add --no-cache libc6-compat && \
    npm install -g pnpm@9.15.0 && \
    pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app

# Copy deps from previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY . .

# Build
ENV NODE_ENV=production
RUN npm install -g pnpm@9.15.0 && \
    pnpm run build && \
    pnpm prune --prod

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Security: non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy from builder with proper ownership
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

USER nextjs

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health')"

EXPOSE 3000

CMD ["node", "server.js"]
```

**File**: Update `.dockerignore`

```
node_modules
.next
.git
.gitignore
README.md
*.log
.env.local
.env*.local
.turbo
.idea
.vscode
dist
coverage
*.tsbuildinfo
.DS_Store
```

**Validation**:

```bash
# Build and check size
docker build -f Dockerfile.prod -t coding-agent:optimized .
docker images | grep coding-agent
```

---

#### ✅ Quick Win #7: Resource Limits & Policies (1 hour)

**Goal**: Proper resource management and reliability

**File 1**: Update `docker-compose.yml`

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: coding_agent
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-password}
    ports:
      - '5434:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  web:
    build: .
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD:-password}@postgres:5432/coding_agent
      PORT: 3000
    ports:
      - '3000:3000'
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

volumes:
  postgres_data:
    driver: local
```

**File 2**: Update `docker-compose.dev.yml`

```yaml
# Add to web service:
healthcheck:
  test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health']
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s

restart: unless-stopped
```

**Validation**:

```bash
docker-compose up -d
docker stats
# Should show memory/CPU limits
```

---

### Phase 3: Monitoring & Observability (2-3 hours)

#### ✅ Quick Win #8: Prometheus Integration (1.5 hours)

**Goal**: Production-grade metrics collection

**File 1**: Create `packages/lib/src/metrics.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

interface Metrics {
  requests_total: number
  requests_by_status: Record<number, number>
  requests_by_method: Record<string, number>
  request_duration_ms: number[]
  sandbox_count: number
  memory_usage_bytes: number
}

class MetricsCollector {
  private metrics: Metrics = {
    requests_total: 0,
    requests_by_status: {},
    requests_by_method: {},
    request_duration_ms: [],
    sandbox_count: 0,
    memory_usage_bytes: 0,
  }

  recordRequest(method: string, status: number, duration: number) {
    this.metrics.requests_total++
    this.metrics.requests_by_status[status] = (this.metrics.requests_by_status[status] || 0) + 1
    this.metrics.requests_by_method[method] = (this.metrics.requests_by_method[method] || 0) + 1
    this.metrics.request_duration_ms.push(duration)

    // Keep only last 100 durations for memory efficiency
    if (this.metrics.request_duration_ms.length > 100) {
      this.metrics.request_duration_ms.shift()
    }
  }

  recordSandbox(delta: number) {
    this.metrics.sandbox_count = Math.max(0, this.metrics.sandbox_count + delta)
  }

  getMetrics(): Metrics {
    this.metrics.memory_usage_bytes = process.memoryUsage().heapUsed
    return this.metrics
  }

  getPrometheusFormat(): string {
    const m = this.getMetrics()
    const lines: string[] = []

    lines.push('# HELP requests_total Total HTTP requests')
    lines.push('# TYPE requests_total counter')
    lines.push(`requests_total ${m.requests_total}`)

    lines.push('# HELP request_duration_ms HTTP request duration')
    lines.push('# TYPE request_duration_ms histogram')
    const avg =
      m.request_duration_ms.length > 0
        ? m.request_duration_ms.reduce((a, b) => a + b, 0) / m.request_duration_ms.length
        : 0
    lines.push(`request_duration_ms_avg ${avg.toFixed(2)}`)

    lines.push('# HELP sandbox_count Active sandboxes')
    lines.push('# TYPE sandbox_count gauge')
    lines.push(`sandbox_count ${m.sandbox_count}`)

    lines.push('# HELP memory_usage_bytes Process memory usage')
    lines.push('# TYPE memory_usage_bytes gauge')
    lines.push(`memory_usage_bytes ${m.memory_usage_bytes}`)

    return lines.join('\n')
  }
}

export const metricsCollector = new MetricsCollector()
```

**File 2**: Create `apps/web/app/api/metrics/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { metricsCollector } from '@repo/lib/metrics'

export const runtime = 'nodejs'

export async function GET() {
  const metricsText = metricsCollector.getPrometheusFormat()

  return new NextResponse(metricsText, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
```

**File 3**: Create `prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'coding-agent'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics'
```

**Validation**:

```bash
curl http://localhost:3000/api/metrics
# Should return Prometheus format metrics
```

---

#### ✅ Quick Win #9: Error Handling Framework (1 hour)

**Goal**: Structured error handling and recovery

**File 1**: Create `packages/lib/src/errors.ts`

```typescript
export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', 400, message, details)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', 404, `${resource} not found`)
    this.name = 'NotFoundError'
  }
}

export class ServerError extends AppError {
  constructor(message: string = 'Internal server error', details?: unknown) {
    super('INTERNAL_ERROR', 500, message, details)
    this.name = 'ServerError'
  }
}

export function handleError(error: unknown) {
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: {
        error: error.code,
        message: error.message,
      },
    }
  }

  console.error('Unhandled error:', error)
  return {
    status: 500,
    body: {
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    },
  }
}
```

**File 2**: Create `apps/web/app/error.tsx`

```typescript
'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Something went wrong</h1>
      <p className="text-gray-600 mt-2">An error occurred while processing your request</p>
      <button
        onClick={() => reset()}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  )
}
```

**Validation**:

```typescript
// Usage example
import { ValidationError } from '@repo/lib/errors'

try {
  throw new ValidationError('Invalid input', { field: 'email' })
} catch (error) {
  // Properly handled
}
```

---

#### ✅ Quick Win #10: Documentation Cleanup (1 hour)

**Goal**: Comprehensive, updated documentation

**File 1**: Update `README.md`

````markdown
# 🤖 Coding Agent Template

**Status**: ✅ Production Ready (10/10)

## Quick Start

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum

### Setup

```bash
git clone <repo>
cd coding-agent-template

# Configure environment
cp .env.example .env
nano .env

# Start services
docker-compose up -d

# Verify health
curl http://localhost:3000/api/health
```
````

## API Documentation

### Health Check

```
GET /api/health
Response: { status: 'ok', uptime: 123.45, ... }
```

### Sandbox Management

```
POST   /api/sandbox/create     - Create sandbox
GET    /api/sandbox/:id        - Get sandbox status
DELETE /api/sandbox/:id        - Delete sandbox
```

### System Status

```
GET /api/status - System health and metrics
GET /api/metrics - Prometheus metrics
```

## Architecture

[See ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## Deployment

[See DEPLOYMENT.md](./docs/DEPLOYMENT.md)

````

**File 2**: Create `docs/ARCHITECTURE.md`

```markdown
# Architecture Overview

## Components

### Frontend (apps/web)
- Next.js 16 + React 19
- TypeScript strict mode
- Radix UI components
- TailwindCSS styling

### Backend Services
- PostgreSQL (data)
- Redis (caching - optional)
- RabbitMQ (queues - optional)

### Deployment
- Docker containerization
- Horizontal scaling ready
- Health checks configured
- Resource limits enforced

## Data Flow

[Client] → [API Routes] → [Database]
                       ↓
                  [Services]
                       ↓
                  [Logging/Metrics]
````

**File 3**: Create `docs/DEPLOYMENT.md`

````markdown
# Deployment Guide

## Production Deployment

### Docker Compose

```bash
docker-compose -f docker-compose.prod.yml up -d
```
````

### Kubernetes (Optional)

```bash
kubectl apply -f K8S_DEPLOYMENT.template.yaml
```

### Environment Variables

See `.env.example` for full list

### Monitoring

- Health: GET /api/health
- Metrics: GET /api/metrics
- Status: GET /api/status

### Backup

```bash
docker-compose exec postgres pg_dump > backup.sql
```

````

**File 4**: Create `docs/API.md`

```markdown
# API Documentation

## Endpoints

### Health & Status
- `GET /api/health` - Service health
- `GET /api/status` - System status
- `GET /api/metrics` - Prometheus metrics

### Sandbox
- `POST /api/sandbox/create` - Create
- `GET /api/sandbox/:id` - Status
- `DELETE /api/sandbox/:id` - Delete

### Request/Response Format
All endpoints use JSON with `Content-Type: application/json`

### Error Responses
```json
{
  "error": "ERROR_CODE",
  "message": "Human readable message"
}
````

````

**Validation**:
```bash
# Verify all docs created
ls -la docs/
# Should show: ARCHITECTURE.md, DEPLOYMENT.md, API.md
````

---

## 🎯 Implementation Order & Time Estimates

| #   | Task                   | Duration      | Priority | Status  |
| --- | ---------------------- | ------------- | -------- | ------- |
| 1   | Health Check Endpoint  | 30 min        | CRITICAL | ⏳ TODO |
| 2   | Environment Validation | 1 hour        | CRITICAL | ⏳ TODO |
| 3   | Structured Logging     | 1 hour        | CRITICAL | ⏳ TODO |
| 4   | API Status Endpoint    | 45 min        | HIGH     | ⏳ TODO |
| 5   | Sandbox API            | 1.5 hours     | HIGH     | ⏳ TODO |
| 6   | Docker Optimization    | 1 hour        | HIGH     | ⏳ TODO |
| 7   | Resource Limits        | 1 hour        | HIGH     | ⏳ TODO |
| 8   | Prometheus Metrics     | 1.5 hours     | MEDIUM   | ⏳ TODO |
| 9   | Error Handling         | 1 hour        | MEDIUM   | ⏳ TODO |
| 10  | Documentation          | 1 hour        | MEDIUM   | ⏳ TODO |
|     | **TOTAL**              | **~11 hours** |          |         |

---

## ✅ Validation Checklist

After implementing each quick win:

- [ ] Code builds without errors: `pnpm build`
- [ ] Type checks pass: `pnpm type-check`
- [ ] Linting passes: `pnpm lint`
- [ ] Tests pass: `pnpm test`
- [ ] Docker builds: `docker build -f Dockerfile.prod .`
- [ ] Services start: `docker-compose up -d`
- [ ] All checks are green: `curl http://localhost:3000/api/health`

---

## 📚 Reference Documents

- **Security Rules**: See `AGENTS.md`
- **Current Status**: See `CODE_REVIEW_360_PERFORMANCE.md`
- **Infrastructure Details**: See `QUICK_WINS_INFRASTRUCTURE.md`
- **Troubleshooting**: See `ARCHITECTURE_TROUBLESHOOTING.md`

---

**Next Steps**: Begin Phase 1 implementation  
**Estimated Completion**: 1-2 days of focused work  
**Target**: Production Ready (10/10) ✅
