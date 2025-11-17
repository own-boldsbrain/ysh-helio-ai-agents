# ✅ DOCKER & OSS STACK - IMPLEMENTATION CHECKLIST

**Para executar as 3 fases propostas**  
**Data:** 17 Nov 2025

---

## 📋 PHASE 1: OBSERVABILITY (Weeks 1-2)

### New Files to Create

#### Logging Infrastructure

- [ ] `lib/logging/logger.ts` - Pino logger setup
- [ ] `lib/logging/context.ts` - Context-aware logging helpers
- [ ] `lib/logging/middleware.ts` - Express/Next.js middleware

#### Metrics

- [ ] `lib/metrics/prometheus.ts` - Prometheus client & metrics definitions
- [ ] `lib/metrics/collectors.ts` - Custom metric collectors
- [ ] `apps/web/app/api/metrics/route.ts` - Metrics endpoint

#### Docker Compose

- [ ] `docker-compose.observability.yml` - Observability stack
- [ ] `config/prometheus.yml` - Prometheus configuration
- [ ] `config/loki-config.yml` - Loki configuration
- [ ] `config/promtail-config.yml` - Promtail configuration
- [ ] `config/grafana-provisioning/` - Grafana datasources & dashboards

#### Documentation

- [ ] `docs/MONITORING.md` - Monitoring guide
- [ ] `docs/LOGGING.md` - Logging guide
- [ ] `docs/DASHBOARDS.md` - Dashboard documentation

**Total New Files:** 13

### Files to Modify

#### Docker Sandbox

- [ ] `lib/sandbox/docker-sandbox.ts`
  - Add logging at key points
  - Integrate Prometheus metrics
  - Add error tracking

#### Integration Tests

- [ ] `test/sandbox/docker-sandbox.test.ts`
  - Add metrics verification
  - Add logging assertions

#### Configuration

- [ ] `.env.example` - Add observability env vars
- [ ] `docker-compose.yml` - Optional: Add observability

**Total Modified Files:** 4

### Dependencies to Add

```bash
pnpm add pino pino-pretty pino-http pino-transport prom-client
```

### Deployment Steps

1. Create docker-compose.observability.yml
2. Install dependencies
3. Implement logger.ts
4. Add logging to docker-sandbox.ts
5. Create prometheus.ts with metrics
6. Create /api/metrics endpoint
7. Start observability stack: `docker-compose -f docker-compose.observability.yml up -d`
8. Configure Grafana datasources
9. Create sample dashboards
10. Test end-to-end

**Time Estimate:** 40 hours  
**Complexity:** Medium  
**Risk:** Low (non-breaking changes)

---

## 📋 PHASE 2: SECURITY & SERVICE DISCOVERY (Weeks 3-6)

### New Files to Create

#### Secrets Management (Vault)

- [ ] `config/vault/config.hcl` - Vault server config
- [ ] `config/vault/init.sh` - Vault initialization script
- [ ] `lib/vault/client.ts` - Vault client wrapper
- [ ] `lib/vault/secrets.ts` - Secret retrieval utilities
- [ ] `docker-compose.vault.yml` - Vault Docker Compose

#### Service Discovery (Consul)

- [ ] `config/consul/config.json` - Consul configuration
- [ ] `lib/consul/client.ts` - Consul client wrapper
- [ ] `lib/consul/discovery.ts` - Service registration utilities
- [ ] `docker-compose.consul.yml` - Consul Docker Compose

#### Security Policies

- [ ] `config/docker-network-policies.yaml` - Network policies
- [ ] `config/rbac.yaml` - RBAC configuration
- [ ] `config/tls-config.json` - TLS settings

#### Documentation

- [ ] `docs/SECRETS_MANAGEMENT.md` - Vault guide
- [ ] `docs/SERVICE_DISCOVERY.md` - Consul guide
- [ ] `docs/SECURITY.md` - Security architecture
- [ ] `docs/COMPLIANCE.md` - Compliance documentation

**Total New Files:** 13

### Files to Modify

#### Docker Sandbox

- [ ] `lib/sandbox/docker-sandbox.ts`
  - Integrate Vault for secrets
  - Register with Consul
  - Use mTLS for communication

#### Environment Configuration

- [ ] `.env.example` - Add Vault/Consul endpoints
- [ ] `apps/web/.env.example` - Add security env vars

#### Docker Compose

- [ ] `docker-compose.multi-agent.yml`
  - Add service discovery
  - Add security options
  - Add Vault integration

**Total Modified Files:** 4

### Dependencies to Add

```bash
pnpm add node-vault consul
```

### Deployment Steps

1. Create Vault configuration
2. Create Consul configuration
3. Start Vault: `docker-compose -f docker-compose.vault.yml up -d`
4. Initialize Vault
5. Start Consul: `docker-compose -f docker-compose.consul.yml up -d`
6. Register services with Consul
7. Migrate secrets to Vault
8. Configure mTLS
9. Implement network policies
10. Security audit
11. Compliance verification

**Time Estimate:** 60 hours  
**Complexity:** High  
**Risk:** Medium (security-critical changes)

---

## 📋 PHASE 3: ADVANCED FEATURES (Weeks 7-12)

