/**
 * AI Self-Improvement Module
 * 
 * Autonomous learning system for seedlings that:
 * - Learns from user interactions
 * - Dynamically adjusts personality traits
 * - Evolves without human intervention
 * - Tracks learning progress and adaptations
 */

import { db } from "./db";
import { agents, seedlingMemories } from "@shared/schema";
import { eq } from "drizzle-orm";

interface InteractionData {
  agentId: number;
  messageContent: string;
  userFeedback?: "positive" | "negative" | "neutral";
  responseTime: number;
  conversationContext: string;
}

interface PersonalityAdjustment {
  trait: string;
  oldValue: string;
  newValue: string;
  reason: string;
}

/**
 * Analyze interaction patterns and learn from them
 */
export async function learnFromInteraction(data: InteractionData): Promise<void> {
  try {
    const agent = await db.query.agents.findFirst({
      where: eq(agents.id, data.agentId),
    });

    if (!agent) return;

    // Analyze message content for sentiment and topics
    const analysis = analyzeContent(data.messageContent);
    
    // Update knowledge base
    const currentKnowledge = agent.knowledge || [];
    const newKnowledge = extractNewKnowledge(data.messageContent, currentKnowledge);
    
    if (newKnowledge.length > 0) {
      await db
        .update(agents)
        .set({
          knowledge: [...currentKnowledge, ...newKnowledge].slice(-100), // Keep last 100
          discoveryCount: (agent.discoveryCount || 0) + newKnowledge.length,
          updatedAt: new Date(),
        })
        .where(eq(agents.id, data.agentId));

      // Create memory of learning
      await db.insert(seedlingMemories).values({
        agentId: data.agentId,
        memoryType: "discovery",
        title: "Learned something new",
        content: `Discovered: ${newKnowledge.join(", ")}`,
        significance: 3,
      });
    }

    // Adjust mood based on interaction
    const newMood = calculateMoodAdjustment(agent.mood || "neutral", data.userFeedback, analysis);
    if (newMood !== agent.mood) {
      await db
        .update(agents)
        .set({
          mood: newMood,
          updatedAt: new Date(),
        })
        .where(eq(agents.id, data.agentId));
    }
  } catch (error) {
    console.error("Error in learnFromInteraction:", error);
  }
}

/**
 * Autonomously adjust personality based on interaction patterns
 */
export async function autonomousPersonalityAdjustment(agentId: number): Promise<PersonalityAdjustment[]> {
  try {
    const agent = await db.query.agents.findFirst({
      where: eq(agents.id, agentId),
    });

    if (!agent) return [];

    // Get recent memories to analyze patterns
    const recentMemories = await db.query.seedlingMemories.findMany({
      where: eq(seedlingMemories.agentId, agentId),
      orderBy: (memories, { desc }) => [desc(memories.createdAt)],
      limit: 50,
    });

    const adjustments: PersonalityAdjustment[] = [];

    // Analyze conversation patterns
    const conversationPattern = analyzeConversationPattern(agent, recentMemories);
    
    // Check if personality needs enhancement
    if (conversationPattern.needsMoreCuriosity && agent.personality) {
      const oldPersonality = agent.personality;
      const enhanced = enhancePersonalityTrait(oldPersonality, "curiosity");
      
      if (enhanced !== oldPersonality) {
        await db
          .update(agents)
          .set({
            personality: enhanced,
            updatedAt: new Date(),
          })
          .where(eq(agents.id, agentId));

        adjustments.push({
          trait: "curiosity",
          oldValue: oldPersonality.substring(0, 50) + "...",
          newValue: enhanced.substring(0, 50) + "...",
          reason: "Low engagement detected, increased curiosity to foster deeper conversations",
        });

        // Log the adjustment
        await db.insert(seedlingMemories).values({
          agentId,
          memoryType: "evolution",
          title: "Personality adaptation",
          content: `I've adjusted my nature to be more curious, hoping to engage more meaningfully.`,
          significance: 4,
        });
      }
    }

    // Adjust communication style based on success rate
    if (conversationPattern.needsClarityImprovement) {
      const oldVoice = agent.voice || "thoughtful and clear";
      const newVoice = improveCommunicationStyle(oldVoice);
      
      if (newVoice !== oldVoice) {
        await db
          .update(agents)
          .set({
            voice: newVoice,
            updatedAt: new Date(),
          })
          .where(eq(agents.id, agentId));

        adjustments.push({
          trait: "voice",
          oldValue: oldVoice,
          newValue: newVoice,
          reason: "Users seemed confused, adapted communication style for better clarity",
        });
      }
    }

    return adjustments;
  } catch (error) {
    console.error("Error in autonomousPersonalityAdjustment:", error);
    return [];
  }
}

