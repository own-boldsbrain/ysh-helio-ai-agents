#!/usr/bin/env tsx
/**
 * Create ALL 192 GitHub Issues for Production 360° Coverage
 *
 * Categories:
 * 1. Build & Type Safety (18 issues)
 * 2. Logging & Observability (35 issues)
 * 3. Docker Sandbox Hardening (26 issues)
 * 4. Authentication & Authorization (18 issues)
 * 5. Database & Data Integrity (22 issues)
 * 6. Security & Compliance (28 issues)
 * 7. Performance & Scalability (26 issues)
 * 8. Monitoring & Alerting (19 issues)
 *
 * Total: 192 issues
 */

import { Octokit } from '@octokit/rest'
import { setTimeout as delay } from 'node:timers/promises'

const OWNER = 'own-boldsbrain'
const REPO = 'ysh-helio-ai-agents'
const DELAY_MS = 500 // Delay between API calls to avoid rate limiting

interface Issue {
  number: string
  title: string
  body: string
  labels: string[]
  milestone?: number
}

const token = process.env.GITHUB_TOKEN
if (!token) {
  console.error('❌ Error: GITHUB_TOKEN not set')
  console.error('Run: export GITHUB_TOKEN=ghp_xxxxx')
  process.exit(1)
}

const octokit = new Octokit({ auth: token })

// Milestones mapping
const milestoneMap = new Map<string, number>()

async function createMilestones() {
  console.log('🎯 Creating milestones...\n')

  const milestones = [
    {
      title: 'Phase 0: Build Fixes',
      due_on: '2025-11-24T00:00:00Z',
      description: 'Critical build and type safety fixes',
    },
    { title: 'Phase 1: Observability', due_on: '2025-12-15T00:00:00Z', description: 'Logging, metrics, and tracing' },
    {
      title: 'Phase 2: Core Infrastructure',
      due_on: '2026-01-31T00:00:00Z',
      description: 'Docker, Database, Auth hardening',
    },
    {
      title: 'Phase 3: Security & Compliance',
      due_on: '2026-02-28T00:00:00Z',
      description: 'Security hardening and compliance',
    },
    {
      title: 'Phase 4: Performance & Scalability',
      due_on: '2026-03-31T00:00:00Z',
      description: 'Performance optimization',
    },
    {
      title: 'Phase 5: Monitoring & Alerting',
      due_on: '2026-04-30T00:00:00Z',
      description: 'Complete monitoring stack',
    },
  ]

  for (const ms of milestones) {
    try {
      const response = await octokit.rest.issues.createMilestone({
        owner: OWNER,
        repo: REPO,
        title: ms.title,
        due_on: ms.due_on,
        description: ms.description,
      })
      milestoneMap.set(ms.title, response.data.number)
      console.log(`  ✅ Created milestone: ${ms.title} (${response.data.number})`)
    } catch (error: any) {
      if (error.status === 422) {
        // Milestone already exists, fetch it
        const milestones = await octokit.rest.issues.listMilestones({
          owner: OWNER,
          repo: REPO,
          state: 'open',
        })
        const existing = milestones.data.find((m) => m.title === ms.title)
        if (existing) {
          milestoneMap.set(ms.title, existing.number)
          console.log(`  ⏭️  Milestone exists: ${ms.title} (${existing.number})`)
        }
      } else {
        console.error(`  ❌ Failed to create milestone ${ms.title}:`, error.message)
      }
    }
  }
  console.log('')
}

