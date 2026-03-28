CREATE TABLE "milk_collection" (
	"id" text PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"buyer_name" text NOT NULL,
	"total_quantity" numeric NOT NULL,
	"fat_average" numeric,
	"protein_average" numeric,
	"notes" text
);
