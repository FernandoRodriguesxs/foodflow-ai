import { pgTable, uuid, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { stores } from "./stores.schema";
import { orders } from "./orders.schema";

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  whatsappNumber: varchar("whatsapp_number", { length: 20 }).notNull(),
  messages: jsonb("messages").notNull().default([]),
  orderId: uuid("order_id").references(() => orders.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
