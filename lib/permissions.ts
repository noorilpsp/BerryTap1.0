import { db } from '@/lib/db'
import { merchantUsers } from '@/db/schema/merchant_users'
import { merchantLocations } from '@/db/schema/merchant_locations'
import { platformPersonnel } from '@/db/schema/platform_personnel'
import { eq, and } from 'drizzle-orm'
import { unstable_cache } from '@/lib/unstable-cache'

export type MerchantUserRole = 'owner' | 'admin' | 'manager'

/**
 * Gets the role of a user for a specific merchant.
 * @param userId - The user ID (Supabase auth UUID)
 * @param merchantId - The merchant ID
 * @returns The user's role ('owner' | 'admin' | 'manager') or null if not found or inactive
 */
export async function getUserRole(
  userId: string,
  merchantId: string,
): Promise<MerchantUserRole | null> {
  // Direct DB query used in middleware-safe fallback
  const query = () =>
    db
      .select({
        role: merchantUsers.role,
        isActive: merchantUsers.isActive,
      })
      .from(merchantUsers)
      .where(
        and(
          eq(merchantUsers.userId, userId),
          eq(merchantUsers.merchantId, merchantId),
        ),
      )
      .limit(1)
      .then((rows) => rows[0] ?? null)

  // Use cache when available; fall back to direct query if incremental cache is missing
  try {
    const cached = unstable_cache(query, ['merchant-user-role', userId, merchantId], {
      revalidate: 7200,
    })
    const merchantUser = await cached()
    if (!merchantUser || !merchantUser.isActive) return null
    return merchantUser.role
  } catch {
    const merchantUser = await query()
    if (!merchantUser || !merchantUser.isActive) return null
    return merchantUser.role
  }
}

/**
 * Checks if a user can access a specific location.
 * - Owners and admins have access to all locations in their merchant
 * - Managers only have access to locations in their locationAccess array
 * @param userId - The user ID (Supabase auth UUID)
 * @param locationId - The location ID
 * @returns true if user can access the location, false otherwise
 */
export async function canAccessLocation(
  userId: string,
  locationId: string,
): Promise<boolean> {
  // Queries (middleware-safe fallback)
  const fetchLocation = () =>
    db
      .select({
        merchantId: merchantLocations.merchantId,
      })
      .from(merchantLocations)
      .where(eq(merchantLocations.id, locationId))
      .limit(1)
      .then((rows) => rows[0] ?? null)

  const fetchMerchantUser = (merchantId: string) =>
    db
      .select({
        role: merchantUsers.role,
        locationAccess: merchantUsers.locationAccess,
        isActive: merchantUsers.isActive,
      })
      .from(merchantUsers)
      .where(
        and(
          eq(merchantUsers.userId, userId),
          eq(merchantUsers.merchantId, merchantId),
        ),
      )
      .limit(1)
      .then((rows) => rows[0] ?? null)

  // Get location (cached when possible)
  let location: { merchantId: string } | null = null
  try {
    const cachedLocation = unstable_cache(fetchLocation, ['location-merchant', locationId], {
      revalidate: 7200,
    })
    location = await cachedLocation()
  } catch {
    location = await fetchLocation()
  }

  if (!location) {
    return false
  }

  // Get the user's merchant association (cached when possible)
  let merchantUser:
    | {
        role: MerchantUserRole
        locationAccess: string[] | null
        isActive: boolean
      }
    | null = null

  try {
    const cachedMerchantUser = unstable_cache(
      () => fetchMerchantUser(location!.merchantId),
      ['merchant-user-location-access', userId, location.merchantId],
      { revalidate: 7200 },
    )
    merchantUser = await cachedMerchantUser()
  } catch {
    merchantUser = await fetchMerchantUser(location.merchantId)
  }

  // User must be associated with the merchant and active
  if (!merchantUser || !merchantUser.isActive) {
    return false
  }

  // Owners and admins have access to all locations
  if (merchantUser.role === 'owner' || merchantUser.role === 'admin') {
    return true
  }

  // Managers need explicit location access
  if (merchantUser.role === 'manager') {
    const locationAccess = merchantUser.locationAccess ?? []
    return locationAccess.includes(locationId)
  }

  return false
}

// In-memory cache for middleware context (middleware doesn't benefit from React's cache)
// This provides fast lookups for repeated middleware checks
const platformAdminCache = new Map<
  string,
  { result: boolean; expiresAt: number }
>()

const PLATFORM_ADMIN_CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

/**
 * Checks if a user is a platform admin (super_admin role).
 * Optimized with multi-layer caching:
 * 1. In-memory cache (5min TTL) for middleware/rapid requests
 * 2. Next.js unstable_cache (2hr revalidate) for server components/API routes
 * @param userId - The user ID (Supabase auth UUID)
 * @returns true if user is an active platform super_admin, false otherwise
 */
export async function isPlatformAdmin(userId: string): Promise<boolean> {
  // Check in-memory cache first (fast path for middleware)
  const cached = platformAdminCache.get(userId)
  const now = Date.now()
  if (cached && cached.expiresAt > now) {
    return cached.result
  }

  // Query function - optimized to only fetch what we need
  const query = async (): Promise<boolean> => {
    const result = await db
      .select({
        role: platformPersonnel.role,
        isActive: platformPersonnel.isActive,
      })
      .from(platformPersonnel)
      .where(eq(platformPersonnel.userId, userId))
      .limit(1)
      .then((rows) => rows[0] ?? null)

    return (
      result !== null &&
      result.role === 'super_admin' &&
      result.isActive === true
    )
  }

  let isAdmin: boolean

  // Try Next.js cache (works in server components/API routes)
  try {
    const cachedQuery = unstable_cache(query, ['platform-personnel', userId], {
      revalidate: 7200, // 2 hours
    })
    isAdmin = await cachedQuery()
  } catch {
    // Fallback to direct query (middleware context)
    isAdmin = await query()
  }

  // Update in-memory cache
  platformAdminCache.set(userId, {
    result: isAdmin,
    expiresAt: now + PLATFORM_ADMIN_CACHE_TTL,
  })

  // Clean up expired entries periodically (keep cache size manageable)
  if (platformAdminCache.size > 1000) {
    for (const [key, value] of platformAdminCache.entries()) {
      if (value.expiresAt <= now) {
        platformAdminCache.delete(key)
      }
    }
  }

  return isAdmin
}
