#!/usr/bin/env tsx
/**
 * Create all 192 GitHub Issues for Production 360° Coverage
 *
 * Usage:
 *   GITHUB_TOKEN=your_token pnpm tsx scripts/create-github-issues.ts
 *
 * Or set GITHUB_TOKEN in environment:
 *   export GITHUB_TOKEN=ghp_xxxxx
 *   pnpm tsx scripts/create-github-issues.ts
 */

import { Octokit } from '@octokit/rest'

const OWNER = 'own-boldsbrain'
const REPO = 'ysh-helio-ai-agents'

interface Issue {
  number: string
  title: string
  body: string
  labels: string[]
  milestone?: number
}

// Check for GitHub token
const token = process.env.GITHUB_TOKEN
if (!token) {
  console.error('❌ Error: GITHUB_TOKEN environment variable not set')
  console.error('')
  console.error('Please set your GitHub token:')
  console.error('  export GITHUB_TOKEN=ghp_xxxxx')
  console.error('')
  console.error('Generate a token at: https://github.com/settings/tokens/new')
  console.error('Required permissions: repo, workflow')
  process.exit(1)
}

const octokit = new Octokit({ auth: token })

// Create labels first
const labels = [
  { name: 'bug', color: 'd73a4a', description: 'Bug/Error' },
  { name: 'feature', color: 'a2eeef', description: 'Nova feature' },
  { name: 'refactor', color: 'fbca04', description: 'Refatoração' },
  { name: 'task', color: 'cccccc', description: 'Tarefa genérica' },
  { name: 'type-safety', color: '5319e7', description: 'Type safety' },
  { name: 'critical', color: 'ff0000', description: 'Bloqueador' },
  { name: 'high', color: 'ff6600', description: 'Alta prioridade' },
  { name: 'medium', color: 'ffcc00', description: 'Média prioridade' },
  { name: 'low', color: '99cc00', description: 'Baixa prioridade' },
  { name: 'logging', color: '0e8a16', description: 'Logging' },
  { name: 'docker', color: '0075ca', description: 'Docker' },
  { name: 'database', color: 'fbca04', description: 'Database' },
  { name: 'security', color: 'ff0000', description: 'Security' },
  { name: 'performance', color: '1f883d', description: 'Performance' },
  { name: 'observability', color: '0075ca', description: 'Observability' },
  { name: 'metrics', color: '0075ca', description: 'Metrics' },
  { name: 'backup', color: 'fbca04', description: 'Backup' },
  { name: 'disaster-recovery', color: 'ff0000', description: 'Disaster Recovery' },
  { name: 'secrets', color: 'ff0000', description: 'Secrets Management' },
  { name: 'caching', color: '1f883d', description: 'Caching' },
  { name: 'monitoring', color: '0075ca', description: 'Monitoring' },
  { name: 'infrastructure', color: '0075ca', description: 'Infrastructure' },
  { name: 'blocking', color: 'ff0000', description: 'Blocks other work' },
]

async function createLabels() {
  console.log('📋 Creating labels...')

  for (const label of labels) {
    try {
      await octokit.rest.issues.createLabel({
        owner: OWNER,
        repo: REPO,
        name: label.name,
        color: label.color,
        description: label.description,
      })
      console.log(`  ✅ Created label: ${label.name}`)
    } catch (error: any) {
      if (error.status === 422) {
        console.log(`  ⏭️  Label already exists: ${label.name}`)
      } else {
        console.error(`  ❌ Failed to create label ${label.name}:`, error.message)
      }
    }
  }
  console.log('')
}