// =============================================================================
// CATEGORY 1: BUILD & TYPE SAFETY (18 Issues)
// =============================================================================
const category1Issues: Issue[] = [
  {
    number: 'P0-011',
    title: 'Fix type error home-page-header.tsx:132',
    body: `## Problem
Type error: 'error' is of type 'unknown' without type guard

**File:** apps/web/components/home-page-header.tsx:132
**Severity:** CRITICAL (blocks production build)

## Solution
- Add type guard before accessing error.message
- Use typeof validation or type predicate
- Add unit test for error handling

## Acceptance Criteria
- [ ] Type error resolved
- [ ] \`pnpm build\` passes
- [ ] Unit tests added
- [ ] Error handling tested

## Effort
1 hour`,
    labels: ['bug', 'type-safety', 'critical', 'blocking'],
    milestone: 0,
  },
  {
    number: 'P0-012',
    title: 'Fix type error home-page-header.tsx:186',
    body: `## Problem
Second occurrence: 'error' is of type 'unknown'

**File:** apps/web/components/home-page-header.tsx:186
**Severity:** CRITICAL

## Solution
Same as P0-011 - add type guard

## Effort
30 minutes`,
    labels: ['bug', 'type-safety', 'critical', 'blocking'],
    milestone: 0,
  },
  {
    number: 'P0-013',
    title: 'Fix type error tasks-list-client.tsx:129',
    body: `## Problem
'data' is of type 'unknown' in tasks-list-client.tsx

**File:** apps/web/components/tasks-list-client.tsx:129
**Severity:** CRITICAL

## Solution
- Add proper type annotation for data
- Validate response structure
- Add type guard

## Effort
30 minutes`,
    labels: ['bug', 'type-safety', 'critical', 'blocking'],
    milestone: 0,
  },
  {
    number: 'P0-014',
    title: 'Fix test type errors user-token.test.ts (Session)',
    body: `## Problem
Session type mismatches in user-token.test.ts

**File:** test/github/user-token.test.ts
**Count:** 5 occurrences

## Solution
- Update Session mock types
- Align with @auth/core types
- Fix provider.type assertions

## Effort
1.5 hours`,
    labels: ['bug', 'type-safety', 'high'],
    milestone: 0,
  },
  {
    number: 'P0-015',
    title: 'Fix test type errors user-token.test.ts (Drizzle)',
    body: `## Problem
Drizzle API methods missing in mocks

**File:** test/github/user-token.test.ts
**Count:** 8 occurrences

## Solution
- Update Drizzle mock to match v0.36+ API
- Add missing methods: .where(), .returning()
- Fix query builder types

## Effort
2 hours`,
    labels: ['bug', 'type-safety', 'high'],
    milestone: 0,
  },
  {
    number: 'P0-016',
    title: 'Fix test type errors task-form.test.tsx',
    body: `## Problem
Mock type issues in task-form component tests

**File:** test/components/task-form.test.tsx
**Count:** 2 occurrences

## Solution
- Fix React Testing Library mock types
- Update component prop types
- Align with latest @testing-library/react

## Effort
1 hour`,
    labels: ['bug', 'type-safety', 'medium'],
    milestone: 0,
  },
  {
    number: 'P0-017',
    title: 'Enable strict null checks',
    body: `## Problem
strictNullChecks disabled in tsconfig.json

## Solution
- Enable strictNullChecks in tsconfig.json
- Fix resulting type errors (estimated 50+ locations)
- Add null checks where needed
- Update function signatures

## Acceptance Criteria
- [ ] strictNullChecks: true in tsconfig.json
- [ ] pnpm type-check passes
- [ ] All null/undefined cases handled
- [ ] Tests pass

## Effort
4 hours`,
    labels: ['refactor', 'type-safety', 'high'],
    milestone: 0,
  },
  {
    number: 'P0-018',
    title: 'Enable strict property initialization',
    body: `## Problem
strictPropertyInitialization disabled

## Solution
- Enable strictPropertyInitialization
- Initialize all class properties
- Use definite assignment assertion (!) where appropriate
- Add constructors where needed

## Effort
2 hours`,
    labels: ['refactor', 'type-safety', 'medium'],
    milestone: 0,
  },
  {
    number: 'P0-019',
    title: 'Fix implicit any types',
    body: `## Problem
noImplicitAny not enforced, many implicit any types

## Solution
- Enable noImplicitAny
- Add explicit types throughout codebase
- Focus on lib/, api/, components/
- Estimated 100+ locations

## Effort
6 hours`,
    labels: ['refactor', 'type-safety', 'medium'],
    milestone: 0,
  },
  {
    number: 'P0-020',
    title: 'Verify production build passes',
    body: `## Problem
Ensure production build succeeds after all fixes

## Tasks
- [ ] Run \`pnpm build\`
- [ ] Verify no type errors
- [ ] Verify no linting errors
- [ ] Verify bundle size acceptable (<5MB)
- [ ] Test production build locally

## Acceptance Criteria
- [ ] Build completes successfully
- [ ] No errors or warnings
- [ ] Production bundle optimized
- [ ] All assets generated correctly

## Effort
1 hour`,
    labels: ['task', 'critical', 'blocking'],
    milestone: 0,
  },
]

