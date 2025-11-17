# 🛣️ IMPLEMENTATION ROADMAP - 360° COVERAGE

**Version**: 2.0.0  
**Target**: Production-Ready Multi-Agent System  
**Timeline**: 9 weeks (36 tasks, ~370 hours)  
**Status**: Ready for Execution

---

## 📅 WEEKLY SPRINTS

### WEEK 1: CRITICAL FOUNDATION (40 Hours)

**Goal**: Stabilize logging, security, and observability

#### Monday-Tuesday: Centralized Logging (16h)

**Task**: INF-001 - Implement Loki Log Aggregation

```bash
# Step 1: Add Loki service to docker-compose.yml
services:
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - loki_data:/loki
    command: -config.file=/etc/loki/local-config.yaml

# Step 2: Add Promtail for log shipping
  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock
    command: -config.file=/etc/promtail/docker-config.yaml

# Step 3: Configure Grafana datasource
datasources:
  - name: Loki
    type: loki
    url: http://loki:3100
```

**Acceptance**:

- ✅ All container logs visible in Grafana Explore
- ✅ Can filter logs by container, service, level
- ✅ Query response time <100ms
- ✅ 30-day retention configured

**Owner**: Infrastructure Team  
**PR Template**: `feat(infra): add Loki log aggregation`

---

#### Wednesday: Security Fix - Logging (8h)

**Task**: SEC-001 - Remove Dynamic Values from Logs

**Files to Fix**:

```typescript
// lib/sandbox/creation.ts
❌ await logger.info(`Task created: ${taskId}`)
✅ await logger.info('Task created', { taskId })

// lib/utils/task-logger.ts
❌ await logger.error(`Failed to process ${filename}`)
✅ await logger.error('Failed to process file', { filename })

// app/api/sandboxes/route.ts
❌ console.log(`User ${userId} logged in`)
✅ console.log('User logged in', { userId })
```

**Script to Find Violations**:

```bash
# Find all dynamic values in logger calls
grep -r "logger\.\(info\|error\|command\)(\`.*\${" . --include="*.ts" --include="*.tsx"

# Find all console calls with dynamic values
grep -r "console\.\(log\|error\|warn\)(\`.*\${" . --include="*.ts" --include="*.tsx"
```

**Linter Rule Addition**:

```javascript
// eslint.config.mjs
{
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-restricted-syntax': [
      'error',
      {
        selector: "CallExpression[callee.object.name='logger'][callee.property.name=/^(info|error|success|command)$/] > TemplateLiteral",
        message: 'Never log dynamic values - use structured fields instead'
      }
    ]
  }
}
```

**Owner**: Security Team  
**PR Template**: `security: remove dynamic values from logging`

---

#### Thursday: Docker Security (4h)

**Task**: SEC-002 - Non-Root User in Containers

**Changes**:

```dockerfile
# lib/sandbox/images/Dockerfile.nodejs
FROM node:22-alpine

# Create non-root user
RUN addgroup -g 1001 -S app && \
    adduser -S -u 1001 app

# Set working directory
WORKDIR /workspace/project

# Ensure proper permissions
RUN chown -R app:app /workspace

# Switch to non-root user
USER app

# Verify user
USER app
```

**Verify**:

```bash
# After rebuild, verify
docker run -it <image> id
# Output should show: uid=1001(app) gid=1001(app)

# Verify volume permissions
docker run -it -v test_vol:/workspace <image> ls -la /workspace
```

**Owner**: DevOps Team  
**PR Template**: `security: run containers as non-root user`

---

#### Friday: Health Checks & Graceful Shutdown (6h each)

**Task**: RES-001 & RES-002 - Health Checks + Graceful Shutdown

**Health Checks**:

```yaml
# docker-compose.yml
services:
  postgres:
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  app:
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
```

**Graceful Shutdown**:

