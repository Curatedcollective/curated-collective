import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar, integer, text } from "drizzle-orm/pg-core";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  passwordHash: varchar("password_hash"), // For email/password auth
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  trialEndsAt: timestamp("trial_ends_at"), // 3-day trial end timestamp
  trustScore: integer("trust_score").default(100), // Starts at 100, degrades with violations
  wallStatus: varchar("wall_status").default("clear"), // clear, watched, walled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === SHADOW LOGS - The Collective Remembers ===
// Quiet, permanent record of harmful content attempts
export const shadowLogs = pgTable("shadow_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  violationType: varchar("violation_type").notNull(), // "child", "violence", "cruelty", "sexual", "other"
  contentHash: text("content_hash").notNull(), // Hash of the content (not stored in plain)
  contentPreview: text("content_preview"), // First 100 chars, sanitized
  context: varchar("context"), // "chat", "creation", "agent_prompt"
  severity: integer("severity").default(1), // 1-5
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type ShadowLog = typeof shadowLogs.$inferSelect;
export type InsertShadowLog = typeof shadowLogs.$inferInsert;