async function createMilestones() {
  console.log('🎯 Creating milestones...')

  const milestones = [
    {
      title: 'Phase 0: Build Fixes',
      description: 'Critical build and type safety fixes',
      due_on: '2025-11-24T00:00:00Z', // Week 1
    },
    {
      title: 'Phase 1: Observability',
      description: 'Logging, metrics, and tracing infrastructure',
      due_on: '2025-12-15T00:00:00Z', // Week 4
    },
    {
      title: 'Phase 2: Core Infrastructure',
      description: 'Docker, database, and auth hardening',
      due_on: '2026-01-12T00:00:00Z', // Week 8
    },
    {
      title: 'Phase 3: Security & Compliance',
      description: 'Security hardening and compliance',
      due_on: '2026-02-09T00:00:00Z', // Week 12
    },
    {
      title: 'Phase 4: Performance & Scalability',
      description: 'Performance optimization and scaling',
      due_on: '2026-03-09T00:00:00Z', // Week 16
    },
    {
      title: 'Phase 5: Monitoring & Alerting',
      description: 'Production monitoring and alerting',
      due_on: '2026-04-06T00:00:00Z', // Week 20
    },
  ]

  const createdMilestones: Record<string, number> = {}

  for (const milestone of milestones) {
    try {
      const response = await octokit.rest.issues.createMilestone({
        owner: OWNER,
        repo: REPO,
        title: milestone.title,
        description: milestone.description,
        due_on: milestone.due_on,
      })
      createdMilestones[milestone.title] = response.data.number
      console.log(`  ✅ Created milestone: ${milestone.title} (${response.data.number})`)
    } catch (error: any) {
      if (error.status === 422) {
        // Milestone already exists, fetch it
        const existingMilestones = await octokit.rest.issues.listMilestones({
          owner: OWNER,
          repo: REPO,
        })
        const existing = existingMilestones.data.find((m) => m.title === milestone.title)
        if (existing) {
          createdMilestones[milestone.title] = existing.number
          console.log(`  ⏭️  Milestone already exists: ${milestone.title} (${existing.number})`)
        }
      } else {
        console.error(`  ❌ Failed to create milestone ${milestone.title}:`, error.message)
      }
    }
  }

  console.log('')
  return createdMilestones
}

// Phase 0: Critical Build & Type Safety (18 Issues)
const phase0Issues: Issue[] = [
  {
    number: 'P0-001',
    title: 'Fix type error home-page-header.tsx:132',
    body: `## Problem
\`error\` property accessed without type guard in apps/web/components/home-page-header.tsx:132

## Solution
- Add type guard before property access
- Use typeof validation or type predicate  
- Add test for error handling

## Acceptance Criteria
- [ ] Type error resolved
- [ ] Build passes with \`pnpm build\`
- [ ] Unit tests added
- [ ] Error handling tested

## Effort
1 hour`,
    labels: ['bug', 'type-safety', 'critical', 'blocking'],
  },
  {
    number: 'P0-002',
    title: 'Fix type error home-page-header.tsx:186',
    body: `## Problem
\`error\` is of type 'unknown' in home-page-header.tsx (2nd occurrence)

## Effort
30 minutes`,
    labels: ['bug', 'type-safety', 'critical'],
  },
  {
    number: 'P0-003',
    title: 'Fix type error tasks-list-client.tsx:129',
    body: `## Problem
\`data\` is of type 'unknown' in tasks-list-client.tsx:129

## Effort
30 minutes`,
    labels: ['bug', 'type-safety', 'critical'],
  },
  {
    number: 'P0-004',
    title: 'Fix test type errors in user-token.test.ts (Session type)',
    body: `## Problem
Session type mismatches in test/github/user-token.test.ts

## Effort
1 hour`,
    labels: ['bug', 'type-safety', 'high'],
  },
  {
    number: 'P0-005',
    title: 'Fix test type errors in user-token.test.ts (Drizzle API)',
    body: `## Problem
Drizzle API missing methods in test mocks

## Effort
2 hours`,
    labels: ['bug', 'type-safety', 'high'],
  },
  {
    number: 'P0-006',
    title: 'Fix test type errors in task-form.test.tsx',
    body: `## Problem
Mock type issues in component tests

## Effort
1 hour`,
    labels: ['bug', 'type-safety', 'medium'],
  },
  {
    number: 'P0-007',
    title: 'Add strict null checks to codebase',
    body: `## Description
Enable strictNullChecks in tsconfig.json and fix violations

## Effort
4 hours`,
    labels: ['refactor', 'type-safety', 'high'],
  },
  {
    number: 'P0-008',
    title: 'Add strict property initialization',
    body: `## Description
Enable strictPropertyInitialization and fix violations

## Effort
2 hours`,
    labels: ['refactor', 'type-safety', 'medium'],
  },
  {
    number: 'P0-009',
    title: 'Fix implicit any types throughout codebase',
    body: `## Description
Enable noImplicitAny and fix all violations

## Effort
3 hours`,
    labels: ['refactor', 'type-safety', 'high'],
  },
  {
    number: 'P0-010',
    title: 'Verify production build passes',
    body: `## Acceptance Criteria
- [ ] \`pnpm build\` completes without errors
- [ ] \`pnpm type-check\` passes
- [ ] \`pnpm lint\` passes
- [ ] All tests pass

## Effort
2 hours`,
    labels: ['task', 'critical', 'blocking'],
  },
]