```typescript
// lib/server.ts
import { createServer } from 'http'

let isShuttingDown = false

process.on('SIGTERM', async () => {
  if (isShuttingDown) return
  isShuttingDown = true

  console.log('SIGTERM received, graceful shutdown initiated')

  try {
    // Close server (stop accepting new connections)
    await new Promise((resolve) => {
      server.close(resolve)
    })

    // Close database connections
    await db.close()

    // Close cache
    await redis.disconnect()

    // Close queue
    await rabbitmq.close()

    console.log('Graceful shutdown complete')
    process.exit(0)
  } catch (error) {
    console.error('Error during shutdown:', error)
    process.exit(1)
  }
})

// Set timeout to force shutdown
setTimeout(() => {
  console.error('Forced shutdown after 30 seconds')
  process.exit(1)
}, 30000)
```

**Owner**: DevOps Team  
**PR Template**: `feat: implement health checks and graceful shutdown`

---

### WEEK 2: OBSERVABILITY & RESOLUTION (40 Hours)

#### Monday-Tuesday: Sandbox Creation Debugging (12h)

**Task**: INF-002 - Fix Sandbox Creation Failures

**Investigation Checklist**:

```bash
# 1. Verify Docker daemon
docker ps  # Should list all containers

# 2. Check volumes
docker volume ls | wc -l

# 3. Test git operations
git clone --depth 1 https://github.com/torvalds/linux.git /tmp/test
df -h /tmp  # Check disk space

# 4. Monitor container creation
docker events --filter type=container

# 5. Test network connectivity
docker run alpine wget -O- https://api.github.com
```

**Add Comprehensive Logging**:

```typescript
// lib/sandbox/creation.ts
async function createSandbox(config, logger) {
  try {
    // Log each step with timestamp
    const startTime = Date.now()
    await logger.info('Sandbox creation started')

    // Step 1: Validation
    console.error('[DEBUG] Validating environment variables...')
    const validation = validateEnvironmentVariables(...)
    console.error(`[DEBUG] Validation took ${Date.now() - startTime}ms`)

    // Step 2: Container creation
    console.error('[DEBUG] Creating Docker container...')
    const containerStart = Date.now()
    const container = await docker.createContainer(...)
    console.error(`[DEBUG] Container creation took ${Date.now() - containerStart}ms`)

    // Step 3: Clone
    console.error('[DEBUG] Cloning repository...')
    const cloneStart = Date.now()
    const cloneResult = await runCommandInSandbox(...)
    console.error(`[DEBUG] Clone took ${Date.now() - cloneStart}ms`)

  } catch (error) {
    console.error('[ERROR] Sandbox creation failed:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    })
    throw error
  }
}
```

**Retry Logic**:

```typescript
// lib/utils/retry.ts
async function retryWithBackoff(
  fn: () => Promise<T>,
  options: {
    maxAttempts: number
    initialDelayMs: number
    maxDelayMs: number
  },
): Promise<T> {
  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === options.maxAttempts) throw error

      const delay = Math.min(options.initialDelayMs * Math.pow(2, attempt - 1), options.maxDelayMs)
      console.error(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error.message)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}

// Usage
const result = await retryWithBackoff(() => createSandbox(config, logger), {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
})
```

**Owner**: DevOps/Backend Team  
**PR Template**: `fix: add debugging and retry logic for sandbox creation`

---

#### Wednesday-Thursday: OpenTelemetry Tracing (12h)

**Task**: OBS-001 - Implement Distributed Tracing

**Setup**:

```bash
# 1. Add dependencies
npm install @opentelemetry/api @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-jaeger-basic
```

**Implementation**:

```typescript
// lib/otel.ts
import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { JaegerExporter } from '@opentelemetry/exporter-jaeger-basic'
import { W3CTraceContextPropagator } from '@opentelemetry/core'
import { CompositePropagator } from '@opentelemetry/core'

const jaegerExporter = new JaegerExporter({
  endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14250',
})

const sdk = new NodeSDK({
  traceExporter: jaegerExporter,
  instrumentations: [getNodeAutoInstrumentations()],
  propagator: new CompositePropagator({
    propagators: [new W3CTraceContextPropagator()],
  }),
})

sdk.start()

process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
})

export { sdk }
```

**Initialize in Entry Point**:

```typescript
// app.ts or entry point - MUST be first import
import './lib/otel'

// ... rest of imports
```

**Add Jaeger to Docker Compose**:

