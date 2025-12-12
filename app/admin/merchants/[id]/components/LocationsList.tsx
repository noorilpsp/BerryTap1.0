'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Phone, Mail } from 'lucide-react'
import { usePermissionsContext } from '@/lib/contexts/PermissionsContext'
import { ConditionalRender } from '@/components/ConditionalRender'

type Location = {
  id: string
  name: string
  address: string
  postalCode: string
  city: string
  phone: string | null
  email: string | null
  status: string
  logoUrl: string | null
  bannerUrl: string | null
}

type LocationsListProps = {
  locations: Location[]
  merchantId: string
}

export function LocationsList({ locations, merchantId }: LocationsListProps) {
  const { canAccessLocation, isPlatformAdmin } = usePermissionsContext()

  // Filter locations based on user access
  // Platform admins can see all locations
  // Regular users can only see locations they have access to
  const accessibleLocations = isPlatformAdmin
    ? locations
    : locations.filter((location) => canAccessLocation(location.id))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Locations</CardTitle>
        <CardDescription>
          {accessibleLocations.length === 0
            ? 'No accessible locations found'
            : `${accessibleLocations.length} of ${locations.length} location${locations.length === 1 ? '' : 's'} accessible`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {accessibleLocations.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center text-sm">
            {locations.length === 0
              ? 'No locations have been added yet.'
              : "You don't have access to any locations for this merchant."}
          </div>
        ) : (
          <div className="space-y-4">
            {accessibleLocations.map((location) => (
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
  )
}