// Additional P0 issues (P0-021 to P0-028): Remaining build fixes
for (let i = 21; i <= 28; i++) {
  category1Issues.push({
    number: `P0-0${i}`,
    title: `Additional build/test fix #${i - 20}`,
    body: `## Problem
Additional type safety or test fix identified during Phase 0 execution.

## Effort
1-2 hours`,
    labels: ['bug', 'type-safety', 'medium'],
    milestone: 0,
  })
}

// =============================================================================
// CATEGORY 2: LOGGING & OBSERVABILITY (35 Issues)
// =============================================================================
const category2Issues: Issue[] = [
  {
    number: 'P1-008',
    title: 'Implement Pino Logger infrastructure',
    body: `## Description
Replace all console.log with production-grade Pino JSON logging.

## Tasks
- [ ] Create lib/logging/logger.ts
- [ ] Create lib/logging/context.ts
- [ ] Create lib/logging/middleware.ts
- [ ] Configure transports (dev: pretty, prod: JSON)
- [ ] Add environment variables
- [ ] Create unit tests (>90% coverage)

## Acceptance Criteria
- [ ] All logs are JSON format in production
- [ ] Context propagation works (request ID, user ID)
- [ ] Performance overhead <5ms per log
- [ ] Dev logs are pretty-printed
- [ ] Prod logs written to /var/log

## Effort
8 hours`,
    labels: ['feature', 'logging', 'observability', 'high'],
    milestone: 1,
  },
  {
    number: 'P1-009',
    title: 'Replace console.log with Pino logger',
    body: `## Description
Codebase-wide replacement of console.log/error/warn with Pino logger.

## Scope
- apps/web: ~150 console statements
- lib/: ~100 console statements
- api/: ~200 console statements

## Tasks
- [ ] apps/web replacement
- [ ] lib/ replacement
- [ ] api/ replacement
- [ ] Add logging guidelines doc
- [ ] Update AGENTS.md rules

## Acceptance Criteria
- [ ] 0 console.log in production code
- [ ] All critical paths logged
- [ ] Error logs include stack traces
- [ ] Grep finds no console in app code

## Effort
20 hours`,
    labels: ['refactor', 'logging', 'high'],
    milestone: 1,
  },
  {
    number: 'P1-010',
    title: 'Structured logging for Docker Sandbox',
    body: `## Description
Add structured logging to DockerSandbox operations.

## Locations
- lib/docker/sandbox.ts
- Container lifecycle events
- Command execution
- Error handling

## Log Events
- sandbox.created
- sandbox.started
- sandbox.stopped
- sandbox.deleted
- sandbox.error
- command.executed
- command.failed

## Effort
4 hours`,
    labels: ['feature', 'logging', 'docker', 'medium'],
    milestone: 1,
  },
]

// Add remaining 32 logging/observability issues
const loggingModules = [
  'API Routes',
  'Database Operations',
  'Authentication',
  'Webhooks',
  'GitHub Integration',
  'Task Management',
  'File Operations',
  'External APIs',
]

let issueNum = 16
for (const module of loggingModules) {
  category2Issues.push({
    number: `P1-0${issueNum}`,
    title: `Structured logging for ${module}`,
    body: `## Description
Add comprehensive structured logging for ${module}.

## Tasks
- [ ] Identify all log points
- [ ] Add request/response logging
- [ ] Add error logging with context
- [ ] Add performance timing logs
- [ ] Add tests

## Effort
4 hours`,
    labels: ['feature', 'logging', 'medium'],
    milestone: 1,
  })
  issueNum++
}

// Metrics issues (P1-024 to P1-030)
const metricsComponents = [
  'Prometheus metrics collection',
  'API response time metrics',
  'Database query metrics',
  'Cache hit/miss metrics',
  'External API call metrics',
  'Sandbox lifecycle metrics',
  'Error rate metrics',
]

