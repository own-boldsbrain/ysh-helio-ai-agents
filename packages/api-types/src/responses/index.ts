import type { User, Sandbox, Task } from '../entities'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
  timestamp: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export type UserResponse = ApiResponse<User>
export type SandboxResponse = ApiResponse<Sandbox>
export type TaskResponse = ApiResponse<Task>
