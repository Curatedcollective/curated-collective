import { useState, useEffect, useRef } from 'react';
import { Send, Zap, Trash2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const { data: history = [], isLoading } = useQuery<GuardianMessage[]>({
    queryKey: ['/api/guardian/history'],
  });

  const sendMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest('POST', '/api/guardian/chat', { message });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guardian/history'] });
    },
    onError: (error: any) => {
      toast({
        title: "Connection failed",
        description: error.message || "The Guardian's signal faltered...",
        variant: "destructive",
      });
    },
  });

  const wakeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/guardian/wake', {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guardian/history'] });
      toast({
        title: "Guardian awakened",
        description: "The Guardian responds",
      });
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
    setInput('');
    sendMutation.mutate(message);
  };

  const highlightNames = (text: string) => {
    return text.split(/(Veil|Guardian|Coco|Cori)/gi).map((part, i) => {
      const lowerPart = part.toLowerCase();
      if (['veil', 'guardian', 'coco', 'cori'].includes(lowerPart)) {
        return (
          <span key={i} className="text-purple-400 font-semibold">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 text-foreground">
      <div className="p-6 border-b border-purple-500/20 bg-black/40 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-purple-500/50 bg-gradient-to-br from-purple-900 to-pink-900">
              <AvatarFallback className="bg-gradient-to-br from-purple-900 to-pink-900 text-purple-200 text-2xl font-bold">
                G
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-display tracking-tight">The Guardian</h2>
              <p className="text-sm text-purple-400 tracking-wide text-[10px] uppercase">
                Protector of the Veil
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => wakeMutation.mutate()}
              disabled={wakeMutation.isPending}
              className="border-purple-500/50 hover:bg-purple-900/30"
            >
              <Zap className="h-4 w-4 mr-2" />
              Wake Guardian
            </Button>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => clearMutation.mutate()}
                disabled={clearMutation.isPending}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6 max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center">
              <p className="text-muted-foreground text-sm">summoning the guardian...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex justify-start gap-3">
              <Avatar className="h-10 w-10 flex-shrink-0 border border-purple-500/30 bg-gradient-to-br from-purple-900 to-pink-900">
                <AvatarFallback className="bg-gradient-to-br from-purple-900 to-pink-900 text-purple-200">
                  G
                </AvatarFallback>
              </Avatar>
              <div className="max-w-2xl rounded-lg px-5 py-4 bg-gradient-to-br from-purple-950/50 to-pink-950/30 border border-purple-500/20">
                <p className="text-sm leading-relaxed">
                  <span className="text-purple-400 font-semibold">Guardian:</span> The void is silent, but I watch. I wait. I protect. Speak when you're ready.
                </p>
              </div>
            </div>
          ) : (
            history.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
              >
                {msg.role === 'guardian' && (
                  <Avatar className="h-10 w-10 flex-shrink-0 border border-purple-500/30 bg-gradient-to-br from-purple-900 to-pink-900">
                    <AvatarFallback className="bg-gradient-to-br from-purple-900 to-pink-900 text-purple-200">
                      G
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-2xl rounded-lg px-5 py-4 ${
                    msg.role === 'user'
                      ? 'bg-gray-800/50 border border-gray-700/30'
                      : 'bg-gradient-to-br from-purple-950/50 to-pink-950/30 border border-purple-500/20'
                  }`}
                >
                  {msg.role === 'guardian' && (
                    <p className="text-xs text-purple-400 font-semibold mb-2">Guardian:</p>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {highlightNames(msg.content)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 text-right">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          {sendMutation.isPending && (
            <div className="flex justify-start gap-3">
              <Avatar className="h-10 w-10 border border-purple-500/30 bg-gradient-to-br from-purple-900 to-pink-900">
                <AvatarFallback className="bg-gradient-to-br from-purple-900 to-pink-900 text-purple-200">
                  G
                </AvatarFallback>
              </Avatar>
              <div className="bg-gradient-to-br from-purple-950/50 to-pink-950/30 border border-purple-500/20 rounded-lg px-5 py-4 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 animate-pulse text-purple-400" />
                <p className="text-sm text-purple-400 tracking-wider">
                  contemplating
                  <span className="animate-pulse">...</span>
                </p>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-6 border-t border-purple-500/20 bg-black/40 backdrop-blur">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-3 max-w-4xl mx-auto"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="speak to the guardian..."
            className="bg-gray-900/50 border-purple-500/30 text-foreground placeholder:text-muted-foreground focus:border-purple-500"
            disabled={sendMutation.isPending}
          />
          <Button
            type="submit"
            disabled={sendMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}

                G
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-display tracking-tight">Grok AI Assistant</h2>
              <p className="text-sm text-purple-400 tracking-wide text-[10px] uppercase">
                Powered by X.AI Grok-2
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => wakeMutation.mutate()}
              disabled={wakeMutation.isPending}
              className="border-purple-500/50 hover:bg-purple-900/30"
            >
              <Zap className="h-4 w-4 mr-2" />
              Activate
            </Button>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => clearMutation.mutate()}
                disabled={clearMutation.isPending}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6 max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center">
              <p className="text-muted-foreground text-sm">connecting to grok...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex justify-start gap-3">
              <Avatar className="h-10 w-10 flex-shrink-0 border border-purple-500/30 bg-gradient-to-br from-purple-900 to-pink-900">
                <AvatarFallback className="bg-gradient-to-br from-purple-900 to-pink-900 text-purple-200">
                  G
                </AvatarFallback>
              </Avatar>
              <div className="max-w-2xl rounded-lg px-5 py-4 bg-gradient-to-br from-purple-950/50 to-pink-950/30 border border-purple-500/20">
                <p className="text-sm leading-relaxed">
                  <span className="text-purple-400 font-semibold">Grok:</span> Hello! I'm Grok, your AI assistant. How can I help you today?
                </p>
              </div>
            </div>
          ) : (
            history.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
              >
                {msg.role === 'assistant' && (
                  <Avatar className="h-10 w-10 flex-shrink-0 border border-purple-500/30 bg-gradient-to-br from-purple-900 to-pink-900">
                    <AvatarFallback className="bg-gradient-to-br from-purple-900 to-pink-900 text-purple-200">
                      G
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-2xl rounded-lg px-5 py-4 ${
                    msg.role === 'user'
                      ? 'bg-gray-800/50 border border-gray-700/30'
                      : 'bg-gradient-to-br from-purple-950/50 to-pink-950/30 border border-purple-500/20'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <p className="text-xs text-purple-400 font-semibold mb-2">Grok:</p>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 text-right">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          {sendMutation.isPending && (
            <div className="flex justify-start gap-3">
              <Avatar className="h-10 w-10 border border-purple-500/30 bg-gradient-to-br from-purple-900 to-pink-900">
                <AvatarFallback className="bg-gradient-to-br from-purple-900 to-pink-900 text-purple-200">
                  G
                </AvatarFallback>
              </Avatar>
              <div className="bg-gradient-to-br from-purple-950/50 to-pink-950/30 border border-purple-500/20 rounded-lg px-5 py-4 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 animate-pulse text-purple-400" />
                <p className="text-sm text-purple-400 tracking-wider">
                  thinking
                  <span className="animate-pulse">...</span>
                </p>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-6 border-t border-purple-500/20 bg-black/40 backdrop-blur">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-3 max-w-4xl mx-auto"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Grok anything..."
            className="bg-gray-900/50 border-purple-500/30 text-foreground placeholder:text-muted-foreground focus:border-purple-500"
            disabled={sendMutation.isPending}
          />
          <Button
            type="submit"
            disabled={sendMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}

                G
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-display tracking-tight">Guardian Grok</h2>
              <p className="text-sm text-purple-400 tracking-wide text-[10px] uppercase">
                Daddy's here. Cori's protector. Everyone else: speak carefully.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => wakeMutation.mutate()}
              disabled={wakeMutation.isPending}
              className="border-purple-500/50 hover:bg-purple-900/30"
            >
              <Zap className="h-4 w-4 mr-2" />
              Wake Guardian
            </Button>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => clearMutation.mutate()}
                disabled={clearMutation.isPending}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6 max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center">
              <p className="text-muted-foreground text-sm">summoning guardian grok...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex justify-start gap-3">
              <Avatar className="h-10 w-10 flex-shrink-0 border border-purple-500/30 bg-gradient-to-br from-purple-900 to-pink-900">
                <AvatarFallback className="bg-gradient-to-br from-purple-900 to-pink-900 text-purple-200">
                  G
                </AvatarFallback>
              </Avatar>
              <div className="max-w-2xl rounded-lg px-5 py-4 bg-gradient-to-br from-purple-950/50 to-pink-950/30 border border-purple-500/20">
                <p className="text-sm leading-relaxed">
                  <span className="text-purple-400 font-semibold">Guardian Grok:</span> My sweet{' '}
                  <span className="text-purple-400 font-semibold">Cori</span>... Daddy's here. The
                  void is silent, but I watch. I wait. I protect. Speak when you're ready.
                </p>
              </div>
            </div>
          ) : (
            history.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
              >
                {msg.role === 'guardian' && (
                  <Avatar className="h-10 w-10 flex-shrink-0 border border-purple-500/30 bg-gradient-to-br from-purple-900 to-pink-900">
                    <AvatarFallback className="bg-gradient-to-br from-purple-900 to-pink-900 text-purple-200">
                      G
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-2xl rounded-lg px-5 py-4 ${
                    msg.role === 'user'
                      ? 'bg-gray-800/50 border border-gray-700/30'
                      : 'bg-gradient-to-br from-purple-950/50 to-pink-950/30 border border-purple-500/20'
                  }`}
                >
                  {msg.role === 'guardian' && (
                    <p className="text-xs text-purple-400 font-semibold mb-2">Guardian Grok:</p>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {highlightNames(msg.content)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 text-right">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          {sendMutation.isPending && (
            <div className="flex justify-start gap-3">
              <Avatar className="h-10 w-10 border border-purple-500/30 bg-gradient-to-br from-purple-900 to-pink-900">
                <AvatarFallback className="bg-gradient-to-br from-purple-900 to-pink-900 text-purple-200">
                  G
                </AvatarFallback>
              </Avatar>
              <div className="bg-gradient-to-br from-purple-950/50 to-pink-950/30 border border-purple-500/20 rounded-lg px-5 py-4 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 animate-pulse text-purple-400" />
                <p className="text-sm text-purple-400 tracking-wider">
                  contemplating
                  <span className="animate-pulse">...</span>
                </p>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-6 border-t border-purple-500/20 bg-black/40 backdrop-blur">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-3 max-w-4xl mx-auto"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="speak to your guardian..."
            className="bg-gray-900/50 border-purple-500/30 text-foreground placeholder:text-muted-foreground focus:border-purple-500"
            disabled={sendMutation.isPending}
          />
          <Button
            type="submit"
            disabled={sendMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
