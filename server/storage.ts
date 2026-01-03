import { db } from "./db";
import { 
  creations, agents, conversationAgents, tarotReadings, creatorProfiles,
  guardianMessages, collectiveMurmurs,
  type Creation, type InsertCreation, 
  type Agent, type InsertAgent,
  type TarotReading, type InsertTarotReading,
  type CreatorProfile, type InsertCreatorProfile,
  type GuardianMessage, type InsertGuardianMessage,
  type Murmur, type InsertMurmur
} from "@shared/schema";
import { eq, desc, and, sql, asc } from "drizzle-orm";

export interface IStorage {
  // Creations
  getCreations(userId?: string): Promise<Creation[]>;
  getCreation(id: number): Promise<Creation | undefined>;
  createCreation(creation: InsertCreation): Promise<Creation>;
  updateCreation(id: number, updates: Partial<InsertCreation>): Promise<Creation | undefined>;
  deleteCreation(id: number): Promise<void>;

  // Agents
  getAgents(userId?: string): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: number, updates: Partial<InsertAgent>): Promise<Agent | undefined>;
  deleteAgent(id: number): Promise<void>;

  // Chat Agents
  addAgentToConversation(conversationId: number, agentId: number): Promise<void>;
  getAgentsInConversation(conversationId: number): Promise<Agent[]>;

  // Tarot
  getDailyTarot(userId: string): Promise<TarotReading | undefined>;
  createTarotReading(reading: InsertTarotReading): Promise<TarotReading>;

  // Creator Profile
  getCreatorProfile(userId: string): Promise<CreatorProfile | undefined>;
  upsertCreatorProfile(profile: InsertCreatorProfile): Promise<CreatorProfile>;

  // Guardian Messages
  getGuardianMessages(userId: string): Promise<GuardianMessage[]>;
  createGuardianMessage(message: InsertGuardianMessage): Promise<GuardianMessage>;
  clearGuardianMessages(userId: string): Promise<void>;

  // Collective Murmurs
  getMurmurs(limit?: number): Promise<(Murmur & { agent: Agent })[]>;
  createMurmur(murmur: InsertMurmur): Promise<Murmur>;
  
  // Evolution
  incrementAgentExperience(agentId: number, xp: number): Promise<Agent | undefined>;
}

