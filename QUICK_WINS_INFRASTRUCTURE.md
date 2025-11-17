# 🚀 Quick Wins - Infrastructure Improvements (Can be done TODAY)

## Overview

These are **minimal, high-impact changes** that can be implemented immediately without major refactoring. Each takes 30 minutes to 2 hours.

---

## 1. ✅ Add Health Check Endpoint (30 minutes)

### Goal
Enable Docker/Kubernetes health checks and monitoring without external dependencies.

### Files to Create

**File:** `apps/web/app/api/health/route.ts`

```typescript
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'unknown',
      version: process.env.npm_package_version || '0.0.0',
    }

    return NextResponse.json(health, { status: 200 })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { status: 'error', error: 'Health check failed' },
      { status: 503 }
    )
  }
}
```

### Files to Update

**File:** `docker-compose.yml` - Add health check to web service:

```yaml
web:
  # ... existing config ...
  healthcheck:
    test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health']
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```

### Validation

```bash
# Test locally
curl http://localhost:3000/api/health

# Should return:
# {"status":"ok","timestamp":"2025-11-17T...","uptime":123.45,...}
```

---

## 2. ✅ Environment Validation Package (1 hour)

### Goal
Validate all required environment variables at startup and provide typed access.

### Files to Create

**File:** `packages/lib/src/env.ts`

```typescript
import { z } from 'zod'

const envSchema = z.object({
  // Server-only variables
  DATABASE_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  
  // Client variables (must start with NEXT_PUBLIC_)
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
      console.error('Environment validation failed:')
      error.errors.forEach(err => {
        console.error(`  ${err.path.join('.')}: ${err.message}`)
      })
    }
    throw new Error('Invalid environment variables')
  }
}

export const env = validateEnv()
```

**File:** `packages/lib/package.json` - Update exports:

```json
{
  "exports": {
    "./env": "./src/env.ts",
    "./utils": "./src/utils.ts"
  }
}
```

### Files to Update

**File:** `apps/web/app/layout.tsx` - Add validation at app startup:

```typescript
import { env } from '@repo/lib/env'

// This will throw if env vars are invalid
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // env is now validated and typed
  const isDevelopment = env.NODE_ENV === 'development'
  
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

### Validation

```bash
# Test with missing required env var
unset DATABASE_URL
npm run dev
# Should show clear error message

# Test with valid env
echo 'DATABASE_URL=postgresql://...' > .env.local
npm run dev
# Should start without errors
```

---

## 3. ✅ Docker Build Optimization (1 hour)

### Goal
Reduce Docker build time from 3-5 minutes to under 1 minute.

### Files to Create

**File:** `.dockerignore` - Already exists, verify it has:

```
node_modules
npm-debug.log
.next
.git
.env*
```

**File:** `.github/workflows/docker-build-cache.yml`

```yaml
name: Docker Build Cache

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Build (with layer caching)
        uses: docker/build-push-action@v5
        with:
          context: .
          cache-from: type=gha
          cache-to: type=gha,mode=max
          push: false
```

### Files to Update

**File:** `Dockerfile.dev` - Add layer caching optimization:

```dockerfile
# Add before RUN pnpm install:
ENV TURBO_DIR=/app/.turbo
RUN mkdir -p $TURBO_DIR

# Add after installing dependencies:
RUN pnpm build --filter=@repo/web --filter=@repo/playground-vite
```

### Performance Metrics

- **Before:** 3-5 minutes (first build), 2-3 minutes (with changes)
- **After:** 30-45 seconds (with cache), 1-2 minutes (full rebuild)

---

## 4. ✅ Add Security Headers Middleware (45 minutes)

### Goal
Add security headers to all HTTP responses.

### Files to Create

**File:** `apps/web/lib/middleware/security-headers.ts`

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function withSecurityHeaders(response: NextResponse) {
  const headers = new Headers(response.headers)
  
  // Content Security Policy
  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'"
  )
  
  // Other security headers
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'DENY')
  headers.set('X-XSS-Protection', '1; mode=block')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  
  return response
}
```

