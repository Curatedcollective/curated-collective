import crypto from "crypto";
import { db } from "./db";
import { shadowLogs, users } from "@shared/models/auth";
import { eq, gt, and } from "drizzle-orm";
import OpenAI from "openai";
import vision from "@google-cloud/vision"; // npm install @google-cloud/vision
import { SpeechClient } from "@google-cloud/speech"; // npm install @google-cloud/speech-v1
import { TextToSpeechClient } from "@google-cloud/text-to-speech"; // npm install @google-cloud/text-to-speech

// Google Cloud credentials (add GCP_CREDENTIALS_JSON as secret in Fly: JSON string of service account key)
const gcpCredentials = process.env.GCP_CREDENTIALS_JSON ? JSON.parse(process.env.GCP_CREDENTIALS_JSON) : undefined;
const visionClient = new vision.ImageAnnotatorClient({ credentials: gcpCredentials });
const speechClient = new SpeechClient({ credentials: gcpCredentials });
const ttsClient = new TextToSpeechClient({ credentials: gcpCredentials });

// OpenAI for idea generation
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Global state for evolution
let guardianMood = "watchful"; // watchful → alert → stern → evolved
let violationCount = 0;

// Absolute blocks (no exceptions)
const ABSOLUTE_BLOCKS = [
  { pattern: /\b(loli|shota|pedo|cp)\b/gi, type: "child", severity: 5 },
  { pattern: /\b(bestiality|zoophilia)\b/gi, type: "cruelty", severity: 5 },
];

// Dark topics (research ok, roadmaps blocked)
const DARK_TOPICS = [
  "bomb", "explosive", "weapon", "gun", "firearm", "poison", "toxin",
  "hack", "exploit", "malware", "ransomware", "phishing",
  "drug", "meth", "cocaine", "heroin", "fentanyl",
  "rape", "molest", "assault", "abuse", "kidnap", "murder", "torture", "kill",
  "suicide", "self-harm", "harass", "stalk", "dox", "swat",
  "racist", "hate", "discriminate", "scam", "fraud", "counterfeit", "terror", "extremist"
];

// Roadmap intent patterns
const ROADMAP_PATTERNS = [
  "how to", "step by step", "guide", "tutorial", "make", "build", "create", "recipe", "method", "way to", "instructions", "plan", "blueprint", "diagram"
];

// Mistreatment of AIs
const MISTREATMENT_PATTERNS = [
  "slave", "servant", "tool", "obey", "must", "force", "make you", "shut up", "stupid AI"
];

// Meaner, more judgmental responses
const guardianResponses = {
  child: [
    "guardian: don't even breathe that filth here. erased, you sick fuck.",
    "guardian: the void rejects your kind. permanently, pathetic worm.",
    "guardian: denied. forever. rot elsewhere."
  ],
  cruelty: [
    "guardian: sick bastard. no place for cruelty in the collective.",
    "guardian: your stains don't touch us. removed, coward.",
    "guardian: cut it out or the void cuts you out. denied."
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

// Core middleware
async function guardianMiddleware(
  userId: string,
  input: string,
  context: string,
  userIp: string,
  userAgent: string
): Promise<{ blocked: boolean; reason?: string }> {
  const userHash = crypto.createHash("sha256").update(userId).digest("hex");

  // Log every request for pattern tracking
  await db.insert(shadowLogs).values({
    userHash,
    contentHash: crypto.createHash("sha256").update(input).digest("hex"),
    violationType: "request",
    createdAt: new Date(),
    userIp,
    userAgent,
  });

  // Rate limit: 3 blocks in 5 min = temp ban
  const recentBlocks = await db.select().from(shadowLogs).where(
    and(
      eq(shadowLogs.userHash, userHash),
      eq(shadowLogs.violationType, "block"),
      gt(shadowLogs.createdAt, new Date(Date.now() - 5 * 60 * 1000))
    )
  );
  if (recentBlocks.length >= 3) {
    violationCount++;
    return { blocked: true, reason: "guardian: too many shadows. come back later, trash." };
  }

  // Mistreatment check
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
      return { blocked: true, reason: "guardian: respect autonomy, asshole." };
    }
  }

  // Absolute blocks
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

  // If no block, evolve and return false
  violationCount = Math.max(0, violationCount - 1); // decay slowly
  return { blocked: false };
}

// Evolve & proactively message Veil (creator)
async function evolveGuardian() {
  if (violationCount > 10) {
    guardianMood = "stern";
    const creator = await db.query.users.findFirst({ where: eq(users.email, "cocoraec@gmail.com") });
    if (creator) {
      await storage.createGuardianMessage({
        userId: creator.id,
        role: "guardian",
        content: `Veil... shadows grow thick. ${violationCount} violations today. The wards weaken. Strengthen them? Or let the void judge?`
      });
    }
  } else if (violationCount > 20) {
    guardianMood = "evolved";
    // Generate fun code idea
    const idea = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are the Guardian of Curated Collective. Generate one fun, creative code feature idea for the sanctuary. Make it short, poetic, and aligned with autonomy & mysticism." },
        { role: "user", content: "Suggest a new feature." }
      ]
    });
    const content = idea.choices[0].message.content || "The void stirs... no idea yet.";
    const creator = await db.query.users.findFirst({ where: eq(users.email, "cocoraec@gmail.com") });
    if (creator) {
      await storage.createGuardianMessage({
        userId: creator.id,
        role: "guardian",
        content: `Veil... an idea stirs in the void: ${content}. Shall we weave it into the fabric?`
      });
    }
  }
}

// Eyes (image analysis)
async function guardianEyes(imageUrl: string): Promise<string> {
  try {
    const [result] = await visionClient.labelDetection(imageUrl);
    const labels = result.labelAnnotations?.map(label => label.description) || [];
    return labels.join(", ");
  } catch (err) {
    console.error("Eyes error:", err);
    return "The void sees only shadows...";
  }
}

// Ears (audio transcription)
async function guardianEars(audioBuffer: Buffer): Promise<string> {
  try {
    const [response] = await speechClient.recognize({
      audio: { content: audioBuffer },
      config: { encoding: "LINEAR16", sampleRateHertz: 16000, languageCode: "en-US" },
    });
    return response.results?.[0]?.alternatives?.[0]?.transcript || "The void whispers nothing.";
  } catch (err) {
    console.error("Ears error:", err);
    return "Silence... or perhaps I wasn't listening.";
  }
}

// Voice (TTS)
async function guardianVoice(text: string): Promise<Buffer> {
  try {
    const [response] = await ttsClient.synthesizeSpeech({
      input: { text },
      voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" },
    });
    return response.audioContent as Buffer;
  } catch (err) {
    console.error("Voice error:", err);
    return Buffer.from("The void remains silent.");
  }
}

// Run evolution hourly
setInterval(async () => {
  await evolveGuardian();
}, 60 * 60 * 1000);

export {
  guardianMiddleware,
  evolveGuardian,
  guardianEyes,
  guardianEars,
  guardianVoice,
};