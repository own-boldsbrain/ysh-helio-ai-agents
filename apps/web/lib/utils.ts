import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export utilities
export * from './utils/get-base-url'
export * from './utils/is-relative-url'
export * from './utils/cookies'
export * from './utils/format-number'
export * from './utils/id'
export * from './utils/logging'
export * from './utils/rate-limit'
export * from './utils/task-logger'
export * from './utils/title-generator'
export * from './utils/branch-name-generator'
export * from './utils/commit-message-generator'
