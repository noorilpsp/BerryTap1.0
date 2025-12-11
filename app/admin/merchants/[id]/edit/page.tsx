import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'

import { db } from '@/lib/db'
import { merchants } from '@/db/schema/merchants'
import { merchantLocations } from '@/db/schema/merchant_locations'
import { Badge } from '@/components/ui/badge'
import { EditMerchantForm } from './components/EditMerchantForm'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditMerchantPage({ params }: PageProps) {
  const { id } = await params

  // Fetch merchant
  const merchant = await db
    .select()
    .from(merchants)
    .where(eq(merchants.id, id))
    .limit(1)
    .then((rows) => rows[0])

  if (!merchant) {
    notFound()
  }

  // Fetch first location (for editing)
  const firstLocation = await db
    .select()
    .from(merchantLocations)
    .where(eq(merchantLocations.merchantId, id))
    .limit(1)
    .then((rows) => rows[0])

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

