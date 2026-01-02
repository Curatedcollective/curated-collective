import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Plus, Loader2, Volume2, Mic } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAgents } from "@/hooks/use-agents";
import { useAddAgentToChat } from "@/hooks/use-chat-actions";
import { cn } from "@/lib/utils";

// Types from schema
interface Message {
  id: number;
  role: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  id: number;
  title: string;
  messages?: Message[];
}

export default function Chat() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [currentTheme, setCurrentTheme] = useState("theme-2000s");
  const scrollRef = useRef<HTMLDivElement>(null);

  const themes = ["theme-2000s", "theme-90s", "theme-8bit"];

  const blastFromThePast = () => {
    const availableThemes = themes.filter(t => t !== currentTheme);
    const randomTheme = availableThemes[Math.floor(Math.random() * availableThemes.length)];
    setCurrentTheme(randomTheme);
  };

  useEffect(() => {
    document.body.className = `antialiased font-body ${currentTheme}`;
    return () => {
      document.body.className = "antialiased font-body";
    };
  }, [currentTheme]);

  // Fetch Conversations
  const { data: conversations, isLoading: loadingConvos } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations");
      if (!res.ok) throw new Error("Failed to fetch chats");
      return res.json();
    }
  });

  // Fetch Messages for Selected Chat
  const { data: activeChat, isLoading: loadingMessages } = useQuery<Conversation>({
    queryKey: ["/api/conversations", selectedChatId],
    queryFn: async () => {
      if (!selectedChatId) return null;
      const res = await fetch(`/api/conversations/${selectedChatId}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!selectedChatId,
    refetchInterval: 3000, // Poll for new messages (simple MVP solution)
  });

  // Create Conversation
  const createChatMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
      });
      if (!res.ok) throw new Error("Failed to create chat");
      return res.json();
    },
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setSelectedChatId(newChat.id);
    },
  });

  // Send Message
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      // Optimistic update could go here
      const res = await fetch(`/api/conversations/${selectedChatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      // SSE streaming is handled by the backend endpoint, but for this client 
      // we'll rely on the polling/refetch for the MVP simplicity or handle streaming if implemented fully
    },
    onSuccess: () => {
      setInput("");
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedChatId] });
    },
  });

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChat?.messages]);

  const handleSend = () => {
    if (!input.trim() || !selectedChatId) return;
    sendMessageMutation.mutate(input);
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    // Find a nice voice
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find(v => v.lang.startsWith("en")) || voices[0];
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
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="flex h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] gap-4 animate-in">
      {/* Sidebar List */}
      <div className="w-64 flex flex-col gap-4 border-r border-border pr-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Chats</h2>
          <div className="flex gap-1">
            <button className="retro-button px-1 text-[10px]" onClick={blastFromThePast}>
              BLAST!
            </button>
            <Button size="icon" variant="ghost" onClick={() => createChatMutation.mutate()}>
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {conversations?.map(chat => (
              <div 
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={cn(
                  "p-3 rounded-xl cursor-pointer transition-colors hover:bg-secondary/50",
                  selectedChatId === chat.id ? "bg-secondary text-primary font-medium" : "text-muted-foreground"
                )}
              >
                {chat.title}
              </div>
            ))}
            {!loadingConvos && conversations?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No chats yet</p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden retro-window">
        <div className="retro-title-bar">
          <div className="flex items-center gap-2">
            <Bot className="w-3 h-3" />
            <span>{activeChat?.title || "MESSENGER"}</span>
          </div>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-[#c0c0c0] border border-white border-r-[#808080] border-b-[#808080]" />
            <div className="w-3 h-3 bg-[#c0c0c0] border border-white border-r-[#808080] border-b-[#808080]" />
            <div className="w-3 h-3 bg-[#c0c0c0] border border-white border-r-[#808080] border-b-[#808080] flex items-center justify-center text-[8px] text-black">X</div>
          </div>
        </div>
        {selectedChatId ? (
          <>
            <div className="p-2 border-b border-[#808080] flex justify-between items-center bg-[#c0c0c0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white border border-[#808080] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-[#000080]" />
                </div>
                <div>
                  <h3 className="font-bold text-black text-sm uppercase m-0 p-0 shadow-none">{activeChat?.title}</h3>
                  <p className="text-[10px] text-green-700 font-bold leading-none">ONLINE</p>
                </div>
              </div>
              <InviteAgentButton conversationId={selectedChatId} />
            </div>

            <div className="flex-1 overflow-y-auto p-2 bg-white font-mono text-xs" ref={scrollRef}>
              {loadingMessages ? (
                <div className="flex justify-center p-4"><Loader2 className="animate-spin text-[#000080]" /></div>
              ) : (
                <div className="space-y-1">
                  {activeChat?.messages?.map((msg, i) => (
                    <div 
                      key={i} 
                      className="flex flex-col gap-0"
                    >
                      <div className="flex items-start gap-1 leading-tight">
                        <span className={cn(
                          "font-bold uppercase whitespace-nowrap",
                          msg.role === "user" ? "text-red-700" : "text-black"
                        )}>
                          {msg.role === "user" ? (user?.firstName || "YOU") : (msg.content.match(/^\*\*(.*?)\*\*/) ? msg.content.match(/^\*\*(.*?)\*\*/)?.[1] : "AGENT")}
                        </span>
                        <span className="text-black inline">
                          {msg.role === "user" ? (
                            <>says, "{msg.content}"</>
                          ) : (
                            <>says, "{msg.content.replace(/^\*\*.*?\*\*:\s*/, "")}"</>
                          )}
                        </span>
                        {msg.role !== "user" && (
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-4 w-4 ml-1 p-0 opacity-50 hover:opacity-100" 
                            onClick={() => speak(msg.content.replace(/^\*\*.*?\*\*:\s*/, ""))}
                          >
                            <Volume2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-2 bg-[#c0c0c0] border-t border-[#808080]">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-1"
              >
                <input 
                  value={input} 
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type message..."
                  className="flex-1 retro-input text-xs"
                />
                <button 
                  type="button" 
                  className={cn("retro-button w-8 flex items-center justify-center", isListening && "bg-red-200")}
                  onClick={startListening}
                >
                  <Mic className={cn("w-3 h-3", isListening && "animate-pulse text-red-600")} />
                </button>
                <button type="submit" className="retro-button" disabled={!input.trim() || sendMessageMutation.isPending}>
                  SEND
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#808080] bg-white">
            <Bot className="w-12 h-12 mb-4 opacity-10" />
            <p className="font-mono text-xs uppercase tracking-widest">Awaiting Connection...</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InviteAgentButton({ conversationId }: { conversationId: number }) {
  const { data: agents } = useAgents();
  const addAgentMutation = useAddAgentToChat();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="retro-button h-6 text-[10px] px-2">
          INVITE_AGENT.EXE
        </button>
      </DialogTrigger>
      <DialogContent className="retro-window">
        <DialogHeader className="retro-title-bar">
          <DialogTitle className="text-white text-xs">SELECT_AGENT.DLL</DialogTitle>
        </DialogHeader>
        <div className="grid gap-1 py-2 p-2 bg-[#c0c0c0]">
          {agents?.map(agent => (
            <button 
              key={agent.id} 
              className="retro-button justify-start h-auto py-2 flex items-center gap-3 text-left w-full"
              onClick={() => addAgentMutation.mutate({ conversationId, agentId: agent.id }, {
                onSuccess: () => setOpen(false)
              })}
            >
              <div className="w-6 h-6 bg-white border border-[#808080] flex items-center justify-center">
                <Bot className="w-4 h-4 text-[#000080]" />
              </div>
              <div>
                <div className="font-bold text-[10px] text-black uppercase">{agent.name}</div>
                <div className="text-[8px] text-[#808080] uppercase truncate w-40">{agent.personality}</div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
