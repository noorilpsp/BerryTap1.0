import { boolean, date, decimal, index, jsonb, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { merchantLocations } from './merchant_locations'

export const staffRoleEnum = pgEnum('staff_role', [
  'cashier',
  'kitchen',
  'bar',
  'server',
  'driver',
  'cleaner',
  'other',
])

export const staff = pgTable(
  'staff',
  {
    id: text('id').primaryKey(), // UUID
    locationId: text('location_id')
      .notNull()
      .references(() => merchantLocations.id, { onDelete: 'cascade' }),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    email: text('email'),
    phone: text('phone'),
    pinCodeHash: varchar('pin_code_hash', { length: 255 }).notNull(),
    role: staffRoleEnum('role').notNull(),
    permissions: jsonb('permissions').$type<{
      can_void_orders?: boolean
      can_apply_discounts?: boolean
      can_manage_tables?: boolean
    }>(),
    hourlyWage: decimal('hourly_wage', { precision: 10, scale: 2 }),
    isActive: boolean('is_active').default(true).notNull(),
    hiredAt: date('hired_at').notNull(),
    terminatedAt: date('terminated_at'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    locationIdIdx: index('staff_location_id_idx').on(table.locationId),
    isActiveIdx: index('staff_is_active_idx').on(table.isActive),
  }),
)


