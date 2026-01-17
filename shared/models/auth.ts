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
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  displayName: varchar("display_name"), // Custom display name (e.g., "The Veil" for creator)
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  trustScore: integer("trust_score").default(100), // Starts at 100, degrades with violations
  wallStatus: varchar("wall_status").default("clear"), // clear, watched, walled
  referralCode: varchar("referral_code"), // UUID for sharing
  referredBy: varchar("referred_by"), // Who referred this user
  role: varchar("role").default("user"), // user, owner
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

// === GUARDIAN LOGS ===
export const guardianLogs = pgTable("guardian_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull(),
  actionType: varchar("action_type").notNull(), // 'grok_response', 'proactive_checkin', 'threat_detected'
  content: text("content"),
  mood: varchar("mood"), // 'sweet' or 'mean'
  threatLevel: integer("threat_level").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// === GUARDIAN STATS ===
export const guardianStats = pgTable("guardian_stats", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().unique(),
  sweetCount: integer("sweet_count").default(0),
  meanCount: integer("mean_count").default(0),
  threatsBlocked: integer("threats_blocked").default(0),
  lastCheckin: timestamp("last_checkin"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === WAITLIST ===
export const waitlist = pgTable("waitlist", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").notNull().unique(),
  referralCode: text("referral_code"),
  source: text("source").default("landing"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type ShadowLog = typeof shadowLogs.$inferSelect;
export type InsertShadowLog = typeof shadowLogs.$inferInsert;

export type GuardianLog = typeof guardianLogs.$inferSelect;
export type InsertGuardianLog = typeof guardianLogs.$inferInsert;

export type GuardianStats = typeof guardianStats.$inferSelect;
export type InsertGuardianStats = typeof guardianStats.$inferInsert;

export type Waitlist = typeof waitlist.$inferSelect;
export type InsertWaitlist = typeof waitlist.$inferInsert;