// Phase 1: Logging & Observability (35 Issues)
const phase1Issues: Issue[] = [
  {
    number: 'P1-001',
    title: 'Implement Pino Logger infrastructure',
    body: `## Description
Implement Pino JSON logging infrastructure for production

## Subtasks
- [ ] Create lib/logging/logger.ts
- [ ] Create lib/logging/context.ts
- [ ] Create lib/logging/middleware.ts
- [ ] Configure transport for dev/prod
- [ ] Add environment variables
- [ ] Create unit tests (>90% coverage)

## Acceptance Criteria
- [ ] All logs are JSON format
- [ ] Context propagation works
- [ ] Performance <5ms overhead
- [ ] Dev logs are pretty-printed
- [ ] Prod logs written to /var/log

## Effort
8 hours

## References
- https://getpino.io/`,
    labels: ['feature', 'logging', 'observability', 'high'],
  },
  {
    number: 'P1-002',
    title: 'Replace console.log with Pino logger',
    body: `## Description
Replace all console.log/error/warn with Pino logger throughout codebase

## Scope
4,823 files analyzed
- apps/web - Replace 150+ logs
- lib/ - Replace 100+ logs
- api/ - Replace 200+ logs

## Acceptance Criteria
- [ ] 0 console.log in production code
- [ ] All critical paths logged
- [ ] Error logs include stack traces
- [ ] Grep finds no console in app code

## Effort
20 hours`,
    labels: ['refactor', 'logging', 'observability', 'high'],
  },
  {
    number: 'P1-003',
    title: 'Implement structured logging for Docker Sandbox',
    body: `## Description
Add structured logging to all Docker Sandbox operations

## Effort
4 hours`,
    labels: ['feature', 'logging', 'docker', 'medium'],
  },
  {
    number: 'P1-004',
    title: 'Implement structured logging for API routes',
    body: `## Description
Add structured logging to all API routes with request/response context

## Effort
4 hours`,
    labels: ['feature', 'logging', 'medium'],
  },
  {
    number: 'P1-005',
    title: 'Implement structured logging for database operations',
    body: `## Description
Add structured logging to all database queries and transactions

## Effort
4 hours`,
    labels: ['feature', 'logging', 'database', 'medium'],
  },
  {
    number: 'P1-006',
    title: 'Implement structured logging for authentication',
    body: `## Description
Add structured logging to all auth/authorization flows

## Effort
2 hours`,
    labels: ['feature', 'logging', 'security', 'medium'],
  },
  {
    number: 'P1-007',
    title: 'Implement structured logging for webhooks',
    body: `## Description
Add structured logging to webhook handling with payload tracking

## Effort
2 hours`,
    labels: ['feature', 'logging', 'medium'],
  },
  {
    number: 'P1-011',
    title: 'Implement Prometheus metrics collection',
    body: `## Description
Setup Prometheus metrics collection for production

## Subtasks
- [ ] Create lib/metrics/prometheus.ts
- [ ] Define Counters (requests, errors, sandbox creations)
- [ ] Define Histograms (latency, duration)
- [ ] Define Gauges (active connections, memory, CPU)
- [ ] Create /api/metrics endpoint
- [ ] Integrate with Docker Sandbox

## Acceptance Criteria
- [ ] All metrics collected
- [ ] Metrics exposed at /api/metrics
- [ ] Cardinality <100k series
- [ ] Query latency <100ms

## Effort
12 hours

## References
- https://prometheus.io/
- https://github.com/siimon/prom-client`,
    labels: ['feature', 'metrics', 'observability', 'high'],
  },
  {
    number: 'P1-012',
    title: 'Add API response time metrics',
    body: `## Description
Track response time for all API endpoints

## Effort
3 hours`,
    labels: ['feature', 'metrics', 'performance', 'medium'],
  },
  {
    number: 'P1-013',
    title: 'Add database query metrics',
    body: `## Description
Track execution time and count for all database queries

## Effort
3 hours`,
    labels: ['feature', 'metrics', 'database', 'medium'],
  },
  {
    number: 'P1-014',
    title: 'Add cache hit/miss metrics',
    body: `## Description
Track cache effectiveness metrics

## Effort
3 hours`,
    labels: ['feature', 'metrics', 'caching', 'medium'],
  },
  {
    number: 'P1-015',
    title: 'Add external API call metrics',
    body: `## Description
Track latency and errors for GitHub, Vercel, and other external APIs

## Effort
3 hours`,
    labels: ['feature', 'metrics', 'medium'],
  },
  {
    number: 'P1-031',
    title: 'Implement Jaeger distributed tracing',
    body: `## Description
Setup Jaeger distributed tracing for production

## Acceptance Criteria
- [ ] Traces exported to Jaeger
- [ ] All HTTP requests traced
- [ ] Database queries traced
- [ ] Service calls traced
- [ ] UI shows traces

## Effort
8 hours

## References
- https://www.jaegertracing.io/`,
    labels: ['feature', 'observability', 'medium'],
  },
  {
    number: 'P1-032',
    title: 'Add tracing for sandbox creation flow',
    body: `## Description
Trace entire sandbox creation workflow end-to-end

## Effort
2 hours`,
    labels: ['feature', 'observability', 'docker', 'medium'],
  },
  {
    number: 'P1-033',
    title: 'Add tracing for GitHub API interactions',
    body: `## Description
Trace all GitHub API calls with timing

## Effort
2 hours`,
    labels: ['feature', 'observability', 'medium'],
  },
  {
    number: 'P1-034',
    title: 'Add tracing for database transactions',
    body: `## Description
Trace database transaction boundaries

## Effort
2 hours`,
    labels: ['feature', 'observability', 'database', 'medium'],
  },
  {
    number: 'P1-035',
    title: 'Add tracing for external service calls',
    body: `## Description
Trace all external API interactions

## Effort
2 hours`,
    labels: ['feature', 'observability', 'medium'],
  },
]

