import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getEnv, env } from '@repo/lib/src/env'

// Save original environment
const originalEnv = process.env

describe('Environment Validation', () => {
  beforeEach(() => {
    // Reset environment for each test
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    // Restore original environment after each test
    process.env = originalEnv
  })

  it('should validate required environment variables', () => {
    // Set required environment variables
    process.env.DATABASE_URL = 'postgresql://localhost:5432/test'
    process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID = 'test-client-id'

    // Should not throw an error with required variables
    expect(() => getEnv()).not.toThrow()

    const environment = getEnv()
    expect(environment.DATABASE_URL).toBe('postgresql://localhost:5432/test')
    expect(environment.NEXT_PUBLIC_GITHUB_CLIENT_ID).toBe('test-client-id')
    expect(environment.NODE_ENV).toBe('development') // Default value
  })

  it('should use default values for optional variables', () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/test'
    process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID = 'test-client-id'
    delete process.env.NODE_ENV

    const environment = getEnv()
    expect(environment.NODE_ENV).toBe('development') // Default value
  })

  it('should throw error when required variable is missing', () => {
    delete process.env.DATABASE_URL
    process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID = 'test-client-id'

    expect(() => getEnv()).toThrow('Invalid environment configuration')
  })
})
