import { NextResponse } from 'next/server'

import { supabaseServer } from '@/lib/supabaseServer'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/db/schema/users'

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}))

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
  }

  // Guard: prevent duplicate emails in our Neon DB
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existing.length > 0) {
    return NextResponse.json(
      { message: 'An account with this email already exists. Please sign in instead.' },
      { status: 409 },
    )
  }

  const supabase = await supabaseServer()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    // If the email already exists, return a conflict status
    if (error.message?.toLowerCase().includes('already registered')) {
      return NextResponse.json(
        { message: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 },
      )
    }

    return NextResponse.json({ message: error.message }, { status: 400 })
  }

  // If email confirmation is required, session may be null; still upsert the user record.
  if (data.user) {
    const userMeta = data.user.user_metadata || {}
    const fullName = userMeta.full_name || userMeta.name || ''
    const phone = userMeta.phone || null
    const avatarUrl = userMeta.avatar_url || null
    const locale = userMeta.locale || 'nl-BE'

    await db
      .insert(users)
      .values({
        id: data.user.id,
        email: data.user.email ?? '',
        phone,
        fullName,
        avatarUrl,
        locale,
        isActive: true,
        createdAt: data.user.created_at ? new Date(data.user.created_at) : undefined,
        updatedAt: new Date(),
        lastLoginAt: null,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: data.user.email ?? '',
          phone,
          fullName,
          avatarUrl,
          locale,
          updatedAt: new Date(),
        },
      })
  }

  return NextResponse.json({
    user: data.user,
    session: data.session, // may be null if email confirmation required
  })
}

