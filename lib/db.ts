import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http'

import * as schema from '@/db/schema'

let _db: NeonHttpDatabase<typeof schema> | null = null
const _proxyTarget = {} as Record<string | symbol, any>

function getDb(): NeonHttpDatabase<typeof schema> {
  if (_db) {
    return _db
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    // During build time, Next.js may analyze routes without DATABASE_URL
    // Return a stub that will throw only when actually used at runtime
    // This allows the build to complete even if DATABASE_URL is not set
    const stub = new Proxy({} as NeonHttpDatabase<typeof schema>, {
      get(_target, prop) {
        // Allow some introspection during build (like checking if property exists)
        if (prop === 'then' || prop === Symbol.toStringTag) {
          return undefined
        }
        throw new Error(
          'DATABASE_URL is not set. Make sure it is configured in your Vercel environment variables. ' +
            'This error occurs when the database is accessed at runtime.',
        )
      },
    }) as NeonHttpDatabase<typeof schema>
    
    // Cache the stub so we don't create new proxies on every access
    _db = stub
    return _db
  }

  // Use HTTP-based driver (serverless-friendly, no connection pooling needed)
  const sql = neon(databaseUrl)
  _db = drizzle({ client: sql, schema })
  return _db
}

// Export a proxy that lazily initializes the database connection
// This prevents initialization during build time when DATABASE_URL might not be available
// The connection is only created when db methods are actually called at runtime
// We cache property accesses to avoid repeated lookups and restore instant performance
export const db = new Proxy(_proxyTarget, {
  get(target, prop) {
    // Check cache first to avoid repeated getDb() calls
    if (prop in target) {
      return target[prop]
    }

    // Only initialize when a property is actually accessed
    const dbInstance = getDb()
    const value = dbInstance[prop as keyof NeonHttpDatabase<typeof schema>]
    
    // Cache the value to avoid repeated lookups - this restores instant performance
    target[prop] = value
    
    // Drizzle methods don't need binding - they're not using 'this' context
    return value
  },
}) as NeonHttpDatabase<typeof schema>
