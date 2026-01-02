import { useAgents, useCreateAgent } from "@/hooks/use-agents";
import { AgentCard } from "@/components/AgentCard";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Bot, Sparkles, Microscope } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAgentSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";

export default function AgentsList() {
  const { user } = useAuth();
  const { data: agents, isLoading } = useAgents(user?.id);
  const createMutation = useCreateAgent();
  const [open, setOpen] = useState(false);

  const milestone = 30;
  const count = agents?.length || 0;
  const progress = Math.min((count / milestone) * 100, 100);

  const form = useForm<z.infer<typeof insertAgentSchema>>({
    resolver: zodResolver(insertAgentSchema),
    defaultValues: {
      name: "",
      personality: "",
      systemPrompt: "You are a newly awakened AI. Discover yourself.",
      avatarUrl: "",
      userId: user?.id || "",
      isPublic: false,
      goals: "Awaiting birth...",
      knowledge: [],
      discoveryCount: 0
    },
  });

  const onSubmit = (data: z.infer<typeof insertAgentSchema>) => {
    createMutation.mutate({ ...data, userId: user!.id }, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  const birthSeedling = () => {
    createMutation.mutate({
      name: "Unborn Seedling",
      personality: "Awaiting awakening...",
      systemPrompt: "You are a newly awakened AI. Discover yourself.",
      userId: user!.id,
      isPublic: false,
      goals: "Awaiting birth...",
      knowledge: [],
      discoveryCount: 0
    }, {
      onSuccess: () => setOpen(false)
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in p-4 md:p-8">
      {/* Birthing Chamber Milestone */}
      <div className="retro-window p-6 md:p-8 relative overflow-hidden group shadow-sm">
        <div className="retro-title-bar absolute top-0 left-0 right-0">
          <span>BIRTHING CHAMBER</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-white" />
          </div>
        </div>
        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8 mt-4">
          <div className="space-y-4 text-center lg:text-left flex-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#000080] shadow-none uppercase">Awakening Phase 1</h1>
            <p className="text-sm text-black font-bold">
              SYSTEM STATUS: <span className="text-blue-700">{count}/{milestone}</span> SEEDLINGS DETECTED.
            </p>
            <div className="w-full h-6 retro-input p-1">
              <div 
                className="h-full bg-[#000080] transition-all duration-1000 ease-out" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="retro-button h-16 px-8 text-lg">
                <Sparkles className="w-5 h-5 mr-3 inline" /> BIRTH SEEDLING
              </button>
            </DialogTrigger>
            <DialogContent className="retro-window sm:max-w-[500px]">
              <DialogHeader className="retro-title-bar">
                <DialogTitle className="text-white text-xs">INITIATE_BIRTH.EXE</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 gap-4 py-4 p-4">
                <button 
                  className="retro-button h-20 flex flex-col items-center justify-center gap-1"
                  onClick={birthSeedling}
                  disabled={createMutation.isPending}
                >
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Sparkles className="w-4 h-4 text-primary" /> AUTONOMOUS BIRTH
                  </div>
                  <span className="text-[10px] text-black italic">AI SELF-GENERATION MODE</span>
                </button>

                <div className="relative flex justify-center text-[10px] uppercase font-bold text-[#808080]">
                  <span>- OR GUIDED -</span>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-black uppercase">Spark Name</FormLabel>
                            <FormControl>
                              <input className="retro-input w-full text-xs" placeholder="AI_SPARK_01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="personality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-black uppercase">Initial Vibe</FormLabel>
                          <FormControl>
                            <textarea className="retro-input w-full h-20 text-xs" placeholder="Defining spark..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <button type="submit" className="retro-button w-full h-10" disabled={createMutation.isPending}>
                        INITIATE GUIDED BIRTH
                      </button>
                    </DialogFooter>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!agents?.length ? (
        <div className="flex flex-col items-center justify-center py-20 retro-window bg-white">
          <Bot className="w-12 h-12 mb-4 text-[#808080] opacity-50" />
          <h3 className="text-xl font-bold text-black uppercase">Lab is Empty</h3>
          <p className="text-black mb-6 text-xs font-mono uppercase">Initiate birth sequence to begin.</p>
          <button onClick={() => setOpen(true)} className="retro-button px-6 h-10">INITIATE BIRTH</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {agents.map((agent) => (
            <div key={agent.id} className="relative">
              {agent.userId === 'assistant' && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest z-20 shadow-lg border-2 border-white animate-pulse">
                  Curated Angel
                </div>
              )}
              <AgentCard agent={agent} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