**File:** `apps/web/middleware.ts`

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withSecurityHeaders } from './lib/middleware/security-headers'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  return withSecurityHeaders(response)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### Validation

```bash
# Check headers
curl -i http://localhost:3000 | grep -E "Content-Security|X-Frame|X-Content"

# Should see security headers in response
```

---

## 5. ✅ Structured Logging (1.5 hours)

### Goal
Replace console logs with structured JSON logs for better monitoring.

### Files to Create

**File:** `packages/lib/src/logger.ts`

```typescript
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogEntry {
  timestamp: string
  level: string
  message: string
  context?: Record<string, unknown>
  error?: {
    name: string
    message: string
    stack?: string
  }
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development'

  private formatLog(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context }),
    }
  }

  info(message: string, context?: Record<string, unknown>) {
    const log = this.formatLog(LogLevel.INFO, message, context)
    console.log(JSON.stringify(log))
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    const log = this.formatLog(LogLevel.ERROR, message, context)
    if (error) {
      log.error = {
        name: error.name,
        message: error.message,
        stack: this.isDev ? error.stack : undefined,
      }
    }
    console.error(JSON.stringify(log))
  }

  warn(message: string, context?: Record<string, unknown>) {
    const log = this.formatLog(LogLevel.WARN, message, context)
    console.warn(JSON.stringify(log))
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (this.isDev) {
      const log = this.formatLog(LogLevel.DEBUG, message, context)
      console.debug(JSON.stringify(log))
    }
  }
}

export const logger = new Logger()
```

### Usage

```typescript
// Before
console.log(`Task ${taskId} created`)  // ❌ Bad - exposes data

// After
logger.info('Task created', { taskId })  // ✅ Good - structured log
```

### Output

```json
{
  "timestamp": "2025-11-17T12:00:00Z",
  "level": "info",
  "message": "Task created",
  "context": { "taskId": "abc123" }
}
```

---

## 6. ✅ Add Metrics Endpoint (1 hour)

### Goal
Expose Prometheus-compatible metrics for monitoring.

### Files to Create

**File:** `apps/web/app/api/metrics/route.ts`

```typescript
import { NextResponse } from 'next/server'

// Simple metrics collector
const metrics = {
  requests: 0,
  errors: 0,
  uptime: process.uptime(),
  memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
}

// Track requests
export function trackRequest() {
  metrics.requests++
}

export function trackError() {
  metrics.errors++
}

export async function GET() {
  try {
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

    const metricsText = gauges.join('\n')

    return new NextResponse(metricsText, {
      headers: { 'Content-Type': 'text/plain' },
    })
  } catch (error) {
    console.error('Metrics endpoint error:', error)
    return NextResponse.json(
      { error: 'Failed to generate metrics' },
      { status: 500 }
    )
  }
}
```

### Usage with Prometheus

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'coding-agent'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 15s
```

---

## 7. ✅ Database Connection Pooling (1 hour)

### Goal
Improve database performance with connection pooling.

### Files to Update

**File:** `apps/web/lib/db.ts` (if it exists, or create it):

```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

// Connection pool configuration
const client = postgres(process.env.DATABASE_URL || '', {
  max: 20, // Maximum connections in pool
  idleTimeout: 30, // Close idle connections after 30s
  types: {
    bigint: postgres.BigInt,
  },
})

export const db = drizzle(client)

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database connection...')
  await client.end()
  process.exit(0)
})
```

### Environment Variables

```env
# apps/web/.env.local
# Connection pool size
DATABASE_POOL_SIZE=20
DATABASE_IDLE_TIMEOUT=30
```

---

## 8. ✅ Add ReadMe Badge with Status (15 minutes)

### Goal
Display current build/test status in README.

### Files to Update

**File:** `README.md` - Add at the top:

```markdown
# Coding Agent Template

