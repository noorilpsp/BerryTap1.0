import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'

import * as schema from '@/db/schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

// Use HTTP-based driver (serverless-friendly, no connection pooling needed)
const sql = neon(process.env.DATABASE_URL!)

export const db = drizzle({ client: sql, schema })

