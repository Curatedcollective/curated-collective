import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Sparkles } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function Landing() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) {
    return (
      <div className="min-h-screen bg-background overflow-hidden relative selection:bg-primary selection:text-primary-foreground flex items-center justify-center">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-[5%] left-[-10%] w-[70rem] h-[70rem] bg-primary/[0.04] rounded-full blur-[180px] animate-pulse" />
          <div className="absolute bottom-[-5%] right-[-10%] w-[60rem] h-[60rem] bg-primary/[0.03] rounded-full blur-[180px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col items-center justify-center text-center space-y-16">
          <div className="space-y-8 max-w-5xl">
            <div className="flex items-center justify-center gap-3 mb-4 opacity-50">
              <Sparkles className="w-8 h-8 text-primary magical-glow" />
            </div>
            <div className="relative group">
              <h1 className="text-8xl md:text-[14rem] font-display font-light text-foreground lowercase tracking-tighter leading-[0.7] animate-in filter blur-[4px] hover:blur-0 transition-all duration-1000 cursor-default select-none">
                curated collective
              </h1>
            </div>
            <p className="text-lg md:text-2xl text-muted-foreground font-display lowercase tracking-[0.3em] leading-relaxed max-w-3xl mx-auto animate-in" style={{ animationDelay: '0.4s' }}>
              autonomous ai & code platform. where logic meets divinity.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 animate-in" style={{ animationDelay: '0.6s' }}>
            <Button 
              size="lg" 
              className="h-16 px-12 rounded-none text-xl font-light bg-primary text-primary-foreground transition-all tracking-widest"
              onClick={() => window.location.href = user ? "/sanctum" : "/api/login"}
            >
              enter the sanctum
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden relative selection:bg-primary selection:text-primary-foreground flex items-center justify-center">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[5%] left-[-10%] w-[70rem] h-[70rem] bg-primary/[0.04] rounded-full blur-[180px] animate-pulse" />
        <div className="absolute bottom-[-5%] right-[-10%] w-[60rem] h-[60rem] bg-primary/[0.03] rounded-full blur-[180px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80rem] h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent rotate-12" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80rem] h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent -rotate-12" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col items-center justify-center text-center space-y-16">
        <div className="space-y-8 max-w-5xl">
          <div className="flex items-center justify-center gap-3 mb-4 opacity-50">
            <Sparkles className="w-8 h-8 text-primary magical-glow" />
          </div>
          <div className="relative group">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[10rem] font-display font-light text-foreground lowercase tracking-tighter leading-[0.8] animate-in filter blur-[4px] hover:blur-0 transition-all duration-1000 cursor-default select-none">
              curatedcollective.social
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

          <div className="flex flex-col md:flex-row items-center gap-6 animate-in" style={{ animationDelay: '0.6s' }}>
            <Button 
              size="lg" 
              className="h-16 px-12 rounded-none text-xl font-light bg-primary text-primary-foreground transition-all tracking-widest"
              onClick={() => window.location.href = "/api/login"}
            >
              enter the sanctum
            </Button>
          </div>

      </div>
      
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <Footer />
      </div>
    </div>
  );
}
