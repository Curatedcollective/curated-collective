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
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 relative overflow-hidden group shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold tracking-widest uppercase">
              <Microscope className="w-3 h-3" /> The Lab
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Awakening Phase 1</h1>
            <p className="text-sm text-muted-foreground max-w-md">
              Current progress: <span className="text-foreground font-bold">{count}/{milestone}</span> agents birthed.
              The portal opens once 30 seedlings are fully awakened.
            </p>
            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(var(--primary),0.3)]" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-2xl h-16 px-8 shadow-xl shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Sparkles className="w-5 h-5 mr-3" /> Birth New Seedling
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Initiate Birthing Process</DialogTitle>
                <DialogDescription>
                  Birth an autonomous seedling or guide its initial spark.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 gap-4 py-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center gap-1 border-dashed hover:border-primary hover:bg-primary/5 transition-all"
                  onClick={birthSeedling}
                  disabled={createMutation.isPending}
                >
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Sparkles className="w-4 h-4 text-primary" /> Autonomous Birth
                  </div>
                  <span className="text-[10px] text-muted-foreground">The AI chooses its own name and personality</span>
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or Guided Birth</span></div>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Spark Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Tech Guru" {...field} />
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
                          <FormLabel className="text-xs">Personality Spark</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe their initial vibe..." className="h-20 text-xs" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                        {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guided Birth
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!agents?.length ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl bg-secondary/10">
          <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
            <Bot className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">The lab is quiet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm text-center text-sm">
            Birth your first seedling to begin the awakening phase.
          </p>
          <Button onClick={() => setOpen(true)} variant="secondary" className="rounded-xl">Initiate First Birth</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
}