### New Files to Create

#### Container Pooling

- [ ] `lib/sandbox/sandbox-pool.ts` - Container pool implementation
- [ ] `lib/sandbox/pool-config.ts` - Pool configuration
- [ ] `test/sandbox/pool.test.ts` - Pool tests

#### Auto-scaling

- [ ] `lib/scaling/auto-scaler.ts` - Auto-scaling logic
- [ ] `lib/scaling/metrics-predictor.ts` - Load prediction
- [ ] `lib/scaling/policy.ts` - Scaling policies

#### Event Sourcing (EventStoreDB)

- [ ] `config/eventstore/config.yaml` - EventStore config
- [ ] `lib/events/event-store.ts` - EventStore client
- [ ] `lib/events/event-handlers.ts` - Event handlers
- [ ] `lib/events/projections.ts` - Event projections
- [ ] `docker-compose.eventstore.yml` - EventStore Docker Compose

#### Workflow Engine (Temporal)

- [ ] `config/temporal/config.yaml` - Temporal config
- [ ] `lib/workflows/client.ts` - Temporal client
- [ ] `lib/workflows/sandbox-workflow.ts` - Sandbox workflow
- [ ] `docker-compose.temporal.yml` - Temporal Docker Compose

#### Documentation

- [ ] `docs/POOLING.md` - Container pooling guide
- [ ] `docs/AUTO_SCALING.md` - Auto-scaling guide
- [ ] `docs/EVENT_SOURCING.md` - Event sourcing guide
- [ ] `docs/WORKFLOWS.md` - Workflow documentation

**Total New Files:** 15

### Files to Modify

#### Docker Sandbox

- [ ] `lib/sandbox/docker-sandbox.ts`
  - Integrate pooling
  - Add event emission
  - Support workflow context

#### API Routes

- [ ] `apps/web/app/api/sandboxes/route.ts`
  - Use SandboxPool
  - Trigger scaling
  - Emit events

#### Configuration

- [ ] `.env.example` - Add EventStore/Temporal endpoints
- [ ] `docker-compose.multi-agent.yml` - Add pooling config

**Total Modified Files:** 3

### Dependencies to Add

```bash
pnpm add @temporalio/client @temporalio/worker @temporalio/common eventstore
```

### Deployment Steps

1. Implement SandboxPool class
2. Create auto-scaling logic
3. Setup EventStoreDB: `docker-compose -f docker-compose.eventstore.yml up -d`
4. Implement event handlers
5. Setup Temporal: `docker-compose -f docker-compose.temporal.yml up -d`
6. Create workflow definitions
7. Implement workflow starter
8. Setup event projections
9. Create monitoring for advanced features
10. Performance testing
11. Optimization & tuning

**Time Estimate:** 80 hours  
**Complexity:** Very High  
**Risk:** Medium (major architectural changes)

---

## 🗂️ DIRECTORY STRUCTURE AFTER ALL PHASES

```tsx
coding-agent-template/
├── lib/
│   ├── logging/
│   │   ├── logger.ts (NEW - Phase 1)
│   │   ├── context.ts (NEW - Phase 1)
│   │   └── middleware.ts (NEW - Phase 1)
│   ├── metrics/
│   │   ├── prometheus.ts (NEW - Phase 1)
│   │   └── collectors.ts (NEW - Phase 1)
│   ├── vault/
│   │   ├── client.ts (NEW - Phase 2)
│   │   └── secrets.ts (NEW - Phase 2)
│   ├── consul/
│   │   ├── client.ts (NEW - Phase 2)
│   │   └── discovery.ts (NEW - Phase 2)
│   ├── sandbox/
│   │   ├── docker-sandbox.ts (MODIFIED)
│   │   ├── sandbox-pool.ts (NEW - Phase 3)
│   │   └── pool-config.ts (NEW - Phase 3)
│   ├── scaling/
│   │   ├── auto-scaler.ts (NEW - Phase 3)
│   │   ├── metrics-predictor.ts (NEW - Phase 3)
│   │   └── policy.ts (NEW - Phase 3)
│   ├── events/
│   │   ├── event-store.ts (NEW - Phase 3)
│   │   ├── event-handlers.ts (NEW - Phase 3)
│   │   └── projections.ts (NEW - Phase 3)
│   └── workflows/
│       ├── client.ts (NEW - Phase 3)
│       └── sandbox-workflow.ts (NEW - Phase 3)
├── config/
│   ├── prometheus.yml (NEW - Phase 1)
│   ├── loki-config.yml (NEW - Phase 1)
│   ├── promtail-config.yml (NEW - Phase 1)
│   ├── vault/
│   │   ├── config.hcl (NEW - Phase 2)
│   │   └── init.sh (NEW - Phase 2)
│   ├── consul/
│   │   └── config.json (NEW - Phase 2)
│   ├── eventstore/
│   │   └── config.yaml (NEW - Phase 3)
│   └── temporal/
│       └── config.yaml (NEW - Phase 3)
├── docs/
│   ├── MONITORING.md (NEW - Phase 1)
│   ├── LOGGING.md (NEW - Phase 1)
│   ├── DASHBOARDS.md (NEW - Phase 1)
│   ├── SECRETS_MANAGEMENT.md (NEW - Phase 2)
│   ├── SERVICE_DISCOVERY.md (NEW - Phase 2)
│   ├── SECURITY.md (NEW - Phase 2)
│   ├── COMPLIANCE.md (NEW - Phase 2)
│   ├── POOLING.md (NEW - Phase 3)
│   ├── AUTO_SCALING.md (NEW - Phase 3)
│   ├── EVENT_SOURCING.md (NEW - Phase 3)
│   └── WORKFLOWS.md (NEW - Phase 3)
├── docker-compose.observability.yml (NEW - Phase 1)
├── docker-compose.vault.yml (NEW - Phase 2)
├── docker-compose.consul.yml (NEW - Phase 2)
├── docker-compose.eventstore.yml (NEW - Phase 3)
├── docker-compose.temporal.yml (NEW - Phase 3)
└── test/
    ├── sandbox/
    │   ├── docker-sandbox.test.ts (MODIFIED)
    └── pool.test.ts (NEW - Phase 3)
```

