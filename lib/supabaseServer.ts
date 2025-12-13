import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function supabaseServer() {
  const supabaseUrl = process.env.SUPABASE_URL?.trim()
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim()

  // During build time, environment variables might not be available
  // Return a stub client that will fail gracefully when used
  // Also check for empty strings (env vars might be set but empty)
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === '' || supabaseAnonKey === '') {
    const errorMessage =
      'Supabase environment variables (SUPABASE_URL and SUPABASE_ANON_KEY) are not set. ' +
      'Make sure they are configured in your Vercel environment variables. ' +
      'This error occurs when Supabase is accessed at runtime.'

    // Return a proxy that throws a helpful error only when actually used
    // Handle nested property access (e.g., supabase.auth.getUser())
    return new Proxy({} as ReturnType<typeof createServerClient>, {
      get(_target, prop) {
        // Allow some introspection during build
        if (prop === 'then' || prop === Symbol.toStringTag || prop === 'constructor') {
          return undefined
        }
        // Return another proxy for nested properties (like .auth)
        return new Proxy(
          {},
          {
            get() {
              throw new Error(errorMessage)
            },
            apply() {
              throw new Error(errorMessage)
            },
          },
        )
      },
    }) as ReturnType<typeof createServerClient>
  }

  let cookieStore: Awaited<ReturnType<typeof cookies>>
  try {
    cookieStore = await cookies()
  } catch (error) {
    // During prerendering, cookies() may reject. Return a client that won't work
    // but won't crash. This should only happen during build-time prerendering.
    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
    })
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
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
  })
}

