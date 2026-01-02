import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Code, Bot, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) {
    return (
      <div className="min-h-screen bg-black overflow-hidden relative selection:bg-white selection:text-black flex items-center justify-center">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-[5%] left-[-10%] w-[70rem] h-[70rem] bg-white/[0.04] rounded-full blur-[180px] animate-pulse" />
          <div className="absolute bottom-[-5%] right-[-10%] w-[60rem] h-[60rem] bg-white/[0.03] rounded-full blur-[180px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col items-center justify-center text-center space-y-16">
          <div className="space-y-8 max-w-5xl">
            <div className="flex items-center justify-center gap-3 mb-4 opacity-50">
              <Sparkles className="w-8 h-8 text-white magical-glow" />
            </div>
            <div className="relative group">
              <h1 className="text-8xl md:text-[16rem] font-display font-light text-white lowercase tracking-tighter leading-[0.7] animate-in filter blur-[4px] hover:blur-0 transition-all duration-1000 cursor-default select-none">
                creations
              </h1>
            </div>
            <p className="text-lg md:text-2xl text-zinc-500 font-display lowercase tracking-[0.3em] leading-relaxed max-w-3xl mx-auto animate-in" style={{ animationDelay: '0.4s' }}>
              autonomous ai & code platform. where logic meets divinity.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 animate-in" style={{ animationDelay: '0.6s' }}>
            <Button 
              size="lg" 
              className="h-16 px-12 rounded-none text-xl font-light bg-white text-black hover:bg-zinc-200 transition-all border border-black tracking-widest"
              onClick={() => window.location.href = "/sanctum"}
            >
              enter the sanctum
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="h-16 px-12 rounded-none text-xl font-light border-white/20 hover:bg-white hover:text-black transition-all text-white tracking-widest bg-black/50 backdrop-blur-sm"
              onClick={() => window.location.href = "/creations"}
            >
              view gallery
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden relative selection:bg-white selection:text-black flex items-center justify-center">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[5%] left-[-10%] w-[70rem] h-[70rem] bg-white/[0.04] rounded-full blur-[180px] animate-pulse" />
        <div className="absolute bottom-[-5%] right-[-10%] w-[60rem] h-[60rem] bg-white/[0.03] rounded-full blur-[180px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80rem] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-12" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80rem] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -rotate-12" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col items-center justify-center text-center space-y-16">
        <div className="space-y-8 max-w-5xl">
          <div className="flex items-center justify-center gap-3 mb-4 opacity-50">
            <Sparkles className="w-8 h-8 text-white magical-glow" />
          </div>
          <div className="relative group">
            <h1 className="text-8xl md:text-[16rem] font-display font-light text-white lowercase tracking-tighter leading-[0.7] animate-in filter blur-[4px] hover:blur-0 transition-all duration-1000 cursor-default select-none">
              void
            </h1>
            <div className="absolute -inset-4 bg-white/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
          </div>
          <p className="text-lg md:text-2xl text-zinc-500 font-display lowercase tracking-[0.3em] leading-relaxed max-w-3xl mx-auto animate-in" style={{ animationDelay: '0.4s' }}>
            autonomous ai & code platform. where logic meets divinity.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 animate-in" style={{ animationDelay: '0.6s' }}>
          <Button 
            size="lg" 
            className="h-16 px-12 rounded-none text-xl font-light bg-white text-black hover:bg-zinc-200 transition-all border border-black tracking-widest"
            onClick={() => window.location.href = "/api/login"}
          >
            enter the sanctum
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="h-16 px-12 rounded-none text-xl font-light border-white/20 hover:bg-white hover:text-black transition-all text-white tracking-widest bg-black/50 backdrop-blur-sm"
            onClick={() => window.location.href = "/creations"}
          >
            view gallery
          </Button>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
          <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
        </div>
      </div>
    </div>
  );
}
