/**
 * Safely parse JSON response from fetch
 * Returns parsed JSON or throws an error with the text content
 */
export async function parseJsonResponse<T = unknown>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type')

  // Check if response is JSON
  if (contentType && contentType.includes('application/json')) {
    try {
      return await response.json()
    } catch (error) {
      // Avoid logging dynamic objects in logs
      console.error('Failed to parse JSON response')
      throw new Error('Invalid JSON response from server')
    }
  }

  // Response is not JSON, try to get text for error message
  const text = await response.text()
  console.error('Non-JSON response received')

  // If response is not OK, throw error with status text
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }

  // If response is OK but not JSON, this is unexpected
  throw new Error('Expected JSON response but received non-JSON content')
}

/**
 * Safely get error message from response
 * Tries to parse JSON error, falls back to text or status text
 */
export async function getErrorMessage(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type')

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      return data.error || data.message || `Error: ${response.status} ${response.statusText}`
    }

    // Try to get text content
    const text = await response.text()
    if (text && text.length > 0 && text.length < 500) {
      return text
    }

    return `Error: ${response.status} ${response.statusText}`
  } catch (error) {
    return `Error: ${response.status} ${response.statusText}`
  }
}

/**
 * Safe wrapper for response.json() that validates content-type first
 * Use this instead of calling response.json() directly
 *
 * @example
 * const response = await fetch('/api/endpoint')
 * const data = await safeJson(response) // Safe from parse errors
 */
export async function safeJson<T = unknown>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type')

  if (!contentType || !contentType.includes('application/json')) {
    // Use a static log message to prevent leaking sensitive info
    console.warn('Response is not JSON, attempting parse anyway')
  }

  try {
    return await response.json()
  } catch (error) {
    console.error('Failed to parse server response')
    throw new Error('Failed to parse server response')
  }
}
