import type { VercelTeam } from './types'
import { parseJsonResponse } from '@/lib/utils/fetch-json'

export async function fetchTeams(accessToken: string) {
  const response = await fetch('https://api.vercel.com/v2/teams', {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })

  if (response.status !== 200) {
    const errorText = await response.text()

    // 403 is expected if user doesn't have team access
    if (response.status === 403) {
      console.log('User does not have team access (this is normal for personal accounts)')
      return []
    }

    console.error('Failed to fetch teams', response.status)
    if (errorText && errorText.length > 0 && errorText.length < 500) {
      console.error('Error response:', errorText.substring(0, 500))
    }
    return undefined
  }

  const { teams } = (await parseJsonResponse(response)) as { teams: VercelTeam[] }
  console.log('Successfully fetched teams')
  return teams || []
}