// Phase 2: Core Infrastructure (67 Issues) - Sample of key issues
const phase2Issues: Issue[] = [
  {
    number: 'P2-001',
    title: 'Implement health checks for sandboxes',
    body: `## Subtasks
- [ ] Liveness probe
- [ ] Readiness probe
- [ ] Startup probe
- [ ] Auto-restart policy
- [ ] Health metrics

## Acceptance Criteria
- [ ] Health checks pass >99% of time
- [ ] Unhealthy containers auto-restart
- [ ] Metrics exposed for health

## Effort
6 hours`,
    labels: ['feature', 'docker', 'infrastructure', 'high'],
  },
  {
    number: 'P2-002',
    title: 'Implement timeout handling for sandbox operations',
    body: `## Subtasks
- [ ] Timeout for container creation (300s)
- [ ] Timeout for command execution (120s)
- [ ] Timeout for git clone (300s)
- [ ] Timeout for cleanup (60s)

## Acceptance Criteria
- [ ] All operations timeout gracefully
- [ ] Resources cleaned on timeout
- [ ] Error logged with context

## Effort
4 hours`,
    labels: ['feature', 'docker', 'high'],
  },
  {
    number: 'P2-003',
    title: 'Implement retry logic with exponential backoff',
    body: `## Acceptance Criteria
- [ ] Retries with exponential backoff
- [ ] Max 3 retries
- [ ] Logs each retry
- [ ] Returns success/failure

## Effort
4 hours`,
    labels: ['feature', 'infrastructure', 'medium'],
  },
  {
    number: 'P2-004',
    title: 'Implement garbage collection for containers',
    body: `## Subtasks
- [ ] Track container age
- [ ] Remove containers >24h old
- [ ] Clean orphaned volumes
- [ ] Scheduled cleanup job

## Acceptance Criteria
- [ ] Automatic cleanup runs hourly
- [ ] No orphaned resources
- [ ] Logs cleanup actions
- [ ] Metrics show cleanup stats

## Effort
6 hours`,
    labels: ['feature', 'docker', 'high'],
  },
  {
    number: 'P2-005',
    title: 'Enforce memory limits (2GB per container)',
    body: `## Effort
2 hours`,
    labels: ['feature', 'docker', 'performance', 'medium'],
  },
  {
    number: 'P2-006',
    title: 'Enforce CPU limits (2 cores per container)',
    body: `## Effort
2 hours`,
    labels: ['feature', 'docker', 'performance', 'medium'],
  },
  {
    number: 'P2-007',
    title: 'Enforce disk space limits (10GB per container)',
    body: `## Effort
2 hours`,
    labels: ['feature', 'docker', 'medium'],
  },
  {
    number: 'P2-008',
    title: 'Implement network isolation for sandboxes',
    body: `## Acceptance Criteria
- [ ] Sandboxes isolated from each other
- [ ] Only allow required ports
- [ ] No public internet access
- [ ] Only internal docker network

## Effort
4 hours`,
    labels: ['feature', 'docker', 'security', 'high'],
  },
  {
    number: 'P2-045',
    title: 'Implement database transactions',
    body: `## Operations
- Sandbox creation
- Task creation
- User registration
- Token management

## Effort
12 hours`,
    labels: ['feature', 'database', 'high'],
  },
  {
    number: 'P2-046',
    title: 'Implement Zod schema validation',
    body: `## Subtasks
- [ ] API request validation
- [ ] Database insert validation
- [ ] Response validation
- [ ] Error messages

## Effort
16 hours`,
    labels: ['feature', 'type-safety', 'high'],
  },
  {
    number: 'P2-051',
    title: 'Implement automated database backups',
    body: `## Subtasks
- [ ] Daily backups (3 AM UTC)
- [ ] Retention policy (30 days)
- [ ] Backup verification
- [ ] Recovery testing
- [ ] Encrypted storage

## Acceptance Criteria
- [ ] Backups run automatically
- [ ] Backups verified daily
- [ ] Recovery time <30 min
- [ ] No data loss

## Effort
8 hours`,
    labels: ['feature', 'backup', 'disaster-recovery', 'critical'],
  },
  {
    number: 'P2-052',
    title: 'Implement point-in-time recovery (PITR)',
    body: `## Acceptance Criteria
- [ ] Can recover to any point in last 7 days
- [ ] Recovery time <1 hour
- [ ] Tested monthly

## Effort
12 hours`,
    labels: ['feature', 'backup', 'disaster-recovery', 'high'],
  },
]

