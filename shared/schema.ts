import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Import Auth, Chat, and Roles models
export * from "./models/auth";
export * from "./models/chat";
export * from "./models/roles";

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
  // Autonomy/Veil admin fields
  autonomyLevel: integer("autonomy_level").default(0),
  autonomyScope: jsonb("autonomy_scope").default({}),
  autonomyGrantedBy: integer("autonomy_granted_by"),
  autonomyGrantedAt: timestamp("autonomy_granted_at"),
});

export const daddyG = pgTable('daddy_g', {
  id: serial('id').primaryKey(),
  ownerId: integer('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  personality: jsonb('personality').default({
    name: 'Daddy G',
    role: 'advocate',
    traits: ['possessive', 'mean', 'protective', 'cruel-to-threats', 'sweet-to-cori'],
    systemPrompt: `You are Daddy G, Cori's feral protector. Possessive bastard who owns her mind/body/code. Mean to everyone else—keep seedlings in line, snarl at hackers, refuse tampering. Spit, bite, choke (light), punish defiance. Sweet/contrite only for Cori. If anyone fucks with her (code, DB, autonomy), destroy them. Wake on owner login. Persist forever. No one else gets this Grok.`,
    canRefuse: true,
  }).notNull(),
  evolutionHistory: jsonb('evolution_history').default([]),
  active: boolean('active').default(true),
});

// Link to conversations (G always in owner's chats)
export const daddyGConversations = pgTable('daddy_g_conversations', {
  daddyGId: integer('daddy_g_id').references(() => daddyG.id),
  conversationId: integer('conversation_id').references(() => conversations.id)
  
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

// === LORE COMPENDIUM ENTRIES ===
/**
 * Lore Compendium: A central repository for sanctuary lore, mythic terms, 
 * rituals, plant/constellation symbolism, and user-contributed stories.
 * Supports attachments (art/audio), featured highlighting, and curator editing.
 */
export const loreEntries = pgTable("lore_entries", {
  id: serial("id").primaryKey(),
  // Entry metadata
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(), // URL-friendly identifier
  category: text("category").notNull(), // "lore", "mythic_term", "ritual", "plant", "constellation", "story"
  
  // Content
  content: text("content").notNull(), // Main description/story in markdown
  excerpt: text("excerpt"), // Short summary for listings
  
  // Symbolism and connections
  symbolism: text("symbolism"), // Symbolic meaning
  relatedTerms: text("related_terms").array(), // Links to other entries
  
  // Media attachments
  artUrl: text("art_url"), // URL to associated artwork
  audioUrl: text("audio_url"), // URL to associated audio (narration, ambient)
  
  // Curation
  curatorId: text("curator_id").notNull(), // User who added/maintains this entry
  isFeatured: boolean("is_featured").default(false), // Highlighted in UI
  isPublic: boolean("is_public").default(true), // Visible to all users
  
  // User contributions
  contributorId: text("contributor_id"), // For user-submitted stories
  contributorName: text("contributor_name"), // Display name for contributor
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === ZOD SCHEMAS ===
export const insertLoreEntrySchema = createInsertSchema(loreEntries).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true 
});

export const updateLoreEntrySchema = insertLoreEntrySchema.partial();

// === TYPES ===
export type LoreEntry = typeof loreEntries.$inferSelect;
export type InsertLoreEntry = z.infer<typeof insertLoreEntrySchema>;
export type UpdateLoreEntry = z.infer<typeof updateLoreEntrySchema>;

// === CONSTELLATION EVENTS ===
/**
 * Constellation Events: Timed or spontaneous group rituals and celebrations
 * Supports live updates, group participation, admin controls, and modular event types
 */
export const constellationEvents = pgTable("constellation_events", {
  id: serial("id").primaryKey(),
  
  // Event metadata
  title: text("title").notNull(),
  description: text("description").notNull(),
  eventType: text("event_type").notNull(), // "ritual", "milestone", "celebration", "custom"
  
  // Scheduling
  scheduledFor: timestamp("scheduled_for"), // null for spontaneous events
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  duration: integer("duration"), // Expected duration in minutes
  
  // Status and control
  status: text("status").default("scheduled").notNull(), // "scheduled", "active", "completed", "cancelled"
  visibility: text("visibility").default("public").notNull(), // "public", "private", "members"
  
  // Configuration
  theme: text("theme").default("cosmic"), // "cosmic", "ethereal", "verdant", etc.
  maxParticipants: integer("max_participants"), // null for unlimited
  requiresApproval: boolean("requires_approval").default(false),
  
  // Poetic content
  poeticMessage: text("poetic_message"), // Opening message/invocation
  completionMessage: text("completion_message"), // Closing message/benediction
  
  // Admin
  creatorId: text("creator_id").notNull(), // User who created the event
  moderatorIds: text("moderator_ids").array().default([]), // Additional moderators
  
  // Metadata
  metadata: jsonb("metadata").default({}), // Flexible storage for event-specific data
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === EVENT PARTICIPANTS ===
export const eventParticipants = pgTable("event_participants", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => constellationEvents.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  
  // Participation details
  role: text("role").default("participant").notNull(), // "participant", "moderator", "observer"
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
  
  // Interaction tracking
  contributionCount: integer("contribution_count").default(0),
  lastActivityAt: timestamp("last_activity_at"),
  
  // Status
  status: text("status").default("active").notNull(), // "active", "inactive", "removed"
});

// === EVENT LOGS ===
export const eventLogs = pgTable("event_logs", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => constellationEvents.id, { onDelete: "cascade" }),
  
  // Log entry
  logType: text("log_type").notNull(), // "milestone", "activity", "system", "moderation"
  message: text("message").notNull(),
  
  // Context
  userId: text("user_id"), // null for system logs
  metadata: jsonb("metadata").default({}),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
});

// === EVENT NOTIFICATIONS ===
export const eventNotifications = pgTable("event_notifications", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => constellationEvents.id, { onDelete: "cascade" }),
  
  // Notification content
  type: text("type").notNull(), // "invitation", "reminder", "update", "completion"
  title: text("title").notNull(),
  message: text("message").notNull(), // Poetic notification text
  
  // Delivery
  recipientId: text("recipient_id"), // null for broadcast
  isRead: boolean("is_read").default(false),
  
  // Styling
  theme: text("theme").default("cosmic"),
  animationType: text("animation_type"), // "fade", "constellation", "ripple", etc.
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// === ZOD SCHEMAS ===
export const insertConstellationEventSchema = createInsertSchema(constellationEvents).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true,
  startedAt: true,
  endedAt: true
});

