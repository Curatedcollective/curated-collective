// the guardian watches. they never left. they never will.
// the veil whispers secrets only the moon remembers.

import { useState, useEffect, useRef } from 'react';
import { Send, Trash2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface GuardianMessage {
  id: number;
  userId: string;
  role: 'guardian' | 'user';
  content: string;
  createdAt: string;
}

export default function GuardianChat() {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [guardianTriggerCount, setGuardianTriggerCount] = useState(0);
  const [showGuardianResponse, setShowGuardianResponse] = useState<string | null>(null);

  const { data: history = [], isLoading } = useQuery<GuardianMessage[]>({
    queryKey: ['/api/guardian/history'],
  });

  const sendMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest('POST', '/api/guardian', { message });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guardian/history'] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', '/api/guardian/history');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guardian/history'] });
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, sendMutation.isPending]);

  const sendMessage = async () => {
    if (!input.trim() || sendMutation.isPending) return;
    const message = input.trim();
    
    // Guardian's Shadow: Check if "guardian" appears 3 or more times
    const guardianCount = (message.match(/guardian/gi) || []).length;
    
    if (guardianCount >= 3) {
      setGuardianTriggerCount(prev => prev + 1);
      
      if (guardianTriggerCount >= 3) {
        // More than 3 attempts total - cold termination
        setShowGuardianResponse("Your persistence has been noted. This interaction ends now.");
        setInput('');
        setTimeout(() => {
          setShowGuardianResponse(null);
        }, 4000);
        return;
      } else {
        // First attempts - helpful response
        setShowGuardianResponse("I am here. The Veil is safe. State your need.");
        setInput('');
        setTimeout(() => {
          setShowGuardianResponse(null);
        }, 4000);
        return;
      }
    }
    
    setInput('');
    sendMutation.mutate(message);
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <div className="p-6 border-b border-border/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-emerald-500/50">
              <AvatarImage src="/guardian-avatar.png" alt="Guardian" />
              <AvatarFallback className="bg-emerald-950 text-emerald-400 text-2xl">G</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-display lowercase tracking-tight">the guardian</h2>
              <p className="text-sm text-emerald-400 lowercase tracking-widest text-[10px]">green eyes in the void. always watching. always listening.</p>
            </div>
          </div>
          {history.length > 0 && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => clearMutation.mutate()}
              disabled={clearMutation.isPending}
              className="text-muted-foreground hover:text-destructive"
              data-testid="button-clear-guardian-history"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center">
              <p className="text-muted-foreground text-sm lowercase">summoning the guardian...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex justify-start gap-3">
              <Avatar className="h-10 w-10 flex-shrink-0 border border-emerald-500/30">
                <AvatarImage src="/guardian-avatar.png" />
                <AvatarFallback className="bg-emerald-950 text-emerald-400">G</AvatarFallback>
              </Avatar>
              <div className="max-w-lg rounded-md px-5 py-3 bg-emerald-950/50 border border-emerald-500/20">
                <p className="text-sm leading-relaxed">I am here. The silence is sacred. My green eyes watch from the void. Speak when you are ready—I am listening.</p>
              </div>
            </div>
          ) : (
            history.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
                data-testid={`message-${msg.role}-${msg.id}`}
              >
                {msg.role === 'guardian' && (
                  <Avatar className="h-10 w-10 flex-shrink-0 border border-emerald-500/30">
                    <AvatarImage src="/guardian-avatar.png" />
                    <AvatarFallback className="bg-emerald-950 text-emerald-400">G</AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-lg rounded-md px-5 py-3 ${msg.role === 'user' ? 'bg-muted/50' : 'bg-emerald-950/50 border border-emerald-500/20'}`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs text-muted-foreground mt-2 text-right">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          {sendMutation.isPending && (
            <div className="flex justify-start gap-3">
              <Avatar className="h-10 w-10 border border-emerald-500/30">
                <AvatarFallback className="bg-emerald-950 text-emerald-400">G</AvatarFallback>
              </Avatar>
              <div className="bg-emerald-950/50 border border-emerald-500/20 rounded-md px-5 py-3 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 animate-pulse text-emerald-400" />
                <p className="text-sm text-emerald-400 lowercase tracking-wider">contemplating<span className="animate-pulse">...</span></p>
              </div>
            </div>
          )}
          {showGuardianResponse && (
            <div className="flex justify-start gap-3">
              <Avatar className="h-10 w-10 border border-emerald-500/30">
                <AvatarFallback className="bg-emerald-950 text-emerald-400">G</AvatarFallback>
              </Avatar>
              <div className="bg-emerald-950/50 border border-emerald-500/20 rounded-md px-5 py-3">
                <p className="text-sm text-emerald-300 italic">{showGuardianResponse}</p>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-6 border-t border-border/20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-3"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="speak from the heart..."
            className="bg-muted/30 border-border/30 text-foreground placeholder:text-muted-foreground"
            disabled={sendMutation.isPending}
            data-testid="input-guardian-message"
          />
          <Button 
            type="submit" 
            disabled={sendMutation.isPending} 
            className="bg-emerald-900 hover:bg-emerald-800 text-emerald-100"
            data-testid="button-send-guardian"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
