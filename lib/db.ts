import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http'

import * as schema from '@/db/schema'

let _db: NeonHttpDatabase<typeof schema> | null = null
const _propertyCache = {} as Record<string | symbol, any>

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
// Optimized: cache properties for instant access after first use
export const db = new Proxy(_propertyCache, {
  get(target, prop) {
    // Fastest: return cached property
    if (prop in target) {
      return target[prop]
    }

    // Get db instance (fast - _db is cached after first call)
    const dbInstance = getDb()
    const value = dbInstance[prop as keyof NeonHttpDatabase<typeof schema>]
    
    // Cache for instant future access
    target[prop] = value
    
    return value
  },
}) as NeonHttpDatabase<typeof schema>
