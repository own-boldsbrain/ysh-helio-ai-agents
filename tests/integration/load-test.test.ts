import { describe, it, expect } from 'vitest'

describe('Load Testing Scenarios', () => {
  const LOAD_TEST_DURATION = 60000 // 1 minute
  const CONCURRENT_USERS = 50

  it(
    'should handle sustained load',
    async () => {
      const startTime = Date.now()
      const requests: Promise<Response>[] = []

      while (Date.now() - startTime < LOAD_TEST_DURATION) {
        // Simulate concurrent users
        for (let i = 0; i < CONCURRENT_USERS; i++) {
          requests.push(
            fetch('http://localhost:3000/api/agents', {
              method: 'GET',
            }),
          )
        }

        // Wait a bit before next batch
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Check some responses
        if (requests.length >= 100) {
          const batch = requests.splice(0, 100)
          const responses = await Promise.all(batch)
          const successRate = responses.filter((r) => r.status === 200).length / responses.length

          expect(successRate).toBeGreaterThan(0.95) // 95% success rate
        }
      }

      // Wait for remaining requests
      const responses = await Promise.all(requests)
      const successRate = responses.filter((r) => r.status === 200).length / responses.length

      expect(successRate).toBeGreaterThan(0.95)
    },
    LOAD_TEST_DURATION + 10000,
  )

  it('should maintain response times under load', async () => {
    const responseTimes: number[] = []

    for (let i = 0; i < 100; i++) {
      const startTime = Date.now()
      await fetch('http://localhost:3000/api/agents/agent-claude-1/status')
      const duration = Date.now() - startTime

      responseTimes.push(duration)
    }

    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    const p95ResponseTime = responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length * 0.95)]

    expect(avgResponseTime).toBeLessThan(500) // Average < 500ms
    expect(p95ResponseTime).toBeLessThan(1000) // P95 < 1s
  })
})
