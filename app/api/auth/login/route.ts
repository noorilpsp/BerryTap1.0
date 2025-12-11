import { NextResponse } from 'next/server'

import { supabaseServer } from '@/lib/supabaseServer'
import { db } from '@/lib/db'
import { users } from '@/db/schema/users'

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}))

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
  }

  const supabase = await supabaseServer()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.session) {
    // If Supabase says the email isn't confirmed yet, return a specific message
    if (error?.message?.toLowerCase().includes('confirm')) {
      return NextResponse.json(
        { message: 'Please confirm your email before signing in.' },
        { status: 403 },
      )
    }

    return NextResponse.json(
      { message: error?.message || 'Invalid email or password' },
      { status: 401 },
    )
  }

  // Upsert user profile in Neon via Drizzle
  const userId = data.user.id
  const userEmail = data.user.email ?? ''

  await db
    .insert(users)
    .values({ id: userId, email: userEmail })
    .onConflictDoUpdate({
      target: users.id,
      set: { email: userEmail },
    })

  // Supabase client sets auth cookies automatically via the server client
  return NextResponse.json({ user: data.user })
}

