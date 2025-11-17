# Multi-Agent System Tutorial

## Table of Contents

1. [Quick Start](#quick-start)
2. [Understanding the Architecture](#understanding-the-architecture)
3. [Your First Task](#your-first-task)
4. [Advanced Usage](#advanced-usage)
5. [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites

- Docker Desktop or Docker Engine (28+)
- 16GB RAM minimum (32GB recommended)
- 100GB free disk space (for Ollama models)
- Node.js 18+ and pnpm (for local development)

### Step 1: Clone and Setup

```bash
git clone https://github.com/own-boldsbrain/ysh-helio-ai-agents.git
cd ysh-helio-ai-agents

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your API keys
nano .env.local
```

### Step 2: Initialize Secrets (Production)

```bash
# For production deployment with Docker secrets
./scripts/init-secrets.sh
```

### Step 3: Start the System

```bash
# Start all services
docker-compose -f docker-compose.multi-agent.yml up -d

# Watch logs
docker-compose -f docker-compose.multi-agent.yml logs -f
```

### Step 4: Wait for Ollama Models

The first startup will download ~25GB of Ollama models (10-30 minutes):

```bash
# Check download progress
docker logs -f coding-agent-ollama
```

### Step 5: Access Services

- **Application**: http://localhost:3000
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **RabbitMQ**: http://localhost:15672 (admin/admin123)

## Understanding the Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Nginx (Load Balancer)                 │
│                    Port 80/443 - Port 3000                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
    ┌───────▼──────┐ ┌─────▼─────┐ ┌──────▼──────┐
    │  PostgreSQL  │ │   Redis   │ │  RabbitMQ   │
    │   Database   │ │   Cache   │ │   Queue     │
    └──────────────┘ └───────────┘ └─────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
    ┌───────▼──────┐ ┌─────▼─────┐ ┌──────▼──────┐
    │ Claude Agents│ │ GPT Agents│ │Gemini Agents│
    │   (4 pods)   │ │  (2 pods) │ │  (2 pods)   │
    └──────────────┘ └───────────┘ └─────────────┘
            │               │               │
    ┌───────▼──────────────▼───────────────▼──────┐
    │         Ollama Server (Local AI)             │
    │  Qwen2.5-Coder | Qwen2-VL | Gemma2          │
    └──────────────────┬──────────────────────────┘
                       │
            ┌──────────┼──────────┐
            │          │          │
    ┌───────▼──┐ ┌────▼────┐ ┌───▼──────┐
    │  Qwen    │ │ Qwen-VL │ │  Gemma2  │
    │  Agents  │ │  Agents │ │  Agents  │
    │ (2 pods) │ │(2 pods) │ │ (2 pods) │
    └──────────┘ └─────────┘ └──────────┘
                       │
            ┌──────────┴──────────┐
            │                     │
    ┌───────▼──────┐      ┌──────▼──────┐
    │  Prometheus  │      │   Grafana   │
    │  (Metrics)   │      │ (Dashboards)│
    └──────────────┘      └─────────────┘
```

### Agent Types

1. **Claude Agents** (4 instances)
   - Best for: Complex reasoning, code generation
   - Cost: ~$0.015 per 1K tokens
   - Speed: ~2-3s response time

2. **GPT-4 Agents** (2 instances)
   - Best for: General purpose, chat
   - Cost: ~$0.03 per 1K tokens
   - Speed: ~2-4s response time

3. **Gemini Agents** (2 instances)
   - Best for: Fast responses, simple tasks
   - Cost: ~$0.001 per 1K tokens
   - Speed: ~1-2s response time

4. **Ollama Agents** (8 instances total)
   - **Qwen2.5-Coder** (2 instances): Code generation, zero cost
   - **Qwen2-VL** (2 instances): Vision/multimodal, zero cost
   - **Gemma2** (2 instances): General purpose, zero cost
   - Speed: ~3-5s response time
   - **100% Local, 100% Private, $0 API costs**

## Your First Task

### Example 1: Simple Code Generation

```typescript
// app/api/example/route.ts
export async function POST(request: Request) {
  const { code, language } = await request.json()

  // Send to agent
  const response = await fetch('http://localhost:3000/api/agents/agent-claude-1/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: 'Write a function to sort an array',
      language: 'typescript',
    }),
  })

  const result = await response.json()
  return Response.json(result)
}
```

### Example 2: Using Ollama (Zero Cost)

```typescript
// For local, private code generation
const response = await fetch('http://localhost:3000/api/agents/agent-ollama-qwen-1/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: 'Create a React component for a todo list',
    language: 'typescript',
  }),
})
```

### Example 3: Load Balancing Multiple Tasks

```typescript
// Distribute 10 tasks across available agents
const tasks = Array.from({ length: 10 }, (_, i) => ({
  code: `Task ${i}: Generate function`,
  language: 'typescript',
}))