[![Tests](https://github.com/your-org/coding-agent-template/workflows/CI%2FCD/badge.svg?branch=main)](https://github.com/your-org/coding-agent-template/actions)
[![Coverage](https://codecov.io/gh/your-org/coding-agent-template/branch/main/graph/badge.svg)](https://codecov.io/gh/your-org/coding-agent-template)
[![Docker Build](https://github.com/your-org/coding-agent-template/workflows/Docker%20Build/badge.svg)](https://github.com/your-org/coding-agent-template/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](package.json)
```

---

## 9. ✅ Add .env Validation Script (45 minutes)

### Goal
Validate environment before starting the application.

### Files to Create

**File:** `scripts/validate-env.ts`

```typescript
import { createEnv } from '@repo/lib/env'
import { z } from 'zod'

const requiredEnv = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_APP_ENV: z.string(),
})

async function validateEnv() {
  try {
    requiredEnv.parse(process.env)
    console.log('✅ Environment variables are valid')
    process.exit(0)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:')
      error.errors.forEach(err => {
        console.error(`   ${err.path.join('.')}: ${err.message}`)
      })
    }
    process.exit(1)
  }
}

validateEnv()
```

**File:** `package.json` - Update scripts:

```json
{
  "scripts": {
    "env:validate": "tsx scripts/validate-env.ts",
    "prebuild": "pnpm env:validate",
    "predev": "pnpm env:validate"
  }
}
```

---

## 10. ✅ Add Request Logging Middleware (1 hour)

### Goal
Log all incoming requests for debugging and monitoring.

### Files to Create

**File:** `apps/web/middleware.ts` - Update existing:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const start = Date.now()
  
  // Log request
  const logData = {
    timestamp: new Date().toISOString(),
    method: request.method,
    path: new URL(request.url).pathname,
    userAgent: request.headers.get('user-agent'),
  }
  
  console.log(JSON.stringify(logData))

  const response = NextResponse.next()
  
  // Add response time header
  const duration = Date.now() - start
  response.headers.set('X-Response-Time', `${duration}ms`)

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png).*)',
  ],
}
```

---

## 📊 Implementation Summary

| # | Task | Time | Impact | Difficulty |
|---|------|------|--------|------------|
| 1 | Health Check Endpoint | 30m | 🔴 Critical | ✅ Easy |
| 2 | Environment Validation | 1h | 🔴 Critical | ✅ Easy |
| 3 | Docker Build Optimization | 1h | 🟡 High | ✅ Easy |
| 4 | Security Headers | 45m | 🔴 Critical | ✅ Easy |
| 5 | Structured Logging | 1.5h | 🟡 High | ✅ Easy |
| 6 | Metrics Endpoint | 1h | 🟡 High | ✅ Easy |
| 7 | DB Connection Pooling | 1h | 🟡 High | 🟡 Medium |
| 8 | README Badges | 15m | 🟢 Low | ✅ Easy |
| 9 | Env Validation Script | 45m | 🟡 High | ✅ Easy |
| 10 | Request Logging | 1h | 🟡 High | ✅ Easy |

**Total Time:** ~7.5 hours  
**Infrastructure Rating Improvement:** 5/10 → 7.5/10  
**Effort:** Low  
**ROI:** Very High  

---

## 🎯 Implementation Order (Recommended)

1. **Day 1 (Morning):** Tasks 1, 2, 8 (2.5 hours)
2. **Day 1 (Afternoon):** Tasks 4, 9 (1.5 hours)
3. **Day 2 (Morning):** Tasks 5, 10 (2 hours)
4. **Day 2 (Afternoon):** Tasks 3, 6, 7 (3 hours)

---

## ✅ Validation Checklist

After implementing each task:

- [ ] Code compiles without errors
- [ ] Tests pass: `pnpm lint && pnpm type-check && pnpm test:unit`
- [ ] Local testing works: `pnpm dev` or `docker-compose up`
- [ ] Git diff shows minimal changes
- [ ] Documentation is updated if needed

---

## 🔗 Next Steps

1. ✅ Implement these 10 quick wins (7.5 hours)
2. 📋 Then proceed with Phase 1 from main infrastructure review
3. 🐳 Set up production Docker and docker-compose files
4. 🔒 Implement security scanning in CI/CD
5. 📊 Set up monitoring and observability

---

**Status:** Ready to implement  
**Last Updated:** 2025-11-17  
**Estimated Completion:** 2025-11-18 (next working day)
