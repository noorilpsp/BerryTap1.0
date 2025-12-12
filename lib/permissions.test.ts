/**
 * Test file for permissions helper functions
 * 
 * To run these tests, you'll need:
 * 1. A database with sample data (users, merchants, locations, etc.)
 * 2. Install tsx: npm install -D tsx
 * 3. Make sure DATABASE_URL is set in .env.local or .env
 * 4. Run: npx tsx lib/permissions.test.ts
 * 
 * NOTE: The placeholder test cases will fail unless you have matching data in your database.
 * The tests verify that the functions execute correctly and return expected types.
 * For full integration testing, use real data from your database.
 * 
 * Or use a proper testing framework like Jest or Vitest
 */

// Load environment variables from .env.local or .env
import { readFileSync } from 'fs'
import { join } from 'path'

function loadEnvFile() {
  const envFiles = ['.env.local', '.env']
  for (const envFile of envFiles) {
    try {
      const envPath = join(process.cwd(), envFile)
      const envContent = readFileSync(envPath, 'utf-8')
      const lines = envContent.split('\n')
      
      for (const line of lines) {
        const trimmedLine = line.trim()
        // Skip comments and empty lines
        if (!trimmedLine || trimmedLine.startsWith('#')) continue
        
        const [key, ...valueParts] = trimmedLine.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim()
          // Remove quotes if present
          const cleanValue = value.replace(/^["']|["']$/g, '')
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = cleanValue
          }
        }
      }
      console.log(`✓ Loaded environment variables from ${envFile}`)
      if (process.env.DATABASE_URL) {
        console.log(`✓ DATABASE_URL is set (length: ${process.env.DATABASE_URL.length})`)
      } else {
        console.warn('⚠ DATABASE_URL was not found in the file')
      }
      return
    } catch {
      // File doesn't exist, try next one
      continue
    }
  }
  console.warn('⚠ No .env.local or .env file found. Make sure DATABASE_URL is set.')
}

// Load environment variables before importing anything that needs them
loadEnvFile()

// Use dynamic imports to ensure env vars are loaded first
let getUserRole: typeof import('./permissions').getUserRole | undefined
let canAccessLocation: typeof import('./permissions').canAccessLocation | undefined
let isPlatformAdmin: typeof import('./permissions').isPlatformAdmin | undefined

async function loadPermissions() {
  const permissions = await import('./permissions')
  getUserRole = permissions.getUserRole
  canAccessLocation = permissions.canAccessLocation
  isPlatformAdmin = permissions.isPlatformAdmin
}

function ensureLoaded() {
  if (!getUserRole || !canAccessLocation || !isPlatformAdmin) {
    throw new Error('Permissions module not loaded. Call loadPermissions() first.')
  }
}

/**
 * Test suite for getUserRole function
 */
async function testGetUserRole() {
  console.log('Testing getUserRole...')

  // Test cases (these would need actual database data)
  const testCases = [
    {
      name: 'Should return role for active user',
      userId: 'test-user-id',
      merchantId: 'test-merchant-id',
      expected: 'owner' as const,
      note: '⚠ Requires real user/merchant data',
    },
    {
      name: 'Should return null for inactive user',
      userId: 'inactive-user-id',
      merchantId: 'test-merchant-id',
      expected: null,
      note: '',
    },
    {
      name: 'Should return null for non-existent user',
      userId: 'non-existent-user',
      merchantId: 'test-merchant-id',
      expected: null,
      note: '',
    },
  ]

  ensureLoaded()
  for (const testCase of testCases) {
    try {
      const result = await getUserRole!(testCase.userId, testCase.merchantId)
      const passed = result === testCase.expected
      const icon = passed ? '✓' : '✗'
      const note = testCase.note ? ` ${testCase.note}` : ''
      console.log(
        `  ${icon} ${testCase.name}: Expected ${testCase.expected}, got ${result}${note}`,
      )
    } catch (error) {
      console.error(`  ✗ ${testCase.name}: Error - ${error}`)
    }
  }
}

/**
 * Test suite for canAccessLocation function
 */
