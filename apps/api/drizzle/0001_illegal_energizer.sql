CREATE TYPE "public"."order_source" AS ENUM('ifood', 'whatsapp');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('PLACED', 'CONFIRMED', 'DISPATCHED', 'CONCLUDED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"external_id" varchar(255),
	"source" "order_source" NOT NULL,
	"status" "order_status" DEFAULT 'PLACED' NOT NULL,
	"customer_name" varchar(255),
	"customer_phone" varchar(20),
	"total" numeric(10, 2),
	"raw_data" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_orders_store_created" ON "orders" USING btree ("store_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_orders_store_status" ON "orders" USING btree ("store_id","status");--> statement-breakpoint
CREATE INDEX "idx_orders_external_id" ON "orders" USING btree ("external_id");