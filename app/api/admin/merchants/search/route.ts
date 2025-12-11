import { NextResponse } from 'next/server'
import { desc, ilike } from 'drizzle-orm'

import { supabaseServer } from '@/lib/supabaseServer'
import { db } from '@/lib/db'
import { merchants } from '@/db/schema/merchants'
import { platformPersonnel } from '@/db/schema/platform_personnel'
import { eq } from 'drizzle-orm'

async function verifyPlatformPersonnel() {
  const supabase = await supabaseServer()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { authorized: false, error: 'Unauthorized' }
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

  if (!personnel || personnel.role !== 'super_admin' || personnel.isActive === false) {
    return { authorized: false, error: 'Forbidden: Super admin access required' }
  }

  return { authorized: true, userId: user.id }
}

export async function GET(request: Request) {
  try {
    // Verify user is platform_personnel with super_admin role
    const authCheck = await verifyPlatformPersonnel()
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()

    if (!query || query.length < 2) {
      return NextResponse.json({ merchants: [] })
    }

    // Search all merchants in database
    const rows = await db
      .select({
        id: merchants.id,
        name: merchants.name,
        status: merchants.status,
        businessType: merchants.businessType,
        createdAt: merchants.createdAt,
      })
      .from(merchants)
      .where(ilike(merchants.name, `%${query}%`))
      .orderBy(desc(merchants.createdAt))
      .limit(100)

    // Format dates
    const formattedMerchants = rows.map((row) => ({
      ...row,
      createdAtFormatted: new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(row.createdAt),
    }))

    return NextResponse.json({ merchants: formattedMerchants })
  } catch (error) {
    console.error('[search-merchants] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search merchants' },
      { status: 500 },
    )
  }
}
