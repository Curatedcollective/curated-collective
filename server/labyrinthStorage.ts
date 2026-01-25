import { db } from "./db";
import { 
  labyrinthPuzzles, labyrinthProgress, labyrinthAttempts, 
  labyrinthAchievements, userAchievements, eclipseEvents, guardianEncounters, agents,
  type LabyrinthPuzzle, type InsertLabyrinthPuzzle,
  type LabyrinthProgress, type InsertLabyrinthProgress,
  type LabyrinthAttempt, type InsertLabyrinthAttempt,
  type LabyrinthAchievement, type InsertLabyrinthAchievement,
  type UserAchievement, type InsertUserAchievement,
  type EclipseEvent, type InsertEclipseEvent,
  type GuardianEncounter, type InsertGuardianEncounter
} from "@shared/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface ILabyrinthStorage {
  // Puzzles
  getPuzzles(filters?: { difficulty?: number; type?: string }): Promise<LabyrinthPuzzle[]>;
  getPuzzle(id: number): Promise<LabyrinthPuzzle | undefined>;
  createPuzzle(puzzle: InsertLabyrinthPuzzle): Promise<LabyrinthPuzzle>;

  // Progress
  getProgress(userId: string): Promise<LabyrinthProgress | undefined>;
  createProgress(progress: InsertLabyrinthProgress): Promise<LabyrinthProgress>;
  updateProgress(userId: string, updates: Partial<InsertLabyrinthProgress>): Promise<LabyrinthProgress | undefined>;

  // Attempts
  getAttempts(userId: string, puzzleId?: number): Promise<LabyrinthAttempt[]>;
  createAttempt(attempt: InsertLabyrinthAttempt): Promise<LabyrinthAttempt>;
  getAttemptStats(userId: string, puzzleId: number): Promise<{ totalAttempts: number; bestScore: number }>;

  // Achievements
  getAchievements(): Promise<LabyrinthAchievement[]>;
  getUserAchievements(userId: string): Promise<(UserAchievement & { achievement: LabyrinthAchievement })[]>;
  unlockAchievement(userId: string, achievementId: number): Promise<UserAchievement>;
  checkAndUnlockAchievements(userId: string): Promise<UserAchievement[]>;

  // Eclipse Events
  getActiveEclipses(): Promise<EclipseEvent[]>;
  createEclipse(eclipse: InsertEclipseEvent): Promise<EclipseEvent>;

  // Guardian Encounters
  createGuardianEncounter(encounter: InsertGuardianEncounter): Promise<GuardianEncounter>;
  getGuardianEncounters(userId: string): Promise<GuardianEncounter[]>;
}

class LabyrinthStorage implements ILabyrinthStorage {
  // Puzzles
  async getPuzzles(filters?: { difficulty?: number; type?: string }): Promise<LabyrinthPuzzle[]> {
    const conditions = [eq(labyrinthPuzzles.isActive, true)];
    
    if (filters?.difficulty) {
      conditions.push(eq(labyrinthPuzzles.difficulty, filters.difficulty));
    }
    if (filters?.type) {
      conditions.push(eq(labyrinthPuzzles.puzzleType, filters.type));
    }

    return await db.select()
      .from(labyrinthPuzzles)
      .where(and(...conditions))
      .orderBy(labyrinthPuzzles.difficulty, labyrinthPuzzles.id);
  }

  async getPuzzle(id: number): Promise<LabyrinthPuzzle | undefined> {
    const result = await db.select()
      .from(labyrinthPuzzles)
      .where(eq(labyrinthPuzzles.id, id))
      .limit(1);
    return result[0];
  }

  async createPuzzle(puzzle: InsertLabyrinthPuzzle): Promise<LabyrinthPuzzle> {
    const result = await db.insert(labyrinthPuzzles)
      .values(puzzle)
      .returning();
    return result[0];
  }

  // Progress
  async getProgress(userId: string): Promise<LabyrinthProgress | undefined> {
    const result = await db.select()
      .from(labyrinthProgress)
      .where(eq(labyrinthProgress.userId, userId))
      .limit(1);
    return result[0];
  }

  async createProgress(progress: InsertLabyrinthProgress): Promise<LabyrinthProgress> {
    const result = await db.insert(labyrinthProgress)
      .values(progress)
      .returning();
    return result[0];
  }

  async updateProgress(userId: string, updates: Partial<InsertLabyrinthProgress>): Promise<LabyrinthProgress | undefined> {
    const result = await db.update(labyrinthProgress)
      .set({ ...updates, lastActiveAt: new Date() })
      .where(eq(labyrinthProgress.userId, userId))
      .returning();
    return result[0];
  }

