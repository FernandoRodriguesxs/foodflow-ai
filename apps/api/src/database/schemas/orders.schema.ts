import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  timestamp,
  decimal,
  jsonb,
  text,
  index,
} from "drizzle-orm/pg-core";
import { stores } from "./stores.schema";

export const orderSourceEnum = pgEnum("order_source", ["ifood", "whatsapp"]);

export const orderStatusEnum = pgEnum("order_status", [
  "PLACED",
  "CONFIRMED",
  "DISPATCHED",
  "CONCLUDED",
  "CANCELLED",
]);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id),
    externalId: varchar("external_id", { length: 255 }),
    source: orderSourceEnum("source").notNull(),
    status: orderStatusEnum("status").default("PLACED").notNull(),
    customerName: varchar("customer_name", { length: 255 }),
    customerPhone: varchar("customer_phone", { length: 20 }),
    total: decimal("total", { precision: 10, scale: 2 }),
    rawData: jsonb("raw_data"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_orders_store_created").on(table.storeId, table.createdAt),
    index("idx_orders_store_status").on(table.storeId, table.status),
    index("idx_orders_external_id").on(table.externalId),
  ],
);
