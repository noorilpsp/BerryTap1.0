import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http'

import * as schema from '@/db/schema'

let _db: NeonHttpDatabase<typeof schema> | null = null

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
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop) {
    // Only initialize when a property is actually accessed
    const dbInstance = getDb()
    const value = dbInstance[prop as keyof NeonHttpDatabase<typeof schema>]
    // If it's a function, bind it to the db instance to maintain 'this' context
    if (typeof value === 'function') {
      return value.bind(dbInstance)
    }
    return value
  },
})

