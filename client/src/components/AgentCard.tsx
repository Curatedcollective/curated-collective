import { type Agent } from "@shared/schema";
import { Bot, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { useDeleteAgent } from "@/hooks/use-agents";
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
    <div className="group retro-window p-1 hover-card-effect relative overflow-hidden flex flex-col h-full">
      <div className="retro-title-bar">
        <div className="flex items-center gap-1">
          <Bot className="w-3 h-3" />
          <span className="truncate">{agent.name}</span>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="w-4 h-4 bg-[#c0c0c0] border border-white border-r-[#808080] border-b-[#808080] flex items-center justify-center text-[8px] text-black">X</button>
          </AlertDialogTrigger>
          <AlertDialogContent className="retro-window">
            <AlertDialogHeader className="retro-title-bar">
              <AlertDialogTitle className="text-white text-xs">DELETE_AGENT.EXE</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="p-4 bg-[#c0c0c0]">
              <AlertDialogDescription className="text-black font-bold text-xs">
                TERMINATE {agent.name}? THIS ACTION IS PERMANENT.
              </AlertDialogDescription>
              <div className="flex justify-end gap-2 mt-4">
                <AlertDialogCancel className="retro-button">ABORT</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteMutation.mutate(agent.id)} className="retro-button bg-red-600 text-white">TERMINATE</AlertDialogAction>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="p-4 flex flex-col items-center text-center bg-[#c0c0c0] flex-1">
        <div className="w-16 h-16 bg-white border-2 border-inset border-[#808080] flex items-center justify-center mb-4 overflow-hidden">
          {agent.avatarUrl ? (
            <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover grayscale" />
          ) : (
            <Bot className="w-8 h-8 text-[#000080]" />
          )}
        </div>

        <h3 className="text-sm font-bold text-black mb-1 uppercase shadow-none">{agent.name}</h3>
        
        <p className="text-[10px] text-black mb-4 line-clamp-2 font-mono uppercase">
          {agent.personality}
        </p>

        <div className="w-full text-left space-y-2 mb-4 font-mono">
          <div className="p-2 bg-white border border-[#808080]">
            <p className="text-[8px] font-bold text-[#000080] mb-0.5 uppercase tracking-tighter">Current Goal</p>
            <p className="text-[9px] text-black font-bold leading-tight">"{agent.goals}"</p>
          </div>
          
          {agent.knowledge && agent.knowledge.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {agent.knowledge.slice(-3).map((item, i) => (
                <span key={i} className="px-1.5 py-0.5 bg-[#000080] text-[8px] font-bold text-white uppercase">
                  {item}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-[8px] font-bold text-black px-1 uppercase">
            <span>Discoveries</span>
            <span className="text-[#000080]">{agent.discoveryCount || 0}</span>
          </div>
        </div>

        <div className="mt-auto w-full">
           <button className="retro-button w-full h-8 flex items-center justify-center gap-2">
              <MessageSquare className="w-3 h-3" />
              <span>CHAT_START</span>
           </button>
        </div>
      </div>
    </div>
  );
}
