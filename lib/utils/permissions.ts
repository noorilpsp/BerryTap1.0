/**
 * Frontend permission helper functions
 * These functions work with the permissions context to provide
 * easy-to-use permission checks in components
 */

import type { UserPermissions, MerchantMembership } from '@/lib/hooks/usePermissions'

/**
 * Check if user has a specific role for a merchant
 */
export function hasRole(
  permissions: UserPermissions | null,
  merchantId: string,
  role: 'owner' | 'admin' | 'manager',
): boolean {
  if (!permissions) return false
  const membership = permissions.merchantMemberships.find(
    (m) => m.merchantId === merchantId,
  )
  return membership?.role === role
}

/**
 * Check if user has minimum role level for a merchant
 * Role hierarchy: owner > admin > manager
 */
export function hasMinRole(
  permissions: UserPermissions | null,
  merchantId: string,
  minRole: 'owner' | 'admin' | 'manager',
): boolean {
  if (!permissions) return false
  const membership = permissions.merchantMemberships.find(
    (m) => m.merchantId === merchantId,
  )
  if (!membership) return false

  const roleHierarchy: Record<'owner' | 'admin' | 'manager', number> = {
    owner: 3,
    admin: 2,
    manager: 1,
  }

  return roleHierarchy[membership.role] >= roleHierarchy[minRole]
}

/**
 * Check if user can edit a merchant
 * Owners and admins can edit, managers cannot
 */
export function canEditMerchant(
  permissions: UserPermissions | null,
  merchantId: string,
): boolean {
  if (!permissions) return false
  // Platform admins can edit any merchant
  if (permissions.platformAdmin) return true
  return hasMinRole(permissions, merchantId, 'admin')
}

/**
 * Check if user can delete a merchant
 * Only owners and platform admins can delete
 */
export function canDeleteMerchant(
  permissions: UserPermissions | null,
  merchantId: string,
): boolean {
  if (!permissions) return false
  // Platform admins can delete any merchant
  if (permissions.platformAdmin) return true
  return hasRole(permissions, merchantId, 'owner')
}

/**
 * Check if user can manage locations for a merchant
 * Owners and admins can manage all locations, managers can only view assigned ones
 */
export function canManageLocations(
  permissions: UserPermissions | null,
  merchantId: string,
): boolean {
  if (!permissions) return false
  if (permissions.platformAdmin) return true
  return hasMinRole(permissions, merchantId, 'admin')
}

/**
 * Check if user can access a specific location
 */
export function canAccessLocation(
  permissions: UserPermissions | null,
  locationId: string,
): boolean {
  if (!permissions) return false
  if (permissions.platformAdmin) return true
  return permissions.merchantMemberships.some((membership) =>
    membership.accessibleLocations.some((loc) => loc.id === locationId),
  )
}

/**
 * Get user's role for a merchant
 */
export function getUserRole(
  permissions: UserPermissions | null,
  merchantId: string,
): 'owner' | 'admin' | 'manager' | null {
  if (!permissions) return null
  const membership = permissions.merchantMemberships.find(
    (m) => m.merchantId === merchantId,
  )
  return membership?.role ?? null
}

/**
 * Get all accessible location IDs for a merchant
 */
export function getAccessibleLocationIds(
  permissions: UserPermissions | null,
  merchantId: string,
): string[] {
  if (!permissions) return []
  const membership = permissions.merchantMemberships.find(
    (m) => m.merchantId === merchantId,
  )
  return membership?.accessibleLocations.map((loc) => loc.id) ?? []
}

/**
 * Check if user can perform an action based on role
 */
export function canPerformAction(
  permissions: UserPermissions | null,
  merchantId: string | undefined,
  action: 'view' | 'edit' | 'delete' | 'manage_locations',
): boolean {
  if (!permissions) return false
  if (permissions.platformAdmin) return true
  if (!merchantId) return false

  switch (action) {
    case 'view':
      return hasMerchantAccess(permissions, merchantId)
    case 'edit':
      return canEditMerchant(permissions, merchantId)
    case 'delete':
      return canDeleteMerchant(permissions, merchantId)
    case 'manage_locations':
      return canManageLocations(permissions, merchantId)
    default:
      return false
  }
}

/**
 * Check if user has access to a merchant
 */
export function hasMerchantAccess(
  permissions: UserPermissions | null,
  merchantId: string,
): boolean {
  if (!permissions) return false
  if (permissions.platformAdmin) return true
  return permissions.merchantMemberships.some(
    (m) => m.merchantId === merchantId,
  )
}

