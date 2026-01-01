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

// === CONVERSATION PARTICIPANTS (Many-to-Many: Conversations <-> Agents) ===
// Which agents are active in a conversation?
export const conversationAgents = pgTable("conversation_agents", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  agentId: integer("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
});

// === RELATIONS ===
export const creationsRelations = relations(creations, ({ one }) => ({
  author: one(users, {
    fields: [creations.userId],
    references: [users.id],
  }),
}));

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
