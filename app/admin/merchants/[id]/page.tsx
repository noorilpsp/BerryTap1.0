import Link from 'next/link'
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

type PageProps = {
  params: Promise<{ id: string }>
}

function formatDate(value: Date | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value)
}

export default async function MerchantDetailPage({ params }: PageProps) {
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

  // Fetch locations for this merchant
  const locations = await db
    .select()
    .from(merchantLocations)
    .where(eq(merchantLocations.merchantId, id))

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
        <Button variant="outline" asChild>
          <Link href={`/admin/merchants/${id}/edit`}>Edit</Link>
        </Button>
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
      <Card>
        <CardHeader>
          <CardTitle>Locations</CardTitle>
          <CardDescription>
            {locations.length === 0
              ? 'No locations found for this merchant'
              : `${locations.length} location${locations.length === 1 ? '' : 's'}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {locations.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center text-sm">
              No locations have been added yet.
            </div>
          ) : (
            <div className="space-y-4">
              {locations.map((location) => (
                <div key={location.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{location.name}</h3>
                        <Badge variant="outline" className="capitalize text-xs">
                          {location.status}
                        </Badge>
                      </div>
                      <div className="grid gap-2 text-sm md:grid-cols-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                          <div>
                            <div>{location.address}</div>
                            <div className="text-muted-foreground">
                              {location.postalCode} {location.city}
                            </div>
                          </div>
                        </div>
                        {location.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="text-muted-foreground size-4 shrink-0" />
                            <a href={`tel:${location.phone}`} className="hover:underline">
                              {location.phone}
                            </a>
                          </div>
                        )}
                        {location.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="text-muted-foreground size-4 shrink-0" />
                            <a href={`mailto:${location.email}`} className="hover:underline">
                              {location.email}
                            </a>
                          </div>
                        )}
                      </div>
                      {(location.logoUrl || location.bannerUrl) && (
                        <div className="flex gap-4 pt-2">
                          {location.logoUrl && (
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Logo</div>
                              <img
                                src={location.logoUrl}
                                alt={`${location.name} logo`}
                                className="h-16 w-16 rounded object-cover"
                              />
                            </div>
                          )}
                          {location.bannerUrl && (
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Banner</div>
                              <img
                                src={location.bannerUrl}
                                alt={`${location.name} banner`}
                                className="h-16 w-32 rounded object-cover"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