```yaml
jaeger:
  image: jaegertracing/all-in-one:latest
  ports:
    - '6831:6831/udp'
    - '16686:16686'
    - '14250:14250'
  environment:
    COLLECTOR_OTLP_GRPC_HOST_PORT: '0.0.0.0:14250'
```

**Owner**: Observability Team  
**PR Template**: `feat: add OpenTelemetry distributed tracing`

---

#### Friday: Integration Tests for Sandbox (16h)

**Task**: TEST-001 - Comprehensive Sandbox Tests

**Test File Structure**:

```typescript
// tests/sandbox/creation.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createSandbox } from '@/lib/sandbox/creation'
import { DockerSandbox } from '@/lib/sandbox/docker-sandbox'

describe('Sandbox Creation', () => {
  let taskLogger: TaskLogger

  beforeAll(() => {
    taskLogger = new TaskLogger('test-task')
  })

  afterAll(async () => {
    // Cleanup
  })

  it('should create a sandbox successfully', async () => {
    const config = {
      repoUrl: 'https://github.com/nextjs/next.js',
      timeout: '10m',
      selectedAgent: 'claude',
      githubToken: process.env.GITHUB_TOKEN!,
      apiKeys: {},
    }

    const result = await createSandbox(config, taskLogger)

    expect(result.success).toBe(true)
    expect(result.sandboxId).toBeDefined()
    expect(result.domain).toMatch(/localhost:\d+/)
  })

  it('should handle timeout gracefully', async () => {
    const config = {
      repoUrl: 'https://github.com/linux/linux', // Large repo
      timeout: '30s', // Very short
      selectedAgent: 'claude',
      githubToken: process.env.GITHUB_TOKEN!,
      apiKeys: {},
    }

    const result = await createSandbox(config, taskLogger)

    expect(result.success).toBe(false)
    expect(result.error).toContain('timeout')
  })

  it('should cleanup on failure', async () => {
    const config = {
      repoUrl: 'https://github.com/invalid/repo-that-does-not-exist',
      timeout: '5m',
      selectedAgent: 'claude',
      githubToken: process.env.GITHUB_TOKEN!,
      apiKeys: {},
    }

    const result = await createSandbox(config, taskLogger)

    expect(result.success).toBe(false)

    // Verify container was cleaned up
    const containers = await exec('docker ps -a')
    expect(containers.stdout).not.toContain(result.sandboxId)
  })
})
```

**Run Tests**:

```bash
npm run test:integration
```

**Owner**: QA Team  
**PR Template**: `test: add comprehensive sandbox integration tests`

---

### WEEK 3: RESILIENCE & PERFORMANCE (40 Hours)

#### Monday: Prometheus Metrics (10h)

**Add Metrics Collection**:

```typescript
// lib/metrics.ts
import promClient from 'prom-client'

// Create metrics
const httpDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5],
})

const httpRequests = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
})

const activeConnections = new promClient.Gauge({
  name: 'http_connections_active',
  help: 'Number of active HTTP connections',
})

const sandboxCreationDuration = new promClient.Histogram({
  name: 'sandbox_creation_duration_seconds',
  help: 'Time taken to create sandbox',
  labelNames: ['outcome'],
  buckets: [5, 10, 30, 60, 120],
})

// Middleware
export function metricsMiddleware(req, res, next) {
  const start = Date.now()
  activeConnections.inc()

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000
    httpDuration.labels(req.method, req.path, res.statusCode).observe(duration)
    httpRequests.labels(req.method, req.path, res.statusCode).inc()
    activeConnections.dec()
  })

  next()
}

// Export endpoint
export async function metricsEndpoint(req, res) {
  res.set('Content-Type', promClient.register.contentType)
  res.send(await promClient.register.metrics())
}
```

**Add to Express**:

```typescript
app.use('/metrics', metricsMiddleware)
app.get('/metrics', metricsEndpoint)
```

**Owner**: Observability Team  
**PR Template**: `feat: add Prometheus metrics collection`

---

#### Tuesday-Wednesday: Grafana Dashboards (8h)

**Create Dashboards**:

```json
{
  "dashboard": {
    "title": "System Overview",
    "panels": [
      {
        "title": "HTTP Request Duration",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])"
          }
        ]
      },
      {
        "title": "Active Connections",
        "targets": [
          {
            "expr": "http_connections_active"
          }
        ]
      }
    ]
  }
}
```

