import { boolean, index, pgTable, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core'

export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(), // Supabase auth user id (UUID string)
    email: text('email').notNull(),
    phone: text('phone'),
    fullName: text('full_name').notNull(),
    avatarUrl: text('avatar_url'),
    locale: varchar('locale', { length: 5 }).default('nl-BE').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
    emailUnique: uniqueIndex('users_email_unique').on(table.email),
  }),
)

