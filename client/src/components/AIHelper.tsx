import React, { useState } from "react";

export default function AIHelper({ agentId }: { agentId?: number | null }) {
  const [context, setContext] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setAnswer("");
    try {
      const body = {
        context: `agentId: ${agentId}\n\n${context}`.slice(0, 12000),
        question: question.slice(0, 2000)
      };
      const resp = await fetch("/api/god/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || "AI failed");
      }
      const json = await resp.json();
      setAnswer(json.answer || "");
    } catch (err) {
      console.error("AIHelper error", err);
      setAnswer("AI assist failed: " + (err as any).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <textarea value={context} onChange={e => setContext(e.target.value)} placeholder="Paste code, logs, or snippet" rows={8} className="w-full p-2 bg-zinc-900 text-white"/>
      <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="What do you want the assistant to do?" className="w-full p-2 bg-zinc-900 text-white"/>
      <div className="flex gap-2">
        <button onClick={submit} disabled={loading} className="btn">Ask AI</button>
      </div>

      <div>
        <h3 className="text-sm font-medium">Answer</h3>
        <pre className="whitespace-pre-wrap p-2 bg-zinc-950 text-sm">{answer || (loading ? "Thinking..." : "No answer yet")}</pre>
      </div>
    </div>
  );
}
