# 📋 GITHUB ISSUES - 360° PRODUCTION COVERAGE

**Generated**: November 17, 2025  
**Total Issues**: 35  
**Priority Distribution**: Critical (8) | High (12) | Medium (10) | Low (5)

---

## 🔴 CRITICAL ISSUES (P0 - Week 1)

### INF-001: Implement Centralized Logging (Loki)

**Title**: `[CRITICAL] Implement centralized logging with Loki for multi-agent debugging`

**Description**:
The system runs 32 concurrent Docker containers but has no centralized logging. Logs are lost when containers die, making debugging impossible.

**Requirements**:

- [ ] Add Loki container to docker-compose.yml
- [ ] Configure Promtail for log shipping from all containers
- [ ] Add Grafana Loki datasource
- [ ] Implement 30-day log retention
- [ ] Create log-based alerting rules
- [ ] Add documentation for log queries

**Acceptance Criteria**:

- ✅ All container logs visible in Grafana Explore
- ✅ Can filter logs by container ID, service, level
- ✅ Can search across all agents simultaneously
- ✅ Logs persisted for minimum 30 days
- ✅ Query performance <100ms

**Effort**: 16h | **Priority**: Critical | **Labels**: `infrastructure,logging,observability`

---

### SEC-001: Fix Logging Security Violations

**Title**: `[CRITICAL] Remove dynamic values from all log statements`

**Description**:
Current implementation violates AGENTS.md security rules by logging dynamic values that expose sensitive information.

**Files to Fix**:

- lib/sandbox/creation.ts (line 29, 42, 47)
- lib/utils/task-logger.ts
- All API routes using logger

**Current Issues**:

```typescript
❌ await logger.info(`Task created: ${taskId}`)
❌ await logger.error(`Failed to process ${filename}`)
❌ console.log(`User ${userId} logged in`)
```

**Required Changes**:

```typescript
✅ await logger.info('Task created', { taskId })
✅ await logger.error('Failed to process file', { filename })
✅ console.log('User logged in')
```

**Acceptance Criteria**:

- ✅ Zero dynamic values in logger calls
- ✅ All sensitive data in structured fields
- ✅ Linter rule added to prevent regression
- ✅ All tests passing

**Effort**: 8h | **Priority**: Critical | **Labels**: `security,logging`

---

### SEC-002: Implement Non-Root User in Docker Containers

**Title**: `[CRITICAL] Run sandbox containers as non-root user`

**Description**:
Docker containers run as root, creating privilege escalation vulnerability.

**Changes Required**:

```dockerfile
# In Dockerfile.sandbox and docker-compose images:
RUN addgroup -g 1001 -S app && adduser -S -u 1001 app
USER app

# Ensure volume permissions:
RUN chown -R app:app /workspace
```

**Acceptance Criteria**:

- ✅ `docker run` shows container running as app user
- ✅ Containers can still write to volumes
- ✅ All existing tests pass
- ✅ No permission errors in logs

**Effort**: 4h | **Priority**: Critical | **Labels**: `security,docker`

---

### RES-001: Add Container Health Checks

**Title**: `[CRITICAL] Implement health checks for all containers`

**Description**:
No health monitoring exists. Zombie containers accumulate and cause resource exhaustion.

**Implementation**:

```yaml
# docker-compose.yml
services:
  postgres:
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 30s
      timeout: 10s
      retries: 3
```

**Acceptance Criteria**:

- ✅ All services have health checks
- ✅ Unhealthy containers restart automatically
- ✅ Health status visible in `docker ps`
- ✅ Prometheus metrics for health status

**Effort**: 6h | **Priority**: Critical | **Labels**: `infrastructure,monitoring`

---

### RES-002: Implement Graceful Shutdown Handlers

**Title**: `[CRITICAL] Add graceful shutdown with SIGTERM handling`

**Description**:
Containers killed abruptly without cleanup, causing:

- Incomplete transactions
- Orphaned processes
- Data corruption risk
- Resource leaks

**Implementation**:

```typescript
// In main app initialization
process.on('SIGTERM', async () => {
  logger.info('Graceful shutdown initiated')
  await server.close()
  await db.close()
  await redis.disconnect()
  process.exit(0)
})

// Docker healthcheck timeout before kill:
timeout: N seconds wait SIGTERM
         N+5 seconds kill SIGKILL
```

