'use client'

import { usePermissions } from '@/lib/hooks/usePermissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, MapPin, ShieldCheck, Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function DashboardContent() {
  const { permissions, loading, error } = usePermissions()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading permissions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!permissions) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No permissions data</AlertTitle>
        <AlertDescription>Unable to load your permissions.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Account Information
          </CardTitle>
          <CardDescription>Your account details and permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">User ID</p>
              <p className="font-mono text-sm">{permissions.userId}</p>
            </div>
            {permissions.platformAdmin && (
              <Badge variant="default" className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Platform Admin
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Merchant Memberships */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Merchant Memberships</h2>
        {permissions.totalMerchants === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">You are not a member of any merchants yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {permissions.merchantMemberships.map((membership) => (
              <Card key={membership.merchantId}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{membership.merchantName}</CardTitle>
                      <CardDescription className="mt-1">
                        {membership.merchantLegalName}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        membership.role === 'owner'
                          ? 'default'
                          : membership.role === 'admin'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {membership.role}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="outline" className="capitalize">
                      {membership.merchantStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Business Type</span>
                    <span className="capitalize">{membership.businessType}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Locations
                    </span>
                    <span>
                      {membership.accessibleLocationsCount} / {membership.allLocationsCount}
                    </span>
                  </div>
                  {membership.accessibleLocations.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Accessible Locations:</p>
                      <div className="space-y-1">
                        {membership.accessibleLocations.slice(0, 3).map((location) => (
                          <div
                            key={location.id}
                            className="text-xs flex items-center gap-2 text-muted-foreground"
                          >
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{location.name}</span>
                          </div>
                        ))}
                        {membership.accessibleLocations.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{membership.accessibleLocations.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

