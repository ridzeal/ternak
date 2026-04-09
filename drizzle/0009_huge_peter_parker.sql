CREATE TABLE "asset_maintenance" (
	"id" text PRIMARY KEY NOT NULL,
	"asset_id" text NOT NULL,
	"date" text NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"cost" numeric,
	"vendor" text,
	"next_maintenance" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"purchase_date" text,
	"quantity" integer NOT NULL,
	"unit" text,
	"notes" text,
	"status" text DEFAULT 'Active',
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feed_inventory" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"purchase_date" text,
	"quantity" integer,
	"weight_kg" numeric,
	"unit" text,
	"unit_price" numeric,
	"total_price" numeric,
	"expiry_date" text,
	"supplier" text,
	"notes" text,
	"current_stock" integer,
	"min_stock" integer,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"item_id" text NOT NULL,
	"item_type" text NOT NULL,
	"date" text NOT NULL,
	"quantity" integer NOT NULL,
	"weight_kg" numeric,
	"purpose" text,
	"notes" text,
	"recorded_by" text
);
