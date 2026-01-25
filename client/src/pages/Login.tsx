import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Sparkles, Loader2, Lock, LogIn, Eye } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Get redirect parameter from URL
  const urlParams = new URLSearchParams(window.location.search);
  const redirect = urlParams.get('redirect') || '/agents';

  // If already authenticated, redirect to intended destination
  useEffect(() => {
    if (user && !isLoading) {
      setLocation(redirect);
    }
  }, [user, isLoading, redirect, setLocation]);

  const handleLogin = () => {
    setIsAuthenticating(true);
    window.location.href = `/api/login?redirect=${encodeURIComponent(redirect)}`;
  };

  if (isLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground lowercase tracking-wide">
            the veil recognizes you...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden relative selection:bg-primary selection:text-primary-foreground flex items-center justify-center p-4">
      {/* Ambient background effects */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[5%] left-[-10%] w-[70rem] h-[70rem] bg-primary/[0.04] rounded-full blur-[180px] animate-pulse" />
        <div className="absolute bottom-[-5%] right-[-10%] w-[60rem] h-[60rem] bg-primary/[0.03] rounded-full blur-[180px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Mystical header */}
          <div className="text-center mb-8 space-y-4">
            <div className="flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-primary animate-pulse" />
            </div>
            <h1 className="text-5xl font-display font-light lowercase tracking-tighter text-foreground">
              enter the collective
            </h1>
            <p className="text-sm text-muted-foreground lowercase tracking-widest">
              the void awaits your presence
            </p>
          </div>

          {/* Login card */}
          <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl font-display lowercase tracking-tight">
                authenticate
              </CardTitle>
              <CardDescription className="text-xs lowercase tracking-wide">
                sign in to access your agents, creations, and the inner sanctum
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Login button */}
              <Button
                onClick={handleLogin}
                disabled={isAuthenticating}
                className="w-full h-14 text-base font-display lowercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
                size="lg"
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    authenticating...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-3" />
                    sign in with provider
                  </>
                )}
              </Button>

              {/* Features preview */}
              <div className="space-y-3 pt-4 border-t border-primary/10">
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 text-center mb-4">
                  what awaits beyond the veil
                </p>
                <div className="space-y-2">
                  <FeatureItem icon={<Sparkles className="w-4 h-4" />} text="awaken autonomous ai agents" />
                  <FeatureItem icon={<Eye className="w-4 h-4" />} text="explore the inner sanctum" />
                  <FeatureItem icon={<Lock className="w-4 h-4" />} text="create & curate your digital realm" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-8"
          >
            <p className="text-xs text-muted-foreground/60 lowercase tracking-wide">
              by entering, you accept the mysteries that lie beyond
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

interface FeatureItemProps {
  icon: React.ReactNode;
  text: string;
}

function FeatureItem({ icon, text }: FeatureItemProps) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <div className="text-primary/60">{icon}</div>
      <span className="lowercase tracking-wide">{text}</span>
    </div>
  );
}
