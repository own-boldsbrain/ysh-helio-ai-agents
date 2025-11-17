# 🚀 Docker OSS Stack - Implementation Guide

**Focus:** Code examples, configs, and commands to implement proposed improvements  
**Date:** November 17, 2025  
**Part of:** [Docker OSS Documentation](DOCKER_OSS.md)

## 📚 Table of Contents

- [Docker OSS Stack - Implementation Guide](#-docker-oss-stack---implementation-guide)
- [Phase 1: Logging & Observability (Week 1-2)](#-phase-1-logging--observability-week-1-2)
- [Phase 2: Docker Compose - Observability Stack](#-phase-2-docker-compose---observability-stack)
- [Phase 3: Prometheus Configuration](#-phase-3-prometheus-configuration)
- [Phase 4: Loki Configuration](#-phase-4-loki-configuration)
- [Phase 5: Promtail Configuration](#-phase-5-promtail-configuration)
- [Phase 6: Integration with Docker Sandbox](#-phase-6-integration-with-docker-sandbox)
- [Practical Next Steps](#-practical-next-steps)

---

## 📦 Phase 1: Logging & Observability (Week 1-2)

### 1. Setup Pino Logger

**Installation:**

```bash
cd /home/rookie/projects/coding-agent-template
pnpm add pino pino-pretty pino-http pino-transport
```

**File: `lib/logging/logger.ts`**

```typescript
import pino from 'pino'
import pinoPretty from 'pino-pretty'

const isDev = process.env.NODE_ENV !== 'production'

// Transport configuration
const transport = isDev
  ? pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        singleLine: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    })
  : pino.transport({
      target: 'pino/file',
      options: { destination: '/var/log/app.log' },
    })

const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({
        level: label.toUpperCase(),
      }),
      bindings: (bindings) => ({
        node: bindings.pid,
        environment: process.env.NODE_ENV,
      }),
    },
  },
  transport,
)

export default logger

// Helper: Context-aware logging
export const createContextLogger = (context: string) => {
  return logger.child({ context })
}
```

**Usage in Docker Sandbox:**

```typescript
// lib/sandbox/docker-sandbox.ts
import logger from '@/lib/logging/logger'
import { createContextLogger } from '@/lib/logging/logger'

export class DockerSandbox implements SandboxType {
  private sandboxLogger = createContextLogger(`Sandbox:${this.sandboxId}`)

  static async create(options: SandboxCreateOptions): Promise<DockerSandbox> {
    const sandboxId = `sandbox-${randomBytes(8).toString('hex')}`
    const contextLogger = createContextLogger(`Sandbox:${sandboxId}`)

    contextLogger.info({ action: 'creating', options }, 'Creating sandbox')

    try {
      // ... creation logic ...
      contextLogger.info({
        action: 'created',
        containerId,
        ports: hostPorts,
      }, 'Sandbox created successfully')

      return sandbox
    } catch (error) {
      contextLogger.error({
        action: 'failed',
        error: error instanceof Error ? error.message : String(error),
      }, 'Failed to create sandbox')
      throw error
    }
  }

  async runCommand(options: { cmd: string; args: string[]; cwd?: string }): Promise<CommandResult> {
    this.sandboxLogger.debug({
      command: options.cmd,
      args: options.args,
      cwd: options.cwd,
    }, 'Executing command')

    try {
      const result = await execAsync(...)
      this.sandboxLogger.debug({
        command: options.cmd,
        duration: Date.now() - startTime,
      }, 'Command executed')

      return { success: true, output: result }
    } catch (error) {
      this.sandboxLogger.error({
        command: options.cmd,
        error: error instanceof Error ? error.message : String(error),
      }, 'Command failed')

      return { success: false, error: String(error) }
    }
  }

  async stop(): Promise<void> {
    this.sandboxLogger.info({
      action: 'stopping',
      keepVolume: process.env.SANDBOX_KEEP_VOLUME === 'true',
    }, 'Stopping sandbox')

    try {
      // ... stop logic ...
      this.sandboxLogger.info({ action: 'stopped' }, 'Sandbox stopped')
    } catch (error) {
      this.sandboxLogger.error({
        error: error instanceof Error ? error.message : String(error),
      }, 'Failed to stop sandbox')
    }
  }
}
```

---

### 2. Prometheus Metrics

**Installation:**

```bash
pnpm add prom-client
```

**File: `lib/metrics/prometheus.ts`**

```typescript
import { register, Counter, Histogram, Gauge, Summary, collectDefaultMetrics } from 'prom-client'

// Collect default Node.js metrics
collectDefaultMetrics({ register })

// ===== COUNTERS =====
export const sandboxCreationsTotal = new Counter({
  name: 'sandbox_creations_total',
  help: 'Total number of sandbox creations',
  labelNames: ['status', 'type'],
  registers: [register],
})

export const sandboxCommandsExecuted = new Counter({
  name: 'sandbox_commands_executed_total',
  help: 'Total commands executed in sandboxes',
  labelNames: ['sandbox_id', 'status'],
  registers: [register],
})

export const gitCloneAttempts = new Counter({
  name: 'git_clone_attempts_total',
  help: 'Total git clone attempts',
  labelNames: ['status'],
  registers: [register],
})

// ===== HISTOGRAMS =====
export const sandboxCreationDuration = new Histogram({
  name: 'sandbox_creation_duration_seconds',
  help: 'Time taken to create a sandbox',
  buckets: [1, 2, 5, 10, 30, 60, 120],
  registers: [register],
})

export const commandExecutionDuration = new Histogram({
  name: 'sandbox_command_duration_seconds',
  help: 'Time taken to execute a command',
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  labelNames: ['command'],
  registers: [register],
})

export const apiResponseTime = new Histogram({
  name: 'api_response_time_seconds',
  help: 'HTTP request response time',
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  labelNames: ['method', 'route', 'status'],
  registers: [register],
})

// ===== GAUGES =====
export const activeSandboxes = new Gauge({
  name: 'active_sandboxes',
  help: 'Number of active sandboxes',
  registers: [register],
})

export const containerCpuUsage = new Gauge({
  name: 'container_cpu_usage_percent',
  help: 'CPU usage percentage per container',
  labelNames: ['sandbox_id'],
  registers: [register],
})

export const containerMemoryUsage = new Gauge({
  name: 'container_memory_usage_mb',
  help: 'Memory usage in MB per container',
  labelNames: ['sandbox_id'],
  registers: [register],
})

export const containerDiskUsage = new Gauge({
  name: 'container_disk_usage_mb',
  help: 'Disk usage in MB per container',
  labelNames: ['sandbox_id'],
  registers: [register],
})

export const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register],
})

// ===== SUMMARY =====
export const requestSummary = new Summary({
  name: 'http_request_summary_seconds',
  help: 'HTTP request latency summary',
  percentiles: [0.1, 0.5, 0.9, 0.95, 0.99],
  labelNames: ['method', 'route'],
  registers: [register],
})

// Export metrics endpoint
export const getMetrics = () => register.metrics()

// Export registry for custom usage
export { register }
```

**File: `apps/web/app/api/metrics/route.ts`**

```typescript
import { getMetrics } from '@/lib/metrics/prometheus'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const metrics = await getMetrics()
    return new NextResponse(metrics, {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate metrics' }, { status: 500 })
  }
}
```

---

## 🚀 Phase 2: Docker Compose - Observability Stack

**File: `docker-compose.observability.yml`**

```yaml
version: '3.8'

services:
  # Prometheus - Metrics collection
  prometheus:
    image: prom/prometheus:latest
    container_name: coding-agent-prometheus
    ports:
      - '9090:9090'
    volumes:
      - ./config/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
      - '--storage.tsdb.retention.time=30d'
    healthcheck:
      test: ['CMD', 'wget', '--spider', '-q', 'http://localhost:9090/-/healthy']
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - coding-agent-network

  # Grafana - Visualization & Dashboards
  grafana:
    image: grafana/grafana:latest
    container_name: coding-agent-grafana
    environment:
      GF_SECURITY_ADMIN_USER: admin
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD:-admin}
      GF_USERS_ALLOW_SIGN_UP: false
      GF_INSTALL_PLUGINS: grafana-piechart-panel
    ports:
      - '3001:3000'
    volumes:
      - grafana_data:/var/lib/grafana
      - ./config/grafana/provisioning:/etc/grafana/provisioning:ro
    depends_on:
      - prometheus
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health']
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - coding-agent-network

  # Loki - Log aggregation
  loki:
    image: grafana/loki:latest
    container_name: coding-agent-loki
    ports:
      - '3100:3100'
    volumes:
      - ./config/loki-config.yml:/etc/loki/local-config.yml:ro
      - loki_data:/loki
    command: -config.file=/etc/loki/local-config.yml
    healthcheck:
      test: ['CMD', 'wget', '--spider', '-q', 'http://localhost:3100/ready']
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - coding-agent-network

  # Promtail - Log shipper
  promtail:
    image: grafana/promtail:latest
    container_name: coding-agent-promtail
    volumes:
      - ./config/promtail-config.yml:/etc/promtail/config.yml:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock
    command: -config.file=/etc/promtail/config.yml
    depends_on:
      - loki
    networks:
      - coding-agent-network

  # Jaeger - Distributed tracing
  jaeger:
    image: jaegertracing/all-in-one:latest
    container_name: coding-agent-jaeger
    ports:
      - '6831:6831/udp' # Jaeger agent (compact thrift)
      - '6832:6832/udp' # Jaeger agent (binary thrift)
      - '5778:5778' # Serve config
      - '16686:16686' # UI
      - '14268:14268' # Jaeger collector
      - '14250:14250' # gRPC
    environment:
      COLLECTOR_ZIPKIN_HOST_PORT: ':9411'
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:16686/']
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - coding-agent-network

  # cAdvisor - Container metrics
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: coding-agent-cadvisor
    ports:
      - '8080:8080'
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:rw
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    command:
      - --logtostderr
      - --docker_only
      - --port=8080
      - --disable_metrics=processes
    networks:
      - coding-agent-network

volumes:
  prometheus_data:
  grafana_data:
  loki_data:

networks:
  coding-agent-network:
    external: true
```

---

## 📊 Phase 3: Prometheus Configuration

**File: `config/prometheus.yml`**

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'coding-agent'
    environment: 'development'

alerting:
  alertmanagers:
    - static_configs:
        - targets: []

rule_files:
  - '/etc/prometheus/rules.yml'

scrape_configs:
  # Prometheus itself
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Application metrics
  - job_name: 'coding-agent-app'
    metrics_path: '/api/metrics'
    static_configs:
      - targets: ['localhost:3000']
    scrape_interval: 30s

  # Docker metrics via cAdvisor
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance

  # Node metrics (if deploying on VMs)
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
```

---

## 🔍 Phase 4: Loki Configuration

**File: `config/loki-config.yml`**

```yaml
auth_enabled: false

ingester:
  chunk_idle_period: 3m
  chunk_retain_period: 1m
  max_chunk_age: 1h
  chunk_encoding: gzip

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

server:
  http_listen_port: 3100
  log_level: info

storage_config:
  boltdb_shipper:
    active_index_directory: /loki/boltdb-shipper-active
    shared_store: filesystem
  filesystem:
    directory: /loki/chunks

chunk_store_config:
  max_look_back_period: 0s

table_manager:
  retention_deletes_enabled: false
  retention_period: 0s
```

---

## 📜 Phase 5: Promtail Configuration

**File: `config/promtail-config.yml`**

```yaml
clients:
  - url: http://loki:3100/loki/api/v1/push

positions:
  filename: /tmp/positions.yaml

scrape_configs:
  # Docker containers
  - job_name: docker
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
    relabel_configs:
      - source_labels: ['__meta_docker_container_name']
        target_label: container_name
      - source_labels: ['__meta_docker_container_log_stream']
        target_label: log_stream
      - source_labels: ['__meta_docker_container_label_com_docker_compose_service']
        target_label: service

  # Application logs
  - job_name: application
    static_configs:
      - targets:
          - localhost
        labels:
          job: application
          __path__: /var/log/app.log
```

---

## 🔧 Phase 6: Integration with Docker Sandbox

**File: `lib/sandbox/docker-sandbox-monitored.ts`** (extended)

```typescript
import logger from '@/lib/logging/logger'
import {
  sandboxCreationsTotal,
  sandboxCreationDuration,
  containerCpuUsage,
  containerMemoryUsage,
  activeSandboxes,
  commandExecutionDuration,
} from '@/lib/metrics/prometheus'

export class MonitoredDockerSandbox extends DockerSandbox {
  static async create(options: SandboxCreateOptions): Promise<MonitoredDockerSandbox> {
    const startTime = Date.now()
    const timer = sandboxCreationDuration.startTimer()

    try {
      const sandbox = await super.create(options)

      sandboxCreationsTotal.labels('success', options.type || 'default').inc()
      activeSandboxes.inc()

      const duration = (Date.now() - startTime) / 1000
      logger.info(
        {
          action: 'sandbox_created',
          sandboxId: sandbox.sandboxId,
          duration,
          ports: sandbox.ports,
        },
        'Sandbox created and monitored',
      )

      // Start metrics collection
      sandbox.startMetricsCollection()

      return sandbox as MonitoredDockerSandbox
    } catch (error) {
      sandboxCreationsTotal.labels('failed', options.type || 'default').inc()
      timer()
      throw error
    }
  }

  private metricsInterval?: NodeJS.Timer

  private startMetricsCollection() {
    if (!this.containerId) return

    this.metricsInterval = setInterval(async () => {
      try {
        const metrics = await this.getMetrics()

        containerCpuUsage.set({ sandbox_id: this.sandboxId }, metrics.cpu)
        containerMemoryUsage.set({ sandbox_id: this.sandboxId }, metrics.memory)

        logger.debug(
          {
            sandboxId: this.sandboxId,
            cpu: metrics.cpu,
            memory: metrics.memory,
            disk: metrics.diskUsage,
          },
          'Sandbox metrics collected',
        )
      } catch (error) {
        logger.error(
          {
            sandboxId: this.sandboxId,
            error: error instanceof Error ? error.message : String(error),
          },
          'Failed to collect metrics',
        )
      }
    }, 30000) // Collect every 30 seconds
  }

  async stop(): Promise<void> {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval)
    }

    activeSandboxes.dec()
    containerCpuUsage.remove({ sandbox_id: this.sandboxId })
    containerMemoryUsage.remove({ sandbox_id: this.sandboxId })

    await super.stop()
  }

  async runCommand(options: { cmd: string; args: string[]; cwd?: string }): Promise<CommandResult> {
    const timer = commandExecutionDuration.labels(options.cmd).startTimer()

    try {
      const result = await super.runCommand(options)
      return result
    } finally {
      timer()
    }
  }
}
```

---

## 🎯 Practical Next Steps

### Command to Start Complete Stack

```bash
# 1. Create network
docker network create coding-agent-network 2>/dev/null || true

# 2. Start database + observability
docker-compose -f docker-compose.yml \
               -f docker-compose.observability.yml \
               up -d

# 3. Check status
docker-compose -f docker-compose.yml \
               -f docker-compose.observability.yml \
               ps

# 4. Access dashboards
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001 (admin/admin)
# Jaeger: http://localhost:16686
# Loki: http://localhost:3100
```

### Check Metrics

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Query metrics
curl 'http://localhost:9090/api/v1/query?query=sandbox_creations_total'

# Check Loki
curl 'http://localhost:3100/loki/api/v1/labels'
```

---

**Next document:** Phase 2 - Secrets Management & Service Discovery  
**Status:** ✅ Ready for Implementation