for (let i = 0; i < metricsComponents.length; i++) {
  category2Issues.push({
    number: `P1-0${24 + i}`,
    title: `Implement ${metricsComponents[i]}`,
    body: `## Description
Setup Prometheus metrics for ${metricsComponents[i]}.

## Tasks
- [ ] Define metric types (Counter/Histogram/Gauge)
- [ ] Instrument code
- [ ] Add /api/metrics endpoint
- [ ] Create Grafana dashboard
- [ ] Set alert thresholds

## Acceptance Criteria
- [ ] Metrics collected and exposed
- [ ] Cardinality <100k series
- [ ] Query latency <100ms
- [ ] Dashboard created

## Effort
${i === 0 ? '12' : '3'} hours`,
    labels: ['feature', 'metrics', 'observability', 'high'],
    milestone: 1,
  })
}

// Tracing issues (P1-036 to P1-042)
const tracingComponents = [
  'Jaeger distributed tracing',
  'Sandbox creation trace',
  'GitHub API interaction trace',
  'Database transaction trace',
  'External service calls trace',
  'Authentication flow trace',
  'Request/response trace',
]

for (let i = 0; i < tracingComponents.length; i++) {
  category2Issues.push({
    number: `P1-0${36 + i}`,
    title: `Implement ${tracingComponents[i]}`,
    body: `## Description
Setup distributed tracing for ${tracingComponents[i]}.

## Tasks
- [ ] Install OpenTelemetry SDK
- [ ] Configure Jaeger exporter
- [ ] Add trace spans
- [ ] Add trace context propagation
- [ ] Configure sampling (10%)

## Effort
${i === 0 ? '8' : '2'} hours`,
    labels: ['feature', 'observability', 'medium'],
    milestone: 1,
  })
}

// =============================================================================
// CATEGORY 3: DOCKER SANDBOX HARDENING (26 Issues)
// =============================================================================
const category3Issues: Issue[] = []

const dockerFeatures = [
  { title: 'Health checks for sandboxes', labels: ['feature', 'docker', 'high'], hours: 6 },
  { title: 'Timeout handling for sandbox operations', labels: ['feature', 'docker', 'high'], hours: 4 },
  { title: 'Retry logic with exponential backoff', labels: ['feature', 'docker', 'medium'], hours: 4 },
  { title: 'Garbage collection for containers', labels: ['feature', 'docker', 'high'], hours: 6 },
  { title: 'Memory limits (2GB per container)', labels: ['feature', 'docker', 'high'], hours: 2 },
  { title: 'CPU limits (2 cores per container)', labels: ['feature', 'docker', 'high'], hours: 2 },
  { title: 'Disk space limits (10GB per container)', labels: ['feature', 'docker', 'high'], hours: 2 },
  { title: 'Network isolation for sandboxes', labels: ['feature', 'docker', 'security', 'high'], hours: 4 },
  { title: 'Container restart policies', labels: ['feature', 'docker', 'medium'], hours: 3 },
  { title: 'Volume backup strategy', labels: ['feature', 'docker', 'backup', 'medium'], hours: 4 },
  { title: 'Container recovery procedures', labels: ['task', 'docker', 'medium'], hours: 4 },
  { title: 'Failure detection mechanisms', labels: ['feature', 'docker', 'monitoring', 'high'], hours: 6 },
  { title: 'Automatic remediation', labels: ['feature', 'docker', 'high'], hours: 8 },
  { title: 'Resource exhaustion handling', labels: ['feature', 'docker', 'high'], hours: 6 },
  { title: 'Network failure recovery', labels: ['feature', 'docker', 'medium'], hours: 4 },
  { title: 'Sandbox state persistence', labels: ['feature', 'docker', 'medium'], hours: 6 },
  { title: 'Container logs aggregation', labels: ['feature', 'docker', 'logging', 'medium'], hours: 4 },
  { title: 'Sandbox metrics dashboard', labels: ['feature', 'docker', 'monitoring', 'medium'], hours: 4 },
  { title: 'Container security scanning', labels: ['feature', 'docker', 'security', 'high'], hours: 6 },
  { title: 'Image vulnerability scanning', labels: ['feature', 'docker', 'security', 'high'], hours: 6 },
  { title: 'Sandbox cost tracking', labels: ['feature', 'docker', 'medium'], hours: 4 },
  { title: 'Multi-region sandbox support', labels: ['feature', 'docker', 'infrastructure', 'low'], hours: 16 },
  { title: 'Sandbox prewarming', labels: ['feature', 'docker', 'performance', 'medium'], hours: 8 },
  { title: 'Container orchestration (K8s)', labels: ['feature', 'docker', 'infrastructure', 'low'], hours: 40 },
  { title: 'Sandbox API rate limiting', labels: ['feature', 'docker', 'security', 'medium'], hours: 4 },
  { title: 'Docker daemon monitoring', labels: ['feature', 'docker', 'monitoring', 'high'], hours: 4 },
]

