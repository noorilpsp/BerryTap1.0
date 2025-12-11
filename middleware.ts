import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { platformPersonnel } from '@/db/schema/platform_personnel'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } })

  console.info('[middleware] admin check start', { path: request.nextUrl.pathname })

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.delete({ name, ...options })
        },
      },
    },
  )

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  console.info('[middleware] auth result', {
    userId: user?.id,
    email: user?.email,
    userError: userError?.message,
  })

  if (userError || !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const personnel = await db
    .select({
      role: platformPersonnel.role,
      isActive: platformPersonnel.isActive,
    })
    .from(platformPersonnel)
    .where(eq(platformPersonnel.userId, user.id))
    .limit(1)
    .then((rows) => rows[0])

  console.info('[middleware] personnel check', {
    personnel,
  })

  if (!personnel || personnel.role !== 'super_admin' || personnel.isActive === false) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  console.info('[middleware] admin access granted', { userId: user.id })
  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
