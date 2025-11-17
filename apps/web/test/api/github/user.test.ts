import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { GET as getUser } from '../../../app/api/github/user/route'
import { getUserGitHubToken } from '../../../lib/github/user-token'

// Mock the dependencies
vi.mock('@/lib/github/user-token', () => ({
  getUserGitHubToken: vi.fn(),
}))

// Create a mock fetch implementation
vi.stubGlobal('fetch', vi.fn())

describe('GitHub API Routes - Integration Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.clearAllMocks()
  })

  describe('GET /api/github/user', () => {
    it('should return user data when authenticated', async () => {
      // Mock token retrieval
      vi.mocked(getUserGitHubToken).mockResolvedValue('test-token')

      // Mock GitHub API response
      const mockGithubUser = {
        login: 'testuser',
        name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg'
      }
      
      const mockFetchResponse = {
        ok: true,
        json: () => Promise.resolve(mockGithubUser),
      } as Response

      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValue(mockFetchResponse)

      // Create mock request
      const mockRequest = {
        url: 'http://localhost:3000/api/github/user'
      } as NextRequest

      // Call the route handler
      const response = await getUser(mockRequest)

      // Verify the response
      expect(response.status).toBe(200)
      const responseData = await response.json()
      expect(responseData).toEqual({
        login: 'testuser',
        name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg'
      })

      // Verify fetch was called with correct parameters
      expect(mockFetch).toHaveBeenCalledWith('https://api.github.com/user', {
        headers: {
          Authorization: 'Bearer test-token',
          Accept: 'application/vnd.github.v3+json',
        },
      })
    })

    it('should return 401 when no GitHub token is available', async () => {
      // Mock no token available
      vi.mocked(getUserGitHubToken).mockResolvedValue(null)

      // Create mock request
      const mockRequest = {
        url: 'http://localhost:3000/api/github/user'
      } as NextRequest

      // Call the route handler
      const response = await getUser(mockRequest)

      // Verify the response
      expect(response.status).toBe(401)
      const responseData = await response.json()
      expect(responseData).toEqual({ error: 'GitHub not connected' })

      // Verify fetch was not called
      expect(fetch).not.toHaveBeenCalled()
    })

    it('should return 500 when GitHub API call fails', async () => {
      // Mock token retrieval
      vi.mocked(getUserGitHubToken).mockResolvedValue('test-token')

      // Mock GitHub API failure
      const mockFetchResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response

      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValue(mockFetchResponse)

      // Create mock request
      const mockRequest = {
        url: 'http://localhost:3000/api/github/user'
      } as NextRequest

      // Call the route handler
      const response = await getUser(mockRequest)

      // Verify the response
      expect(response.status).toBe(500)
      const responseData = await response.json()
      expect(responseData).toEqual({ error: 'Failed to fetch user data' })
    })

    it('should handle GitHub API error with specific status', async () => {
      // Mock token retrieval
      vi.mocked(getUserGitHubToken).mockResolvedValue('test-token')

      // Mock GitHub API returning an error
      const mockGithubError = { message: 'Bad credentials' }
      const mockFetchResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve(mockGithubError),
      } as Response

      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValue(mockFetchResponse)

      // Create mock request
      const mockRequest = {
        url: 'http://localhost:3000/api/github/user'
      } as NextRequest

      // Call the route handler
      const response = await getUser(mockRequest)

      // Verify the response
      expect(response.status).toBe(500)
      const responseData = await response.json()
      expect(responseData).toEqual({ error: 'Failed to fetch user data' })
    })
  })
})