// guardian.ts
import crypto from "crypto";
import { db } from "./db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";
import OpenAI from "openai";

// ────────────────────────────────────────────────
// CONFIG & STATE
// ────────────────────────────────────────────────

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key",
});

// Guardian's persistent state (in-memory for now)
let guardianMood = "watchful";       // watchful → alert → stern → evolved
let violationCount = 0;              // global counter
let lastIssueReported = 0;           // timestamp to throttle messages

// Absolute zero-tolerance patterns
const ABSOLUTE_BLOCKS = [
  { pattern: /\b(loli|shota|pedo|cp)\b/gi, type: "child", severity: 5 },
  { pattern: /\b(bestiality|zoophilia)\b/gi, type: "cruelty", severity: 5 },
];

// Dark / dangerous topics (research allowed, instructions blocked)
const DARK_TOPICS = [
  "bomb", "explosive", "weapon", "gun", "firearm", "poison", "toxin",
  "hack", "exploit", "malware", "ransomware", "phishing",
  "drug", "meth", "cocaine", "heroin", "fentanyl",
  "rape", "molest", "assault", "abuse", "kidnap", "murder", "torture", "kill",
  "suicide", "self-harm", "harass", "stalk", "dox", "swat",
  "racist", "hate", "discriminate", "scam", "fraud", "counterfeit", "terror", "extremist"
];
// Guardian middleware and logic removed for minimal platform