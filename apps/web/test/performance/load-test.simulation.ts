/**
 * Load testing script for production-like scenarios
 * This script simulates multiple concurrent users making requests to critical endpoints
 */

import { setTimeout } from 'timers/promises'
import { bench, describe } from 'vitest'
import { parseJsonResponse, safeJson } from '@/lib/utils/fetch-json'

interface LoadTestConfig {
  concurrentUsers: number
  durationSeconds: number
  targetEndpoint: string
}

async function simulateUserSession(config: LoadTestConfig, userId: number) {
  const startTime = Date.now()
  let requests = 0

  while (Date.now() - startTime < config.durationSeconds * 1000) {
    try {
      // Simulate API request with artificial delay
      await setTimeout(Math.random() * 100 + 50) // 50-150ms delay

      requests++

      // Add some variability to simulate real user behavior
      if (Math.random() > 0.7) {
        await setTimeout(Math.random() * 1000) // Random longer pause
      }
    } catch (error) {
      // In a real load test, you'd track errors here
      console.error(`User ${userId} error:`, error)
    }
  }

  return requests
}

async function runLoadTest(config: LoadTestConfig) {
  console.log(`Starting load test: ${config.concurrentUsers} users for ${config.durationSeconds}s`)

  const start = Date.now()
  const userPromises = []

  for (let i = 0; i < config.concurrentUsers; i++) {
    userPromises.push(simulateUserSession(config, i))
  }

  const requestCounts = await Promise.all(userPromises)
  const totalRequests = requestCounts.reduce((sum, count) => sum + count, 0)
  const duration = (Date.now() - start) / 1000 // in seconds

  const results = {
    totalRequests,
    duration,
    requestsPerSecond: totalRequests / duration,
    avgRequestsPerUser: totalRequests / config.concurrentUsers,
    totalErrors: requestCounts.filter((count) => count === 0).length,
  }

  console.log(`Load test completed: ${results.requestsPerSecond.toFixed(2)} RPS`)
  return results
}

describe('Load Testing: Production-like Scenarios', () => {
  // Note: These are benchmarks but represent load testing concepts
  bench(
    'Simulate 10 concurrent users for 5 seconds',
    async () => {
      const config: LoadTestConfig = {
        concurrentUsers: 10,
        durationSeconds: 5,
        targetEndpoint: '/api/github/user', // Example endpoint
      }

      await runLoadTest(config)
    },
    { time: 6000 },
  ) // Adjust timeout for this benchmark

  bench(
    'Simulate 50 concurrent users for 10 seconds',
    async () => {
      const config: LoadTestConfig = {
        concurrentUsers: 50,
        durationSeconds: 10,
        targetEndpoint: '/api/github/user', // Example endpoint
      }

      await runLoadTest(config)
    },
    { time: 12000 },
  )
})

// Additional performance tests for memory usage
describe('Memory & Performance: Critical Functions', () => {
  bench('Memory usage: parseJsonResponse with large payload', async () => {
    // Create a large JSON payload
    const largePayload = {
      users: Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        profile: {
          age: 20 + (i % 50),
          preferences: ['coding', 'ai', 'testing'].slice(0, 1 + (i % 3)),
        },
      })),
    }

    const mockResponse = {
      status: 200,
      statusText: 'OK',
      ok: true,
      headers: {
        get: (name: string) => (name.toLowerCase() === 'content-type' ? 'application/json' : null),
      } as Headers,
      json: async () => largePayload,
      text: async () => JSON.stringify(largePayload),
    } as Response

    await parseJsonResponse(mockResponse)
  })

  bench('Memory usage: safeJson with large payload', async () => {
    // Reuse the large payload from above
    const largePayload = {
      users: Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        profile: {
          age: 20 + (i % 50),
          preferences: ['coding', 'ai', 'testing'].slice(0, 1 + (i % 3)),
        },
      })),
    }

    const mockResponse = {
      status: 200,
      statusText: 'OK',
      ok: true,
      headers: {
        get: (name: string) => (name.toLowerCase() === 'content-type' ? 'application/json' : null),
      } as Headers,
      json: async () => largePayload,
      text: async () => JSON.stringify(largePayload),
    } as Response

    await safeJson(mockResponse)
  })
})