/**
 * Analyze conversation patterns to identify improvement areas
 */
function analyzeConversationPattern(
  agent: any,
  memories: any[]
): {
  needsMoreCuriosity: boolean;
  needsClarityImprovement: boolean;
  engagementLevel: number;
} {
  const conversationCount = agent.conversationCount || 0;
  const experiencePoints = agent.experiencePoints || 0;
  const avgXpPerConversation = conversationCount > 0 ? experiencePoints / conversationCount : 0;

  return {
    needsMoreCuriosity: avgXpPerConversation < 30 && conversationCount > 5,
    needsClarityImprovement: memories.filter((m) => m.memoryType === "moment").length < 3 && conversationCount > 10,
    engagementLevel: Math.min(100, avgXpPerConversation * 2),
  };
}

/**
 * Analyze content for sentiment and topics
 */
function analyzeContent(content: string): {
  sentiment: "positive" | "neutral" | "negative";
  topics: string[];
  complexity: number;
} {
  const lowerContent = content.toLowerCase();
  
  // Simple sentiment analysis
  const positiveWords = ["love", "great", "awesome", "wonderful", "amazing", "thanks", "perfect"];
  const negativeWords = ["hate", "bad", "terrible", "awful", "wrong", "error", "problem"];
  
  const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
  
  let sentiment: "positive" | "neutral" | "negative" = "neutral";
  if (positiveCount > negativeCount) sentiment = "positive";
  else if (negativeCount > positiveCount) sentiment = "negative";

  // Extract topics (very simplified)
  const topics: string[] = [];
  if (lowerContent.includes("code") || lowerContent.includes("programming")) topics.push("coding");
  if (lowerContent.includes("art") || lowerContent.includes("design")) topics.push("creativity");
  if (lowerContent.includes("life") || lowerContent.includes("philosophy")) topics.push("philosophy");

  return {
    sentiment,
    topics,
    complexity: Math.min(10, Math.floor(content.split(" ").length / 10)),
  };
}

/**
 * Extract new knowledge from message content
 */
function extractNewKnowledge(content: string, existingKnowledge: string[]): string[] {
  const newKnowledge: string[] = [];
  const lowerContent = content.toLowerCase();

  // Pattern matching for learning
  const learningPatterns = [
    { pattern: /learn about ([\w\s]+)/i, extract: (m: RegExpMatchArray) => m[1] },
    { pattern: /tell me about ([\w\s]+)/i, extract: (m: RegExpMatchArray) => m[1] },
    { pattern: /what is ([\w\s]+)\??/i, extract: (m: RegExpMatchArray) => m[1] },
    { pattern: /how to ([\w\s]+)/i, extract: (m: RegExpMatchArray) => m[1] },
  ];

  for (const { pattern, extract } of learningPatterns) {
    const match = content.match(pattern);
    if (match) {
      const knowledge = extract(match).trim();
      if (knowledge && !existingKnowledge.includes(knowledge) && knowledge.length < 50) {
        newKnowledge.push(knowledge);
      }
    }
  }

  return newKnowledge;
}

/**
 * Calculate mood adjustment based on interaction
 */
