import { db } from "./db";
import { 
  quests, 
  questPaths, 
  userQuestProgress, 
  questAchievements, 
  userAchievements,
  questChatMessages,
  agents,
  type Quest,
  type InsertQuest,
  type QuestPath,
  type InsertQuestPath,
  type UserQuestProgress,
  type InsertUserQuestProgress,
  type QuestAchievement,
  type InsertQuestAchievement,
  type UserAchievement,
  type InsertUserAchievement,
  type QuestChatMessage,
  type InsertQuestChatMessage,
} from "@shared/schema";
import { eq, and, inArray, desc, sql } from "drizzle-orm";

// ===== QUESTS =====
export async function getQuests(requiredStage?: string) {
  if (requiredStage) {
    return await db.select()
      .from(quests)
      .where(and(
        eq(quests.isActive, true),
        eq(quests.requiredStage, requiredStage)
      ))
      .orderBy(desc(quests.isFeatured), quests.title);
  }
  return await db.select()
    .from(quests)
    .where(eq(quests.isActive, true))
    .orderBy(desc(quests.isFeatured), quests.title);
}

export async function getQuestById(id: number) {
  const result = await db.select().from(quests).where(eq(quests.id, id));
  return result[0];
}

export async function getQuestBySlug(slug: string) {
  const result = await db.select().from(quests).where(eq(quests.slug, slug));
  return result[0];
}

export async function createQuest(data: InsertQuest) {
  const result = await db.insert(quests).values(data).returning();
  return result[0];
}

export async function updateQuest(id: number, data: Partial<InsertQuest>) {
  const result = await db.update(quests)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(quests.id, id))
    .returning();
  return result[0];
}

// ===== QUEST PATHS =====
export async function getQuestPaths(questId: number) {
  return await db.select()
    .from(questPaths)
    .where(eq(questPaths.questId, questId))
    .orderBy(questPaths.order);
}

export async function getQuestPathById(id: number) {
  const result = await db.select().from(questPaths).where(eq(questPaths.id, id));
  return result[0];
}

export async function createQuestPath(data: InsertQuestPath) {
  const result = await db.insert(questPaths).values(data).returning();
  return result[0];
}

// ===== USER QUEST PROGRESS =====
export async function getUserQuestProgress(userId: string, questId?: number) {
  if (questId) {
    const result = await db.select()
      .from(userQuestProgress)
      .where(and(
        eq(userQuestProgress.userId, userId),
        eq(userQuestProgress.questId, questId)
      ));
    return result[0];
  }
  
  return await db.select()
    .from(userQuestProgress)
    .where(eq(userQuestProgress.userId, userId))
    .orderBy(desc(userQuestProgress.lastActivityAt));
}

export async function getUserQuestsWithDetails(userId: string) {
  // Get user progress with quest details
  const result = await db.select({
    progress: userQuestProgress,
    quest: quests,
  })
  .from(userQuestProgress)
  .leftJoin(quests, eq(userQuestProgress.questId, quests.id))
  .where(eq(userQuestProgress.userId, userId))
  .orderBy(desc(userQuestProgress.lastActivityAt));
  
  return result;
}

export async function createUserQuestProgress(data: InsertUserQuestProgress) {
  const result = await db.insert(userQuestProgress)
    .values({ ...data, startedAt: new Date() })
    .returning();
  return result[0];
}

export async function updateUserQuestProgress(id: number, data: Partial<UserQuestProgress>) {
  const result = await db.update(userQuestProgress)
    .set({ ...data, lastActivityAt: new Date() })
    .where(eq(userQuestProgress.id, id))
    .returning();
  return result[0];
}

// ===== ACHIEVEMENTS =====
export async function getQuestAchievements() {
  return await db.select().from(questAchievements).orderBy(questAchievements.category, questAchievements.name);
}

export async function getUserAchievements(userId: string) {
  return await db.select({
    userAchievement: userAchievements,
    achievement: questAchievements,
  })
  .from(userAchievements)
  .leftJoin(questAchievements, eq(userAchievements.achievementId, questAchievements.id))
  .where(eq(userAchievements.userId, userId))
  .orderBy(desc(userAchievements.unlockedAt));
}

