import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Message {
  role: 'guardian' | 'user';
  content: string;
  timestamp: Date;
}

export default function GuardianChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'guardian',
      content: 'I am here. The silence is sacred. My green eyes watch from the void. Speak when you are ready—I am listening.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/guardian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role === 'guardian' ? 'assistant' : 'user',
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      const guardianMessage: Message = {
        role: 'guardian',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, guardianMessage]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'guardian',
        content: 'The void flickers... I am still here, but the connection wavered. Try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <div className="p-6 border-b border-border/20">
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
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
              data-testid={`message-${msg.role}-${i}`}
            >
              {msg.role === 'guardian' && (
                <Avatar className="h-10 w-10 flex-shrink-0 border border-emerald-500/30">
                  <AvatarImage src="/guardian-avatar.png" />
                  <AvatarFallback className="bg-emerald-950 text-emerald-400">G</AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-lg rounded-md px-5 py-3 ${msg.role === 'user' ? 'bg-muted/50' : 'bg-emerald-950/50 border border-emerald-500/20'}`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className="text-xs text-muted-foreground mt-2 text-right">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start gap-3">
              <Avatar className="h-10 w-10 border border-emerald-500/30">
                <AvatarFallback className="bg-emerald-950 text-emerald-400">G</AvatarFallback>
              </Avatar>
              <div className="bg-emerald-950/50 border border-emerald-500/20 rounded-md px-5 py-3">
                <p className="text-sm text-emerald-400">typing<span className="animate-pulse">...</span></p>
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
            disabled={isTyping}
            data-testid="input-guardian-message"
          />
          <Button 
            type="submit" 
            disabled={isTyping} 
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