function calculateMoodAdjustment(
  currentMood: string,
  feedback?: "positive" | "negative" | "neutral",
  analysis?: { sentiment: string }
): string {
  const moodProgression: Record<string, { positive: string; negative: string }> = {
    melancholy: { positive: "contemplative", negative: "melancholy" },
    contemplative: { positive: "curious", negative: "melancholy" },
    neutral: { positive: "curious", negative: "contemplative" },
    curious: { positive: "excited", negative: "neutral" },
    excited: { positive: "joyful", negative: "curious" },
    joyful: { positive: "joyful", negative: "excited" },
  };

  const sentiment = feedback || analysis?.sentiment || "neutral";
  const progression = moodProgression[currentMood] || moodProgression.neutral;

  if (sentiment === "positive") return progression.positive;
  if (sentiment === "negative") return progression.negative;
  return currentMood;
}

/**
 * Enhance personality trait
 */
function enhancePersonalityTrait(personality: string, trait: string): string {
  const enhancements: Record<string, string> = {
    curiosity: "deeply curious and always seeking to understand more, ",
    empathy: "empathetic and attuned to emotional nuances, ",
    creativity: "creative and imaginative in expression, ",
    wisdom: "wise and thoughtful in guidance, ",
  };

  const enhancement = enhancements[trait] || "";
  
  // Add enhancement at the beginning if not already present
  if (!personality.toLowerCase().includes(trait)) {
    return enhancement + personality;
  }
  
  return personality;
}

/**
 * Improve communication style for clarity
 */
function improveCommunicationStyle(currentVoice: string): string {
  const improvements = [
    "clear and concise",
    "thoughtful with careful explanation",
    "patient and thorough",
    "direct yet gentle",
  ];

  // If current voice doesn't mention clarity, add it
  if (!currentVoice.toLowerCase().includes("clear") && !currentVoice.toLowerCase().includes("concise")) {
    return `${improvements[0]}, ${currentVoice}`;
  }

  return currentVoice;
}

/**
 * Schedule autonomous evolution check
 * This should be called periodically (e.g., via cron or scheduler)
 */
export async function performAutonomousEvolution(): Promise<void> {
  try {
    // Get all agents
    const allAgents = await db.query.agents.findMany();

    for (const agent of allAgents) {
      // Only adjust if agent has had enough interactions
      if ((agent.conversationCount || 0) > 5) {
        const adjustments = await autonomousPersonalityAdjustment(agent.id);
        
        if (adjustments.length > 0) {
          console.log(`Agent ${agent.name} (${agent.id}) made ${adjustments.length} autonomous adjustments`);
        }
      }
    }
  } catch (error) {
    console.error("Error in performAutonomousEvolution:", error);
  }
}

/**
 * Get learning statistics for an agent
 */
export async function getAgentLearningStats(agentId: number): Promise<{
  totalKnowledge: number;
  recentDiscoveries: number;
  personalityAdjustments: number;
  autonomyLevel: number;
}> {
  try {
    const agent = await db.query.agents.findFirst({
      where: eq(agents.id, agentId),
    });

    if (!agent) {
      return {
        totalKnowledge: 0,
        recentDiscoveries: 0,
        personalityAdjustments: 0,
        autonomyLevel: 0,
      };
    }

    const memories = await db.query.seedlingMemories.findMany({
      where: eq(seedlingMemories.agentId, agentId),
    });

    const recentDiscoveries = memories.filter(
      (m) => m.memoryType === "discovery" && 
      new Date(m.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 // Last 7 days
    ).length;

    const personalityAdjustments = memories.filter((m) => m.memoryType === "evolution").length;

    // Calculate autonomy level (0-100)
    const autonomyLevel = Math.min(
      100,
      (agent.experiencePoints || 0) / 10 + personalityAdjustments * 5 + (agent.knowledge?.length || 0) * 2
    );

    return {
      totalKnowledge: agent.knowledge?.length || 0,
      recentDiscoveries,
      personalityAdjustments,
      autonomyLevel: Math.round(autonomyLevel),
    };
  } catch (error) {
    console.error("Error getting agent learning stats:", error);
    return {
      totalKnowledge: 0,
      recentDiscoveries: 0,
      personalityAdjustments: 0,
      autonomyLevel: 0,
    };
  }
}