// Parallel execution
const results = await Promise.all(
  tasks.map((task) =>
    fetch('http://localhost:3000/api/agents', {
      method: 'GET', // Will auto-select available agent
    })
      .then((r) => r.json())
      .then((data) => {
        const agent = data.agents.find((a) => a.status === 'idle')
        return fetch(`http://localhost:3000/api/agents/${agent.id}/execute`, {
          method: 'POST',
          body: JSON.stringify(task),
        })
      }),
  ),
)
```

## Advanced Usage

### Custom Agent Selection

```typescript
// Choose agent based on task requirements
function selectAgent(task: Task): string {
  if (task.complexity === 'high') {
    return 'agent-claude-1' // Best reasoning
  } else if (task.requiresSpeed) {
    return 'agent-gemini-1' // Fastest
  } else if (task.isPrivate) {
    return 'agent-ollama-qwen-1' // Local, private
  }
  return 'agent-gpt-1' // Default
}
```

### Monitoring Task Progress

```typescript
// Poll for task status
async function waitForTask(agentId: string, taskId: string) {
  while (true) {
    const response = await fetch(`http://localhost:3000/api/agents/${agentId}/status`)
    const data = await response.json()

    if (data.agent.currentTask === taskId) {
      if (data.agent.status === 'completed') {
        return data.result
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
}
```

### Cost Optimization Strategy

```typescript
// Route tasks to minimize costs
function routeTask(task: Task): string {
  // Use free Ollama for simple tasks
  if (task.estimatedTokens < 1000) {
    return 'agent-ollama-qwen-1' // $0 cost
  }

  // Use Gemini for medium tasks
  if (task.estimatedTokens < 5000) {
    return 'agent-gemini-1' // ~$0.005
  }

  // Use Claude for complex tasks
  return 'agent-claude-1' // Best quality
}
```

## Troubleshooting

### Issue: Ollama models not downloading

**Solution:**

```bash
# Check Ollama container logs
docker logs coding-agent-ollama

# Manually pull models
docker exec coding-agent-ollama ollama pull qwen2.5-coder
docker exec coding-agent-ollama ollama pull qwen2-vl
docker exec coding-agent-ollama ollama pull gemma2
```

### Issue: Agents not responding

**Solution:**

```bash
# Check agent health
docker-compose -f docker-compose.multi-agent.yml ps

# Restart specific agent
docker-compose -f docker-compose.multi-agent.yml restart agent-claude-1

# Check RabbitMQ queue
open http://localhost:15672
```

### Issue: High memory usage

**Solution:**

```bash
# Adjust agent limits in docker-compose.multi-agent.yml
# Reduce number of agents or increase system RAM
# Monitor with Grafana: http://localhost:3001
```

### Issue: Database connection errors

**Solution:**

```bash
# Check PostgreSQL status
docker exec coding-agent-postgres pg_isready

# View logs
docker logs coding-agent-postgres

# Reconnect
docker-compose -f docker-compose.multi-agent.yml restart postgres
```

## Next Steps

1. **Explore Grafana Dashboards**: http://localhost:3001
   - Multi-Agent Performance
   - Cost Analysis
   - Agent-specific metrics

2. **Read Advanced Documentation**:
   - [OLLAMA_INTEGRATION.md](../OLLAMA_INTEGRATION.md) - Deep dive into local AI
   - [MULTI_AGENT_DOCKER.md](MULTI_AGENT_DOCKER.md) - Docker optimization
   - [ROADMAP.md](../ROADMAP.md) - Future features

3. **Join the Community**:
   - Open issues for bugs
   - Submit PRs for improvements
   - Star the repo if you find it useful!

## Support

For issues and questions:

- GitHub Issues: https://github.com/own-boldsbrain/ysh-helio-ai-agents/issues
- Documentation: Check the `docs/` folder
- Examples: See `tests/integration/` for code examples
