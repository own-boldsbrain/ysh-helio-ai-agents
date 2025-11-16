# Application Metrics Endpoint

This document explains how to implement Prometheus metrics in the Next.js application.

## Implementation

### 1. Install Prometheus Client

```bash
pnpm add prom-client
```

### 2. Create Metrics Registry

Create `lib/metrics/registry.ts`:

```typescript
import { Registry, Counter, Histogram, Gauge } from 'prom-client'

// Create a Registry
export const register = new Registry()

// Agent task metrics
export const agentTasksStarted = new Counter({
  name: 'agent_tasks_started_total',
  help: 'Total number of tasks started',
  labelNames: ['agent_id', 'agent_type', 'provider'],
  registers: [register],
})

export const agentTasksCompleted = new Counter({
  name: 'agent_tasks_completed_total',
  help: 'Total number of tasks completed',
  labelNames: ['agent_id', 'agent_type', 'provider', 'status'],
  registers: [register],
})

export const agentResponseTime = new Histogram({
  name: 'agent_response_time_seconds',
  help: 'Agent response time in seconds',
  labelNames: ['agent_id', 'agent_type', 'provider'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
  registers: [register],
})

export const agentErrors = new Counter({
  name: 'agent_errors_total',
  help: 'Total number of agent errors',
  labelNames: ['agent_id', 'agent_type', 'provider', 'error_type'],
  registers: [register],
})

export const agentCost = new Counter({
  name: 'agent_cost_total',
  help: 'Total API cost in USD',
  labelNames: ['agent_id', 'provider', 'type'],
  registers: [register],
})

export const agentStatus = new Gauge({
  name: 'agent_status',
  help: 'Agent status (0=idle, 1=busy, 2=error)',
  labelNames: ['agent_id', 'agent_type', 'provider'],
  registers: [register],
})

export const queueSize = new Gauge({
  name: 'agent_queue_size',
  help: 'Number of tasks in queue',
  labelNames: ['queue_name'],
  registers: [register],
})
```

### 3. Create Metrics Endpoint

Create `app/api/metrics/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { register } from '@/lib/metrics/registry'

export async function GET() {
  const metrics = await register.metrics()

  return new NextResponse(metrics, {
    headers: {
      'Content-Type': register.contentType,
    },
  })
}
```

### 4. Instrument Agent Execution

Update `app/api/agents/[id]/execute/route.ts`:

```typescript
import {
  agentTasksStarted,
  agentTasksCompleted,
  agentResponseTime,
  agentErrors,
  agentCost,
} from '@/lib/metrics/registry'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const agentId = params.id
  const agentType = agentId.split('-')[1] // claude, gpt, ollama, etc.
  const provider = agentId.includes('ollama') ? 'ollama' : agentType

  // Record task start
  agentTasksStarted.inc({
    agent_id: agentId,
    agent_type: agentType,
    provider: provider,
  })

  const startTime = Date.now()

  try {
    // Execute task
    const result = await executeTask(agentId, code)

    // Record completion
    const duration = (Date.now() - startTime) / 1000

    agentResponseTime.observe({ agent_id: agentId, agent_type: agentType, provider: provider }, duration)

    agentTasksCompleted.inc({
      agent_id: agentId,
      agent_type: agentType,
      provider: provider,
      status: 'success',
    })

    // Record cost (only for cloud agents)
    if (provider !== 'ollama') {
      const cost = calculateCost(agentType, result.tokensUsed)
      agentCost.inc({ agent_id: agentId, provider: provider, type: 'cloud' }, cost)
    } else {
      // Ollama is free
      agentCost.inc({ agent_id: agentId, provider: 'ollama', type: 'local' }, 0)
    }

    return NextResponse.json(result)
  } catch (error) {
    // Record error
    agentErrors.inc({
      agent_id: agentId,
      agent_type: agentType,
      provider: provider,
      error_type: error.name,
    })

    agentTasksCompleted.inc({
      agent_id: agentId,
      agent_type: agentType,
      provider: provider,
      status: 'error',
    })

    throw error
  }
}

function calculateCost(agentType: string, tokens: number): number {
  const costPer1K = {
    claude: 0.015,
    gpt: 0.03,
    gemini: 0.001,
    groq: 0.0001,
    ollama: 0,
  }

  return (tokens / 1000) * (costPer1K[agentType] || 0)
}
```

### 5. Update Agent Status

Create a background job to update agent status metrics:

```typescript
// lib/metrics/agent-status-updater.ts
import { agentStatus, queueSize } from './registry'

// Run every 10 seconds
setInterval(async () => {
  // Fetch agent statuses from Redis/DB
  const agents = await getAgentStatuses()

  agents.forEach((agent) => {
    const statusValue = agent.status === 'idle' ? 0 : agent.status === 'busy' ? 1 : 2

    agentStatus.set(
      {
        agent_id: agent.id,
        agent_type: agent.type,
        provider: agent.provider,
      },
      statusValue,
    )
  })

  // Update queue size
  const queueStats = await getQueueStats()
  queueSize.set({ queue_name: 'agent_tasks' }, queueStats.pending)
}, 10000)
```

## Testing Metrics

### Test metrics endpoint:

```bash
curl http://localhost:3000/api/metrics
```

### Expected output:

```
# HELP agent_tasks_started_total Total number of tasks started
# TYPE agent_tasks_started_total counter
agent_tasks_started_total{agent_id="agent-claude-1",agent_type="claude",provider="claude"} 42

# HELP agent_tasks_completed_total Total number of tasks completed
# TYPE agent_tasks_completed_total counter
agent_tasks_completed_total{agent_id="agent-claude-1",agent_type="claude",provider="claude",status="success"} 40
agent_tasks_completed_total{agent_id="agent-claude-1",agent_type="claude",provider="claude",status="error"} 2

# HELP agent_response_time_seconds Agent response time in seconds
# TYPE agent_response_time_seconds histogram
agent_response_time_seconds_bucket{le="0.1",agent_id="agent-claude-1",agent_type="claude",provider="claude"} 0
agent_response_time_seconds_bucket{le="0.5",agent_id="agent-claude-1",agent_type="claude",provider="claude"} 5
agent_response_time_seconds_bucket{le="1",agent_id="agent-claude-1",agent_type="claude",provider="claude"} 15
...
```

## Grafana Integration

The metrics will automatically appear in Grafana dashboards:

1. **Multi-Agent Performance**: Overall system metrics
2. **Cost Analysis**: Cloud vs Local costs
3. **Agent Performance**: Per-agent metrics

## Cost Tracking

Track your savings with Ollama:

- Cloud agents: Actual API costs recorded
- Ollama agents: $0 recorded
- Dashboard shows cost comparison and savings

## Alerting

Prometheus alerts are configured in `config/prometheus/rules/alerts.yml`:

- Agent down
- High response time
- High error rate
- Cost thresholds
- Queue backlogs

## Next Steps

1. Install `prom-client`: `pnpm add prom-client`
2. Create metrics registry
3. Implement metrics endpoint
4. Instrument agent execution
5. Test with `curl http://localhost:3000/api/metrics`
6. View in Grafana: http://localhost:3001