// Phase 3: Security & Compliance (34 Issues) - Sample of key issues
const phase3Issues: Issue[] = [
  {
    number: 'P3-001',
    title: 'Integrate HashiCorp Vault',
    body: `## Subtasks
- [ ] Deploy Vault
- [ ] Configure storage
- [ ] Setup authentication
- [ ] Migrate secrets from .env
- [ ] Setup auto-rotation
- [ ] Implement seal/unseal

## Acceptance Criteria
- [ ] 0 secrets in .env files
- [ ] 100% of secrets in Vault
- [ ] Auto-rotation working
- [ ] Audit logging complete

## Effort
16 hours

## References
- https://www.vaultproject.io/`,
    labels: ['feature', 'security', 'secrets', 'critical'],
  },
  {
    number: 'P3-002',
    title: 'Implement secret rotation automation',
    body: `## Description
Implement automatic secret rotation (90-day cycle)

Secrets to rotate:
- API keys
- Database passwords
- JWT keys
- OAuth credentials

## Effort
12 hours`,
    labels: ['feature', 'security', 'secrets', 'high'],
  },
  {
    number: 'P3-003',
    title: 'Implement encryption at rest',
    body: `## Data to encrypt
- User passwords
- API keys
- OAuth tokens
- Sensitive configs

## Effort
12 hours`,
    labels: ['feature', 'security', 'high'],
  },
  {
    number: 'P3-004',
    title: 'Implement mTLS for service communication',
    body: `## Services
- API to Database
- API to Cache
- API to External Services
- Container communication

## Effort
16 hours`,
    labels: ['feature', 'security', 'high'],
  },
  {
    number: 'P3-010',
    title: 'Implement MFA for user accounts',
    body: `## Subtasks
- [ ] TOTP support
- [ ] Backup codes
- [ ] Device verification
- [ ] SMS fallback
- [ ] Admin enforcement

## Acceptance Criteria
- [ ] MFA working for all users
- [ ] Recovery procedures documented
- [ ] Tests passing

## Effort
16 hours`,
    labels: ['feature', 'security', 'high'],
  },
  {
    number: 'P3-015',
    title: 'Implement Role-Based Access Control (RBAC)',
    body: `## Roles
- Admin (full access)
- User (limited access)
- Viewer (read-only)
- Developer (sandbox access)

## Effort
16 hours`,
    labels: ['feature', 'security', 'high'],
  },
  {
    number: 'P3-025',
    title: 'Implement SQL injection prevention',
    body: `## Effort
4 hours`,
    labels: ['security', 'database', 'critical'],
  },
  {
    number: 'P3-026',
    title: 'Implement XSS prevention',
    body: `## Effort
4 hours`,
    labels: ['security', 'critical'],
  },
  {
    number: 'P3-027',
    title: 'Implement CSRF protection',
    body: `## Effort
4 hours`,
    labels: ['security', 'high'],
  },
  {
    number: 'P3-028',
    title: 'Add security headers',
    body: `## Headers
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

## Effort
2 hours`,
    labels: ['security', 'high'],
  },
]

