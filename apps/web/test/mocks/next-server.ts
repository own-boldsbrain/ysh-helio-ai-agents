// Minimal mock for `next/server` used in app routes in tests
export const NextResponse = {
  json: (body: any, opts?: any) => {
    return new Response(JSON.stringify(body), {
      status: opts?.status || 200,
      headers: opts?.headers || { 'Content-Type': 'application/json' },
    })
  },
}

export const NextRequest = (input: any) => new Request(input)
