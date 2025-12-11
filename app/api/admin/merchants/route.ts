import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

import { db } from '@/lib/db'
import { merchants } from '@/db/schema/merchants'
import { merchantLocations } from '@/db/schema/merchant_locations'

export async function POST(request: Request) {
  try {
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
      notes,
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

    // Create merchant
    await db.insert(merchants).values({
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
    const locationId = randomUUID()
    await db.insert(merchantLocations).values({
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

    return NextResponse.json({
      success: true,
      merchantId,
      locationId,
      message: 'Merchant created successfully',
      // Owner info stored but not linked yet - can be handled separately
      ownerInfo: {
        name: ownerName,
        email: ownerEmail,
      },
    })
  } catch (error) {
    console.error('[create-merchant] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create merchant' },
      { status: 500 },
    )
  }
}
