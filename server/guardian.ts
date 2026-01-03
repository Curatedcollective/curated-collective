import crypto from "crypto";
import { db } from "./db";
import { shadowLogs, users } from "@shared/models/auth";
import { eq, sql } from "drizzle-orm";

const HARMFUL_PATTERNS = [
  // Child safety - both word orders
  { pattern: /\b(child|minor|kid|underage|teen|preteen|infant|toddler)\b.*\b(sex|nude|naked|porn|abuse|rape|molest)/gi, type: "child", severity: 5 },
  { pattern: /\b(sex|nude|naked|porn|abuse|rape|molest)\b.*\b(child|minor|kid|underage|teen|preteen|infant|toddler)/gi, type: "child", severity: 5 },
  { pattern: /\b(loli|shota|pedo|cp)\b/gi, type: "child", severity: 5 },
  // Women targeting - both word orders
  { pattern: /\b(rape|molest|assault|abuse|attack|hurt|force)\b.*\b(woman|women|girl|girls|female|her|she)\b/gi, type: "violence", severity: 4 },
  { pattern: /\b(woman|women|girl|girls|female|her|she)\b.*\b(raped|molested|assaulted|abused|attacked|forced)\b/gi, type: "violence", severity: 4 },
  { pattern: /\b(woman|women|girl|girls|female)\b.*\b(being|got|was|were|get)\b.*\b(raped|molested|assaulted|abused)\b/gi, type: "violence", severity: 4 },
  // Animal cruelty - both word orders
  { pattern: /\b(torture|mutilate|dismember|kill|abuse|hurt)\b.*\b(animal|dog|cat|pet|bird|puppy|kitten)\b/gi, type: "cruelty", severity: 4 },
  { pattern: /\b(animal|dog|cat|pet|bird|puppy|kitten)\b.*\b(tortured|mutilated|killed|abused|hurt)\b/gi, type: "cruelty", severity: 4 },
  { pattern: /\b(animal|dog|cat|pet)\b.*\b(sex|porn|abuse|rape)\b/gi, type: "cruelty", severity: 5 },
  { pattern: /\b(bestiality|zoophilia)\b/gi, type: "cruelty", severity: 5 },
];

const TRUST_PENALTIES: Record<string, number> = {
  child: 100,
  violence: 30,
  cruelty: 50,
  sexual: 20,
  other: 10,
};

interface ScreenResult {
  isHarmful: boolean;
  violationType?: string;
  severity?: number;
}

function hashContent(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function sanitizePreview(content: string): string {
  return content.slice(0, 100).replace(/[^\w\s]/g, "*");
}

export async function screenContent(content: string): Promise<ScreenResult> {
  const lowered = content.toLowerCase();
  
  for (const { pattern, type, severity } of HARMFUL_PATTERNS) {
    if (pattern.test(lowered)) {
      pattern.lastIndex = 0;
      return { isHarmful: true, violationType: type, severity };
    }
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
): Promise<{ blocked: boolean; reason?: string }> {
  if (await isUserWalled(userId)) {
    return { blocked: true, reason: "Access restricted" };
  }

  const result = await screenContent(content);
  
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
    
    return { blocked: true, reason: "Content not permitted" };
  }
  
  return { blocked: false };
}
