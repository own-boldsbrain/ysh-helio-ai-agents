#!/bin/bash
# Create GitHub Issues from Production Coverage

OWNER="own-boldsbrain"
REPO="ysh-helio-ai-agents"
TOKEN="$GITHUB_TOKEN"

if [ -z "$TOKEN" ]; then
    echo "Error: GITHUB_TOKEN environment variable not set"
    echo "Usage: GITHUB_TOKEN=xxx ./create_issues.sh"
    exit 1
fi

echo "Creating GitHub issues for $OWNER/$REPO..."
echo ""

# Phase 0: Critical Build Fixes
echo "=== PHASE 0: BUILD FIXES ==="

# P0-001
gh issue create \
  --repo $OWNER/$REPO \
  --title "P0-001: Fix type error home-page-header.tsx:132" \
  --body "## Problem
error property accessed without type guard in apps/web/components/home-page-header.tsx:132

## Solution
- Add type guard before property access
- Use typeof validation or type predicate  
- Add test for error handling

## Acceptance Criteria
- [ ] Type error resolved
- [ ] Build passes with pnpm build
- [ ] Unit tests added
- [ ] Error handling tested

## Effort: 1 hour" \
  --label "bug,type-safety,critical,blocking"

echo "✅ Created P0-001"

# P0-002
gh issue create \
  --repo $OWNER/$REPO \
  --title "P0-002: Fix type error home-page-header.tsx:186" \
  --body "Fix 'error' is of type 'unknown' in home-page-header.tsx (2nd occurrence)

Effort: 30 minutes" \
  --label "bug,type-safety,critical"

echo "✅ Created P0-002"

# P0-003
gh issue create \
  --repo $OWNER/$REPO \
  --title "P0-003: Fix type error tasks-list-client.tsx:129" \
  --body "Fix 'data' is of type 'unknown' in tasks-list-client.tsx

Effort: 30 minutes" \
  --label "bug,type-safety,critical"

echo "✅ Created P0-003"

# Phase 1: Observability
echo ""
echo "=== PHASE 1: OBSERVABILITY ==="

gh issue create \
  --repo $OWNER/$REPO \
  --title "P1-001: Implement Pino Logger infrastructure" \
  --body "## Description
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

## Effort: 8 hours

## References
- https://getpino.io/" \
  --label "feature,logging,observability,high"

echo "✅ Created P1-001"

gh issue create \
  --repo $OWNER/$REPO \
  --title "P1-011: Implement Prometheus metrics collection" \
  --body "## Description
Setup Prometheus metrics collection for production

## Subtasks
- [ ] Create lib/metrics/prometheus.ts
- [ ] Define Counters
- [ ] Define Histograms
- [ ] Define Gauges
- [ ] Create /api/metrics endpoint
- [ ] Integrate with Docker Sandbox

## Effort: 12 hours

## References
- https://prometheus.io/
- https://github.com/siimon/prom-client" \
  --label "feature,metrics,observability,high"

echo "✅ Created P1-011"

# Phase 2: Infrastructure  
echo ""
echo "=== PHASE 2: CORE INFRASTRUCTURE ==="

gh issue create \
  --repo $OWNER/$REPO \
  --title "P2-001: Implement health checks for sandboxes" \
  --body "## Subtasks
- [ ] Liveness probe
- [ ] Readiness probe
- [ ] Startup probe
- [ ] Auto-restart policy
- [ ] Health metrics

## Acceptance Criteria
- [ ] Health checks pass >99% of time
- [ ] Unhealthy containers auto-restart
- [ ] Metrics exposed for health

## Effort: 6 hours" \
  --label "feature,docker,infrastructure,high"

echo "✅ Created P2-001"

gh issue create \
  --repo $OWNER/$REPO \
  --title "P2-051: Implement automated database backups" \
  --body "## Subtasks
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

## Effort: 8 hours" \
  --label "feature,backup,disaster-recovery,critical"

echo "✅ Created P2-051"

# Phase 3: Security
echo ""
echo "=== PHASE 3: SECURITY & COMPLIANCE ==="

gh issue create \
  --repo $OWNER/$REPO \
  --title "P3-001: Integrate HashiCorp Vault" \
  --body "## Subtasks
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

## Effort: 16 hours

## References
- https://www.vaultproject.io/" \
  --label "feature,security,secrets,critical"

echo "✅ Created P3-001"

# Phase 4: Performance
echo ""
echo "=== PHASE 4: PERFORMANCE & SCALABILITY ==="

gh issue create \
  --repo $OWNER/$REPO \
  --title "P4-001: Implement Redis cache layer" \
  --body "## Cache Items
- API responses (5 min TTL)
- User sessions (24h TTL)
- Database queries (1h TTL)
- GitHub API responses (1h TTL)

## Acceptance Criteria
- [ ] Cache hit rate >70%
- [ ] Invalidation working
- [ ] No stale data

## Effort: 12 hours

## References
- https://redis.io/" \
  --label "feature,performance,caching,high"

echo "✅ Created P4-001"

# Phase 5: Monitoring
echo ""
echo "=== PHASE 5: MONITORING & ALERTING ==="

gh issue create \
  --repo $OWNER/$REPO \
  --title "P5-001: Setup production Prometheus & Grafana" \
  --body "## Subtasks
- [ ] Multi-node Prometheus
- [ ] Long-term storage
- [ ] Grafana with LDAP auth
- [ ] Pre-built dashboards
- [ ] Alert rules

## Acceptance Criteria
- [ ] All metrics collected
- [ ] Dashboards live
- [ ] <100ms query latency

## Effort: 12 hours

## References
- https://prometheus.io/
- https://grafana.com/" \
  --label "feature,monitoring,observability,critical"

echo "✅ Created P5-001"

echo ""
echo "=== SUMMARY ==="
echo "✅ GitHub issues created successfully!"
echo ""
echo "View issues at: https://github.com/$OWNER/$REPO/issues"

