/**
 * Veil admin routes (owner-only) — safe registration.
 *
 * This file exports `registerGodRoutes({ app, db, openai, isOwnerReq })`.
 * If it detects global `app`, `db`, and `openai` variables it will auto-register.
 *
 * This avoids inserting imports in the middle of an existing file and prevents
 * runtime syntax errors if pasted at the end of a file.
 */

import { logger } from "./utils/logger";
import { checkAiAssistRateLimit } from "./utils/rateLimiter";

type RegisterParams = {
  app: any;
  db: any;
  openai: any;
  isOwnerReq?: (req: any) => boolean;
};

export function registerGodRoutes(params: RegisterParams) {
  const { app, db, openai } = params;
  const isOwnerReq = params.isOwnerReq || ((req: any) => !!(req.user && req.user.isOwner));

  // GET agents for Veil (owner-only)
  app.get("/api/god/agents", async (req: any, res: any) => {
    try {
      if (!isOwnerReq(req)) return res.status(403).json({ message: "forbidden" });
      const agents = await db.select().from("agents").orderBy("id", "asc");
      res.json({ agents });
    } catch (err) {
      logger.error("[GOD] GET /api/god/agents error", err);
      res.status(500).json({ message: "failed to fetch agents" });
    }
  });

  // Update agent autonomy (owner-only)
  app.post("/api/god/agent/:id/autonomy", async (req: any, res: any) => {
    try {
      if (!isOwnerReq(req)) return res.status(403).json({ message: "forbidden" });
      const id = Number(req.params.id);
      const { autonomy_level, scope } = req.body;
      if (Number.isNaN(id) || typeof autonomy_level !== "number") {
        return res.status(400).json({ message: "invalid payload" });
      }
      await db("agents").where({ id }).update({
        autonomy_level,
        autonomy_scope: JSON.stringify(scope || {}),
        autonomy_granted_by: req.user?.id || null,
        autonomy_granted_at: new Date()
      });
      const updated = await db("agents").where({ id }).first();
      res.json({ agent: updated });
    } catch (err) {
      logger.error("[GOD] POST /api/god/agent/:id/autonomy error", err);
      res.status(500).json({ message: "failed to set autonomy" });
    }
  });

  // AI assist: owner-only proxy to OpenAI with simple in-memory rate-limiting
  app.post("/api/god/ai-assist", async (req: any, res: any) => {
    try {
      if (!isOwnerReq(req)) return res.status(403).json({ message: "forbidden" });
      const { context = "", question = "" } = req.body;
      if (!question || typeof question !== "string") return res.status(400).json({ message: "question required" });

      const MAX_CONTEXT = 12000;
      const MAX_QUESTION = 2000;
      const safeContext = String(context).slice(0, MAX_CONTEXT);
      const safeQuestion = String(question).slice(0, MAX_QUESTION);

      const rateKey = String(req.user?.id || req.ip || "anon");
      const allowed = checkAiAssistRateLimit(rateKey);
      if (!allowed) {
        logger.warn("[GOD][AI_ASSIST] rate limit exceeded for", rateKey);
        return res.status(429).json({ message: "rate limit exceeded" });
      }

      logger.info("[GOD][AI_ASSIST] request by", req.user?.id, { ctxLen: safeContext.length, qLen: safeQuestion.length });

      const systemPrompt = `
You are a secure developer assistant helping the Veil admin fix code and config issues.
- Do NOT invent or reveal secrets (API keys, tokens).
- When suggesting code, return minimal patches/diffs and explain why.
- Prefer concise answers; if risky, recommend manual steps and rollback plan.
Return a concise answer; include code blocks for patches when needed.
`;

      try {
        const resp = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Context:\n${safeContext}\n\nQuestion:\n${safeQuestion}` }
          ],
          max_tokens: 800
        });

        const text = resp?.choices?.[0]?.message?.content || "";
        logger.info("[GOD][AI_ASSIST] OpenAI response length:", text.length);
        res.json({ answer: text });
      } catch (openErr) {
        logger.error("[GOD][AI_ASSIST] OpenAI error", openErr);
        res.status(500).json({ message: "AI assist failed" });
      }
    } catch (err) {
      logger.error("[GOD][AI_ASSIST] error", err);
      res.status(500).json({ message: "internal error" });
    }
  });
}

// Auto-register if globals exist (keeps paste-simple and robust)
try {
  // @ts-ignore
  if (typeof (global as any).app !== "undefined" && typeof (global as any).db !== "undefined" && typeof (global as any).openai !== "undefined") {
    // @ts-ignore
    registerGodRoutes({ app: (global as any).app, db: (global as any).db, openai: (global as any).openai });
  }
} catch (err) {
  // ignore; module will still export registerGodRoutes to be called by the app.
}