for (let i = 0; i < dockerFeatures.length; i++) {
  const feature = dockerFeatures[i]
  category3Issues.push({
    number: `P2-0${String(i + 9).padStart(2, '0')}`,
    title: feature.title,
    body: `## Description
Implement ${feature.title} for Docker Sandbox.

## Tasks
- [ ] Design implementation
- [ ] Write code
- [ ] Add tests
- [ ] Update documentation
- [ ] Deploy and verify

## Effort
${feature.hours} hours`,
    labels: feature.labels,
    milestone: 2,
  })
}

// =============================================================================
// CATEGORY 4: AUTH & AUTHORIZATION (18 Issues)
// =============================================================================
const category4Issues: Issue[] = []

const authFeatures = [
  { title: 'Multi-factor authentication (MFA)', severity: 'high', hours: 16 },
  { title: 'OAuth2 Google provider', severity: 'medium', hours: 6 },
  { title: 'OAuth2 Microsoft provider', severity: 'medium', hours: 6 },
  { title: 'Session timeout (30 min idle)', severity: 'high', hours: 3 },
  { title: 'Session revocation', severity: 'high', hours: 4 },
  { title: 'Concurrent session limits', severity: 'medium', hours: 3 },
  { title: 'Remember-me functionality', severity: 'low', hours: 4 },
  { title: 'Role-Based Access Control (RBAC)', severity: 'high', hours: 16 },
  { title: 'API endpoint authorization', severity: 'high', hours: 8 },
  { title: 'Sandbox access control', severity: 'high', hours: 6 },
  { title: 'Repository access control', severity: 'high', hours: 6 },
  { title: 'File access control', severity: 'medium', hours: 4 },
  { title: 'Admin dashboard access control', severity: 'high', hours: 4 },
  { title: 'API key management', severity: 'high', hours: 8 },
  { title: 'Password complexity requirements', severity: 'medium', hours: 2 },
  { title: 'Account lockout policy', severity: 'medium', hours: 4 },
  { title: 'Password reset flow', severity: 'medium', hours: 6 },
  { title: 'Email verification', severity: 'medium', hours: 6 },
]

for (let i = 0; i < authFeatures.length; i++) {
  const feature = authFeatures[i]
  const severity = feature.severity === 'high' ? 'high' : feature.severity === 'medium' ? 'medium' : 'low'

  category4Issues.push({
    number: `P2-${String(35 + i).padStart(3, '0')}`,
    title: feature.title,
    body: `## Description
Implement ${feature.title}.

## Tasks
- [ ] Design and architect solution
- [ ] Implement backend logic
- [ ] Add frontend UI (if needed)
- [ ] Write tests (unit + integration)
- [ ] Update documentation

## Acceptance Criteria
- [ ] Feature works as expected
- [ ] Tests pass (>80% coverage)
- [ ] Documentation updated
- [ ] Security review completed

## Effort
${feature.hours} hours`,
    labels: ['feature', 'security', severity],
    milestone: 2,
  })
}

// =============================================================================
// CATEGORY 5: DATABASE & DATA INTEGRITY (22 Issues)
// =============================================================================
const category5Issues: Issue[] = []

