import 'server-only'
import { eq, and } from 'drizzle-orm'
import { decrypt } from '@/lib/crypto'
import { db } from '@/lib/db/client'
import { accounts, users } from '@/lib/db/schema'
import { getServerSession } from '@/lib/session/get-server-session'
import { getSessionFromReq } from '@/lib/session/server'
import type { Session } from '@/lib/session/types'
import type { Request } from 'next/server'

/**
 * Gets the GitHub token for the current user session
 * 
 * @param req Optional request object to get session from
 * @returns GitHub token if available, null otherwise
 */
export async function getUserGitHubToken(req?: Request): Promise<string | null> {
  try {
    // Get session from either request (if provided) or server session
    const session: Session | null = req 
      ? await getSessionFromReq(req as unknown as Request) 
      : await getServerSession()

    if (!session?.user?.id) {
      return null
    }

    // Try to get token from connected account first
    const connectedAccountResult = await db
      .select({ accessToken: accounts.accessToken })
      .from(accounts)
      .where(
        and(
          eq(accounts.userId, session.user.id),
          eq(accounts.provider, 'github')
        )
      )
      .limit(1)

    if (connectedAccountResult.length > 0 && connectedAccountResult[0]?.accessToken) {
      try {
        return decrypt(connectedAccountResult[0].accessToken)
      } catch {
        // If decryption fails, continue to try primary account
      }
    }

    // If no connected account token found, try user's primary account
    const userResult = await db
      .select({ accessToken: users.accessToken })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)

    if (userResult.length > 0 && userResult[0]?.accessToken) {
      try {
        return decrypt(userResult[0].accessToken)
      } catch {
        return null
      }
    }

    return null
  } catch (error) {
    console.error('Error getting GitHub token:', error)
    return null
  }
}