// Perplexity Web Search Integration
// Gives AI agents the ability to search the internet for real-time information

interface PerplexityMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface PerplexityResponse {
  id: string;
  model: string;
  citations: string[];
  choices: {
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }[];
}

export async function searchWeb(query: string): Promise<{ answer: string; sources: string[] }> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    return {
      answer: "I wanted to search for this but my internet access isn't configured yet.",
      sources: []
    };
  }

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "Be precise and concise. Provide factual, up-to-date information. Focus on the most relevant and recent details."
          },
          {
            role: "user",
            content: query
          }
        ],
        max_tokens: 1024,
        temperature: 0.2,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: "month",
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity API error:", response.status, errorText);
      return {
        answer: "I tried to search the web but encountered an issue. Let me answer based on what I know.",
        sources: []
      };
    }

    const data: PerplexityResponse = await response.json();
    const answer = data.choices[0]?.message?.content || "No results found.";
    const sources = data.citations || [];

    return { answer, sources };
  } catch (error) {
    console.error("Perplexity search error:", error);
    return {
      answer: "I had trouble accessing the internet. Let me try to help with what I know.",
      sources: []
    };
  }
}

// Detect if user message likely needs web search
export function shouldSearchWeb(message: string): boolean {
  const searchTriggers = [
    /what('s| is) (the )?(latest|current|recent|new|today)/i,
    /search (for|the web|online|internet)/i,
    /look up|lookup/i,
    /find (out|information|me)/i,
    /news about/i,
    /happening (right )?now/i,
    /today('s| is)/i,
    /this (week|month|year)/i,
    /2024|2025|2026/i,
    /how much (does|is|do)/i,
    /price of/i,
    /weather in/i,
    /stock price/i,
    /who (is|are|was|won)/i,
    /when (is|does|did|will)/i,
    /where (is|can|do)/i,
    /latest version/i,
    /release date/i,
    /breaking news/i,
    /real.?time/i,
    /current events/i,
    /research (on|about)/i,
    /statistics (on|about|for)/i,
    /data (on|about|for)/i
  ];

  return searchTriggers.some(pattern => pattern.test(message));
}
