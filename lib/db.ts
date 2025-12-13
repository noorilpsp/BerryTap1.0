import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'

import * as schema from '@/db/schema'

// Simple, direct database connection - no proxy overhead
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not set. Make sure it is configured in your environment variables.',
  )
}

// Use HTTP-based driver (serverless-friendly, no connection pooling needed)
const sql = neon(databaseUrl)
export const db = drizzle({ client: sql, schema })
