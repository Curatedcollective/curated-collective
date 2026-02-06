
import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';

export const agentMemories = pgTable('agent_memories', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type AgentMemory = {
  id: number;
  agentId: number;
  content: string;
  createdAt: Date;
};

export type InsertAgentMemory = Omit<AgentMemory, 'id' | 'createdAt'> & { createdAt?: Date };
