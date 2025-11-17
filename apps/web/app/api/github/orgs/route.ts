import { NextRequest, NextResponse } from 'next/server'

import { getUserGitHubToken } from '@/lib/github/user-token'
import { parseJsonResponse } from '@/lib/utils/fetch-json'

export async function GET(req: NextRequest) {
  try {
    const token = await getUserGitHubToken(req)

    if (!token) {
      return NextResponse.json({ error: 'GitHub not connected' }, { status: 401 })
    }

    const response = await fetch('https://api.github.com/user/orgs', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const orgs = await parseJsonResponse(response)

    interface GitHubOrg {
      login: string
      name?: string
      avatar_url: string
    }

    return NextResponse.json(
      (orgs as GitHubOrg[]).map((org) => ({
        login: org.login,
        name: org.name || org.login,
        avatar_url: org.avatar_url,
      })),
    )
  } catch (error) {
    console.error('Error fetching GitHub organizations')
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 })
  }
}
