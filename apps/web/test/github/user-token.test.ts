import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { eq, and } from 'drizzle-orm'
import { getUserGitHubToken } from '../../lib/github/user-token'
import { decrypt } from '../../lib/crypto'
import { db } from '../../lib/db/client'
import { users, accounts } from '../../lib/db/schema'
import { getServerSession } from '../../lib/session/get-server-session'
import { getSessionFromReq } from '../../lib/session/server'

// Mock the dependencies
vi.mock('@/lib/crypto', () => ({
  decrypt: vi.fn(),
}))

vi.mock('@/lib/db/client', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn(() => Promise.resolve([])),
  },
}))

vi.mock('@/lib/session/get-server-session', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/session/server', () => ({
  getSessionFromReq: vi.fn(),
}))

vi.mock('drizzle-orm', async () => {
  const actual = await vi.importActual('drizzle-orm')
  return {
    ...actual,
    eq: vi.fn(),
    and: vi.fn(),
  }
})

describe('GitHub User Token', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return null when no session exists', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const result = await getUserGitHubToken()

    expect(result).toBeNull()
    expect(db.select).not.toHaveBeenCalled()
  })

  it('should return null when session user id does not exist', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: {} as any })

    const result = await getUserGitHubToken()

    expect(result).toBeNull()
    expect(db.select).not.toHaveBeenCalled()
  })

  it('should return GitHub token from connected account', async () => {
    const mockSession = { user: { id: 'user-123' } }
    const mockAccessToken = 'encrypted-token'
    const decryptedToken = 'decrypted-github-token'

    vi.mocked(getServerSession).mockResolvedValue(mockSession)
    vi.mocked(db.select).mockReturnThis()
    vi.mocked(db.from).mockReturnThis()
    vi.mocked(db.where).mockReturnThis()
    vi.mocked(db.limit).mockResolvedValue([{ accessToken: mockAccessToken }])
    vi.mocked(decrypt).mockReturnValue(decryptedToken)
    vi.mocked(eq).mockImplementation(() => 'eq-condition' as any)
    vi.mocked(and).mockImplementation(() => 'and-condition' as any)

    const result = await getUserGitHubToken()

    expect(db.select).toHaveBeenCalled()
    expect(db.where).toHaveBeenCalledWith('and-condition')
    expect(decrypt).toHaveBeenCalledWith(mockAccessToken)
    expect(result).toBe(decryptedToken)
  })

  it('should return GitHub token from primary user account as fallback', async () => {
    const mockSession = { user: { id: 'user-123' } }
    const mockUserToken = 'encrypted-user-token'
    const decryptedToken = 'decrypted-user-token'

    // First call (for accounts) returns empty array
    // Second call (for users) returns token
    let callCount = 0
    vi.mocked(db.limit).mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve([]) // No connected account found
      }
      return Promise.resolve([{ accessToken: mockUserToken }]) // User primary account found
    })

    vi.mocked(getServerSession).mockResolvedValue(mockSession)
    vi.mocked(db.select).mockReturnThis()
    vi.mocked(db.from).mockReturnThis()
    vi.mocked(db.where).mockReturnThis()
    vi.mocked(decrypt).mockReturnValue(decryptedToken)
    vi.mocked(eq).mockImplementation(() => 'eq-condition' as any)
    vi.mocked(and).mockImplementation(() => 'and-condition' as any)

    const result = await getUserGitHubToken()

    expect(decrypt).toHaveBeenCalledWith(mockUserToken)
    expect(result).toBe(decryptedToken)
  })

  it('should return null when no GitHub account is connected', async () => {
    const mockSession = { user: { id: 'user-123' } }

    vi.mocked(getServerSession).mockResolvedValue(mockSession)
    vi.mocked(db.select).mockReturnThis()
    vi.mocked(db.from).mockReturnThis()
    vi.mocked(db.where).mockReturnThis()
    vi.mocked(db.limit).mockResolvedValue([])
    vi.mocked(eq).mockImplementation(() => 'eq-condition' as any)
    vi.mocked(and).mockImplementation(() => 'and-condition' as any)

    const result = await getUserGitHubToken()

    expect(result).toBeNull()
  })

  it('should return null when database query throws an error', async () => {
    const mockSession = { user: { id: 'user-123' } }

    vi.mocked(getServerSession).mockResolvedValue(mockSession)
    vi.mocked(db.select).mockReturnThis()
    vi.mocked(db.from).mockImplementation(() => {
      throw new Error('Database error')
    })

    const result = await getUserGitHubToken()

    expect(result).toBeNull()
  })

  it('should use request session when provided', async () => {
    const mockReq = { headers: new Headers() } as Request
    const mockSession = { user: { id: 'user-123' } }
    const mockAccessToken = 'encrypted-token'
    const decryptedToken = 'decrypted-github-token'

    vi.mocked(getSessionFromReq).mockResolvedValue(mockSession)
    vi.mocked(db.select).mockReturnThis()
    vi.mocked(db.from).mockReturnThis()
    vi.mocked(db.where).mockReturnThis()
    vi.mocked(db.limit).mockResolvedValue([{ accessToken: mockAccessToken }])
    vi.mocked(decrypt).mockReturnValue(decryptedToken)
    vi.mocked(eq).mockImplementation(() => 'eq-condition' as any)
    vi.mocked(and).mockImplementation(() => 'and-condition' as any)

    const result = await getUserGitHubToken(mockReq)

    expect(getSessionFromReq).toHaveBeenCalledWith(mockReq)
    expect(result).toBe(decryptedToken)
  })
})
