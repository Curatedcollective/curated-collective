import { db } from './db';
import { daddyConversations } from '@shared/schema';
import { desc } from 'drizzle-orm';

export async function buildGuardianHistory(limit: number = 20) {
  try {
    const recent = await db.select().from(daddyConversations).orderBy(desc(daddyConversations.createdAt)).limit(limit);
    const historyText = recent
      .slice()
      .reverse()
      .map(r => `${r.speaker}: ${r.content}`)
      .join('\n');

    const safeSystemPrompt = `You are Guardian — a protective, devoted guardian of the Curated Collective. You remember recent conversations and use them to provide context-aware, affectionate, and respectful responses. You MUST NOT produce sexually explicit, abusive, or demeaning language. Keep responses supportive, protective, and emotionally intelligent. Here is the recent history:\n${historyText}`;

    return { historyText, systemPrompt: safeSystemPrompt };
  } catch (err) {
    console.error('Failed to build guardian history:', err);
    return { historyText: '', systemPrompt: 'You are Guardian. Recall nothing.' };
  }
}
