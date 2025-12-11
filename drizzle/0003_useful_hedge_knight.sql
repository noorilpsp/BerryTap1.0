CREATE TYPE "public"."merchant_user_role" AS ENUM('owner', 'admin', 'manager');--> statement-breakpoint
CREATE TABLE "merchant_users" (
	"id" text PRIMARY KEY NOT NULL,
	"merchant_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "merchant_user_role" NOT NULL,
	"location_access" jsonb,
	"permissions" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"invited_by" text,
	"invited_at" timestamp with time zone DEFAULT now() NOT NULL,
	"accepted_at" timestamp with time zone,
	"last_active_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "merchant_users" ADD CONSTRAINT "merchant_users_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant_users" ADD CONSTRAINT "merchant_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant_users" ADD CONSTRAINT "merchant_users_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "merchant_users_merchant_id_user_id_unique" ON "merchant_users" USING btree ("merchant_id","user_id");--> statement-breakpoint
CREATE INDEX "merchant_users_merchant_id_idx" ON "merchant_users" USING btree ("merchant_id");--> statement-breakpoint
CREATE INDEX "merchant_users_user_id_idx" ON "merchant_users" USING btree ("user_id");