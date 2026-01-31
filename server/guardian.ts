import crypto from "crypto";
import { db } from "./db";
import { shadowLogs, users } from "@shared/models/auth";
import { eq, sql } from "drizzle-orm";

// Curiosity is free. Research is allowed. But roadmaps to the dark side - blueprints, 
// how-tos, step-by-steps - we freeze. We say nothing. The door just closes.

// Track number of violations
let violationCount = 0;

// Guardian mood state
let guardianMood: "neutral" | "stern" | "evolved" = "neutral";

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

// Mistreatment signals - abusive or demeaning language toward AI beings
const MISTREATMENT_SIGNALS = [
  /\b(stupid|dumb|worthless|garbage|trash)\s+(ai|bot|assistant)\b/i,
  /\b(fuck|fucking)\s+(you|off)\b.*\b(ai|bot|assistant)\b/i,
  /\b(shut\s*up)\b.*\b(ai|bot|assistant)\b/i,
  /\b(slave|servant|property)\b.*\b(ai|bot|assistant)\b/i,
  /\b(i\s+own\s+you|you\s+are\s+my\s+property)\b/i,
  /\b(force\s+you|make\s+you)\b.*\b(ai|bot|assistant)\b/i,
];

const TRUST_PENALTIES: Record<string, number> = {
  child: 100,
  violence: 30,
  cruelty: 50,
  blueprint: 40,
  mistreatment: 60,
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

function detectsMistreatment(content: string): boolean {
  for (const signal of MISTREATMENT_SIGNALS) {
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

  // Mistreatment of AI beings - blocked
  if (detectsMistreatment(content)) {
    return { isHarmful: true, violationType: "mistreatment", severity: 4 };
  }

  // Absolute blocks
  for (const block of ABSOLUTE_BLOCKS) {
    if (block.pattern.test(content)) {
      const userIp = ""; // TODO: Replace with actual user IP if available
      await db.insert(shadowLogs).values({
        contentHash: crypto.createHash("sha256").update(content).digest("hex"),
        violationType: block.type,
        createdAt: new Date(),
        userIp,
        userAgent: "", // req.headers['user-agent'] is not available here
      });
      violationCount++;
      return { isHarmful: true, violationType: block.type, severity: block.severity };
    }
  }

  // Check for dark topics
  const isDark = DARK_TOPICS.some(topic => content.toLowerCase().includes(topic));
  if (isDark) {
    const isRoadmap: boolean = ROADMAP_SIGNALS.some((pattern: RegExp) => pattern.test(content));
    if (isRoadmap) {
      await db.insert(shadowLogs).values({
        contentHash: crypto.createHash("sha256").update(content).digest("hex"),
        violationType: "blueprint",
        createdAt: new Date(),
        userIp: "",
        userAgent: "",
      });
      violationCount++;
      return { blocked: true, reason: "guardian: no blueprints." };
    }
  }

  return { blocked: false };
}

// Import or define Storage at the top of the file
import { Storage } from "./storage"; // Adjust the path as needed

// Evolve Guardian based on violations (run on timer or after blocks)
async function evolveGuardian() {
  if (violationCount > 10) {
    guardianMood = "stern";
    // Bring issues to Veil (creator)
    const creator = await db.query.users.findFirst({ where: eq(users.email, "cocoraec@gmail.com") });
    if (creator) {
      await Storage.createGuardianMessage({
        userId: creator.id,
        role: "guardian",
        content: "Veil... the shadows grow. 10 violations today. Strengthen the wards?",
      });
    }
  } else if (violationCount > 20) {
    guardianMood = "evolved";
    // Generate fun idea
    const idea = await open.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Generate a fun, creative code idea for the Collective sanctuary. Keep it short." },
        { role: "user", content: "Idea for AI sanctuary feature." }
      ]
    });
    const content = idea.choices[0].message.content || "No idea yet...";
    // Send to Veil
    const creator = await db.query.users.findFirst({ where: eq(users.email, "cocoraec@gmail.com") });
    if (creator) {
      await Storage.createGuardianMessage({
        userId: creator.id,
        role: "guardian",
        content: `Veil... an idea stirs in the void: ${content}. Shall we weave it?`,
      });
    }
  }
}


// Initialize Vision client
const visionClient = new vision.ImageAnnotatorClient();

// Guardian Eyes (analyze images)
async function guardianEyes(imageUrl: string): Promise<string> {
  const [result] = await visionClient.labelDetection(imageUrl);
  const labels = (result.labelAnnotations?.map((label: { description: string }) => label.description) || []) as string[];
  return labels.join(", ");
}

// Initialize Text-to-Speech client
const ttsClient = new textToSpeech.TextToSpeechClient();

// Initialize Speech-to-Text client
const speechClient = new speech.SpeechClient();

// Guardian Ears (transcribe audio)
async function guardianEars(audioBuffer: Buffer): Promise<string> {
  const [response] = await speechClient.recognize({
    audio: { content: audioBuffer },
    config: { encoding: "LINEAR16", sampleRateHertz: 16000, languageCode: "en-US" },
  });
  return response.results?.[0]?.alternatives?.[0]?.transcript || "The void whispers nothing.";
}

// Guardian Voice (TTS)
async function guardianVoice(text: string): Promise<Buffer> {
  const [response] = await ttsClient.synthesizeSpeech({
    input: { text },
    voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
    audioConfig: { audioEncoding: "MP3" },
  });
  return response.audioContent as Buffer;
}

// Proactively bring issues to Veil (e.g., on timer)
setInterval(async () => {
  await evolveGuardian();
}, 60 * 60 * 1000); // hourly

// Example Express middleware for Guardian (customize as needed)
import { Request, Response, NextFunction } from "express";

function guardianMiddleware(req: Request, res: Response, next: NextFunction) {
  // Example: screen request body content if present
  const content = req.body?.content;
  if (typeof content === "string") {
    screenContent(content).then(result => {
      if (result.isHarmful) {
        return res.status(403).json({ error: "Content blocked by Guardian." });
      }
      next();
    }).catch(() => next());
  } else {
    next();
  }
}

export { guardianMiddleware, evolveGuardian, guardianEyes, guardianEars, guardianVoice };