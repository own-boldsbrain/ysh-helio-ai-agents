import { NextRequest, NextResponse } from 'next/server'

import { getUserGitHubToken } from '@/lib/github/user-token'
import { parseJsonResponse } from '@/lib/utils/fetch-json'

export async function GET(req: NextRequest) {
  try {
    const token = await getUserGitHubToken(req)

    if (!token) {
      return NextResponse.json({ error: 'GitHub not connected' }, { status: 401 })
    }

    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const user = await parseJsonResponse<{ login: string; name?: string; avatar_url?: string }>(response)

    return NextResponse.json({
      login: user.login,
      name: user.name,
      avatar_url: user.avatar_url,
    })
  } catch (error) {
    console.error('Error fetching GitHub user')
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
  }
}
