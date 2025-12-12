import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'

import { supabaseServer } from '@/lib/supabaseServer'
import { db } from '@/lib/db'
import { merchants } from '@/db/schema/merchants'
import { merchantLocations } from '@/db/schema/merchant_locations'
import { isPlatformAdmin } from '@/lib/permissions'
import { eq } from 'drizzle-orm'

// Configure Neon to use WebSocket for transaction support
// Note: Install 'ws' package for transaction support: npm install ws
// For Edge runtime, transactions may not be available
if (typeof globalThis.WebSocket === 'undefined') {
  // Try to load ws module for Node.js environments
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ws = typeof require !== 'undefined' ? require('ws') : null
  if (ws) {
    neonConfig.webSocketConstructor = ws
  }
}

// Create a transaction-capable database connection using Pool
function getTransactionDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set')
  }
  // Use Pool connection for transaction support
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  return drizzle(pool)
}

export async function POST(request: Request) {
  try {
    // Verify user is platform admin
  const supabase = await supabaseServer()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

    const isAdmin = await isPlatformAdmin(user.id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Super admin access required' },
        { status: 403 },
      )
    }

    const body = await request.json()

    const {
      name,
      legalName,
      contactEmail,
      businessType,
      status,
      locationName,
      phone,
      address,
      city,
      country,
      timezone,
      ownerName,
      ownerEmail,
      subscriptionTier,
      subscriptionExpiresAt,
      logoUrl,
      bannerUrl,
    } = body

    // Validate required fields
    if (!name || !legalName || !contactEmail || !businessType || !status) {
      return NextResponse.json({ error: 'Missing required merchant fields' }, { status: 400 })
    }

    if (!locationName || !phone || !address || !city || !country || !timezone) {
      return NextResponse.json({ error: 'Missing required location fields' }, { status: 400 })
    }

    if (!ownerName || !ownerEmail || !subscriptionTier) {
      return NextResponse.json({ error: 'Missing required owner/subscription fields' }, { status: 400 })
    }

    const merchantId = randomUUID()
    const locationId = randomUUID()

    // Use transaction-capable database connection
    const transactionDb = getTransactionDb()

    // Use transaction to ensure both merchant and location are created atomically
    const result = await transactionDb.transaction(async (tx) => {
      // Create merchant
      await tx.insert(merchants).values({
        id: merchantId,
        name,
        legalName,
        contactEmail,
        phone,
        address,
        businessType,
        status,
        subscriptionTier,
        subscriptionExpiresAt: subscriptionExpiresAt ? new Date(subscriptionExpiresAt) : null,
        timezone,
        currency: 'EUR',
      })

      // Create first location
      await tx.insert(merchantLocations).values({
        id: locationId,
        merchantId,
        name: locationName,
        address,
        postalCode: '', // Not collected in form, can be added later
        city,
        phone,
        email: contactEmail,
        logoUrl: logoUrl || null,
        bannerUrl: bannerUrl || null,
        status: 'active',
        openingHours: {}, // Empty for now, can be configured later
        settings: {
          accepts_cash: true,
          accepts_cards: true,
        },
      })

      // Fetch created merchant with location within transaction
      const createdMerchant = await tx
        .select()
        .from(merchants)
        .where(eq(merchants.id, merchantId))
        .limit(1)
        .then((rows) => rows[0])

      const createdLocation = await tx
        .select()
        .from(merchantLocations)
        .where(eq(merchantLocations.id, locationId))
        .limit(1)
        .then((rows) => rows[0])

      return { createdMerchant, createdLocation }
    })

    return NextResponse.json(
      {
        success: true,
        merchant: result.createdMerchant,
        location: result.createdLocation,
        ownerInfo: {
          name: ownerName,
          email: ownerEmail,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('[create-merchant] Error:', error)

    // Transaction errors will automatically rollback both merchant and location
    // Check for specific database constraint violations
    if (error instanceof Error) {
      // Handle foreign key or unique constraint violations
      if (error.message.includes('violates foreign key') || error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'Database constraint violation. Please check your input data.' },
          { status: 400 },
        )
      }

      // Handle other database errors
      if (error.message.includes('relation') || error.message.includes('column')) {
        return NextResponse.json(
          { error: 'Database schema error. Please contact support.' },
          { status: 500 },
        )
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create merchant and location' },
      { status: 500 },
    )
  }
}
