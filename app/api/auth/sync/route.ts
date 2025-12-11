import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { users } from '@/db/schema/users'

const WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET

export async function POST(request: Request) {
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ message: 'Webhook secret not configured' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
  if (authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const payload = await request.json().catch(() => ({}))

  const {
    id,
    email,
    phone,
    full_name,
    avatar_url,
    locale,
    is_active,
    created_at,
    updated_at,
    last_login_at,
  } = payload.record || payload.new || payload.user || {}

  if (!id || !email) {
    return NextResponse.json({ message: 'Missing id or email' }, { status: 400 })
  }

  const values = {
    id,
    email,
    phone: phone ?? null,
    fullName: full_name ?? '',
    avatarUrl: avatar_url ?? null,
    locale: locale ?? 'nl-BE',
    isActive: typeof is_active === 'boolean' ? is_active : true,
    createdAt: created_at ? new Date(created_at) : undefined,
    updatedAt: new Date(),
    lastLoginAt: last_login_at ? new Date(last_login_at) : null,
  }

  await db
    .insert(users)
    .values(values)
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: values.email,
        phone: values.phone,
        fullName: values.fullName,
        avatarUrl: values.avatarUrl,
        locale: values.locale,
        isActive: values.isActive,
        updatedAt: new Date(),
        lastLoginAt: values.lastLoginAt,
      },
    })

  return NextResponse.json({ success: true })
}
