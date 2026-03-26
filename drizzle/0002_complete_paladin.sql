CREATE TABLE "cows" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"breed" text NOT NULL,
	"dob" text NOT NULL,
	"gender" text NOT NULL,
	"weight" integer NOT NULL,
	"status" text NOT NULL,
	"tag" text NOT NULL,
	"sire" text,
	"dam" text
);
--> statement-breakpoint
CREATE TABLE "farm_events" (
	"id" text PRIMARY KEY NOT NULL,
	"cow_id" text NOT NULL,
	"cow_name" text NOT NULL,
	"date" text NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"vet" text NOT NULL,
	"follow_up" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milking_records" (
	"id" text PRIMARY KEY NOT NULL,
	"cow_id" text NOT NULL,
	"cow_name" text NOT NULL,
	"date" text NOT NULL,
	"session" text NOT NULL,
	"volume" numeric NOT NULL,
	"fat" numeric NOT NULL,
	"protein" numeric NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" text NOT NULL,
	"created_at" text NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'worker' NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"last_login_at" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;