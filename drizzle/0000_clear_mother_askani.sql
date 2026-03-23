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
