CREATE TYPE "public"."business_type" AS ENUM('restaurant', 'cafe', 'bar', 'bakery', 'food_truck', 'other');--> statement-breakpoint
CREATE TYPE "public"."merchant_status" AS ENUM('onboarding', 'active', 'suspended', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('trial', 'basic', 'pro', 'enterprise');--> statement-breakpoint
CREATE TABLE "merchants" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"legal_name" varchar(255) NOT NULL,
	"kbo_number" varchar(20),
	"contact_email" text NOT NULL,
	"phone" text NOT NULL,
	"address" text,
	"business_type" "business_type" NOT NULL,
	"status" "merchant_status" DEFAULT 'onboarding' NOT NULL,
	"subscription_tier" "subscription_tier" DEFAULT 'trial' NOT NULL,
	"subscription_expires_at" timestamp with time zone,
	"timezone" varchar(50) DEFAULT 'Europe/Brussels' NOT NULL,
	"currency" varchar(3) DEFAULT 'EUR' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
