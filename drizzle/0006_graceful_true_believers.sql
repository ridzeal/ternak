CREATE TABLE "environmental_data" (
	"id" text PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"temp_min" numeric,
	"temp_max" numeric,
	"humidity" integer,
	"thi" numeric,
	"thunderstorm" boolean DEFAULT false,
	"notes" text,
	CONSTRAINT "environmental_data_date_unique" UNIQUE("date")
);
