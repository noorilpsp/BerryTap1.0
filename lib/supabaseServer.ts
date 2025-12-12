import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function supabaseServer() {
  let cookieStore
  try {
    cookieStore = await cookies()
  } catch (error) {
    // During prerendering, cookies() may reject. Return a client that won't work
    // but won't crash. This should only happen during build-time prerendering.
    return createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: () => undefined,
          set: () => {},
          remove: () => {},
        },
      },
    )
  }

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, {
              ...options,
              sameSite: 'lax',
            })
          } catch (err) {
            // Ignore cookie errors
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.delete(name)
          } catch (err) {
            // Ignore cookie errors
          }
        },
      },
    },
  )
}

