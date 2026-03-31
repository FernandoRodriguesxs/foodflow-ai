import { pgEnum, pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { stores } from "./stores.schema";

export const userRoleEnum = pgEnum("user_role", ["owner", "operator"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: userRoleEnum("role").default("operator").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
