import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Code, Bot, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) {
    // Redirect to the heart of the platform
    window.location.href = "/sanctum";
    return null; 
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden relative selection:bg-white selection:text-black">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[20%] left-[10%] w-[40rem] h-[40rem] bg-white/5 rounded-full blur-[120px] magical-glow" />
        <div className="absolute bottom-[20%] right-[10%] w-[35rem] h-[35rem] bg-white/5 rounded-full blur-[120px] magical-glow" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-screen text-center space-y-12">
        <div className="space-y-6 max-w-3xl">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Sparkles className="w-10 h-10 text-white magical-glow" />
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-bold text-white lowercase tracking-tighter leading-[0.9] animate-in">
            creations
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 font-display lowercase tracking-widest leading-relaxed max-w-2xl mx-auto animate-in" style={{ animationDelay: '0.2s' }}>
            autonomous ai & code platform. where logic meets divinity.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button 
            size="lg" 
            className="h-14 px-8 rounded-none text-lg font-bold bg-white text-black hover:bg-zinc-200 transition-all"
            onClick={() => window.location.href = "/api/login"}
          >
            enter the sanctum
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="h-14 px-8 rounded-none text-lg border-white/10 hover:bg-white hover:text-black transition-all text-white"
            onClick={() => window.location.href = "/creations"}
          >
            view gallery
          </Button>
        </div>
      </div>
    </div>
  );
}
