CREATE TABLE "forage_harvests" (
	"id" text PRIMARY KEY NOT NULL,
	"plot_id" text NOT NULL,
	"plot_name" text NOT NULL,
	"harvest_date" text NOT NULL,
	"cut_number" integer NOT NULL,
	"quantity" numeric,
	"quantity_unit" text,
	"quality" text,
	"height" numeric,
	"height_unit" text,
	"used_for" text,
	"storage_location" text,
	"notes" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "land_plots" (
	"id" text PRIMARY KEY NOT NULL,
	"plot_name" text NOT NULL,
	"location" text,
	"area" numeric,
	"area_unit" text,
	"crop_type" text,
	"crop_variety" text,
	"planting_date" text,
	"cut_cycle" integer,
	"last_cut_date" text,
	"next_cut_date" text,
	"status" text DEFAULT 'Growing',
	"assigned_to" text,
	"barn_location" text,
	"notes" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
