# Multi-Agent System Examples

## Basic Examples

### 1. Execute Code on Specific Agent

```typescript
// Execute code on Claude agent
const response = await fetch('http://localhost:3000/api/agents/agent-claude-1/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: 'function fibonacci(n) { /* implement */ }',
    language: 'javascript',
    timeout: 30000,
    priority: 'high',
  }),
})

const result = await response.json()
console.log('Task ID:', result.taskId)
console.log('Status:', result.status)
```

### 2. Check Agent Status

```typescript
// Get agent current status
const response = await fetch('http://localhost:3000/api/agents/agent-claude-1/status')
const data = await response.json()

console.log('Agent:', data.agent.id)
console.log('Status:', data.agent.status) // idle, busy, error
console.log('Current Task:', data.agent.currentTask)
console.log('Tasks Completed:', data.agent.tasksCompleted)
console.log('Average Response Time:', data.agent.averageResponseTime, 'ms')
```

### 3. Cancel Running Task

```typescript
// Cancel a task
const response = await fetch('http://localhost:3000/api/agents/agent-claude-1/cancel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    taskId: 'task-123',
  }),
})

const result = await response.json()
console.log('Cancelled:', result.success)
```

## Advanced Examples

### 4. Parallel Task Execution

```typescript
// Execute 5 tasks in parallel across different agents
const tasks = [
  { agent: 'agent-claude-1', code: 'Task 1', language: 'typescript' },
  { agent: 'agent-gpt-1', code: 'Task 2', language: 'python' },
  { agent: 'agent-ollama-qwen-1', code: 'Task 3', language: 'javascript' },
  { agent: 'agent-gemini-1', code: 'Task 4', language: 'java' },
  { agent: 'agent-ollama-gemma-1', code: 'Task 5', language: 'go' },
]

const results = await Promise.all(
  tasks.map((task) =>
    fetch(`http://localhost:3000/api/agents/${task.agent}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: task.code,
        language: task.language,
      }),
    }).then((r) => r.json()),
  ),
)

console.log('All tasks submitted:', results)
```

### 5. Load Balancing with Auto-Selection

```typescript
// Automatically select best available agent
async function executeWithLoadBalancing(code: string, language: string) {
  // Get all agents
  const agentsResponse = await fetch('http://localhost:3000/api/agents')
  const { agents } = await agentsResponse.json()

  // Find idle agent
  const idleAgent = agents.find((a) => a.status === 'idle')

  if (!idleAgent) {
    throw new Error('No agents available')
  }

  // Execute on idle agent
  return fetch(`http://localhost:3000/api/agents/${idleAgent.id}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language }),
  }).then((r) => r.json())
}

// Usage
const result = await executeWithLoadBalancing('console.log("Hello World")', 'javascript')
```

### 6. Cost-Optimized Task Routing

```typescript
// Route tasks based on cost and complexity
function selectOptimalAgent(task: {
  complexity: 'low' | 'medium' | 'high'
  isPrivate: boolean
  estimatedTokens: number
}) {
  // Private tasks always go to Ollama (local)
  if (task.isPrivate) {
    return 'agent-ollama-qwen-1'
  }

  // Low complexity: Use free Ollama
  if (task.complexity === 'low' || task.estimatedTokens < 1000) {
    return 'agent-ollama-qwen-1' // $0 cost
  }

  // Medium complexity: Use Gemini (cheapest cloud)
  if (task.complexity === 'medium' || task.estimatedTokens < 5000) {
    return 'agent-gemini-1' // ~$0.001 per 1K tokens
  }

  // High complexity: Use Claude (best quality)
  return 'agent-claude-1' // ~$0.015 per 1K tokens
}

// Usage
const agent = selectOptimalAgent({
  complexity: 'medium',
  isPrivate: false,
  estimatedTokens: 2000,
})

const response = await fetch(`http://localhost:3000/api/agents/${agent}/execute`, {
  method: 'POST',
  body: JSON.stringify({
    code: 'Implement binary search',
    language: 'typescript',
  }),
})
```

### 7. Task Queue with Progress Tracking

```typescript
// Queue multiple tasks and track progress
class TaskQueue {
  private tasks: Array<{ id: string; agent: string; status: string }> = []

  async addTask(agent: string, code: string, language: string) {
    const response = await fetch(`http://localhost:3000/api/agents/${agent}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language }),
    })

    const { taskId } = await response.json()
    this.tasks.push({ id: taskId, agent, status: 'pending' })
    return taskId
  }

  async trackProgress() {
    for (const task of this.tasks) {
      const response = await fetch(`http://localhost:3000/api/agents/${task.agent}/status`)
      const data = await response.json()

      if (data.agent.currentTask === task.id) {
        task.status = data.agent.status
      }
    }

    const completed = this.tasks.filter((t) => t.status === 'completed').length
    const total = this.tasks.length
    return { completed, total, percentage: (completed / total) * 100 }
  }
}

