import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm"
import { createInsertSchema } from "drizzle-zod";

export const RoleEnum = pgEnum("role_enum", ["admin", "user"]);

export const userTable = pgTable("users", {
  id: serial("id"),
  email: varchar("email").notNull().unique(),
  emailVerified: timestamp("email_verified"),
  password: text("password").notNull(),
  role: RoleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date()
  ),
});

export const insertUserSchema = createInsertSchema(userTable);
export type User = typeof userTable.$inferSelect;
