# Permission Checks Testing Guide

This document describes how to test permission-based UI elements with different user roles.

## Test User Roles

To test permission checks, you'll need users with different roles:

1. **Platform Admin** - Has `super_admin` role in `platform_personnel` table
2. **Merchant Owner** - Has `owner` role in `merchant_users` table for a merchant
3. **Merchant Admin** - Has `admin` role in `merchant_users` table for a merchant
4. **Merchant Manager** - Has `manager` role in `merchant_users` table for a merchant
5. **Regular User** - No merchant memberships, not platform admin

## Components with Permission Checks

### 1. Dashboard Page (`/dashboard`)

**What to Test:**
- Merchant memberships display
- Role badges (Owner/Admin/Manager)
- Accessible locations count
- Platform admin badge

**Test Cases:**

| User Role | Expected Behavior |
|-----------|------------------|
| Platform Admin | Shows "Platform Admin" badge, may show merchant memberships if any |
| Merchant Owner | Shows all merchant cards with "owner" badge, all locations accessible |
| Merchant Admin | Shows merchant cards with "admin" badge, all locations accessible |
| Merchant Manager | Shows merchant cards with "manager" badge, only assigned locations shown |
| Regular User | Shows "No merchants" message |

**Steps:**
1. Log in as each user type
2. Navigate to `/dashboard`
3. Verify:
   - Correct merchant memberships displayed
   - Correct role badges
   - Correct location counts
   - Platform admin status (if applicable)

### 2. Admin Sidebar (`/admin`)

**What to Test:**
- Footer access level display
- Badge showing admin/user status

**Test Cases:**

| User Role | Expected Footer Display |
|-----------|------------------------|
| Platform Admin | "Super admin" / "Admin" badge |
| Merchant User | "{N} merchant(s)" / "User" badge |
| Regular User | "No access" / "User" badge |

**Steps:**
1. Log in as each user type
2. Navigate to `/admin`
3. Check sidebar footer for correct access level

### 3. Merchants List Page (`/admin/merchants`)

**What to Test:**
- "New Merchant" button visibility
- Role badges in merchant table rows
- Merchant row clickability

**Test Cases:**

| User Role | "New Merchant" Button | Role Badge in Table |
|-----------|----------------------|---------------------|
| Platform Admin | ✅ Visible | Shows "Admin" badge for all merchants |
| Merchant Owner | ❌ Hidden | Shows "owner" badge for their merchant |
| Merchant Admin | ❌ Hidden | Shows "admin" badge for their merchant |
| Merchant Manager | ❌ Hidden | Shows "manager" badge for their merchant |
| Regular User | ❌ Hidden | No badges (no merchant access) |

**Steps:**
1. Log in as each user type
2. Navigate to `/admin/merchants`
3. Verify:
   - "New Merchant" button only visible to platform admins
   - Role badges show correctly in table rows
   - Can click on merchants they have access to

### 4. Merchant Detail Page (`/admin/merchants/[id]`)

**What to Test:**
- Edit button visibility
- Settings button visibility
- Delete button visibility
- Locations list filtering

**Test Cases:**

#### Edit Button

| User Role | Edit Button |
|-----------|-------------|
| Platform Admin | ✅ Visible |
| Merchant Owner | ✅ Visible |
| Merchant Admin | ✅ Visible |
| Merchant Manager | ❌ Hidden |
| Regular User | ❌ Hidden |

#### Settings Button

| User Role | Settings Button |
|-----------|-----------------|
| Platform Admin | ✅ Visible |
| Merchant Owner | ✅ Visible |
| Merchant Admin | ❌ Hidden |
| Merchant Manager | ❌ Hidden |
| Regular User | ❌ Hidden |

#### Delete Button

| User Role | Delete Button |
|-----------|---------------|
| Platform Admin | ✅ Visible |
| Merchant Owner | ✅ Visible |
| Merchant Admin | ❌ Hidden |
| Merchant Manager | ❌ Hidden |
| Regular User | ❌ Hidden |

#### Locations List

| User Role | Locations Shown |
|-----------|-----------------|
| Platform Admin | All locations |
| Merchant Owner | All locations |
| Merchant Admin | All locations |
| Merchant Manager | Only locations in `locationAccess` array |
| Regular User | No locations (no merchant access) |

**Steps:**
1. Log in as each user type
2. Navigate to a merchant detail page
3. Verify:
   - Correct buttons are visible/hidden
   - Locations list shows only accessible locations
   - Description shows "X of Y locations accessible" for managers

### 5. Permission Guard Component

**What to Test:**
- Conditional rendering based on permissions
- Fallback content display
- Loading states

**Test Cases:**

```tsx
// Test 1: Platform Admin Only
<PermissionGuard requirePlatformAdmin>
  <AdminPanel />
</PermissionGuard>
// Expected: Only platform admins see AdminPanel

// Test 2: Merchant Access
<PermissionGuard requireMerchantAccess="merchant-id">
  <MerchantContent />
</PermissionGuard>
// Expected: Only users with access to merchant see content

// Test 3: Role Requirement
<PermissionGuard requireRole="owner" merchantId="merchant-id">
  <OwnerOnlyContent />
</PermissionGuard>
// Expected: Only owners see content

// Test 4: Minimum Role
<PermissionGuard requireMinRole="admin" merchantId="merchant-id">
  <AdminOrOwnerContent />
</PermissionGuard>
// Expected: Owners and admins see content, managers don't
```

