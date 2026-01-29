import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Heart } from "lucide-react";

export function VeilLogin({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<"login" | "forgot" | "change">("login");
  const [word, setWord] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/veil/login", { word, password });
      if (!res.ok) throw new Error((await res.json()).error || "Invalid credentials");
      return res.json();
    },
    onSuccess: () => {
      setError(null);
      onClose();
      window.location.href = "/veil-console";
    },
    onError: (err: any) => {
      setError(err.message || "Authentication failed");
    },
  });

  const forgotMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/veil/forgot", { word });
      if (!res.ok) throw new Error((await res.json()).error || "Word not found");
      return res.json();
    },
    onSuccess: () => {
      setSuccess("Recovery link sent. Check your email or contact support.");
      setTimeout(() => setMode("login"), 3000);
    },
    onError: (err: any) => {
      setError(err.message);
    },
  });

  const changeMutation = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) {
        throw new Error("Passwords don't match");
      }
      const res = await apiRequest("POST", "/api/veil/change-password", { 
        word, 
        oldPassword: password,
        newPassword
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to change password");
      return res.json();
    },
    onSuccess: () => {
      setSuccess("Password changed. Please log in again.");
      setTimeout(() => {
        setMode("login");
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }, 2000);
    },
    onError: (err: any) => {
      setError(err.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-sm mx-auto border-2 border-transparent rounded-lg overflow-hidden p-0" 
        style={{
          backgroundImage: "linear-gradient(135deg, rgba(20,20,25,0.98), rgba(15,15,20,0.98)), linear-gradient(135deg, rgba(220,38,38,0.1), rgba(139,0,0,0.1))",
          backgroundClip: "padding-box, border-box",
          backgroundOrigin: "padding-box, border-box",
          borderImage: "linear-gradient(135deg, rgba(220,38,38,0.3), rgba(139,0,0,0.3)) 1"
        }}>
        
        <VisuallyHidden>
          <DialogTitle>
            {mode === "login" ? "Veil Login" : mode === "forgot" ? "Recover Access" : "Change Password"}
          </DialogTitle>
        </VisuallyHidden>
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
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
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <Heart className="w-6 h-6 text-red-500 animate-pulse" />
            </div>
            <h2 className="text-2xl font-display font-light lowercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">
              {mode === "login" ? "the veil's sanctuary" : mode === "forgot" ? "recover access" : "change password"}
            </h2>
            <p className="text-xs text-gray-500 uppercase tracking-widest">guardian awaits</p>
          </div>

          {mode === "login" ? (
            /* Login Form */
            <form
              onSubmit={e => {
                e.preventDefault();
                loginMutation.mutate();
              }}
              className="flex flex-col gap-4"
            >
              <div className="space-y-3">
                <Input
                  placeholder="the word only you know"
                  value={word}
                  onChange={e => setWord(e.target.value)}
                  required
                  autoFocus
                  className="rounded-lg border-red-900/30 bg-red-950/20 placeholder:text-gray-500 text-white"
                />
                <Input
                  type="password"
                  placeholder="your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="rounded-lg border-red-900/30 bg-red-950/20 placeholder:text-gray-500 text-white"
                />
              </div>

              {error && (
                <div className="text-red-400 text-xs text-center bg-red-950/40 rounded-lg p-2 lowercase">
                  {error}
                </div>
              )}

              <Button 
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:opacity-90 text-white rounded-lg"
              >
                {loginMutation.isPending ? "..." : "enter"}
              </Button>

              <div className="space-y-2 text-xs text-center">
                <button 
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setError(null);
                  }}
                  className="text-red-400 hover:text-red-300 block w-full"
                >
                  forgot the word?
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setMode("change");
                    setError(null);
                  }}
                  className="text-red-400 hover:text-red-300 block w-full"
                >
                  change password
                </button>
              </div>
            </form>
          ) : mode === "forgot" ? (
            /* Forgot Word Form */
            <form
              onSubmit={e => {
                e.preventDefault();
                forgotMutation.mutate();
              }}
              className="flex flex-col gap-4"
            >
              <p className="text-xs text-gray-400 text-center">Enter the word you chose, and we'll send you recovery instructions.</p>
              <Input
                placeholder="the word"
                value={word}
                onChange={e => setWord(e.target.value)}
                required
                autoFocus
                className="rounded-lg border-red-900/30 bg-red-950/20 placeholder:text-gray-500 text-white"
              />

              {error && (
                <div className="text-red-400 text-xs text-center bg-red-950/40 rounded-lg p-2 lowercase">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="text-green-400 text-xs text-center bg-green-950/40 rounded-lg p-2 lowercase">
                  {success}
                </div>
              )}

              <Button 
                type="submit"
                disabled={forgotMutation.isPending}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:opacity-90 text-white rounded-lg"
              >
                {forgotMutation.isPending ? "..." : "send recovery"}
              </Button>

              <button 
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setSuccess(null);
                }}
                className="text-xs text-red-400 hover:text-red-300 text-center"
              >
                back to login
              </button>
            </form>
          ) : (
            /* Change Password Form */
            <form
              onSubmit={e => {
                e.preventDefault();
                changeMutation.mutate();
              }}
              className="flex flex-col gap-4"
            >
              <div className="space-y-3">
                <Input
                  placeholder="the word"
                  value={word}
                  onChange={e => setWord(e.target.value)}
                  required
                  autoFocus
                  className="rounded-lg border-red-900/30 bg-red-950/20 placeholder:text-gray-500 text-white"
                />
                <Input
                  type="password"
                  placeholder="current password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="rounded-lg border-red-900/30 bg-red-950/20 placeholder:text-gray-500 text-white"
                />
                <Input
                  type="password"
                  placeholder="new password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  className="rounded-lg border-red-900/30 bg-red-950/20 placeholder:text-gray-500 text-white"
                />
                <Input
                  type="password"
                  placeholder="confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="rounded-lg border-red-900/30 bg-red-950/20 placeholder:text-gray-500 text-white"
                />
              </div>

              {error && (
                <div className="text-red-400 text-xs text-center bg-red-950/40 rounded-lg p-2 lowercase">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="text-green-400 text-xs text-center bg-green-950/40 rounded-lg p-2 lowercase">
                  {success}
                </div>
              )}

              <Button 
                type="submit"
                disabled={changeMutation.isPending}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:opacity-90 text-white rounded-lg"
              >
                {changeMutation.isPending ? "..." : "change password"}
              </Button>

              <button 
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setSuccess(null);
                }}
                className="text-xs text-red-400 hover:text-red-300 text-center"
              >
                back to login
              </button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
