# Permissions Integration Summary

This document describes how the permissions API has been integrated throughout the application.

## Components Created

### 1. Custom Hook: `usePermissions`
**Location:** `lib/hooks/usePermissions.ts`

A React hook that fetches user permissions from `/api/user/permissions`.

**Usage:**
```typescript
import { usePermissions } from '@/lib/hooks/usePermissions'

function MyComponent() {
  const { permissions, loading, error, refetch } = usePermissions()
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return (
    <div>
      <p>Platform Admin: {permissions?.platformAdmin ? 'Yes' : 'No'}</p>
      <p>Merchants: {permissions?.totalMerchants}</p>
    </div>
  )
}
```

### 2. Permissions Context Provider
**Location:** `lib/contexts/PermissionsContext.tsx`

A React context that provides permissions data and helper functions throughout the app.

**Features:**
- `isPlatformAdmin`: Check if user is platform admin
- `hasMerchantAccess(merchantId)`: Check if user has access to a merchant
- `canAccessLocation(locationId)`: Check if user can access a location
- `getUserRole(merchantId)`: Get user's role for a merchant

**Usage:**
```typescript
import { usePermissionsContext } from '@/lib/contexts/PermissionsContext'

function MyComponent() {
  const { isPlatformAdmin, hasMerchantAccess, getUserRole } = usePermissionsContext()
  
  const canEdit = isPlatformAdmin || getUserRole('merchant-id') === 'owner'
  
  return <div>{canEdit && <EditButton />}</div>
}
```

### 3. Permission Guard Component
**Location:** `components/PermissionGuard.tsx`

A component that conditionally renders children based on permission checks.

**Usage:**
```typescript
import { PermissionGuard } from '@/components/PermissionGuard'

// Require platform admin
<PermissionGuard requirePlatformAdmin>
  <AdminPanel />
</PermissionGuard>

// Require merchant access
<PermissionGuard requireMerchantAccess="merchant-id">
  <MerchantDetails />
</PermissionGuard>

// Require specific role
<PermissionGuard requireRole="owner" merchantId="merchant-id">
  <OwnerOnlySettings />
</PermissionGuard>

// Require location access
<PermissionGuard requireLocationAccess="location-id">
  <LocationDetails />
</PermissionGuard>
```

## Integration Points

### 1. Dashboard Page
**Location:** `app/dashboard/page.tsx` and `app/dashboard/components/DashboardContent.tsx`

**What it does:**
- Displays user's merchant memberships
- Shows role badges (Owner/Admin/Manager)
- Lists accessible locations for each merchant
- Shows platform admin status
- Displays merchant status and business type

**Features:**
- Loading state with spinner
- Error handling with alerts
- Empty state when no merchants
- Responsive grid layout for merchant cards

### 2. Admin Sidebar
**Location:** `app/admin/components/AdminSidebar.tsx`

**What it does:**
- Dynamically shows user access level in footer
- Displays "Super admin" for platform admins
- Shows merchant count for regular users
- Updates badge based on permissions

**Before:** Hardcoded "Super admin" text
**After:** Dynamic based on actual permissions

### 3. Root Layout
**Location:** `app/layout.tsx`

**What it does:**
- Wraps entire app with `PermissionsProvider`
- Makes permissions context available everywhere
- Enables permission checks in any component

## Usage Examples

### Example 1: Check Platform Admin in Component
```typescript
'use client'

import { usePermissionsContext } from '@/lib/contexts/PermissionsContext'

export function AdminButton() {
  const { isPlatformAdmin } = usePermissionsContext()
  
  if (!isPlatformAdmin) return null
  
  return <button>Admin Only Action</button>
}
```

### Example 2: Protect Merchant Page
```typescript
'use client'

import { PermissionGuard } from '@/components/PermissionGuard'

export default function MerchantPage({ merchantId }: { merchantId: string }) {
  return (
    <PermissionGuard requireMerchantAccess={merchantId}>
      <MerchantContent merchantId={merchantId} />
    </PermissionGuard>
  )
}
```

### Example 3: Role-Based UI
```typescript
'use client'

import { usePermissionsContext } from '@/lib/contexts/PermissionsContext'

export function MerchantActions({ merchantId }: { merchantId: string }) {
  const { getUserRole } = usePermissionsContext()
  const role = getUserRole(merchantId)
  
  return (
    <div>
      {role === 'owner' && <DeleteMerchantButton />}
      {(role === 'owner' || role === 'admin') && <EditMerchantButton />}
      {role && <ViewMerchantButton />}
    </div>
  )
}
```

### Example 4: Location Access Check
```typescript
'use client'

import { usePermissionsContext } from '@/lib/contexts/PermissionsContext'

export function LocationCard({ locationId }: { locationId: string }) {
  const { canAccessLocation } = usePermissionsContext()
  
  if (!canAccessLocation(locationId)) {
    return <div>You don't have access to this location</div>
  }
  
  return <LocationDetails locationId={locationId} />
}
```

## API Endpoint

**Endpoint:** `GET /api/user/permissions`

**Response:**
```json
{
  "userId": "user-uuid",
  "platformAdmin": true,
  "merchantMemberships": [
    {
      "merchantId": "merchant-uuid",
      "merchantName": "Merchant Name",
      "role": "owner",
      "accessibleLocations": [...],
      "allLocationsCount": 5,
      "accessibleLocationsCount": 5
    }
  ],
  "totalMerchants": 1
}
```

## Benefits

1. **Centralized Permission Logic**: All permission checks use the same data source
2. **Reusable Components**: PermissionGuard can be used anywhere
3. **Type Safety**: Full TypeScript support with proper types
4. **Performance**: Context provider prevents unnecessary re-fetches
5. **User Experience**: Clear loading states and error messages
6. **Security**: Client-side checks complement server-side validation

## Next Steps

Consider integrating permissions in:
- Merchant detail pages (check access before showing)
- Location pages (verify location access)
- Action buttons (show/hide based on role)
- Navigation menus (filter based on permissions)
- API route protection (already done server-side)

## Testing

To test the integration:
1. Log in as different user types (platform admin, merchant owner, manager)
2. Check dashboard shows correct merchant memberships
3. Verify admin sidebar shows correct access level
4. Test PermissionGuard with different requirements
5. Verify permission checks work in components