// Usage
const queue = new TaskQueue()
await queue.addTask('agent-claude-1', 'Task 1', 'typescript')
await queue.addTask('agent-gpt-1', 'Task 2', 'python')
await queue.addTask('agent-ollama-qwen-1', 'Task 3', 'javascript')

// Track progress every 2 seconds
setInterval(async () => {
  const progress = await queue.trackProgress()
  console.log(`Progress: ${progress.completed}/${progress.total} (${progress.percentage.toFixed(1)}%)`)
}, 2000)
```

### 8. Error Handling and Retry Logic

```typescript
// Execute with automatic retry on failure
async function executeWithRetry(agent: string, code: string, language: string, maxRetries = 3) {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`http://localhost:3000/api/agents/${agent}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      lastError = error as Error
      console.log(`Attempt ${i + 1} failed, retrying...`)

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000))
    }
  }

  throw new Error(`Failed after ${maxRetries} attempts: ${lastError?.message}`)
}

// Usage
try {
  const result = await executeWithRetry('agent-claude-1', 'function add(a, b) { return a + b }', 'javascript')
  console.log('Success:', result)
} catch (error) {
  console.error('All retries failed:', error)
}
```

### 9. Vision Tasks with Qwen2-VL

```typescript
// Execute vision/multimodal tasks
const imageUrl = 'https://example.com/image.jpg'

const response = await fetch('http://localhost:3000/api/agents/agent-ollama-qwen-vl-1/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: `Analyze this image and describe what you see: ${imageUrl}`,
    language: 'multimodal',
    metadata: {
      imageUrl,
      taskType: 'vision',
    },
  }),
})

const result = await response.json()
console.log('Vision analysis:', result)
```

### 10. Batch Processing with Ollama

```typescript
// Process 100 tasks using free Ollama agents
async function batchProcessWithOllama(tasks: Array<{ code: string; language: string }>) {
  const ollamaAgents = ['agent-ollama-qwen-1', 'agent-ollama-qwen-2', 'agent-ollama-gemma-1', 'agent-ollama-gemma-2']

  const results: any[] = []
  const chunkSize = ollamaAgents.length

  // Process in chunks
  for (let i = 0; i < tasks.length; i += chunkSize) {
    const chunk = tasks.slice(i, i + chunkSize)

    const chunkResults = await Promise.all(
      chunk.map((task, index) =>
        fetch(`http://localhost:3000/api/agents/${ollamaAgents[index]}/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task),
        }).then((r) => r.json()),
      ),
    )

    results.push(...chunkResults)

    console.log(`Processed ${Math.min(i + chunkSize, tasks.length)}/${tasks.length} tasks`)
  }

  return results
}

// Usage: Process 100 tasks at $0 cost
const tasks = Array.from({ length: 100 }, (_, i) => ({
  code: `Task ${i}: Generate code`,
  language: 'typescript',
}))

const results = await batchProcessWithOllama(tasks)
console.log(`Completed ${results.length} tasks with zero API costs`)
```

## Real-World Use Cases

### 11. Code Review System

```typescript
// Automated code review using Claude
async function reviewCode(pullRequestDiff: string) {
  const response = await fetch('http://localhost:3000/api/agents/agent-claude-1/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: `Review this code and provide feedback:\n\n${pullRequestDiff}`,
      language: 'typescript',
      priority: 'high',
    }),
  })

  return await response.json()
}
```

### 12. Test Generation

```typescript
// Generate unit tests using Ollama (free)
async function generateTests(sourceCode: string, framework: string) {
  const response = await fetch('http://localhost:3000/api/agents/agent-ollama-qwen-1/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: `Generate ${framework} tests for:\n\n${sourceCode}`,
      language: 'typescript',
    }),
  })

  return await response.json()
}
```

### 13. Documentation Generator

```typescript
// Generate documentation using Gemini (low cost)
async function generateDocs(codeFiles: string[]) {
  const tasks = codeFiles.map((file) =>
    fetch('http://localhost:3000/api/agents/agent-gemini-1/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: `Generate JSDoc comments for:\n\n${file}`,
        language: 'typescript',
      }),
    }).then((r) => r.json()),
  )

  return await Promise.all(tasks)
}
```

## Monitoring Examples

### 14. Check System Health

```typescript
// Check health of all agents
async function checkSystemHealth() {
  const agentsResponse = await fetch('http://localhost:3000/api/agents')
  const { agents } = await agentsResponse.json()

  const health = {
    totalAgents: agents.length,
    idle: agents.filter((a) => a.status === 'idle').length,
    busy: agents.filter((a) => a.status === 'busy').length,
    error: agents.filter((a) => a.status === 'error').length,
  }

  console.log('System Health:', health)
  return health
}
```

### 15. Cost Tracking

```typescript
// Track API costs in real-time
const costPerToken = {
  claude: 0.000015,
  gpt: 0.00003,
  gemini: 0.000001,
  ollama: 0,
}

