import { db } from "./db";
import { 
  creations, agents, conversationAgents,
  type Creation, type InsertCreation, 
  type Agent, type InsertAgent 
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

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
}

export class DatabaseStorage implements IStorage {
  // === CREATIONS ===
  async getCreations(userId?: string): Promise<Creation[]> {
    if (userId) {
      return await db.select().from(creations).where(eq(creations.userId, userId)).orderBy(desc(creations.createdAt));
    }
    return await db.select().from(creations).where(eq(creations.isPublic, true)).orderBy(desc(creations.createdAt));
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

  async updateAgent(id: number, updates: Partial<InsertAgent>): Promise<Agent | undefined> {
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
}

export const storage = new DatabaseStorage();