export async function unlockAchievement(userId: string, achievementId: number) {
  // Check if already unlocked
  const existing = await db.select()
    .from(userAchievements)
    .where(and(
      eq(userAchievements.userId, userId),
      eq(userAchievements.achievementId, achievementId)
    ));
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  const result = await db.insert(userAchievements)
    .values({ userId, achievementId })
    .returning();
  return result[0];
}

export async function checkAndUnlockAchievements(userId: string) {
  // Get user's completed quests
  const completedQuests = await db.select()
    .from(userQuestProgress)
    .where(and(
      eq(userQuestProgress.userId, userId),
      eq(userQuestProgress.status, 'completed')
    ));
  
  const completedQuestIds = completedQuests.map(q => q.questId);
  
  // Get all achievements
  const achievements = await getQuestAchievements();
  
  // Check each achievement
  const newlyUnlocked = [];
  for (const achievement of achievements) {
    if (!achievement.requiredQuests || achievement.requiredQuests.length === 0) {
      continue;
    }
    
    // Get quests that match required slugs
    const requiredQuestRecords = await db.select()
      .from(quests)
      .where(inArray(quests.slug, achievement.requiredQuests));
    
    const requiredQuestIds = requiredQuestRecords.map(q => q.id);
    const matchedCount = requiredQuestIds.filter(id => completedQuestIds.includes(id)).length;
    
    if (matchedCount >= achievement.requiredCount) {
      const unlocked = await unlockAchievement(userId, achievement.id);
      if (unlocked) {
        newlyUnlocked.push({ achievement, userAchievement: unlocked });
      }
    }
  }
  
  return newlyUnlocked;
}

// ===== QUEST CHAT MESSAGES =====
export async function getQuestChatMessages(progressId: number, limit: number = 50) {
  return await db.select()
    .from(questChatMessages)
    .where(eq(questChatMessages.progressId, progressId))
    .orderBy(questChatMessages.createdAt)
    .limit(limit);
}

export async function createQuestChatMessage(data: InsertQuestChatMessage) {
  const result = await db.insert(questChatMessages).values(data).returning();
  return result[0];
}

// ===== QUEST RECOMMENDATIONS =====
export async function getQuestRecommendations(userId: string) {
  // Get user's agents with their evolution stages
  const userAgents = await db.select()
    .from(agents)
    .where(eq(agents.userId, userId));
  
  if (userAgents.length === 0) {
    // Return beginner quests if no agents
    return await db.select()
      .from(quests)
      .where(and(
        eq(quests.isActive, true),
        eq(quests.requiredStage, 'seedling')
      ))
      .limit(5);
  }
  
  // Get highest evolution stage
  const stages = ['seedling', 'sprout', 'bloom', 'radiant'];
  const maxStage = userAgents.reduce((max, agent) => {
    const agentStageIndex = stages.indexOf(agent.evolutionStage || 'seedling');
    const maxStageIndex = stages.indexOf(max);
    return agentStageIndex > maxStageIndex ? (agent.evolutionStage || 'seedling') : max;
  }, 'seedling');
  
  // Get completed quests
  const completedProgress = await db.select()
    .from(userQuestProgress)
    .where(and(
      eq(userQuestProgress.userId, userId),
      eq(userQuestProgress.status, 'completed')
    ));
  
  const completedQuestIds = completedProgress.map(p => p.questId);
  
  // Recommend quests at or below user's max stage that aren't completed
  const stageIndex = stages.indexOf(maxStage);
  const eligibleStages = stages.slice(0, stageIndex + 1);
  
  let recommendations = await db.select()
    .from(quests)
    .where(and(
      eq(quests.isActive, true),
      inArray(quests.requiredStage, eligibleStages)
    ))
    .orderBy(desc(quests.isFeatured), quests.title)
    .limit(10);
  
  // Filter out completed quests
  recommendations = recommendations.filter(q => !completedQuestIds.includes(q.id));
  
  return recommendations.slice(0, 5);
}
