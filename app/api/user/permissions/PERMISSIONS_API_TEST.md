# Permissions API Endpoint Tests

## Endpoint: `GET /api/user/permissions`

This endpoint returns the authenticated user's permissions, including:
- Platform admin status
- Merchant memberships
- Roles for each merchant
- Accessible locations for each merchant

## Response Structure

```json
{
  "userId": "user-uuid",
  "platformAdmin": true|false,
  "merchantMemberships": [
    {
      "merchantId": "merchant-uuid",
      "merchantName": "Merchant Name",
      "merchantLegalName": "Legal Name",
      "merchantStatus": "active",
      "businessType": "restaurant",
      "role": "owner" | "admin" | "manager",
      "locationAccess": ["location-id-1", "location-id-2"],
      "permissions": {},
      "accessibleLocations": [
        {
          "id": "location-id",
          "name": "Location Name",
          "address": "123 Main St",
          "city": "Brussels",
          "status": "active"
        }
      ],
      "allLocationsCount": 5,
      "accessibleLocationsCount": 5,
      "membershipCreatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "totalMerchants": 1
}
```

## Test Cases

### Test 1: Unauthenticated Request
**Request:**
```bash
curl http://localhost:3000/api/user/permissions
```

**Expected Response:**
- Status: `401 Unauthorized`
- Body: `{ "error": "Unauthorized" }`

### Test 2: Authenticated User with No Merchant Memberships
**Prerequisites:**
- User is logged in
- User has no merchant memberships

**Request:**
```bash
curl -H "Cookie: <session-cookie>" http://localhost:3000/api/user/permissions
```

**Expected Response:**
- Status: `200 OK`
- Body:
```json
{
  "userId": "user-uuid",
  "platformAdmin": false,
  "merchantMemberships": [],
  "totalMerchants": 0
}
```

### Test 3: Authenticated User with Merchant Membership (Owner)
**Prerequisites:**
- User is logged in
- User is an owner of at least one merchant
- Merchant has locations

**Request:**
```bash
curl -H "Cookie: <session-cookie>" http://localhost:3000/api/user/permissions
```

**Expected Response:**
- Status: `200 OK`
- Body should include:
  - `platformAdmin`: `false` (unless user is platform admin)
  - `merchantMemberships`: Array with at least one merchant
  - Each merchant should have:
    - `role`: `"owner"`
    - `accessibleLocations`: All locations for that merchant
    - `allLocationsCount` === `accessibleLocationsCount`

### Test 4: Authenticated User with Merchant Membership (Admin)
**Prerequisites:**
- User is logged in
- User is an admin of at least one merchant
- Merchant has locations

**Expected Response:**
- Status: `200 OK`
- Each merchant with admin role should have:
  - `role`: `"admin"`
  - `accessibleLocations`: All locations for that merchant
  - `allLocationsCount` === `accessibleLocationsCount`

### Test 5: Authenticated User with Merchant Membership (Manager)
**Prerequisites:**
- User is logged in
- User is a manager of at least one merchant
- Merchant has locations
- User has `locationAccess` array with specific location IDs

**Expected Response:**
- Status: `200 OK`
- Each merchant with manager role should have:
  - `role`: `"manager"`
  - `locationAccess`: Array of location IDs the manager can access
  - `accessibleLocations`: Only locations in the `locationAccess` array
  - `accessibleLocationsCount` <= `allLocationsCount`

### Test 6: Platform Admin User
**Prerequisites:**
- User is logged in
- User is a platform admin (super_admin role in platform_personnel)

**Expected Response:**
- Status: `200 OK`
- Body should include:
  - `platformAdmin`: `true`
  - May or may not have merchant memberships

### Test 7: User with Multiple Merchant Memberships
**Prerequisites:**
- User is logged in
- User has memberships in multiple merchants with different roles

**Expected Response:**
- Status: `200 OK`
- `merchantMemberships`: Array with multiple merchants
- `totalMerchants`: Should match the length of `merchantMemberships`
- Each merchant should have correct role and location access

### Test 8: Inactive Merchant Membership
**Prerequisites:**
- User is logged in
- User has an inactive merchant membership

**Expected Response:**
- Status: `200 OK`
- Inactive memberships should NOT appear in `merchantMemberships`
- Only active memberships should be returned

## Manual Testing Steps

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open browser and log in:**
   - Navigate to `http://localhost:3000/login`
   - Log in with test credentials

3. **Test the endpoint:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Run:
     ```javascript
     fetch('/api/user/permissions', {
       credentials: 'include'
     })
     .then(res => res.json())
     .then(data => console.log(JSON.stringify(data, null, 2)))
     ```

4. **Verify the response:**
   - Check that `userId` matches your logged-in user
   - Check that `platformAdmin` is correct
   - Check that `merchantMemberships` contains expected data
   - Verify roles and location access are correct

## Expected Behaviors

✅ **Should return:**
- User ID
- Platform admin status
- All active merchant memberships
- Correct roles for each merchant
- Accessible locations based on role:
  - Owners: All locations
  - Admins: All locations
  - Managers: Only locations in `locationAccess` array

❌ **Should NOT return:**
- Inactive merchant memberships
- Locations the user cannot access (for managers)
- Sensitive data beyond what's needed

## Notes

- The endpoint requires authentication
- Only active merchant memberships are returned
- Location access is filtered based on user role:
  - Owners and admins see all locations
  - Managers only see locations in their `locationAccess` array
- The endpoint uses optimized queries with joins to avoid N+1 problems