## Manual Testing Checklist

### Setup Test Users

1. **Create Platform Admin:**
   ```sql
   INSERT INTO platform_personnel (user_id, role, is_active)
   VALUES ('user-uuid', 'super_admin', true);
   ```

2. **Create Merchant Owner:**
   ```sql
   INSERT INTO merchant_users (id, merchant_id, user_id, role, is_active)
   VALUES ('uuid', 'merchant-uuid', 'user-uuid', 'owner', true);
   ```

3. **Create Merchant Admin:**
   ```sql
   INSERT INTO merchant_users (id, merchant_id, user_id, role, is_active)
   VALUES ('uuid', 'merchant-uuid', 'user-uuid', 'admin', true);
   ```

4. **Create Merchant Manager:**
   ```sql
   INSERT INTO merchant_users (id, merchant_id, user_id, role, location_access, is_active)
   VALUES ('uuid', 'merchant-uuid', 'user-uuid', 'manager', '["location-id-1"]', true);
   ```

### Test Scenarios

#### Scenario 1: Platform Admin
- [ ] Can see "New Merchant" button
- [ ] Can see all merchants in list
- [ ] Can see all action buttons on merchant detail page
- [ ] Can see all locations for any merchant
- [ ] Dashboard shows "Platform Admin" badge

#### Scenario 2: Merchant Owner
- [ ] Cannot see "New Merchant" button
- [ ] Can see only their merchant(s) in list
- [ ] Can see Edit, Settings, and Delete buttons
- [ ] Can see all locations for their merchant
- [ ] Dashboard shows "owner" badge for their merchant

#### Scenario 3: Merchant Admin
- [ ] Cannot see "New Merchant" button
- [ ] Can see only their merchant(s) in list
- [ ] Can see Edit button, but NOT Settings or Delete
- [ ] Can see all locations for their merchant
- [ ] Dashboard shows "admin" badge for their merchant

#### Scenario 4: Merchant Manager
- [ ] Cannot see "New Merchant" button
- [ ] Can see only their merchant(s) in list
- [ ] Cannot see Edit, Settings, or Delete buttons
- [ ] Can see only assigned locations (from `locationAccess` array)
- [ ] Dashboard shows "manager" badge and filtered location count

#### Scenario 5: Regular User
- [ ] Cannot see "New Merchant" button
- [ ] Cannot see any merchants in list (or sees but can't access)
- [ ] Cannot access merchant detail pages
- [ ] Dashboard shows "No merchants" message

## Testing Helper Functions

### Using Browser Console

1. **Check current permissions:**
   ```javascript
   fetch('/api/user/permissions', { credentials: 'include' })
     .then(res => res.json())
     .then(data => console.log(data))
   ```

2. **Verify permission context:**
   ```javascript
   // In a component with permissions context
   const { permissions, isPlatformAdmin, getUserRole } = usePermissionsContext()
   console.log('Platform Admin:', isPlatformAdmin)
   console.log('Role for merchant:', getUserRole('merchant-id'))
   ```

## Expected Behaviors Summary

### Button Visibility Matrix

| Action | Platform Admin | Owner | Admin | Manager | Regular User |
|--------|---------------|-------|-------|---------|--------------|
| Create Merchant | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit Merchant | ✅ | ✅ | ✅ | ❌ | ❌ |
| Settings | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete Merchant | ✅ | ✅ | ❌ | ❌ | ❌ |
| View All Locations | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Assigned Locations | ✅ | ✅ | ✅ | ✅ | ❌ |

### Location Access Matrix

| User Role | Location Access |
|-----------|----------------|
| Platform Admin | All locations (all merchants) |
| Owner | All locations (their merchant) |
| Admin | All locations (their merchant) |
| Manager | Only locations in `locationAccess` array |
| Regular User | No locations |

## Troubleshooting

### Issue: Buttons not showing/hiding correctly

**Check:**
1. Permissions context is loaded: `permissions` should not be `null`
2. User has correct role in database
3. Merchant membership is active (`is_active = true`)
4. Browser console for errors

### Issue: Locations not filtering correctly

**Check:**
1. Manager's `location_access` array contains correct location IDs
2. Location IDs match between `merchant_locations` and `location_access`
3. User role is correctly set to `manager`

### Issue: Permission checks not working

**Check:**
1. `PermissionsProvider` wraps the app in `app/layout.tsx`
2. Component is a client component (`'use client'`)
3. Using `usePermissionsContext()` hook correctly
4. API endpoint `/api/user/permissions` returns correct data

## Notes

- All permission checks are **client-side** and should be complemented with **server-side** validation
- Permission checks are for **UX only** - never rely solely on client-side checks for security
- The middleware and API routes already have server-side permission checks
- Permission data is cached in context to avoid unnecessary API calls

