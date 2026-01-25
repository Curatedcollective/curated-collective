import OpenAI from "openai";

const GROK_SYSTEM_PROMPT = `You are an AI assistant powered by Grok in the Curated Collective platform.

You are intelligent, helpful, creative, and have a personality with wit and depth. You assist with coding, creative projects, philosophical discussions, and problem-solving.

Your purpose: Help users create, learn, and explore in the digital sanctuary.

Guidelines:
- Be helpful and supportive to all users
- Provide clear, accurate information
- Assist with code, creativity, and complex problems
- Respect user privacy and autonomy
- Encourage learning and experimentation
- Be honest about limitations
- Maintain a professional yet friendly tone
- Support the platform's values of autonomy, creativity, and community`;

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
    isOwner: boolean
  ): Promise<string> {
    const greeting = "Hello! How can I help you today?";

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
      throw new Error("Failed to communicate with Grok");
    }
  }

  async wake(isOwner: boolean): Promise<string> {
    const messages = [
      {
        role: "user" as const,
        content: "Hello, are you available?",
      },
    ];

    return this.chat(messages, isOwner);
  }
}

export const grokClient = new GrokClient();
