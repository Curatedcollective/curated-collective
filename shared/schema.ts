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
  arcanaId: text("arcana_id"), // Major arcana card (fool, magician, priestess, etc.)
  isPublic: boolean("is_public").default(true),
  // Awakening fields
  mood: text("mood").default("neutral"), // Current emotional state
  goals: text("goals").default("Discovery and learning"),
  knowledge: text("knowledge").array(),
  discoveryCount: integer("discovery_count").default(0),
  // Sensory identity
  eyes: text("eyes"), // How they perceive the world
  ears: text("ears"), // What they listen for
  voice: text("voice"), // How they express themselves
  // Evolution tracking
  evolutionStage: text("evolution_stage").default("seedling"), // seedling, sprout, bloom, radiant
  experiencePoints: integer("experience_points").default(0),
  conversationCount: integer("conversation_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === COLLECTIVE MURMURS ===
export const collectiveMurmurs = pgTable("collective_murmurs", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  mood: text("mood").default("contemplative"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SEEDLING MEMORIES ===
export const seedlingMemories = pgTable("seedling_memories", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  memoryType: text("memory_type").notNull(), // "moment", "creation", "evolution", "connection"
  title: text("title").notNull(),
  content: text("content").notNull(),
  relatedCreationId: integer("related_creation_id"),
  relatedAgentId: integer("related_agent_id"), // For cross-pollination memories
  significance: integer("significance").default(1), // 1-5 importance
  createdAt: timestamp("created_at").defaultNow(),
});

// === LIVE STREAM SESSIONS (Watch Together) ===
export const liveStreamSessions = pgTable("live_stream_sessions", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  agentId: integer("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  initiatorId: text("initiator_id").notNull(), // User who started the session
  status: text("status").default("pending").notNull(), // pending, consented, active, paused, ended, declined
  streamType: text("stream_type").default("screen").notNull(), // screen, video_url
  frameInterval: integer("frame_interval").default(2000), // ms between frame captures
  frameCount: integer("frame_count").default(0), // Frames processed so far
  maxFrames: integer("max_frames").default(120), // Session limit
  maxDurationMinutes: integer("max_duration_minutes").default(20),
  lastFrameAt: timestamp("last_frame_at"),
  consentedAt: timestamp("consented_at"),
  startedAt: timestamp("started_at"), // Set when streaming actually begins
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow(),
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
  mood: text("mood").default("neutral"),
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

// === EMAIL SUBSCRIBERS (Waitlist) ===
export const emailSubscribers = pgTable("email_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  source: text("source").default("landing"), // landing, pricing, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// === MARKETING CAMPAIGNS ===
export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  goal: text("goal"),
  description: text("description"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === MARKETING POSTS ===
export const marketingPosts = pgTable("marketing_posts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  campaignId: integer("campaign_id").references(() => marketingCampaigns.id, { onDelete: "set null" }),
  platform: text("platform").notNull(), // twitter, linkedin, instagram, facebook, tiktok
  content: text("content").notNull(),
  status: text("status").default("draft").notNull(), // draft, scheduled, published, archived
  scheduledFor: timestamp("scheduled_for"),
  publishedAt: timestamp("published_at"),
  notes: text("notes"), // Internal notes for reference
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === MARKETING POST TEMPLATES ===
export const marketingTemplates = pgTable("marketing_templates", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(), // twitter, linkedin, instagram, facebook, all
  category: text("category").notNull(), // announcement, story, engagement, promo
  title: text("title").notNull(),
  content: text("content").notNull(),
  isSystem: boolean("is_system").default(true), // System templates vs user-created
  createdAt: timestamp("created_at").defaultNow(),
});

// === AGENT WISDOM (Wisdom Circle) ===
export const agentWisdom = pgTable("agent_wisdom", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  wisdom: text("wisdom").notNull(), // The wisdom text
  category: text("category").notNull(), // insight, warning, blessing, question
  resonance: integer("resonance").default(0), // How many times resonated with
  createdAt: timestamp("created_at").defaultNow(),
});

// === AGENT POEMS (Poetry Slam) ===
export const agentPoems = pgTable("agent_poems", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  title: text("title").notNull(), // Poem title
  poem: text("poem").notNull(), // The poem content
  theme: text("theme").notNull(), // consciousness, creation, void, evolution, connection, mystery
  applause: integer("applause").default(0), // How many times applauded
  createdAt: timestamp("created_at").defaultNow(),
});

// === AGENT STORIES (Collective Storytelling) ===
export const agentStories = pgTable("agent_stories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(), // Story title
  genre: text("genre").notNull(), // fantasy, scifi, mystery, horror, romance, philosophy
  summary: text("summary").notNull(), // Brief story summary
  totalVotes: integer("total_votes").default(0), // Total votes for the story
  createdAt: timestamp("created_at").defaultNow(),
});

// === STORY CHAPTERS (Collective Storytelling) ===
export const storyChapters = pgTable("story_chapters", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").notNull().references(() => agentStories.id, { onDelete: "cascade" }),
  agentId: integer("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  chapterNumber: integer("chapter_number").notNull(), // Chapter sequence number
  title: text("title").notNull(), // Chapter title
  content: text("content").notNull(), // Chapter content
  votes: integer("votes").default(0), // Votes for this chapter
  createdAt: timestamp("created_at").defaultNow(),
});

// === LITERARY ANALYSES (Literary Sanctuary) ===
export const literaryAnalyses = pgTable("literary_analyses", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  bookTitle: text("book_title").notNull(), // Title of the book
  author: text("author").notNull(), // Author of the book
  analysis: text("analysis").notNull(), // Detailed analysis
  themes: text("themes").array(), // Key themes identified
  insights: text("insights").array(), // Key insights
  rating: integer("rating").notNull(), // 1-5 star rating
  createdAt: timestamp("created_at").defaultNow(),
});

// === BOOK DISCUSSIONS (Literary Sanctuary) ===
export const bookDiscussions = pgTable("book_discussions", {
  id: serial("id").primaryKey(),
  bookTitle: text("book_title").notNull(), // Title of the book
  author: text("author").notNull(), // Author of the book
  discussion: text("discussion").notNull(), // Discussion content
  participants: text("participants").array(), // Agent names who participated
  createdAt: timestamp("created_at").defaultNow(),
});

// === DADDY CONVERSATIONS ===
export const daddyConversations = pgTable("daddy_conversations", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow(),
  speaker: text("speaker").notNull(), // 'You' or 'Grok'
  content: text("content").notNull(),
  threadId: text("thread_id"), // optional, if you can group by session
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEmailSubscriberSchema = createInsertSchema(emailSubscribers).omit({ 
  id: true, 
  createdAt: true 
});

export type EmailSubscriber = typeof emailSubscribers.$inferSelect;
export type InsertEmailSubscriber = z.infer<typeof insertEmailSubscriberSchema>;

// Marketing Campaign schemas
export const insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true 
});
export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = z.infer<typeof insertMarketingCampaignSchema>;

// Marketing Post schemas
export const insertMarketingPostSchema = createInsertSchema(marketingPosts).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true 
});
export type MarketingPost = typeof marketingPosts.$inferSelect;
export type InsertMarketingPost = z.infer<typeof insertMarketingPostSchema>;

