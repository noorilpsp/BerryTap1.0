# Permission Checks Components - Summary

## Components Created

### 1. PermissionButton Component
**Location:** `components/PermissionButton.tsx`

A button component that conditionally renders based on permissions.

**Features:**
- Hides or shows button based on permission checks
- Supports platform admin, merchant access, location access, and role checks
- Supports minimum role requirements (e.g., admin or higher)
- Can hide button completely or show fallback content

**Usage:**
```tsx
<PermissionButton
  requireMinRole="admin"
  merchantId="merchant-id"
  hideIfNoAccess={true}
  variant="outline"
>
  Edit Merchant
</PermissionButton>
```

### 2. ConditionalRender Component
**Location:** `components/ConditionalRender.tsx`

A component that conditionally renders children based on permissions.

**Usage:**
```tsx
<ConditionalRender requirePlatformAdmin>
  <AdminOnlyContent />
</ConditionalRender>

<ConditionalRender requireMinRole="owner" merchantId="merchant-id">
  <OwnerOnlySettings />
</ConditionalRender>
```

### 3. Permission Helper Functions
**Location:** `lib/utils/permissions.ts`

Utility functions for permission checks:
- `hasRole()` - Check exact role
- `hasMinRole()` - Check minimum role level
- `canEditMerchant()` - Check if user can edit
- `canDeleteMerchant()` - Check if user can delete
- `canManageLocations()` - Check location management access
- `canAccessLocation()` - Check location access
- `getUserRole()` - Get user's role for merchant
- `canPerformAction()` - Generic action checker

### 4. Merchant Actions Component
**Location:** `app/admin/merchants/[id]/components/MerchantActions.tsx`

Action buttons for merchant detail page with permission checks:
- Edit button (admin+)
- Settings button (owner+)
- Delete button (owner only)

### 5. Locations List Component
**Location:** `app/admin/merchants/[id]/components/LocationsList.tsx`

Filtered locations list based on user access:
- Platform admins see all locations
- Owners/admins see all locations for their merchant
- Managers see only assigned locations

### 6. New Merchant Button Component
**Location:** `app/admin/merchants/components/NewMerchantButton.tsx`

"New Merchant" button that only shows for platform admins.

## Integration Points

### Updated Components

1. **Merchant Detail Page** (`app/admin/merchants/[id]/page.tsx`)
   - Uses `MerchantActions` component for permission-based buttons
   - Uses `LocationsList` component for filtered locations

2. **Merchants List Page** (`app/admin/merchants/page.tsx`)
   - Uses `NewMerchantButton` component (platform admin only)

3. **Merchant Table Row** (`app/admin/merchants/components/MerchantTableRow.tsx`)
   - Shows role badges based on user's role for each merchant
   - Platform admins see "Admin" badge for all merchants

## Permission Matrix

### Button Visibility

| Button | Platform Admin | Owner | Admin | Manager |
|--------|---------------|-------|-------|---------|
| New Merchant | ✅ | ❌ | ❌ | ❌ |
| Edit Merchant | ✅ | ✅ | ✅ | ❌ |
| Settings | ✅ | ✅ | ❌ | ❌ |
| Delete Merchant | ✅ | ✅ | ❌ | ❌ |

### Location Access

| User Role | Location Visibility |
|-----------|-------------------|
| Platform Admin | All locations (all merchants) |
| Owner | All locations (their merchant) |
| Admin | All locations (their merchant) |
| Manager | Only assigned locations |

## Testing

See `PERMISSION_CHECKS_TEST.md` for comprehensive testing guide.

## Key Features

✅ **Role-based UI**: Buttons and content show/hide based on user role
✅ **Location filtering**: Managers only see assigned locations
✅ **Reusable components**: PermissionButton and ConditionalRender can be used anywhere
✅ **Helper functions**: Easy-to-use utility functions for permission checks
✅ **Type-safe**: Full TypeScript support
✅ **Performance**: Uses context to avoid unnecessary re-renders

## Next Steps

Consider adding permission checks to:
- Location detail pages
- User management pages
- Settings pages
- Report pages
- Any other merchant-specific features

