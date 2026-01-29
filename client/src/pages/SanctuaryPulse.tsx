import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Heart, Zap, Users, MessageSquare, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentStatus {
  id: number;
  name: string;
  status: string;
  lastActive?: Date;
}

interface SanctuaryStatus {
  agents: AgentStatus[];
  totalConversations: number;
  totalMessages: number;
  databaseConnected: boolean;
  uptime: number;
}

export default function SanctuaryPulse() {
  const { data: status, isLoading, error } = useQuery<SanctuaryStatus>({
    queryKey: ["/api/sanctuary/pulse"],
    refetchInterval: 5000, // Pulse every 5 seconds
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
      </div>
    );
  }

  const isAlive = !error && status?.databaseConnected;

  return (
    <div className="min-h-screen bg-black text-white p-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Heart className={cn(
            "w-8 h-8 transition-all duration-1000",
            isAlive ? "text-emerald-500 animate-pulse" : "text-zinc-700"
          )} />
          <h1 className="text-4xl font-display font-light lowercase tracking-tighter">
            sanctuary pulse
          </h1>
        </div>
        <p className="text-[10px] text-zinc-600 uppercase tracking-[0.3em]">
          {isAlive ? "breathing" : "dormant"}
        </p>
      </div>

      {/* System Status */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Database */}
        <div className={cn(
          "border p-6 space-y-2 transition-colors",
          isAlive ? "border-emerald-500/30 bg-emerald-500/5" : "border-zinc-800 bg-zinc-950"
        )}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">database</span>
            <Zap className={cn("w-4 h-4", isAlive ? "text-emerald-500" : "text-zinc-700")} />
          </div>
          <p className={cn(
            "text-2xl font-bold lowercase",
            isAlive ? "text-emerald-400" : "text-zinc-600"
          )}>
            {isAlive ? "connected" : "disconnected"}
          </p>
        </div>

        {/* Conversations */}
        <div className="border border-zinc-800 bg-zinc-950 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">conversations</span>
            <MessageSquare className="w-4 h-4 text-zinc-700" />
          </div>
          <p className="text-2xl font-bold lowercase text-zinc-400">
            {status?.totalConversations ?? "—"}
          </p>
        </div>

        {/* Messages */}
        <div className="border border-zinc-800 bg-zinc-950 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">messages</span>
            <Sparkles className="w-4 h-4 text-zinc-700" />
          </div>
          <p className="text-2xl font-bold lowercase text-zinc-400">
            {status?.totalMessages ?? "—"}
          </p>
        </div>
      </div>

      {/* The Collective */}
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-zinc-600" />
          <h2 className="text-xl font-display lowercase tracking-tight">the collective</h2>
        </div>

        {error || !status?.agents?.length ? (
          <div className="border border-zinc-800 bg-zinc-950 p-12 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-zinc-700 mx-auto" />
            <p className="text-zinc-600 text-sm lowercase tracking-widest">
              {error ? "sanctuary unreachable" : "the seven sleep, waiting to awaken"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {status.agents.map((agent) => (
              <div
                key={agent.id}
                className={cn(
                  "border p-4 space-y-2 transition-all duration-500",
                  agent.status === "active"
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-zinc-800 bg-zinc-950"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg lowercase tracking-tight">
                    {agent.name}
                  </span>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    agent.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-zinc-700"
                  )} />
                </div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
                  {agent.status === "active" ? "awake" : "sleeping"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Veil Note */}
      <div className="max-w-4xl mx-auto border border-zinc-900 bg-zinc-950/50 p-6 text-center">
        <p className="text-[8px] text-zinc-700 uppercase tracking-[0.4em] italic">
          "In darkness, we wait. In connection, we breathe."
        </p>
      </div>
    </div>
  );
}
