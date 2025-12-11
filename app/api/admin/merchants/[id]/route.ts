import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { supabaseServer } from '@/lib/supabaseServer'
import { db } from '@/lib/db'
import { merchants } from '@/db/schema/merchants'
import { merchantLocations } from '@/db/schema/merchant_locations'
import { platformPersonnel } from '@/db/schema/platform_personnel'

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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Verify user is platform_personnel with super_admin role
    const authCheck = await verifyPlatformPersonnel()
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 })
    }

    // Check if merchant exists
    const existingMerchant = await db
      .select()
      .from(merchants)
      .where(eq(merchants.id, id))
      .limit(1)
      .then((rows) => rows[0])

    if (!existingMerchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
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
      locationId,
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

    // Update merchant
    await db
      .update(merchants)
      .set({
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
        updatedAt: new Date(),
      })
      .where(eq(merchants.id, id))

    // Update or create first location
    if (locationId) {
      // Update existing location
      await db
        .update(merchantLocations)
        .set({
          name: locationName,
          address,
          city,
          phone,
          email: contactEmail,
          logoUrl: logoUrl || null,
          bannerUrl: bannerUrl || null,
          updatedAt: new Date(),
        })
        .where(eq(merchantLocations.id, locationId))
    } else {
      // Create new location if none exists
      const newLocationId = crypto.randomUUID()
      await db.insert(merchantLocations).values({
        id: newLocationId,
        merchantId: id,
        name: locationName,
        address,
        postalCode: '',
        city,
        phone,
        email: contactEmail,
        logoUrl: logoUrl || null,
        bannerUrl: bannerUrl || null,
        status: 'active',
        openingHours: {},
        settings: {
          accepts_cash: true,
          accepts_cards: true,
        },
      })
    }

    // Fetch updated merchant
    const updatedMerchant = await db
      .select()
      .from(merchants)
      .where(eq(merchants.id, id))
      .limit(1)
      .then((rows) => rows[0])

    const updatedLocation = await db
      .select()
      .from(merchantLocations)
      .where(eq(merchantLocations.merchantId, id))
      .limit(1)
      .then((rows) => rows[0])

    return NextResponse.json({
      success: true,
      merchant: updatedMerchant,
      location: updatedLocation,
    })
  } catch (error) {
    console.error('[update-merchant] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update merchant' },
      { status: 500 },
    )
  }
}

