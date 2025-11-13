import { describe, it, expect } from 'vitest'

describe('Utility Functions', () => {
  describe('Math utilities', () => {
    it('adds two numbers correctly', () => {
      expect(1 + 1).toBe(2)
    })

    it('multiplies numbers correctly', () => {
      expect(5 * 3).toBe(15)
    })
  })

  describe('String utilities', () => {
    it('concatenates strings', () => {
      expect('Hello' + ' ' + 'World').toBe('Hello World')
    })

    it('checks string length', () => {
      expect('test'.length).toBe(4)
    })
  })

  describe('Array utilities', () => {
    it('filters array correctly', () => {
      const numbers = [1, 2, 3, 4, 5]
      const evens = numbers.filter((n) => n % 2 === 0)
      expect(evens).toEqual([2, 4])
    })

    it('maps array correctly', () => {
      const numbers = [1, 2, 3]
      const doubled = numbers.map((n) => n * 2)
      expect(doubled).toEqual([2, 4, 6])
    })
  })
})
