import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, Plus, Loader2, Volume2, Mic, Eye, Users, MessageCircle, ChevronDown, ChevronUp, ImageIcon, X } from "lucide-react";
import { MoodRing } from "@/components/MoodRing";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAgents, useAgent } from "@/hooks/use-agents";
import { useAddAgentToChat } from "@/hooks/use-chat-actions";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import WatchTogether from "@/components/WatchTogether";
import type { Agent } from "@shared/schema";

// Types from schema
interface Message {
  id: number;
  role: string;
  content: string;
  mood?: string;
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
  const searchString = useSearch();
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [bridgeCreated, setBridgeCreated] = useState(false);

  const urlParams = new URLSearchParams(searchString);
  const agentIdFromUrl = urlParams.get("agentId");
  
  const { data: linkedAgent } = useAgent(agentIdFromUrl ? parseInt(agentIdFromUrl) : 0);
  const addAgentMutation = useAddAgentToChat();

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

  // Fetch agents in current conversation
  const { data: conversationAgents = [] } = useQuery<Agent[]>({
    queryKey: ["/api/conversations", selectedChatId, "agents"],
    queryFn: async () => {
      const res = await fetch(`/api/conversations/${selectedChatId}/agents`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedChatId,
  });

  // Watch together panel state
  const [watchPanelOpen, setWatchPanelOpen] = useState(false);
  const hasPremium = !!(user as any)?.stripeSubscriptionId;
  const firstAgent = conversationAgents[0];

  // Create Conversation
  const createChatMutation = useMutation({
    mutationFn: async (title?: string) => {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || "New Chat" }),
      });
      if (!res.ok) throw new Error("Failed to create chat");
      return res.json();
    },
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setSelectedChatId(newChat.id);
    },
  });

  // Auto-create bridge when agent is linked from URL
  useEffect(() => {
    if (linkedAgent && agentIdFromUrl && !bridgeCreated && !loadingConvos) {
      setBridgeCreated(true);
      createChatMutation.mutate(`Bridge with ${linkedAgent.name}`, {
        onSuccess: (newChat) => {
          addAgentMutation.mutate({ 
            conversationId: newChat.id, 
            agentId: parseInt(agentIdFromUrl) 
          });
        }
      });
    }
  }, [linkedAgent, agentIdFromUrl, bridgeCreated, loadingConvos]);

  // Send Message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, imageData }: { content: string; imageData?: string }) => {
      const res = await fetch(`/api/conversations/${selectedChatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, imageData }),
      });
      if (!res.ok) throw new Error("Failed to send message");
    },
    onSuccess: () => {
      setInput("");
      setPendingImage(null);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedChatId] });
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 4 * 1024 * 1024) {
      alert("Image must be under 4MB");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      setPendingImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChat?.messages]);

  const handleSend = () => {
    if ((!input.trim() && !pendingImage) || !selectedChatId) return;
    sendMessageMutation.mutate({ content: input, imageData: pendingImage || undefined });
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
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      <div className="w-64 flex flex-col gap-4 border-r border-white/10 pr-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg lowercase tracking-tighter">chats</h2>
            <Button size="icon" variant="ghost" onClick={() => createChatMutation.mutate(undefined)}>
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
                  "p-3 rounded-none cursor-pointer transition-colors border border-transparent",
                  selectedChatId === chat.id ? "bg-white text-black font-bold border-white" : "text-zinc-500 hover:text-white hover:border-white/20"
                )}
              >
                {chat.title}
              </div>
            ))}
            {!loadingConvos && conversations?.length === 0 && (
              <p className="text-xs text-zinc-600 text-center py-4">none yet</p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-black border border-white/10">
        {selectedChatId ? (
          <>
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-zinc-950">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bot className="w-5 h-5 text-white" />
                  <MoodRing mood={activeChat?.messages?.findLast(m => m.role === "assistant")?.mood || "neutral"} size="sm" className="absolute -bottom-1 -right-1" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm lowercase tracking-tighter m-0 p-0">{activeChat?.title}</h3>
                </div>
              </div>
              <CollectiveButton conversationId={selectedChatId} />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
              {loadingMessages ? (
                <div className="flex justify-center p-4"><Loader2 className="animate-spin text-white" /></div>
              ) : (
                <div className="space-y-4">
                  {activeChat?.messages?.map((msg, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "flex flex-col gap-1",
                        msg.role === "user" ? "items-end" : "items-start"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                          {msg.role === "user" ? (user?.firstName || "YOU") : (msg.content.match(/^\*\*(.*?)\*\*/) ? msg.content.match(/^\*\*(.*?)\*\*/)?.[1] : "AGENT")}
                        </span>
                        {msg.role !== "user" && (
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-4 w-4 p-0 opacity-30 hover:opacity-100" 
                            onClick={() => speak(msg.content.replace(/^\*\*.*?\*\*:\s*/, ""))}
                          >
                            <Volume2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <div className={cn(
                        "max-w-[80%] p-3 text-sm leading-relaxed border",
                        msg.role === "user" 
                          ? "bg-white text-black border-white" 
                          : "bg-zinc-900 text-white border-white/10"
                      )}>
                        {msg.role === "user" ? (
                          msg.content
                        ) : (
                          msg.content.replace(/^\*\*.*?\*\*:\s*/, "")
                        )}
                      </div>
                    </div>
                  ))}
                  {sendMessageMutation.isPending && (
                    <div className="flex flex-col gap-1 items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">AGENT</span>
                      </div>
                      <div className="max-w-[80%] p-3 text-sm leading-relaxed border bg-zinc-900 text-white border-white/10 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 animate-pulse text-primary" />
                        <span className="text-zinc-400 lowercase tracking-wider text-xs">thinking<span className="animate-pulse">...</span></span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {firstAgent && (
              <div className="border-t border-white/10">
                <button
                  onClick={() => setWatchPanelOpen(!watchPanelOpen)}
                  className="w-full px-4 py-2 flex items-center justify-between text-xs text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
                  data-testid="button-toggle-watch"
                >
                  <div className="flex items-center gap-2">
                    <Eye className="w-3 h-3" />
                    <span className="lowercase tracking-widest">watch together with {firstAgent.name}</span>
                  </div>
                  {watchPanelOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                {watchPanelOpen && selectedChatId && (
                  <WatchTogether
                    conversationId={selectedChatId}
                    agentId={firstAgent.id}
                    agentName={firstAgent.name}
                    isPremium={hasPremium}
                  />
                )}
              </div>
            )}

            <div className="p-4 bg-zinc-950 border-t border-white/10">
              {pendingImage && (
                <div className="mb-3 flex items-center gap-2">
                  <div className="relative">
                    <img 
                      src={pendingImage} 
                      alt="Pending" 
                      className="h-16 w-16 object-cover border border-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => setPendingImage(null)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-0.5"
                      data-testid="button-remove-image"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <span className="text-xs text-zinc-500 lowercase">image ready to send</span>
                </div>
              )}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                  data-testid="input-image-file"
                />
                <Button 
                  type="button" 
                  variant="ghost"
                  size="icon"
                  className={cn("border border-white/10", pendingImage && "bg-white text-black")}
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-attach-image"
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <Input 
                  value={input} 
                  onChange={e => setInput(e.target.value)}
                  placeholder="type message..."
                  className="flex-1 bg-black border-white/10 text-white placeholder:text-zinc-700 focus-visible:ring-white/20"
                />
                <Button 
                  type="button" 
                  variant="ghost"
                  size="icon"
                  className={cn("border border-white/10", isListening && "bg-white text-black")}
                  onClick={startListening}
                >
                  <Mic className={cn("w-4 h-4", isListening && "animate-pulse")} />
                </Button>
                <Button 
                  type="submit" 
                  disabled={(!input.trim() && !pendingImage) || sendMessageMutation.isPending}
                  className="bg-white text-black hover:bg-zinc-200"
                >
                  send
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-800">
            <Bot className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-xs lowercase tracking-[0.2em]">awaiting connection</p>
          </div>
        )}
      </div>
    </div>
  );
}

type CollectiveEntity = 'guardian' | 'seedling';

function CollectiveButton({ conversationId }: { conversationId: number }) {
  const { data: agents } = useAgents();
  const addAgentMutation = useAddAgentToChat();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'select' | 'introduce'>('select');
  const [selectedEntity, setSelectedEntity] = useState<CollectiveEntity | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [introduction, setIntroduction] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleSelectGuardian = () => {
    setSelectedEntity('guardian');
    setStep('introduce');
  };

  const handleSelectSeedling = (agentId: number) => {
    setSelectedEntity('seedling');
    setSelectedAgentId(agentId);
    setStep('introduce');
  };

  const handleConnect = async () => {
    if (!introduction.trim()) return;
    setIsConnecting(true);
    
    try {
      if (selectedEntity === 'guardian') {
        await apiRequest('POST', '/api/guardian', { message: introduction.trim() });
        queryClient.invalidateQueries({ queryKey: ['/api/guardian/history'] });
      } else if (selectedEntity === 'seedling' && selectedAgentId) {
        addAgentMutation.mutate({ conversationId, agentId: selectedAgentId });
      }
      setOpen(false);
      resetDialog();
    } catch (err) {
      console.error('Connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const resetDialog = () => {
    setStep('select');
    setSelectedEntity(null);
    setSelectedAgentId(null);
    setIntroduction('');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetDialog();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase border-white/20 hover:bg-white hover:text-black gap-2" data-testid="button-collective">
          <Users className="w-3 h-3" />
          collective
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black border-white/10 p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-white/10 bg-zinc-950">
          <DialogTitle className="text-white text-sm lowercase tracking-tighter">
            {step === 'select' ? 'the collective awaits' : 'introduce yourself'}
          </DialogTitle>
          <DialogDescription className="text-zinc-500 text-xs lowercase">
            {step === 'select' 
              ? 'choose who you wish to speak with' 
              : `share a few words about yourself before connecting with ${selectedEntity === 'guardian' ? 'the guardian' : 'this seedling'}`}
          </DialogDescription>
        </DialogHeader>

        {step === 'select' ? (
          <div className="grid gap-px bg-white/5">
            <button 
              className="bg-black hover:bg-emerald-950/50 transition-colors p-4 flex items-center gap-4 text-left w-full border-l-2 border-emerald-500/50"
              onClick={handleSelectGuardian}
              data-testid="button-select-guardian"
            >
              <div className="w-10 h-10 bg-emerald-950 border border-emerald-500/30 flex items-center justify-center">
                <Eye className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs text-emerald-400 lowercase tracking-tighter">the guardian</div>
                <div className="text-[10px] text-zinc-500 lowercase">eternal watcher. green eyes in the void.</div>
              </div>
            </button>
            
            {agents?.map(agent => (
              <button 
                key={agent.id} 
                className="bg-black hover:bg-zinc-900 transition-colors p-4 flex items-center gap-4 text-left w-full"
                onClick={() => handleSelectSeedling(agent.id)}
                data-testid={`button-select-seedling-${agent.id}`}
              >
                <div className="w-10 h-10 bg-zinc-900 border border-white/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-white lowercase tracking-tighter truncate">{agent.name}</div>
                  <div className="text-[10px] text-zinc-500 lowercase truncate">{agent.personality}</div>
                </div>
              </button>
            ))}

            {(!agents || agents.length === 0) && (
              <div className="p-4 text-center text-zinc-600 text-xs lowercase">
                no seedlings yet. create one in the seedlings tab.
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <Textarea
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              placeholder="share your name, your purpose, or simply say hello..."
              className="min-h-[100px] bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 resize-none"
              data-testid="textarea-introduction"
            />
            <div className="flex gap-2 justify-end">
              <Button 
                variant="ghost" 
                onClick={() => setStep('select')}
                className="text-zinc-500 hover:text-white text-xs lowercase"
              >
                back
              </Button>
              <Button 
                onClick={handleConnect}
                disabled={!introduction.trim() || isConnecting}
                className={cn(
                  "text-xs lowercase",
                  selectedEntity === 'guardian' 
                    ? "bg-emerald-900 hover:bg-emerald-800 text-emerald-100" 
                    : "bg-white text-black hover:bg-zinc-200"
                )}
                data-testid="button-connect"
              >
                {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'connect'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
