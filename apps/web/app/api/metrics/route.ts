import { NextResponse } from 'next/server'

// Simple in-memory metrics storage
// In production, you'd want to use a more robust solution like Prometheus client
let requestCount = 0
let errorCount = 0

// Increment request counter for every request
export async function GET() {
  requestCount++

  const metrics = [
    `# HELP app_requests_total Total number of requests`,
    `# TYPE app_requests_total counter`,
    `app_requests_total ${requestCount}`,
    '',
    `# HELP app_errors_total Total number of errors`,
    `# TYPE app_errors_total counter`,
    `app_errors_total ${errorCount}`,
    '',
    `# HELP app_uptime_seconds Application uptime in seconds`,
    `# TYPE app_uptime_seconds gauge`,
    `app_uptime_seconds ${process.uptime()}`,
    '',
    `# HELP app_memory_heap_bytes Heap memory usage in bytes`,
    `# TYPE app_memory_heap_bytes gauge`,
    `app_memory_heap_bytes ${process.memoryUsage().heapUsed}`,
    '',
    `# HELP app_memory_heap_max_bytes Maximum heap memory size in bytes`,
    `# TYPE app_memory_heap_max_bytes gauge`,
    `app_memory_heap_max_bytes ${process.memoryUsage().heapTotal}`,
    '',
    `# HELP app_nodejs_version_info Node.js version info`,
    `# TYPE app_nodejs_version_info gauge`,
    `app_nodejs_version_info{version="${process.version}"} 1`,
  ]

  return new Response(metrics.join('\n'), {
    headers: { 'Content-Type': 'text/plain; version=0.0.4; charset=utf-8' },
  })
}

// Export a simple error counter function that can be used elsewhere
export function incrementErrorCount() {
  errorCount++
}