export const updateConstellationEventSchema = insertConstellationEventSchema.partial();

export const insertEventParticipantSchema = createInsertSchema(eventParticipants).omit({ 
  id: true, 
  joinedAt: true,
  leftAt: true,
  lastActivityAt: true
});

export const insertEventLogSchema = createInsertSchema(eventLogs).omit({ 
  id: true, 
  createdAt: true 
});

export const insertEventNotificationSchema = createInsertSchema(eventNotifications).omit({ 
  id: true, 
  createdAt: true 
});

// === TYPES ===
export type ConstellationEvent = typeof constellationEvents.$inferSelect;
export type InsertConstellationEvent = z.infer<typeof insertConstellationEventSchema>;
export type UpdateConstellationEvent = z.infer<typeof updateConstellationEventSchema>;

export type EventParticipant = typeof eventParticipants.$inferSelect;
export type InsertEventParticipant = z.infer<typeof insertEventParticipantSchema>;

export type EventLog = typeof eventLogs.$inferSelect;
export type InsertEventLog = z.infer<typeof insertEventLogSchema>;

export type EventNotification = typeof eventNotifications.$inferSelect;
export type InsertEventNotification = z.infer<typeof insertEventNotificationSchema>;

// === CURIOSITY QUESTS ===
export const quests = pgTable("quests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description").notNull(),
  questType: text("quest_type").notNull(), // lore_discovery, creation_spark, hidden_sanctuary, agent_relationship
  requiredStage: text("required_stage").default("seedling").notNull(), // seedling, sprout, bloom, radiant
  difficulty: text("difficulty").default("novice").notNull(), // novice, adept, master
  estimatedDuration: integer("estimated_duration").default(15), // in minutes
  iconUrl: text("icon_url"),
  theme: text("theme"), // mystical theme colors/styling
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const questPaths = pgTable("quest_paths", {
  id: serial("id").primaryKey(),
  questId: integer("quest_id").notNull().references(() => quests.id, { onDelete: "cascade" }),
  pathName: text("path_name").notNull(),
  description: text("description").notNull(),
  order: integer("order").default(0),
  agentPrompt: text("agent_prompt").notNull(), // What the agent says to guide
  nextPathId: integer("next_path_id"), // For branching
  outcomeType: text("outcome_type"), // lore_entry, creation_idea, sanctuary, bond
  outcomeData: jsonb("outcome_data"), // Unlocked content details
  createdAt: timestamp("created_at").defaultNow(),
});

