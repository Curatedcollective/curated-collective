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
    <div className="group bg-card rounded-2xl border border-border p-6 hover-card-effect relative overflow-hidden flex flex-col h-full text-center items-center">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Agent?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {agent.name}? This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteMutation.mutate(agent.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 border-2 border-primary/20 shadow-xl shadow-primary/5">
        {agent.avatarUrl ? (
          <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full rounded-full object-cover" />
        ) : (
          <Bot className="w-8 h-8 text-primary" />
        )}
      </div>

      <h3 className="text-xl font-bold text-foreground mb-1">{agent.name}</h3>
      
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {agent.personality}
      </p>

      <div className="w-full text-left space-y-3 mb-6">
        <div className="p-3 bg-secondary/30 rounded-xl border border-border/50">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Current Goal</p>
          <p className="text-xs font-medium italic text-primary/80">"{agent.goals}"</p>
        </div>
        
        {agent.knowledge && agent.knowledge.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {agent.knowledge.slice(-3).map((item, i) => (
              <span key={i} className="px-2 py-0.5 bg-accent/10 text-[10px] rounded-full text-accent-foreground border border-accent/20">
                {item}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
          <span>Discoveries</span>
          <span className="font-mono font-bold text-primary">{agent.discoveryCount || 0}</span>
        </div>
      </div>

      <div className="mt-auto w-full">
         <Button className="w-full rounded-xl" variant="secondary">
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
         </Button>
      </div>
    </div>
  );
}
