import { vi } from 'vitest'

export type MockFn = ReturnType<typeof vi.fn>

export interface MockDb {
  select: MockFn
  from: MockFn
  where: MockFn
  limit: MockFn
  orderBy: MockFn
  insert: MockFn
  update: MockFn
}

export function createMockDb(): MockDb {
  const mockFn = vi.fn()
  return {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn(),
    orderBy: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
  }
}

export const defaultMockDb = createMockDb()