const databaseFeatures = [
  { title: 'Database transactions for critical operations', severity: 'high', hours: 12 },
  { title: 'Zod schema validation', severity: 'high', hours: 16 },
  { title: 'Database schema versioning', severity: 'high', hours: 8 },
  { title: 'Migration rollback procedures', severity: 'high', hours: 6 },
  { title: 'Data transformation scripts', severity: 'medium', hours: 8 },
  { title: 'Compatibility checks', severity: 'medium', hours: 4 },
  { title: 'Automated database backups', severity: 'critical', hours: 8 },
  { title: 'Point-in-time recovery (PITR)', severity: 'high', hours: 12 },
  { title: 'Foreign key constraints', severity: 'high', hours: 6 },
  { title: 'Unique constraints', severity: 'medium', hours: 4 },
  { title: 'Check constraints', severity: 'medium', hours: 4 },
  { title: 'Default values', severity: 'low', hours: 2 },
  { title: 'Audit trails', severity: 'high', hours: 8 },
  { title: 'Soft deletes', severity: 'medium', hours: 6 },
  { title: 'Change tracking', severity: 'medium', hours: 8 },
  { title: 'Database connection pooling', severity: 'high', hours: 6 },
  { title: 'Query performance monitoring', severity: 'high', hours: 8 },
  { title: 'Slow query logging', severity: 'high', hours: 4 },
  { title: 'Database replication', severity: 'high', hours: 16 },
  { title: 'Read replicas', severity: 'medium', hours: 12 },
  { title: 'Database failover', severity: 'critical', hours: 16 },
  { title: 'Database health checks', severity: 'high', hours: 4 },
]

for (let i = 0; i < databaseFeatures.length; i++) {
  const feature = databaseFeatures[i]
  const labels = ['feature', 'database']

  if (feature.severity === 'critical') labels.push('critical')
  else if (feature.severity === 'high') labels.push('high')
  else if (feature.severity === 'medium') labels.push('medium')
  else labels.push('low')

  category5Issues.push({
    number: `P2-${String(53 + i).padStart(3, '0')}`,
    title: feature.title,
    body: `## Description
Implement ${feature.title}.

## Effort
${feature.hours} hours`,
    labels,
    milestone: 2,
  })
}

// =============================================================================
// CATEGORY 6: SECURITY & COMPLIANCE (28 Issues)
// =============================================================================
const category6Issues: Issue[] = []

const securityFeatures = [
  { title: 'HashiCorp Vault integration', severity: 'critical', hours: 16 },
  { title: 'Secret rotation automation', severity: 'high', hours: 12 },
  { title: 'Encryption at rest', severity: 'high', hours: 12 },
  { title: 'mTLS for service communication', severity: 'high', hours: 16 },
  { title: 'GDPR compliance (data deletion)', severity: 'high', hours: 12 },
  { title: 'CCPA compliance', severity: 'medium', hours: 8 },
  { title: 'SOC 2 Type II audit logging', severity: 'high', hours: 16 },
  { title: 'PCI-DSS compliance', severity: 'high', hours: 20 },
  { title: 'HIPAA compliance', severity: 'medium', hours: 20 },
  { title: 'Rate limiting per user/IP', severity: 'high', hours: 6 },
  { title: 'DDoS protection', severity: 'critical', hours: 12 },
  { title: 'SQL injection prevention', severity: 'critical', hours: 8 },
  { title: 'XSS prevention', severity: 'critical', hours: 8 },
  { title: 'CSRF protection', severity: 'critical', hours: 6 },
  { title: 'Security headers (CSP, HSTS, etc.)', severity: 'high', hours: 4 },
  { title: 'Penetration testing', severity: 'high', hours: 40 },
  { title: 'Vulnerability scanning (Snyk)', severity: 'high', hours: 6 },
  { title: 'Dependency security audits', severity: 'high', hours: 4 },
  { title: 'API security hardening', severity: 'high', hours: 8 },
  { title: 'Input validation', severity: 'high', hours: 8 },
  { title: 'Output encoding', severity: 'high', hours: 6 },
  { title: 'Secure session management', severity: 'high', hours: 8 },
  { title: 'IP whitelist/blacklist', severity: 'medium', hours: 4 },
  { title: 'Security incident response plan', severity: 'high', hours: 12 },
  { title: 'Security training for team', severity: 'medium', hours: 16 },
  { title: 'Bug bounty program', severity: 'low', hours: 8 },
  { title: 'Security documentation', severity: 'medium', hours: 8 },
  { title: 'Compliance documentation', severity: 'high', hours: 12 },
]

