import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: text("user_id"), // Owner of the conversation
  title: text("title").notNull(),
  deletedAt: timestamp("deleted_at"), // Soft delete
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  mood: text("mood"), // neutral, serene, curious, divine, melancholic, etc.
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Guardian-specific conversations (one per user)
export const guardianMessages = pgTable("guardian_messages", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Foreign key to users
  role: text("role").notNull(), // 'user' or 'guardian'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertGuardianMessageSchema = createInsertSchema(guardianMessages).omit({
  id: true,
  createdAt: true,
});

export type GuardianMessage = typeof guardianMessages.$inferSelect;
export type InsertGuardianMessage = z.infer<typeof insertGuardianMessageSchema>;

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

