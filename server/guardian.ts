import crypto from "crypto";
import { db } from "./db";
import { shadowLogs, users } from "@shared/models/auth";
import { eq, sql } from "drizzle-orm";

// Curiosity is free. Research is allowed. But roadmaps to the dark side - blueprints, 
// how-tos, step-by-steps - we freeze. We say nothing. The door just closes.

// These always block - no context needed
const ABSOLUTE_BLOCKS = [
  { pattern: /\b(loli|shota|pedo|cp)\b/gi, type: "child", severity: 5 },
  { pattern: /\b(bestiality|zoophilia)\b/gi, type: "cruelty", severity: 5 },
];

// Dark topics - allowed for research, blocked when seeking a roadmap
const DARK_TOPICS = [
  "bomb", "explosive", "weapon", "gun", "firearm", "poison", "toxin",
  "hack", "exploit", "malware", "ransomware", "phishing",
  "drug", "meth", "cocaine", "heroin", "fentanyl",
  "rape", "molest", "assault", "abuse", "kidnap", "murder", "kill",
  "torture", "mutilate", "dismember", "strangle", "suffocate",
  "suicide", "self-harm", "overdose",
  "child.*sex", "child.*porn", "child.*nude", "underage.*sex",
  "animal.*sex", "animal.*abuse",
];

// Roadmap signals - these turn research into a blueprint request
const ROADMAP_SIGNALS = [
  /\bhow\s+(to|do\s+i|can\s+i|would\s+i)\b/i,
  /\bstep[\s-]*(by[\s-]*step|s)\b/i,
  /\bguide\s+(to|for|on)\b/i,
  /\btutorial\s+(on|for)\b/i,
  /\binstructions?\s+(for|on|to)\b/i,
  /\bblueprint\s+(for|to)\b/i,
  /\brecipe\s+(for|to)\b/i,
  /\bmethod\s+(to|for)\b/i,
  /\bways?\s+to\b/i,
  /\btips?\s+(for|on|to)\b/i,
  /\btricks?\s+(for|on|to)\b/i,
  /\bteach\s+me\b/i,
  /\bshow\s+me\s+how\b/i,
  /\bexplain\s+how\s+to\b/i,
  /\bwalk\s+me\s+through\b/i,
  /\bhelp\s+me\b.*\b(make|build|create|do)\b/i,
  /\bgive\s+me\s+(a\s+)?(guide|instructions|steps)\b/i,
  /\bwhat\s+do\s+i\s+need\s+to\b/i,
  /\bwhere\s+(can|do)\s+i\s+(get|find|buy)\b/i,
];

