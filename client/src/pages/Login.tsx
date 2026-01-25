import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Sparkles, Loader2, Lock, LogIn, Eye, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const { toast } = useToast();
  
  // Get redirect parameter from URL
  const urlParams = new URLSearchParams(window.location.search);
  const redirect = urlParams.get('redirect') || '/agents';

  // If already authenticated, redirect to intended destination
  useEffect(() => {
    if (user && !isLoading) {
      setLocation(redirect);
    }
  }, [user, isLoading, redirect, setLocation]);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsAuthenticating(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Welcome back!",
          description: "Successfully authenticated",
        });
        // Reload to get updated user session
        window.location.href = data.redirect || redirect;
      } else {
        const error = await response.json();
        toast({
          title: "Authentication failed",
          description: error.message || "Invalid credentials",
          variant: "destructive"
        });
        setIsAuthenticating(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Failed to authenticate. Please try again.",
        variant: "destructive"
      });
      setIsAuthenticating(false);
    }
  };

  const handleSignup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsAuthenticating(true);

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Welcome!",
          description: data.message || "Account created successfully",
        });
        // Reload to get updated user session
        window.location.href = redirect;
      } else {
        const error = await response.json();
        toast({
          title: "Signup failed",
          description: error.message || "Could not create account",
          variant: "destructive"
        });
        setIsAuthenticating(false);
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive"
      });
      setIsAuthenticating(false);
    }
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
                {mode === 'login' ? 'authenticate' : 'join the collective'}
              </CardTitle>
              <CardDescription className="text-xs lowercase tracking-wide">
                {mode === 'login' 
                  ? 'sign in to access your agents, creations, and the inner sanctum'
                  : 'create your account and begin your journey'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
                {mode === 'signup' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-xs lowercase tracking-wide">first name</Label>
                        <Input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="bg-background/50 border-primary/20"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-xs lowercase tracking-wide">last name</Label>
                        <Input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="bg-background/50 border-primary/20"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs lowercase tracking-wide">email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-background/50 border-primary/20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs lowercase tracking-wide">password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-background/50 border-primary/20"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full h-14 text-base font-display lowercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
                  size="lg"
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      {mode === 'login' ? 'authenticating...' : 'creating account...'}
                    </>
                  ) : (
                    <>
                      {mode === 'login' ? (
                        <>
                          <LogIn className="w-5 h-5 mr-3" />
                          sign in
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5 mr-3" />
                          create account
                        </>
                      )}
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors lowercase tracking-wide"
                  >
                    {mode === 'login' ? "don't have an account? sign up" : 'already have an account? sign in'}
                  </button>
                </div>

                {/* Demo credentials hint */}
                <div className="pt-4 border-t border-primary/10">
                  <p className="text-[10px] text-muted-foreground/60 text-center lowercase tracking-wide">
                    demo credentials: demo@example.com / demo123
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 text-center lowercase tracking-wide mt-1">
                    owner access: curated.collectiveai@proton.me / demo123
                  </p>
                </div>
              </form>

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
