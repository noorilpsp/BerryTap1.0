import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { LocationsList } from './LocationsList'
import { getCurrentUser } from '@/lib/currentUser'
import { isPlatformAdmin, canAccessLocation } from '@/lib/permissions'

type Location = {
  id: string
  name: string
  address: string
  postalCode: string
  city: string
  phone: string
  email: string | null
  logoUrl: string | null
  bannerUrl: string | null
  status: 'coming_soon' | 'active' | 'temporarily_closed' | 'closed'
  createdAt: Date | string
  updatedAt: Date | string
}

type MerchantLocationsWrapperProps = {
  merchantId: string
  locationsPromise: Promise<Location[]>
}

function LocationsSkeleton() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Locations</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  )
}

export async function MerchantLocationsWrapper({
  merchantId,
  locationsPromise,
}: MerchantLocationsWrapperProps) {
  const [locations, currentUser] = await Promise.all([
    locationsPromise,
    getCurrentUser(),
  ])

  if (!currentUser) {
    // No user logged in - show no locations
    return <LocationsList locations={[]} totalLocations={locations.length} />
  }

  // Filter locations based on user permissions on the server
  const isAdmin = await isPlatformAdmin(currentUser.id)
  
  let accessibleLocations = locations
  if (!isAdmin) {
    // For non-admin users, check access to each location
    const locationAccessChecks = await Promise.all(
      locations.map(async (location) => {
        const hasAccess = await canAccessLocation(currentUser.id, location.id)
        return { location, hasAccess }
      })
    )
    accessibleLocations = locationAccessChecks
      .filter(({ hasAccess }) => hasAccess)
      .map(({ location }) => location)
  }

  return (
    <LocationsList
      locations={accessibleLocations}
      totalLocations={locations.length}
    />
  )
}

export function MerchantLocationsWrapperSkeleton() {
  return <LocationsSkeleton />
}

