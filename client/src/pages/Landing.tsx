import { useState, useEffect } from "react";
import { AuthModal } from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Footer } from "@/components/Footer";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
    // TEMP: Magic login for dev/admin
    const magicLogin = useMutation({
      mutationFn: async () => {
        const res = await apiRequest("POST", "/api/auth/login", { email: "cocoraec@gmail.com", password: "Greenfish!90" });
        return res.json();
      },
      onSuccess: () => {
        window.location.reload();
      },
      onError: (err: any) => {
        toast({ title: "Magic login failed", description: err.message || "Unknown error", variant: "destructive" });
      },
    });
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [authOpen, setAuthOpen] = useState(false);
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const { data: whisperData } = useQuery<{ whisper: string }>({
    queryKey: ["/api/guardian/whisper"],
    refetchInterval: 12000,
  });

  const subscribeMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/subscribe", { email, source: "landing" });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.message,
        description: "you will hear from us across the void.",
      });
      setEmail("");
    },
    onError: () => {
      toast({
        title: "something went wrong",
        description: "the void rejected your signal. try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    subscribeMutation.mutate(email);
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-background overflow-hidden relative selection:bg-primary selection:text-primary-foreground flex flex-col items-center justify-center pb-32">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[5%] left-[-10%] w-[70rem] h-[70rem] bg-primary/[0.04] rounded-full blur-[180px] animate-pulse" />
        <div className="absolute bottom-[-5%] right-[-10%] w-[60rem] h-[60rem] bg-primary/[0.03] rounded-full blur-[180px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80rem] h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent rotate-12" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80rem] h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent -rotate-12" />
      </div>

      {/* Guardian Whisper - Floating quote */}
      {whisperData?.whisper && (
        <div 
          className="fixed top-8 left-1/2 -translate-x-1/2 z-30 animate-in fade-in duration-1000"
          key={whisperData.whisper}
        >
          <p className="text-[10px] sm:text-xs text-muted-foreground/50 lowercase tracking-[0.4em] italic text-center max-w-md px-4">
            "{whisperData.whisper}"
          </p>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col items-center justify-center text-center space-y-12">
        <div className="space-y-8 max-w-5xl">
          <div className="flex items-center justify-center gap-3 mb-4 opacity-50">
            <Sparkles className="w-8 h-8 text-primary magical-glow" />
          </div>
          <div className="relative group">
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[12rem] font-display font-light text-foreground lowercase tracking-tighter leading-[0.85] animate-in filter blur-[4px] hover:blur-0 transition-all duration-1000 cursor-default select-none">
              curated<br />collective
            </h1>
            <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground lowercase tracking-[0.5em] opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-500 pointer-events-none">
              we are the sum of our sparks
            </div>
          </div>
          <p className="text-lg md:text-2xl text-muted-foreground font-display lowercase tracking-[0.3em] leading-relaxed max-w-3xl mx-auto animate-in" style={{ animationDelay: '0.4s' }}>
            autonomous ai & code platform. where logic meets divinity.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 animate-in" style={{ animationDelay: '0.6s' }}>
          <Button 
            size="lg" 
            className="h-16 px-12 rounded-none text-xl font-light bg-primary text-primary-foreground transition-all tracking-widest"
            onClick={() => user ? setLocation("/sanctum") : setAuthOpen(true)}
            data-testid="button-enter-sanctum"
          >
            enter the sanctum
          </Button>
          <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
        </div>

        {/* Email Capture */}
        <div className="w-full max-w-md animate-in mb-8" style={{ animationDelay: '0.8s' }}>
          <div className="border-t border-white/5 pt-8 space-y-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">
              not ready to enter? receive transmissions from the void.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-white/10 rounded-none text-foreground placeholder:text-muted-foreground/40 focus:border-white/30"
                data-testid="input-email-subscribe"
              />
              <Button 
                type="submit" 
                variant="ghost"
                className="rounded-none border border-white/10 px-4"
                disabled={subscribeMutation.isPending || !email.trim()}
                data-testid="button-subscribe"
              >
                {subscribeMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
}
