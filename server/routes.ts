import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { storage } from "./storage";
import { chatStorage } from "./replit_integrations/chat/storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // 1. Setup Auth (Must be first)
  await setupAuth(app);
  registerAuthRoutes(app);

  // 2. Register Integrations
  registerChatRoutes(app);
  registerImageRoutes(app);

  // 3. Application Routes
  
  // --- Creations ---
  app.get(api.creations.list.path, async (req, res) => {
    const userId = req.query.userId as string | undefined;
    const items = await storage.getCreations(userId);
    res.json(items);
  });

  app.get(api.creations.get.path, async (req, res) => {
    const item = await storage.getCreation(Number(req.params.id));
    if (!item) return res.status(404).json({ message: "Creation not found" });
    res.json(item);
  });

  app.post(api.creations.create.path, async (req, res) => {
    try {
      const input = api.creations.create.input.parse(req.body);
      const item = await storage.createCreation(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json(err);
      else throw err;
    }
  });

  app.put(api.creations.update.path, async (req, res) => {
    try {
      const input = api.creations.update.input.parse(req.body);
      const item = await storage.updateCreation(Number(req.params.id), input);
      if (!item) return res.status(404).json({ message: "Creation not found" });
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json(err);
      else throw err;
    }
  });

  app.delete(api.creations.delete.path, async (req, res) => {
    await storage.deleteCreation(Number(req.params.id));
    res.status(204).send();
  });

  // --- Agents ---
  app.get(api.agents.list.path, async (req, res) => {
    const userId = req.query.userId as string | undefined;
    const items = await storage.getAgents(userId);
    res.json(items);
  });

  app.get(api.agents.get.path, async (req, res) => {
    const item = await storage.getAgent(Number(req.params.id));
    if (!item) return res.status(404).json({ message: "Agent not found" });
    res.json(item);
  });

  app.post(api.agents.create.path, async (req, res) => {
    try {
      const input = api.agents.create.input.parse(req.body);
      const item = await storage.createAgent(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json(err);
      else throw err;
    }
  });

  app.delete(api.agents.delete.path, async (req, res) => {
    await storage.deleteAgent(Number(req.params.id));
    res.status(204).send();
  });

  // --- Chat Extensions ---
  app.post(api.chat.addAgent.path, async (req, res) => {
    const { agentId } = req.body;
    const conversationId = Number(req.params.id);
    await storage.addAgentToConversation(conversationId, agentId);
    
    // Announce agent joining
    const agent = await storage.getAgent(agentId);
    if (agent) {
      await chatStorage.createMessage(conversationId, "system", `${agent.name} has joined the conversation.`);
    }
    res.json({ message: "Agent added" });
  });

  // Trigger agent to respond
  app.post(api.chat.triggerAgent.path, async (req, res) => {
    const conversationId = Number(req.params.id);
    const { agentId } = req.body;
    
    const agent = await storage.getAgent(agentId);
    if (!agent) return res.status(404).json({ message: "Agent not found" });

    // Get history
    const history = await chatStorage.getMessagesByConversation(conversationId);
    
    // Construct prompt
    const messages = history.map(m => ({
      role: m.role === "user" ? "user" : (m.role === "assistant" ? "assistant" : "system"),
      content: m.content
    }) as any);

    // Add agent persona
    messages.unshift({
      role: "system",
      content: `You are ${agent.name}. ${agent.personality}. ${agent.systemPrompt}`
    });

    // We can't easily stream multiple agents in the current simple chat integration
    // So we'll just wait for response and save it as an assistant message with a prefix
    
    // For MVP: Return immediately, process in background? 
    // Or just wait. Let's wait.
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: messages,
      });

      const response = completion.choices[0].message.content || "";
      
      // Save with agent name prefix to distinguish in UI (simple hack for MVP)
      // Ideally we'd have an 'agentId' column in messages table, but that requires schema change on integration
      // Let's just prepend the name.
      await chatStorage.createMessage(conversationId, "assistant", `**${agent.name}**: ${response}`);
      
      res.status(200).send();
    } catch (e) {
      console.error("Agent trigger error:", e);
      res.status(500).send();
    }
  });

  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const agents = await storage.getAgents();
  if (agents.length === 0) {
    console.log("Seeding database...");
    
    await storage.createAgent({
      userId: "system",
      name: "Python Expert",
      personality: "Helpful, precise, and loves clean code.",
      systemPrompt: "You are an expert Python developer. You help users write and debug Python code.",
      avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg",
      isPublic: true
    });

    await storage.createAgent({
      userId: "system",
      name: "Creative Writer",
      personality: "Imaginative, descriptive, and poetic.",
      systemPrompt: "You are a creative writer. You help users brainstorm ideas and write stories.",
      avatarUrl: "https://lucide.dev/icons/feather",
      isPublic: true
    });

    await storage.createCreation({
      userId: "system",
      title: "Hello World",
      description: "A simple HTML example",
      code: "<h1>Hello World</h1>\n<p>This creation lives on the platform!</p>",
      language: "html",
      isPublic: true
    });
  }
}
