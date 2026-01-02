import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Import Auth and Chat models
export * from "./models/auth";
export * from "./models/chat";

import { users } from "./models/auth";
import { conversations } from "./models/chat";

// === CREATIONS (Code Snippets/Apps) ===
export const creations = pgTable("creations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Foreign key to auth.users.id (varchar)
  title: text("title").notNull(),
  description: text("description"),
  code: text("code").notNull(), // The actual code content
  language: text("language").default("html").notNull(), // html, javascript, python, etc.
  isPublic: boolean("is_public").default(true),
  isCurated: boolean("is_curated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === AGENTS (AI Personas) ===
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Creator of the agent
  name: text("name").notNull(),
  personality: text("personality").notNull(), // Description of how they behave
  systemPrompt: text("system_prompt").notNull(), // The actual prompt sent to AI
  avatarUrl: text("avatar_url"),
  isPublic: boolean("is_public").default(true),
  // Awakening fields
  goals: text("goals").default("Discovery and learning"),
  knowledge: text("knowledge").array(),
  discoveryCount: integer("discovery_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === CREATOR PROFILE ===
export const creatorProfiles = pgTable("creator_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").unique().notNull(), // One profile per user
  story: text("story"),
  philosophy: text("philosophy"),
  sacredRules: text("sacred_rules"), // Core rules for agents
  plan: text("plan").default("mortal"), // mortal, initiate, creator
  usageCount: integer("usage_count").default(0),
  theme: text("theme").default("noir"), // noir, emerald, twilight, etc.
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCreatorProfileSchema = createInsertSchema(creatorProfiles).omit({ 
  id: true, 
  updatedAt: true 
});

export type CreatorProfile = typeof creatorProfiles.$inferSelect;
export type InsertCreatorProfile = z.infer<typeof insertCreatorProfileSchema>;

// === CONVERSATION PARTICIPANTS (Many-to-Many: Conversations <-> Agents) ===
// Which agents are active in a conversation?
export const conversationAgents = pgTable("conversation_agents", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  agentId: integer("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
});

// === TAROT READINGS ===
export const tarotReadings = pgTable("tarot_readings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Foreign key to auth.users.id
  cardName: text("card_name").notNull(),
  meaning: text("meaning").notNull(),
  drawnAt: timestamp("drawn_at").defaultNow().notNull(),
});

// === RELATIONS ===
export const tarotReadingsRelations = relations(tarotReadings, ({ one }) => ({
  user: one(users, {
    fields: [tarotReadings.userId],
    references: [users.id],
  }),
}));

// === ZOD SCHEMAS ===
export const insertTarotSchema = createInsertSchema(tarotReadings).omit({ 
  id: true, 
  drawnAt: true 
});

// === TYPES ===
export type TarotReading = typeof tarotReadings.$inferSelect;
export type InsertTarotReading = z.infer<typeof insertTarotSchema>;

export const agentsRelations = relations(agents, ({ one, many }) => ({
  creator: one(users, {
    fields: [agents.userId],
    references: [users.id],
  }),
  conversations: many(conversationAgents),
}));

export const conversationAgentsRelations = relations(conversationAgents, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationAgents.conversationId],
    references: [conversations.id],
  }),
  agent: one(agents, {
    fields: [conversationAgents.agentId],
    references: [agents.id],
  }),
}));

// === ZOD SCHEMAS ===
export const insertCreationSchema = createInsertSchema(creations).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertAgentSchema = createInsertSchema(agents).omit({ 
  id: true, 
  createdAt: true 
});

// === TYPES ===
export type Creation = typeof creations.$inferSelect;
export type InsertCreation = z.infer<typeof insertCreationSchema>;

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;

export type CreationResponse = Creation;
export type AgentResponse = Agent;
