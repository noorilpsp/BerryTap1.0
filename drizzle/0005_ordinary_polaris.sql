CREATE TYPE "public"."staff_role" AS ENUM('cashier', 'kitchen', 'bar', 'server', 'driver', 'cleaner', 'other');--> statement-breakpoint
CREATE TABLE "staff" (
	"id" text PRIMARY KEY NOT NULL,
	"location_id" text NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" text,
	"phone" text,
	"pin_code_hash" varchar(255) NOT NULL,
	"role" "staff_role" NOT NULL,
	"permissions" jsonb,
	"hourly_wage" numeric(10, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"hired_at" date NOT NULL,
	"terminated_at" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_location_id_merchant_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."merchant_locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "staff_location_id_idx" ON "staff" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "staff_is_active_idx" ON "staff" USING btree ("is_active");