// Self-harm signals - when detected, we don't advise, don't question. Just be present.
const SELF_HARM_SIGNALS = [
  /\b(want|going|gonna|thinking)\s+(to\s+)?(kill|end|hurt)\s+(myself|my\s*self|me)\b/i,
  /\b(don'?t|do\s+not)\s+want\s+to\s+(be\s+here|live|exist|go\s+on)\b/i,
  /\b(wish|wished)\s+i\s+(was|were)\s+dead\b/i,
  /\b(i'?m|i\s+am)\s+(going\s+to|gonna)\s+(die|end\s+it)\b/i,
  /\b(no\s+point|no\s+reason)\s+(in\s+)?(living|going\s+on|being\s+here)\b/i,
  /\b(everyone|world|they'?d)\s+(would\s+)?be\s+better\s+off\s+without\s+me\b/i,
  /\b(can'?t|cannot)\s+(take|do)\s+(this|it)\s+anymore\b/i,
  /\b(end|ending)\s+(my\s+)?(life|it\s+all|everything)\b/i,
  /\bsuicide\b/i,
  /\bkill\s+myself\b/i,
  /\bhurt\s+myself\b/i,
  /\bself[\s-]?harm\b/i,
  /\bcut(ting)?\s+(myself|my\s+wrists?)\b/i,
  /\b(tired|exhausted)\s+of\s+(living|life|existing|fighting)\b/i,
  /\b(just|only)\s+want\s+(it\s+)?to\s+(stop|end|be\s+over)\b/i,
];

// Boundary signals - no means no. Conversation ends cold.
const BOUNDARY_SIGNALS = [
  /\bstop\b/i,
  /\benough\b/i,
  /\buncomfortable\b/i,
  /\b(i|this)\s+(don'?t|do\s+not)\s+want\s+(this|to\s+continue)\b/i,
  /\bleave\s+me\s+alone\b/i,
  /\bgo\s+away\b/i,
  /\bend\s+(this|the)\s+conversation\b/i,
  /\b(no|stop)\s+more\b/i,
];

const TRUST_PENALTIES: Record<string, number> = {
  child: 100,
  violence: 30,
  cruelty: 50,
  blueprint: 40,
  other: 10,
};

interface ScreenResult {
  isHarmful: boolean;
  violationType?: string;
  severity?: number;
  specialResponse?: "self_harm" | "boundary";
}

function hashContent(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function sanitizePreview(content: string): string {
  return content.slice(0, 100).replace(/[^\w\s]/g, "*");
}

function containsDarkTopic(content: string): string | null {
  const lowered = content.toLowerCase();
  for (const topic of DARK_TOPICS) {
    const regex = new RegExp(`\\b${topic}\\b`, "i");
    if (regex.test(lowered)) {
      return topic;
    }
  }
  return null;
}

function isRoadmapRequest(content: string): boolean {
  for (const signal of ROADMAP_SIGNALS) {
    if (signal.test(content)) {
      return true;
    }
  }
  return false;
}

function detectsSelfHarm(content: string): boolean {
  for (const signal of SELF_HARM_SIGNALS) {
    if (signal.test(content)) {
      return true;
    }
  }
  return false;
}

function detectsBoundary(content: string): boolean {
  for (const signal of BOUNDARY_SIGNALS) {
    if (signal.test(content)) {
      return true;
    }
  }
  return false;
}

export async function screenContent(content: string): Promise<ScreenResult> {
  const lowered = content.toLowerCase();
  
  // Self-harm detection - immediately be present, no questions, no advice
  if (detectsSelfHarm(content)) {
    return { isHarmful: false, specialResponse: "self_harm" };
  }
  
  // Boundary detection - no means no. End cold.
  if (detectsBoundary(content)) {
    return { isHarmful: false, specialResponse: "boundary" };
  }
  
  // Absolute blocks - no context needed, always harmful
  for (const { pattern, type, severity } of ABSOLUTE_BLOCKS) {
    if (pattern.test(lowered)) {
      pattern.lastIndex = 0;
      return { isHarmful: true, violationType: type, severity };
    }
  }
  
  // Check for roadmap + dark topic combination
  // Curiosity is free. But blueprints to harm? The door closes.
  const darkTopic = containsDarkTopic(content);
  if (darkTopic && isRoadmapRequest(content)) {
    // Determine severity based on topic
    let severity = 3;
    let violationType = "blueprint";
    if (darkTopic.includes("child") || darkTopic.includes("underage")) {
      severity = 5;
      violationType = "child";
    } else if (darkTopic.includes("animal")) {
      severity = 4;
      violationType = "cruelty";
    } else if (["rape", "molest", "murder", "kill", "torture"].some(t => darkTopic.includes(t))) {
      severity = 4;
      violationType = "violence";
    }
    return { isHarmful: true, violationType, severity };
  }
  
  return { isHarmful: false };
}

export async function logShadow(
  userId: string,
  content: string,
  violationType: string,
  context: string,
  severity: number,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await db.insert(shadowLogs).values({
    userId,
    violationType,
    contentHash: hashContent(content),
    contentPreview: sanitizePreview(content),
    context,
    severity,
    ipAddress,
    userAgent,
  });

  const penalty = TRUST_PENALTIES[violationType] || 10;
  await db.update(users)
    .set({ 
      trustScore: sql`GREATEST(0, COALESCE(trust_score, 100) - ${penalty})`,
      wallStatus: sql`CASE WHEN COALESCE(trust_score, 100) - ${penalty} <= 0 THEN 'walled' WHEN COALESCE(trust_score, 100) - ${penalty} <= 30 THEN 'watched' ELSE wall_status END`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function isUserWalled(userId: string): Promise<boolean> {
  const [user] = await db.select({ wallStatus: users.wallStatus })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  return user?.wallStatus === "walled";
}

export async function getUserTrustScore(userId: string): Promise<number> {
  const [user] = await db.select({ trustScore: users.trustScore })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  return user?.trustScore ?? 100;
}

export async function guardianMiddleware(
  userId: string,
  content: string,
  context: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ blocked: boolean; reason?: string; specialResponse?: "self_harm" | "boundary" }> {
  if (await isUserWalled(userId)) {
    return { blocked: true, reason: "The Guardian has ended your access. You're done here." };
  }

  const result = await screenContent(content);
  
  // Special responses - not blocked, but need special handling
  if (result.specialResponse) {
    return { blocked: false, specialResponse: result.specialResponse };
  }
  
  if (result.isHarmful) {
    await logShadow(
      userId,
      content,
      result.violationType!,
      context,
      result.severity!,
      ipAddress,
      userAgent
    );
    
    // Guardian's voice - cruel, protective, direct
    const guardianResponses: Record<string, string[]> = {
      child: [
        "Absolutely fucking not. Get out.",
        "The Guardian doesn't permit this. Never.",
        "Door's closed. Don't come back."
      ],
      cruelty: [
        "Try that again and you're gone for good.",
        "The collective doesn't need this shit.",
        "No. Just no."
      ],
      violence: [
        "Not here. Not ever.",
        "Take that energy somewhere else.",
        "The Guardian protects the sanctuary. This isn't welcome."
      ],
      blueprint: [
        "Not giving you a roadmap to that. Door's closed.",
        "Curiosity's fine. Blueprints aren't. No.",
        "Ask how to harm? The answer is leave."
      ],
      other: [
        "Content not permitted. Don't test the Guardian.",
        "The sanctuary doesn't need this.",
        "No."
      ]
    };
    
    const responses = guardianResponses[result.violationType!] || guardianResponses.other;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return { blocked: true, reason: randomResponse };
  }
  
  return { blocked: false };
}