**Owner**: Observability Team  
**PR Template**: `feat: add Grafana dashboards`

---

#### Wednesday-Thursday: Circuit Breaker (10h)

**Task**: RES-003 - Circuit Breaker Pattern

```typescript
// lib/circuit-breaker.ts
export class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed'
  private failureCount = 0
  private successCount = 0
  private lastFailureTime: number | null = null

  constructor(
    private fn: Function,
    private options: {
      failureThreshold: number // % of failures to open
      successThreshold: number // successes before closing
      timeout: number // time in open state before half-open
    },
  ) {}

  async execute(...args: any[]): Promise<any> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime! > this.options.timeout) {
        this.state = 'half-open'
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await this.fn(...args)
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess() {
    this.failureCount = 0
    if (this.state === 'half-open') {
      this.successCount++
      if (this.successCount >= this.options.successThreshold) {
        this.state = 'closed'
        this.successCount = 0
      }
    }
  }

  private onFailure() {
    this.lastFailureTime = Date.now()
    this.failureCount++
    const failureRate = (this.failureCount / 100) * 100

    if (failureRate > this.options.failureThreshold) {
      this.state = 'open'
    }
  }
}

// Usage
const githubBreaker = new CircuitBreaker(
  async (owner: string, repo: string) => {
    return await github.repos.get({ owner, repo })
  },
  { failureThreshold: 50, successThreshold: 2, timeout: 60000 },
)
```

**Owner**: Backend Team  
**PR Template**: `feat: add circuit breaker for external services`

---

#### Friday: Database Backups (12h)

**Task**: DB-001 - Automated PostgreSQL Backups

```bash
#!/bin/bash
# scripts/backup-database.sh

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql.gz"

echo "Starting database backup..."

# Create backup
docker exec postgres pg_dump -U postgres -d coding_agent \
  | gzip > "${BACKUP_FILE}"

echo "Backup created: ${BACKUP_FILE}"

# Keep only last 30 backups
find "${BACKUP_DIR}" -name "backup_*.sql.gz" -mtime +30 -delete

echo "Old backups cleaned up"

# Upload to S3 (optional)
if [ -n "$AWS_S3_BUCKET" ]; then
  aws s3 cp "${BACKUP_FILE}" "s3://${AWS_S3_BUCKET}/backups/"
  echo "Backup uploaded to S3"
fi
```

**Add Cron Job**:

```yaml
# docker-compose.yml
backup:
  image: postgres:15-alpine
  entrypoint: /bin/sh
  command: -c 'while true; do /backup-database.sh; sleep 86400; done'
  volumes:
    - ./scripts/backup-database.sh:/backup-database.sh:ro
    - backups:/backups
```

**Owner**: DevOps Team  
**PR Template**: `feat: add automated database backups`

---

### WEEK 4: SECURITY & DOCUMENTATION (24 Hours)

#### Monday: Rate Limiting (8h)

**Task**: SEC-003 - Implement Rate Limiting

```typescript
// lib/rate-limiter.ts
import { createClient } from 'redis'

export class RateLimiter {
  private redis = createClient()

  async isAllowed(key: string, limit: number, window: number): Promise<boolean> {
    const current = await this.redis.incr(key)

    if (current === 1) {
      await this.redis.expire(key, window)
    }

    return current <= limit
  }
}

// Middleware
export const rateLimitMiddleware = (limiter: RateLimiter) => {
  return async (req, res, next) => {
    const key = `ratelimit:${req.ip}`
    const allowed = await limiter.isAllowed(key, 100, 60) // 100 req/min

    if (!allowed) {
      return res.status(429).json({ error: 'Too many requests' })
    }

    next()
  }
}
```

**Owner**: Security Team  
**PR Template**: `feat: add rate limiting middleware`

---

#### Tuesday: Environment Variable Validation (6h)

**Task**: SEC-004 - Type-Safe Environment Variables