**Acceptance Criteria**:

- ✅ SIGTERM caught and handled
- ✅ All connections closed properly
- ✅ Tests verify graceful shutdown
- ✅ No "Connection refused" errors on restart

**Effort**: 6h | **Priority**: Critical | **Labels**: `infrastructure,reliability`

---

### INF-002: Fix Sandbox Creation Failures

**Title**: `[CRITICAL] Troubleshoot and fix sandbox creation pipeline`

**Description**:
Sandbox creation consistently fails with "Failed to clone repository" error.

**Investigation Required**:

- [ ] Verify Docker daemon connectivity
- [ ] Check volume creation permissions
- [ ] Validate network connectivity for git clone
- [ ] Monitor port assignment and conflicts
- [ ] Review git clone timeout settings

**Debugging Steps**:

```bash
# 1. Test Docker connectivity
docker ps

# 2. Check volume creation
docker volume create test-vol
docker volume ls

# 3. Test git clone
git clone https://github.com/...

# 4. Check disk space
df -h /var/lib/docker

# 5. Check network
ping github.com
```

**Root Causes to Address**:

- Network timeouts in sandbox creation
- Git credential issues
- Port binding conflicts
- Insufficient disk space

**Acceptance Criteria**:

- ✅ Sandbox creates successfully 95%+ of attempts
- ✅ Clear error messages on failures
- ✅ Automatic cleanup on failure
- ✅ Retry logic with exponential backoff

**Effort**: 12h | **Priority**: Critical | **Labels**: `sandbox,docker,bug`

---

### OBS-001: Implement OpenTelemetry Tracing

**Title**: `[CRITICAL] Add distributed tracing with OpenTelemetry`

**Description**:
No distributed tracing across services. Impossible to trace requests through entire system.

**Components to Add**:

- [ ] OpenTelemetry SDK for Node.js
- [ ] Auto-instrumentation for Express/Next.js
- [ ] Jaeger backend for trace collection
- [ ] Trace context propagation
- [ ] Jaeger UI deployment in docker-compose

**Configuration**:

```typescript
// lib/otel.ts
import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { JaegerExporter } from '@opentelemetry/exporter-jaeger-base'

const sdk = new NodeSDK({
  traceExporter: new JaegerExporter({
    endpoint: 'http://localhost:14250',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
})
```

**Acceptance Criteria**:

- ✅ All requests traced end-to-end
- ✅ Traces visible in Jaeger UI
- ✅ Trace IDs logged and correlated
- ✅ Performance <1% overhead

**Effort**: 12h | **Priority**: Critical | **Labels**: `observability,tracing`

---

### TEST-001: Create Integration Test Suite for Sandbox

**Title**: `[CRITICAL] Implement comprehensive integration tests for sandbox creation`

**Description**:
No integration tests verify sandbox creation pipeline end-to-end.

**Test Scenarios**:

```typescript
describe('Sandbox Creation', () => {
  ✅ test('creates container successfully')
  ✅ test('clones repository')
  ✅ test('installs dependencies')
  ✅ test('handles timeout')
  ✅ test('cleans up on failure')
  ✅ test('detects port conflicts')
  ✅ test('recovers from network failures')
})

describe('Sandbox Execution', () => {
  ✅ test('executes commands in container')
  ✅ test('captures output')
  ✅ test('handles errors')
  ✅ test('respects resource limits')
})
```

**Acceptance Criteria**:

- ✅ 90%+ test coverage for sandbox module
- ✅ All tests pass in CI/CD
- ✅ Tests run in <5 minutes
- ✅ Can run tests locally with Docker

**Effort**: 16h | **Priority**: Critical | **Labels**: `testing,sandbox`

---

## 🟠 HIGH PRIORITY ISSUES (P1 - Week 2-3)

### OBS-002: Deploy Prometheus Metrics Collection

**Title**: `[HIGH] Implement Prometheus metrics for system monitoring`

**Description**:
No metrics collection. Cannot monitor CPU, memory, request latency, or error rates.

**Metrics to Collect**:

