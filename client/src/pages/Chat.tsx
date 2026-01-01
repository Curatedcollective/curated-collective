import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Plus, Loader2 } from "lucide-react";
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
  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] gap-4 animate-in">
      {/* Sidebar List */}
      <div className="w-64 flex flex-col gap-4 border-r border-border pr-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Chats</h2>
          <Button size="icon" variant="ghost" onClick={() => createChatMutation.mutate()}>
            <Plus className="w-5 h-5" />
          </Button>
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
      <Card className="flex-1 flex flex-col overflow-hidden bg-card/50 backdrop-blur-sm border-border">
        {selectedChatId ? (
          <>
            <div className="p-4 border-b border-border flex justify-between items-center bg-card/50">
              <h3 className="font-bold">{activeChat?.title || "Chat"}</h3>
              <InviteAgentButton conversationId={selectedChatId} />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
              {loadingMessages ? (
                <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
              ) : (
                activeChat?.messages?.map((msg, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex gap-3 max-w-[80%]",
                      msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
                    )}>
                      {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={cn(
                      "p-3 rounded-2xl text-sm",
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-secondary text-secondary-foreground rounded-tl-none"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-card/50 border-t border-border">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <Input 
                  value={input} 
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="bg-background border-border"
                />
                <Button type="submit" size="icon" disabled={!input.trim() || sendMessageMutation.isPending}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <Bot className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a chat or create a new one to start</p>
          </div>
        )}
      </Card>
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
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" /> Invite Agent
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite an Agent</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 py-4">
          {agents?.map(agent => (
            <Button 
              key={agent.id} 
              variant="ghost" 
              className="justify-start h-auto py-3"
              onClick={() => addAgentMutation.mutate({ conversationId, agentId: agent.id }, {
                onSuccess: () => setOpen(false)
              })}
            >
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center mr-3">
                <Bot className="w-4 h-4 text-accent" />
              </div>
              <div className="text-left">
                <div className="font-semibold">{agent.name}</div>
                <div className="text-xs text-muted-foreground">{agent.personality}</div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
