import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'unknown',
      version: process.env.npm_package_version || '0.0.0',
      dependencies: {
        database: 'not checked', // We could add actual DB connection check later
      },
    }

    return NextResponse.json(health, { status: 200 })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Service unavailable',
      },
      { status: 503 },
    )
  }
}