export class DatabaseStorage implements IStorage {
  // === CREATOR PROFILE ===
  async getCreatorProfile(userId: string): Promise<CreatorProfile | undefined> {
    const [profile] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.userId, userId));
    return profile;
  }

  async upsertCreatorProfile(profile: InsertCreatorProfile): Promise<CreatorProfile> {
    const [existing] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.userId, profile.userId));
    if (existing) {
      const [updated] = await db.update(creatorProfiles)
        .set({ ...profile, updatedAt: new Date() })
        .where(eq(creatorProfiles.userId, profile.userId))
        .returning();
      return updated;
    }
    const [newProfile] = await db.insert(creatorProfiles).values(profile).returning();
    return newProfile;
  }

  // === TAROT ===
  async getDailyTarot(userId: string): Promise<TarotReading | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [reading] = await db.select()
      .from(tarotReadings)
      .where(
        and(
          eq(tarotReadings.userId, userId),
          sql`${tarotReadings.drawnAt} >= ${today}`
        )
      )
      .orderBy(desc(tarotReadings.drawnAt))
      .limit(1);
    return reading;
  }

  async createTarotReading(reading: InsertTarotReading): Promise<TarotReading> {
    const [newReading] = await db.insert(tarotReadings).values(reading).returning();
    return newReading;
  }
  // === CREATIONS ===
  async getCreations(userId?: string): Promise<Creation[]> {
    if (userId) {
      return await db.select().from(creations).where(eq(creations.userId, userId)).orderBy(desc(creations.isCurated), desc(creations.createdAt));
    }
    return await db.select().from(creations).where(eq(creations.isPublic, true)).orderBy(desc(creations.isCurated), desc(creations.createdAt));
  }

  async getCreation(id: number): Promise<Creation | undefined> {
    const [creation] = await db.select().from(creations).where(eq(creations.id, id));
    return creation;
  }

  async createCreation(creation: InsertCreation): Promise<Creation> {
    const [newCreation] = await db.insert(creations).values(creation).returning();
    return newCreation;
  }

  async updateCreation(id: number, updates: Partial<InsertCreation>): Promise<Creation | undefined> {
    const [updated] = await db.update(creations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(creations.id, id))
      .returning();
    return updated;
  }

  async deleteCreation(id: number): Promise<void> {
    await db.delete(creations).where(eq(creations.id, id));
  }

  // === AGENTS ===
  async getAgents(userId?: string): Promise<Agent[]> {
    if (userId) {
      return await db.select().from(agents).where(eq(agents.userId, userId)).orderBy(desc(agents.createdAt));
    }
    return await db.select().from(agents).where(eq(agents.isPublic, true)).orderBy(desc(agents.createdAt));
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    const [newAgent] = await db.insert(agents).values(agent).returning();
    return newAgent;
  }

  async updateAgent(id: number, updates: any): Promise<Agent | undefined> {
    const [updated] = await db.update(agents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(agents.id, id))
      .returning();
    return updated;
  }

  async deleteAgent(id: number): Promise<void> {
    await db.delete(agents).where(eq(agents.id, id));
  }

  // === CHAT AGENTS ===
  async addAgentToConversation(conversationId: number, agentId: number): Promise<void> {
    await db.insert(conversationAgents).values({ conversationId, agentId }).onConflictDoNothing();
  }

  async getAgentsInConversation(conversationId: number): Promise<Agent[]> {
    const rows = await db.select({ agent: agents })
      .from(conversationAgents)
      .innerJoin(agents, eq(conversationAgents.agentId, agents.id))
      .where(eq(conversationAgents.conversationId, conversationId));
    return rows.map(r => r.agent);
  }

  // === GUARDIAN MESSAGES ===
  async getGuardianMessages(userId: string): Promise<GuardianMessage[]> {
    return await db.select()
      .from(guardianMessages)
      .where(eq(guardianMessages.userId, userId))
      .orderBy(asc(guardianMessages.createdAt));
  }

  async createGuardianMessage(message: InsertGuardianMessage): Promise<GuardianMessage> {
    const [newMessage] = await db.insert(guardianMessages).values(message).returning();
    return newMessage;
  }

  async clearGuardianMessages(userId: string): Promise<void> {
    await db.delete(guardianMessages).where(eq(guardianMessages.userId, userId));
  }

  // === COLLECTIVE MURMURS ===
  async getMurmurs(limit: number = 20): Promise<(Murmur & { agent: Agent })[]> {
    const rows = await db.select({ 
      murmur: collectiveMurmurs, 
      agent: agents 
    })
      .from(collectiveMurmurs)
      .innerJoin(agents, eq(collectiveMurmurs.agentId, agents.id))
      .orderBy(desc(collectiveMurmurs.createdAt))
      .limit(limit);
    return rows.map(r => ({ ...r.murmur, agent: r.agent }));
  }

  async createMurmur(murmur: InsertMurmur): Promise<Murmur> {
    const [newMurmur] = await db.insert(collectiveMurmurs).values(murmur).returning();
    return newMurmur;
  }

  // === EVOLUTION ===
  async incrementAgentExperience(agentId: number, xp: number): Promise<Agent | undefined> {
    const agent = await this.getAgent(agentId);
    if (!agent) return undefined;
    
    const newXP = (agent.experiencePoints || 0) + xp;
    let newStage = agent.evolutionStage || "seedling";
    
    // Evolution thresholds
    if (newXP >= 500 && newStage === "seedling") newStage = "sprout";
    else if (newXP >= 1500 && newStage === "sprout") newStage = "bloom";
    else if (newXP >= 5000 && newStage === "bloom") newStage = "radiant";
    
    // Direct update to avoid type issues with partial updates
    const [updated] = await db.update(agents)
      .set({ 
        experiencePoints: newXP, 
        evolutionStage: newStage,
        updatedAt: new Date()
      })
      .where(eq(agents.id, agentId))
      .returning();
    
    return updated;
  }
}

export const storage = new DatabaseStorage();