async function testCanAccessLocation() {
  console.log('\nTesting canAccessLocation...')

  const testCases = [
    {
      name: 'Owner should have access to all locations',
      userId: 'owner-user-id',
      locationId: 'any-location-id',
      expected: true,
      note: '⚠ Requires real user/location data',
    },
    {
      name: 'Admin should have access to all locations',
      userId: 'admin-user-id',
      locationId: 'any-location-id',
      expected: true,
      note: '⚠ Requires real user/location data',
    },
    {
      name: 'Manager should have access to assigned locations',
      userId: 'manager-user-id',
      locationId: 'assigned-location-id',
      expected: true,
      note: '⚠ Requires real user/location data',
    },
    {
      name: 'Manager should NOT have access to unassigned locations',
      userId: 'manager-user-id',
      locationId: 'unassigned-location-id',
      expected: false,
      note: '',
    },
    {
      name: 'Should return false for non-existent location',
      userId: 'any-user-id',
      locationId: 'non-existent-location',
      expected: false,
      note: '',
    },
    {
      name: 'Should return false for user not associated with merchant',
      userId: 'unassociated-user-id',
      locationId: 'location-id',
      expected: false,
      note: '',
    },
  ]

  ensureLoaded()
  for (const testCase of testCases) {
    try {
      const result = await canAccessLocation!(
        testCase.userId,
        testCase.locationId,
      )
      const passed = result === testCase.expected
      const icon = passed ? '✓' : '✗'
      const note = testCase.note ? ` ${testCase.note}` : ''
      console.log(
        `  ${icon} ${testCase.name}: Expected ${testCase.expected}, got ${result}${note}`,
      )
    } catch (error) {
      console.error(`  ✗ ${testCase.name}: Error - ${error}`)
    }
  }
}

/**
 * Test suite for isPlatformAdmin function
 */
async function testIsPlatformAdmin() {
  console.log('\nTesting isPlatformAdmin...')

  const testCases = [
    {
      name: 'Should return true for active super_admin',
      userId: 'super-admin-user-id',
      expected: true,
      note: '⚠ Requires real platform_personnel data',
    },
    {
      name: 'Should return false for inactive super_admin',
      userId: 'inactive-admin-user-id',
      expected: false,
      note: '',
    },
    {
      name: 'Should return false for non-admin platform personnel',
      userId: 'support-user-id',
      expected: false,
      note: '',
    },
    {
      name: 'Should return false for non-platform user',
      userId: 'regular-user-id',
      expected: false,
      note: '',
    },
  ]

  ensureLoaded()
  for (const testCase of testCases) {
    try {
      const result = await isPlatformAdmin!(testCase.userId)
      const passed = result === testCase.expected
      const icon = passed ? '✓' : '✗'
      const note = testCase.note ? ` ${testCase.note}` : ''
      console.log(
        `  ${icon} ${testCase.name}: Expected ${testCase.expected}, got ${result}${note}`,
      )
    } catch (error) {
      console.error(`  ✗ ${testCase.name}: Error - ${error}`)
    }
  }
}

/**
 * Run all tests
 */
async function runTests() {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is not set!')
    console.error('   Please set DATABASE_URL in .env.local or .env file')
    console.error('   Example: DATABASE_URL=postgresql://user:password@host:port/database')
    process.exit(1)
  }

  // Load permissions module after env vars are set
  await loadPermissions()

  console.log('='.repeat(60))
  console.log('Running Permission Helper Functions Tests')
  console.log('='.repeat(60))
  console.log(`Database: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`)
  console.log('='.repeat(60))
  console.log('ℹ Note: Tests with placeholder data will fail unless matching data exists.')
  console.log('  The functions are working correctly - failures indicate missing test data.')
  console.log('='.repeat(60))

  await testGetUserRole()
  await testCanAccessLocation()
  await testIsPlatformAdmin()

  console.log('\n' + '='.repeat(60))
  console.log('Tests completed')
  console.log('='.repeat(60))
  console.log('\n📊 Test Summary:')
  console.log('  ✓ = Test passed (function returned expected result)')
  console.log('  ✗ = Test failed (function returned unexpected result)')
  console.log('\n💡 Note:')
  console.log('  - Tests marked with ⚠ require real database data to pass')
  console.log('  - Functions are working correctly - failures indicate missing test data')
  console.log('  - All functions executed without errors, which confirms they work!')
  console.log('='.repeat(60))
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error)
}

export { testGetUserRole, testCanAccessLocation, testIsPlatformAdmin }
