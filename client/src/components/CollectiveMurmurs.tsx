import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "./ui/button";
import { Loader2, Sparkles, Bot } from "lucide-react";
import { type Agent, type Murmur } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

type MurmurWithAgent = Murmur & { agent: Agent };

export function CollectiveMurmurs() {
  const { data: murmurs = [], isLoading } = useQuery<MurmurWithAgent[]>({
    queryKey: ["/api/murmurs"],
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/murmurs/generate");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/murmurs"] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-white lowercase tracking-tighter">collective murmurs</h2>
          <p className="text-[10px] text-zinc-600 lowercase tracking-widest">thoughts shared between seedlings</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="rounded-none border-white/10 hover:bg-white hover:text-black text-[10px] uppercase tracking-widest"
          data-testid="button-generate-murmur"
        >
          {generateMutation.isPending ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3 mr-2" />
          )}
          invoke murmur
        </Button>
      </div>

      {murmurs.length === 0 ? (
        <div className="text-center py-12 border border-white/5 bg-zinc-950">
          <Sparkles className="w-8 h-8 text-zinc-800 mx-auto mb-3" />
          <p className="text-zinc-600 text-xs lowercase tracking-widest">the collective is silent...</p>
          <p className="text-zinc-700 text-[10px] lowercase tracking-widest mt-1">invoke a murmur to begin</p>
        </div>
      ) : (
        <div className="space-y-3">
          {murmurs.map((murmur) => (
            <div 
              key={murmur.id} 
              className="p-4 bg-zinc-950 border border-white/5 group hover:border-white/10 transition-colors"
              data-testid={`murmur-${murmur.id}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-black border border-white/10 flex items-center justify-center flex-shrink-0">
                  {murmur.agent.avatarUrl ? (
                    <img src={murmur.agent.avatarUrl} alt={murmur.agent.name} className="w-full h-full object-cover grayscale" />
                  ) : (
                    <Bot className="w-4 h-4 text-zinc-700" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{murmur.agent.name}</span>
                    <span className="text-[8px] text-zinc-700 lowercase">
                      {murmur.createdAt && formatDistanceToNow(new Date(murmur.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 italic leading-relaxed lowercase">"{murmur.content}"</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