async function calculateCosts() {
  const agentsResponse = await fetch('http://localhost:3000/api/agents')
  const { agents } = await agentsResponse.json()

  const costs = agents.map((agent) => {
    const type = agent.type as keyof typeof costPerToken
    const estimatedTokens = agent.tasksCompleted * 1000 // Estimate
    const cost = estimatedTokens * costPerToken[type]

    return {
      agent: agent.id,
      type,
      cost: cost.toFixed(4),
      tasksCompleted: agent.tasksCompleted,
    }
  })

  const totalCost = costs.reduce((sum, c) => sum + parseFloat(c.cost), 0)

  console.log('Costs by Agent:', costs)
  console.log('Total Cost:', totalCost.toFixed(2))

  return { costs, totalCost }
}
```

## Integration Examples

### 16. Express.js Integration

```typescript
import express from 'express'

const app = express()
app.use(express.json())

app.post('/generate-code', async (req, res) => {
  const { prompt, language } = req.body

  const response = await fetch('http://localhost:3000/api/agents/agent-claude-1/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: prompt,
      language,
    }),
  })

  const result = await response.json()
  res.json(result)
})

app.listen(4000, () => console.log('Server running on port 4000'))
```

### 17. Next.js Server Action

```typescript
'use server'

export async function generateCode(prompt: string, language: string) {
  const response = await fetch('http://localhost:3000/api/agents/agent-claude-1/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: prompt,
      language,
    }),
  })

  return await response.json()
}
```

### 18. React Hook

```typescript
import { useState, useEffect } from 'react'

function useAgent(agentId: string) {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchStatus = async () => {
      const response = await fetch(`http://localhost:3000/api/agents/${agentId}/status`)
      const data = await response.json()
      setStatus(data.agent)
    }

    const interval = setInterval(fetchStatus, 2000)
    fetchStatus()

    return () => clearInterval(interval)
  }, [agentId])

  const execute = async (code: string, language: string) => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:3000/api/agents/${agentId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      })
      return await response.json()
    } finally {
      setLoading(false)
    }
  }

  return { status, execute, loading }
}

// Usage in component
function CodeGenerator() {
  const { status, execute } = useAgent('agent-claude-1')

  const handleGenerate = async () => {
    const result = await execute('function hello() {}', 'javascript')
    console.log(result)
  }

  return (
    <div>
      <p>Agent Status: {status?.status}</p>
      <button onClick={handleGenerate}>Generate Code</button>
    </div>
  )
}
```

## Testing Examples

### 19. Integration Test

```typescript
import { describe, test, expect } from 'vitest'

describe('Agent API', () => {
  test('should execute code on Claude agent', async () => {
    const response = await fetch('http://localhost:3000/api/agents/agent-claude-1/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'console.log("test")',
        language: 'javascript',
      }),
    })

    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data.taskId).toBeDefined()
    expect(data.status).toBe('queued')
  })
})
```

### 20. Load Test

```typescript
import { describe, test } from 'vitest'

describe('Load Test', () => {
  test('should handle 50 concurrent requests', async () => {
    const requests = Array.from({ length: 50 }, (_, i) =>
      fetch('http://localhost:3000/api/agents/agent-ollama-qwen-1/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: `Task ${i}`,
          language: 'javascript',
        }),
      }),
    )

    const start = Date.now()
    const results = await Promise.all(requests)
    const duration = Date.now() - start

    const successful = results.filter((r) => r.ok).length

    console.log(`Completed ${successful}/50 requests in ${duration}ms`)
    expect(successful).toBeGreaterThan(45) // 90% success rate
  }, 60000)
})
```

## Tips and Best Practices

1. **Use Ollama for development/testing** - Zero API costs
2. **Route simple tasks to Gemini** - Cheapest cloud option
3. **Reserve Claude for complex tasks** - Best quality, higher cost
4. **Implement retry logic** - Handle transient failures
5. **Monitor with Grafana** - Track performance and costs
6. **Use load balancing** - Distribute tasks evenly
7. **Set appropriate timeouts** - Prevent hanging requests
8. **Cache results** - Reduce duplicate API calls
9. **Batch similar tasks** - Improve efficiency
10. **Track costs** - Monitor API usage in real-time
