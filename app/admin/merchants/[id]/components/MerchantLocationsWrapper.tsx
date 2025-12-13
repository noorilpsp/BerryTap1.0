import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load LocationsList - it's a client component below the fold
const LocationsList = dynamic(
  () => import('./LocationsList').then((mod) => ({ default: mod.LocationsList })),
  {
    loading: () => (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Locations</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    ),
  },
)

type Location = {
  id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  country: string | null
  phone: string | null
  email: string | null
  isActive: boolean
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
  const locations = await locationsPromise

  return <LocationsList locations={locations} merchantId={merchantId} />
}

export function MerchantLocationsWrapperSkeleton() {
  return <LocationsSkeleton />
}

