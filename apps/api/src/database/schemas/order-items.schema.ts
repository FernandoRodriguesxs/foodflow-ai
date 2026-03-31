import {
  pgTable,
  uuid,
  varchar,
  integer,
  decimal,
  text,
} from "drizzle-orm/pg-core";
import { orders } from "./orders.schema";

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  name: varchar("name", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  notes: text("notes"),
});