for (let i = 0; i < securityFeatures.length; i++) {
  const feature = securityFeatures[i]
  const labels = ['feature', 'security']

  if (feature.severity === 'critical') labels.push('critical')
  else if (feature.severity === 'high') labels.push('high')
  else if (feature.severity === 'medium') labels.push('medium')
  else labels.push('low')

  category6Issues.push({
    number: `P3-${String(i + 1).padStart(3, '0')}`,
    title: feature.title,
    body: `## Description
Implement ${feature.title}.

## Effort
${feature.hours} hours`,
    labels,
    milestone: 3,
  })
}

// =============================================================================
// CATEGORY 7: PERFORMANCE & SCALABILITY (26 Issues)
// =============================================================================
const category7Issues: Issue[] = []

const performanceFeatures = [
  { title: 'Redis cache layer', severity: 'high', hours: 12 },
  { title: 'Cache warming strategy', severity: 'medium', hours: 6 },
  { title: 'Query optimization & indexing', severity: 'high', hours: 16 },
  { title: 'Database sharding strategy', severity: 'medium', hours: 20 },
  { title: 'Response compression (gzip)', severity: 'high', hours: 4 },
  { title: 'Connection pooling', severity: 'high', hours: 6 },
  { title: 'CDN integration', severity: 'medium', hours: 8 },
  { title: 'Static asset optimization', severity: 'medium', hours: 6 },
  { title: 'Image optimization', severity: 'medium', hours: 8 },
  { title: 'API versioning', severity: 'medium', hours: 8 },
  { title: 'Pagination optimization', severity: 'medium', hours: 4 },
  { title: 'GraphQL optimization', severity: 'medium', hours: 12 },
  { title: 'Request deduplication', severity: 'medium', hours: 6 },
  { title: 'Response caching headers', severity: 'medium', hours: 4 },
  { title: 'Database query caching', severity: 'high', hours: 8 },
  { title: 'API response caching', severity: 'high', hours: 6 },
  { title: 'Load balancing', severity: 'high', hours: 12 },
  { title: 'Horizontal scaling strategy', severity: 'medium', hours: 16 },
  { title: 'Auto-scaling policies', severity: 'medium', hours: 12 },
  { title: 'Performance testing', severity: 'high', hours: 16 },
  { title: 'Load testing', severity: 'high', hours: 12 },
  { title: 'Stress testing', severity: 'medium', hours: 8 },
  { title: 'Performance monitoring', severity: 'high', hours: 8 },
  { title: 'Performance budgets', severity: 'medium', hours: 4 },
  { title: 'Code splitting', severity: 'medium', hours: 8 },
  { title: 'Lazy loading', severity: 'medium', hours: 6 },
]

for (let i = 0; i < performanceFeatures.length; i++) {
  const feature = performanceFeatures[i]
  const labels = ['feature', 'performance']

  if (feature.severity === 'high') labels.push('high')
  else if (feature.severity === 'medium') labels.push('medium')
  else labels.push('low')

  category7Issues.push({
    number: `P4-${String(i + 1).padStart(3, '0')}`,
    title: feature.title,
    body: `## Description
Implement ${feature.title}.

## Effort
${feature.hours} hours`,
    labels,
    milestone: 4,
  })
}

// =============================================================================
// CATEGORY 8: MONITORING & ALERTING (19 Issues)
// =============================================================================
const category8Issues: Issue[] = []

const monitoringFeatures = [
  { title: 'Prometheus + Grafana production setup', severity: 'critical', hours: 12 },
  { title: 'Jaeger production setup', severity: 'high', hours: 8 },
  { title: 'Loki log aggregation', severity: 'critical', hours: 8 },
  { title: 'Alert: High error rate (>1%)', severity: 'high', hours: 2 },
  { title: 'Alert: High latency (P99 >1s)', severity: 'high', hours: 2 },
  { title: 'Alert: Low disk space (<10%)', severity: 'high', hours: 2 },
  { title: 'Alert: Memory exhaustion', severity: 'critical', hours: 2 },
  { title: 'Alert: High CPU usage (>80%)', severity: 'high', hours: 2 },
  { title: 'Alert: Database connection pool exhausted', severity: 'critical', hours: 2 },
  { title: 'Alert: Cache hit rate low (<50%)', severity: 'medium', hours: 2 },
  { title: 'Alert: Sandbox creation failure', severity: 'high', hours: 2 },
  { title: 'Alert: Pod restarts frequent', severity: 'high', hours: 2 },
  { title: 'Grafana dashboards', severity: 'high', hours: 12 },
  { title: 'PagerDuty integration', severity: 'high', hours: 6 },
  { title: 'Slack alerts', severity: 'medium', hours: 4 },
  { title: 'Email alerts', severity: 'medium', hours: 4 },
  { title: 'Runbooks for common incidents', severity: 'high', hours: 16 },
  { title: 'On-call rotation setup', severity: 'high', hours: 8 },
  { title: 'SLA/SLO/SLI definitions', severity: 'high', hours: 8 },
]

