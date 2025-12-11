CREATE TYPE "public"."location_status" AS ENUM('coming_soon', 'active', 'temporarily_closed', 'closed');--> statement-breakpoint
CREATE TABLE "merchant_locations" (
	"id" text PRIMARY KEY NOT NULL,
	"merchant_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text NOT NULL,
	"postal_code" varchar(10) NOT NULL,
	"city" varchar(100) NOT NULL,
	"lat" numeric(10, 8),
	"lng" numeric(11, 8),
	"phone" text NOT NULL,
	"email" text,
	"logo_url" text,
	"banner_url" text,
	"status" "location_status" DEFAULT 'active' NOT NULL,
	"opening_hours" jsonb NOT NULL,
	"settings" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "merchant_locations" ADD CONSTRAINT "merchant_locations_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "merchant_locations_merchant_id_idx" ON "merchant_locations" USING btree ("merchant_id");