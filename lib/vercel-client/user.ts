import type { VercelUser } from './types'
import { parseJsonResponse } from '@/lib/utils/fetch-json'

export async function fetchUser(accessToken: string): Promise<VercelUser | undefined> {
  // Try the user endpoint
  let response = await fetch('https://api.vercel.com/v2/user', {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })

  if (response.status !== 200) {
    console.error('Failed to fetch user from v2 endpoint', response.status)
    const errorText = await response.text()
    if (errorText && errorText.length > 0 && errorText.length < 500) {
      console.error('Error response:', errorText.substring(0, 500))
    }

    // Fallback to www/user endpoint
    response = await fetch('https://vercel.com/api/www/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    })

    if (response.status !== 200) {
      console.error('Failed to fetch user from www endpoint', response.status)
      const errorText = await response.text()
      if (errorText && errorText.length > 0 && errorText.length < 500) {
        console.error('Error response:', errorText.substring(0, 500))
      }
      return undefined
    }
  }

  // Try to parse response - format may vary by endpoint
  const data = (await parseJsonResponse(response)) as { user?: VercelUser } | VercelUser
  const user: VercelUser | undefined = 'user' in data && data.user ? data.user : 'username' in data ? data : undefined

  if (!user) {
    console.error('No user data in response')
    return undefined
  }

  return user
}