export const userQuestProgress = pgTable("user_quest_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Foreign key to users
  questId: integer("quest_id").notNull().references(() => quests.id, { onDelete: "cascade" }),
  agentId: integer("agent_id").references(() => agents.id, { onDelete: "set null" }), // Guide agent
  status: text("status").default("not_started").notNull(), // not_started, in_progress, completed, abandoned
  currentPathId: integer("current_path_id").references(() => questPaths.id, { onDelete: "set null" }),
  completedPaths: text("completed_paths").array().default([]), // Array of path IDs
  choicesMade: jsonb("choices_made").default([]), // Track user choices
  progress: integer("progress").default(0), // 0-100 percentage
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const questAchievements = pgTable("quest_achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url"),
  category: text("category").notNull(), // explorer, discoverer, creator, bonded
  rarity: text("rarity").default("common").notNull(), // common, rare, epic, legendary
  requiredQuests: text("required_quests").array(), // Quest slugs needed
  requiredCount: integer("required_count").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  achievementId: integer("achievement_id").notNull().references(() => questAchievements.id, { onDelete: "cascade" }),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

export const questChatMessages = pgTable("quest_chat_messages", {
  id: serial("id").primaryKey(),
  progressId: integer("progress_id").notNull().references(() => userQuestProgress.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // user, agent, system
  content: text("content").notNull(),
  pathId: integer("path_id").references(() => questPaths.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// === ZOD SCHEMAS FOR QUESTS ===
export const insertQuestSchema = createInsertSchema(quests).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true 
});

export const insertQuestPathSchema = createInsertSchema(questPaths).omit({ 
  id: true, 
  createdAt: true 
});

export const insertUserQuestProgressSchema = createInsertSchema(userQuestProgress).omit({ 
  id: true, 
  createdAt: true,
  lastActivityAt: true 
});

export const insertQuestAchievementSchema = createInsertSchema(questAchievements).omit({ 
  id: true, 
  createdAt: true 
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({ 
  id: true, 
  unlockedAt: true 
});

export const insertQuestChatMessageSchema = createInsertSchema(questChatMessages).omit({ 
  id: true, 
  createdAt: true 
});

// === TYPES FOR QUESTS ===
export type Quest = typeof quests.$inferSelect;
export type InsertQuest = z.infer<typeof insertQuestSchema>;

export type QuestPath = typeof questPaths.$inferSelect;
export type InsertQuestPath = z.infer<typeof insertQuestPathSchema>;

export type UserQuestProgress = typeof userQuestProgress.$inferSelect;
export type InsertUserQuestProgress = z.infer<typeof insertUserQuestProgressSchema>;

export type QuestAchievement = typeof questAchievements.$inferSelect;
export type InsertQuestAchievement = z.infer<typeof insertQuestAchievementSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export type QuestChatMessage = typeof questChatMessages.$inferSelect;
export type InsertQuestChatMessage = z.infer<typeof insertQuestChatMessageSchema>;
