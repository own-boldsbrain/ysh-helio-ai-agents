import { safeJson } from '@/lib/utils/fetch-json'

export async function redirectToSignIn(): Promise<void> {
  const response = await fetch(
    `/api/auth/signin/vercel?${new URLSearchParams({
      next: window.location.pathname,
    }).toString()}`,
    { method: 'POST' },
  )

  const { url } = await safeJson<{ url: string }>(response)
  window.location.href = url
  if (window.location.hash) {
    window.location.reload()
  }
}
