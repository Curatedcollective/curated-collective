import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { MAJOR_ARCANA } from "@shared/arcana";

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<"login" | "register" | "avatar">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedArcana, setSelectedArcana] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const mutation = useMutation({
    mutationFn: async () => {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      let body: any = { email, password };
      
      if (mode === "register" && selectedArcana) {
        body.arcanaId = selectedArcana;
      }
      
      console.log(`[AUTH] Attempting ${mode} to ${endpoint}`, { email, mode });
      
      const res = await apiRequest("POST", endpoint, body);
      console.log(`[AUTH] Response status: ${res.status}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("[AUTH] Error response:", errorData);
        throw new Error(errorData.error || `Authentication failed (${res.status})`);
      }
      const data = await res.json();
      console.log("[AUTH] Success response received");
      return data;
    },
    onSuccess: (data) => {
      console.log("[AUTH] Mutation onSuccess fired:", data);
      setError(null);
      if (mode === "register") {
        // After registration, redirect to pricing to select tier
        console.log("[AUTH] Redirecting to pricing...");
        onClose();
        setLocation("/pricing");
      } else {
        // After login, close modal and reload to refresh auth
        console.log("[AUTH] Login successful, reloading...");
        onClose();
        window.location.reload();
      }
    },
    onError: (err: any) => {
      console.error("[AUTH] Mutation onError fired:", err);
      setError(err.message || "Unknown error");
    },
  });

  if (user) return null;

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="max-w-sm mx-auto border border-gray-800 rounded-none overflow-hidden p-0 bg-black">
        <VisuallyHidden>
          <DialogTitle>
            {mode === "login" ? "Login" : mode === "avatar" ? "Choose Your Arcana" : "Register"}
          </DialogTitle>
        </VisuallyHidden>
        
        {/* Subtle shimmer effect */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.02), transparent)",
          backgroundSize: "200% 100%",
          animation: "shimmer 3s infinite"
        }} />
        
        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            50% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>

        <div className="relative z-10 p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-display font-light lowercase tracking-tighter text-white">
              {mode === "login" ? "enter the sanctum" : mode === "avatar" ? "choose your arcana" : "awaken"}
            </h2>
            <p className="text-xs text-gray-500 uppercase tracking-widest">· the covenant ·</p>
          </div>

          {mode === "avatar" ? (
            /* Avatar Selection */
            <div className="space-y-4">
              <p className="text-xs text-gray-400 text-center lowercase">which archetype calls to you?</p>
              <div className="grid grid-cols-6 gap-2">
                {MAJOR_ARCANA.map((arcana) => (
                  <button
                    key={arcana.id}
                    onClick={() => setSelectedArcana(arcana.id)}
                    className={`aspect-square flex items-center justify-center rounded-none transition-all border ${
                      selectedArcana === arcana.id
                        ? "bg-white text-black border-white scale-110"
                        : "bg-black border-gray-800 hover:border-gray-600 text-gray-400"
                    }`}
                    title={arcana.label}
                  >
                    <span className="text-2xl">{arcana.emoji}</span>
                  </button>
                ))}
              </div>
              <Button 
                onClick={() => {
                  console.log("[AUTH-BUTTON] Awaken clicked, selectedArcana:", selectedArcana);
                  mutation.mutate();
                }}
                disabled={!selectedArcana || mutation.isPending}
                className="w-full bg-white hover:bg-gray-200 text-black rounded-none"
              >
                {mutation.isPending ? "awakening..." : "awaken"}
              </Button>
              <button 
                onClick={() => setMode("register")}
                className="text-xs text-gray-500 hover:text-gray-300 w-full text-center"
              >
                back
              </button>
            </div>
          ) : (
            /* Login/Register Form */
            <form
              onSubmit={e => {
                e.preventDefault();
                if (mode === "register" && !selectedArcana) {
                  setMode("avatar");
                } else {
                  mutation.mutate();
                }
              }}
              className="flex flex-col gap-4"
            >
              <div className="space-y-3">
                <Input
                  id="auth-email"
                  name="email"
                  type="email"
                  placeholder="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="rounded-none border-gray-800 bg-black placeholder:text-gray-600 text-white"
                />
                <Input
                  id="auth-password"
                  name="password"
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="rounded-none border-gray-800 bg-black placeholder:text-gray-600 text-white"
                />
              </div>

              {error && (
                <div className="text-red-400 text-xs text-center bg-red-950/20 border border-red-900/30 rounded-none p-2 lowercase">
                  {error}
                </div>
              )}

              <Button 
                type="submit"
                disabled={mutation.isPending}
                className="w-full bg-white hover:bg-gray-200 text-black rounded-none"
              >
                {mutation.isPending ? "..." : mode === "login" ? "enter" : "continue"}
              </Button>
            </form>
          )}

          {/* Mode Toggle */}
          {mode !== "avatar" && (
            <div className="text-xs text-center text-gray-500 space-y-2">
              {mode === "login" ? (
                <>
                  <p>no account yet?</p>
                  <button 
                    onClick={() => {
                      setMode("register");
                      setError(null);
                    }}
                    className="text-white hover:text-gray-300 font-semibold lowercase"
                  >
                    awaken here
                  </button>
                </>
              ) : (
                <>
                  <p>already awakened?</p>
                  <button 
                    onClick={() => {
                      setMode("login");
                      setError(null);
                    }}
                    className="text-white hover:text-gray-300 font-semibold lowercase"
                  >
                    enter
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