---

## 🚀 QUICK START COMMANDS

### Phase 1: Start Observability

```bash
# Prerequisites
cd /home/rookie/projects/coding-agent-template
pnpm add pino pino-pretty pino-http pino-transport prom-client

# Create network
docker network create coding-agent-network 2>/dev/null || true

# Start observability stack
docker-compose -f docker-compose.yml \
               -f docker-compose.observability.yml \
               up -d

# Access dashboards
echo "Prometheus: http://localhost:9090"
echo "Grafana: http://localhost:3001 (admin/admin)"
echo "Jaeger: http://localhost:16686"
echo "Loki: http://localhost:3100"
```

### Phase 2: Start Security Stack

```bash
# Add dependencies
pnpm add node-vault consul

# Create Vault & Consul
docker-compose -f docker-compose.vault.yml \
               -f docker-compose.consul.yml \
               up -d

# Initialize Vault
docker exec coding-agent-vault vault operator init

# Unseal Vault
docker exec coding-agent-vault vault operator unseal [KEY1]
docker exec coding-agent-vault vault operator unseal [KEY2]
docker exec coding-agent-vault vault operator unseal [KEY3]
```

### Phase 3: Start Advanced Features

```bash
# Add dependencies
pnpm add @temporalio/client @temporalio/worker eventstore

# Start EventStore & Temporal
docker-compose -f docker-compose.eventstore.yml \
               -f docker-compose.temporal.yml \
               up -d

# Access UIs
echo "EventStore: http://localhost:2113"
echo "Temporal: http://localhost:8233"
```

---

## 📊 SUMMARY STATISTICS

| Metric             | Phase 1 | Phase 2 | Phase 3 | Total    |
| ------------------ | ------- | ------- | ------- | -------- |
| New Files          | 13      | 13      | 15      | 41       |
| Modified Files     | 4       | 4       | 3       | 11       |
| Total Changes      | 17      | 17      | 18      | 52       |
| Lines of Code      | ~3,000  | ~2,500  | ~4,000  | ~9,500   |
| Dependencies Added | 5       | 2       | 3       | 10       |
| Dev Hours          | 40      | 60      | 80      | 180      |
| Infra Cost/month   | $120    | $230    | $650    | $1,000   |
| Timeline           | 2 weeks | 4 weeks | 6 weeks | 12 weeks |

---

## ✅ VALIDATION CHECKLIST

### After Phase 1

- [ ] All logging statements working
- [ ] Prometheus collecting metrics
- [ ] Grafana dashboards displaying data
- [ ] Loki showing logs in real-time
- [ ] Jaeger recording traces
- [ ] cAdvisor showing container metrics
- [ ] Tests passing (>90% coverage)

### After Phase 2

- [ ] Vault storing secrets
- [ ] Secrets rotating automatically
- [ ] Consul discovering services
- [ ] mTLS communication working
- [ ] Network policies enforced
- [ ] Security audit passing
- [ ] Compliance check OK

### After Phase 3

- [ ] Container pool warming up
- [ ] Auto-scaling responding to load
- [ ] EventStore persisting events
- [ ] Temporal workflows executing
- [ ] Event projections updating
- [ ] Performance benchmarks met
- [ ] Load testing >5000 req/s passing

---

## 🎯 SUCCESS CRITERIA

**Definition of Done:**

- ✅ Code reviewed by tech lead
- ✅ Tests passing (>90% coverage)
- ✅ Documentation complete
- ✅ Performance benchmarks met
- ✅ Security audit passed
- ✅ Deployed to staging
- ✅ Tested in production-like environment

---

## 📞 SUPPORT & HELP

**For questions during implementation:**

- Review `DOCKER_OSS_REVIEW.md` for architecture
- Check `DOCKER_OSS_IMPLEMENTATION.md` for code examples
- Refer to `DOCKER_OSS_ROADMAP.md` for timeline
- Contact: infrastructure-team@example.com

---

**Checklist Version:** 1.0  
**Last Updated:** November 17, 2025  
**Status:** ✅ Ready for Implementation
