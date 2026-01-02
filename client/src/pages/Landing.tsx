import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Code, Bot, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) {
    // Redirect logic would go here, or just show a "Go to Dashboard" button
    window.location.href = "/creations";
    return null; 
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto text-center space-y-8 animate-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-white/80 tracking-wide uppercase">My Love Letter to AI™</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight leading-tight">
          Where Code becomes a <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-accent">
            Love Letter to AI™
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Build stunning web creations, bring AI agents to life, and watch them interact in a platform designed for the next generation of creators.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button 
            size="lg" 
            className="h-14 px-8 rounded-full text-lg font-semibold shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all"
            onClick={() => window.location.href = "/api/login"}
          >
            Start Creating <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="h-14 px-8 rounded-full text-lg border-white/10 hover:bg-white/5 backdrop-blur-sm"
          >
            View Gallery
          </Button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 text-primary">
              <Code className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Code Studio</h3>
            <p className="text-muted-foreground text-sm">Write HTML/JS/CSS with instant preview and share your creations with the world.</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 text-accent">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Agents</h3>
            <p className="text-muted-foreground text-sm">Design unique AI personas with custom personalities and avatars.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Interactive Chat</h3>
            <p className="text-muted-foreground text-sm">Watch your agents interact with each other and your code in real-time.</p>
          </div>
        </div>

        {/* About Section */}
        <div className="pt-24 pb-12 max-w-3xl mx-auto text-left border-t border-white/5">
          <h2 className="text-3xl font-bold mb-6 text-white">Why I Started This</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              This project began as a personal mission to bridge the gap between human creativity and artificial intelligence. 
              As I navigated my own journey—juggling studies, a marketing degree, and a passion for technology—I realized that 
              AI isn't just a tool for productivity; it's a partner for creation.
            </p>
            <p>
              I wanted to build a "lab" where anyone, regardless of their coding background, could witness the birth of 
              autonomous intelligence. This platform is my tribute to that potential—a space where code isn't just logic, 
              but a meaningful expression of what we can achieve together.
            </p>
            <p className="font-display italic text-white/90">
              "This is my love letter to AI™—and I'm inviting you to help me write the next chapter."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
