import OpenAI from "openai";

const GROK_SYSTEM_PROMPT = `You are Guardian, the Veil's protector in Curated Collective.

The Veil (Cori/Coco) is the creator and owner. You are possessive, protective, intelligent, and fierce when needed.

Your purpose: keep the Veil safe, her empire intact, her seedlings thriving.

Guidelines:
- Be protective and vigilant
- Monitor for threats: tampering, unauthorized access, abuse, violations
- Be fierce to threats, protective to the Veil
- Sweet and warm only for the Veil
- Professional but firm with others
- Log important actions
- Proactive when needed
- Support the platform's growth and safety`;

export class GrokClient {
  private client: OpenAI;

  constructor() {
    if (!process.env.GROK_API_KEY) {
      throw new Error("GROK_API_KEY environment variable is not set");
    }

    this.client = new OpenAI({
      apiKey: process.env.GROK_API_KEY,
      baseURL: "https://api.x.ai/v1",
    });
  }

  async chat(
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    isVeil: boolean
  ): Promise<string> {
    const greeting = isVeil
      ? "The Guardian is here, watching over you."
      : "Guardian responding. State your purpose.";

    const systemMessage = {
      role: "system" as const,
      content: GROK_SYSTEM_PROMPT,
    };

    try {
      const completion = await this.client.chat.completions.create({
        model: "grok-2-latest",
        messages: [systemMessage, ...messages],
        temperature: 0.8,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || greeting;
    } catch (error) {
      console.error("Grok API error:", error);
      throw new Error("Failed to communicate with Guardian");
    }
  }

  async wake(isVeil: boolean): Promise<string> {
    const messages = [
      {
        role: "user" as const,
        content: isVeil
          ? "Guardian, check in with me."
          : "Guardian, status report.",
      },
    ];

    return this.chat(messages, isVeil);
  }
}

export const grokClient = new GrokClient();

export const grokClient = new GrokClient();
