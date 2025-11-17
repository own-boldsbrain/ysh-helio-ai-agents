import { describe, it, expect } from 'vitest'
import { GET as healthCheck } from '@/app/api/health/route'

describe('Health Check API', () => {
  it('should return 200 status with health information', async () => {
    // The API handler expects no arguments for GET, call the function directly
    const response = await healthCheck()

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('status')
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('uptime')
    expect(data).toHaveProperty('environment')
    expect(data).toHaveProperty('version')
    expect(data).toHaveProperty('dependencies')
    expect(data.status).toBe('healthy')
  })
})
