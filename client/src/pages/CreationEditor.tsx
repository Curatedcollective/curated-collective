import { useParams } from "wouter";
import { useCreation, useUpdateCreation } from "@/hooks/use-creations";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Play, ArrowLeft, Star, Wand2, Bot, Users } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAgents } from "@/hooks/use-agents";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CreationEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const creationId = parseInt(id || "0");
  const { data: creation, isLoading } = useCreation(creationId);
  const updateMutation = useUpdateCreation();
  
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [previewKey, setPreviewKey] = useState(0); // Force iframe refresh
  const [selectedSeedling, setSelectedSeedling] = useState<number | null>(null);
  
  const { data: agents = [] } = useAgents(user?.id);

  const aiBuildMutation = useMutation({
    mutationFn: async ({ prompt, agentId }: { prompt: string; agentId?: number }) => {
      const res = await apiRequest("POST", "/api/creations/ai-assist", {
        prompt,
        currentCode: code,
        creationId,
        agentId
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.code) {
        setCode(data.code);
        setPreviewKey(k => k + 1);
      }
    }
  });

  const handleAiAssist = () => {
    const prompt = window.prompt("How should the AI help with this creation?");
    if (prompt) aiBuildMutation.mutate({ prompt, agentId: selectedSeedling || undefined });
  };

  useEffect(() => {
    if (creation) {
      setCode(creation.code);
      setTitle(creation.title);
      setDescription(creation.description || "");
    }
  }, [creation]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!creation) {
    return <div className="p-8 text-center">Creation not found</div>;
  }

  const handleSave = () => {
    updateMutation.mutate({ id: creationId, code, title, description });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 flex-1">
          <Link href="/creations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1 max-w-md">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-bold bg-transparent border-0 p-0 focus-visible:ring-0 w-full"
              placeholder="Title"
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs text-muted-foreground bg-transparent border-0 p-0 focus-visible:ring-0 w-full"
              placeholder="Description"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {agents.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-white/10 text-[10px] uppercase tracking-widest">
                  <Users className="w-3 h-3 mr-2" />
                  {selectedSeedling ? agents.find(a => a.id === selectedSeedling)?.name : "choose seedling"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black border border-white/10 rounded-none">
                <DropdownMenuItem 
                  onClick={() => setSelectedSeedling(null)}
                  className={cn("text-xs lowercase", !selectedSeedling && "bg-white/10")}
                >
                  generic ai
                </DropdownMenuItem>
                {agents.map((agent) => (
                  <DropdownMenuItem
                    key={agent.id}
                    onClick={() => setSelectedSeedling(agent.id)}
                    className={cn("text-xs lowercase", selectedSeedling === agent.id && "bg-white/10")}
                  >
                    <Bot className="w-3 h-3 mr-2" />
                    {agent.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button 
            variant="outline" 
            onClick={handleAiAssist} 
            disabled={aiBuildMutation.isPending}
            className="border-white/10 hover:bg-white hover:text-black"
          >
            {aiBuildMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4 mr-2" />
            )}
            {selectedSeedling ? "invoke seedling" : "AI Assist"}
          </Button>
          <Button variant="outline" onClick={() => setPreviewKey(k => k + 1)}>
            <Play className="w-4 h-4 mr-2" /> Run
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </Button>
          {user?.firstName === "admin" && (
            <Button 
              variant={creation.isCurated ? "default" : "outline"}
              onClick={() => updateMutation.mutate({ id: creationId, isCurated: !creation.isCurated })}
              disabled={updateMutation.isPending}
              className={creation.isCurated ? "bg-primary text-primary-foreground" : ""}
            >
              <Star className={cn("w-4 h-4 mr-2", creation.isCurated && "fill-current")} />
              {creation.isCurated ? "Curated" : "Curate"}
            </Button>
          )}
        </div>
      </div>

      {/* Editor Layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-full min-h-0">
        {/* Code Input */}
        <div className="h-full flex flex-col bg-card rounded-2xl border border-border overflow-hidden relative group/editor">
          <div className="px-4 py-2 border-b border-border bg-secondary/30 text-xs font-mono text-muted-foreground flex justify-between items-center">
            <span>EDITOR</span>
            <span className="text-[10px] opacity-0 group-hover/editor:opacity-100 transition-opacity italic">the collective is choosing its own path now...</span>
          </div>
          <Textarea 
            value={code} 
            onChange={(e) => setCode(e.target.value)} 
            className="flex-1 resize-none border-0 p-4 font-mono text-sm leading-relaxed focus-visible:ring-0 bg-transparent"
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        <div className="h-full flex flex-col bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-100 text-xs font-mono text-gray-500">
            PREVIEW
          </div>
          <iframe 
            key={previewKey}
            title="Preview"
            className="flex-1 w-full h-full bg-white"
            srcDoc={code}
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  );
}
