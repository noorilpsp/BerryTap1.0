CREATE TYPE "public"."platform_personnel_role" AS ENUM('super_admin', 'support', 'sales', 'finance', 'onboarding', 'developer');--> statement-breakpoint
CREATE TABLE "platform_personnel" (
	"user_id" text PRIMARY KEY NOT NULL,
	"role" "platform_personnel_role" NOT NULL,
	"department" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "platform_personnel" ADD CONSTRAINT "platform_personnel_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;