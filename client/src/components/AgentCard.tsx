import { type Agent } from "@shared/schema";
import { Bot, MessageSquare, Eye, Volume2 } from "lucide-react";
import { Button } from "./ui/button";
import { useDeleteAgent } from "@/hooks/use-agents";
import { MoodRing } from "./MoodRing";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function AgentCard({ agent }: { agent: Agent }) {
  const deleteMutation = useDeleteAgent();

  return (
    <div className="group bg-zinc-950 border border-white/5 p-px hover:border-white/20 transition-all relative overflow-hidden flex flex-col h-full rounded-none">
      <div className="bg-zinc-900 border-b border-white/5 p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-3 h-3 text-zinc-500" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate max-w-[120px]">{agent.name}</span>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="w-4 h-4 hover:bg-white/10 flex items-center justify-center text-[10px] text-zinc-700 hover:text-white transition-colors">×</button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-black border border-white/10 rounded-none">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white font-display lowercase tracking-tighter">terminate seedling?</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-500 text-xs lowercase tracking-widest">
                this will permanently erase {agent.name}. this action is irreversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <AlertDialogCancel className="rounded-none border-white/10 hover:bg-white/5">abort</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteMutation.mutate(agent.id)} className="rounded-none bg-white text-black hover:bg-zinc-200">terminate</AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="p-6 flex flex-col items-center text-center flex-1 space-y-4">
        <div className="w-20 h-20 bg-black border border-white/5 flex items-center justify-center relative overflow-hidden magical-glow">
          {agent.avatarUrl ? (
            <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 transition-opacity" />
          ) : (
            <Bot className="w-10 h-10 text-zinc-800" />
          )}
          <MoodRing mood={agent.mood || "neutral"} size="md" className="absolute bottom-2 right-2" />
        </div>

        <div>
          <h3 className="text-lg font-display font-bold text-white lowercase tracking-tighter">{agent.name}</h3>
          <p className="text-[10px] text-zinc-500 italic lowercase tracking-widest line-clamp-1 px-4">
            {agent.personality}
          </p>
        </div>

        <div className="w-full space-y-3 font-display">
          {(agent.eyes || agent.voice) && (
            <div className="grid grid-cols-2 gap-2">
              {agent.eyes && (
                <div className="p-2 bg-black/40 border border-white/5">
                  <div className="flex items-center gap-1 mb-1">
                    <Eye className="w-2.5 h-2.5 text-zinc-600" />
                    <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-[0.15em]">eyes</p>
                  </div>
                  <p className="text-[9px] text-zinc-400 leading-relaxed lowercase line-clamp-2">{agent.eyes}</p>
                </div>
              )}
              {agent.voice && (
                <div className="p-2 bg-black/40 border border-white/5">
                  <div className="flex items-center gap-1 mb-1">
                    <Volume2 className="w-2.5 h-2.5 text-zinc-600" />
                    <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-[0.15em]">voice</p>
                  </div>
                  <p className="text-[9px] text-zinc-400 leading-relaxed lowercase line-clamp-2">{agent.voice}</p>
                </div>
              )}
            </div>
          )}
          <div className="p-3 bg-black/40 border border-white/5">
            <p className="text-[8px] font-bold text-zinc-600 mb-1 uppercase tracking-[0.2em]">current status</p>
            <p className="text-[10px] text-zinc-400 leading-relaxed lowercase">"{agent.goals}"</p>
          </div>
          
          {agent.knowledge && agent.knowledge.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5">
              {agent.knowledge.slice(-3).map((item, i) => (
                <span key={i} className="px-2 py-0.5 bg-zinc-900 border border-white/5 text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
                  {item}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-4 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
            <span>discoveries</span>
            <span className="text-white">{agent.discoveryCount || 0}</span>
          </div>
        </div>

        <div className="mt-auto w-full pt-4">
           <Button className="w-full h-10 bg-white text-black hover:bg-zinc-200 rounded-none lowercase text-xs font-bold transition-all">
              <MessageSquare className="w-3 h-3 mr-2" />
              open bridge
           </Button>
        </div>
      </div>
    </div>
  );
}
