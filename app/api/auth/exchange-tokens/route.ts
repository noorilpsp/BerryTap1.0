import { NextResponse } from 'next/server'

import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(request: Request) {
  const { access_token, refresh_token } = await request.json().catch(() => ({}))

  if (!access_token || !refresh_token) {
    console.error('Exchange tokens: Missing tokens')
    return NextResponse.json(
      { message: 'Missing tokens' },
      { status: 400 },
    )
  }

  const supabase = await supabaseServer()

  // Exchange the tokens for a session
  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  })

  if (error || !data.session) {
    console.error('Exchange tokens error:', {
      error: error?.message,
      hasSession: !!data.session,
      errorCode: error?.status,
    })
    return NextResponse.json(
      { message: error?.message || 'Invalid or expired reset link' },
      { status: 401 },
    )
  }

  console.log('Token exchange successful, session created')
  return NextResponse.json({ success: true })
}



