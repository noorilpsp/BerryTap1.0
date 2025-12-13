import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

import { isPlatformAdmin, getAdminStatusFromCookie, setAdminStatusCookie } from '@/lib/permissions'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } })
  const pathname = request.nextUrl.pathname

  console.info('[proxy] route protection check', { path: pathname })

  // Create Supabase client for authentication
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: Record<string, unknown>) {
          response.cookies.delete({ name, ...options })
        },
      },
    },
  )

  // Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  // Handle /dashboard routes - require authentication only
  if (pathname.startsWith('/dashboard')) {
    console.info('[proxy] dashboard route check', {
      userId: user?.id,
      email: user?.email,
      userError: userError?.message,
    })

    if (userError || !user) {
      console.info('[proxy] dashboard access denied - not authenticated')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    console.info('[proxy] dashboard access granted', { userId: user.id })
    return response
  }

  // Handle /admin routes - require platform admin role
  if (pathname.startsWith('/admin')) {
    console.info('[proxy] admin route check', {
      userId: user?.id,
      email: user?.email,
      userError: userError?.message,
    })

    // First check authentication
    if (userError || !user) {
      console.info('[proxy] admin access denied - not authenticated')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Fast path: Check cookie first (no DB query needed)
    const cookieAdminStatus = getAdminStatusFromCookie(
      request.cookies.get('bt_admin_status')?.value,
    )

    let isAdmin: boolean

    if (cookieAdminStatus !== null) {
      // Cookie is valid, use it (fast path - no DB query)
      isAdmin = cookieAdminStatus
      console.info('[proxy] platform admin check (cookie)', {
        userId: user.id,
        isAdmin,
      })
    } else {
      // Cookie missing or expired, check database and update cookie
      isAdmin = await isPlatformAdmin(user.id)

      console.info('[proxy] platform admin check (database)', {
        userId: user.id,
        isAdmin,
      })

      // Update cookie for future requests
      setAdminStatusCookie(response, user.id, isAdmin)
    }

    if (!isAdmin) {
      console.info('[proxy] admin access denied - not platform admin')
      // Redirect to login with a message (could also redirect to dashboard)
      return NextResponse.redirect(new URL('/login', request.url))
    }

    console.info('[proxy] admin access granted', { userId: user.id })
    return response
  }

  // For other routes, allow through
  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ],
}
