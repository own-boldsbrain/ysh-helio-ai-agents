import { type NextRequest } from 'next/server'

/**
 * Returns sanitized base URL for redirects.
 * Prefers NEXTAUTH_URL env value, otherwise derives from request `req.nextUrl.origin`.
 * If baseUrl contains `0.0.0.0`, substitute with `localhost` to match OAuth callback expectations.
 */
export function getBaseUrl(req?: NextRequest) {
  const env = process.env.NEXTAUTH_URL
  let baseUrl = env || (req?.nextUrl?.origin ?? 'http://localhost:3000')

  // Sanitize 0.0.0.0 -> localhost
  try {
    const url = new URL(baseUrl)
    if (url.hostname === '0.0.0.0') {
      url.hostname = 'localhost'
      baseUrl = url.toString().replace(/:\d+\/$/, (v) => v.replace(/\/$/, ''))
    }
  } catch (e) {
    // Not a valid URL (shouldn't happen), fallback to env or default
    if (!baseUrl) baseUrl = 'http://localhost:3000'
  }

  // ensure it doesn't end with a trailing slash
  if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1)

  return baseUrl
}
