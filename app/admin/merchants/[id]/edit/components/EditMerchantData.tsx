import dynamic from 'next/dynamic'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'

import { db } from '@/lib/db'
import { merchants } from '@/db/schema/merchants'
import { merchantLocations } from '@/db/schema/merchant_locations'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { unstable_cache } from '@/lib/unstable-cache'

// Lazy load EditMerchantForm - it's a heavy form component with image optimization
// Only needed on edit page, so code split it
const EditMerchantForm = dynamic(() => import('./EditMerchantForm').then((mod) => ({ default: mod.EditMerchantForm })), {
  loading: () => (
    <div className="space-y-6">
      <Skeleton className="h-96 w-full" />
    </div>
  ),
})

type EditMerchantDataProps = {
  merchantId: string
}

export async function EditMerchantData({ merchantId }: EditMerchantDataProps) {
  const getMerchant = unstable_cache(
    async () =>
      db
        .select()
        .from(merchants)
        .where(eq(merchants.id, merchantId))
        .limit(1)
        .then((rows) => rows[0]),
    ['merchant-edit', merchantId],
    { revalidate: 7200 },
  )

  const getFirstLocation = unstable_cache(
    async () =>
      db
        .select()
        .from(merchantLocations)
        .where(eq(merchantLocations.merchantId, merchantId))
        .limit(1)
        .then((rows) => rows[0]),
    ['merchant-edit-first-location', merchantId],
    { revalidate: 7200 },
  )

  // Fetch merchant and first location in parallel
  const [merchant, firstLocation] = await Promise.all([
    getMerchant(),
    getFirstLocation(),
  ])

  if (!merchant) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Edit Merchant</h1>
          <Badge variant="outline">{merchant.name}</Badge>
        </div>
        <p className="text-muted-foreground">
          Update merchant information, location details, and subscription settings.
        </p>
      </div>

      <EditMerchantForm merchant={merchant} location={firstLocation || undefined} />
    </div>
  )
}
