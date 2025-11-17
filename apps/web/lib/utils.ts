import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export CLIENT-SAFE utilities only
export * from './utils/get-base-url'
export * from './utils/is-relative-url'
export * from './utils/cookies'
export * from './utils/format-number'
export * from './utils/id'
export * from './utils/logging'
// NOTE: rate-limit is SERVER-ONLY - import from '@/lib/utils/rate-limit' directly in API routes
// NOTE: task-logger is SERVER-ONLY - import from '@/lib/utils/task-logger' directly in API routes
export * from './utils/title-generator'
export * from './utils/branch-name-generator'
export * from './utils/commit-message-generator'
