import { bench, describe } from 'vitest'
import { parseJsonResponse, getErrorMessage, safeJson } from '@/lib/utils/fetch-json'

// Create mock responses for performance testing
function createMockResponse(
  data: any, 
  options: { 
    status?: number, 
    statusText?: string, 
    contentType?: string,
    ok?: boolean
  } = {}
): Response {
  const { status = 200, statusText = 'OK', contentType = 'application/json', ok = status < 400 } = options;
  
  return {
    status,
    statusText,
    ok,
    headers: {
      get: (name: string) => {
        if (name.toLowerCase() === 'content-type') {
          return contentType
        }
        return null
      }
    } as Headers,
    json: async () => {
      if (typeof data === 'string' && data.startsWith('invalid')) {
        throw new Error('Invalid JSON')
      }
      return data
    },
    text: async () => {
      if (typeof data === 'string') {
        return data
      }
      return JSON.stringify(data)
    }
  } as Response
}

describe('Performance: JSON Parsing Utilities', () => {
  bench('parseJsonResponse with valid JSON', async () => {
    const mockResponse = createMockResponse({ 
      id: 1, 
      name: 'Test User', 
      email: 'test@example.com',
      profile: {
        age: 30,
        location: 'New York',
        preferences: ['coding', 'ai', 'open source']
      }
    })
    
    await parseJsonResponse(mockResponse)
  })

  bench('parseJsonResponse with invalid JSON', async () => {
    const mockResponse = createMockResponse('invalid json {', {
      contentType: 'application/json',
    })
    
    try {
      await parseJsonResponse(mockResponse)
    } catch (e) {
      // Expected to throw
    }
  })

  bench('safeJson with valid JSON', async () => {
    const mockResponse = createMockResponse({ 
      id: 1, 
      name: 'Test User', 
      email: 'test@example.com' 
    })
    
    await safeJson(mockResponse)
  })

  bench('getErrorMessage with JSON error', async () => {
    const mockResponse = createMockResponse({ error: 'Something went wrong' })
    
    await getErrorMessage(mockResponse)
  })

  bench('getErrorMessage with non-JSON response', async () => {
    const mockResponse = createMockResponse('Error message', {
      contentType: 'text/plain',
      status: 500,
      statusText: 'Internal Server Error',
    })
    
    await getErrorMessage(mockResponse)
  })
})

// Additional performance benchmarks for critical utilities
describe('Performance: Utility Functions', () => {
  bench('cn function with multiple classes', () => {
    const classes = [
      'bg-red-500',
      'text-white',
      'p-4',
      'rounded-lg',
      'font-bold',
      'hover:bg-red-600',
      'transition-colors',
      'duration-200'
    ]
    
    // Call cn with all classes
    for (let i = 0; i < 100; i++) {
      // @ts-ignore - we're using the actual cn function here
      cn(...classes)
    }
  })
})