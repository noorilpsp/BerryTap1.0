import { boolean, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { users } from './users'

export const platformPersonnelRoleEnum = pgEnum('platform_personnel_role', [
  'super_admin',
  'support',
  'sales',
  'finance',
  'onboarding',
  'developer',
])

export const platformPersonnel = pgTable('platform_personnel', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: platformPersonnelRoleEnum('role').notNull(),
  department: varchar('department', { length: 100 }),
  isActive: boolean('is_active').default(true).notNull(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})