- HTTP request duration (histogram)
- Request count (counter)
- Active connections (gauge)
- Database query latency (histogram)
- Cache hit rate (gauge)
- Agent utilization (gauge)
- Queue depth (gauge)
- Error rate (counter)

**Effort**: 10h | **Priority**: High | **Labels**: `observability,monitoring`

---

### OBS-003: Create Grafana Dashboard Suite

**Title**: `[HIGH] Build production dashboards in Grafana`

**Description**:
Prometheus data collected but no visualization.

**Dashboards Required**:

1. System Overview (CPU, Memory, Disk)
2. Application Health (Error rate, Latency)
3. Agent Performance (Utilization, Queue depth)
4. Database Performance (Query latency, Connections)
5. Request Timeline (Duration breakdown)

**Effort**: 8h | **Priority**: High | **Labels**: `observability,dashboards`

---

### DB-001: Implement Automated Database Backups

**Title**: `[HIGH] Set up automated PostgreSQL backups`

**Description**:
No backup strategy. Data loss would be catastrophic.

**Requirements**:

- [ ] Daily backups to S3/persistent storage
- [ ] 30-day retention policy
- [ ] Backup verification (restore test)
- [ ] Backup monitoring and alerts
- [ ] Disaster recovery procedures documented

**Effort**: 12h | **Priority**: High | **Labels**: `database,backup,reliability`

---

### DB-002: Implement Connection Pooling

**Title**: `[HIGH] Add PostgreSQL connection pooling`

**Description**:
Direct connections to PostgreSQL cause exhaustion under load.

**Solution**:

```typescript
// Use pgBouncer or pg module with pool:
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})
```

**Effort**: 6h | **Priority**: High | **Labels**: `database,performance`

---

### RES-003: Implement Circuit Breaker Pattern

**Title**: `[HIGH] Add circuit breaker for external service calls`

**Description**:
Cascading failures when external APIs fail. No circuit breaker prevents resource exhaustion.

**Services to Protect**:

- GitHub API
- Vercel API
- LLM APIs (Anthropic, OpenAI, etc.)
- Docker daemon

**Implementation**:

```typescript
// Use library like 'circuit-breaker-js'
const breaker = new CircuitBreaker(githubApiCall, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
})
```

**Effort**: 10h | **Priority**: High | **Labels**: `resilience,reliability`

---

### SEC-003: Implement Rate Limiting

**Title**: `[HIGH] Add rate limiting to all API endpoints`

**Description**:
No rate limiting. System vulnerable to DDoS and abuse.

**Requirements**:

- [ ] Per-IP rate limiting (100 req/min)
- [ ] Per-user rate limiting (1000 req/hour)
- [ ] Per-agent rate limiting
- [ ] Sliding window algorithm
- [ ] Redis-backed storage

**Effort**: 8h | **Priority**: High | **Labels**: `security,api`

---

### SEC-004: Add Environment Variable Type Safety

**Title**: `[HIGH] Implement type-safe environment variables`

**Description**:
Environment variables not validated. Runtime errors when variables missing.

**Solution**: Use `t3-env` or `zod`

```typescript
// env.ts
import { z } from 'zod'

export const env = z
  .object({
    DATABASE_URL: z.string().url(),
    GITHUB_TOKEN: z.string().min(40),
    VERCEL_TOKEN: z.string(),
    AI_API_KEY: z.string(),
    NODE_ENV: z.enum(['development', 'production', 'test']),
  })
  .parse(process.env)
```

**Effort**: 6h | **Priority**: High | **Labels**: `security,config`

---

### PERF-001: Optimize Docker Layer Caching

**Title**: `[HIGH] Improve Dockerfile build times with better caching strategy`

**Description**:
Docker builds take 5+ minutes due to poor layer caching.

**Optimization**:

```dockerfile
# Current: Dependencies installed on every change
COPY . .
RUN npm install

# Better: Cache dependencies separately
COPY package*.json ./
RUN npm install
COPY . .
```

**Target**: Reduce build time to <2 minutes

**Effort**: 6h | **Priority**: High | **Labels**: `performance,docker`

---

### PERF-002: Implement Request Caching Layer

**Title**: `[HIGH] Add HTTP caching for read-only endpoints`

**Description**:
Repeated requests to GitHub/Vercel APIs not cached.

**Solution**: Redis caching with TTL

