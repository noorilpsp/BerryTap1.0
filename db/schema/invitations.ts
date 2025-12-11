import { index, jsonb, pgTable, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core'
import { merchants } from './merchants'
import { users } from './users'
import { merchantUserRoleEnum } from './merchant_users'

export const invitations = pgTable(
  'invitations',
  {
    id: text('id').primaryKey(), // UUID
    merchantId: text('merchant_id')
      .notNull()
      .references(() => merchants.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 255 }).notNull(),
    role: merchantUserRoleEnum('role').notNull(),
    locationAccess: jsonb('location_access').$type<string[]>(),
    invitedBy: text('invited_by')
      .notNull()
      .references(() => users.id),
    token: varchar('token', { length: 255 }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tokenUnique: uniqueIndex('invitations_token_unique').on(table.token),
    emailIdx: index('invitations_email_idx').on(table.email),
    merchantIdExpiresAtIdx: index('invitations_merchant_id_expires_at_idx').on(
      table.merchantId,
      table.expiresAt,
    ),
  }),
)

