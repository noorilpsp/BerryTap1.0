import { boolean, index, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { merchants } from './merchants'
import { users } from './users'

export const merchantUserRoleEnum = pgEnum('merchant_user_role', [
  'owner',
  'admin',
  'manager',
])

export const merchantUsers = pgTable(
  'merchant_users',
  {
    id: text('id').primaryKey(), // UUID
    merchantId: text('merchant_id')
      .notNull()
      .references(() => merchants.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: merchantUserRoleEnum('role').notNull(),
    locationAccess: jsonb('location_access').$type<string[]>(),
    permissions: jsonb('permissions').$type<Record<string, boolean>>(),
    isActive: boolean('is_active').default(true).notNull(),
    invitedBy: text('invited_by').references(() => users.id),
    invitedAt: timestamp('invited_at', { withTimezone: true }).defaultNow().notNull(),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
    lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    merchantUserUnique: uniqueIndex('merchant_users_merchant_id_user_id_unique').on(
      table.merchantId,
      table.userId,
    ),
    merchantIdIdx: index('merchant_users_merchant_id_idx').on(table.merchantId),
    userIdIdx: index('merchant_users_user_id_idx').on(table.userId),
  }),
)

// GIN index for JSONB queries on location_access
// Note: Drizzle-kit may not generate GIN indexes automatically.
// After running migrations, you may need to manually add:
// CREATE INDEX IF NOT EXISTS merchant_users_location_access_gin_idx ON merchant_users USING gin (location_access);

