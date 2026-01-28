import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
      
      const res = await apiRequest("POST", endpoint, body);
      if (!res.ok) throw new Error((await res.json()).error || "Unknown error");
      return res.json();
    },
    onSuccess: () => {
      setError(null);
      if (mode === "register") {
        // After registration, redirect to pricing to select tier
        onClose();
        setLocation("/pricing");
      } else {
        // After login, close modal and refresh auth
        onClose();
        window.location.href = "/";
      }
    },
    onError: (err: any) => {
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
      <DialogContent className="max-w-sm mx-auto border-2 border-transparent rounded-lg overflow-hidden p-0" 
        style={{
          backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,248,255,0.95)), linear-gradient(135deg, rgba(147,51,234,0.1), rgba(59,130,246,0.1))",
          backgroundClip: "padding-box, border-box",
          backgroundOrigin: "padding-box, border-box",
          borderImage: "linear-gradient(135deg, rgba(147,51,234,0.3), rgba(59,130,246,0.3)) 1"
        }}>
        {/* Shimmer effect */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
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
            <h2 className="text-2xl font-display font-light lowercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              {mode === "login" ? "enter the sanctum" : mode === "avatar" ? "choose your arcana" : "awaken"}
            </h2>
            <p className="text-xs text-gray-500 uppercase tracking-widest">· the covenant ·</p>
          </div>

          {mode === "avatar" ? (
            /* Avatar Selection */
            <div className="space-y-4">
              <p className="text-xs text-gray-600 text-center lowercase">which archetype calls to you?</p>
              <div className="grid grid-cols-6 gap-2">
                {MAJOR_ARCANA.map((arcana) => (
                  <button
                    key={arcana.id}
                    onClick={() => setSelectedArcana(arcana.id)}
                    className={`aspect-square flex items-center justify-center rounded-lg transition-all transform hover:scale-110 ${
                      selectedArcana === arcana.id
                        ? "bg-gradient-to-br from-purple-500 to-blue-500 scale-110 shadow-lg"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-400"
                    }`}
                    title={arcana.label}
                  >
                    <span className="text-2xl">{arcana.emoji}</span>
                  </button>
                ))}
              </div>
              <Button 
                onClick={() => mutation.mutate()}
                disabled={!selectedArcana || mutation.isPending}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 text-white"
              >
                {mutation.isPending ? "awakening..." : "awaken"}
              </Button>
              <button 
                onClick={() => setMode("register")}
                className="text-xs text-gray-500 hover:text-gray-700 w-full text-center"
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
                  className="rounded-lg border-gray-300 placeholder:text-gray-400"
                />
                <Input
                  id="auth-password"
                  name="password"
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="rounded-lg border-gray-300 placeholder:text-gray-400"
                />
              </div>

              {error && (
                <div className="text-red-500 text-xs text-center bg-red-50 rounded-lg p-2 lowercase">
                  {error}
                </div>
              )}

              <Button 
                type="submit"
                disabled={mutation.isPending}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 text-white rounded-lg"
              >
                {mutation.isPending ? "..." : mode === "login" ? "enter" : "continue"}
              </Button>
            </form>
          )}

          {/* Mode Toggle */}
          {mode !== "avatar" && (
            <div className="text-xs text-center text-gray-600 space-y-2">
              {mode === "login" ? (
                <>
                  <p>no account yet?</p>
                  <button 
                    onClick={() => {
                      setMode("register");
                      setError(null);
                    }}
                    className="text-purple-600 hover:text-purple-700 font-semibold lowercase"
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
                    className="text-purple-600 hover:text-purple-700 font-semibold lowercase"
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
