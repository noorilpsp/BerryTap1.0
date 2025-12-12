import { decimal, index, jsonb, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { merchants } from './merchants'

export const locationStatusEnum = pgEnum('location_status', [
  'coming_soon',
  'active',
  'temporarily_closed',
  'closed',
])

export const merchantLocations = pgTable(
  'merchant_locations',
  {
    id: text('id').primaryKey(), // UUID
    merchantId: text('merchant_id')
      .notNull()
      .references(() => merchants.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    address: text('address').notNull(),
    postalCode: varchar('postal_code', { length: 10 }).notNull(),
    city: varchar('city', { length: 100 }).notNull(),
    lat: decimal('lat', { precision: 10, scale: 8 }),
    lng: decimal('lng', { precision: 11, scale: 8 }),
    phone: text('phone').notNull(),
    email: text('email'),
    logoUrl: text('logo_url'),
    bannerUrl: text('banner_url'),
    status: locationStatusEnum('status').default('active').notNull(),
    openingHours: jsonb('opening_hours').notNull(),
    settings: jsonb('settings').$type<{
      tax_rate?: number
      service_charge_percentage?: number
      accepts_cash?: boolean
      accepts_cards?: boolean
    }>(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    merchantIdIdx: index('merchant_locations_merchant_id_idx').on(table.merchantId),
  }),
)

// GIN index for JSONB queries on settings
// Note: Drizzle-kit may not generate GIN indexes automatically.
// After running migrations, you may need to manually add:
// CREATE INDEX IF NOT EXISTS merchant_locations_settings_gin_idx ON merchant_locations USING gin (settings);



