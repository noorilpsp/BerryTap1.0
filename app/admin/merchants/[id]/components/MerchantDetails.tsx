import dynamic from 'next/dynamic'
import { Link } from '@/components/ui/link'
import { ArrowLeft, Building2, Calendar, Mail, MapPin, Phone, Tag } from 'lucide-react'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'

import { db } from '@/lib/db'
import { merchants } from '@/db/schema/merchants'
import { merchantLocations } from '@/db/schema/merchant_locations'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { MerchantActions } from './MerchantActions'
import { unstable_cache } from '@/lib/unstable-cache'

// Lazy load LocationsList - it's a client component below the fold
// Only loads when user scrolls to locations section
const LocationsList = dynamic(() => import('./LocationsList').then((mod) => ({ default: mod.LocationsList })), {
  loading: () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Locations</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  ),
})

function formatDate(value: Date | string | null) {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

type MerchantDetailsProps = {
  merchantId: string
}

export async function MerchantDetails({ merchantId }: MerchantDetailsProps) {
  const getMerchant = unstable_cache(
    async () =>
      db
        .select()
        .from(merchants)
        .where(eq(merchants.id, merchantId))
        .limit(1)
        .then((rows) => rows[0]),
    ['merchant-detail', merchantId],
    { revalidate: 7200 },
  )

  const getMerchantLocations = unstable_cache(
    async () =>
      db
        .select()
        .from(merchantLocations)
        .where(eq(merchantLocations.merchantId, merchantId))
        .limit(50), // Limit to 50 locations to improve performance
    ['merchant-locations', merchantId],
    { revalidate: 7200 },
  )

  // Fetch merchant and locations in parallel
  const [merchant, locations] = await Promise.all([
    getMerchant(),
    getMerchantLocations(),
  ])

  if (!merchant) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/merchants">
            <ArrowLeft className="size-4" />
            <span className="sr-only">Back to merchants</span>
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{merchant.name}</h1>
            <Badge variant="outline" className="capitalize">
              {merchant.status}
            </Badge>
            <Badge variant="secondary" className="capitalize">
              {merchant.businessType}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">{merchant.legalName}</p>
        </div>
        <MerchantActions merchantId={merchantId} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Merchant Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5" />
              Business Information
            </CardTitle>
            <CardDescription>Core merchant details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Legal Name</div>
              <div className="text-sm">{merchant.legalName}</div>
            </div>
            {merchant.kboNumber && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">KBO Number</div>
                <div className="text-sm">{merchant.kboNumber}</div>
              </div>
            )}
            <Separator />
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Contact Email</div>
              <div className="text-sm flex items-center gap-2">
                <Mail className="size-4" />
                <a href={`mailto:${merchant.contactEmail}`} className="hover:underline">
                  {merchant.contactEmail}
                </a>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Phone</div>
              <div className="text-sm flex items-center gap-2">
                <Phone className="size-4" />
                <a href={`tel:${merchant.phone}`} className="hover:underline">
                  {merchant.phone}
                </a>
              </div>
            </div>
            {merchant.address && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Address</div>
                <div className="text-sm flex items-center gap-2">
                  <MapPin className="size-4" />
                  {merchant.address}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription & Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="size-5" />
              Subscription & Settings
            </CardTitle>
            <CardDescription>Subscription tier and business configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Subscription Tier</div>
              <Badge variant="outline" className="capitalize">
                {merchant.subscriptionTier}
              </Badge>
            </div>
            {merchant.subscriptionExpiresAt && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Subscription Expires</div>
                <div className="text-sm flex items-center gap-2">
                  <Calendar className="size-4" />
                  {formatDate(merchant.subscriptionExpiresAt)}
                </div>
              </div>
            )}
            <Separator />
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Timezone</div>
              <div className="text-sm">{merchant.timezone}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Currency</div>
              <div className="text-sm">{merchant.currency}</div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Created</div>
              <div className="text-sm flex items-center gap-2">
                <Calendar className="size-4" />
                {formatDate(merchant.createdAt)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
              <div className="text-sm flex items-center gap-2">
                <Calendar className="size-4" />
                {formatDate(merchant.updatedAt)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Locations */}
      <LocationsList locations={locations} merchantId={merchantId} />
    </div>
  )
}
