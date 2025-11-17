import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET as getOrgs } from '../../../app/api/github/orgs/route'
import { getUserGitHubToken } from '../../../lib/github/user-token'

// Mock the dependencies
vi.mock('@/lib/github/user-token', () => ({
  getUserGitHubToken: vi.fn(),
}))

// Create a mock fetch implementation
vi.stubGlobal('fetch', vi.fn())

describe('GitHub API Routes - Orgs Integration Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.clearAllMocks()
  })

  describe('GET /api/github/orgs', () => {
    it('should return organizations when authenticated', async () => {
      // Mock token retrieval
      vi.mocked(getUserGitHubToken).mockResolvedValue('test-token')

      // Mock GitHub API response
      const mockGithubOrgs = [
        {
          login: 'testorg',
          name: 'Test Organization',
          avatar_url: 'https://example.com/org-avatar.jpg',
        },
        {
          login: 'anotherorg',
          name: 'Another Organization',
          avatar_url: 'https://example.com/another-avatar.jpg',
        },
      ]

      const mockFetchResponse = {
        ok: true,
        json: () => Promise.resolve(mockGithubOrgs),
      } as Response

      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValue(mockFetchResponse)

      // Create mock request
      const mockRequest = {
        url: 'http://localhost:3000/api/github/orgs',
      } as NextRequest

      // Call the route handler
      const response = await getOrgs(mockRequest)

      // Verify the response
      expect(response.status).toBe(200)
      const responseData = await response.json()
      expect(responseData).toEqual([
        {
          login: 'testorg',
          name: 'Test Organization',
          avatar_url: 'https://example.com/org-avatar.jpg',
        },
        {
          login: 'anotherorg',
          name: 'Another Organization',
          avatar_url: 'https://example.com/another-avatar.jpg',
        },
      ])

      // Verify fetch was called with correct parameters
      expect(mockFetch).toHaveBeenCalledWith('https://api.github.com/user/orgs', {
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
        url: 'http://localhost:3000/api/github/orgs',
      } as NextRequest

      // Call the route handler
      const response = await getOrgs(mockRequest)

      // Verify the response
      expect(response.status).toBe(401)
      const responseData = await response.json()
      expect(responseData).toEqual({ error: 'GitHub not connected' })

      // Verify fetch was not called
      expect(fetch).not.toHaveBeenCalled()
    })

    it('should return empty array when user has no organizations', async () => {
      // Mock token retrieval
      vi.mocked(getUserGitHubToken).mockResolvedValue('test-token')

      // Mock GitHub API response with no orgs
      const mockGithubOrgs: [] = []
      const mockFetchResponse = {
        ok: true,
        json: () => Promise.resolve(mockGithubOrgs),
      } as Response

      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValue(mockFetchResponse)

      // Create mock request
      const mockRequest = {
        url: 'http://localhost:3000/api/github/orgs',
      } as NextRequest

      // Call the route handler
      const response = await getOrgs(mockRequest)

      // Verify the response
      expect(response.status).toBe(200)
      const responseData = await response.json()
      expect(responseData).toEqual([])
    })

    it('should handle GitHub API error', async () => {
      // Mock token retrieval
      vi.mocked(getUserGitHubToken).mockResolvedValue('test-token')

      // Mock GitHub API failure
      const mockFetchResponse = {
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      } as Response

      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValue(mockFetchResponse)

      // Create mock request
      const mockRequest = {
        url: 'http://localhost:3000/api/github/orgs',
      } as NextRequest

      // Call the route handler
      const response = await getOrgs(mockRequest)

      // Verify the response
      expect(response.status).toBe(500)
      const responseData = await response.json()
      expect(responseData).toEqual({ error: 'Failed to fetch organizations' })
    })
  })
})