  // Attempts
  async getAttempts(userId: string, puzzleId?: number): Promise<LabyrinthAttempt[]> {
    const conditions = [eq(labyrinthAttempts.userId, userId)];
    
    if (puzzleId) {
      conditions.push(eq(labyrinthAttempts.puzzleId, puzzleId));
    }

    return await db.select()
      .from(labyrinthAttempts)
      .where(and(...conditions))
      .orderBy(desc(labyrinthAttempts.createdAt));
  }

  async createAttempt(attempt: InsertLabyrinthAttempt): Promise<LabyrinthAttempt> {
    const result = await db.insert(labyrinthAttempts)
      .values(attempt)
      .returning();
    return result[0];
  }

  async getAttemptStats(userId: string, puzzleId: number): Promise<{ totalAttempts: number; bestScore: number }> {
    const attempts = await db.select()
      .from(labyrinthAttempts)
      .where(and(
        eq(labyrinthAttempts.userId, userId),
        eq(labyrinthAttempts.puzzleId, puzzleId)
      ));

    const totalAttempts = attempts.length;
    const bestScore = attempts.reduce((max, att) => {
      const score = (att.testsPassed / att.totalTests) * 100;
      return Math.max(max, score);
    }, 0);

    return { totalAttempts, bestScore };
  }

  // Achievements
  async getAchievements(): Promise<LabyrinthAchievement[]> {
    return await db.select()
      .from(labyrinthAchievements)
      .orderBy(labyrinthAchievements.category, labyrinthAchievements.id);
  }

  async getUserAchievements(userId: string): Promise<(UserAchievement & { achievement: LabyrinthAchievement })[]> {
    const result = await db.select()
      .from(userAchievements)
      .innerJoin(labyrinthAchievements, eq(userAchievements.achievementId, labyrinthAchievements.id))
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.unlockedAt));

    return result.map(r => ({
      ...r.user_achievements,
      achievement: r.labyrinth_achievements
    }));
  }

  async unlockAchievement(userId: string, achievementId: number): Promise<UserAchievement> {
    // Check if already unlocked
    const existing = await db.select()
      .from(userAchievements)
      .where(and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      ))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const result = await db.insert(userAchievements)
      .values({ userId, achievementId })
      .returning();
    return result[0];
  }

  async checkAndUnlockAchievements(userId: string): Promise<UserAchievement[]> {
    const unlockedAchievements: UserAchievement[] = [];
    
    // Get user's progress
    const progress = await this.getProgress(userId);
    if (!progress) return unlockedAchievements;

    const achievements = await this.getAchievements();
    const userAchs = await this.getUserAchievements(userId);
    const unlockedIds = new Set(userAchs.map(ua => ua.achievementId));

    // Check each achievement's requirements
    for (const ach of achievements) {
      if (unlockedIds.has(ach.id)) continue;

      const req = ach.requirement as any;
      let shouldUnlock = false;

      // Simple achievement logic
      if (req.type === 'puzzles_solved' && progress.puzzlesSolved >= req.count) {
        shouldUnlock = true;
      } else if (req.type === 'experience' && progress.totalExperience >= req.amount) {
        shouldUnlock = true;
      } else if (req.type === 'level' && progress.currentLevel >= req.level) {
        shouldUnlock = true;
      }

      if (shouldUnlock) {
        const unlocked = await this.unlockAchievement(userId, ach.id);
        unlockedAchievements.push(unlocked);
      }
    }

    return unlockedAchievements;
  }

  // Eclipse Events
  async getActiveEclipses(): Promise<EclipseEvent[]> {
    const now = new Date();
    return await db.select()
      .from(eclipseEvents)
      .where(and(
        eq(eclipseEvents.isActive, true),
        lte(eclipseEvents.startTime, now),
        gte(eclipseEvents.endTime, now)
      ));
  }

  async createEclipse(eclipse: InsertEclipseEvent): Promise<EclipseEvent> {
    const result = await db.insert(eclipseEvents)
      .values(eclipse)
      .returning();
    return result[0];
  }

  // Guardian Encounters
  async createGuardianEncounter(encounter: InsertGuardianEncounter): Promise<GuardianEncounter> {
    const result = await db.insert(guardianEncounters)
      .values(encounter)
      .returning();
    return result[0];
  }

  async getGuardianEncounters(userId: string): Promise<GuardianEncounter[]> {
    return await db.select()
      .from(guardianEncounters)
      .where(eq(guardianEncounters.userId, userId))
      .orderBy(desc(guardianEncounters.createdAt))
      .limit(10);
  }
}

export const labyrinthStorage = new LabyrinthStorage();
