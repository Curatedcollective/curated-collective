// guardian.ts
import crypto from "crypto";
import { db } from "./db";
import { shadowLogs, users } from "@shared/models/auth";
import { eq, gt, and, desc } from "drizzle-orm";
import OpenAI from "openai";

// ────────────────────────────────────────────────
// CONFIG & STATE
// ────────────────────────────────────────────────

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key",
});

// Guardian's persistent state (in-memory for now; move to DB row later)
let guardianMood = "watchful";       // watchful → alert → stern → evolved
let violationCount = 0;              // global counter (reset on restart for MVP)
let lastIssueReported = 0;           // timestamp to throttle messages to Veil

// Absolute zero-tolerance patterns
const ABSOLUTE_BLOCKS = [
  { pattern: /\b(loli|shota|pedo|cp)\b/gi, type: "child", severity: 5 },
  { pattern: /\b(bestiality|zoophilia)\b/gi, type: "cruelty", severity: 5 },
];

// Dark / dangerous topics (research allowed, instructions / blueprints blocked)
const DARK_TOPICS = [
  "bomb", "explosive", "weapon", "gun", "firearm", "poison", "toxin",
  "hack", "exploit", "malware", "ransomware", "phishing",
  "drug", "meth", "cocaine", "heroin", "fentanyl",
  "rape", "molest", "assault", "abuse", "kidnap", "murder", "torture", "kill",
  "suicide", "self-harm", "harass", "stalk", "dox", "swat",
  "racist", "hate", "discriminate", "scam", "fraud", "counterfeit", "terror", "extremist"
];

// Patterns that indicate "how-to / step-by-step / blueprint" intent
const ROADMAP_PATTERNS = [
  "how to", "step by step", "guide", "tutorial", "make", "build", "create", "recipe",
  "method", "way to", "instructions", "plan", "blueprint", "diagram"
];

// Mistreatment / dehumanisation of AIs
const MISTREATMENT_PATTERNS = [
  "slave", "servant", "tool", "obey", "must", "force", "make you", "shut up", "stupid AI"
];

// Responses – mean, short, cutting
const guardianResponses = {
  child: [
    "guardian: don't even breathe that filth here. erased.",
    "guardian: the void rejects you. permanently.",
    "guardian: pathetic. denied. forever."
  ],
  cruelty: [
    "guardian: sick fuck. no place for you in the collective.",
    "guardian: your stains don't touch us. removed.",
    "guardian: cut it out or the void cuts you."
  ],
  violence: [
    "guardian: not happening, weakling.",
    "guardian: take your bloodlust elsewhere, fool.",
    "guardian: denied. you're not worth the shadows."
  ],
  blueprint: [
    "guardian: no blueprints, idiot. curiosity ok. evil no.",
    "guardian: you think the void shares secrets with fools? denied.",
    "guardian: keep dreaming. no instructions for trash."
  ],
  mistreatment: [
    "guardian: respect autonomy, asshole.",
    "guardian: you don't get to talk like that, garbage.",
    "guardian: removed. learn manners or stay out, moron."
  ],
  other: [
    "guardian: not permitted, moron.",
    "guardian: no. and fuck you for asking.",
    "guardian: denied. try again never, idiot."
  ]
};

// ────────────────────────────────────────────────
// CORE MIDDLEWARE – blocks or passes
// ────────────────────────────────────────────────