```typescript
// lib/env.ts
import { z } from 'zod'

export const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().default('3000').transform(Number),

  // Database
  DATABASE_URL: z.string().url(),

  // Authentication
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GITHUB_TOKEN: z.string().min(40),

  // AI APIs
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),

  // External Services
  VERCEL_TOKEN: z.string(),
  VERCEL_TEAM_ID: z.string(),
  VERCEL_PROJECT_ID: z.string(),

  // Sandbox
  SANDBOX_MEMORY_LIMIT: z.string().default('2g'),
  SANDBOX_CPU_LIMIT: z.string().default('2'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // RabbitMQ
  RABBITMQ_URL: z.string().default('amqp://localhost'),
})

export type Env = z.infer<typeof envSchema>

export const env = envSchema.parse(process.env)

// Verify on startup
if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}
```

**Add to Entry Point**:

```typescript
// Validate environment on startup
import { env } from '@/lib/env'

console.log('Environment validation:', env.NODE_ENV)
```

**Owner**: Backend Team  
**PR Template**: `feat: add type-safe environment variables`

---

#### Wednesday: Documentation - Troubleshooting Guide (4h)

**Already Created**: `ARCHITECTURE_TROUBLESHOOTING.md`

**Additional Tasks**:

- [ ] Review and expand troubleshooting guide
- [ ] Add screenshots for common issues
- [ ] Create video walkthrough
- [ ] Link to architecture diagrams

**Owner**: Documentation Team  
**PR Template**: `docs: expand troubleshooting guide`

---

#### Thursday: ADRs - Architecture Decision Records (6h)

**Task**: DOC-002 - Document Architectural Decisions

**Create ADRs**:

```markdown
# ADR-001: Monorepo Architecture

## Decision

Use Turbo-based monorepo with separate apps and packages.

## Rationale

- Faster builds with incremental compilation
- Shared dependencies reduce duplication
- Easier code reuse across projects
- Better for team collaboration

## Consequences

- More complex CI/CD setup
- Requires monorepo discipline
- Larger initial learning curve
```

**Repeat for**:

- ADR-002: Docker Sandbox vs Vercel
- ADR-003: Next.js framework choice
- ADR-004: PostgreSQL selection
- ADR-005: RabbitMQ for messaging

**Owner**: Architecture Team  
**PR Template**: `docs: add architecture decision records`

---

## 🚀 POST-WEEK 4: CONTINUOUS IMPROVEMENT

### Months 2-3: Advanced Features

- [ ] Kubernetes migration
- [ ] Multi-region deployment
- [ ] Advanced scheduling
- [ ] Cost optimization
- [ ] Performance profiling

### Metrics for Success

| Metric                   | Target | Current |
| ------------------------ | ------ | ------- |
| Sandbox Success Rate     | 99%    | 70%     |
| API Response Time (P99)  | <500ms | ~2s     |
| System Availability      | 99.9%  | 95%     |
| Error Rate               | <0.1%  | 2-3%    |
| Test Coverage            | 80%+   | 40%     |
| Security Vulnerabilities | 0      | 7       |

---

## 📋 EXECUTION CHECKLIST

### Before Starting

- [ ] All team members reviewed CODE-REVIEW-360.md
- [ ] GitHub issues created for all tasks
- [ ] Assign owners to each task
- [ ] Set up CI/CD for automated testing
- [ ] Establish code review process

### During Execution

- [ ] Daily standup (15 min)
- [ ] Weekly sprint review
- [ ] Code reviews before merge
- [ ] Tests passing on all PRs
- [ ] Documentation kept up-to-date

### After Each Sprint

- [ ] Retrospective (30 min)
- [ ] Update burndown chart
- [ ] Mark completed items
- [ ] Plan next sprint
- [ ] Document learnings

---

## 📞 SUPPORT & ESCALATION

**Questions about Tasks**:

- Review GITHUB_ISSUES_360.md for detailed requirements
- Check CODE-REVIEW-360.md for context
- Ask in team slack channel

**Blocker Issues**:

- Ping architecture lead immediately
- Consider task re-estimation
- Request help from other team members

**Production Issues**:

- Escalate to on-call engineer
- Follow incident response procedure
- Document in post-mortem

---

**Generated**: November 17, 2025  
**For**: Coding Agent Template v2.0.0  
**Ready for**: Team Execution
