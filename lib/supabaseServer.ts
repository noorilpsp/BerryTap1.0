import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function supabaseServer() {
  const cookieStore = await cookies()

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

