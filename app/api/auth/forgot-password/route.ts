import { NextResponse } from 'next/server'

import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(request: Request) {
  const { email } = await request.json().catch(() => ({}))

  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 })
  }

  const supabase = await supabaseServer()

  // Send password reset email
  // Note: Supabase will send the email with a reset link
  // The redirect URL should point to your reset password page
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
  })

  if (error) {
    // Don't reveal if email exists or not for security
    return NextResponse.json(
      { message: 'If an account exists with this email, a password reset link has been sent.' },
      { status: 200 },
    )
  }

  // Always return success to prevent email enumeration
  return NextResponse.json({
    message: 'If an account exists with this email, a password reset link has been sent.',
  })
}




