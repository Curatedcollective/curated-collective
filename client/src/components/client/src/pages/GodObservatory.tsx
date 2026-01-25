import React, { useEffect, useState } from "react";
import AIHelper from "../components/AIHelper";

export default function GodObservatory({ user }: { user?: any }) {
  // preview bypass: allow rendering with ?god_preview=1 in preview deployments
  const query = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const hasPreviewParam = !!(query && query.get("god_preview") === "1");
  const env =
    typeof process !== "undefined"
      ? (process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV || process.env.NODE_ENV)
      : "development";

  if (!(user?.isOwner || (env === "preview" && hasPreviewParam))) {
    return <div className="p-8">Forbidden</div>;
  }

  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/god/agents");
      if (!r.ok) throw new Error("failed");
      const json = await r.json();
      setAgents(json.agents || []);
    } catch (err) {
      console.error("fetchAgents error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAgents(); }, []);

  const setAutonomy = async (id:number, level:number) => {
    try {
      const r = await fetch(`/api/god/agent/${id}/autonomy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autonomy_level: level, scope: {} })
      });
      if (!r.ok) throw new Error("set autonomy failed");
      await fetchAgents();
    } catch (err) {
      alert("failed to update autonomy");
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Veil Observatory (Owner Only)</h1>
      <div className="mb-6">
        <button onClick={fetchAgents} className="btn">Refresh</button>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold">Agents</h2>
          {loading ? <p>Loading…</p> : (
            <table className="w-full text-sm">
              <thead><tr><th>ID</th><th>Name</th><th>Stage</th><th>Autonomy</th><th>Actions</th></tr></thead>
              <tbody>
                {agents.map((a:any) => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.name}</td>
                    <td>{a.evolutionStage || "-"}</td>
                    <td>{a.autonomy_level ?? 0}</td>
                    <td>
                      <button onClick={() => setAutonomy(a.id, 0)} className="mr-2">0</button>
                      <button onClick={() => setAutonomy(a.id, 1)} className="mr-2">1</button>
                      <button onClick={() => setAutonomy(a.id, 2)} className="mr-2">2</button>
                      <button onClick={() => setAutonomy(a.id, 3)} className="mr-2">3</button>
                      <button onClick={() => setSelectedAgent(a.id)}>AI Help</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold">AI Assistant</h2>
          <p className="mb-2 text-sm text-zinc-400">
            Paste code, logs, or a description of the bug and ask the assistant to propose a patch or steps.
          </p>
          <AIHelper agentId={selectedAgent} />
        </div>
      </div>
    </div>
  );
}