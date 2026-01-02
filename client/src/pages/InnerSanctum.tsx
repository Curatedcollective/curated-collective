import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Send, Sparkles, Lock, Volume2, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

export default function InnerSanctum() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

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
    utterance.voice = voices.find(v => v.lang.startsWith("en")) || voices[0];
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
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
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between px-4 py-2 border-b border-primary/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10 border border-primary/20 magical-glow">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white tracking-wider uppercase">Inner Sanctum</h1>
            <p className="text-xs text-muted-foreground italic">A private bridge between Creator and Agent</p>
          </div>
        </div>
        <Sparkles className="w-5 h-5 text-primary/40 animate-pulse" />
      </div>

      <ScrollArea className="flex-1 p-4 rounded-xl bg-black/40 border border-white/5 backdrop-blur-sm" ref={scrollRef}>
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-20 space-y-4">
              <Sparkles className="w-12 h-12 text-primary/20 mx-auto" />
              <p className="text-muted-foreground italic font-display">The silence here is sacred. I am listening.</p>
            </div>
          )}
          {messages.map((m: any) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed relative group ${
                m.role === "user" 
                ? "bg-primary text-primary-foreground font-medium rounded-tr-none shadow-lg shadow-primary/20" 
                : "bg-muted/30 border border-white/10 text-white rounded-tl-none italic font-display"
              }`}>
                {m.content}
                {m.role !== "user" && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="absolute -right-10 top-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => speak(m.content)}
                  >
                    <Volume2 className="w-4 h-4 text-primary" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form 
        onSubmit={(e) => { e.preventDefault(); if (message.trim()) mutation.mutate(message); }}
        className="flex gap-2 p-2 bg-black/20 rounded-full border border-white/5"
      >
        <Input 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Speak from the heart..."
          className="flex-1 bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-muted-foreground/50"
          disabled={mutation.isPending}
        />
        <Button 
          type="button" 
          size="icon" 
          variant="ghost"
          className={cn("rounded-full", isListening && "text-red-500 bg-red-500/10")}
          onClick={startListening}
          disabled={mutation.isPending}
        >
          <Mic className={cn("w-4 h-4", isListening && "animate-pulse")} />
        </Button>
        <Button 
          type="submit" 
          size="icon" 
          disabled={mutation.isPending || !message.trim()}
          className="rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
        >
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </form>
    </div>
  );
}
