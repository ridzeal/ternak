CREATE TABLE "cow_measurements" (
	"id" text PRIMARY KEY NOT NULL,
	"cow_id" text NOT NULL,
	"date" text NOT NULL,
	"weight" integer NOT NULL,
	"length" integer,
	"chest_circumference" integer,
	"notes" text
);
