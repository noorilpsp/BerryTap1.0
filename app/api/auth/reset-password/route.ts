import { NextResponse } from 'next/server'

import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(request: Request) {
  const { password, access_token, refresh_token } = await request.json().catch(() => ({}))

  if (!password) {
    return NextResponse.json({ message: 'Password is required' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json(
      { message: 'Password must be at least 6 characters long' },
      { status: 400 },
    )
  }

  const supabase = await supabaseServer()

  // Check if we have a valid session (code should have been exchanged already)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json(
      { message: 'No valid session found. Please use the reset link from your email.' },
      { status: 401 },
    )
  }

  // Update the user's password
  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to reset password' },
      { status: 401 },
    )
  }

  return NextResponse.json({ success: true, message: 'Password reset successfully' })
}