```typescript
// Implement caching middleware
const cacheKey = `github:repos:${owner}:${repo}`
const cached = await redis.get(cacheKey)
if (cached) return cached

const result = await githubApi(...)
await redis.setex(cacheKey, 3600, JSON.stringify(result))
return result
```

**Effort**: 8h | **Priority**: High | **Labels**: `performance,caching`

---

### TEST-002: Add Load Testing Suite

**Title**: `[HIGH] Implement load testing with k6/Artillery`

**Description**:
No performance baselines. Cannot verify system handles 32 concurrent agents.

**Load Test Scenarios**:

- 32 concurrent sandbox creates
- 1000 requests/sec API load
- 10GB memory usage
- Network failure simulation
- Database connection pool exhaustion

**Effort**: 12h | **Priority**: High | **Labels**: `testing,performance`

---

### DOC-001: Create Docker Troubleshooting Guide

**Title**: `[HIGH] Document sandbox creation issues and solutions`

**Description**:
Users unable to debug Docker issues.

**Content**:

- Common errors and causes
- Diagnostic commands
- Network troubleshooting
- Volume permission issues
- Port conflict resolution

**Effort**: 4h | **Priority**: High | **Labels**: `documentation,docker`

---

### DOC-002: Architecture Decision Records (ADRs)

**Title**: `[HIGH] Document architectural decisions for future reference`

**Records Needed**:

- ADR-001: Monorepo vs Microservices (Turbo chosen)
- ADR-002: Docker Sandbox vs Vercel Sandbox
- ADR-003: Next.js vs other frameworks
- ADR-004: PostgreSQL vs other databases
- ADR-005: RabbitMQ vs other queue solutions

**Effort**: 6h | **Priority**: High | **Labels**: `documentation,architecture`

---

## 🟡 MEDIUM PRIORITY ISSUES (P2 - Week 3-4)

### INF-003: Upgrade Docker Compose to v2 Best Practices

**Title**: `[MEDIUM] Modernize docker-compose configuration`

- [ ] Add resource limits
- [ ] Add restart policies
- [ ] Add depends_on conditions
- [ ] Use named volumes
- [ ] Network isolation

**Effort**: 6h | **Priority**: Medium

---

### SEC-005: Implement Secret Rotation

**Title**: `[MEDIUM] Automate secret rotation for tokens and keys`

- [ ] Vercel token rotation (30 days)
- [ ] GitHub token rotation (60 days)
- [ ] Database password rotation (90 days)
- [ ] JWE_SECRET rotation

**Effort**: 10h | **Priority**: Medium

---

### SEC-006: Add Request Validation

**Title**: `[MEDIUM] Implement comprehensive request validation`

- [ ] Zod schemas for all endpoints
- [ ] Input sanitization
- [ ] CORS configuration
- [ ] CSRF protection
- [ ] Rate limit headers

**Effort**: 8h | **Priority**: Medium

---

### PERF-003: Implement Query Optimization

**Title**: `[MEDIUM] Optimize database queries`

- [ ] Add query indexes
- [ ] Implement N+1 prevention
- [ ] Add query timeouts
- [ ] Analyze slow queries
- [ ] Add query result caching

**Effort**: 12h | **Priority**: Medium

---

### TEST-003: Increase E2E Test Coverage

**Title**: `[MEDIUM] Expand Playwright E2E tests`

- [ ] Repository browsing workflows
- [ ] Sandbox creation flow
- [ ] Agent selection and execution
- [ ] Error handling paths
- [ ] Multi-user scenarios

**Effort**: 20h | **Priority**: Medium

---

### TEST-004: Create Security Test Suite

**Title**: `[MEDIUM] Implement security-focused tests`

- [ ] OWASP Top 10 checks
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF prevention
- [ ] Authentication/Authorization

**Effort**: 16h | **Priority**: Medium

---

### API-001: Document API Endpoints with OpenAPI

**Title**: `[MEDIUM] Generate OpenAPI/Swagger documentation`

- [ ] Document all endpoints
- [ ] Generate interactive docs
- [ ] Create client SDKs
- [ ] Add type definitions
- [ ] Version endpoints

**Effort**: 10h | **Priority**: Medium

---

### API-002: Implement API Versioning Strategy

