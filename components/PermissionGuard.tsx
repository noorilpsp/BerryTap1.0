'use client'

import { usePermissionsContext } from '@/lib/contexts/PermissionsContext'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import { ReactNode } from 'react'

type PermissionGuardProps = {
  children: ReactNode
  requirePlatformAdmin?: boolean
  requireMerchantAccess?: string // merchantId
  requireLocationAccess?: string // locationId
  requireRole?: 'owner' | 'admin' | 'manager'
  merchantId?: string // For role check
  fallback?: ReactNode
  showLoading?: boolean
}

export function PermissionGuard({
  children,
  requirePlatformAdmin,
  requireMerchantAccess,
  requireLocationAccess,
  requireRole,
  merchantId,
  fallback,
  showLoading = true,
}: PermissionGuardProps) {
  const {
    permissions,
    loading,
    isPlatformAdmin,
    hasMerchantAccess,
    canAccessLocation,
    getUserRole,
  } = usePermissionsContext()

  if (loading && showLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    )
  }

  if (!permissions) {
    return (
      fallback ?? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>Unable to verify permissions.</AlertDescription>
        </Alert>
      )
    )
  }

  // Check platform admin requirement
  if (requirePlatformAdmin && !isPlatformAdmin) {
    return (
      fallback ?? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            This page requires platform administrator access.
          </AlertDescription>
        </Alert>
      )
    )
  }

  // Check merchant access requirement
  if (requireMerchantAccess && !hasMerchantAccess(requireMerchantAccess)) {
    return (
      fallback ?? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have access to this merchant.
          </AlertDescription>
        </Alert>
      )
    )
  }

  // Check location access requirement
  if (requireLocationAccess && !canAccessLocation(requireLocationAccess)) {
    return (
      fallback ?? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have access to this location.
          </AlertDescription>
        </Alert>
      )
    )
  }

  // Check role requirement
  if (requireRole && merchantId) {
    const userRole = getUserRole(merchantId)
    const roleHierarchy: Record<'owner' | 'admin' | 'manager', number> = {
      owner: 3,
      admin: 2,
      manager: 1,
    }

    if (
      !userRole ||
      roleHierarchy[userRole] < roleHierarchy[requireRole]
    ) {
      return (
        fallback ?? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              This page requires {requireRole} role or higher.
            </AlertDescription>
          </Alert>
        )
      )
    }
  }

  return <>{children}</>
}

