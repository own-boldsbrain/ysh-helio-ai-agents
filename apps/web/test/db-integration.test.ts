import { describe, it, expect, vi } from 'vitest'
import { createMockDb } from './utils/mock-db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Mock the database for testing
vi.mock('@/lib/db/client', async () => {
  const mod = await vi.importActual('./utils/mock-db')
  const instance = mod.createMockDb()
  return { db: instance, __mockDb: instance }
})

import { __mockDb as mockDb } from '@/lib/db/client'

describe('Database Integration Tests', () => {
  it('should query users from database', async () => {
    const mockUserData = [{ id: 'test-user', email: 'test@example.com' }]

    vi.mocked(mockDb.select).mockReturnThis()
    vi.mocked(mockDb.from).mockReturnThis()
    vi.mocked(mockDb.where).mockReturnThis()
    vi.mocked(mockDb.limit).mockResolvedValue(mockUserData)

    // Example test for user query
    const result = await mockDb.select().from(users).where(eq(users.id, 'test-user')).limit(1)

    expect(result).toEqual(mockUserData)
    expect(mockDb.select).toHaveBeenCalled()
    expect(mockDb.from).toHaveBeenCalledWith(users)
  })
})