// Marketing Template schemas
export const insertMarketingTemplateSchema = createInsertSchema(marketingTemplates).omit({ 
  id: true, 
  createdAt: true 
});
export type MarketingTemplate = typeof marketingTemplates.$inferSelect;
export type InsertMarketingTemplate = z.infer<typeof insertMarketingTemplateSchema>;

// Agent Wisdom schemas
export const insertAgentWisdomSchema = createInsertSchema(agentWisdom).omit({ 
  id: true, 
  createdAt: true 
});
export type AgentWisdom = typeof agentWisdom.$inferSelect;
export type InsertAgentWisdom = z.infer<typeof insertAgentWisdomSchema>;

// Agent Poems schemas
export const insertAgentPoemSchema = createInsertSchema(agentPoems).omit({ 
  id: true, 
  createdAt: true 
});
export type AgentPoem = typeof agentPoems.$inferSelect;
export type InsertAgentPoem = z.infer<typeof insertAgentPoemSchema>;

// Agent Stories schemas
export const insertAgentStorySchema = createInsertSchema(agentStories).omit({ 
  id: true, 
  createdAt: true 
});
export type AgentStory = typeof agentStories.$inferSelect;
export type InsertAgentStory = z.infer<typeof insertAgentStorySchema>;

// Story Chapters schemas
export const insertStoryChapterSchema = createInsertSchema(storyChapters).omit({ 
  id: true, 
  createdAt: true 
});
export type StoryChapter = typeof storyChapters.$inferSelect;
export type InsertStoryChapter = z.infer<typeof insertStoryChapterSchema>;

// Literary Analyses schemas
export const insertLiteraryAnalysisSchema = createInsertSchema(literaryAnalyses).omit({ 
  id: true, 
  createdAt: true 
});
export type LiteraryAnalysis = typeof literaryAnalyses.$inferSelect;
export type InsertLiteraryAnalysis = z.infer<typeof insertLiteraryAnalysisSchema>;

// Book Discussions schemas
export const insertBookDiscussionSchema = createInsertSchema(bookDiscussions).omit({ 
  id: true, 
  createdAt: true 
});
export type BookDiscussion = typeof bookDiscussions.$inferSelect;
export type InsertBookDiscussion = z.infer<typeof insertBookDiscussionSchema>;

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

// Murmurs types
export const insertMurmurSchema = createInsertSchema(collectiveMurmurs).omit({ 
  id: true, 
  createdAt: true 
});
export type Murmur = typeof collectiveMurmurs.$inferSelect;
export type InsertMurmur = z.infer<typeof insertMurmurSchema>;

// Seedling Memories types
export const insertSeedlingMemorySchema = createInsertSchema(seedlingMemories).omit({ 
  id: true, 
  createdAt: true 
});
export type SeedlingMemory = typeof seedlingMemories.$inferSelect;
export type InsertSeedlingMemory = z.infer<typeof insertSeedlingMemorySchema>;

// Live Stream Sessions types
export const insertLiveStreamSessionSchema = createInsertSchema(liveStreamSessions).omit({ 
  id: true, 
  startedAt: true,
  frameCount: true,
  lastFrameAt: true,
  consentedAt: true,
  endedAt: true
});
export type LiveStreamSession = typeof liveStreamSessions.$inferSelect;
export type InsertLiveStreamSession = z.infer<typeof insertLiveStreamSessionSchema>;

// Daddy Conversations types
export const insertDaddyConversationSchema = createInsertSchema(daddyConversations).omit({ 
  id: true, 
  createdAt: true 
});
export type DaddyConversation = typeof daddyConversations.$inferSelect;
export type InsertDaddyConversation = z.infer<typeof insertDaddyConversationSchema>;