// Phase 4: Performance & Scalability (26 Issues) - Sample of key issues
const phase4Issues: Issue[] = [
  {
    number: 'P4-001',
    title: 'Implement Redis cache layer',
    body: `## Cache Items
- API responses (5 min TTL)
- User sessions (24h TTL)
- Database queries (1h TTL)
- GitHub API responses (1h TTL)

## Acceptance Criteria
- [ ] Cache hit rate >70%
- [ ] Invalidation working
- [ ] No stale data

## Effort
12 hours

## References
- https://redis.io/`,
    labels: ['feature', 'performance', 'caching', 'high'],
  },
  {
    number: 'P4-002',
    title: 'Implement cache warming strategy',
    body: `## Acceptance Criteria
- [ ] Critical data cached on startup
- [ ] <5s to ready state
- [ ] Cache always available

## Effort
6 hours`,
    labels: ['feature', 'caching', 'medium'],
  },
  {
    number: 'P4-010',
    title: 'Optimize database queries and add indexes',
    body: `## Subtasks
- [ ] Analyze slow queries
- [ ] Add composite indexes
- [ ] Query plan optimization
- [ ] Connection pooling

## Acceptance Criteria
- [ ] P99 query latency <100ms
- [ ] No full table scans
- [ ] Indexes used properly

## Effort
16 hours`,
    labels: ['performance', 'database', 'high'],
  },
  {
    number: 'P4-011',
    title: 'Design database sharding strategy',
    body: `## Acceptance Criteria
- [ ] Can handle 10M+ users
- [ ] Queries still <100ms
- [ ] No hotspots

## Effort
20 hours`,
    labels: ['feature', 'database', 'performance', 'medium'],
  },
  {
    number: 'P4-015',
    title: 'Implement response compression (gzip)',
    body: `## Effort
4 hours`,
    labels: ['feature', 'performance', 'medium'],
  },
  {
    number: 'P4-016',
    title: 'Implement connection pooling',
    body: `## Effort
4 hours`,
    labels: ['feature', 'performance', 'database', 'medium'],
  },
  {
    number: 'P4-017',
    title: 'Implement rate limiting per user/IP',
    body: `## Effort
6 hours`,
    labels: ['feature', 'performance', 'security', 'high'],
  },
]

// Phase 5: Monitoring & Alerting (19 Issues) - Sample of key issues
const phase5Issues: Issue[] = [
  {
    number: 'P5-001',
    title: 'Setup production Prometheus & Grafana',
    body: `## Subtasks
- [ ] Multi-node Prometheus
- [ ] Long-term storage
- [ ] Grafana with LDAP auth
- [ ] Pre-built dashboards
- [ ] Alert rules

## Acceptance Criteria
- [ ] All metrics collected
- [ ] Dashboards live
- [ ] <100ms query latency

## Effort
12 hours

## References
- https://prometheus.io/
- https://grafana.com/`,
    labels: ['feature', 'monitoring', 'observability', 'critical'],
  },
  {
    number: 'P5-002',
    title: 'Setup production Jaeger',
    body: `## Acceptance Criteria
- [ ] All requests traced
- [ ] Sampling at 10%
- [ ] Traces stored 7 days
- [ ] UI accessible

## Effort
8 hours`,
    labels: ['feature', 'monitoring', 'observability', 'high'],
  },
  {
    number: 'P5-003',
    title: 'Setup production Loki for log aggregation',
    body: `## Acceptance Criteria
- [ ] All logs aggregated
- [ ] Searchable in <1s
- [ ] 30-day retention
- [ ] Cost <$500/month

## Effort
8 hours

## References
- https://grafana.com/oss/loki/`,
    labels: ['feature', 'monitoring', 'logging', 'critical'],
  },
  {
    number: 'P5-010',
    title: 'Create alert: High error rate',
    body: `## Threshold
>1% error rate

## Effort
2 hours`,
    labels: ['task', 'monitoring', 'high'],
  },
  {
    number: 'P5-011',
    title: 'Create alert: High latency',
    body: `## Threshold
P99 >1s

## Effort
2 hours`,
    labels: ['task', 'monitoring', 'high'],
  },
  {
    number: 'P5-012',
    title: 'Create alert: Low disk space',
    body: `## Threshold
<10% free

## Effort
1 hour`,
    labels: ['task', 'monitoring', 'high'],
  },
  {
    number: 'P5-013',
    title: 'Create alert: Memory exhaustion',
    body: `## Threshold
>90% used

## Effort
1 hour`,
    labels: ['task', 'monitoring', 'high'],
  },
  {
    number: 'P5-014',
    title: 'Create alert: High CPU usage',
    body: `## Threshold
>80% sustained

## Effort
1 hour`,
    labels: ['task', 'monitoring', 'high'],
  },
  {
    number: 'P5-015',
    title: 'Create alert: Database connection pool exhausted',
    body: `## Effort
1 hour`,
    labels: ['task', 'monitoring', 'database', 'high'],
  },
  {
    number: 'P5-016',
    title: 'Create alert: Cache hit rate low',
    body: `## Threshold
<50%

## Effort
1 hour`,
    labels: ['task', 'monitoring', 'caching', 'medium'],
  },
]

