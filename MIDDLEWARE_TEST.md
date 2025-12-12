# Middleware Route Protection Tests

This document describes how to test the route protection middleware.

## Protected Routes

### `/dashboard` Routes
- **Requirement**: Authentication only (any logged-in user)
- **Redirect**: Unauthenticated users → `/login`

### `/admin` Routes
- **Requirement**: Authentication + Platform Admin role
- **Redirect**: Unauthenticated users → `/login`
- **Redirect**: Authenticated but not platform admin → `/login`

## Testing Steps

### 1. Test Dashboard Protection (Authentication Required)

**Test Case 1: Unauthenticated User**
1. Open browser in incognito/private mode (or clear cookies)
2. Navigate to: `http://localhost:3000/dashboard`
3. **Expected**: Redirected to `/login` page
4. **Verify**: Check browser console for middleware logs:
   ```
   [middleware] route protection check { path: '/dashboard' }
   [middleware] dashboard route check { userId: undefined, ... }
   [middleware] dashboard access denied - not authenticated
   ```

**Test Case 2: Authenticated User**
1. Log in to the application
2. Navigate to: `http://localhost:3000/dashboard`
3. **Expected**: Dashboard page loads successfully
4. **Verify**: Check browser console for middleware logs:
   ```
   [middleware] route protection check { path: '/dashboard' }
   [middleware] dashboard route check { userId: '...', ... }
   [middleware] dashboard access granted { userId: '...' }
   ```

### 2. Test Admin Protection (Platform Admin Required)

**Test Case 3: Unauthenticated User**
1. Open browser in incognito/private mode (or clear cookies)
2. Navigate to: `http://localhost:3000/admin`
3. **Expected**: Redirected to `/login` page
4. **Verify**: Check browser console for middleware logs:
   ```
   [middleware] route protection check { path: '/admin' }
   [middleware] admin route check { userId: undefined, ... }
   [middleware] admin access denied - not authenticated
   ```

**Test Case 4: Authenticated User (Not Platform Admin)**
1. Log in with a regular user account (not a platform admin)
2. Navigate to: `http://localhost:3000/admin`
3. **Expected**: Redirected to `/login` page
4. **Verify**: Check browser console for middleware logs:
   ```
   [middleware] route protection check { path: '/admin' }
   [middleware] admin route check { userId: '...', ... }
   [middleware] platform admin check { userId: '...', isAdmin: false }
   [middleware] admin access denied - not platform admin
   ```

**Test Case 5: Authenticated Platform Admin**
1. Log in with a platform admin account
2. Navigate to: `http://localhost:3000/admin`
3. **Expected**: Admin page loads successfully
4. **Verify**: Check browser console for middleware logs:
   ```
   [middleware] route protection check { path: '/admin' }
   [middleware] admin route check { userId: '...', ... }
   [middleware] platform admin check { userId: '...', isAdmin: true }
   [middleware] admin access granted { userId: '...' }
   ```

### 3. Test Nested Routes

**Test Case 6: Nested Dashboard Route**
1. As unauthenticated user, navigate to: `http://localhost:3000/dashboard/settings`
2. **Expected**: Redirected to `/login`

**Test Case 7: Nested Admin Route**
1. As non-admin user, navigate to: `http://localhost:3000/admin/merchants`
2. **Expected**: Redirected to `/login`

## Manual Testing Checklist

- [ ] Unauthenticated user cannot access `/dashboard`
- [ ] Authenticated user can access `/dashboard`
- [ ] Unauthenticated user cannot access `/admin`
- [ ] Authenticated non-admin user cannot access `/admin`
- [ ] Platform admin user can access `/admin`
- [ ] Nested routes under `/dashboard` are protected
- [ ] Nested routes under `/admin` are protected
- [ ] Redirects work correctly (no infinite loops)
- [ ] Middleware logs appear in console

## Notes

- The middleware runs on the server side, so you'll see logs in the terminal where Next.js is running, not just in the browser console
- Make sure to test with different user roles to verify all permission levels
- The middleware uses the `isPlatformAdmin()` function from `lib/permissions.ts` for role checking
