import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { orders } from "./orders.schema";
import { users } from "./users.schema";

export const orderStatusHistory = pgTable("order_status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  fromStatus: varchar("from_status", { length: 20 }).notNull(),
  toStatus: varchar("to_status", { length: 20 }).notNull(),
  changedBy: uuid("changed_by").references(() => users.id),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
});