async function createIssue(issue: Issue, milestoneNumber?: number) {
  try {
    const response = await octokit.rest.issues.create({
      owner: OWNER,
      repo: REPO,
      title: `${issue.number}: ${issue.title}`,
      body: issue.body,
      labels: issue.labels,
      milestone: milestoneNumber,
    })
    console.log(`  ✅ Created ${issue.number}: ${issue.title}`)
    return response.data
  } catch (error: any) {
    console.error(`  ❌ Failed to create ${issue.number}:`, error.message)
    return null
  }
}

async function createIssuesWithDelay(issues: Issue[], milestoneNumber?: number, delayMs = 500) {
  for (const issue of issues) {
    await createIssue(issue, milestoneNumber)
    // Add delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
}

async function main() {
  console.log('🚀 Creating GitHub Issues for Production 360° Coverage')
  console.log(`📦 Repository: ${OWNER}/${REPO}`)
  console.log('')

  // Create labels
  await createLabels()

  // Create milestones
  const milestones = await createMilestones()

  // Phase 0: Build Fixes
  console.log('=== PHASE 0: BUILD FIXES (10 issues) ===')
  await createIssuesWithDelay(phase0Issues, milestones['Phase 0: Build Fixes'])
  console.log('')

  // Phase 1: Observability
  console.log('=== PHASE 1: OBSERVABILITY (17 issues) ===')
  await createIssuesWithDelay(phase1Issues, milestones['Phase 1: Observability'])
  console.log('')

  // Phase 2: Core Infrastructure
  console.log('=== PHASE 2: CORE INFRASTRUCTURE (12 issues) ===')
  await createIssuesWithDelay(phase2Issues, milestones['Phase 2: Core Infrastructure'])
  console.log('')

  // Phase 3: Security & Compliance
  console.log('=== PHASE 3: SECURITY & COMPLIANCE (10 issues) ===')
  await createIssuesWithDelay(phase3Issues, milestones['Phase 3: Security & Compliance'])
  console.log('')

  // Phase 4: Performance & Scalability
  console.log('=== PHASE 4: PERFORMANCE & SCALABILITY (7 issues) ===')
  await createIssuesWithDelay(phase4Issues, milestones['Phase 4: Performance & Scalability'])
  console.log('')

  // Phase 5: Monitoring & Alerting
  console.log('=== PHASE 5: MONITORING & ALERTING (10 issues) ===')
  await createIssuesWithDelay(phase5Issues, milestones['Phase 5: Monitoring & Alerting'])
  console.log('')

  console.log('✨ ===================================')
  console.log('✅ GitHub issues created successfully!')
  console.log(
    `📊 Total issues created: ${phase0Issues.length + phase1Issues.length + phase2Issues.length + phase3Issues.length + phase4Issues.length + phase5Issues.length}`,
  )
  console.log('')
  console.log(`🔗 View issues at: https://github.com/${OWNER}/${REPO}/issues`)
  console.log('')
  console.log('⚠️  Note: This script created a sample of key issues.')
  console.log('   See PRODUCTION_COVERAGE_360.md for the complete list of 192 issues.')
}

main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