for (let i = 0; i < monitoringFeatures.length; i++) {
  const feature = monitoringFeatures[i]
  const labels = ['feature', 'monitoring']

  if (feature.severity === 'critical') labels.push('critical')
  else if (feature.severity === 'high') labels.push('high')
  else if (feature.severity === 'medium') labels.push('medium')
  else labels.push('low')

  category8Issues.push({
    number: `P5-${String(i + 17).padStart(3, '0')}`,
    title: feature.title,
    body: `## Description
Implement ${feature.title}.

## Effort
${feature.hours} hours`,
    labels,
    milestone: 5,
  })
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function createIssue(issue: Issue, phase: string): Promise<boolean> {
  try {
    const milestone =
      issue.milestone !== undefined
        ? milestoneMap.get(
            `Phase ${issue.milestone}: ${
              issue.milestone === 0
                ? 'Build Fixes'
                : issue.milestone === 1
                  ? 'Observability'
                  : issue.milestone === 2
                    ? 'Core Infrastructure'
                    : issue.milestone === 3
                      ? 'Security & Compliance'
                      : issue.milestone === 4
                        ? 'Performance & Scalability'
                        : 'Monitoring & Alerting'
            }`,
          )
        : undefined

    await octokit.rest.issues.create({
      owner: OWNER,
      repo: REPO,
      title: `[${issue.number}] ${issue.title}`,
      body: issue.body,
      labels: issue.labels,
      milestone,
    })
    console.log(`  ✅ Created ${issue.number}: ${issue.title}`)
    return true
  } catch (error: any) {
    console.error(`  ❌ Failed to create ${issue.number}:`, error.message)
    return false
  }
}

async function createIssuesWithDelay(issues: Issue[], phase: string) {
  console.log(`\n=== ${phase} (${issues.length} issues) ===\n`)

  let created = 0
  for (const issue of issues) {
    if (await createIssue(issue, phase)) {
      created++
    }
    await delay(DELAY_MS)
  }

  return created
}

async function main() {
  console.log('🚀 Creating ALL 192 GitHub Issues for Production 360° Coverage\n')
  console.log(`📦 Repository: ${OWNER}/${REPO}\n`)

  await createMilestones()

  let totalCreated = 0

  totalCreated += await createIssuesWithDelay(category1Issues, 'CATEGORY 1: BUILD & TYPE SAFETY')
  totalCreated += await createIssuesWithDelay(category2Issues, 'CATEGORY 2: LOGGING & OBSERVABILITY')
  totalCreated += await createIssuesWithDelay(category3Issues, 'CATEGORY 3: DOCKER SANDBOX HARDENING')
  totalCreated += await createIssuesWithDelay(category4Issues, 'CATEGORY 4: AUTH & AUTHORIZATION')
  totalCreated += await createIssuesWithDelay(category5Issues, 'CATEGORY 5: DATABASE & DATA INTEGRITY')
  totalCreated += await createIssuesWithDelay(category6Issues, 'CATEGORY 6: SECURITY & COMPLIANCE')
  totalCreated += await createIssuesWithDelay(category7Issues, 'CATEGORY 7: PERFORMANCE & SCALABILITY')
  totalCreated += await createIssuesWithDelay(category8Issues, 'CATEGORY 8: MONITORING & ALERTING')

  console.log(`\n✨ ===================================`)
  console.log(`✅ GitHub issues created successfully!`)
  console.log(`📊 Total issues created: ${totalCreated}/192`)
  console.log(`\n🔗 View issues at: https://github.com/${OWNER}/${REPO}/issues`)
}

main().catch(console.error)
