import {
  boolean,
  pgEnum,
  pgTable,
  uuid,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { stores } from "./stores.schema";
import { USER_ROLE_VALUES, DEFAULT_USER_ROLE } from "./enum-values";

export const userRoleEnum = pgEnum("user_role", [...USER_ROLE_VALUES]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  role: userRoleEnum("role").default(DEFAULT_USER_ROLE).notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: varchar("image", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