**Title**: `[MEDIUM] Add versioning to all API endpoints`

- [ ] URL versioning (/v1/, /v2/)
- [ ] Header versioning
- [ ] Deprecation policy
- [ ] Migration guides
- [ ] Backwards compatibility

**Effort**: 8h | **Priority**: Medium

---

### MON-001: Create Operational Runbooks

**Title**: `[MEDIUM] Document operational procedures`

**Runbooks Needed**:

- Sandbox creation failures
- Database connection issues
- Memory exhaustion handling
- Network failure recovery
- Data restoration procedure

**Effort**: 8h | **Priority**: Medium

---

### MON-002: Implement Alert Rules

**Title**: `[MEDIUM] Set up alerting for critical conditions`

- [ ] CPU >80% for 5 minutes
- [ ] Memory >90%
- [ ] Error rate >5%
- [ ] P99 latency >2 seconds
- [ ] Queue depth >1000

**Effort**: 6h | **Priority**: Medium

---

## 🟢 LOW PRIORITY ISSUES (P3 - After Phase 1)

### PERF-004: Implement CDN Caching

**Title**: `[LOW] Add CDN layer for static assets`

**Effort**: 8h | **Priority**: Low

---

### PERF-005: Optimize Frontend Bundle

**Title**: `[LOW] Reduce Next.js bundle size`

- [ ] Code splitting analysis
- [ ] Tree-shaking verification
- [ ] Module federation exploration
- [ ] Dynamic imports for heavy libraries

**Effort**: 10h | **Priority**: Low

---

### INFRA-004: Implement Auto-scaling

**Title**: `[LOW] Add horizontal pod autoscaling`

- [ ] Kubernetes manifests
- [ ] HPA policies
- [ ] Scale down procedures

**Effort**: 16h | **Priority**: Low

---

### DOC-003: Create Video Tutorials

**Title**: `[LOW] Record setup and usage tutorials`

- [ ] Installation guide
- [ ] First sandbox creation
- [ ] Agent configuration
- [ ] Troubleshooting common issues

**Effort**: 12h | **Priority**: Low

---

### TEST-005: Add Visual Regression Testing

**Title**: `[LOW] Implement visual diff testing`

- [ ] Screenshot comparisons
- [ ] Component snapshot tests
- [ ] Design consistency checks

**Effort**: 10h | **Priority**: Low

---

## 📊 ISSUE STATISTICS

| Priority         | Count  | Effort (Hours) | Phase        |
| ---------------- | ------ | -------------- | ------------ |
| 🔴 Critical (P0) | 8      | 80             | Week 1       |
| 🟠 High (P1)     | 12     | 110            | Week 2-3     |
| 🟡 Medium (P2)   | 10     | 125            | Week 3-4     |
| 🟢 Low (P3)      | 5      | 56             | Ongoing      |
| **Total**        | **35** | **371**        | **~9 weeks** |

---

## 🚀 IMPLEMENTATION TIMELINE

```
Week 1: Critical foundation
├── INF-001: Loki logging (16h)
├── SEC-001: Fix logging security (8h)
├── SEC-002: Non-root containers (4h)
├── RES-001: Health checks (6h)
├── RES-002: Graceful shutdown (6h)
└── Status: ~40h of work

Week 2: Observability & Resolution
├── INF-002: Fix sandbox creation (12h)
├── OBS-001: OpenTelemetry (12h)
├── TEST-001: Integration tests (16h)
└── Status: ~40h of work

Week 3: Resilience & Performance
├── OBS-002: Prometheus metrics (10h)
├── OBS-003: Grafana dashboards (8h)
├── DB-001: Database backups (12h)
├── RES-003: Circuit breaker (10h)
└── Status: ~40h of work

Week 4: Security & Documentation
├── SEC-003: Rate limiting (8h)
├── SEC-004: Env validation (6h)
├── DOC-001: Troubleshooting guide (4h)
├── DOC-002: ADRs (6h)
└── Status: ~24h of work
```

---

## ✅ DEFINITION OF DONE

For each issue:

- [ ] Code changes implemented
- [ ] Tests written and passing
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] Verified in production

---

**Generated**: November 17, 2025  
**For**: Coding Agent Template v2.0.0  
**Status**: Ready for GitHub import
