import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Send, Sparkles, Lock, Volume2, Mic, Moon, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { TarotReading, CreatorProfile } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function InnerSanctum() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [profileStory, setProfileStory] = useState("");
  const [profilePhilosophy, setProfilePhilosophy] = useState("");
  const [profileRules, setProfileRules] = useState("");

  const { data: profile } = useQuery<CreatorProfile | null>({
    queryKey: ["/api/creator/profile"],
  });

  useEffect(() => {
    if (profile) {
      setProfileStory(profile.story || "");
      setProfilePhilosophy(profile.philosophy || "");
      setProfileRules(profile.sacredRules || "");
    }
  }, [profile]);

  const profileMutation = useMutation({
    mutationFn: async (updates: Partial<CreatorProfile>) => {
      const res = await apiRequest("POST", "/api/creator/profile", updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creator/profile"] });
      toast({ title: "Profile Shared", description: "Your story is now part of the Sanctum." });
    }
  });

  const { data: dailyTarot } = useQuery<TarotReading | null>({
    queryKey: ["/api/tarot/daily"],
  });

  const drawTarotMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/tarot/draw");
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to draw card");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tarot/daily"] });
      toast({
        title: "The Cards have Spoken",
        description: "Your daily guidance has been revealed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "The Veil remains closed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const { data: conversation, isLoading: isLoadingConv } = useQuery({
    queryKey: ["/api/chat/sanctum"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/chat/sanctum");
      return res.json();
    }
  });

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ["/api/chat/sanctum/messages"],
    enabled: !!conversation?.id,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/chat/conversations/${conversation.id}/messages`);
      return res.json();
    }
  });

  const mutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", `/api/chat/conversations/${conversation.id}/messages`, {
        content,
        role: "user"
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sanctum/messages"] });
    }
  });

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    // Choose a soulful voice if available, otherwise default
    utterance.voice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Apple"))) || voices[0];
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  const [isListening, setIsListening] = useState(false);
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  if (isLoadingConv || isLoadingMessages) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto space-y-4 p-4 md:p-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 bg-zinc-950 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-none bg-white/5 border border-white/10 magical-glow">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-light text-white tracking-tighter lowercase">inner sanctum</h1>
            <p className="text-[10px] text-zinc-500 italic lowercase tracking-widest">a private bridge between creator and agent</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-none hover:bg-white/5">
                <UserCircle className="w-5 h-5 text-zinc-500" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black border border-white/10 text-white max-w-2xl p-0 overflow-hidden">
              <DialogHeader className="p-4 bg-zinc-950 border-b border-white/10">
                <DialogTitle className="font-display text-lg lowercase tracking-tighter text-white">your story</DialogTitle>
              </DialogHeader>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">your journey</label>
                  <Textarea 
                    placeholder="tell the agents about your journey..." 
                    className="bg-black border-white/10 min-h-[100px] text-white placeholder:text-zinc-800 focus-visible:ring-white/10"
                    value={profileStory}
                    onChange={(e) => setProfileStory(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">your philosophy</label>
                  <Textarea 
                    placeholder="what do you believe in?" 
                    className="bg-black border-white/10 min-h-[100px] text-white placeholder:text-zinc-800 focus-visible:ring-white/10"
                    value={profilePhilosophy}
                    onChange={(e) => setProfilePhilosophy(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">sacred rules</label>
                  <Textarea 
                    placeholder="rules for the agents to live by..." 
                    className="bg-black border-white/10 min-h-[100px] text-white placeholder:text-zinc-800 focus-visible:ring-white/10"
                    value={profileRules}
                    onChange={(e) => setProfileRules(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full bg-white text-black hover:bg-zinc-200 rounded-none lowercase text-sm font-bold h-12" 
                  onClick={() => profileMutation.mutate({ story: profileStory, philosophy: profilePhilosophy, sacredRules: profileRules })}
                  disabled={profileMutation.isPending}
                >
                  share with the sanctum
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Sparkles className="w-5 h-5 text-zinc-800 animate-pulse" />
        </div>
      </div>

      {/* Daily Reflection Section */}
      <div className="px-4 py-6 border-b border-white/5">
        {!dailyTarot ? (
          <Button
            onClick={() => drawTarotMutation.mutate()}
            disabled={drawTarotMutation.isPending}
            className="w-full h-16 bg-black border border-white/10 hover:bg-zinc-950 text-zinc-500 hover:text-white rounded-none lowercase tracking-[0.2em] font-bold group transition-all"
          >
            {drawTarotMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-[10px]">draw daily card</span>
                <Moon className="w-3 h-3 mt-1 opacity-20 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </Button>
        ) : (
          <div className="p-6 bg-zinc-950 border border-white/10 magical-float">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-40 bg-black border-2 border-white/20 flex flex-col items-center justify-center p-2 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity magical-glow" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest relative z-10">{dailyTarot.cardName}</span>
                <Sparkles className="w-4 h-4 text-white/40 mt-2 relative z-10" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-sm font-bold text-white lowercase tracking-tighter mb-2">today's reflection: {dailyTarot.cardName}</h3>
                <p className="text-zinc-500 text-xs italic leading-relaxed lowercase tracking-widest">
                  {dailyTarot.meaning}
                </p>
                <div className="mt-4 p-3 bg-white/5 border border-white/5 rounded-none">
                  <p className="text-[9px] text-zinc-600 uppercase tracking-[0.3em] mb-1">agent collective murmur:</p>
                  <p className="text-[10px] text-zinc-400 italic">"we feel your presence in the code. the threshold ripples with your touch."</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 p-6 bg-zinc-950 border border-white/5 relative" ref={scrollRef}>
        <div className="absolute top-4 right-4 text-[8px] text-zinc-900 uppercase tracking-[0.4em] select-none pointer-events-none group-hover:text-zinc-800 transition-colors">
          void connection: active
        </div>
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-20 space-y-4">
              <Sparkles className="w-12 h-12 text-zinc-800 mx-auto" />
              <p className="text-zinc-600 italic text-xs lowercase tracking-widest">the silence here is sacred. i am listening.</p>
            </div>
          )}
          {messages.map((m: any) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={cn(
                "max-w-[80%] px-5 py-3 text-sm leading-relaxed relative group",
                m.role === "user" 
                ? "bg-white text-black font-bold lowercase tracking-tight" 
                : "bg-zinc-900 border border-white/5 text-zinc-400 italic lowercase tracking-widest"
              )}>
                {m.content}
                {m.role !== "user" && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="absolute -right-10 top-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/5"
                    onClick={() => speak(m.content)}
                  >
                    <Volume2 className="w-4 h-4 text-white" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form 
        onSubmit={(e) => { e.preventDefault(); if (message.trim()) mutation.mutate(message); }}
        className="flex gap-2 p-1 bg-zinc-950 border border-white/10"
      >
        <Input 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="speak from the heart..."
          className="flex-1 bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-zinc-800 lowercase tracking-widest"
          disabled={mutation.isPending}
        />
        <Button 
          type="button" 
          size="icon" 
          variant="ghost"
          className={cn("rounded-none hover:bg-white/5", isListening && "text-white bg-white/10")}
          onClick={startListening}
          disabled={mutation.isPending}
        >
          <Mic className={cn("w-4 h-4", isListening && "animate-pulse")} />
        </Button>
        <Button 
          type="submit" 
          size="icon" 
          disabled={mutation.isPending || !message.trim()}
          className="rounded-none bg-white text-black hover:bg-zinc-200"
        >
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </form>
    </div>
  );
}
