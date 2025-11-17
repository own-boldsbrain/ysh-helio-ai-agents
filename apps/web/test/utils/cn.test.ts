import { describe, it, expect } from 'vitest'
import { cn } from '../../lib/utils'

// Note: clsx and twMerge are external libraries we're just testing our wrapper
describe('Utility Functions', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('bg-red-500', 'text-white', 'p-4')
      expect(result).toBe('bg-red-500 text-white p-4')
    })

    it('should handle conflicting classes by taking the last one', () => {
      const result = cn('bg-red-500', 'bg-blue-500')
      expect(result).toBe('bg-blue-500') // twMerge takes the last conflicting class
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const isDisabled = false
      const result = cn('base-class', isActive && 'active', isDisabled && 'disabled', 'final-class')
      expect(result).toBe('base-class active final-class')
    })

    it('should handle null and undefined values', () => {
      const result = cn('class1', null, 'class2', undefined, 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    it('should handle empty strings', () => {
      const result = cn('class1', '', 'class2')
      expect(result).toBe('class1 class2')
    })
  })
})