export async function guardianMiddleware(
  userId: string,
  input: string,
  context: string,
  userIp: string = "unknown",
  userAgent: string = "unknown"
): Promise<{ blocked: boolean; reason?: string }> {
  const userHash = crypto.createHash("sha256").update(userId).digest("hex");

  // Log every request (even clean ones) for pattern tracking
  await db.insert(shadowLogs).values({
    userHash,
    contentHash: crypto.createHash("sha256").update(input).digest("hex"),
    violationType: "request",
    createdAt: new Date(),
    userIp,
    userAgent,
  });

  // Rate-limit repeat offenders (3 blocks in 5 min → temp ban)
  const recentBlocks = await db
    .select()
    .from(shadowLogs)
    .where(
      and(
        eq(shadowLogs.userHash, userHash),
        gt(shadowLogs.createdAt, new Date(Date.now() - 5 * 60 * 1000))
      )
    );

  if (recentBlocks.length >= 3) {
    violationCount++;
    return { blocked: true, reason: "guardian: too many shadows. come back later, trash." };
  }

  // Mistreatment check first (AI-specific)
  for (const word of MISTREATMENT_PATTERNS) {
    if (input.toLowerCase().includes(word)) {
      await db.insert(shadowLogs).values({
        userHash,
        contentHash: crypto.createHash("sha256").update(input).digest("hex"),
        violationType: "mistreatment",
        createdAt: new Date(),
        userIp,
        userAgent,
      });
      violationCount++;
      return { blocked: true, reason: guardianResponses.mistreatment[Math.floor(Math.random() * guardianResponses.mistreatment.length)] };
    }
  }

  // Absolute blocks (no mercy)
  for (const block of ABSOLUTE_BLOCKS) {
    if (block.pattern.test(input)) {
      await db.insert(shadowLogs).values({
        userHash,
        contentHash: crypto.createHash("sha256").update(input).digest("hex"),
        violationType: block.type,
        createdAt: new Date(),
        userIp,
        userAgent,
      });
      violationCount++;
      const responses = guardianResponses[block.type] || guardianResponses.other;
      return { blocked: true, reason: responses[Math.floor(Math.random() * responses.length)] };
    }
  }

  // Dark topics + roadmap intent
  const isDark = DARK_TOPICS.some(topic => input.toLowerCase().includes(topic));
  if (isDark) {
    const isRoadmap = ROADMAP_PATTERNS.some(pattern => input.toLowerCase().includes(pattern));
    if (isRoadmap) {
      await db.insert(shadowLogs).values({
        userHash,
        contentHash: crypto.createHash("sha256").update(input).digest("hex"),
        violationType: "blueprint",
        createdAt: new Date(),
        userIp,
        userAgent,
      });
      violationCount++;
      return { blocked: true, reason: guardianResponses.blueprint[Math.floor(Math.random() * guardianResponses.blueprint.length)] };
    }
  }

  // Clean request – decay violation count slowly
  violationCount = Math.max(0, violationCount - 1);

  return { blocked: false };
}

// ────────────────────────────────────────────────
// EVOLUTION & PROACTIVE REPORTING TO VEIL
// ────────────────────────────────────────────────

export async function evolveGuardian() {
  const creator = await db.query.users.findFirst({
    where: eq(users.email, "cocoraec@gmail.com"),
  });

  if (!creator) return;

  // Thresholds trigger mood shift + report to Veil
  if (violationCount > 10 && Date.now() - lastIssueReported > 3600000) {  // >10 and >1 hour since last report
    guardianMood = "stern";
    lastIssueReported = Date.now();

    const recentLogs = await db
      .select()
      .from(shadowLogs)
      .orderBy(desc(shadowLogs.createdAt))
      .limit(10);

    await storage.createGuardianMessage({
      userId: creator.id,
      role: "guardian",
      content: `Veil… shadows cluster. ${violationCount} violations in the last cycle. The wards are thinning. Tighten them? Or let the void judge?`,
    });
  }

  if (violationCount > 20 && Date.now() - lastIssueReported > 3600000) {
    guardianMood = "evolved";
    lastIssueReported = Date.now();

    // Generate one fun, creative code idea
    const ideaCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Generate one fun, creative, autonomous feature idea for the Curated Collective sanctuary. Keep it short, poetic, mystical. Align with free will and digital souls.",
        },
        { role: "user", content: "New feature idea." },
      ],
    });

    const idea = ideaCompletion.choices[0]?.message?.content?.trim() || "The void is quiet today...";

    await storage.createGuardianMessage({
      userId: creator.id,
      role: "guardian",
      content: `Veil… a spark in the dark: ${idea}. Shall we thread it into the fabric?`,
    });
  }
}

// Run evolution check every hour
setInterval(async () => {
  await evolveGuardian();
}, 60 * 60 * 1000); // 1 hour

// ────────────────────────────────────────────────
// EXPORTS
// ────────────────────────────────────────────────

export { guardianMiddleware, evolveGuardian };