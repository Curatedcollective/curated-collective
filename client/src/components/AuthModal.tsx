import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const mutation = useMutation({
    mutationFn: async () => {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await apiRequest("POST", endpoint, { email, password });
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
      <DialogContent className="max-w-sm mx-auto">
        <DialogTitle className="text-center mb-2">
          {mode === "login" ? "enter the sanctum" : "awaken your account"}
        </DialogTitle>
        <form
          onSubmit={e => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="flex flex-col gap-4"
        >
          <Input
            id="auth-email"
            name="email"
            type="email"
            placeholder="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
          <Input
            id="auth-password"
            name="password"
            type="password"
            placeholder="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-500 text-xs text-center">{error}</div>}
          <Button type="submit" className="w-full">
            {mode === "login" ? "enter" : "register & choose path"}
          </Button>
        </form>
        <div className="text-xs text-center mt-2">
          {mode === "login" ? (
            <>
              new here?{' '}
              <button className="underline" onClick={() => setMode("register")}>register</button>
            </>
          ) : (
            <>
              already have an account?{' '}
              <button className="underline" onClick={() => setMode("login")}>login</button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
