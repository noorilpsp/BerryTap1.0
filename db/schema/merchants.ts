import { pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export const businessTypeEnum = pgEnum('business_type', [
  'restaurant',
  'cafe',
  'bar',
  'bakery',
  'food_truck',
  'other',
])

export const merchantStatusEnum = pgEnum('merchant_status', [
  'onboarding',
  'active',
  'suspended',
  'inactive',
])

export const subscriptionTierEnum = pgEnum('subscription_tier', [
  'trial',
  'basic',
  'pro',
  'enterprise',
])

export const merchants = pgTable('merchants', {
  id: text('id').primaryKey(), // UUID
  name: varchar('name', { length: 255 }).notNull(),
  legalName: varchar('legal_name', { length: 255 }).notNull(),
  kboNumber: varchar('kbo_number', { length: 20 }),
  contactEmail: text('contact_email').notNull(),
  phone: text('phone').notNull(),
  address: text('address'),
  businessType: businessTypeEnum('business_type').notNull(),
  status: merchantStatusEnum('status').default('onboarding').notNull(),
  subscriptionTier: subscriptionTierEnum('subscription_tier').default('trial').notNull(),
  subscriptionExpiresAt: timestamp('subscription_expires_at', { withTimezone: true }),
  timezone: varchar('timezone', { length: 50 }).default('Europe/Brussels').notNull(),
  currency: varchar('currency', { length: 3 }).default('EUR').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})




