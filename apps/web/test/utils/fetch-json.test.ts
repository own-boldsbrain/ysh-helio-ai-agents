import { describe, it, expect, vi } from 'vitest'
import { parseJsonResponse, getErrorMessage, safeJson } from '../../lib/utils/fetch-json'

// Create a more realistic Response mock
function createMockResponse(
  data: any,
  options: {
    status?: number
    statusText?: string
    contentType?: string
    ok?: boolean
  } = {},
): Response {
  const { status = 200, statusText = 'OK', contentType = 'application/json', ok = status < 400 } = options

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
      },
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
    },
  } as Response
}

describe('JSON Parsing Utilities', () => {
  describe('parseJsonResponse', () => {
    it('should parse valid JSON response', async () => {
      const mockResponse = createMockResponse({ name: 'John', age: 30 })
      const result = await parseJsonResponse(mockResponse)
      expect(result).toEqual({ name: 'John', age: 30 })
    })

    it('should handle non-JSON response when status is not OK', async () => {
      const mockResponse = createMockResponse('plain text', {
        contentType: 'text/plain',
        status: 404,
        statusText: 'Not Found',
        ok: false,
      })

      await expect(parseJsonResponse(mockResponse)).rejects.toThrow('404 Not Found')
    })

    it('should handle non-JSON response when status is OK', async () => {
      const mockResponse = createMockResponse('plain text', {
        contentType: 'text/plain',
        status: 200,
        statusText: 'OK',
        ok: true,
      })

      await expect(parseJsonResponse(mockResponse)).rejects.toThrow(
        'Expected JSON response but received non-JSON content',
      )
    })

    it('should handle invalid JSON response in JSON content type', async () => {
      const mockResponse = createMockResponse('invalid json {', {
        contentType: 'application/json',
      })

      await expect(parseJsonResponse(mockResponse)).rejects.toThrow('Invalid JSON response from server')
    })

    it('should return JSON data for error response with valid JSON content', async () => {
      const errorData = { error: 'Not found', message: 'Resource not found' }
      const mockResponse = createMockResponse(errorData, {
        status: 404,
        statusText: 'Not Found',
        ok: false,
      })

      // This should return the JSON data, not throw
      const result = await parseJsonResponse(mockResponse)
      expect(result).toEqual(errorData)
    })
  })

  describe('safeJson', () => {
    it('should parse valid JSON response', async () => {
      const mockResponse = createMockResponse({ name: 'John', age: 30 })
      const result = await safeJson(mockResponse)
      expect(result).toEqual({ name: 'John', age: 30 })
    })

    it('should handle non-JSON content type', async () => {
      const mockResponse = createMockResponse({ name: 'John' }, { contentType: 'text/html' })

      await expect(safeJson(mockResponse)).rejects.toThrow(
        'Expected JSON response but received unknown content type. Status: 200 OK',
      )
    })

    it('should handle invalid JSON', async () => {
      const mockResponse = createMockResponse('invalid json {', {
        contentType: 'application/json',
      })

      await expect(safeJson(mockResponse)).rejects.toThrow('Failed to parse server response as JSON')
    })
  })

  describe('getErrorMessage', () => {
    it('should extract error from JSON response', async () => {
      const mockResponse = createMockResponse({ error: 'Something went wrong' })
      const result = await getErrorMessage(mockResponse)
      expect(result).toBe('Something went wrong')
    })

    it('should extract message from JSON response', async () => {
      const mockResponse = createMockResponse({ message: 'Something went wrong' })
      const result = await getErrorMessage(mockResponse)
      expect(result).toBe('Something went wrong')
    })

    it('should fall back to status text for JSON response with no error/message', async () => {
      const mockResponse = createMockResponse({}, { status: 500, statusText: 'Internal Server Error' })
      const result = await getErrorMessage(mockResponse)
      expect(result).toBe('Error: 500 Internal Server Error')
    })

    it('should return content for non-JSON response when it is short', async () => {
      const mockResponse = createMockResponse('Error text', {
        contentType: 'text/plain',
        status: 400,
        statusText: 'Bad Request',
      })
      const result = await getErrorMessage(mockResponse)
      expect(result).toBe('Error text')
    })

    it('should return status text for non-JSON response when content is empty', async () => {
      const mockResponse = createMockResponse('', {
        contentType: 'text/plain',
        status: 400,
        statusText: 'Bad Request',
      })
      const result = await getErrorMessage(mockResponse)
      expect(result).toBe('Error: 400 Bad Request')
    })

    it('should handle parsing error', async () => {
      const mockResponse = {
        headers: {
          get: () => 'application/json',
        },
        json: async () => {
          throw new Error('Failed to parse JSON')
        },
        text: async () => 'plain text',
        status: 500,
        statusText: 'Internal Server Error',
        ok: false,
      } as Response

      const result = await getErrorMessage(mockResponse)
      expect(result).toBe('Error: 500 Internal Server Error')
    })
  })
})
