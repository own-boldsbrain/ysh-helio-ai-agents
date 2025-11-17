import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { getServerSession } from '../../lib/session/get-server-session'
import { SESSION_COOKIE_NAME } from '../../lib/session/constants'
import { getSessionFromCookie } from '../../lib/session/server'

// Since cache is a React function, we need to mock it
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    cache: vi.fn((fn) => fn), // Simplified mock for testing
  }
})

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

vi.mock('@/lib/session/constants', () => ({
  SESSION_COOKIE_NAME: 'session',
}))

vi.mock('@/lib/session/server', () => ({
  getSessionFromCookie: vi.fn(),
}))

describe('Server Session', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should return session when cookie exists', async () => {
    const mockCookieStore = {
      get: vi.fn(() => ({ value: 'session-value' })),
    }
    const mockSession = { user: { id: 'user-123' } }

    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any)
    vi.mocked(getSessionFromCookie).mockResolvedValue(mockSession)

    const result = await getServerSession()

    expect(cookies).toHaveBeenCalled()
    expect(mockCookieStore.get).toHaveBeenCalledWith(SESSION_COOKIE_NAME)
    expect(getSessionFromCookie).toHaveBeenCalledWith('session-value')
    expect(result).toBe(mockSession)
  })

  it('should return null when cookie does not exist', async () => {
    const mockCookieStore = {
      get: vi.fn(() => undefined),
    }

    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any)
    vi.mocked(getSessionFromCookie).mockResolvedValue(null)

    const result = await getServerSession()

    expect(cookies).toHaveBeenCalled()
    expect(mockCookieStore.get).toHaveBeenCalledWith(SESSION_COOKIE_NAME)
    expect(getSessionFromCookie).toHaveBeenCalledWith(undefined)
    expect(result).toBeNull()
  })

  it('should return null when session parsing fails', async () => {
    const mockCookieStore = {
      get: vi.fn(() => ({ value: 'invalid-session' })),
    }

    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any)
    vi.mocked(getSessionFromCookie).mockResolvedValue(null)

    const result = await getServerSession()

    expect(cookies).toHaveBeenCalled()
    expect(mockCookieStore.get).toHaveBeenCalledWith(SESSION_COOKIE_NAME)
    expect(getSessionFromCookie).toHaveBeenCalledWith('invalid-session')
    expect(result).toBeNull()
  })
})
