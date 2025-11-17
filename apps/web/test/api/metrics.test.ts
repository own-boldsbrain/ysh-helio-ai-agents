import { describe, it, expect } from 'vitest'
import { GET as metrics } from '@/app/api/metrics/route'

describe('Metrics API', () => {
  it('should return metrics in Prometheus format', async () => {
    // The metrics route handler accepts no arguments, call it directly
    const response = await metrics()

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toContain('text/plain')

    const body = await response.text()
    expect(body).toContain('app_requests_total')
    expect(body).toContain('app_errors_total')
    expect(body).toContain('app_uptime_seconds')
    expect(body).toContain('app_memory_heap_bytes')
  })
})
