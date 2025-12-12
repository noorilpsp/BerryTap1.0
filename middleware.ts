import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

import { isPlatformAdmin } from '@/lib/permissions'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } })
  const pathname = request.nextUrl.pathname

  console.info('[middleware] route protection check', { path: pathname })

  // Create Supabase client for authentication
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

  // Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  // Handle /dashboard routes - require authentication only
  if (pathname.startsWith('/dashboard')) {
    console.info('[middleware] dashboard route check', {
    userId: user?.id,
    email: user?.email,
    userError: userError?.message,
  })

  if (userError || !user) {
      console.info('[middleware] dashboard access denied - not authenticated')
    return NextResponse.redirect(new URL('/login', request.url))
  }

    console.info('[middleware] dashboard access granted', { userId: user.id })
    return response
  }

  // Handle /admin routes - require platform admin role
  if (pathname.startsWith('/admin')) {
    console.info('[middleware] admin route check', {
      userId: user?.id,
      email: user?.email,
      userError: userError?.message,
    })

    // First check authentication
    if (userError || !user) {
      console.info('[middleware] admin access denied - not authenticated')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Then check platform admin role
    const isAdmin = await isPlatformAdmin(user.id)

    console.info('[middleware] platform admin check', {
      userId: user.id,
      isAdmin,
  })

    if (!isAdmin) {
      console.info('[middleware] admin access denied - not platform admin')
      // Redirect to login with a message (could also redirect to dashboard)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  console.info('[middleware] admin access granted', { userId: user.id })
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
